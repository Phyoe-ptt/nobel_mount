import { createFileRoute } from '@tanstack/react-router'
import { ListOrdered, Clock, CheckCircle, Calendar } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/queue')({
  component: QueueComponent,
})

function QueueComponent() {
  const queryClient = useQueryClient()

  const { data: posts = [] } = useQuery({
    queryKey: ['socialPosts'],
    queryFn: async () => {
      const res = await fetch('/api/social-posts')
      return res.json()
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, content, imageUrl }: { id: number, status: string, content?: string, imageUrl?: string }) => {
      if (status === 'PUBLISHED') {
        const pubRes = await fetch('/facebook/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, image_url: imageUrl })
        })
        if (!pubRes.ok) throw new Error('Failed to publish to Facebook')
      }

      const res = await fetch(`/api/social-posts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] })
    },
    onError: (err) => {
      alert("Error: " + err.message)
    }
  })

  const draftPosts = posts.filter((p: any) => p.status === 'DRAFT' || p.status === 'FAILED' || !p.status)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ListOrdered className="text-gray-700" />
            Content Queue (Pending Review)
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review AI generated posts. Approve to publish immediately or schedule for later.</p>
        </div>
      </div>

      {draftPosts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
          <Clock className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Queue is Empty</h3>
          <p className="text-gray-500 max-w-sm">There are no pending posts waiting for review at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draftPosts.map((post: any) => (
            <div key={post.id} className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-md uppercase">
                    Pending Review
                  </span>
                  <p className="text-sm font-medium text-stone-900 whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-stone-100">
                <button 
                  onClick={() => updateStatusMutation.mutate({ id: post.id, status: 'PUBLISHED', content: post.content, imageUrl: post.imageUrl })}
                  disabled={updateStatusMutation.isPending}
                  className="bg-[#C69A55] hover:bg-[#B38745] text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={16} /> Post Now
                </button>
                <button 
                  onClick={() => updateStatusMutation.mutate({ id: post.id, status: 'SCHEDULED' })}
                  disabled={updateStatusMutation.isPending}
                  className="bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Calendar size={16} /> Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
