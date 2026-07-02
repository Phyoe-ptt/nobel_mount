import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Megaphone, RefreshCw, Check, X } from 'lucide-react'

import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/ads')({
  component: AdsComponent,
})

function AdsComponent() {
  const [activeTab, setActiveTab] = React.useState('browse')

  const { data: posts = [] } = useQuery({
    queryKey: ['socialPosts'],
    queryFn: async () => {
      const res = await fetch('/api/social-posts')
      return res.json()
    }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <Megaphone size={20} className="text-stone-700" />
          Ads
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Browse page posts to boost manually, or let autopilot propose boosts — you approve before spend.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-[#EFECE5] p-1 rounded-full flex gap-1 items-center">
        <button 
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-colors ${activeTab === 'browse' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Browse
        </button>
        <button 
          onClick={() => setActiveTab('autopilot')}
          className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-colors ${activeTab === 'autopilot' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Autopilot
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-colors flex items-center justify-center gap-2 ${activeTab === 'pending' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Pending <span className="bg-[#E2EAD3] text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full">4</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-colors ${activeTab === 'history' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          History
        </button>
      </div>

      {/* Tab Contents */}
      
      {/* 1. Browse Tab */}
      {activeTab === 'browse' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="text-stone-400">✨</span> Browse recommendations
              </h2>
              <p className="text-sm text-stone-500 mt-1">All eligible page posts from Zernio — pick any post to boost manually.</p>
            </div>
            <button className="px-4 py-1.5 border border-stone-200 rounded-lg text-sm font-bold text-stone-700 hover:bg-stone-50">
              Refresh
            </button>
          </div>
          
          <p className="text-sm text-stone-700 mb-4">
            AI reads comments when possible and writes short informal Burmese notes — low-quality posts are flagged but still listed.
          </p>
          <div className="text-[11px] text-stone-400 mb-6 space-y-1">
            <p>{posts.length} eligible posts found from database</p>
          </div>

          {/* Browse Post Cards */}
          {posts.length === 0 ? (
            <div className="text-center py-8 text-stone-500">No posts available. Generate some from the Queue page!</div>
          ) : posts.map((post: any, idx: number) => (
            <div key={post.id || idx} className="border border-stone-200 rounded-xl p-5 mb-4">
              <p className="text-sm font-bold text-stone-900 mb-3 leading-relaxed">
                {post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-stone-600 border border-stone-200 px-2 py-1 rounded-md bg-stone-50">
                  {post.status || 'DRAFT'}
                </span>
                <span className="text-xs text-stone-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              {post.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden border border-stone-100 bg-stone-50">
                  <img src={post.imageUrl} alt="Post media" className="w-full h-auto max-h-48 object-cover" />
                </div>
              )}

              <div className="flex items-center gap-4 text-xs font-medium border-t border-stone-100 pt-4">
                <span className="text-emerald-800 bg-emerald-100 px-2 py-1 rounded">Audience: MM Education</span>
                <span className="text-stone-500">Target reach ≥ 2,500</span>
                {post.status === 'PUBLISHED' && (
                  <a href="#" className="text-[#C69A55] hover:underline ml-auto">View on Facebook</a>
                )}
                <button className="bg-[#C69A55] hover:bg-[#B38745] text-white font-bold px-4 py-1.5 rounded-lg transition-colors ml-auto">
                  Create boost
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Autopilot Tab */}
      {activeTab === 'autopilot' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Autopilot</h2>
                <p className="text-sm text-stone-500 mt-1 max-w-xl">
                  Background job scans page history and adds boost proposals to Pending (respects weekly cap).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C69A55]"></div>
              </label>
            </div>
            <div className="flex items-center gap-3 mt-4 text-[11px] font-medium text-stone-500">
              <span className="text-emerald-700 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <Check size={12} />
                Spend caps active
              </span>
              <span>Ad account: act_4524203191196974</span>
              <span>Last run: 6/27/2026, 4:29:02 PM</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-6">Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-stone-900 mb-2">Wait hours after publish</label>
                <input type="number" defaultValue={1} className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-900 mb-2">Min engagement score</label>
                <input type="number" defaultValue={1} className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-stone-900 mb-2">Default budget (cents)</label>
                <input type="number" defaultValue={5000} className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
                <p className="text-[10px] text-stone-400 mt-1">$50.00 per boost</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-900 mb-2">Duration (days)</label>
                <input type="number" defaultValue={30} className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-900 mb-2">Daily spend cap (cents)</label>
                <input type="number" defaultValue={100} className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-900 mb-2">Max autopilot boosts per week</label>
                <input type="number" defaultValue={3} className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
                <p className="text-[10px] text-stone-400 mt-1 leading-tight">Limits automatic proposals only — Browse shows all eligible posts.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-900 mb-2">Min reach target</label>
                <input type="number" defaultValue={1000} className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
                <p className="text-[10px] text-stone-400 mt-1 leading-tight">Pause if reach stays below this (or budget-based floor) after the check window.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-900 mb-2">Reach check window (hours)</label>
                <input type="number" defaultValue={24} className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-900 mb-2">Browse cache refresh (hours)</label>
                <input type="number" defaultValue={6} className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
                <p className="text-[10px] text-stone-400 mt-1 leading-tight">How long to reuse AI browse results before re-fetching Zernio + Gemini in the background.</p>
              </div>
              <div className="hidden md:block"></div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-stone-900 mb-2">Geo countries (comma-separated ISO codes)</label>
                <input type="text" defaultValue="MM, TH" className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-stone-900 mb-2">Meta ad account ID (optional override)</label>
                <input type="text" placeholder="act_123456789 or leave blank to use env" className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" />
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C69A55] relative"></div>
                <span className="text-sm font-bold text-stone-700">AI strategist (Gemini reasons and targeting)</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C69A55] relative"></div>
                <span className="text-sm font-bold text-stone-700">Auto-approve boosts (off by default)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C69A55] relative"></div>
                <span className="text-sm font-bold text-stone-700">Auto-pause boosts that miss reach target within the check window</span>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <button className="bg-[#C69A55] hover:bg-[#B38745] text-white font-bold px-6 py-2 rounded-lg transition-colors shadow-sm">
                Save settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Pending Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-stone-900 mb-1">Pending approval (4)</h2>
          <p className="text-sm text-stone-500 mb-6">Boosts from Browse, Queue, or Autopilot — approve before spend goes live.</p>

          <div className="space-y-4">
            {/* Pending Item */}
            <div className="border border-stone-200 rounded-xl p-5">
              <p className="text-sm font-bold text-stone-900 mb-3">CCNA နဲ့ Network Engineering ကို အခြေခံကနေစပြီး Professional အဆင့်ထိ သင်ယူချင်ပါသလား?</p>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-stone-600 border border-stone-200 px-2 py-1 rounded-md bg-stone-50">AUTOPILOT</span>
                <span className="text-xs font-bold text-stone-700">Score: 287</span>
                <span className="text-xs text-stone-500">$50.00 · 30d</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md">High potential</span>
              </div>
              <p className="text-sm text-stone-600 mb-4 leading-relaxed bg-[#FDFBF7] p-3 rounded-lg border border-stone-100">
                ဒီပိုစ့်က engagement score 287 နဲ့ likes 254 အထိ ရထားတာဆိုတော့ content က လူကြိုက်များနေတယ်။ CCNA စိတ်ဝင်စားသူတွေကို targeting လုပ်ပြီး boost ထိုးသင့်တယ်။
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">MM</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">Ages 18-35</span>
                <span className="text-[10px] font-medium text-stone-600 border border-stone-200 px-2 py-1 rounded">CCNA</span>
                <span className="text-[10px] font-medium text-stone-600 border border-stone-200 px-2 py-1 rounded">Networking</span>
              </div>

              <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                <button className="bg-[#C69A55] hover:bg-[#B38745] text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors">
                  <Check size={16} /> Approve
                </button>
                <button className="bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors">
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
            
            {/* Pending Item 2 (Mock) */}
            <div className="border border-stone-200 rounded-xl p-5">
              <p className="text-sm font-bold text-stone-900 mb-3">Japan language level 3 ကို ကျွမ်းကျင်စွာ တတ်မြောက်ချင်သူများအတွက်...</p>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-stone-600 border border-stone-200 px-2 py-1 rounded-md bg-stone-50">AUTOPILOT</span>
                <span className="text-xs font-bold text-stone-700">Score: 324</span>
                <span className="text-xs text-stone-500">$50.00 · 30d</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md">High potential</span>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button className="bg-[#C69A55] hover:bg-[#B38745] text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors">
                  <Check size={16} /> Approve
                </button>
                <button className="bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors">
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <RefreshCw size={18} className="text-stone-400" /> Boost history (5)
              </h2>
              <p className="text-sm text-stone-500 mt-1">Running, completed, paused, and failed boosts with reach and spend metrics.</p>
            </div>
            <button className="px-4 py-1.5 border border-stone-200 rounded-lg text-sm font-bold text-stone-700 hover:bg-stone-50">
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {/* History Item - Failed */}
            <div className="border border-stone-200 rounded-xl p-5 relative">
              <div className="absolute top-5 right-5 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase">
                Failed
              </div>
              
              <p className="text-sm font-bold text-stone-900 mb-3 pr-16">Cyber Security Diploma အတန်းသစ် ဖွင့်လှစ်ပါပြီ။</p>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-stone-600 border border-stone-200 px-2 py-1 rounded-md bg-stone-50">PAGE_HISTORY</span>
                <span className="text-xs text-stone-500">$50.00 · 30d</span>
              </div>
              
              <p className="text-[11px] font-medium text-orange-600 mb-3">Daily spend cap reached</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">MM</span>
                <span className="text-[10px] font-medium text-stone-600 border border-stone-200 px-2 py-1 rounded">Cyber Security</span>
              </div>
              
              <a href="#" className="text-[#C69A55] hover:underline text-xs">View on Facebook</a>
            </div>
            
            {/* History Item 2 */}
            <div className="border border-stone-200 rounded-xl p-5 relative">
              <div className="absolute top-5 right-5 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase">
                Failed
              </div>
              <p className="text-sm font-bold text-stone-900 mb-3 pr-16">Cloud Technology သင်တန်းကို အခြေခံကနေစပြီး တက်ရောက်ချင်ပါသလား?</p>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-stone-600 border border-stone-200 px-2 py-1 rounded-md bg-stone-50">AUTOPILOT</span>
                <span className="text-xs text-stone-500">$50.00 · 30d</span>
              </div>
              <p className="text-[11px] font-medium text-orange-600 mb-3">Daily spend cap reached</p>
              <a href="#" className="text-[#C69A55] hover:underline text-xs">View on Facebook</a>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
