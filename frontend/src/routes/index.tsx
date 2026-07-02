import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { 
  BarChart3, MessageSquareWarning, Megaphone, FileText, 
  TrendingUp, Clock, AlertTriangle, CheckCircle2, PlayCircle
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: DashboardComponent,
})

function DashboardComponent() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('Failed to fetch dashboard stats')
      return res.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold mb-2">Error Loading Dashboard</h2>
        <p className="text-sm opacity-90">{error.message}</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Active Drafts',
      value: stats?.drafts || 0,
      icon: FileText,
      color: 'bg-blue-500',
      trend: '+2 this week'
    },
    {
      title: 'Published Posts',
      value: stats?.published || 0,
      icon: CheckCircle2,
      color: 'bg-green-500',
      trend: '+12 this month'
    },
    {
      title: 'Active Ad Boosts',
      value: stats?.activeBoosts || 0,
      icon: Megaphone,
      color: 'bg-purple-500',
      trend: `${stats?.pendingBoosts || 0} pending`
    },
    {
      title: 'Unread Messages',
      value: stats?.inboxUnread || 0,
      icon: MessageSquareWarning,
      color: stats?.inboxUnread > 0 ? 'bg-red-500' : 'bg-gray-400',
      trend: stats?.inboxUnread > 0 ? 'Requires attention' : 'All caught up'
    }
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <Clock size={16} />
            Last 30 Days
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
            <BarChart3 size={16} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
              <p className="text-gray-500 text-sm font-medium mt-1">{stat.title}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 relative z-10 flex items-center text-xs text-gray-500 font-medium">
              <TrendingUp size={14} className="mr-1.5 text-gray-400" />
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Social Posts</h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
          </div>
          
          <div className="flex-1 overflow-auto">
            {stats?.recentPosts && stats.recentPosts.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPosts.map((post: any) => (
                  <div key={post.id} className="flex items-start p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate mb-1">{post.content || 'Untitled Post'}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={12}/> {new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                          post.status === 'DRAFT' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <FileText className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900">No recent posts</p>
                <p className="text-xs text-gray-500 mt-1">Create your first AI-generated post to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Autopilot Status */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 opacity-20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <PlayCircle className="w-6 h-6 text-blue-200" />
              </div>
              <h2 className="text-lg font-bold text-white">AI Autopilot</h2>
            </div>

            <div className="space-y-5 flex-1">
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-blue-100">Status</span>
                  <span className="text-xs font-bold text-green-400 uppercase tracking-wide bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Active</span>
                </div>
                <p className="text-xs text-blue-200/70">Monitoring incoming messages 24/7</p>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-blue-100">Accuracy Threshold</span>
                  <span className="text-sm font-bold text-white">
                    {stats?.autopilotConfig?.minConfidenceScore || 85}%
                  </span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-1.5 mt-2">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${stats?.autopilotConfig?.minConfidenceScore || 85}%` }}></div>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 bg-white text-indigo-900 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-gray-50 transition-colors">
              Configure AI Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
