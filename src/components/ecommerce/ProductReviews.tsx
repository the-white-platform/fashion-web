'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Star,
  ThumbsUp,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Store,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from '@/i18n/Link'
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
import type { Review, User, Media } from '@/payload-types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReviewWithUser extends Review {
  user: User | number
}

interface ReviewsResponse {
  docs: ReviewWithUser[]
  totalDocs: number
  totalPages: number
  page: number
}

interface ProductReviewsProps {
  productId: number
  productName: string
}

type SortOption = 'recent' | 'helpful' | 'rating'

// ─── Helper: Star display ────────────────────────────────────────────────────

const StarRating = ({ rating, size = 'w-5 h-5' }: { rating: number; size?: string }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`}
      />
    ))}
  </div>
)

// ─── Main Component ──────────────────────────────────────────────────────────

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user } = useUser()
  const t = useTranslations('reviews')

  const [reviews, setReviews] = useState<ReviewWithUser[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  const PAGE_SIZE = 10

  const sortParam = (() => {
    switch (sortBy) {
      case 'helpful':
        return '-helpfulCount'
      case 'rating':
        return '-rating'
      case 'recent':
      default:
        return '-createdAt'
    }
  })()

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        'where[product][equals]': String(productId),
        'where[moderationStatus][equals]': 'approved',
        sort: sortParam,
        limit: String(PAGE_SIZE),
        page: String(page),
        depth: '1',
      })
      if (filterRating !== 'all') {
        params.set('where[rating][equals]', String(filterRating))
      }

      const res = await fetch(`/api/reviews?${params}`)
      if (!res.ok) throw new Error('fetch failed')
      const data: ReviewsResponse = await res.json()

      setReviews(data.docs)
      setTotalDocs(data.totalDocs)
      setTotalPages(data.totalPages)
    } catch {
      setReviews([])
      setTotalDocs(0)
    } finally {
      setLoading(false)
    }
  }, [productId, sortParam, filterRating, page])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Check if the current user has already left a review for this product
  useEffect(() => {
    if (!user?.id) {
      setHasReviewed(false)
      return
    }
    const check = async () => {
      const params = new URLSearchParams({
        'where[product][equals]': String(productId),
        'where[user][equals]': String(user.id),
        limit: '1',
        depth: '0',
      })
      const res = await fetch(`/api/reviews?${params}`)
      if (res.ok) {
        const data = await res.json()
        setHasReviewed((data.totalDocs ?? 0) > 0)
      }
    }
    check()
  }, [user, productId])

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((r) => {
    const k = r.rating as keyof typeof distribution
    if (k in distribution) distribution[k]++
  })

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'

  const handleReviewSubmitted = () => {
    setHasReviewed(true)
    setShowReviewForm(false)
    setPage(1)
    fetchReviews()
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
            <div className="text-center md:text-left">
              <div className="flex items-end justify-center md:justify-start gap-4 mb-4">
                <div className="text-6xl text-foreground">{averageRating}</div>
                <div className="pb-2">
                  <StarRating rating={Math.round(parseFloat(averageRating))} />
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('count', { count: totalDocs })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = distribution[rating as keyof typeof distribution]
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                return (
                  <button
                    key={rating}
                    onClick={() => {
                      setFilterRating(filterRating === rating ? 'all' : rating)
                      setPage(1)
                    }}
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
        {user ? (
          <div className="mb-8">
            {hasReviewed ? (
              <div className="bg-primary/10 border border-primary/20 rounded-sm p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-primary">{t('alreadyReviewed')}</span>
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
            )}
          </div>
        ) : (
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
                productId={productId}
                onSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm uppercase tracking-wide text-foreground">{t('sortBy')}</span>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value as SortOption)
                setPage(1)
              }}
            >
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
              onClick={() => {
                setFilterRating('all')
                setPage(1)
              }}
              className="text-muted-foreground hover:text-foreground underline"
            >
              {t('clearCo')}
            </Button>
          )}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {reviews.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">{t('empty')}</div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Review Card ─────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewWithUser }) {
  const t = useTranslations('reviews')
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount ?? 0)
  const [hasVoted, setHasVoted] = useState(false)
  const [voting, setVoting] = useState(false)

  const userName =
    typeof review.user === 'object' && review.user !== null
      ? ((review.user as User).name ?? 'Khách hàng')
      : 'Khách hàng'

  const handleHelpful = async () => {
    if (hasVoted || voting) return
    setVoting(true)
    try {
      const res = await fetch('/api/reviews/helpful', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setHelpfulCount(data.helpfulCount ?? helpfulCount + 1)
        setHasVoted(true)
      } else if (res.status === 409) {
        setHasVoted(true) // already voted (cookie existed server-side)
      }
    } finally {
      setVoting(false)
    }
  }

  const getFitLabel = (fit?: string | null) => {
    switch (fit) {
      case 'runs_small':
        return { label: t('fit.tight'), color: 'text-warning bg-warning/10' }
      case 'true_to_size':
        return { label: t('fit.perfect'), color: 'text-success bg-success/10' }
      case 'runs_large':
        return { label: t('fit.loose'), color: 'text-primary bg-primary/10' }
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
            {userName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="uppercase tracking-wide text-foreground">{userName}</span>
              {review.verified && (
                <Badge variant="secondary" className="bg-success/10 text-success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('verified')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
              {review.sizeOrdered && <span>Size: {review.sizeOrdered}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      <StarRating rating={review.rating} />

      {/* Title */}
      {review.title && (
        <h4 className="uppercase tracking-wide mb-2 mt-3 text-foreground">{review.title}</h4>
      )}

      {/* Comment */}
      <p className="text-foreground/90 mb-4 mt-2">{review.comment}</p>

      {/* Body info badges */}
      {(review.height || review.weight || fitInfo) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.height && (
            <Badge variant="outline" className="text-xs">
              {t('labels.height')}: {review.height}cm
            </Badge>
          )}
          {review.weight && (
            <Badge variant="outline" className="text-xs">
              {t('labels.weight')}: {review.weight}kg
            </Badge>
          )}
          {fitInfo && <Badge className={`text-xs ${fitInfo.color}`}>{fitInfo.label}</Badge>}
        </div>
      )}

      {/* Review images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {(review.images as Array<number | Media>).map((img, i) => {
            const url = typeof img === 'object' ? (img as Media).url : null
            if (!url) return null
            return (
              <img
                key={i}
                src={url}
                alt={`Review image ${i + 1}`}
                className="w-20 h-20 object-cover rounded-sm border border-border"
              />
            )
          })}
        </div>
      )}

      {/* Admin reply */}
      {review.adminReply && (
        <div className="bg-muted/50 border border-border rounded-sm p-4 mb-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-foreground">
            <Store className="w-4 h-4" />
            <span className="uppercase tracking-wide">{t('storeResponse')}</span>
            {review.adminReplyAt && (
              <span className="text-muted-foreground font-normal">
                — {new Date(review.adminReplyAt).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
          <p className="text-foreground/90 text-sm">{review.adminReply}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHelpful}
          disabled={hasVoted || voting}
          className={`${hasVoted ? 'text-success' : 'text-muted-foreground'}`}
        >
          <ThumbsUp className={`w-4 h-4 mr-2 ${hasVoted ? 'fill-success' : ''}`} />
          <span>
            {t('helpful')} ({helpfulCount})
          </span>
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Review Form ─────────────────────────────────────────────────────────────

function ReviewForm({
  productId,
  onSubmitted,
  onCancel,
}: {
  productId: number
  onSubmitted: () => void
  onCancel: () => void
}) {
  const { user } = useUser()
  const t = useTranslations('reviews')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [sizeOrdered, setSizeOrdered] = useState('')
  const [fit, setFit] = useState<'runs_small' | 'true_to_size' | 'runs_large' | ''>('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating || !comment.trim()) {
      setError(t('form.alert'))
      return
    }
    if (!user?.id) {
      setError('Must be logged in')
      return
    }

    setSubmitting(true)
    setError(null)

    const body: Record<string, unknown> = {
      product: productId,
      user: user.id,
      rating,
      comment,
    }
    if (title.trim()) body.title = title.trim()
    if (sizeOrdered.trim()) body.sizeOrdered = sizeOrdered.trim()
    if (fit) body.fit = fit
    if (height && !isNaN(Number(height))) body.height = Number(height)
    if (weight && !isNaN(Number(weight))) body.weight = Number(weight)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.errors?.[0]?.message ?? data?.message ?? 'Submit failed')
      }

      const result = await res.json()
      const isApproved = result?.doc?.moderationStatus === 'approved'
      setSuccessMsg(isApproved ? t('form.successApproved') : t('form.successPending'))

      setTimeout(() => {
        onSubmitted()
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (successMsg) {
    return (
      <div className="bg-success/10 border border-success/20 rounded-sm p-6 text-center">
        <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
        <p className="text-success">{successMsg}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-muted/30 border-2 border-border rounded-sm p-6">
      <h3 className="text-xl uppercase tracking-wide mb-6 text-foreground">{t('form.title')}</h3>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-sm p-3 mb-4 flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Star rating */}
      <div className="mb-6">
        <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
          {t('labels.rating')} <span className="text-destructive">*</span>
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
          {t('labels.comment')} <span className="text-destructive">*</span>
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('placeholders.comment')}
          rows={5}
          required
        />
      </div>

      {/* Size / Fit / Body info */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
            {t('labels.size')}
          </label>
          <Select value={sizeOrdered} onValueChange={setSizeOrdered}>
            <SelectTrigger>
              <SelectValue placeholder={t('placeholders.size')} />
            </SelectTrigger>
            <SelectContent>
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
            {t('labels.fit')}
          </label>
          <Select value={fit} onValueChange={(v) => setFit(v as typeof fit)}>
            <SelectTrigger>
              <SelectValue placeholder={t('placeholders.fit')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="runs_small">{t('fit.tight')}</SelectItem>
              <SelectItem value="true_to_size">{t('fit.perfect')}</SelectItem>
              <SelectItem value="runs_large">{t('fit.loose')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
            {t('labels.height')}
          </label>
          <Input
            type="number"
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
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={t('placeholders.weight')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wide"
        >
          {submitting ? t('form.submitting') : t('form.submit')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 uppercase tracking-wide"
        >
          {t('form.cancel')}
        </Button>
      </div>
    </form>
  )
}
