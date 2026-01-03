type ConfirmModalProps = {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info',
}: ConfirmModalProps) {
  const buttonStyles = {
    danger: 'from-red-500 to-red-600 hover:shadow-red-500/50',
    warning: 'from-orange-500 to-orange-600 hover:shadow-orange-500/50',
    info: 'from-[#6c4dc0] to-[#9c6de6] hover:shadow-purple-500/50',
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 bg-gradient-to-r ${buttonStyles[type]} text-white rounded-lg font-semibold hover:shadow-lg transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
