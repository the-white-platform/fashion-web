'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Ruler, User, Weight, Sparkles, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const sizeCharts = {
  men: {
    shirt: [
      { size: 'XS', chest: '86-90', waist: '74-78', height: '160-165', weight: '50-55' },
      { size: 'S', chest: '90-94', waist: '78-82', height: '165-170', weight: '55-62' },
      { size: 'M', chest: '94-98', waist: '82-86', height: '170-175', weight: '62-70' },
      { size: 'L', chest: '98-102', waist: '86-90', height: '175-180', weight: '70-78' },
      { size: 'XL', chest: '102-106', waist: '90-94', height: '180-185', weight: '78-86' },
      { size: '2XL', chest: '106-112', waist: '94-100', height: '185-190', weight: '86-95' },
    ],
    pants: [
      { size: 'XS', waist: '74-78', hip: '86-90', length: '95-98', height: '160-165' },
      { size: 'S', waist: '78-82', hip: '90-94', length: '98-101', height: '165-170' },
      { size: 'M', waist: '82-86', hip: '94-98', length: '101-104', height: '170-175' },
      { size: 'L', waist: '86-90', hip: '98-102', length: '104-107', height: '175-180' },
      { size: 'XL', waist: '90-94', hip: '102-106', length: '107-110', height: '180-185' },
      { size: '2XL', waist: '94-100', hip: '106-112', length: '110-113', height: '185-190' },
    ],
  },
  women: {
    shirt: [
      { size: 'XS', chest: '80-84', waist: '60-64', height: '150-155', weight: '42-48' },
      { size: 'S', chest: '84-88', waist: '64-68', height: '155-160', weight: '48-54' },
      { size: 'M', chest: '88-92', waist: '68-72', height: '160-165', weight: '54-60' },
      { size: 'L', chest: '92-96', waist: '72-76', height: '165-170', weight: '60-67' },
      { size: 'XL', chest: '96-100', waist: '76-80', height: '170-175', weight: '67-74' },
      { size: '2XL', chest: '100-106', waist: '80-86', height: '175-180', weight: '74-82' },
    ],
    pants: [
      { size: 'XS', waist: '60-64', hip: '84-88', length: '90-93', height: '150-155' },
      { size: 'S', waist: '64-68', hip: '88-92', length: '93-96', height: '155-160' },
      { size: 'M', waist: '68-72', hip: '92-96', length: '96-99', height: '160-165' },
      { size: 'L', waist: '72-76', hip: '96-100', length: '99-102', height: '165-170' },
      { size: 'XL', waist: '76-80', hip: '100-104', length: '102-105', height: '170-175' },
      { size: '2XL', waist: '80-86', hip: '104-110', length: '105-108', height: '175-180' },
    ],
  },
}

export default function SizeGuidePage() {
  const router = useRouter()
  const [gender, setGender] = useState<'men' | 'women'>('men')
  const [productType, setProductType] = useState<'shirt' | 'pants'>('shirt')

  // AI Size Calculator
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [chest, setChest] = useState('')
  const [waist, setWaist] = useState('')
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number>(0)

  const calculateSize = () => {
    const h = parseInt(height)
    const w = parseInt(weight)
    const c = parseInt(chest) || 0
    const wa = parseInt(waist) || 0

    if (!h || !w) {
      alert('Vui lòng nhập chiều cao và cân nặng!')
      return
    }

    // Simple AI algorithm based on measurements
    const chart = sizeCharts[gender][productType]

    let bestMatch = chart[2] // Default to M
    let bestScore = 0

    chart.forEach((sizeData) => {
      let score = 0
      const [heightMin, heightMax] = sizeData.height.split('-').map(Number)
      const weightRange =
        productType === 'shirt' && 'weight' in sizeData
          ? sizeData.weight!.split('-').map(Number)
          : [0, 999]
      const [weightMin, weightMax] = weightRange

      // Height matching (40% weight)
      if (h >= heightMin && h <= heightMax) score += 40
      else score += Math.max(0, 40 - Math.abs(h - (heightMin + heightMax) / 2) / 2)

      // Weight matching (30% weight)
      if (productType === 'shirt' && w >= weightMin && w <= weightMax) score += 30
      else if (productType === 'shirt')
        score += Math.max(0, 30 - Math.abs(w - (weightMin + weightMax) / 2) / 5)

      // Chest matching (15% weight)
      if (c > 0 && 'chest' in sizeData) {
        const [chestMin, chestMax] = sizeData.chest.split('-').map(Number)
        if (c >= chestMin && c <= chestMax) score += 15
        else score += Math.max(0, 15 - Math.abs(c - (chestMin + chestMax) / 2) / 3)
      } else {
        score += 7.5 // Half points if not provided
      }

      // Waist matching (15% weight)
      if (wa > 0) {
        const [waistMin, waistMax] = sizeData.waist.split('-').map(Number)
        if (wa >= waistMin && wa <= waistMax) score += 15
        else score += Math.max(0, 15 - Math.abs(wa - (waistMin + waistMax) / 2) / 3)
      } else {
        score += 7.5 // Half points if not provided
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = sizeData
      }
    })

    setRecommendedSize(bestMatch.size)
    setConfidence(Math.round(bestScore))

    // Smooth scroll to result
    setTimeout(() => {
      document.getElementById('ai-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const resetCalculator = () => {
    setHeight('')
    setWeight('')
    setChest('')
    setWaist('')
    setRecommendedSize(null)
    setConfidence(0)
  }

  const currentChart = sizeCharts[gender][productType]

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 pt-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Hướng Dẫn Chọn Size</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide">Hướng Dẫn Chọn Size</h1>
          <p className="text-muted-foreground text-lg">
            Tìm size hoàn hảo với công nghệ AI thông minh
          </p>
        </motion.div>

        {/* AI Size Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-foreground to-foreground/80 text-background border-2 border-foreground rounded-sm p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-3xl uppercase tracking-wide">Chọn Size Thông Minh AI</h2>
          </div>
          <p className="opacity-80 mb-8">
            Công nghệ AI phân tích số đo của bạn để gợi ý size chính xác nhất
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-background text-foreground rounded-sm p-6 space-y-6">
              {/* Gender Selection */}
              <div>
                <label className="block text-sm uppercase tracking-wide mb-3">Giới Tính</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGender('men')}
                    className={`py-3 border-2 rounded-sm transition-all ${
                      gender === 'men'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-border hover:border-foreground'
                    }`}
                  >
                    Nam
                  </button>
                  <button
                    onClick={() => setGender('women')}
                    className={`py-3 border-2 rounded-sm transition-all ${
                      gender === 'women'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-border hover:border-foreground'
                    }`}
                  >
                    Nữ
                  </button>
                </div>
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm uppercase tracking-wide mb-3">Loại Sản Phẩm</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setProductType('shirt')}
                    className={`py-3 border-2 rounded-sm transition-all ${
                      productType === 'shirt'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-border hover:border-foreground'
                    }`}
                  >
                    Áo
                  </button>
                  <button
                    onClick={() => setProductType('pants')}
                    className={`py-3 border-2 rounded-sm transition-all ${
                      productType === 'pants'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-border hover:border-foreground'
                    }`}
                  >
                    Quần
                  </button>
                </div>
              </div>

              {/* Measurements */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm uppercase tracking-wide mb-2">
                    Chiều Cao (cm) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="170"
                      className="w-full pl-10 pr-3 py-3 border-2 border-border rounded-sm outline-none focus:border-foreground transition-colors bg-background text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-wide mb-2">
                    Cân Nặng (kg) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="65"
                      className="w-full pl-10 pr-3 py-3 border-2 border-border rounded-sm outline-none focus:border-foreground transition-colors bg-background text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-wide mb-2">
                    Vòng Ngực (cm)
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="number"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      placeholder="90"
                      className="w-full pl-10 pr-3 py-3 border-2 border-border rounded-sm outline-none focus:border-foreground transition-colors bg-background text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-wide mb-2">Vòng Eo (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="number"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder="80"
                      className="w-full pl-10 pr-3 py-3 border-2 border-border rounded-sm outline-none focus:border-foreground transition-colors bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Bắt buộc. Các thông số khác giúp kết quả
                chính xác hơn.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={calculateSize}
                  className="flex-1 bg-foreground text-background py-3 rounded-sm hover:opacity-90 transition-all uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Tính Size AI
                </button>
                <button
                  onClick={resetCalculator}
                  className="px-6 border-2 border-border bg-background text-foreground py-3 rounded-sm hover:border-foreground transition-all uppercase tracking-wide"
                >
                  Làm Mới
                </button>
              </div>
            </div>

            {/* Result */}
            <div id="ai-result" className="bg-background text-foreground rounded-sm p-6">
              {recommendedSize ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-24 h-24 bg-foreground text-background rounded-full flex items-center justify-center mx-auto text-4xl font-bold">
                    {recommendedSize}
                  </div>
                  <div>
                    <h3 className="text-2xl uppercase tracking-wide mb-2">Size Đề Xuất</h3>
                    <p className="text-muted-foreground mb-4">
                      Độ tin cậy: <span className="font-bold text-foreground">{confidence}%</span>
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {confidence >= 80 ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-600 font-medium">Rất phù hợp</span>
                        </>
                      ) : confidence >= 60 ? (
                        <>
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <span className="text-yellow-600 font-medium">Khá phù hợp</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-5 h-5 text-orange-600" />
                          <span className="text-orange-600 font-medium">Tham khảo</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/products?size=${recommendedSize}`)}
                    className="w-full mt-4 py-3 border-2 border-foreground bg-background text-foreground rounded-sm hover:bg-foreground hover:text-background transition-all uppercase tracking-wide"
                  >
                    Xem Sản Phẩm Size {recommendedSize}
                  </button>
                </motion.div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nhập thông tin để nhận gợi ý size</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Size Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-muted rounded-sm p-8"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-2xl uppercase tracking-wide">Bảng Size Chi Tiết</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setGender('men')}
                className={`px-4 py-2 rounded-sm border-2 transition-all uppercase tracking-wide text-sm ${
                  gender === 'men'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:border-foreground'
                }`}
              >
                Nam
              </button>
              <button
                onClick={() => setGender('women')}
                className={`px-4 py-2 rounded-sm border-2 transition-all uppercase tracking-wide text-sm ${
                  gender === 'women'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:border-foreground'
                }`}
              >
                Nữ
              </button>
            </div>
          </div>

          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setProductType('shirt')}
              className={`px-4 py-2 rounded-sm border-2 transition-all uppercase tracking-wide text-sm ${
                productType === 'shirt'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              Áo
            </button>
            <button
              onClick={() => setProductType('pants')}
              className={`px-4 py-2 rounded-sm border-2 transition-all uppercase tracking-wide text-sm ${
                productType === 'pants'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              Quần
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-foreground text-background">
                  <th className="border border-border px-4 py-3 text-left uppercase tracking-wide">
                    Size
                  </th>
                  {productType === 'shirt' ? (
                    <>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        Vòng Ngực (cm)
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        Vòng Eo (cm)
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        Chiều Cao (cm)
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        Cân Nặng (kg)
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        Vòng Eo (cm)
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        Vòng Mông (cm)
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        Chiều Dài (cm)
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        Chiều Cao (cm)
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentChart.map((row, index) => (
                  <tr key={row.size} className={index % 2 === 0 ? 'bg-muted/50' : 'bg-background'}>
                    <td className="border border-border px-4 py-3 font-bold">{row.size}</td>
                    {productType === 'shirt' ? (
                      <>
                        <td className="border border-border px-4 py-3 text-center">{row.chest}</td>
                        <td className="border border-border px-4 py-3 text-center">{row.waist}</td>
                        <td className="border border-border px-4 py-3 text-center">{row.height}</td>
                        <td className="border border-border px-4 py-3 text-center">
                          {'weight' in row ? row.weight : '-'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-border px-4 py-3 text-center">{row.waist}</td>
                        <td className="border border-border px-4 py-3 text-center">{row.hip}</td>
                        <td className="border border-border px-4 py-3 text-center">{row.length}</td>
                        <td className="border border-border px-4 py-3 text-center">{row.height}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-foreground text-background rounded-sm p-8"
        >
          <h3 className="text-2xl uppercase tracking-wide mb-6">💡 Mẹo Chọn Size</h3>
          <div className="grid md:grid-cols-2 gap-6 opacity-80">
            <div>
              <h4 className="opacity-100 font-semibold mb-2">Đo Chính Xác</h4>
              <p className="text-sm">
                Đo số đo khi mặc đồ lót, đứng thẳng và thở bình thường. Sử dụng thước dây mềm.
              </p>
            </div>
            <div>
              <h4 className="opacity-100 font-semibold mb-2">Kích Thước Cơ Thể</h4>
              <p className="text-sm">
                Nếu số đo của bạn nằm giữa 2 size, chọn size lớn hơn để thoải mái hơn.
              </p>
            </div>
            <div>
              <h4 className="opacity-100 font-semibold mb-2">Kiểu Dáng</h4>
              <p className="text-sm">
                Áo oversize nên chọn size nhỏ hơn 1-2 size so với size thường.
              </p>
            </div>
            <div>
              <h4 className="opacity-100 font-semibold mb-2">Đổi Size Miễn Phí</h4>
              <p className="text-sm">
                Chúng tôi hỗ trợ đổi size miễn phí trong 30 ngày. Đừng ngại thử!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
