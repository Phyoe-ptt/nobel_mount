import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Film, Mic, UploadCloud, Edit3, Image as ImageIcon, ChevronDown, CheckCircle, Loader2, Sparkles, UserCircle } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/video-studio')({
  component: VideoStudioComponent,
})

function VideoStudioComponent() {
  const [activeTab, setActiveTab] = React.useState('script')
  const [visualDirection, setVisualDirection] = React.useState('')
  const [scriptText, setScriptText] = React.useState('')
  const [voiceId, setVoiceId] = React.useState('en-US-JennyNeural')
  const [avatarMode, setAvatarMode] = React.useState('standard') // standard or ai
  
  const [talkId, setTalkId] = React.useState<string | null>(null)
  
  // Script generation
  const generateScriptMutation = useMutation({
    mutationFn: async () => {
      if (!visualDirection) throw new Error('Please enter a visual direction (topic) first so AI knows what to write about.')
      const res = await fetch('/rag/generate-video-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: visualDirection })
      })
      if (!res.ok) throw new Error('Failed to generate script')
      return res.json()
    },
    onSuccess: (data) => setScriptText(data.script),
    onError: (err) => alert(err.message)
  })

  const createTalkMutation = useMutation({
    mutationFn: async () => {
      let avatarUrl = "https://d-id-public-bucket.s3.amazonaws.com/alice.jpg"
      
      // If AI Avatar is selected, generate the image first
      if (avatarMode === 'ai') {
        const prompt = visualDirection || "Professional college teacher"
        const imgRes = await fetch('/rag/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, save_as_file: true })
        })
        if (!imgRes.ok) throw new Error('Failed to generate AI avatar')
        const imgData = await imgRes.json()
        // We use port 8000 here because D-ID needs a public URL, we pass the direct backend URL 
        avatarUrl = `http://168.144.47.213:8000${imgData.image_url}`
      }

      const res = await fetch('/did/create-talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptText, voice_id: voiceId, avatar_url: avatarUrl })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Failed to create video')
      }
      return res.json()
    },
    onSuccess: (data) => {
      setTalkId(data.id)
    },
    onError: (err) => alert(err.message)
  })

  // Poll for status
  const { data: talkStatus } = useQuery({
    queryKey: ['didStatus', talkId],
    queryFn: async () => {
      if (!talkId) return null
      const res = await fetch(`/did/talk/${talkId}`)
      return res.json()
    },
    enabled: !!talkId,
    refetchInterval: (query) => {
      // Stop polling if done or error
      if (query.state.data?.status === 'done' || query.state.data?.status === 'error') {
        return false
      }
      return 3000
    }
  })

  const isGenerating = generateScriptMutation.isPending || createTalkMutation.isPending || (talkId && talkStatus?.status !== 'done' && talkStatus?.status !== 'error')
  const videoUrl = talkStatus?.status === 'done' ? talkStatus.result_url : null

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      
      {/* Top Page Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-[#F2EFE9] rounded-xl flex items-center justify-center text-[#C69A55] shrink-0">
          <Film size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Video Studio</h1>
          <p className="text-stone-500 text-sm mt-0.5 font-medium">
            Narration &rarr; subtitles &rarr; stock & AI visuals &rarr; 9:16 short
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 items-start pb-20">
        
        {/* Left Column: Configuration */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            {/* Narration Section */}
            <div>
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-1">
                <Mic size={18} className="text-stone-700" />
                Narration
              </h3>
              <p className="text-xs text-stone-500 mb-4">Upload audio or synthesize from a script</p>
              
              {/* Toggle Buttons */}
              <div className="flex bg-[#FDFBF7] p-1 rounded-lg border border-stone-200 mb-4">
                <button 
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${
                    activeTab === 'upload' ? 'bg-white text-stone-900 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <UploadCloud size={16} />
                  Upload
                </button>
                <button 
                  onClick={() => setActiveTab('script')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${
                    activeTab === 'script' ? 'bg-white text-stone-900 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Edit3 size={16} />
                  Script + voice
                </button>
              </div>

              {/* Upload Dropzone */}
              {activeTab === 'upload' && (
                <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#FDFBF7] transition-colors">
                  <div className="w-10 h-10 bg-white shadow-sm border border-stone-100 rounded-lg flex items-center justify-center mb-3">
                    <UploadCloud className="text-stone-600" size={20} />
                  </div>
                  <p className="text-sm font-bold text-stone-900 mb-1">Click to choose audio</p>
                  <p className="text-[10px] text-stone-400 font-medium tracking-wide">MP3, WAV, M4A, AAC, OGG, FLAC</p>
                </div>
              )}

              {/* Script Textarea (Alternative Tab) */}
              {activeTab === 'script' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-stone-700">Script Content</label>
                    <button 
                      onClick={() => generateScriptMutation.mutate()}
                      disabled={generateScriptMutation.isPending}
                      className="text-xs font-bold text-[#C69A55] hover:text-[#B38745] flex items-center gap-1 transition-colors"
                    >
                      <Sparkles size={12} /> {generateScriptMutation.isPending ? 'Writing...' : 'Write with AI 🪄'}
                    </button>
                  </div>
                  <textarea 
                    value={scriptText}
                    onChange={e => setScriptText(e.target.value)}
                    placeholder="Type your script or click 'Write with AI'..."
                    className="w-full h-28 bg-[#FDFBF7] border border-stone-200 rounded-xl p-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow resize-none"
                  />
                  <select 
                    value={voiceId}
                    onChange={e => setVoiceId(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none"
                  >
                    <option value="en-US-JennyNeural">Professional Female (English)</option>
                    <option value="en-US-GuyNeural">Energetic Male (English)</option>
                    <option value="ja-JP-NanamiNeural">Japanese Female</option>
                  </select>
                </div>
              )}
            </div>

            {/* Avatar Selection Section */}
            <div>
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <UserCircle size={18} className="text-stone-700" />
                Video Presenter
              </h3>
              <div className="flex bg-[#FDFBF7] p-1 rounded-lg border border-stone-200 mb-4">
                <button 
                  onClick={() => setAvatarMode('standard')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${
                    avatarMode === 'standard' ? 'bg-white text-stone-900 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Standard Avatar
                </button>
                <button 
                  onClick={() => setAvatarMode('ai')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${
                    avatarMode === 'ai' ? 'bg-white text-stone-900 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Sparkles size={14} className="text-[#C69A55]" /> Generate with AI
                </button>
              </div>
              {avatarMode === 'ai' && (
                <p className="text-[11px] text-[#C69A55] font-medium leading-relaxed bg-[#FDFBF7] p-2 rounded-lg border border-stone-100">
                  Gemini Imagen 4 will dynamically create a photorealistic, professional avatar based on your visual direction before generating the video!
                </p>
              )}
            </div>

            {/* Visual Direction Section */}
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2 flex justify-between items-center">
                Visual direction & Topic
              </label>
              <textarea 
                value={visualDirection}
                onChange={(e) => setVisualDirection(e.target.value)}
                placeholder="e.g. IT Career Myanmar, Japan language N5, Cisco CCNA..."
                className="w-full h-24 bg-[#FDFBF7] border border-stone-200 rounded-xl p-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow resize-none"
              />
              <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                This tells Gemini what topic to write the script about, and what kind of avatar to generate (if AI Avatar is selected).
              </p>
              <p className="text-[10px] font-bold text-stone-400 mt-1 text-right">
                {visualDirection.length}/500
              </p>
            </div>

            {/* Accordion: Branding & caption */}
            <div className="border border-stone-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#FDFBF7] transition-colors">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-stone-600" />
                <span className="text-sm font-bold text-stone-700">Branding & caption</span>
              </div>
              <ChevronDown size={16} className="text-stone-400" />
            </div>

          </div>

          {/* Sticky Bottom Button */}
          <div className="p-4 border-t border-stone-200 bg-white">
            <button 
              onClick={() => createTalkMutation.mutate()}
              disabled={isGenerating || (activeTab === 'script' && !scriptText)}
              className={`w-full font-bold text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isGenerating || (activeTab === 'script' && !scriptText)
                  ? 'bg-[#EFECE5] text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Film size={18} />}
              {isGenerating ? 'Generating Video...' : 'Generate short video'}
            </button>
          </div>
        </div>

        {/* Right Column: Preview Area */}
        <div className={`bg-transparent border-2 border-dashed ${videoUrl ? 'border-transparent' : 'border-stone-300'} rounded-2xl h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden`}>
          {/* Scrollbar visualization from screenshot (the gray bar on the left of right column) */}
          {!videoUrl && <div className="absolute left-[-13px] top-1/4 bottom-1/4 w-[6px] bg-stone-300 rounded-full hidden lg:block"></div>}

          {videoUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <video 
                src={videoUrl} 
                controls 
                autoPlay
                className="max-h-full rounded-xl shadow-lg border border-stone-200"
              />
              <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                <CheckCircle size={18} /> Video Ready
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center">
              <Loader2 className="text-[#C69A55] animate-spin mb-4" size={32} />
              <h2 className="text-base font-bold text-stone-800 mb-1">Pipeline Active</h2>
              <p className="text-sm text-stone-500 max-w-sm">
                Generating your AI video. This may take up to 30 seconds...
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-white shadow-sm border border-stone-100 rounded-2xl flex items-center justify-center mb-4">
                <Film className="text-stone-400" size={24} />
              </div>
              <h2 className="text-base font-bold text-stone-800 mb-1">No active pipeline</h2>
              <p className="text-sm text-stone-500 max-w-sm">
                Configure narration on the left and generate. Progress and preview will appear here.
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
