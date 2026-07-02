import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Film, Mic, UploadCloud, Edit3, Image as ImageIcon, ChevronDown } from 'lucide-react'

export const Route = createFileRoute('/video-studio')({
  component: VideoStudioComponent,
})

function VideoStudioComponent() {
  const [activeTab, setActiveTab] = React.useState('upload')
  const [visualDirection, setVisualDirection] = React.useState('')

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
                  <textarea 
                    placeholder="Type or paste your script here..."
                    className="w-full h-32 bg-[#FDFBF7] border border-stone-200 rounded-xl p-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow resize-none"
                  />
                  <select className="w-full bg-[#FDFBF7] border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none">
                    <option>Select AI Voice...</option>
                    <option>Professional Female (English)</option>
                    <option>Energetic Male (English)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Visual Direction Section */}
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Visual direction</label>
              <textarea 
                value={visualDirection}
                onChange={(e) => setVisualDirection(e.target.value)}
                placeholder="e.g. Brazil flag, green and yellow tones, Rio cityscape..."
                className="w-full h-24 bg-[#FDFBF7] border border-stone-200 rounded-xl p-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow resize-none"
              />
              <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                Optional. Clips are chosen to match what is being said. To change direction after planning, discard the job and start a new one.
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
              disabled
              className="w-full bg-[#EFECE5] text-stone-400 font-bold text-sm py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Film size={18} />
              Generate short video
            </button>
          </div>
        </div>

        {/* Right Column: Preview Area */}
        <div className="bg-transparent border-2 border-dashed border-stone-300 rounded-2xl h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-8 text-center relative">
          {/* Scrollbar visualization from screenshot (the gray bar on the left of right column) */}
          <div className="absolute left-[-13px] top-1/4 bottom-1/4 w-[6px] bg-stone-300 rounded-full hidden lg:block"></div>

          <div className="w-12 h-12 bg-white shadow-sm border border-stone-100 rounded-2xl flex items-center justify-center mb-4">
            <Film className="text-stone-400" size={24} />
          </div>
          <h2 className="text-base font-bold text-stone-800 mb-1">No active pipeline</h2>
          <p className="text-sm text-stone-500 max-w-sm">
            Configure narration on the left and generate. Progress and preview will appear here.
          </p>
        </div>

      </div>
    </div>
  )
}
