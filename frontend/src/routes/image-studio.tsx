import { createFileRoute } from '@tanstack/react-router'
import { Image as ImageIcon, Wand2 } from 'lucide-react'

export const Route = createFileRoute('/image-studio')({
  component: ImageStudioComponent,
})

function ImageStudioComponent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="text-pink-600" />
            Image Studio
          </h1>
          <p className="text-gray-500 text-sm mt-1">Generate AI images for your social media posts.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <Wand2 className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-500 max-w-sm">The Image Studio feature is currently in development. Soon you'll be able to generate product photos and marketing graphics directly from here.</p>
      </div>
    </div>
  )
}
