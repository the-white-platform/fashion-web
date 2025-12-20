'use client'

import { useState, useEffect } from 'react'
import { Upload, User, Ruler, Weight, ChevronDown, Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'

interface VirtualTryOnModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: number | string
    name: string
    image: string
    priceDisplay?: string
  }
}

export function VirtualTryOnModal({ isOpen, onClose, product }: VirtualTryOnModalProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [gender, setGender] = useState('')
  const [notes, setNotes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = () => {
    if (!uploadedImage || !height || !weight || !gender) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    setIsGenerating(true)
    // Simulate AI processing
    setTimeout(() => {
      setResult(uploadedImage) // In real app, this would be the AI-generated result
      setIsGenerating(false)
    }, 3000)
  }

  const handleReset = () => {
    setResult(null)
    setUploadedImage(null)
    setHeight('')
    setWeight('')
    setGender('')
    setNotes('')
  }

  const isFormComplete = uploadedImage && height && weight && gender

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto my-8 rounded-none border-4 border-black"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black text-white rounded-none flex items-center justify-center hover:bg-gray-800 transition-all hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="text-center pt-16 pb-12 px-6 border-b-2 border-gray-100">
              <div className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-none mb-6 shadow-xl">
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                <span className="text-xs font-bold tracking-[0.3em] uppercase">
                  TheWhite AI Lab
                </span>
              </div>
              <h2 className="text-5xl lg:text-6xl uppercase mb-4 font-bold italic tracking-tighter italic">
                Thử Đồ <span className="text-gray-400">Ảo</span>
              </h2>
              <p className="text-gray-500 font-medium tracking-wide">
                Trải nghiệm công nghệ AI Try-On độc quyền từ TheWhite
              </p>
            </div>

            {/* Main Content */}
            <div className="p-8 lg:p-12 space-y-12">
              {/* Top Section - Product and Body Info */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Step 1: Product Preview */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-none p-8 relative overflow-hidden group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-black text-white rounded-none flex items-center justify-center font-bold shadow-lg">
                      <span className="text-sm">01</span>
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-widest italic">
                      Sản Phẩm Đã Chọn
                    </h3>
                  </div>

                  <div className="border-4 border-black rounded-none p-4 bg-white shadow-2xl relative aspect-[3/4] max-w-sm mx-auto overflow-hidden">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white p-4">
                      <p className="text-xs font-bold uppercase tracking-widest line-clamp-1">
                        {product.name}
                      </p>
                      {product.priceDisplay && (
                        <p className="text-sm font-bold mt-1 text-yellow-500">
                          {product.priceDisplay}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: Body Info */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-none p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-black text-white rounded-none flex items-center justify-center font-bold shadow-lg">
                      <span className="text-sm">03</span>
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-widest italic">
                      Thông Tin Số Đo
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Height */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-gray-500">
                          Chiều cao (cm)
                        </label>
                        <div className="relative">
                          <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="170"
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 bg-white rounded-none outline-none focus:border-black transition-all font-bold"
                          />
                        </div>
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-gray-500">
                          Cân nặng (kg)
                        </label>
                        <div className="relative">
                          <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="65"
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 bg-white rounded-none outline-none focus:border-black transition-all font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-gray-500">
                        Giới tính
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 bg-white rounded-none outline-none focus:border-black transition-all appearance-none font-bold uppercase tracking-widest text-sm"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-gray-500">
                        Ghi chú đặc biệt (tùy chọn)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ví dụ: Tôi thích form áo rộng rãi hơn..."
                        rows={4}
                        className="w-full px-5 py-4 border-2 border-gray-200 bg-white rounded-none outline-none focus:border-black transition-all focus:ring-0 resize-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Upload and Result Side by Side */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Step 2: Upload Photo */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-none p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-black text-white rounded-none flex items-center justify-center font-bold shadow-lg">
                      <span className="text-sm">02</span>
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-widest italic">
                      Tải Ảnh Của Bạn
                    </h3>
                  </div>

                  <label className="border-4 border-dashed border-gray-300 bg-white rounded-none p-12 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all min-h-[450px] group relative overflow-hidden shadow-inner">
                    {uploadedImage ? (
                      <>
                        <div className="relative w-full h-full max-h-[350px] aspect-[3/4]">
                          <Image
                            src={uploadedImage}
                            alt="Uploaded"
                            fill
                            className="object-contain rounded-none shadow-2xl"
                          />
                        </div>
                        <div className="mt-6 flex items-center gap-2 bg-black text-white px-4 py-2 uppercase text-[10px] font-bold tracking-widest">
                          <Upload className="w-3 h-3" />
                          Thay đổi ảnh
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-lg font-bold uppercase tracking-widest mb-2">
                          Tải Ảnh Toàn Thân
                        </p>
                        <p className="text-xs text-gray-400 text-center max-w-[250px] font-medium leading-relaxed">
                          Sử dụng ảnh đứng thẳng, rõ nét, nền trơn để có kết quả chính xác nhất vượt
                          mong đợi
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Result Panel */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-none p-8 relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-black text-white rounded-none flex items-center justify-center font-bold shadow-lg animate-pulse">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-widest italic">
                      Kết Quả AI TRy-On
                    </h3>
                  </div>

                  <div className="bg-white border-4 border-black rounded-none p-12 flex flex-col items-center justify-center min-h-[450px] relative shadow-2xl overflow-hidden">
                    {result ? (
                      <div className="w-full space-y-6 text-center">
                        <div className="relative w-full h-[350px] aspect-[3/4]">
                          <Image
                            src={result}
                            alt="Virtual Try-On Result"
                            fill
                            className="object-contain rounded-none shadow-xl"
                          />
                        </div>
                        <div className="inline-block bg-green-500 text-white px-4 py-2 uppercase text-[10px] font-bold tracking-widest animate-bounce">
                          Độ chính xác 98%
                        </div>
                        <p className="text-sm font-bold uppercase tracking-wider text-black italic">
                          Bạn trông thật tuyệt vời trong thiết kế của TheWhite!
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-gray-300 shadow-inner">
                          <Sparkles className="w-12 h-12 text-gray-300" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold uppercase tracking-widest italic">
                            Chờ Xử Lý AI
                          </h4>
                          <p className="text-xs text-gray-400 max-w-[280px] mx-auto font-medium leading-relaxed">
                            {uploadedImage
                              ? 'Nhấn nút "Tạo Thử Đồ Ảo" để bắt đầu quá trình mô phỏng'
                              : 'Hãy hoàn thiện các bước trước đó để đánh thức AI'}
                          </p>
                        </div>
                        {isGenerating && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                              <div className="w-24 h-24 border-8 border-gray-100 border-t-black rounded-full animate-spin" />
                              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-yellow-500 animate-pulse" />
                            </div>
                            <div className="text-center">
                              <p className="font-bold uppercase tracking-[0.4em] text-sm animate-pulse">
                                Đang Phân Tích Cơ Thể...
                              </p>
                              <p className="text-[10px] text-gray-500 mt-2 uppercase font-medium">
                                Vui lòng không đóng cửa sổ này
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                {result ? (
                  <>
                    <button
                      onClick={handleReset}
                      className="border-4 border-black px-12 py-5 rounded-none hover:bg-black hover:text-white transition-all uppercase tracking-[0.2em] font-bold text-sm shadow-xl"
                    >
                      Thử Lại Với Ảnh Khác
                    </button>
                    <button
                      onClick={onClose}
                      className="bg-black text-white px-12 py-5 rounded-none hover:bg-gray-800 transition-all uppercase tracking-[0.2em] font-bold text-sm shadow-xl"
                    >
                      Xong & Đóng
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!isFormComplete || isGenerating}
                    className={`px-16 py-6 rounded-none uppercase tracking-[0.4em] font-black transition-all text-sm shadow-2xl relative group overflow-hidden ${
                      isFormComplete && !isGenerating
                        ? 'bg-black text-white hover:scale-105 active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-4">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        AI Đang Làm Việc...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <Sparkles className="w-5 h-5 text-yellow-500 group-hover:rotate-12 transition-transform" />
                        Tạo Thử Đồ Ảo Ngay
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-8 bg-black text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] text-center border-t-2 border-white/5">
              AI TRY-ON là công nghệ mô phỏng, kết quả có thể chênh lệch 2-5% so với thực tế.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
