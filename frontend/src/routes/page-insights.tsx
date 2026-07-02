import { createFileRoute } from '@tanstack/react-router'
import { LineChart, BarChart3 } from 'lucide-react'

export const Route = createFileRoute('/page-insights')({
  component: PageInsightsComponent,
})

function PageInsightsComponent() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <LineChart className="text-indigo-600" />
            Page Insights
          </h1>
          <p className="text-gray-500 text-sm mt-1">Analytics and performance metrics for your connected Facebook page.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-64 flex flex-col items-center justify-center text-gray-400">
          <BarChart3 size={40} className="mb-4 opacity-30" />
          <p>Audience Growth Chart (Coming Soon)</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-64 flex flex-col items-center justify-center text-gray-400">
          <LineChart size={40} className="mb-4 opacity-30" />
          <p>Engagement Metrics (Coming Soon)</p>
        </div>
      </div>
    </div>
  )
}
