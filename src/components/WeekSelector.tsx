import { formatDate } from '../lib/utils'
import type { Week } from '../types'

type WeekSelectorProps = {
  weeks: Week[]
  currentWeek: Week
  onWeekChange: (week: Week) => void
}

export default function WeekSelector({ weeks, currentWeek, onWeekChange }: WeekSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Select Game Week:
      </label>
      <select
        value={currentWeek.id}
        onChange={(e) => {
          const selected = weeks.find(w => w.id === e.target.value)
          if (selected) onWeekChange(selected)
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6c4dc0] focus:border-transparent font-medium"
      >
        {weeks.map((week) => (
          <option key={week.id} value={week.id}>
            {formatDate(week.week_start_date)} - {week.pitch_name}
          </option>
        ))}
      </select>
    </div>
  )
}
