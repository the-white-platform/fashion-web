'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Minimize2, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'model'
  content: string
  isStreaming?: boolean
}

interface ProductContext {
  name: string
  category: string
  price: string
}

interface WolfiesChatbotProps {
  isOpen: boolean
  onClose: () => void
  productContext?: ProductContext
}

export function WolfiesChatbot({ isOpen, onClose, productContext }: WolfiesChatbotProps) {
  const t = useTranslations('chatbot')
  const locale = useLocale()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [errorType, setErrorType] = useState<'auth' | 'ratelimit' | 'generic' | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Avoid hydration mismatch — show timestamps only after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize welcome message when chat opens; reset when it closes
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: t('welcomeMessage'),
        },
      ])
      setErrorType(null)
    } else {
      // Abort any in-flight stream when closing
      abortControllerRef.current?.abort()
      setMessages([])
      setIsStreaming(false)
      setErrorType(null)
    }
  }, [isOpen, t])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [messages, isOpen, isMinimized, scrollToBottom])

  const quickReplies = [
    t('quickReply.outfitAdvice'),
    t('quickReply.sizeGuide'),
    t('quickReply.returnPolicy'),
    t('quickReply.bestSellers'),
  ]

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return

      setErrorType(null)

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
      }

      const streamingMsgId = `model-${Date.now()}`
      const streamingMsg: Message = {
        id: streamingMsgId,
        role: 'model',
        content: '',
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMsg, streamingMsg])
      setIsStreaming(true)
      setInputValue('')

      // Build conversation history to send (exclude the placeholder streaming message)
      const conversationHistory = messages
        .concat(userMsg)
        .filter((m) => !m.isStreaming && m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }))

      // Keep welcome for context but skip it if it's the only thing
      const historyToSend =
        conversationHistory.length === 0
          ? [{ role: 'user' as const, content: userMsg.content }]
          : conversationHistory

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ messages: historyToSend, productContext }),
          signal: controller.signal,
        })

        if (!response.ok) {
          if (response.status === 401) {
            setErrorType('auth')
          } else if (response.status === 429) {
            setErrorType('ratelimit')
          } else {
            setErrorType('generic')
          }
          // Remove the empty streaming placeholder
          setMessages((prev) => prev.filter((m) => m.id !== streamingMsgId))
          setIsStreaming(false)
          return
        }

        if (!response.body) {
          setErrorType('generic')
          setMessages((prev) => prev.filter((m) => m.id !== streamingMsgId))
          setIsStreaming(false)
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullContent += decoder.decode(value, { stream: true })
          setMessages((prev) =>
            prev.map((m) => (m.id === streamingMsgId ? { ...m, content: fullContent } : m)),
          )
        }

        // Mark streaming complete
        setMessages((prev) =>
          prev.map((m) => (m.id === streamingMsgId ? { ...m, isStreaming: false } : m)),
        )
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User closed chat; silently discard
          return
        }
        setErrorType('generic')
        setMessages((prev) => prev.filter((m) => m.id !== streamingMsgId))
      } finally {
        setIsStreaming(false)
      }
    },
    [isStreaming, messages, productContext],
  )

  const handleSend = () => {
    sendMessage(inputValue)
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed ${isMinimized ? 'bottom-24 right-6 w-80' : 'bottom-24 right-6 w-96'} bg-background rounded-sm shadow-2xl border-2 border-primary z-[100] flex flex-col transition-all duration-300 overflow-hidden`}
          style={{ height: isMinimized ? '64px' : '600px', maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-lg flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background rounded flex items-center justify-center shadow-lg">
                <span className="text-2xl">🐺</span>
              </div>
              <div>
                <h3 className="uppercase tracking-widest font-bold text-sm">{t('title')}</h3>
                <p className="text-[10px] text-primary-foreground/80 uppercase tracking-tighter">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-primary-foreground/10 rounded-sm transition-colors"
                title={isMinimized ? t('maximize') : t('minimize')}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary-foreground/10 rounded-sm transition-colors"
                title={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 scrollbar-hide min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-sm shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-foreground'
                      }`}
                    >
                      {message.isStreaming && message.content === '' ? (
                        // Typing indicator while waiting for first chunk
                        <div className="flex gap-1.5 py-1">
                          <div
                            className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-line leading-relaxed">
                          {message.content}
                          {message.isStreaming && (
                            <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />
                          )}
                        </p>
                      )}
                      {mounted && !message.isStreaming && (
                        <span className="text-[10px] opacity-60 mt-2 block font-medium">
                          {new Date().toLocaleTimeString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Error banners */}
                {errorType === 'auth' && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-4 rounded-sm bg-destructive/10 border border-destructive/30 text-sm">
                      <p className="text-foreground">{t('errorAuth')}</p>
                      <Link
                        href={`/${locale}/login`}
                        className="text-primary font-semibold underline underline-offset-2 mt-1 inline-block"
                      >
                        {t('loginLink')}
                      </Link>
                    </div>
                  </div>
                )}
                {errorType === 'ratelimit' && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-4 rounded-sm bg-orange-50 border border-orange-200 text-sm text-foreground">
                      {t('errorRateLimit')}
                    </div>
                  </div>
                )}
                {errorType === 'generic' && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-4 rounded-sm bg-destructive/10 border border-destructive/30 text-sm text-foreground">
                      {t('errorGeneric')}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="p-3 bg-background border-t border-border overflow-x-auto flex-shrink-0">
                <div className="flex gap-2 pb-1">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      disabled={isStreaming}
                      className="text-[10px] whitespace-nowrap px-3 py-2 border border-border rounded-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-all uppercase font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 bg-background border-t border-border rounded-b-sm flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('inputPlaceholder')}
                    disabled={isStreaming}
                    className="flex-1 px-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-primary transition-colors text-sm bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-60"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isStreaming || !inputValue.trim()}
                    className="p-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
