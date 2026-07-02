import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { Bot, User, CheckCircle, Search, Inbox, MessageSquare } from 'lucide-react'

export const Route = createFileRoute('/inbox')({
  component: InboxComponent,
})

function InboxComponent() {
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = React.useState<string | null>(null)

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['inbox'],
    queryFn: async () => {
      const res = await fetch('/api/inbox')
      if (!res.ok) throw new Error('Failed to fetch inbox')
      return res.json()
    },
    refetchInterval: 5000, // Poll every 5s for new messages
  })

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inbox/resolve/${id}`, { method: 'PUT' })
      if (!res.ok) throw new Error('Failed to resolve')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] })
    }
  })

  const leadStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await fetch(`/api/inbox/lead-status/${id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] })
    }
  })

  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: string, verified: boolean }) => {
      const res = await fetch(`/api/inbox/payment/${id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified })
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] })
    }
  })

  // Group messages by customer (assuming senderId is customer when not from AI, and recipientId is customer when from AI)
  const groupedConversations = React.useMemo(() => {
    const groups: Record<string, any[]> = {}
    messages.forEach((msg: any) => {
      const customerId = msg.fromAi ? msg.recipientId : msg.senderId
      if (!customerId) return
      
      if (!groups[customerId]) {
        groups[customerId] = []
      }
      groups[customerId].push(msg)
    })

    // Sort messages in each group by time
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })

    return groups
  }, [messages])

  const customers = Object.keys(groupedConversations).map(id => {
    const msgs = groupedConversations[id]
    const lastMsg = msgs[msgs.length - 1]
    const hasUnresolvedHandoff = msgs.some(m => m.requiresHuman && !m.resolved)
    return { id, lastMsg, hasUnresolvedHandoff }
  }).sort((a, b) => new Date(b.lastMsg.createdAt).getTime() - new Date(a.lastMsg.createdAt).getTime())

  // Auto-select first user if none selected
  React.useEffect(() => {
    if (!selectedUser && customers.length > 0) {
      setSelectedUser(customers[0].id)
    }
  }, [customers, selectedUser])

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex h-[calc(100vh-8rem)] overflow-hidden">
      
      {/* Sidebar: Conversation List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {customers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              No messages yet
            </div>
          ) : (
            customers.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedUser(c.id)}
                className={`w-full text-left p-4 border-b border-gray-100 transition-colors hover:bg-gray-100 ${
                  selectedUser === c.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-900 truncate">Customer {c.id.substring(0,6)}...</span>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {new Date(c.lastMsg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex gap-2 items-center mb-1">
                  <select 
                    value={c.lastMsg.leadStatus || ''} 
                    onChange={(e) => leadStatusMutation.mutate({ id: c.lastMsg.id, status: e.target.value })}
                    onClick={e => e.stopPropagation()}
                    className="text-[10px] bg-white border border-gray-200 rounded px-1 py-0.5 text-gray-700 font-bold"
                  >
                    <option value="">No Status</option>
                    <option value="NEW_LEAD">New Lead</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                    <option value="ENROLLED">Enrolled</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.lastMsg.messageText}</p>
                {c.hasUnresolvedHandoff && (
                  <span className="mt-2 inline-block px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-full">
                    Needs Attention
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Customer {selectedUser}</h2>
                  <p className="text-xs text-gray-500">Facebook Messenger</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30">
              {groupedConversations[selectedUser]?.map(msg => (
                <div key={msg.id} className={`flex ${!msg.fromAi ? 'justify-start' : 'justify-end'}`}>
                  
                  {/* Avatar for customer */}
                  {!msg.fromAi && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                      <User size={16} className="text-gray-500" />
                    </div>
                  )}

                  <div className={`max-w-[75%] ${!msg.fromAi ? 'text-left' : 'text-right'}`}>
                    {/* Message Bubble */}
                    <div className={`p-4 rounded-2xl inline-block text-left shadow-sm relative ${
                      !msg.fromAi 
                        ? (msg.requiresHuman && !msg.resolved ? 'bg-red-50 border-2 border-red-200 text-red-900' : 'bg-white border border-gray-200 text-gray-800')
                        : 'bg-blue-600 text-white'
                    }`}>
                      
                      {/* Badges */}
                      {msg.fromAi && !msg.requiresHuman && (
                        <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Bot size={12}/> AI Generated
                        </div>
                      )}
                      
                      {msg.requiresHuman && !msg.resolved && (
                        <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          🔴 Needs Human Handoff
                        </div>
                      )}

                      {msg.requiresHuman && msg.resolved && (
                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <CheckCircle size={12}/> Resolved by Admin
                        </div>
                      )}

                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.messageText}
                      </p>

                      {msg.paymentSlipUrl && (
                        <div className="mt-3 p-3 bg-white/50 rounded-xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-800 mb-2">Payment Slip (AI Vision Scanned)</p>
                          <img src={msg.paymentSlipUrl} alt="Slip" className="w-full max-w-[200px] rounded-lg mb-2 border border-gray-200" />
                          
                          {msg.paymentVerified ? (
                            <div className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded inline-block">✅ Verified</div>
                          ) : (
                            <button 
                              onClick={() => verifyPaymentMutation.mutate({ id: msg.id, verified: true })}
                              className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded"
                            >
                              Approve Payment
                            </button>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className={`text-[10px] mt-2 ${!msg.fromAi ? 'text-gray-400' : 'text-blue-200'}`}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Resolve Button for Admin */}
                    {msg.requiresHuman && !msg.resolved && (
                      <div className="mt-2 text-left">
                        <button 
                          onClick={() => resolveMutation.mutate(msg.id)}
                          disabled={resolveMutation.isPending}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <CheckCircle size={14} />
                          {resolveMutation.isPending ? 'Resolving...' : 'Mark as Resolved'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat Input Placeholder */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Type a manual reply to override AI..." 
                  className="w-full pl-4 pr-24 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                  Send
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">Manual replies will temporarily pause the AI autopilot for this customer.</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  )
}
