import { createFileRoute } from '@tanstack/react-router'
import { Users, UserPlus } from 'lucide-react'

export const Route = createFileRoute('/users')({
  component: UsersComponent,
})

function UsersComponent() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage team members and invite new users to the platform.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
          <UserPlus size={16} />
          Invite User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">AD</div>
                Admin User
              </td>
              <td className="px-6 py-4 text-gray-500">admin@noblemount.com</td>
              <td className="px-6 py-4">
                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold">Administrator</span>
              </td>
              <td className="px-6 py-4">
                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-semibold">Active</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
