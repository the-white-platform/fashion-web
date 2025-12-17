'use client'

import { useState } from 'react'
import { Star, ThumbsUp, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  title: string
  comment: string
  date: string
  verified: boolean
  helpful: number
  images?: string[]
  size?: string
  fit?: 'tight' | 'perfect' | 'loose'
  height?: string
  weight?: string
}

interface ProductReviewsProps {
  productId: number
  productName: string
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user } = useUser()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent')
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')

  // Mock reviews data
  const mockReviews: Review[] = [
    {
      id: '1',
      userId: '123',
      userName: 'Nguyễn Văn A',
      rating: 5,
      title: 'Chất lượng tuyệt vời!',
      comment:
        'Áo rất đẹp, vải mát, form chuẩn. Tôi cao 1m75, nặng 68kg mặc size M vừa vặn. Rất hài lòng với sản phẩm này.',
      date: '2024-12-10',
      verified: true,
      helpful: 12,
      size: 'M',
      fit: 'perfect',
      height: '175cm',
      weight: '68kg',
    },
    {
      id: '2',
      userId: '456',
      userName: 'Trần Thị B',
      rating: 4,
      title: 'Tốt nhưng hơi nhỏ',
      comment:
        'Chất vải ok, thiết kế đẹp nhưng mình thấy size hơi nhỏ so với bảng size. Nên lên size để thoải mái hơn.',
      date: '2024-12-08',
      verified: true,
      helpful: 8,
      size: 'L',
      fit: 'tight',
      height: '170cm',
      weight: '65kg',
    },
    {
      id: '3',
      userId: '789',
      userName: 'Lê Minh C',
      rating: 5,
      title: 'Đáng tiền!',
      comment:
        'Mua lần 2 rồi, chất lượng ổn định. Giặt nhiều không ra màu, không nhăn. Ship nhanh, đóng gói cẩn thận.',
      date: '2024-12-05',
      verified: true,
      helpful: 15,
      size: 'L',
      fit: 'perfect',
    },
  ]

  const [reviews, setReviews] = useState<Review[]>(mockReviews)

  // Check if user has purchased this product
  const hasPurchased =
    user?.orderHistory?.some((order) =>
      order.items?.some((item: any) => item.productId === productId),
    ) ?? false

  // Check if user already reviewed
  const hasReviewed = reviews.some((review) => review.userId === user?.id)

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const filteredAndSortedReviews = () => {
    let filtered = reviews

    // Filter by rating
    if (filterRating !== 'all') {
      filtered = filtered.filter((r) => r.rating === filterRating)
    }

    // Sort
    switch (sortBy) {
      case 'helpful':
        return [...filtered].sort((a, b) => b.helpful - a.helpful)
      case 'rating':
        return [...filtered].sort((a, b) => b.rating - a.rating)
      case 'recent':
      default:
        return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  }

  const averageRating = calculateAverageRating()
  const distribution = getRatingDistribution()
  const totalReviews = reviews.length

  const StarRating = ({ rating, size = 'w-5 h-5' }: { rating: number; size?: string }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl uppercase tracking-wide mb-2">Đánh Giá & Nhận Xét</h2>
          <p className="text-gray-600">Từ khách hàng đã mua {productName}</p>
        </div>

        {/* Rating Summary */}
        <div className="bg-gray-50 rounded-sm p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-end justify-center md:justify-start gap-4 mb-4">
                <div className="text-6xl">{averageRating}</div>
                <div className="pb-2">
                  <StarRating rating={Math.round(parseFloat(averageRating))} />
                  <p className="text-sm text-gray-600 mt-1">{totalReviews} đánh giá</p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = distribution[rating as keyof typeof distribution]
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

                return (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(filterRating === rating ? 'all' : rating)}
                    className={`flex items-center gap-3 w-full group hover:bg-gray-100 rounded-sm p-2 transition-colors ${
                      filterRating === rating ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 h-2 rounded-sm overflow-hidden">
                      <Progress value={percentage} className="h-full bg-yellow-400" />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Write Review Button */}
        {user && (
          <div className="mb-8">
            {hasPurchased ? (
              hasReviewed ? (
                <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-900">Bạn đã đánh giá sản phẩm này</span>
                </div>
              ) : (
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full md:w-auto bg-black text-white hover:bg-gray-800 uppercase tracking-wide"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span>Viết Đánh Giá</span>
                </Button>
              )
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-900">
                  Chỉ khách hàng đã mua sản phẩm mới có thể đánh giá
                </span>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-sm p-4 text-center">
            <p className="text-gray-600">
              <Link href="/login" className="text-black underline hover:text-gray-700">
                Đăng nhập
              </Link>{' '}
              để viết đánh giá
            </p>
          </div>
        )}

        {/* Review Form */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <ReviewForm
                onSubmit={(review) => {
                  setReviews([review, ...reviews])
                  setShowReviewForm(false)
                }}
                onCancel={() => setShowReviewForm(false)}
                productId={productId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm uppercase tracking-wide">Sắp xếp:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mới nhất</SelectItem>
                <SelectItem value="helpful">Hữu ích nhất</SelectItem>
                <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filterRating !== 'all' && (
            <Button
              variant="link"
              onClick={() => setFilterRating('all')}
              className="text-gray-600 hover:text-black underline"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredAndSortedReviews().map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {filteredAndSortedReviews().length === 0 && (
          <div className="text-center py-12 text-gray-500">Chưa có đánh giá nào</div>
        )}
      </div>
    </div>
  )
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(review.helpful)
  const [hasVoted, setHasVoted] = useState(false)

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpful(helpful + 1)
      setHasVoted(true)
    }
  }

  const getFitLabel = (fit?: string) => {
    switch (fit) {
      case 'tight':
        return { label: 'Hơi chật', color: 'text-orange-600 bg-orange-50' }
      case 'perfect':
        return { label: 'Vừa vặn', color: 'text-green-600 bg-green-50' }
      case 'loose':
        return { label: 'Hơi rộng', color: 'text-blue-600 bg-blue-50' }
      default:
        return null
    }
  }

  const fitInfo = getFitLabel(review.fit)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-sm p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center uppercase">
            {review.userName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="uppercase tracking-wide">{review.userName}</span>
              {review.verified && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Đã mua hàng
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>{new Date(review.date).toLocaleDateString('vi-VN')}</span>
              {review.size && <span>Size: {review.size}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Title */}
      {review.title && <h4 className="uppercase tracking-wide mb-2">{review.title}</h4>}

      {/* Comment */}
      <p className="text-gray-700 mb-4">{review.comment}</p>

      {/* Body Info */}
      {(review.height || review.weight || fitInfo) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.height && (
            <Badge variant="outline" className="text-xs">
              Cao: {review.height}
            </Badge>
          )}
          {review.weight && (
            <Badge variant="outline" className="text-xs">
              Nặng: {review.weight}
            </Badge>
          )}
          {fitInfo && <Badge className={`text-xs ${fitInfo.color}`}>{fitInfo.label}</Badge>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHelpful}
          disabled={hasVoted}
          className={`${hasVoted ? 'text-green-600' : 'text-gray-600'}`}
        >
          <ThumbsUp className={`w-4 h-4 mr-2 ${hasVoted ? 'fill-green-600' : ''}`} />
          <span>Hữu ích ({helpful})</span>
        </Button>
      </div>
    </motion.div>
  )
}

// Review Form Component
function ReviewForm({
  onSubmit,
  onCancel,
  productId,
}: {
  onSubmit: (review: Review) => void
  onCancel: () => void
  productId: number
}) {
  const { user } = useUser()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [size, setSize] = useState('')
  const [fit, setFit] = useState<'tight' | 'perfect' | 'loose' | ''>('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!rating || !comment) {
      alert('Vui lòng nhập đánh giá và nhận xét')
      return
    }

    const review: Review = {
      id: Date.now().toString(),
      userId: user?.id || '',
      userName: user?.fullName || 'Khách hàng',
      rating,
      title,
      comment,
      date: new Date().toISOString(),
      verified: true,
      helpful: 0,
      size,
      fit: fit || undefined,
      height,
      weight,
    }

    onSubmit(review)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border-2 border-black rounded-sm p-6">
      <h3 className="text-xl uppercase tracking-wide mb-6">Viết Đánh Giá Của Bạn</h3>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm uppercase tracking-wide mb-2">
          Đánh Giá <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm uppercase tracking-wide mb-2">Tiêu Đề</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tóm tắt đánh giá của bạn"
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm uppercase tracking-wide mb-2">
          Nhận Xét <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          rows={5}
          required
        />
      </div>

      {/* Size & Fit Info */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm uppercase tracking-wide mb-2">Size Đã Mua</label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="XS">XS</SelectItem>
              <SelectItem value="S">S</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
              <SelectItem value="XXL">XXL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm uppercase tracking-wide mb-2">Độ Vừa Vặn</label>
          <Select value={fit} onValueChange={(value: any) => setFit(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn độ vừa vặn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tight">Hơi chật</SelectItem>
              <SelectItem value="perfect">Vừa vặn</SelectItem>
              <SelectItem value="loose">Hơi rộng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm uppercase tracking-wide mb-2">Chiều Cao</label>
          <Input
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="VD: 175cm"
          />
        </div>

        <div>
          <label className="block text-sm uppercase tracking-wide mb-2">Cân Nặng</label>
          <Input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="VD: 68kg"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1 bg-black text-white hover:bg-gray-800 uppercase tracking-wide"
        >
          Gửi Đánh Giá
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 uppercase tracking-wide"
        >
          Hủy
        </Button>
      </div>
    </form>
  )
}
