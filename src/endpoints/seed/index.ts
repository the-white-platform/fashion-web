import type { CollectionSlug, Payload, PayloadRequest } from 'payload'
import { productSeedData, categorySeedData } from './products'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'products',
  'forms',
  'form-submissions',
  'search',
]

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

  // 2. Create categories
  payload.logger.info(`— Creating ${categorySeedData.length} categories...`)
  const categoryMap: Record<string, number> = {}

  for (const cat of categorySeedData) {
    const category = await payload.create({
      collection: 'categories',
      data: { title: cat.title },
    })
    categoryMap[cat.title] = category.id
    payload.logger.info(`  ✓ Created category: ${cat.title}`)
  }

  // 3. Create products with images
  payload.logger.info(`— Creating ${productSeedData.length} products...`)

  for (let i = 0; i < productSeedData.length; i++) {
    const productData = productSeedData[i]
    payload.logger.info(`  [${i + 1}/${productSeedData.length}] Processing: ${productData.name}`)

    try {
      // Fetch and create product images
      const imageIds: number[] = []

      payload.logger.info(`    → Fetching ${productData.imageUrls.length} images...`)
      for (let j = 0; j < productData.imageUrls.length; j++) {
        const imageUrl = productData.imageUrls[j]
        try {
          payload.logger.info(
            `      • Image ${j + 1}/${productData.imageUrls.length}: Downloading...`,
          )
          const response = await fetch(imageUrl)
          const arrayBuffer = await response.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          payload.logger.info(
            `      • Image ${j + 1}/${productData.imageUrls.length}: Uploading to database...`,
          )

          // Extract just the image ID, stripping query parameters
          const urlPath = imageUrl.split('?')[0]
          const imageId = urlPath.split('/').pop() || `image-${Date.now()}`
          const fileName = `${imageId}.jpg`

          const imageDoc = await payload.create({
            collection: 'media',
            data: { alt: productData.name },
            file: {
              name: fileName,
              data: buffer,
              mimetype: 'image/jpeg',
              size: buffer.length,
            },
          })
          imageIds.push(imageDoc.id)
          payload.logger.info(
            `      ✓ Image ${j + 1}/${productData.imageUrls.length}: Uploaded (ID: ${imageDoc.id})`,
          )
        } catch (imgError) {
          payload.logger.warn(
            `      ⚠ Image ${j + 1}/${productData.imageUrls.length}: Failed - ${imgError}`,
          )
        }
      }

      // Skip if no images
      if (imageIds.length === 0) {
        payload.logger.warn(`    ⚠ Skipping ${productData.name} (no images)`)
        continue
      }

      // Get category ID (Primary)
      const categoryId = categoryMap[productData.categoryTitle]
      if (!categoryId) {
        payload.logger.warn(`    ⚠ Category not found for: ${productData.name}`)
        continue
      }

      // Resolve additional categories
      const categoryIds = [categoryId]
      if (productData.additionalCategories) {
        for (const catTitle of productData.additionalCategories) {
          if (categoryMap[catTitle]) {
            categoryIds.push(categoryMap[catTitle])
          } else {
            payload.logger.warn(`    ⚠ Additional category not found: ${catTitle}`)
          }
        }
      }

      // Deduplicate IDs
      const uniqueCategoryIds = Array.from(new Set(categoryIds))

      // Create product
      payload.logger.info(`    → Creating product in database...`)
      await payload.create({
        collection: 'products',
        data: {
          name: productData.name,
          slug: productData.slug,
          category: uniqueCategoryIds,
          price: productData.price,
          originalPrice: productData.originalPrice,
          images: imageIds,
          colors: productData.colors,
          sizes: productData.sizes as (
            | 'XS'
            | 'S'
            | 'M'
            | 'L'
            | 'XL'
            | '2X'
            | '39'
            | '40'
            | '41'
            | '42'
            | '43'
            | '44'
            | '45'
          )[],
          tag: productData.tag as
            | 'MỚI'
            | 'BÁN CHẠY'
            | 'GIẢM 20%'
            | 'GIẢM 30%'
            | 'GIẢM 50%'
            | 'HOT'
            | undefined,
          inStock: productData.inStock,
          featured: productData.featured,
          features: productData.features.map((f) => ({ feature: f })),
        },
      })

      payload.logger.info(`    ✓ Created product: ${productData.name}`)
    } catch (error) {
      payload.logger.error(`    ✗ Failed to create ${productData.name}: ${error}`)
    }
  }

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
            label: 'Women',
            url: '/products?category=nu',
            newTab: false,
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Kids',
            url: '/products?category=tre-em',
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

  // Build quick filters configuration
  const quickFiltersConfig: Array<{
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
    quickFiltersConfig.push({ label: 'GYM', filterType: 'category', category: categoryMap['Gym'] })
  }
  if (categoryMap['Yoga']) {
    quickFiltersConfig.push({
      label: 'YOGA',
      filterType: 'category',
      category: categoryMap['Yoga'],
    })
  }

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      carouselSlides: [
        {
          title: 'WINTER COLLECTION 2024',
          subtitle: 'Power in every step',
          ctaText: 'Explore Now',
          ctaLink: '/products',
        },
        {
          title: 'MODERN STYLE',
          subtitle: 'Optimized for every activity',
          ctaText: 'Explore Now',
          ctaLink: '/products',
        },
        {
          title: 'PREMIUM MATERIALS',
          subtitle: 'Comfort all day long',
          ctaText: 'Explore Now',
          ctaLink: '/products',
        },
      ],
      activityCategories: activityCategoryIds,
      quickFilters: quickFiltersConfig,
    },
  })

  payload.logger.info(`  ✓ Homepage carousel configured`)
  payload.logger.info(`  ✓ Activity categories configured: ${activityNames.join(', ')}`)
  payload.logger.info(
    `  ✓ Quick filters configured: ${quickFiltersConfig.map((f) => f.label).join(', ')}`,
  )

  payload.logger.info('✅ Database seeding completed!')
}
