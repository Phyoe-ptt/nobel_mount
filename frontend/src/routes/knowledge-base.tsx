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

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/rag/upload-document', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Failed to upload file')
      return res.json()
    },
    onSuccess: (data) => {
      alert(data.message)
    },
    onError: (err) => {
      alert(err.message)
    }
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/rag/sync-facebook', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Sync failed')
      return data
    },
    onSuccess: (data) => {
      alert(data.message || 'Sync successful!')
    },
    onError: (err) => {
      alert(err.message)
    }
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['.pdf', '.docx', '.xlsx', '.xls', '.csv', '.txt', '.json']
      const isValid = validTypes.some(ext => file.name.toLowerCase().endsWith(ext))
      if (isValid) {
        uploadFileMutation.mutate(file)
      } else {
        alert("Please select a valid document (PDF, Word, Excel, CSV, TXT, JSON).")
      }
    }
  }

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
        <h3 className="text-lg font-bold text-gray-900 mb-2">Sync Facebook or Upload Files</h3>
        <p className="text-gray-500 max-w-sm mb-6">You can sync your past Facebook page posts or upload historical Messenger chats (JSON) or course schedules (Excel/Word/PDF).</p>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="text-white bg-[#C69A55] px-6 py-2 rounded-lg font-medium hover:bg-[#B38745] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncMutation.isPending ? 'Syncing...' : 'Sync Page Posts (Graph API)'}
          </button>
          
          <span className="text-gray-300 font-bold">OR</span>
          
          <label className="text-white bg-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer flex items-center gap-2">
            <UploadCloud size={18} />
            {uploadFileMutation.isPending ? 'Uploading...' : 'Upload Document (PDF/Excel/Word)'}
            <input type="file" accept=".json,.pdf,.docx,.xlsx,.xls,.csv,.txt" className="hidden" onChange={handleFileUpload} disabled={uploadFileMutation.isPending} />
          </label>
        </div>
      </div>
    </div>
  )
}
