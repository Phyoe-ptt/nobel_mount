import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { Settings, Save, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/settings')({
  component: SettingsComponent,
})

function SettingsComponent() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = React.useState({
    autoSend: true,
    delayHours: 1,
    maxFollowUps: 2,
    accuracyThreshold: 85,
    fbToken: ''
  })

  const { data: config, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings/follow-up')
      if (!res.ok) throw new Error('Failed to fetch')
      const followUpData = await res.json()
      
      const tokenRes = await fetch('/api/settings/facebook-token')
      let fbToken = ''
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json()
        fbToken = tokenData.token || ''
      }
      
      return { ...followUpData, fbToken }
    }
  })

  React.useEffect(() => {
    if (config) {
      setFormData(config)
    }
  }, [config])

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/settings/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to save follow-up settings')
      
      const tokenRes = await fetch('/api/settings/facebook-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.fbToken })
      })
      if (!tokenRes.ok) throw new Error('Failed to save Facebook token')
      
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  if (isLoading) return <div className="p-8">Loading settings...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="text-blue-600" />
            Platform Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure AI Autopilot and Sales Follow-up rules.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">AI Autopilot Configuration</h2>
          <p className="text-sm text-gray-500 mt-1">Control how the AI interacts with your customers on Facebook.</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Auto Send Toggle */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">Enable AI Auto-Replies</h3>
              <p className="text-sm text-gray-500 mt-1">Let AI automatically reply to incoming messages based on your knowledge base.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.autoSend}
                onChange={e => setFormData({...formData, autoSend: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Accuracy Threshold */}
          <div className="pb-6 border-b border-gray-100">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold text-gray-900">AI Confidence Threshold (%)</h3>
              <span className="font-bold text-blue-600">{formData.accuracyThreshold}%</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">If the AI's confidence in its answer is below this threshold, it will require a Human Handoff instead of sending automatically.</p>
            <input 
              type="range" 
              min="50" max="100" 
              value={formData.accuracyThreshold}
              onChange={e => setFormData({...formData, accuracyThreshold: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
              <span>Risky (50%)</span>
              <span>Balanced (80%)</span>
              <span>Strict (100%)</span>
            </div>
          </div>

          {/* Follow Up Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Follow-up Delay (Hours)</label>
              <input 
                type="number" 
                value={formData.delayHours}
                onChange={e => setFormData({...formData, delayHours: parseInt(e.target.value)})}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Max Follow-ups per Customer</label>
              <input 
                type="number" 
                value={formData.maxFollowUps}
                onChange={e => setFormData({...formData, maxFollowUps: parseInt(e.target.value)})}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Facebook Integration Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Facebook Integration</h2>
          <p className="text-sm text-gray-500 mt-1">Connect your Facebook Page to allow AI sync and posting.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Facebook Page Access Token (Long-Lived)</label>
            <p className="text-xs text-gray-500 mb-3">If auto-sync stops working, your token might have expired. Generate a new long-lived token from Facebook Developer Dashboard and paste it here.</p>
            <input 
              type="password" 
              placeholder="EAA..."
              value={formData.fbToken}
              onChange={e => setFormData({...formData, fbToken: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
            Cancel
          </button>
          <button 
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending}
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Save size={18} />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
