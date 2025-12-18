'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import { useUser } from '@/contexts/UserContext'
import { Logo } from '@/components/Logo/Logo'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useUser()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = (): boolean => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return false
    }

    if (!formData.email.includes('@')) {
      setError('Email không hợp lệ')
      return false
    }

    if (formData.phone.length < 10) {
      setError('Số điện thoại không hợp lệ')
      return false
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return false
    }

    if (!acceptTerms) {
      setError('Vui lòng đồng ý với Điều Khoản Sử Dụng')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Try to register
    const success = await register(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone,
    )

    setTimeout(() => {
      setIsLoading(false)
      if (success) {
        router.push('/profile')
      } else {
        setError('Email đã được sử dụng. Vui lòng sử dụng email khác.')
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Logo showSlogan={false} className="items-center justify-center" />
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-sm mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl uppercase tracking-wide mb-2">Đăng Ký</h1>
          <p className="text-gray-600">Tạo tài khoản TheWhite của bạn</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-sm text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm uppercase tracking-wide mb-2">
              Họ và Tên
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm uppercase tracking-wide mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm uppercase tracking-wide mb-2">
              Số Điện Thoại
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors"
                placeholder="0123 456 789"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm uppercase tracking-wide mb-2">
              Mật Khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Tối thiểu 8 ký tự</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm uppercase tracking-wide mb-2">
              Xác Nhận Mật Khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-5 h-5 rounded mt-0.5 flex-shrink-0"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <Link href="/terms-of-use" className="text-black underline hover:text-gray-700">
                Điều Khoản Sử Dụng
              </Link>{' '}
              và{' '}
              <Link href="/privacy-policy" className="text-black underline hover:text-gray-700">
                Chính Sách Bảo Mật
              </Link>{' '}
              của TheWhite
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Đăng Ký</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 uppercase tracking-wide">Hoặc</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Đã có tài khoản?</p>
            <Link
              href="/login"
              className="w-full block border-2 border-black text-black py-4 rounded-sm hover:bg-gray-100 transition-colors uppercase tracking-wider text-center"
            >
              Đăng Nhập
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
