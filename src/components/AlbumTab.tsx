import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getLastName } from '../lib/storage'
import type { Week, Photo } from '../types'
import CommentsSection from './CommentsSection'
import Toast from './Toast'
import ConfirmModal from './ConfirmModal'
import { useToast } from '../lib/useToast'

type AlbumTabProps = {
  week: Week
}

export default function AlbumTab({ week }: AlbumTabProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Photo | null>(null)
  const { toasts, removeToast, success, error: showError } = useToast()

  useEffect(() => {
    loadPhotos()
  }, [week.id])

  async function loadPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('week_id', week.id)
      .order('uploaded_at', { ascending: false })

    if (data && !error) {
      setPhotos(data)
    }
  }

  async function handlePhotoUpload(file: File) {
    const uploaderName = getLastName() || 'Anonymous'

    setUploading(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${week.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      // Create photo record
      const { error: photoError } = await supabase
        .from('photos')
        .insert({
          week_id: week.id,
          image_url: urlData.publicUrl,
          uploaded_by: uploaderName,
        })

      if (photoError) throw photoError

      // Reload photos
      await loadPhotos()
      success('Photo uploaded successfully!')
    } catch (err: any) {
      showError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  async function confirmDeletePhoto() {
    if (!deleteConfirm) return

    try {
      // Extract file path from URL
      const urlParts = deleteConfirm.image_url.split('/photos/')
      const filePath = urlParts[1]

      // Delete from storage
      if (filePath) {
        await supabase.storage.from('photos').remove([filePath])
      }

      // Delete from database
      const { error } = await supabase.from('photos').delete().eq('id', deleteConfirm.id)

      if (error) throw error

      await loadPhotos()
      success('Photo deleted successfully')
    } catch (err: any) {
      showError(`Delete failed: ${err.message}`)
    }

    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#6c4dc0] to-[#9c6de6] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Photo Gallery</h2>
        </div>

        <label className="block">
          <input
            type="file"
            accept="image/*"
            multiple={false}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handlePhotoUpload(file)
              }
            }}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-3 file:px-6
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-gradient-to-r file:from-[#6c4dc0] file:to-[#9c6de6] file:text-white
              hover:file:shadow-lg file:transition-all file:cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          />
        </label>
        {uploading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-[#6c4dc0] font-semibold">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading photo...
          </div>
        )}
      </div>

      {/* Photos Grid */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>Gallery</span>
          <span className="bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white text-sm font-bold px-3 py-1 rounded-full">
            {photos.length}
          </span>
        </h3>

        {photos.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-400 text-lg font-medium mb-1">No photos yet</p>
            <p className="text-gray-500 text-sm">Upload the first memory from this game!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group shadow-md hover:shadow-xl transition-all"
                onClick={() => setViewingPhoto(photo.image_url)}
              >
                <img
                  src={photo.image_url}
                  alt={`Uploaded by ${photo.uploaded_by}`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 sm:p-3">
                  <p className="font-semibold truncate">{photo.uploaded_by}</p>
                </div>
                <div className="absolute inset-0 bg-[#6c4dc0]/0 group-hover:bg-[#6c4dc0]/10 transition-colors duration-300" />
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDeleteConfirm(photo)
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg font-bold z-10"
                  title="Delete photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo viewer modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setViewingPhoto(null)}
        >
          <div className="max-w-6xl max-h-full">
            <img
              src={viewingPhoto}
              alt="Full size photo"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
            />
            <button
              className="mt-4 w-full bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              onClick={() => setViewingPhoto(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmModal
          title="Delete Photo?"
          message={`Are you sure you want to delete this photo uploaded by ${deleteConfirm.uploaded_by}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmDeletePhoto}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Comments Section */}
      <CommentsSection week={week} />
    </div>
  )
}
