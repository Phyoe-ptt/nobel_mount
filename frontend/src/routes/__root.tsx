import * as React from 'react'
import { Outlet, createRootRoute, Link, useLocation } from '@tanstack/react-router'
import { 
  LayoutDashboard, PenTool, Video, Zap, Megaphone, ListOrdered, 
  BookOpen, MessageSquare, LineChart, Settings, ShieldAlert, 
  Users, Package, Menu, Sun, LogOut, PanelLeftClose
} from 'lucide-react'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const location = useLocation()

  const workspaceItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/create-post', label: 'Create Post', icon: PenTool },
    { path: '/video-studio', label: 'Video Studio', icon: Video },
    { path: '/auto-pilot', label: 'Auto-Pilot', icon: Zap },
    { path: '/ads', label: 'Ads', icon: Megaphone },
    { path: '/queue', label: 'Queue', icon: ListOrdered },
    { path: '/user-manual', label: 'User Manual', icon: BookOpen },
    { path: '/inbox', label: 'Sales Inbox', icon: MessageSquare },
    { path: '/page-insights', label: 'Page Insights', icon: LineChart },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  const adminItems = [
    { path: '/roles', label: 'Roles & Permissions', icon: ShieldAlert },
    { path: '/users', label: 'User Management', icon: Users },
    { path: '/packages', label: 'Packages & Follow-up', icon: Package },
  ]

  // Helper to format page title
  const getPageTitle = (path: string) => {
    if (path === '/') return 'Dashboard'
    if (path === '/create-post') return 'Create — Human Mode'
    return path.substring(1).split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-stone-800 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Cream/Stone Theme */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#FDFBF7] border-r border-stone-200 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-64'
        } flex flex-col`}
      >
        <div className="h-20 flex flex-col justify-center px-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-900 rounded flex items-center justify-center">
              <span className="text-amber-500 font-serif font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="font-bold text-stone-900 text-base leading-tight">Noble Mount</h1>
              <p className="text-[10px] text-stone-500 font-medium">IT & Language College</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="px-6 mb-2 text-[11px] font-bold text-stone-400">
            Workspace
          </div>
          <nav className="space-y-0.5 px-3 mb-6">
            {workspaceItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive 
                      ? 'bg-[#F2EFE9] text-stone-900 shadow-sm' 
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-stone-900' : 'text-stone-500'} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="px-6 mb-2 text-[11px] font-bold text-stone-400">
            Admin
          </div>
          <nav className="space-y-0.5 px-3 mb-6">
            {adminItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive 
                      ? 'bg-[#F2EFE9] text-stone-900 shadow-sm' 
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-stone-900' : 'text-stone-500'} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FDFBF7]">
        
        {/* Top Header */}
        <header className="h-16 bg-[#FDFBF7] border-b border-stone-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-stone-500 hover:text-stone-800 transition-colors"
            >
              <PanelLeftClose size={20} className={!isSidebarOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            <h2 className="text-sm font-bold text-stone-900">
              {getPageTitle(location.pathname)}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-stone-400 hover:text-stone-600 transition-colors hidden sm:block">
              <Sun size={18} />
            </button>
            
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-stone-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              NobleMount
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-[#B69666] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                AD
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-stone-900 leading-tight">Admin</p>
                <p className="text-[10px] text-stone-500">admin@noblemount.com</p>
              </div>
            </div>

            <button className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors px-3 py-1.5 border border-stone-200 rounded-md hover:bg-stone-50">
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
           <Outlet />
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d6d3d1;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #a8a29e;
        }
      `}</style>
    </div>
  )
}
