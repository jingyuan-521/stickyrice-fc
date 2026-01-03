import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getCurrentMonday } from '../lib/utils'
import type { Week, TabType } from '../types'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import BottomTabNavigation from './BottomTabNavigation'
import WeekSelector from './WeekSelector'
import PlayersTab from './PlayersTab'
import PaymentsTab from './PaymentsTab'
import AlbumTab from './AlbumTab'
import LocationTab from './LocationTab'
import AnnouncementBanner from './AnnouncementBanner'

export default function GamePage() {
  const [week, setWeek] = useState<Week | null>(null)
  const [allWeeks, setAllWeeks] = useState<Week[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('players')
  const [playerCount, setPlayerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllWeeks()
  }, [])

  async function loadAllWeeks() {
    setLoading(true)
    setError(null)

    try {
      const { data: weeks, error: weeksError } = await supabase
        .from('weeks')
        .select('*')
        .order('week_start_date', { ascending: false })

      if (weeksError || !weeks || weeks.length === 0) {
        setError('No games found')
        setLoading(false)
        return
      }

      setAllWeeks(weeks)

      // Find current week or use most recent
      const monday = getCurrentMonday()
      const currentWeek = weeks.find(w => w.week_start_date === monday) || weeks[0]

      setWeek(currentWeek)
      await loadPlayerCount(currentWeek.id)
    } catch (err: any) {
      setError(err.message || 'Failed to load game data')
    } finally {
      setLoading(false)
    }
  }

  function handleWeekChange(newWeek: Week) {
    setWeek(newWeek)
    loadPlayerCount(newWeek.id)
  }

  async function loadPlayerCount(weekId: string) {
    const { data, error } = await supabase
      .from('signups')
      .select('id', { count: 'exact' })
      .eq('week_id', weekId)
      .is('cancelled_at', null)

    if (!error && data) {
      setPlayerCount(data.length)
    }
  }

  function handleSignupChange() {
    if (week) {
      loadPlayerCount(week.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6c4dc0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !week) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <p className="text-red-600 mb-6 text-lg">{error || 'Game not found'}</p>
          <button
            onClick={loadAllWeeks}
            className="bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Announcement Banner - appears at top across all pages */}
      <AnnouncementBanner />

      <div className="min-h-screen bg-gray-50 flex">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          playerCount={playerCount}
          weekDate={week.week_start_date}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <MobileHeader weekDate={week.week_start_date} playerCount={playerCount} />

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-5xl mx-auto">
            {/* Week Selector */}
            <WeekSelector weeks={allWeeks} currentWeek={week} onWeekChange={handleWeekChange} />

            {activeTab === 'players' && (
              <PlayersTab week={week} onSignupChange={handleSignupChange} />
            )}
            {activeTab === 'payments' && <PaymentsTab week={week} />}
            {activeTab === 'album' && <AlbumTab week={week} />}
            {activeTab === 'location' && <LocationTab week={week} />}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
    </>
  )
}
