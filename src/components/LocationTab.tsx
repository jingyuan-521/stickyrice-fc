import type { Week } from '../types'
import CommentsSection from './CommentsSection'

type LocationTabProps = {
  week: Week
}

export default function LocationTab({ week }: LocationTabProps) {
  return (
    <div className="space-y-6">
      {/* Pitch Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6c4dc0] to-[#9c6de6] rounded-full flex items-center justify-center text-2xl">
            📍
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Venue</h2>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#1b1464]">{week.pitch_name}</h3>
          <p className="text-gray-600">{week.pitch_address}</p>
        </div>
      </div>

      {/* Directions Button */}
      {week.pitch_maps_url && (
        <a
          href="https://maps.app.goo.gl/dZKZWrBXaa3JcXfy6"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transform hover:scale-[1.02] transition-all"
        >
          Get Directions →
        </a>
      )}

      {/* Google Maps Embed */}
      {week.pitch_maps_url && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <iframe
            src={week.pitch_maps_url}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Pitch location"
            className="w-full"
          />
        </div>
      )}

      {/* Comments Section */}
      <CommentsSection week={week} />
    </div>
  )
}
