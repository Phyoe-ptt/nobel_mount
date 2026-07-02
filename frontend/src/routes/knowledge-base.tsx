import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, FileText, UploadCloud } from 'lucide-react'

export const Route = createFileRoute('/knowledge-base')({
  component: KnowledgeBaseComponent,
})

function KnowledgeBaseComponent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            Knowledge Base
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage documents used by the AI to answer customer queries.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm">
          <UploadCloud size={16} />
          Upload Document
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No documents synced</h3>
        <p className="text-gray-500 max-w-sm mb-6">Upload PDFs, text files, or sync your Facebook posts to train the AI on your specific business knowledge.</p>
        <button className="text-blue-600 font-medium hover:underline">Learn how to format data</button>
      </div>
    </div>
  )
}
