import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Announcement } from '../types'

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    loadAnnouncements()

    // Refresh announcements every 30 seconds
    const interval = setInterval(loadAnnouncements, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (announcements.length <= 1) return

    // Rotate announcements every 10 seconds
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 10000)

    return () => clearInterval(timer)
  }, [announcements.length])

  async function loadAnnouncements() {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(5)

    if (data && !error && data.length > 0) {
      setAnnouncements(data)
    }
  }

  // Show welcome message if no announcements
  const displayMessage = announcements.length > 0
    ? announcements[currentIndex]
    : {
        id: 'welcome',
        message: "Welcome to Sticky Rice FC's first web app!",
        created_by: 'System',
        created_at: new Date().toISOString(),
        is_active: true,
        expires_at: null,
      }

  const isLongMessage = displayMessage.message.length > 100

  return (
    <div className="bg-gradient-to-r from-[#6c4dc0] via-[#7d5ed1] to-[#9c6de6] text-white shadow-xl border-b-2 border-purple-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-4 sm:py-5">
          {/* Icon */}
          <div className="hidden sm:flex w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg items-center justify-center shrink-0 border border-white/20">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {isLongMessage ? (
              <div className="relative">
                <div className="overflow-hidden whitespace-nowrap">
                  <p className="inline-block text-base sm:text-lg font-semibold animate-scroll-left px-4">
                    {displayMessage.message}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-base sm:text-lg font-semibold leading-snug">
                  {displayMessage.message}
                </p>
                {announcements.length > 0 && (
                  <p className="text-xs sm:text-sm text-white/75 mt-1 font-medium">
                    {displayMessage.created_by} • {new Date(displayMessage.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Indicators */}
          {announcements.length > 1 && (
            <div className="hidden sm:flex gap-1.5 shrink-0">
              {announcements.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-white w-6' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
