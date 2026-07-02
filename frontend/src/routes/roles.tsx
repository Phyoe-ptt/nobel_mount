import { createFileRoute } from '@tanstack/react-router'
import { ShieldAlert, Plus } from 'lucide-react'

export const Route = createFileRoute('/roles')({
  component: RolesComponent,
})

function RolesComponent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-red-600" />
            Role Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure permissions and access levels for team members.</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
          <Plus size={16} />
          Create Role
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Role Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Users</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-bold text-gray-900">Administrator</td>
              <td className="px-6 py-4 text-gray-500">Full access to all platform features and settings.</td>
              <td className="px-6 py-4">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">1</span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-bold text-gray-900">Sales Agent</td>
              <td className="px-6 py-4 text-gray-500">Access to Inbox and Content Planner only.</td>
              <td className="px-6 py-4">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-bold">0</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
