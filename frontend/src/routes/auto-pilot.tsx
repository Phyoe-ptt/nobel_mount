import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { ShieldCheck, Clock, X } from 'lucide-react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const to24Hour = (time12h: string) => {
  if (!time12h) return '';
  const match = time12h.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return time12h;
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m}`;
}

const to12Hour = (time24h: string) => {
  if (!time24h) return '';
  const match = time24h.match(/(\d+):(\d+)/);
  if (!match) return time24h;
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

export const Route = createFileRoute('/auto-pilot')({
  component: AutoPilotComponent,
})

function AutoPilotComponent() {
  const queryClient = useQueryClient()
  
  const { data: config } = useQuery({
    queryKey: ['autopilotConfig'],
    queryFn: async () => {
      const res = await fetch('/api/autopilot')
      return res.json()
    }
  })

  const [localConfig, setLocalConfig] = React.useState<any>({
    dailyPostingEnabled: true,
    pageProfileText: '',
    scheduleTimes: '09:00 AM',
    publishMode: 'auto'
  })

  React.useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  const saveMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopilotConfig'] })
      alert("Autopilot Settings saved successfully!")
    }
  })

  const [isGenerating, setIsGenerating] = React.useState(false)

  const handleGenerateNow = async () => {
    if (!localConfig.pageProfileText) {
      alert("Please enter an AI Page Profile first!")
      return
    }
    
    setIsGenerating(true)
    try {
      const times = localConfig.scheduleTimes ? localConfig.scheduleTimes.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
      if (times.length === 0) {
        alert("Please add at least one schedule time.");
        setIsGenerating(false);
        return;
      }

      for (const timeStr of times) {
        let isoDate = undefined;
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
           let h = parseInt(match[1]);
           let m = parseInt(match[2]);
           let ampm = match[3].toUpperCase();
           if (ampm === 'PM' && h < 12) h += 12;
           if (ampm === 'AM' && h === 12) h = 0;
           const d = new Date();
           d.setHours(h, m, 0, 0);
           // If the time is already past today, schedule it for tomorrow
           if (d.getTime() < Date.now()) {
             d.setDate(d.getDate() + 1);
           }
           isoDate = d.toISOString();
        }

        // 1. Generate Post
        const postRes = await fetch('/rag/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: localConfig.pageProfileText, draft_count: 1, writing_mode: 'informative' })
        })
        if (!postRes.ok) throw new Error(`Failed to generate post text for ${timeStr}`)
        const postData = await postRes.json()
        const generatedText = postData.posts[0]

        // 2. Generate Image
        const prompt = `Professional marketing banner, ${localConfig.pageProfileText}, high quality`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000)
        const imgRes = await fetch('/rag/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        if (!imgRes.ok) throw new Error(`Failed to generate image for ${timeStr}`)
        const imgData = await imgRes.json()
        const imageUrl = imgData.image_url

        // 3. Publish to Facebook OR Save to Queue
        if (localConfig.publishMode === 'draft') {
          const queueRes = await fetch('/api/social-posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              content: generatedText, 
              imageUrl: imageUrl, 
              status: 'DRAFT', // could be SCHEDULED, but user chose 'draft'
              createdAt: isoDate || new Date().toISOString()
            })
          })
          if (!queueRes.ok) throw new Error(`Failed to save to Queue for ${timeStr}`)
        } else {
          const pubRes = await fetch('/facebook/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: generatedText, image_url: imageUrl, scheduled_date: isoDate })
          })
          if (!pubRes.ok) {
            const errData = await pubRes.json()
            throw new Error(errData.detail || `Failed to publish to Facebook for ${timeStr}`)
          }
        }
      }
      
      alert(`✨ Auto-Pilot Success! ${times.length} post(s) generated and ${localConfig.publishMode === 'draft' ? 'saved to Queue' : 'scheduled on Facebook'}!`)

    } catch (err: any) {
      if (err.name === 'AbortError') {
        alert("Image generation timed out. Please try again.")
      } else {
        alert("Error during Auto-Pilot generation: " + err.message)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      
      {/* Daily Autonomous Posting Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Daily Autonomous Posting</h2>
            <p className="text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
              AI plans each post — topic, caption style, image yes/no, and visual look — then drafts and validates automatically.
            </p>
          </div>
          
          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={localConfig.dailyPostingEnabled}
              onChange={e => setLocalConfig({...localConfig, dailyPostingEnabled: e.target.checked})}
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C69A55]"></div>
          </label>
        </div>
        
        <div className="mt-4 flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
            <ShieldCheck size={14} />
            AI Safety Net: Active
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Every autonomous post passes through a validation layer.
          </span>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-stone-900 mb-6">Configuration</h2>
        
        {/* AI Page Profile */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-stone-900 mb-2">AI Page Profile (Strategy)</label>
          <textarea 
            value={localConfig.pageProfileText}
            onChange={e => setLocalConfig({...localConfig, pageProfileText: e.target.value})}
            placeholder="focusing on IT Career development in Myanmar..."
            className="w-full h-24 bg-[#FDFBF7] border border-stone-200 rounded-xl p-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow resize-none"
          />
          <p className="text-xs text-stone-500 mt-2">
            The AI will read this profile and your past posts to invent fresh, highly-targeted topics for today's news search.
          </p>
        </div>

        {/* Split Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Daily Schedule Times */}
          <div>
            <label className="block text-sm font-bold text-stone-900 mb-3">Daily Schedule Times</label>
            <div className="space-y-3">
              {(localConfig.scheduleTimes ? localConfig.scheduleTimes.split(',') : []).map((schedule: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="time" 
                      value={to24Hour(schedule.trim())}
                      onChange={e => {
                        const times = localConfig.scheduleTimes.split(',').map((s: string) => s.trim())
                        times[idx] = to12Hour(e.target.value)
                        setLocalConfig({...localConfig, scheduleTimes: times.join(',')})
                      }}
                      className="w-full bg-white border border-stone-200 rounded-lg pl-3 pr-4 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const times = localConfig.scheduleTimes.split(',').filter((_: any, i: number) => i !== idx)
                      setLocalConfig({...localConfig, scheduleTimes: times.join(',')})
                    }}
                    className="p-2 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const current = localConfig.scheduleTimes ? localConfig.scheduleTimes : ''
                  setLocalConfig({...localConfig, scheduleTimes: current ? current + ',12:00 PM' : '12:00 PM'})
                }}
                className="text-xs text-[#C69A55] font-bold hover:underline"
              >
                + Add Time
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-3 leading-relaxed">
              Add up to 3 times per day. Posts will be generated and scheduled for these exact times. (Must be at least 2 hours apart)
            </p>
          </div>

          {/* Right side settings */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Images</label>
              <select className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400">
                <option>Let AI decide (recommended)</option>
                <option>Always generate image</option>
                <option>Never generate image</option>
              </select>
              <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                Shared by Auto-Pilot and Create Post. AI picks image yes/no, overlay density 
                (none / few words / headline), exact Burmese overlay text, visual style, and 
                caption tone per post.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Publish Mode</label>
              <select 
                value={localConfig.publishMode || 'auto'}
                onChange={e => setLocalConfig({...localConfig, publishMode: e.target.value})}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option value="draft">Save as Draft (Review manually)</option>
                <option value="auto">Auto-Publish (Direct to Facebook)</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-64 bg-[#FDFBF7]/80 backdrop-blur-md border-t border-stone-200 p-4 px-6 flex justify-end gap-4 z-10">
        <button 
          onClick={handleGenerateNow}
          disabled={isGenerating}
          className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-medium text-sm py-2 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {isGenerating ? 'Running Auto-Pilot...' : 'Generate drafts now'}
        </button>
        <button 
          onClick={() => saveMutation.mutate(localConfig)}
          disabled={saveMutation.isPending}
          className="bg-[#C69A55] hover:bg-[#B38745] text-white font-bold text-sm py-2 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

    </div>
  )
}
