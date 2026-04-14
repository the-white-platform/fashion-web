import type { CollectionSlug, Payload, PayloadRequest } from 'payload'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { productSeedData, categorySeedData } from './products'
import { sizeChartSeedData } from './size-charts'
import { seedVietnamAddresses } from './vietnamAddresses'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOOKBOOK_DIR = path.join(__dirname, 'lookbook')
const SIZE_CHARTS_DIR = path.join(__dirname, 'size-charts')

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'products',
  'orders',
  'size-charts',
  'forms',
  'form-submissions',
  'search',
]

function mimeTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Comprehensive seed script for the entire application
 * Seeds: categories, products, header navigation, homepage carousel
 */
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('🌱 Seeding database...')

  // 0. Seed Vietnam Addresses
  await seedVietnamAddresses(payload)

  // 1. Clear existing data (in correct order to avoid foreign key constraints)
  payload.logger.info('— Clearing existing data...')

  // Delete collections with foreign key dependencies first
  const collectionsWithDependencies = ['posts', 'products', 'form-submissions']
  for (const collection of collectionsWithDependencies) {
    await payload.delete({
      collection: collection as CollectionSlug,
      where: { id: { exists: true } },
    })
  }

  // Then delete the rest
  for (const collection of collections) {
    if (!collectionsWithDependencies.includes(collection)) {
      await payload.delete({
        collection: collection,
        where: { id: { exists: true } },
      })
    }
  }

  // 1.5 Create admin user
  payload.logger.info('— Creating admin user...')
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@thewhite.vn'
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword && process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD environment variable is required in production')
  }
  const resolvedAdminPassword = adminPassword || 'TheWhite@2024'
  const adminName = process.env.ADMIN_NAME || 'Admin'

  const { totalDocs: userExists } = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: adminEmail,
      },
    },
  })

  if (userExists === 0) {
    await payload.create({
      collection: 'users',
      draft: false,
      data: {
        name: adminName,
        email: adminEmail,
        password: resolvedAdminPassword,
        role: 'admin',
      },
    })
    payload.logger.info(`  ✓ Created admin user: ${adminEmail}`)
  } else {
    payload.logger.info('  ✓ Admin user already exists')
  }

  // 2. Create categories (Vietnamese + English)
  payload.logger.info(`— Creating ${categorySeedData.length} categories...`)
  const categoryMap: Record<string, number> = {}

  for (const cat of categorySeedData) {
    // Create category with Vietnamese (default locale)
    const category = await payload.create({
      collection: 'categories',
      data: { title: cat.title },
      locale: 'vi',
    })
    categoryMap[cat.title] = category.id

    // Add English translation
    await payload.update({
      collection: 'categories',
      id: category.id,
      data: { title: cat.titleEn },
      locale: 'en',
    })

    payload.logger.info(`  ✓ Created category: ${cat.title} / ${cat.titleEn}`)
  }

  // 2.5 Create size charts (one per product line)
  payload.logger.info(`— Creating ${sizeChartSeedData.length} size charts...`)
  for (const chart of sizeChartSeedData) {
    const categoryId = categoryMap[chart.categoryTitle]
    if (!categoryId) {
      payload.logger.warn(`  ⚠ Category not found for size chart: ${chart.categoryTitle}`)
      continue
    }
    const absPath = path.resolve(SIZE_CHARTS_DIR, chart.fileName)
    try {
      const buffer = await readFile(absPath)
      const mimetype = mimeTypeFor(absPath)
      const chartDoc = await payload.create({
        collection: 'size-charts',
        data: {
          title: chart.titleVi,
          alt: chart.altVi,
          category: categoryId,
        },
        file: {
          name: chart.fileName,
          data: buffer,
          mimetype,
          size: buffer.length,
        },
        locale: 'vi',
      })
      await payload.update({
        collection: 'size-charts',
        id: chartDoc.id,
        data: { title: chart.titleEn, alt: chart.altEn },
        locale: 'en',
      })
      payload.logger.info(`  ✓ ${chart.titleVi}`)
    } catch (err) {
      payload.logger.error(
        `  ✗ Failed size chart ${chart.fileName}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  // 3. Create products with color variants (PARALLEL PROCESSING)
  payload.logger.info(`— Creating ${productSeedData.length} products (parallel batches)...`)

  // Helper: Upload a single image. Accepts either an http(s) URL or a local
  // path relative to `src/endpoints/seed/lookbook/` (downloaded via
  // scripts/fetch-drive-assets.sh).
  async function uploadImage(
    imageSource: string,
    productName: string,
    productNameEn: string,
    color: string,
    colorEn: string,
  ): Promise<number | null> {
    try {
      const isUrl = /^https?:\/\//i.test(imageSource)
      let buffer: Buffer
      let mimetype: string
      let fileName: string

      if (isUrl) {
        const response = await fetch(imageSource)
        const arrayBuffer = await response.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
        const urlPath = imageSource.split('?')[0]
        const imageId = urlPath.split('/').pop() || `image-${Date.now()}`
        fileName = `${imageId}-${color.toLowerCase()}-${Date.now()}.jpg`
        mimetype = 'image/jpeg'
      } else {
        // Paths starting with `hi-res/` resolve against HIRES_DIR; everything
        // else against LOOKBOOK_DIR.
        const baseDir = imageSource.startsWith('hi-res/') ? __dirname : LOOKBOOK_DIR
        const absPath = path.resolve(baseDir, imageSource)
        buffer = await readFile(absPath)
        mimetype = mimeTypeFor(absPath)
        const base = path.basename(absPath).replace(/[^\w.-]/g, '_')
        // Include a random suffix so parallel uploads of the same source file
        // (e.g. one image shared across two product variants) don't collide
        // on Payload's unique filename constraint.
        const rand = Math.random().toString(36).slice(2, 8)
        fileName = `${color.toLowerCase()}-${Date.now()}-${rand}-${base}`
      }

      const imageDoc = await payload.create({
        collection: 'media',
        data: { alt: `${productName} - ${color}` },
        file: {
          name: fileName,
          data: buffer,
          mimetype,
          size: buffer.length,
        },
        locale: 'vi',
      })

      // Add English alt text
      await payload.update({
        collection: 'media',
        id: imageDoc.id,
        data: { alt: `${productNameEn} - ${colorEn}` },
        locale: 'en',
      })

      return imageDoc.id
    } catch (err) {
      payload.logger.warn(
        `uploadImage failed for "${imageSource}": ${err instanceof Error ? err.message : String(err)}`,
      )
      return null
    }
  }

  // Helper: Create a single product
  async function createProduct(
    productData: (typeof productSeedData)[0],
    index: number,
  ): Promise<void> {
    try {
      // Get category ID (Primary)
      const categoryId = categoryMap[productData.categoryTitle]
      if (!categoryId) {
        payload.logger.warn(`  [${index + 1}] ⚠ Category not found for: ${productData.name}`)
        return
      }

      // Resolve additional categories
      const categoryIds = [categoryId]
      if (productData.additionalCategories) {
        for (const catTitle of productData.additionalCategories) {
          if (categoryMap[catTitle]) {
            categoryIds.push(categoryMap[catTitle])
          }
        }
      }
      const uniqueCategoryIds = Array.from(new Set(categoryIds))

      // Process all color variants with parallel image uploads
      const colorVariants: any[] = []
      const colorVariantsEn: any[] = []

      for (const variant of productData.colorVariants) {
        // Upload all images for this variant in parallel
        const imagePromises = variant.imageUrls.map((url) =>
          uploadImage(url, productData.name, productData.nameEn, variant.color, variant.colorEn),
        )
        const imageResults = await Promise.all(imagePromises)
        const variantImageIds = imageResults.filter((id): id is number => id !== null)

        if (variantImageIds.length > 0) {
          colorVariants.push({
            color: variant.color,
            colorHex: variant.colorHex,
            sizeInventory: variant.sizeInventory,
            images: variantImageIds,
          })
          colorVariantsEn.push({
            color: variant.colorEn,
            colorHex: variant.colorHex,
            sizeInventory: variant.sizeInventory,
            images: variantImageIds,
          })
        }
      }

      if (colorVariants.length === 0) {
        payload.logger.warn(`  [${index + 1}] ⚠ Skipping ${productData.name} (no valid variants)`)
        return
      }

      // Create product with Vietnamese content
      const product = await payload.create({
        collection: 'products',
        data: {
          name: productData.name,
          slug: productData.slug,
          category: uniqueCategoryIds,
          price: productData.price,
          originalPrice: productData.originalPrice,
          colorVariants: colorVariants,
          tag: productData.tag as any,
          featured: productData.featured,
          features: productData.features.map((f) => ({ feature: f })),
        },
        locale: 'vi',
      })

      // Add English translation
      await payload.update({
        collection: 'products',
        id: product.id,
        data: {
          name: productData.nameEn,
          colorVariants: colorVariantsEn,
          features: productData.featuresEn.map((f) => ({ feature: f })),
        },
        locale: 'en',
      })

      payload.logger.info(
        `  [${index + 1}] ✓ ${productData.name} (${colorVariants.length} variants)`,
      )
    } catch (error) {
      payload.logger.error(`  [${index + 1}] ✗ Failed: ${productData.name}`)
    }
  }

  // Process products in parallel batches of 10
  const BATCH_SIZE = 10
  for (let batchStart = 0; batchStart < productSeedData.length; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, productSeedData.length)
    const batch = productSeedData.slice(batchStart, batchEnd)

    payload.logger.info(
      `  → Batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(productSeedData.length / BATCH_SIZE)}: Processing products ${batchStart + 1}-${batchEnd}...`,
    )

    await Promise.all(batch.map((productData, i) => createProduct(productData, batchStart + i)))
  }

  payload.logger.info(`  ✓ All products created`)

  // Globals (Header / Homepage / Footer / PaymentMethods) use `updateGlobal`
  // which triggers `revalidateTag` in afterChange hooks. `revalidateTag`
  // throws outside a Next.js request context (i.e. our CLI bootstrap).
  // The DB write still succeeds; only the revalidation no-ops. Wrap the
  // whole section to swallow that specific error and keep the seed going.
  try {
    // 4. Configure Header Navigation
    payload.logger.info(`— Configuring header navigation...`)

    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Men',
              url: '/products?category=nam',
              newTab: false,
            },
          },
          {
            link: {
              type: 'custom',
              label: 'New Arrivals',
              url: '/products?category=moi-nhat',
              newTab: false,
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Hot',
              url: '/products?tag=hot',
              newTab: false,
            },
          },
        ],
      },
    })

    payload.logger.info(`  ✓ Header navigation configured`)

    // 5. Configure Homepage Carousel and Activity Categories
    payload.logger.info(`— Configuring homepage settings...`)

    // Get activity category IDs
    const activityNames = ['Gym', 'Chạy Bộ', 'Yoga', 'Bóng Đá']
    const activityCategoryIds: number[] = []
    for (const name of activityNames) {
      if (categoryMap[name]) {
        activityCategoryIds.push(categoryMap[name])
      }
    }

    // Build quick filters configuration (base with Vietnamese labels)
    const quickFiltersBase: Array<{
      label: string
      filterType: 'all' | 'category' | 'tag'
      tagFilter?: 'sale' | 'new' | 'bestseller'
      category?: number
    }> = [
      { label: 'TẤT CẢ', filterType: 'all' },
      { label: 'MỚI', filterType: 'tag', tagFilter: 'new' },
      { label: 'BÁN CHẠY', filterType: 'tag', tagFilter: 'bestseller' },
      { label: 'GIẢM GIÁ', filterType: 'tag', tagFilter: 'sale' },
    ]

    // Add category-based filters if categories exist
    if (categoryMap['Gym']) {
      quickFiltersBase.push({ label: 'GYM', filterType: 'category', category: categoryMap['Gym'] })
    }
    if (categoryMap['Yoga']) {
      quickFiltersBase.push({
        label: 'YOGA',
        filterType: 'category',
        category: categoryMap['Yoga'],
      })
    }

    // English filter labels (same order as base)
    const englishLabels = ['ALL', 'NEW', 'BESTSELLER', 'SALE', 'GYM', 'YOGA']

    // Step 1: Create homepage content with Vietnamese (default locale) - this creates the structure and IDs
    await payload.updateGlobal({
      slug: 'homepage',
      locale: 'vi',
      data: {
        carouselSlides: [
          {
            title: 'BỘ SƯU TẬP MÙA ĐÔNG 2024',
            subtitle: 'Sức mạnh trong từng bước đi',
            ctaText: 'Khám Phá Ngay',
            ctaLink: '/products',
          },
          {
            title: 'PHONG CÁCH HIỆN ĐẠI',
            subtitle: 'Tối ưu cho mọi hoạt động',
            ctaText: 'Khám Phá Ngay',
            ctaLink: '/products',
          },
          {
            title: 'CHẤT LIỆU CAO CẤP',
            subtitle: 'Thoải mái cả ngày dài',
            ctaText: 'Khám Phá Ngay',
            ctaLink: '/products',
          },
        ],
        activityCategories: activityCategoryIds,
        quickFilters: quickFiltersBase,
      },
    })

    // Step 2: Read back the homepage to get the generated IDs
    const savedHomepage = await payload.findGlobal({
      slug: 'homepage',
      locale: 'vi',
      depth: 0,
    })

    // Step 3: Build English quick filters with same IDs and English labels
    const quickFiltersEn = (savedHomepage.quickFilters || []).map((filter: any, index: number) => ({
      id: filter.id, // Preserve the same row ID
      label: englishLabels[index] || filter.label, // Use English label
      filterType: filter.filterType,
      tagFilter: filter.tagFilter,
      category: filter.category,
    }))

    // Step 4: Build English carousel slides with same IDs
    const carouselSlidesEn = (savedHomepage.carouselSlides || []).map(
      (slide: any, index: number) => {
        const englishSlides = [
          {
            title: 'WINTER COLLECTION 2024',
            subtitle: 'Power in every step',
            ctaText: 'Explore Now',
          },
          {
            title: 'MODERN STYLE',
            subtitle: 'Optimized for every activity',
            ctaText: 'Explore Now',
          },
          { title: 'PREMIUM MATERIALS', subtitle: 'Comfort all day long', ctaText: 'Explore Now' },
        ]
        return {
          id: slide.id, // Preserve the same row ID
          title: englishSlides[index]?.title || slide.title,
          subtitle: englishSlides[index]?.subtitle || slide.subtitle,
          ctaText: englishSlides[index]?.ctaText || slide.ctaText,
          ctaLink: slide.ctaLink,
          backgroundImage: slide.backgroundImage,
        }
      },
    )

    // Step 5: Update English locale with same IDs
    await payload.updateGlobal({
      slug: 'homepage',
      locale: 'en',
      data: {
        carouselSlides: carouselSlidesEn,
        activityCategories: activityCategoryIds,
        quickFilters: quickFiltersEn,
      },
    })

    payload.logger.info(`  ✓ Homepage carousel configured (vi + en)`)
    payload.logger.info(`  ✓ Activity categories configured: ${activityNames.join(', ')}`)
    payload.logger.info(
      `  ✓ Quick filters configured: vi: ${quickFiltersBase.map((f) => f.label).join(', ')} | en: ${englishLabels.slice(0, quickFiltersBase.length).join(', ')}`,
    )

    // 6. Configure Payment Methods
    payload.logger.info(`— Configuring payment methods (QR & COD)...`)

    await payload.updateGlobal({
      slug: 'payment-methods',
      locale: 'vi',
      data: {
        cod: {
          enabled: true,
          name: 'Thanh toán khi nhận hàng',
          description: 'Thanh toán bằng tiền mặt khi nhận hàng. Vui lòng chuẩn bị đúng số tiền.',
          sortOrder: 1,
        },
        bankTransfer: {
          enabled: true,
          name: 'Chuyển khoản ngân hàng / QR',
          description: 'Chuyển khoản nhanh qua mã VietQR hoặc số tài khoản.',
          bankName: 'Vietcombank',
          accountNumber: 'kanetran29',
          accountName: 'KANE TRAN',
          sortOrder: 2,
        },
        qrCode: { enabled: false },
        vnpay: { enabled: false },
        stripe: { enabled: false },
        momo: { enabled: false },
      },
    })

    await payload.updateGlobal({
      slug: 'payment-methods',
      locale: 'en',
      data: {
        cod: {
          name: 'Cash on Delivery',
          description: 'Cash on delivery. Please prepare the exact amount.',
        },
        bankTransfer: {
          name: 'Bank Transfer / QR',
          description: 'Fast transfer via VietQR or account number.',
        },
      },
    })

    payload.logger.info(`  ✓ Payment methods configured`)

    // 7. Configure Footer
    payload.logger.info(`— Configuring footer navigation...`)

    const footerLinksVi = [
      { label: 'Về Chúng Tôi', url: '/about' },
      { label: 'Chính Sách Vận Chuyển', url: '/delivery' },
      { label: 'Chính Sách Đổi Trả', url: '/returns' },
      { label: 'Điều Khoản Dịch Vụ', url: '/terms' },
      { label: 'Chính Sách Bảo Mật', url: '/privacy' },
      { label: 'Liên Hệ', url: '/contact' },
    ]

    const footerLinksEn = [
      { label: 'About Us', url: '/about' },
      { label: 'Delivery Policy', url: '/delivery' },
      { label: 'Returns Policy', url: '/returns' },
      { label: 'Terms of Service', url: '/terms' },
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Contact Us', url: '/contact' },
    ]

    await payload.updateGlobal({
      slug: 'footer',
      locale: 'vi',
      data: {
        navItems: footerLinksVi.map((link) => ({
          link: {
            type: 'custom' as const,
            label: link.label,
            url: link.url,
            newTab: false,
          },
        })),
      },
    })

    await payload.updateGlobal({
      slug: 'footer',
      locale: 'en',
      data: {
        navItems: footerLinksEn.map((link) => ({
          link: {
            type: 'custom' as const,
            label: link.label,
            url: link.url,
            newTab: false,
          },
        })),
      },
    })

    payload.logger.info(`  ✓ Footer configured`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('static generation store missing')) {
      payload.logger.warn(
        `⚠ Globals saved but cache revalidation was skipped (CLI bootstrap, no Next.js request context). Pages will pick up the new content on next render.`,
      )
    } else {
      throw err
    }
  }

  payload.logger.info('✅ Database seeding completed!')
}
