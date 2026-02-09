/**
 * Format a number as Vietnamese currency (e.g. 1,200,000₫)
 */
export function formatPrice(price: number): string {
  if (typeof price !== 'number') return '0₫'
  return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0 }).format(price) + '₫'
}
