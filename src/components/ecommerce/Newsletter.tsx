'use client'

import { Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmail('')
    }, 3000)
  }

  return (
    <section className="py-20 bg-gray-950 text-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <Mail className="w-12 h-12 mx-auto mb-6" />

          <h2 className="text-3xl lg:text-4xl uppercase mb-4">Đăng Ký Nhận Tin</h2>

          <p className="text-gray-400 mb-8">
            Nhận thông tin về sản phẩm mới, ưu đãi đặc biệt và cập nhật từ TheWhite
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
          >
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-4 bg-black border-2 border-gray-700 text-white outline-none focus:border-white transition-colors rounded-sm placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={submitted}
              className="bg-white text-black px-8 py-4 rounded-sm hover:bg-gray-200 transition-all hover:scale-105 whitespace-nowrap disabled:opacity-50"
            >
              {submitted ? 'Đã Đăng Ký!' : 'Đăng Ký'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            Chúng tôi cam kết bảo vệ thông tin của bạn. Bạn có thể hủy đăng ký bất cứ lúc nào.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
