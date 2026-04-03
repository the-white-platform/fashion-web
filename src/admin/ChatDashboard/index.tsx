'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { ChatConversation, ChatMessage, User } from '@/payload-types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ConvStatus = 'active' | 'closed' | 'admin_takeover'

type ConversationWithUser = Omit<ChatConversation, 'user' | 'assignedTo'> & {
  user?: User | number | null
  assignedTo?: User | number | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getUserName(user: User | number | null | undefined): string | null {
  if (!user || typeof user === 'number') return null
  return user.name ?? null
}

function getUserEmail(user: User | number | null | undefined): string | null {
  if (!user || typeof user === 'number') return null
  return user.email ?? null
}

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

function statusLabel(status: ConvStatus): string {
  switch (status) {
    case 'active':
      return 'Đang hoạt động'
    case 'admin_takeover':
      return 'Admin tiếp quản'
    case 'closed':
      return 'Đã đóng'
    default:
      return status
  }
}

function statusColor(status: ConvStatus): string {
  switch (status) {
    case 'active':
      return '#22c55e'
    case 'admin_takeover':
      return '#f59e0b'
    case 'closed':
      return '#6b7280'
    default:
      return '#6b7280'
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const ChatDashboard = () => {
  const [conversations, setConversations] = useState<ConversationWithUser[]>([])
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [statusFilter, setStatusFilter] = useState<ConvStatus | 'all'>('all')
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sseRef = useRef<EventSource | null>(null)

  const selectedConv = conversations.find((c) => c.id === selectedConvId) ?? null

  // ---------------------------------------------------------------------------
  // Fetch conversations
  // ---------------------------------------------------------------------------
  const fetchConversations = useCallback(async () => {
    try {
      const where: Record<string, unknown> =
        statusFilter !== 'all' ? { status: { equals: statusFilter } } : {}
      const qs = new URLSearchParams({
        sort: '-lastMessageAt',
        limit: '50',
        depth: '1',
        where: JSON.stringify(where),
      })
      const res = await fetch(`/api/chat-conversations?${qs}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.docs ?? [])
      }
    } catch (err) {
      console.error('[ChatDashboard] fetchConversations error:', err)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  // ---------------------------------------------------------------------------
  // SSE for messages
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (sseRef.current) {
      sseRef.current.close()
      sseRef.current = null
    }

    if (!selectedConvId) {
      setMessages([])
      return
    }

    const es = new EventSource(`/api/chat/stream?conversationId=${selectedConvId}`)
    sseRef.current = es

    es.addEventListener('message', (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data)
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === msg.id)
          return exists ? prev : [...prev, msg]
        })
      } catch {}
    })

    es.addEventListener('connected', () => {
      // initial connection — messages will flow in via 'message' events
    })

    es.onerror = () => {
      // SSE reconnects automatically on error
    }

    return () => {
      es.close()
    }
  }, [selectedConvId])

  // ---------------------------------------------------------------------------
  // Auto-scroll
  // ---------------------------------------------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const sendAdminReply = async () => {
    if (!replyText.trim() || !selectedConvId) return
    setLoading(true)
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ conversationId: selectedConvId, content: replyText.trim() }),
      })
      if (res.ok) {
        setReplyText('')
        fetchConversations()
      }
    } finally {
      setLoading(false)
    }
  }

  const updateConvStatus = async (status: ConvStatus) => {
    if (!selectedConvId) return
    setLoading(true)
    try {
      await fetch(`/api/chat-conversations/${selectedConvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      fetchConversations()
    } finally {
      setLoading(false)
    }
  }

  const addTag = async () => {
    if (!newTag.trim() || !selectedConv) return
    const existingTags = (selectedConv.tags ?? []).map((t) => ({ tag: t.tag }))
    const updatedTags = [...existingTags, { tag: newTag.trim() }]
    setLoading(true)
    try {
      await fetch(`/api/chat-conversations/${selectedConvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tags: updatedTags }),
      })
      setNewTag('')
      fetchConversations()
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 80px)',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ── Left panel: conversation list ─────────────────────────── */}
      <div
        style={{
          width: 320,
          borderRight: '1px solid var(--theme-elevation-100)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid var(--theme-elevation-100)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Chat Dashboard</h2>
        </div>

        {/* Filter */}
        <div
          style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--theme-elevation-100)' }}
        >
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ConvStatus | 'all')}
            style={{
              width: '100%',
              padding: '0.375rem 0.75rem',
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: 4,
              background: 'var(--theme-bg)',
              color: 'var(--theme-text)',
              fontSize: '0.875rem',
            }}
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="admin_takeover">Admin tiếp quản</option>
            <option value="closed">Đã đóng</option>
          </select>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 && (
            <p
              style={{ padding: '1rem', color: 'var(--theme-elevation-500)', fontSize: '0.875rem' }}
            >
              Không có cuộc trò chuyện.
            </p>
          )}
          {conversations.map((conv) => {
            const isSelected = conv.id === selectedConvId
            const customerName =
              getUserName(conv.user) ??
              getUserEmail(conv.user) ??
              conv.guestId ??
              `Khách #${conv.id}`

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderBottom: '1px solid var(--theme-elevation-100)',
                  textAlign: 'left',
                  background: isSelected ? 'var(--theme-elevation-50)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{customerName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-400)' }}>
                    {formatDate(conv.lastMessageAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: 9999,
                      background: statusColor(conv.status as ConvStatus) + '22',
                      color: statusColor(conv.status as ConvStatus),
                      fontWeight: 600,
                    }}
                  >
                    {statusLabel(conv.status as ConvStatus)}
                  </span>
                  {conv.channel === 'zalo' && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: 9999,
                        background: '#0068ff22',
                        color: '#0068ff',
                        fontWeight: 600,
                      }}
                    >
                      Zalo
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-400)' }}>
                    {conv.messageCount ?? 0} tin
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right panel: message thread ──────────────────────────── */}
      {selectedConv ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Conv header */}
          <div
            style={{
              padding: '0.875rem 1.25rem',
              borderBottom: '1px solid var(--theme-elevation-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div>
              <strong style={{ fontSize: '1rem' }}>
                {getUserName(selectedConv.user) ??
                  getUserEmail(selectedConv.user) ??
                  selectedConv.guestId ??
                  `Khách #${selectedConv.id}`}
              </strong>
              <div
                style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500)', marginTop: 2 }}
              >
                Bắt đầu: {formatDate(selectedConv.startedAt)} · {formatTime(selectedConv.startedAt)}
                {selectedConv.channel === 'zalo' && (
                  <span
                    style={{
                      marginLeft: 8,
                      padding: '0 6px',
                      borderRadius: 9999,
                      background: '#0068ff22',
                      color: '#0068ff',
                      fontWeight: 600,
                    }}
                  >
                    Zalo
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedConv.status !== 'admin_takeover' && (
                <button
                  onClick={() => updateConvStatus('admin_takeover')}
                  disabled={loading}
                  style={{
                    padding: '0.375rem 0.875rem',
                    background: '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  Tiếp quản
                </button>
              )}
              {selectedConv.status === 'admin_takeover' && (
                <button
                  onClick={() => updateConvStatus('active')}
                  disabled={loading}
                  style={{
                    padding: '0.375rem 0.875rem',
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  Trả lại AI
                </button>
              )}
              {selectedConv.status !== 'closed' && (
                <button
                  onClick={() => updateConvStatus('closed')}
                  disabled={loading}
                  style={{
                    padding: '0.375rem 0.875rem',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  Đóng
                </button>
              )}
            </div>
          </div>

          {/* Customer info sidebar + messages */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user'
                const isAdmin = msg.role === 'admin'
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '0.625rem 0.875rem',
                        borderRadius: 8,
                        background: isUser
                          ? 'var(--theme-elevation-50)'
                          : isAdmin
                            ? '#0068ff'
                            : 'var(--theme-elevation-100)',
                        color: isAdmin ? '#fff' : 'var(--theme-text)',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {isAdmin && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            marginBottom: 4,
                            opacity: 0.8,
                          }}
                        >
                          {msg.senderName ?? 'Admin'}
                        </div>
                      )}
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          opacity: 0.6,
                          marginTop: 4,
                          textAlign: 'right',
                        }}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Right sidebar: customer info + tags */}
            <div
              style={{
                width: 240,
                borderLeft: '1px solid var(--theme-elevation-100)',
                padding: '1rem',
                flexShrink: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Customer info */}
              <div>
                <h4
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--theme-elevation-500)',
                  }}
                >
                  THÔNG TIN KHÁCH
                </h4>
                <div
                  style={{
                    fontSize: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  {getUserEmail(selectedConv.user) && (
                    <span>{getUserEmail(selectedConv.user)}</span>
                  )}
                  {selectedConv.zaloUserId && (
                    <span style={{ color: '#0068ff' }}>Zalo: {selectedConv.zaloUserId}</span>
                  )}
                  {!getUserEmail(selectedConv.user) && !getUserName(selectedConv.user) && (
                    <span style={{ color: 'var(--theme-elevation-400)' }}>Khách ẩn danh</span>
                  )}
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: 9999,
                      background: statusColor(selectedConv.status as ConvStatus) + '22',
                      color: statusColor(selectedConv.status as ConvStatus),
                      fontWeight: 600,
                      alignSelf: 'flex-start',
                      marginTop: 4,
                    }}
                  >
                    {statusLabel(selectedConv.status as ConvStatus)}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--theme-elevation-500)',
                  }}
                >
                  NHÃN
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.375rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  {(selectedConv.tags ?? []).map((t, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: 9999,
                        background: 'var(--theme-elevation-100)',
                        color: 'var(--theme-text)',
                      }}
                    >
                      {t.tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Thêm nhãn..."
                    style={{
                      flex: 1,
                      padding: '0.25rem 0.5rem',
                      border: '1px solid var(--theme-elevation-200)',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      background: 'var(--theme-bg)',
                      color: 'var(--theme-text)',
                    }}
                  />
                  <button
                    onClick={addTag}
                    disabled={loading || !newTag.trim()}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: 'var(--theme-elevation-800)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Assigned to */}
              {selectedConv.assignedTo && (
                <div>
                  <h4
                    style={{
                      margin: '0 0 0.25rem',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--theme-elevation-500)',
                    }}
                  >
                    PHÂN CÔNG
                  </h4>
                  <span style={{ fontSize: '0.875rem' }}>
                    {getUserName(selectedConv.assignedTo) ?? 'Admin'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin reply input (only in admin_takeover mode) */}
          {selectedConv.status === 'admin_takeover' && (
            <div
              style={{
                padding: '0.875rem 1.25rem',
                borderTop: '1px solid var(--theme-elevation-100)',
                display: 'flex',
                gap: '0.5rem',
                flexShrink: 0,
              }}
            >
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendAdminReply()}
                placeholder="Nhập tin nhắn trả lời..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.625rem 0.875rem',
                  border: '2px solid var(--theme-elevation-200)',
                  borderRadius: 6,
                  fontSize: '0.875rem',
                  background: 'var(--theme-bg)',
                  color: 'var(--theme-text)',
                }}
              />
              <button
                onClick={sendAdminReply}
                disabled={loading || !replyText.trim()}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#0068ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Gửi
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theme-elevation-400)',
          }}
        >
          <p>Chọn một cuộc trò chuyện để xem</p>
        </div>
      )}
    </div>
  )
}

export default ChatDashboard
