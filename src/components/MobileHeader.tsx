import { formatDate } from '../lib/utils'

type MobileHeaderProps = {
  weekDate: string
  playerCount: number
}

export default function MobileHeader({ weekDate, playerCount }: MobileHeaderProps) {
  return (
    <header className="lg:hidden bg-[#1b1464] text-white">
      {/* Logo and Admin Button */}
      <div className="p-4 flex justify-between items-center border-b border-white/10">
        <div className="flex-1"></div>
        <img
          src="https://gllvzrjyuplairmubzbu.supabase.co/storage/v1/object/public/logo/neww%20logo.png"
          alt="Sticky Rice FC"
          className="h-16 w-auto object-contain"
          style={{
            filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)'
          }}
        />
        <div className="flex-1 flex justify-end">
          <a
            href="/admin"
            className="bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white py-1.5 px-3 rounded-lg font-bold text-xs hover:shadow-lg transition-all"
          >
            🔐 Admin
          </a>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <h1 className="text-xl font-bold mb-1">Monday Football</h1>
        <p className="text-sm text-white/80">{formatDate(weekDate)}</p>
        <p className="text-sm text-white/80">6:00 – 8:00 PM</p>

        <div className="mt-3 inline-block bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] rounded-full px-4 py-2">
          <span className="text-sm font-semibold">{playerCount} Players</span>
        </div>
      </div>
    </header>
  )
}
