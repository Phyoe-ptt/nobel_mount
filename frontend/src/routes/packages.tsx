import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Package, Plus } from 'lucide-react'

export const Route = createFileRoute('/packages')({
  component: PackagesComponent,
})

function PackagesComponent() {
  const [autoFollowUp, setAutoFollowUp] = React.useState(true)

  const packages = [
    { name: 'CCNA Bootcamp', slug: 'ccna-bootcamp', price: '350,000 MMK' },
    { name: 'Network Engineering Diploma', slug: 'network-eng', price: '500,000 MMK' },
    { name: 'Cyber Security + CEH', slug: 'cyber-sec-ceh', price: '450,000 MMK' },
    { name: 'Japan Language Level 3', slug: 'n3-class', price: '250,000 MMK' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <Package size={20} className="text-stone-700" />
          Packages & Follow-up
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Manage Noble Mount course packages, promotions, and follow-up defaults.
        </p>
      </div>

      {/* Sales packages */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-stone-900">Sales packages</h2>
          <button className="bg-[#C69A55] hover:bg-[#B38745] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
            <Plus size={14} strokeWidth={3} />
            New package
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-stone-500 font-medium border-b border-stone-100">
                <th className="pb-3 px-4 font-medium">Name</th>
                <th className="pb-3 px-4 font-medium">Slug</th>
                <th className="pb-3 px-4 font-medium">Price</th>
                <th className="pb-3 px-4 font-medium">Status</th>
                <th className="pb-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {packages.map((pkg, idx) => (
                <tr key={idx} className="group hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-4 px-4 font-medium text-stone-900">{pkg.name}</td>
                  <td className="py-4 px-4 text-stone-500 font-mono text-xs">{pkg.slug}</td>
                  <td className="py-4 px-4 text-stone-700">{pkg.price}</td>
                  <td className="py-4 px-4">
                    <span className="bg-[#C69A55] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button className="bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button className="bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                      Promo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Follow-up settings */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mb-6">
          <span className="text-stone-400 font-mono text-sm">%</span> Follow-up settings
        </h2>

        <div className="space-y-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={autoFollowUp}
              onChange={e => setAutoFollowUp(e.target.checked)}
            />
            <div className="w-9 h-5 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C69A55] relative"></div>
            <span className="text-sm font-bold text-stone-700">Auto-send follow-ups (otherwise staff must approve)</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Follow-up delay (hours after last customer message)</label>
              <input 
                type="number" 
                defaultValue={1} 
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" 
              />
              <p className="text-[10px] text-stone-500 mt-2">Example: 12 - follow up 12 hours after the customer's last message.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-2">Max follow-ups per conversation (days)</label>
              <input 
                type="number" 
                defaultValue={2} 
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-900 mb-2">Unresolved accuracy threshold (%)</label>
            <input 
              type="number" 
              defaultValue={10} 
              className="w-full max-w-sm bg-white border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C69A55] outline-none" 
            />
          </div>

          <div className="pt-2">
            <button className="bg-[#C69A55] hover:bg-[#B38745] text-white font-bold px-6 py-2 rounded-lg transition-colors shadow-sm">
              Save settings
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
