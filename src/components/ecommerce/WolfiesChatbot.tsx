'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Minimize2, Maximize2, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface WolfiesChatbotProps {
  isOpen: boolean
  onClose: () => void
}

export function WolfiesChatbot({ isOpen, onClose }: WolfiesChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize welcome message on client mount to avoid hydration mismatch
  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setMessages([
        {
          id: 1,
          text: 'Xin chào! Mình là Wolfies - trợ lý ảo của TheWhite 🐺\n\nMình có thể giúp bạn:\n• Tìm sản phẩm phù hợp\n• Tư vấn size\n• Chính sách đổi trả\n• Hỗ trợ đặt hàng\n\nBạn cần mình hỗ trợ gì nào?',
          sender: 'bot',
          timestamp: new Date(),
        },
      ])
    }
  }, [mounted])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const quickReplies = [
    'Tìm áo thể thao',
    'Hướng dẫn chọn size',
    'Chính sách đổi trả',
    'Kiểm tra đơn hàng',
  ]

  const botResponses: { [key: string]: string } = {
    'tìm áo':
      'Chúng mình có nhiều mẫu áo thể thao cao cấp:\n\n✓ Áo thun tập gym\n✓ Áo ba lỗ thể thao\n✓ Áo chạy bộ\n✓ Áo bóng đá\n\nBạn muốn xem loại nào ạ?',
    size: 'Để chọn size phù hợp, bạn có thể:\n\n1️⃣ Xem bảng size chi tiết trên mỗi sản phẩm\n2️⃣ Dùng tính năng AI Size Selection\n3️⃣ Liên hệ hotline: 0123 456 789\n\nBạn cao bao nhiêu và nặng bao nhiêu kg để mình tư vấn nhé!',
    'đổi trả':
      'Chính sách đổi trả của TheWhite:\n\n✓ Đổi size miễn phí trong 7 ngày\n✓ Hoàn tiền 100% nếu lỗi nhà sản xuất\n✓ Miễn phí vận chuyển đổi trả\n\nSản phẩm cần còn nguyên tem mác và chưa qua sử dụng nhé!',
    'đơn hàng':
      'Để kiểm tra đơn hàng, bạn cần:\n\n📧 Mã đơn hàng (trong email xác nhận)\n📱 Số điện thoại đặt hàng\n\nBạn có thể gửi mã đơn hàng cho mình hoặc liên hệ:\n• Hotline: 0123 456 789\n• Email: support@thewhite.vn',
    giá: 'Sản phẩm TheWhite có giá từ:\n\n👕 Áo: 299,000đ - 599,000đ\n👖 Quần: 399,000đ - 799,000đ\n🎽 Bộ đồ: 699,000đ - 1,299,000đ\n\nHiện đang có nhiều ưu đãi hấp dẫn! Bạn muốn xem sản phẩm nào?',
    'mặc định':
      'Cảm ơn bạn đã nhắn tin! 😊\n\nMình chưa hiểu rõ câu hỏi của bạn lắm. Bạn có thể:\n\n• Chọn câu hỏi gợi ý bên dưới\n• Liên hệ trực tiếp qua:\n  - Hotline: 0123 456 789\n  - Email: support@thewhite.vn\n  - Zalo: 0123456789',
  }

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('áo') || lowerMessage.includes('tìm')) {
      return botResponses['tìm áo']
    }
    if (lowerMessage.includes('size') || lowerMessage.includes('chọn')) {
      return botResponses['size']
    }
    if (
      lowerMessage.includes('đổi') ||
      lowerMessage.includes('trả') ||
      lowerMessage.includes('hoàn')
    ) {
      return botResponses['đổi trả']
    }
    if (
      lowerMessage.includes('đơn') ||
      lowerMessage.includes('kiểm tra') ||
      lowerMessage.includes('order')
    ) {
      return botResponses['đơn hàng']
    }
    if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu')) {
      return botResponses['giá']
    }

    return botResponses['mặc định']
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(
      () => {
        const botMessage: Message = {
          id: messages.length + 2,
          text: getBotResponse(inputValue),
          sender: 'bot',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleQuickReply = (reply: string) => {
    setInputValue(reply)
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
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background rounded flex items-center justify-center shadow-lg">
                <span className="text-2xl">🐺</span>
              </div>
              <div>
                <h3 className="uppercase tracking-widest font-bold text-sm">Wolfies</h3>
                <p className="text-[10px] text-primary-foreground/80 uppercase tracking-tighter">
                  Trợ lý ảo TheWhite
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-primary-foreground/10 rounded-sm transition-colors"
                title={isMinimized ? 'Phóng to' : 'Thu nhỏ'}
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
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 scrollbar-hide">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-sm shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                      {mounted && (
                        <span className="text-[10px] opacity-60 mt-2 block font-medium">
                          {message.timestamp.toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border p-4 rounded-sm">
                      <div className="flex gap-1.5">
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
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="p-3 bg-background border-t border-border overflow-x-auto">
                <div className="flex gap-2 pb-1">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="text-[10px] whitespace-nowrap px-3 py-2 border border-border rounded-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-all uppercase font-bold tracking-wider"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 bg-background border-t border-border rounded-b-sm">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-primary transition-colors text-sm bg-background text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleSend}
                    className="p-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors shadow-lg"
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
