// Product seed data for development environment with color variants
// Uses placeholder images from Unsplash for dev only

import { slugify } from '@/utilities/slugify'

export interface SizeInventoryItem {
  size: string
  stock: number
  lowStockThreshold?: number
}

export interface ColorVariantSeedData {
  color: string
  colorEn: string
  colorHex: string
  sizeInventory: SizeInventoryItem[]
  imageUrls: string[]
}

export interface ProductSeedData {
  name: string
  nameEn: string
  slug: string
  categoryTitle: string
  additionalCategories?: string[]
  price: number
  originalPrice?: number
  tag?: string
  featured: boolean
  colorVariants: ColorVariantSeedData[]
  description: string
  descriptionEn: string
  features: string[]
  featuresEn: string[]
}

// Type for image sets
type ImageSet = {
  black: string[]
  white?: string[]
  gray?: string[]
  blue?: string[]
}

// Dev placeholder images from Unsplash
const placeholderImages: Record<string, ImageSet> = {
  sportswear: {
    black: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    ],
    white: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    ],
    gray: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80',
    ],
    blue: [
      'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&q=80',
      'https://images.unsplash.com/photo-1618354691551-44de113f0164?w=800&q=80',
    ],
  },
  running: {
    black: [
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
    ],
    white: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    ],
  },
  gym: {
    black: [
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80',
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80',
    ],
    gray: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80',
    ],
  },
}

// Helper function to generate product variations
function generateProducts(): ProductSeedData[] {
  const products: ProductSeedData[] = []

  const baseProducts = [
    {
      name: 'Áo Training Performance',
      category: 'Áo Thể Thao',
      additional: ['Nam', 'Gym'],
      price: 890000,
    },
    { name: 'Áo Polo Slim Fit', category: 'Áo Thể Thao', additional: ['Nam'], price: 790000 },
    {
      name: 'Áo Hoodie Oversize',
      category: 'Áo Thể Thao',
      additional: ['Nam', 'Nữ'],
      price: 990000,
    },
    { name: 'Áo Tank Top Gym', category: 'Áo Thể Thao', additional: ['Nam', 'Gym'], price: 490000 },
    {
      name: 'Áo Thun Basic Heavy',
      category: 'Áo Thể Thao',
      additional: ['Nam', 'Nữ'],
      price: 690000,
    },
    {
      name: 'Áo Khoác Thể Thao',
      category: 'Áo Thể Thao',
      additional: ['Nam', 'Chạy Bộ'],
      price: 1290000,
    },
    {
      name: 'Áo Windbreaker',
      category: 'Áo Thể Thao',
      additional: ['Nam', 'Nữ', 'Chạy Bộ'],
      price: 1190000,
    },
    {
      name: 'Áo Thun Long Sleeve',
      category: 'Áo Thể Thao',
      additional: ['Nam', 'Chạy Bộ'],
      price: 750000,
    },
    {
      name: 'Quần Short Training',
      category: 'Gym',
      additional: ['Nam', 'Quần Short'],
      price: 590000,
    },
    {
      name: 'Quần Short 2 in 1',
      category: 'Gym',
      additional: ['Nam', 'Chạy Bộ', 'Quần Short'],
      price: 690000,
    },
    {
      name: 'Quần Short Basketball',
      category: 'Bóng Đá',
      additional: ['Nam', 'Quần Short'],
      price: 650000,
    },
    {
      name: 'Quần Jogger Training',
      category: 'Quần Dài',
      additional: ['Nam', 'Gym'],
      price: 890000,
    },
    {
      name: 'Quần Track Pants',
      category: 'Quần Dài',
      additional: ['Nam', 'Chạy Bộ'],
      price: 850000,
    },
    {
      name: 'Legging Compression',
      category: 'Quần Dài',
      additional: ['Nữ', 'Gym', 'Yoga'],
      price: 790000,
    },
    {
      name: 'Giày Chạy Bộ Elite',
      category: 'Chạy Bộ',
      additional: ['Nam', 'Nữ', 'Giày Thể Thao'],
      price: 1890000,
      shoe: true,
    },
    {
      name: 'Giày Training CrossFit',
      category: 'Chạy Bộ',
      additional: ['Nam', 'Gym', 'Giày Thể Thao'],
      price: 1690000,
      shoe: true,
    },
    {
      name: 'Set Đồ Tập Gym Premium',
      category: 'Gym',
      additional: ['Nam', 'Bộ Tập Luyện'],
      price: 1490000,
    },
    { name: 'Set Yoga Flow', category: 'Yoga', additional: ['Nữ', 'Bộ Tập Luyện'], price: 1290000 },
    {
      name: 'Set Tennis Classic',
      category: 'Bộ Tập Luyện',
      additional: ['Nam', 'Quần Short', 'Áo Thể Thao'],
      price: 1390000,
    },
    {
      name: 'Sports Bra High Support',
      category: 'Bộ Tập Luyện',
      additional: ['Nữ', 'Gym', 'Yoga'],
      price: 590000,
    },
  ]

  const tags = ['MỚI', 'BÁN CHẠY', 'HOT', 'GIẢM 20%', 'GIẢM 30%']
  const variations = ['Pro', 'Elite', 'Premium', 'Basic', 'Advanced']

  let productCount = 0

  // Generate variations of each base product
  for (const base of baseProducts) {
    for (let i = 0; i < 5 && productCount < 100; i++) {
      const variation = i === 0 ? '' : ` ${variations[i]}`
      const name = `${base.name}${variation}`
      const slug = slugify(name)

      const priceVariation = 1 + i * 0.1
      const price = Math.round((base.price * priceVariation) / 10000) * 10000
      const originalPrice = i % 3 === 0 ? Math.round((price * 1.25) / 10000) * 10000 : undefined

      const colorVariants: ColorVariantSeedData[] = []
      const imageSet = base.category.includes('Giày')
        ? placeholderImages.running
        : base.category.includes('Gym')
          ? placeholderImages.gym
          : placeholderImages.sportswear

      // Helper to generate sizeInventory with random stock
      const generateSizeInventory = (sizes: string[]) =>
        sizes.map((size) => ({
          size,
          stock: Math.floor(Math.random() * 16) + 5, // Random 5-20
          lowStockThreshold: 5,
        }))

      // Add black variant (always available)
      colorVariants.push({
        color: 'Đen',
        colorEn: 'Black',
        colorHex: '#1d2122',
        sizeInventory: generateSizeInventory(
          base.shoe ? ['39', '40', '41', '42', '43', '44'] : ['S', 'M', 'L', 'XL'],
        ),
        imageUrls: imageSet.black,
      })

      // Add white variant for some products
      if (i % 2 === 0 && imageSet.white) {
        colorVariants.push({
          color: 'Trắng',
          colorEn: 'White',
          colorHex: '#ffffff',
          sizeInventory: generateSizeInventory(
            base.shoe ? ['39', '40', '41', '42', '43'] : ['M', 'L', 'XL', '2X'],
          ),
          imageUrls: imageSet.white,
        })
      }

      // Add gray variant for some products
      if (i % 3 === 0 && imageSet.gray) {
        colorVariants.push({
          color: 'Xám',
          colorEn: 'Gray',
          colorHex: '#a9a9a9',
          sizeInventory: generateSizeInventory(
            base.shoe ? ['40', '41', '42', '43'] : ['S', 'M', 'L'],
          ),
          imageUrls: imageSet.gray,
        })
      }

      // Add blue variant for some products
      if (i % 4 === 0 && imageSet.blue) {
        colorVariants.push({
          color: 'Xanh Navy',
          colorEn: 'Navy Blue',
          colorHex: '#2c3e50',
          sizeInventory: generateSizeInventory(
            base.shoe ? ['39', '40', '41', '42'] : ['M', 'L', 'XL'],
          ),
          imageUrls: imageSet.blue,
        })
      }

      // Generate English name from base product
      const nameEn = name
        .replace('Áo Training', 'Training Shirt')
        .replace('Áo Polo', 'Polo Shirt')
        .replace('Áo Hoodie', 'Hoodie')
        .replace('Áo Tank Top', 'Tank Top')
        .replace('Áo Thun Basic', 'Basic T-Shirt')
        .replace('Áo Khoác', 'Sports Jacket')
        .replace('Áo Windbreaker', 'Windbreaker')
        .replace('Áo Thun Long Sleeve', 'Long Sleeve Shirt')
        .replace('Quần Short Training', 'Training Shorts')
        .replace('Quần Short 2 in 1', '2-in-1 Shorts')
        .replace('Quần Short Basketball', 'Basketball Shorts')
        .replace('Quần Jogger', 'Jogger Pants')
        .replace('Quần Track', 'Track Pants')
        .replace('Legging Compression', 'Compression Leggings')
        .replace('Giày Chạy Bộ', 'Running Shoes')
        .replace('Giày Training', 'Training Shoes')
        .replace('Set Đồ Tập', 'Training Set')
        .replace('Set Yoga', 'Yoga Set')
        .replace('Set Tennis', 'Tennis Set')
        .replace('Sports Bra', 'Sports Bra')
        .replace('Performance', 'Performance')
        .replace('Oversize', 'Oversize')
        .replace('Heavy', 'Heavy')
        .replace('Thể Thao', 'Sports')
        .replace('Slim Fit', 'Slim Fit')
        .replace('CrossFit', 'CrossFit')
        .replace('Gym Premium', 'Gym Premium')
        .replace('Flow', 'Flow')
        .replace('Classic', 'Classic')
        .replace('High Support', 'High Support')
        .replace('Elite', 'Elite')

      products.push({
        name,
        nameEn,
        slug,
        categoryTitle: base.category,
        additionalCategories: base.additional,
        price,
        originalPrice,
        tag: tags[productCount % tags.length],
        featured: productCount < 20, // First 20 are featured
        colorVariants,
        description: `${name} với công nghệ tiên tiến, thiết kế hiện đại và chất liệu cao cấp. Phù hợp cho các hoạt động thể thao cường độ cao và sử dụng hàng ngày.`,
        descriptionEn: `${nameEn} with advanced technology, modern design and premium materials. Suitable for high-intensity sports activities and daily use.`,
        features: [
          'Chất liệu cao cấp',
          'Công nghệ thấm hút mồ hôi',
          'Thiết kế hiện đại',
          'Độ bền cao',
        ],
        featuresEn: [
          'Premium materials',
          'Sweat-wicking technology',
          'Modern design',
          'High durability',
        ],
      })

      productCount++
    }
  }

  return products.slice(0, 100)
}

// Generate 100 products
export const productSeedData: ProductSeedData[] = generateProducts()

// Categories to be seeded
export const categorySeedData = [
  { title: 'Nam', titleEn: 'Men', slug: 'nam' },
  { title: 'Nữ', titleEn: 'Women', slug: 'nu' },
  { title: 'Trẻ Em', titleEn: 'Kids', slug: 'tre-em' },
  { title: 'Mới Nhất', titleEn: 'New Arrivals', slug: 'moi-nhat' },
  { title: 'Áo Thể Thao', titleEn: 'Sports Shirts', slug: 'ao-the-thao' },
  { title: 'Quần Short', titleEn: 'Shorts', slug: 'quan-short' },
  { title: 'Quần Dài', titleEn: 'Pants', slug: 'quan-dai' },
  { title: 'Bộ Tập Luyện', titleEn: 'Training Sets', slug: 'bo-tap-luyen' },
  { title: 'Giày Thể Thao', titleEn: 'Sports Shoes', slug: 'giay-the-thao' },
  { title: 'Chạy Bộ', titleEn: 'Running', slug: 'chay-bo' },
  { title: 'Gym', titleEn: 'Gym', slug: 'gym' },
  { title: 'Yoga', titleEn: 'Yoga', slug: 'yoga' },
  { title: 'Bóng Đá', titleEn: 'Football', slug: 'bong-da' },
]
