import { useEffect } from 'react'

type ToastProps = {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const styles = {
    success: 'from-green-500 to-green-600',
    error: 'from-red-500 to-red-600',
    info: 'from-[#6c4dc0] to-[#9c6de6]',
    warning: 'from-orange-500 to-orange-600',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'i',
    warning: '!',
  }

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
      <div
        className={`bg-gradient-to-r ${styles[type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
          {icons[type]}
        </div>
        <p className="flex-1 font-medium text-sm">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white font-bold text-xl leading-none shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  )
}
