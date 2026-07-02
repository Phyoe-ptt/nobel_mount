import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Sparkles, Link as LinkIcon, Image as ImageIcon, Send, CheckCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

export const Route = createFileRoute('/create-post')({
  component: CreatePostComponent,
})

function CreatePostComponent() {
  const [activeTab, setActiveTab] = React.useState('news')
  const [keywords, setKeywords] = React.useState('')
  const [draftCount, setDraftCount] = React.useState(3)
  
  const [generatedPosts, setGeneratedPosts] = React.useState<string[]>([])
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null)
  const [selectedPostIndex, setSelectedPostIndex] = React.useState<number>(0)
  const [published, setPublished] = React.useState(false)

  const generatePostMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/rag/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, draft_count: draftCount, writing_mode: 'informative' })
      })
      if (!res.ok) throw new Error('Failed to generate posts')
      return res.json()
    },
    onSuccess: (data) => {
      setGeneratedPosts(data.posts || [])
      setSelectedPostIndex(0)
      setPublished(false)
    },
    onError: (err) => alert(err.message)
  })

  const generateImageMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Professional photography for an education college in Myanmar, showing ${keywords}, cinematic lighting, high quality, 8k resolution`
      const res = await fetch('/rag/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      if (!res.ok) throw new Error('Failed to generate image')
      return res.json()
    },
    onSuccess: (data) => {
      setGeneratedImage(data.image_url)
    },
    onError: (err) => alert(err.message)
  })

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!generatedPosts[selectedPostIndex] || !generatedImage) throw new Error('Need both post and image to publish')
      const res = await fetch('/facebook/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: generatedPosts[selectedPostIndex], image_url: generatedImage })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Failed to publish')
      }
      return res.json()
    },
    onSuccess: () => {
      setPublished(true)
      alert('Successfully published to Facebook Page!')
    },
    onError: (err) => alert(err.message)
  })

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
                      value={keywords}
                      onChange={e => setKeywords(e.target.value)}
                      placeholder="e.g. IT Career Myanmar, CCNA class, Cyber Security Diploma, Japan Language Level 3..."
                      className="w-full h-32 bg-[#FDFBF7] border border-stone-200 rounded-lg p-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow resize-none"
                    />
                  </div>
                  <div>
                    <select 
                      value={draftCount} 
                      onChange={e => setDraftCount(Number(e.target.value))}
                      className="w-1/2 bg-[#FDFBF7] border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-shadow"
                    >
                      <option value={1}>1 draft</option>
                      <option value={2}>2 drafts</option>
                      <option value={3}>3 drafts</option>
                      <option value={4}>4 drafts</option>
                      <option value={5}>5 drafts</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    generatePostMutation.mutate()
                    generateImageMutation.mutate()
                  }}
                  disabled={!keywords.trim() || generatePostMutation.isPending}
                  className="w-full mt-4 bg-[#C69A55] hover:bg-[#B38745] text-white font-bold text-sm py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  {generatePostMutation.isPending ? 'Generating AI Magic...' : 'Generate drafts from news'}
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
      <div className={`bg-white border border-stone-200 rounded-2xl h-full min-h-[500px] flex flex-col p-6 shadow-sm ${generatedPosts.length === 0 ? 'items-center justify-center text-center border-dashed' : ''}`}>
        
        {generatedPosts.length === 0 ? (
          <>
            <Sparkles className="text-stone-300 w-12 h-12 mb-4" />
            <h2 className="text-lg font-bold text-stone-800 mb-2">The AI Studio</h2>
            <p className="text-sm text-stone-500 max-w-sm">
              Configure your generation settings on the left, and your customized content will appear here.
            </p>
          </>
        ) : (
          <div className="flex flex-col h-full space-y-6">
            <h2 className="font-bold text-xl text-stone-800 flex items-center gap-2">
              <Sparkles className="text-[#C69A55]" /> AI Generated Post
            </h2>
            
            <div className="flex gap-2">
              {generatedPosts.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedPostIndex(idx)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${selectedPostIndex === idx ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  Draft {idx + 1}
                </button>
              ))}
            </div>

            <div className="flex-1 bg-stone-50 rounded-xl p-4 border border-stone-200 overflow-y-auto custom-scrollbar">
              <p className="whitespace-pre-wrap text-sm text-stone-800 leading-relaxed font-sans">
                {generatedPosts[selectedPostIndex]}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2">
                <ImageIcon size={16} /> Generated Visual
              </h3>
              {generateImageMutation.isPending ? (
                <div className="w-full h-48 bg-stone-100 animate-pulse rounded-xl flex items-center justify-center text-stone-400 text-sm font-medium">
                  Generating AI Image...
                </div>
              ) : generatedImage ? (
                <div className="relative rounded-xl overflow-hidden border border-stone-200 h-64">
                  <img src={generatedImage} alt="Generated Visual" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => generateImageMutation.mutate()}
                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-stone-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors"
                  >
                    Regenerate Image
                  </button>
                </div>
              ) : null}
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button 
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending || published || !generatedImage}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {publishMutation.isPending ? 'Publishing...' : published ? <><CheckCircle size={18}/> Published</> : <><Send size={18}/> Publish to Facebook</>}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
