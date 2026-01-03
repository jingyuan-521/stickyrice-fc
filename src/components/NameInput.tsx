import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getLastName, saveLastName } from '../lib/storage'

type NameInputProps = {
  value: string
  onChange: (name: string) => void
  placeholder?: string
}

export default function NameInput({ value, onChange, placeholder = 'Your name' }: NameInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allNames, setAllNames] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load all player names on mount
  useEffect(() => {
    loadPlayerNames()

    // Pre-fill with last used name from localStorage
    const lastUsedName = getLastName()
    if (lastUsedName && !value) {
      onChange(lastUsedName)
    }
  }, [])

  async function loadPlayerNames() {
    const { data, error } = await supabase
      .from('player_names')
      .select('name')
      .order('last_used_at', { ascending: false })

    if (data && !error) {
      setAllNames(data.map(d => d.name))
    }
  }

  // Filter suggestions based on input
  useEffect(() => {
    if (value.length > 0) {
      const filtered = allNames.filter(name =>
        name.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5)) // Max 5 suggestions
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions(allNames.slice(0, 5)) // Show recent names when empty
      setShowSuggestions(false)
    }
  }, [value, allNames])

  function handleSelect(name: string) {
    onChange(name)
    setShowSuggestions(false)
    saveLastName(name)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
    if (e.target.value.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        autoComplete="off"
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleSelect(name)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
