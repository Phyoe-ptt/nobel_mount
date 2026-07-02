import { createFileRoute } from '@tanstack/react-router'
import { Calendar as CalendarIcon, Clock, MoreVertical, Plus } from 'lucide-react'

export const Route = createFileRoute('/content-planner')({
  component: ContentPlannerComponent,
})

function ContentPlannerComponent() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dates = Array.from({ length: 35 }, (_, i) => i + 1) // Dummy calendar grid

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Content Planner</h1>
          <p className="text-gray-500 text-sm mt-1">Schedule and manage your upcoming social media posts.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm flex items-center gap-2 transition-colors">
          <Plus size={16} />
          New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon size={20} className="text-blue-600" />
            July 2026
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">&lt;</button>
            <button className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">&gt;</button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {days.map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 bg-white">
          {dates.map((date, idx) => {
            const hasPost = date === 15 || date === 18 || date === 22 // Random mock data
            return (
              <div key={idx} className="min-h-[100px] p-2 border-r border-b border-gray-100 last:border-r-0 hover:bg-gray-50 transition-colors group relative">
                <span className={`text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center ${date === 15 ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                  {(date % 31) + 1}
                </span>
                
                {hasPost && (
                  <div className="mt-2 p-1.5 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-700 font-medium truncate cursor-pointer hover:bg-blue-100">
                    <span className="flex items-center gap-1"><Clock size={10}/> 10:00 AM</span>
                    Promo Post
                  </div>
                )}
                
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/5 transition-opacity pointer-events-none">
                  <Plus className="text-gray-400" size={24} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
