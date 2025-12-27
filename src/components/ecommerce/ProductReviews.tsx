'use client'

import { useState } from 'react'
import { Star, ThumbsUp, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
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
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('reviews')
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

  const calculateAverageRating = (): string => {
    if (reviews.length === 0) return '0.0'
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
    <div className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl uppercase tracking-wide mb-2 text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle', { productName })}</p>
        </div>

        {/* Rating Summary */}
        <div className="bg-muted/50 rounded-sm p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-end justify-center md:justify-start gap-4 mb-4">
                <div className="text-6xl text-foreground">{averageRating}</div>
                <div className="pb-2">
                  <StarRating rating={Math.round(parseFloat(averageRating))} />
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('count', { count: totalReviews })}
                  </p>
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
                    className={`flex items-center gap-3 w-full group hover:bg-muted rounded-sm p-2 transition-colors ${
                      filterRating === rating ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm text-foreground">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-border h-2 rounded-sm overflow-hidden">
                      <Progress value={percentage} className="h-full bg-yellow-400" />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
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
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-sm p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-900 dark:text-blue-100">{t('alreadyReviewed')}</span>
                </div>
              ) : (
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wide"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span>{t('write')}</span>
                </Button>
              )
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-sm p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-900 dark:text-yellow-100">{t('mustPurchase')}</span>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="mb-8 bg-muted/50 border border-border rounded-sm p-4 text-center">
            <p className="text-muted-foreground">
              <Link href="/login" className="text-foreground underline hover:text-muted-foreground">
                {t('login')}
              </Link>{' '}
              {t('loginToReview')}
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm uppercase tracking-wide text-foreground">{t('sortBy')}</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t('sort.recent')}</SelectItem>
                <SelectItem value="helpful">{t('sort.helpful')}</SelectItem>
                <SelectItem value="rating">{t('sort.rating')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filterRating !== 'all' && (
            <Button
              variant="link"
              onClick={() => setFilterRating('all')}
              className="text-muted-foreground hover:text-foreground underline"
            >
              {t('clearCo')}
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
          <div className="text-center py-12 text-muted-foreground">{t('empty')}</div>
        )}
      </div>
    </div>
  )
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
  const t = useTranslations('reviews')
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
        return { label: t('fit.tight'), color: 'text-orange-600 bg-orange-500/10' }
      case 'perfect':
        return { label: t('fit.perfect'), color: 'text-green-600 bg-green-500/10' }
      case 'loose':
        return { label: t('fit.loose'), color: 'text-blue-600 bg-blue-500/10' }
      default:
        return null
    }
  }

  const fitInfo = getFitLabel(review.fit)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-sm p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-sm flex items-center justify-center uppercase">
            {review.userName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="uppercase tracking-wide text-foreground">{review.userName}</span>
              {review.verified && (
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-600 dark:text-green-400"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('verified')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
              star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'
            }`}
          />
        ))}
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="uppercase tracking-wide mb-2 text-foreground">{review.title}</h4>
      )}

      {/* Comment */}
      <p className="text-foreground/90 mb-4">{review.comment}</p>

      {/* Body Info */}
      {(review.height || review.weight || fitInfo) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.height && (
            <Badge variant="outline" className="text-xs">
              {t('labels.height')}: {review.height}
            </Badge>
          )}
          {review.weight && (
            <Badge variant="outline" className="text-xs">
              {t('labels.weight')}: {review.weight}
            </Badge>
          )}
          {fitInfo && <Badge className={`text-xs ${fitInfo.color}`}>{fitInfo.label}</Badge>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHelpful}
          disabled={hasVoted}
          className={`${hasVoted ? 'text-green-600' : 'text-muted-foreground'}`}
        >
          <ThumbsUp className={`w-4 h-4 mr-2 ${hasVoted ? 'fill-green-600' : ''}`} />
          <span>
            {t('helpful')} ({helpful})
          </span>
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
  const t = useTranslations('reviews')
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
      alert(t('form.alert'))
      return
    }

    const review: Review = {
      id: crypto.randomUUID(),
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
    <form onSubmit={handleSubmit} className="bg-muted/30 border-2 border-border rounded-sm p-6">
      <h3 className="text-xl uppercase tracking-wide mb-6 text-foreground">{t('form.title')}</h3>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
          {t('labels.rating')} <span className="text-red-500">*</span>
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
                    : 'text-border'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
          {t('labels.title')}
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('placeholders.title')}
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
          {t('labels.comment')} <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('placeholders.comment')}
          rows={5}
          required
        />
      </div>

      {/* Size & Fit Info */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
            {t('labels.size')}
          </label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger>
              <SelectValue placeholder={t('placeholders.size')} />
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
          <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
            {t('labels.fit')}
          </label>
          <Select value={fit} onValueChange={(value: any) => setFit(value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('placeholders.fit')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tight">{t('fit.tight')}</SelectItem>
              <SelectItem value="perfect">{t('fit.perfect')}</SelectItem>
              <SelectItem value="loose">{t('fit.loose')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
            {t('labels.height')}
          </label>
          <Input
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={t('placeholders.height')}
          />
        </div>

        <div>
          <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
            {t('labels.weight')}
          </label>
          <Input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={t('placeholders.weight')}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wide"
        >
          {t('form.submit')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 uppercase tracking-wide"
        >
          {t('form.cancel')}
        </Button>
      </div>
    </form>
  )
}
