import type { TabType } from '../types'
import { formatDate } from '../lib/utils'

type SidebarProps = {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  playerCount: number
  weekDate: string
}

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'players', label: 'Players', icon: '⚽' },
  { id: 'payments', label: 'Payments', icon: '💰' },
  { id: 'album', label: 'Album', icon: '📸' },
  { id: 'location', label: 'Location', icon: '📍' },
]

export default function Sidebar({ activeTab, onTabChange, playerCount, weekDate }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-[#1b1464] text-white h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex justify-center">
        <img
          src="https://gllvzrjyuplairmubzbu.supabase.co/storage/v1/object/public/logo/Screenshot%202569-01-02%20at%2015.23.33.png"
          alt="Sticky Rice FC"
          className="h-20 w-auto object-contain"
        />
      </div>

      {/* Week Info */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-2">
          Next Game
        </h2>
        <p className="text-2xl font-bold">Monday Football</p>
        <p className="text-sm text-white/90 mt-1 font-semibold">{formatDate(weekDate)}</p>
        <p className="text-sm text-white/80 mt-1">6:00 – 8:00 PM</p>
        <div className="mt-4 bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] rounded-lg p-3">
          <p className="text-xs text-white/90">Players Signed Up</p>
          <p className="text-3xl font-bold">{playerCount}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 space-y-3">
        <a
          href="/admin"
          className="block w-full bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white py-2 px-4 rounded-lg font-bold text-center hover:shadow-lg transition-all text-sm"
        >
          🔐 Admin Login
        </a>
        <p className="text-xs text-white/50 text-center">
          Sticky Rice FC © 2026
        </p>
      </div>
    </aside>
  )
}
