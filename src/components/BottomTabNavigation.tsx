import type { TabType } from '../types'

type BottomTabNavigationProps = {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'players', label: 'Players', icon: '⚽' },
  { id: 'payments', label: 'Payments', icon: '💰' },
  { id: 'album', label: 'Album', icon: '📸' },
  { id: 'location', label: 'Location', icon: '📍' },
]

export default function BottomTabNavigation({ activeTab, onTabChange }: BottomTabNavigationProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1b1464] border-t border-white/10 z-50">
      <ul className="flex justify-around items-center">
        {tabs.map((tab) => (
          <li key={tab.id} className="flex-1">
            <button
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex flex-col items-center gap-1 py-3 transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/50'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="w-12 h-1 bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] rounded-full mt-1" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
