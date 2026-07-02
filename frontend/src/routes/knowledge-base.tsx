import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { BookOpen, FileText, UploadCloud, CheckCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

export const Route = createFileRoute('/knowledge-base')({
  component: KnowledgeBaseComponent,
})

function KnowledgeBaseComponent() {
  const [documentText, setDocumentText] = React.useState('')

  const addDocumentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/rag/add-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (!res.ok) throw new Error('Failed to add document')
      return res.json()
    },
    onSuccess: () => {
      setDocumentText('')
      alert("Document successfully added to Knowledge Base!")
    },
    onError: (err) => {
      alert(err.message)
    }
  })

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
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-stone-900 mb-4">Add Course Details & FAQs</h2>
        <p className="text-sm text-stone-500 mb-4">
          Paste course prices, opening dates, timetables, or frequently asked questions below. 
          The AI Sales Agent will read this to answer students accurately.
        </p>
        <textarea 
          value={documentText}
          onChange={e => setDocumentText(e.target.value)}
          placeholder="e.g. The CCNA Bootcamp costs 350,000 MMK and starts on July 15th. Classes are Saturday/Sunday 9am-12pm."
          className="w-full h-48 bg-[#FDFBF7] border border-stone-200 rounded-xl p-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C69A55] resize-none mb-4"
        />
        <div className="flex justify-end">
          <button 
            onClick={() => addDocumentMutation.mutate(documentText)}
            disabled={!documentText.trim() || addDocumentMutation.isPending}
            className="bg-[#C69A55] hover:bg-[#B38745] text-white font-bold px-6 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {addDocumentMutation.isPending ? 'Adding to AI...' : 'Add to Knowledge Base'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Sync Facebook Page Posts</h3>
        <p className="text-gray-500 max-w-sm mb-6">You can also sync your past Facebook posts so the AI knows your history.</p>
        <button 
          onClick={() => fetch('/rag/sync-facebook', { method: 'POST' }).then(() => alert('Sync started!'))}
          className="text-[#C69A55] font-medium hover:underline"
        >
          Click here to sync Facebook posts
        </button>
      </div>
    </div>
  )
}
