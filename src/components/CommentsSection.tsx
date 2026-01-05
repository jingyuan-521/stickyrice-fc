import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getLastName, isAdmin } from '../lib/storage'
import type { Week, Comment } from '../types'
import Toast from './Toast'
import ConfirmModal from './ConfirmModal'
import { useToast } from '../lib/useToast'

type CommentsSectionProps = {
  week: Week
}

export default function CommentsSection({ week }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const { toasts, removeToast, success, error: showError } = useToast()

  useEffect(() => {
    loadComments()
  }, [week.id])

  async function loadComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('week_id', week.id)
      .order('created_at', { ascending: true })

    if (data && !error) {
      // Build comment tree (parent comments with their replies)
      const commentMap = new Map<string, Comment>()
      const rootComments: Comment[] = []

      // First pass: create map of all comments
      data.forEach((comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] })
      })

      // Second pass: build tree structure
      data.forEach((comment) => {
        const commentWithReplies = commentMap.get(comment.id)!
        if (comment.parent_id) {
          // This is a reply
          const parent = commentMap.get(comment.parent_id)
          if (parent) {
            parent.replies!.push(commentWithReplies)
          }
        } else {
          // This is a root comment
          rootComments.push(commentWithReplies)
        }
      })

      setComments(rootComments)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!message.trim()) return

    const playerName = getLastName()
    if (!playerName) {
      showError('Please sign up first before commenting')
      return
    }

    setLoading(true)

    try {
      const { error: submitError } = await supabase
        .from('comments')
        .insert({
          week_id: week.id,
          player_name: playerName,
          message: message.trim(),
          parent_id: replyingTo?.id || null,
        })

      if (submitError) throw submitError

      setMessage('')
      setReplyingTo(null)
      success(replyingTo ? 'Reply posted!' : 'Comment posted!')
      await loadComments()
    } catch (err: any) {
      showError('Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return

    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', deleteConfirm)

    if (!deleteError) {
      success('Comment deleted')
      await loadComments()
    } else {
      showError('Failed to delete comment')
    }

    setDeleteConfirm(null)
  }

  function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
    const isOwnComment = getLastName() === comment.player_name
    const canDelete = isOwnComment || isAdmin()
    const maxDepth = 3 // Maximum nesting level

    return (
      <div className={depth > 0 ? 'ml-4 sm:ml-8 mt-3' : ''}>
        <div
          className={`bg-gradient-to-r ${
            depth === 0
              ? 'from-gray-50 to-gray-100 border-l-4 border-[#6c4dc0]'
              : 'from-purple-50 to-purple-100 border-l-4 border-purple-400'
          } rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#6c4dc0] to-[#9c6de6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {comment.player_name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-gray-900">{comment.player_name}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                {depth > 0 && (
                  <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded">
                    Reply
                  </span>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                {comment.message}
              </p>

              {/* Reply button */}
              {depth < maxDepth && (
                <button
                  onClick={() => setReplyingTo(comment)}
                  className="mt-3 text-[#6c4dc0] hover:text-[#9c6de6] text-sm font-semibold flex items-center gap-1 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                  Reply
                </button>
              )}
            </div>

            {canDelete && (
              <button
                onClick={() => setDeleteConfirm(comment.id)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition shrink-0"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-0">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#6c4dc0] to-[#9c6de6] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Discussion</h2>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Need a ride? Have questions? Share here..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6c4dc0] focus:border-transparent transition resize-none text-sm sm:text-base"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="mt-3 bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-400 font-medium">No comments yet</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        )}
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Reply to {replyingTo.player_name}</h3>
                <button
                  onClick={() => {
                    setReplyingTo(null)
                    setMessage('')
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-[#6c4dc0]">
                <p className="text-sm font-semibold text-gray-700 mb-1">{replyingTo.player_name}:</p>
                <p className="text-gray-600 text-sm">{replyingTo.message}</p>
              </div>

              <form onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Reply</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Reply to ${replyingTo.player_name}...`}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6c4dc0] focus:border-transparent transition resize-none"
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null)
                      setMessage('')
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmModal
          title="Delete Comment?"
          message="This will permanently delete your comment. If this is a parent comment, all replies will also be deleted."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}
