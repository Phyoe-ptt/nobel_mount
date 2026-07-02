import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Sparkles, Link as LinkIcon } from 'lucide-react'

export const Route = createFileRoute('/create-post')({
  component: CreatePostComponent,
})

function CreatePostComponent() {
  const [activeTab, setActiveTab] = React.useState('news')

  return (
    <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 items-start">
      
      {/* Left Column: Settings */}
      <div className="space-y-4">
        
        {/* Info Cards */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm flex items-start gap-3">
          <LinkIcon className="text-stone-500 shrink-0 mt-0.5" size={16} />
          <p className="text-sm font-medium text-stone-700 leading-snug">
            Posts will publish to <span className="font-bold text-stone-900">NobleMount</span> (now or on schedule).
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm flex items-start gap-3">
          <Sparkles className="text-stone-500 shrink-0 mt-0.5" size={16} />
          <p className="text-sm font-medium text-stone-700 leading-snug">
            Rewrites use your indexed Facebook posts for tone and flow. 
            <a href="/page-insights" className="text-stone-900 underline underline-offset-2 ml-1 decoration-stone-300 hover:decoration-stone-600 transition-colors">
              Index your page in Page Insights
            </a> first if you have not already.
          </p>
        </div>

        {/* Generation Settings */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-100">
            <h3 className="font-bold text-stone-900 mb-4">Generation settings</h3>
            
            <div className="space-y-1">
              <label className="block text-sm font-bold text-stone-800">Images</label>
              <select className="w-full bg-[#FDFBF7] border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow">
                <option>Let AI decide (recommended)</option>
                <option>Always generate image</option>
                <option>Never generate image</option>
              </select>
            </div>
            
            <p className="text-xs text-stone-500 mt-4 leading-relaxed">
              Shared by Auto-Pilot and Create Post. AI picks image yes/no, overlay density 
              (none / few words / headline), exact Burmese overlay text, visual style, and 
              caption tone per post.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-200 bg-[#FDFBF7]">
            <button 
              onClick={() => setActiveTab('news')}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'news' ? 'text-amber-600 border-b-2 border-amber-500 bg-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              News Autopilot
            </button>
            <button 
              onClick={() => setActiveTab('rewrite')}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'rewrite' ? 'text-amber-600 border-b-2 border-amber-500 bg-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Context Rewrite
            </button>
            <button 
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'link' ? 'text-amber-600 border-b-2 border-amber-500 bg-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Link to Content
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 bg-white">
            {activeTab === 'news' && (
              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-3">1. Topic keywords</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-stone-600">Keywords for latest news search</label>
                    <textarea 
                      placeholder="e.g. IT Career Myanmar, CCNA class, Cyber Security Diploma, Japan Language Level 3..."
                      className="w-full h-32 bg-[#FDFBF7] border border-stone-200 rounded-lg p-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow resize-none"
                    />
                  </div>
                  <div>
                    <select className="w-1/2 bg-[#FDFBF7] border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-shadow">
                      <option>1 draft</option>
                      <option>2 drafts</option>
                      <option selected>3 drafts</option>
                      <option>4 drafts</option>
                      <option>5 drafts</option>
                    </select>
                  </div>
                </div>
                <button className="w-1/2 mt-4 bg-[#C69A55] hover:bg-[#B38745] text-white font-bold text-sm py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Sparkles size={16} />
                  Generate drafts from news
                </button>
              </div>
            )}
            
            {activeTab === 'rewrite' && (
              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-3">1. Source Text</h4>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-stone-600">Paste the text you want the AI to rewrite</label>
                  <textarea 
                    placeholder="Paste original content here..."
                    className="w-full h-32 bg-[#FDFBF7] border border-stone-200 rounded-lg p-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow resize-none"
                  />
                </div>
                <button className="w-full mt-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm py-2.5 rounded-lg transition-colors shadow-sm">
                  Rewrite Content
                </button>
              </div>
            )}
            
            {activeTab === 'link' && (
              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-3">1. Source URL</h4>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-stone-600">Enter a link to summarize</label>
                  <input 
                    type="url"
                    placeholder="https://example.com/article"
                    className="w-full bg-[#FDFBF7] border border-stone-200 rounded-lg p-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow"
                  />
                </div>
                <button className="w-full mt-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm py-2.5 rounded-lg transition-colors shadow-sm">
                  Summarize Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: AI Studio Preview */}
      <div className="bg-transparent border-2 border-dashed border-stone-300 rounded-2xl h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="text-stone-300 w-12 h-12 mb-4" />
        <h2 className="text-lg font-bold text-stone-800 mb-2">The AI Studio</h2>
        <p className="text-sm text-stone-500 max-w-sm">
          Configure your generation settings on the left, and your customized content will appear here.
        </p>
      </div>

    </div>
  )
}
