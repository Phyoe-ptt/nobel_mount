import { createFileRoute } from '@tanstack/react-router'
import { ListOrdered, Clock } from 'lucide-react'

export const Route = createFileRoute('/queue')({
  component: QueueComponent,
})

function QueueComponent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ListOrdered className="text-gray-700" />
            Job Queue
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor the status of background tasks like Video Generation and KB Syncs.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <Clock className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Queue is Empty</h3>
        <p className="text-gray-500 max-w-sm">There are no pending or active background jobs at the moment.</p>
      </div>
    </div>
  )
}
