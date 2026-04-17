import type { CollectionSlug, Payload, PayloadRequest } from 'payload'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { productSeedData, categorySeedData } from './products'
import { seedVietnamAddresses } from './vietnamAddresses'
import productDocsRaw from './product-docs.json'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOOKBOOK_DIR = path.join(__dirname, 'lookbook')

// Vietnamese names + descriptions sourced from the Drive doc inside each
// product folder. Falls back to whatever's hardcoded in products.ts if a slug
// is missing here. Refresh by re-running the doc-fetch step.
const productDocs = productDocsRaw as Record<
  string,
  { name: string; description: string; descriptionEn?: string }
>

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'products',
  'product-tags',
  'orders',
  'coupons',
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

// Wrap a plain string as a minimal Lexical rich-text document. Paragraphs are
// split on blank lines so multi-line descriptions render correctly.
function toRichText(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((para) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: para,
            version: 1,
          },
        ],
      })),
    },
  }
}

// Latin slug for Payload admin filenames — strips Vietnamese diacritics and
// punctuation so uploaded media is readable and sorts cleanly.
function toLatinSlug(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

  // 1. Clear existing data (in correct order to avoid foreign key constraints).
  // Set SEED_SKIP_WIPE=true to skip — useful when the DB was wiped out-of-band
  // (e.g. via TRUNCATE), since Payload's delete() cascades into
  // deleteUserPreferences which trips a drizzle/Supabase pooler bug
  // ("current transaction is aborted") that aborts the whole seed.
  if (process.env.SEED_SKIP_WIPE === 'true') {
    payload.logger.info('— Skipping payload.delete wipe (SEED_SKIP_WIPE=true).')
  } else {
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
  }

  // 1.5 Create admin user
  payload.logger.info('— Creating admin user...')
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@thewhite.cool'
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword && process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD environment variable is required in production')
  }
  const resolvedAdminPassword = adminPassword || 'TheWhite@2026'
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

  // 1.6 Create launch coupon — 10% off through end of May 1, 2026 (VN time)
  payload.logger.info('— Creating launch coupon...')
  const launchCoupon = await payload.create({
    collection: 'coupons',
    data: {
      code: 'THEWHITEVIETNAM',
      type: 'percentage',
      value: 10,
      description: 'Mã giảm giá ra mắt: Giảm 10% đến hết 01/05/2026',
      validUntil: '2026-05-01T23:59:59+07:00',
      active: true,
    },
    locale: 'vi',
  })
  await payload.update({
    collection: 'coupons',
    id: launchCoupon.id,
    data: { description: 'Launch coupon: 10% off through May 1, 2026' },
    locale: 'en',
  })
  payload.logger.info('  ✓ Created coupon: THEWHITEVIETNAM (10% off, valid until May 1, 2026)')

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

  // 2.5 Create product tags (localized label) and build a code → id map
  payload.logger.info('— Ensuring product tags exist...')
  const TAG_SEEDS = [
    { code: 'new', order: 20, vi: 'Mới', en: 'New' },
    { code: 'bestseller', order: 10, vi: 'Bán Chạy', en: 'Bestseller' },
    { code: 'sale-20', order: 30, vi: 'Giảm 20%', en: '20% Off' },
    { code: 'sale-30', order: 40, vi: 'Giảm 30%', en: '30% Off' },
    { code: 'sale-50', order: 50, vi: 'Giảm 50%', en: '50% Off' },
    { code: 'hot', order: 0, vi: 'Hot', en: 'Hot' },
  ] as const
  const tagIdByCode: Record<string, number> = {}
  for (const t of TAG_SEEDS) {
    const existing = await payload.find({
      collection: 'product-tags',
      where: { code: { equals: t.code } },
      limit: 1,
      depth: 0,
    })
    let tagId: number
    if (existing.totalDocs > 0) {
      tagId = existing.docs[0].id
    } else {
      const created = await payload.create({
        collection: 'product-tags',
        data: { code: t.code, order: t.order, label: t.vi },
        locale: 'vi',
      })
      tagId = created.id
      await payload.update({
        collection: 'product-tags',
        id: tagId,
        data: { label: t.en },
        locale: 'en',
      })
    }
    tagIdByCode[t.code] = tagId
    payload.logger.info(`  ✓ tag ${t.code} → id ${tagId}`)
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
    productSlug: string,
    imageIndex: number,
  ): Promise<number | null> {
    try {
      const isUrl = /^https?:\/\//i.test(imageSource)
      let buffer: Buffer
      let mimetype: string

      // Admin-friendly filename derived from the source path so each image
      // carries its purpose. `{slug}-{color}-{sourceName}.{ext}`. The seq
      // prefix keeps ordering stable inside a variant since the source
      // basenames (e.g. N13, N14) sort alphabetically rather than by shoot
      // order.
      //   hi-res/N13.png            → quan-vai-gan-den-01-n13.png
      //   quan-vai-gan/DSCF0991.JPG → quan-vai-gan-den-06-dscf0991.jpg
      //   hi-res/qua-tang-khong-ban.png → quan-vai-gan-den-07-gift.png
      //   size-charts/quan-vai-gan.jpg  → quan-vai-gan-den-08-size-chart.jpg
      const colorSlug = toLatinSlug(color) || 'default'
      const seq = String(imageIndex + 1).padStart(2, '0')
      const sourceBasename = path.basename(imageSource, path.extname(imageSource))
      const descriptor = imageSource.startsWith('size-charts/')
        ? 'size-chart'
        : sourceBasename === 'qua-tang-khong-ban'
          ? 'gift'
          : toLatinSlug(sourceBasename) || 'image'

      if (isUrl) {
        const response = await fetch(imageSource)
        const arrayBuffer = await response.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
        mimetype = 'image/jpeg'
      } else {
        // Paths starting with `hi-res/` or `size-charts/` resolve against the
        // seed directory; everything else against LOOKBOOK_DIR.
        const baseDir =
          imageSource.startsWith('hi-res/') || imageSource.startsWith('size-charts/')
            ? __dirname
            : LOOKBOOK_DIR
        const absPath = path.resolve(baseDir, imageSource)
        try {
          buffer = await readFile(absPath)
          mimetype = mimeTypeFor(absPath)
        } catch (err: unknown) {
          // Fall back to SEED_ASSETS_URL when the local file isn't on disk.
          // `hi-res/` and product-folder images are gitignored (too large),
          // so in prod builds they only exist at the remote URL. Size charts
          // ship with the repo so they always hit the disk path above.
          const isEnoent =
            err instanceof Error &&
            'code' in err &&
            (err as NodeJS.ErrnoException).code === 'ENOENT'
          const remoteBase = process.env.SEED_ASSETS_URL
          if (!isEnoent || !remoteBase) throw err
          // Mirror the baseDir mapping: hi-res/ + size-charts/ live at the
          // seed root; everything else lives under lookbook/.
          const remotePath =
            imageSource.startsWith('hi-res/') || imageSource.startsWith('size-charts/')
              ? imageSource
              : `lookbook/${imageSource}`
          const remoteUrl = `${remoteBase.replace(/\/$/, '')}/${remotePath}`
          const response = await fetch(remoteUrl)
          if (!response.ok) {
            throw new Error(`SEED_ASSETS_URL fetch failed: ${response.status} ${remoteUrl}`)
          }
          buffer = Buffer.from(await response.arrayBuffer())
          mimetype = mimeTypeFor(absPath)
        }
      }

      const ext = isUrl ? 'jpg' : path.extname(imageSource).slice(1).toLowerCase() || 'jpg'
      const fileName = `${productSlug}-${colorSlug}-${seq}-${descriptor}.${ext}`

      const tCreate = Date.now()
      payload.logger.info(`        · uploading ${fileName} (${(buffer.length / 1024) | 0} KiB)`)
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
      payload.logger.info(
        `        · uploaded ${fileName} → media#${imageDoc.id} (${Date.now() - tCreate}ms)`,
      )

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

      payload.logger.info(
        `  [${index + 1}] ▶ ${productData.name} (slug: ${productData.slug}, ${productData.colorVariants.length} variants, ${productData.colorVariants.reduce((n, v) => n + v.imageUrls.length, 0)} images)`,
      )
      const tProduct = Date.now()

      // Process all color variants with parallel image uploads
      const colorVariants: any[] = []
      const colorVariantsEn: any[] = []

      for (let vi = 0; vi < productData.colorVariants.length; vi++) {
        const variant = productData.colorVariants[vi]
        payload.logger.info(
          `  [${index + 1}]   variant ${vi + 1}/${productData.colorVariants.length} "${variant.color}" — ${variant.imageUrls.length} images`,
        )
        // Upload images for this variant sequentially. Parallel uploads here
        // stacked on the outer product-level parallelism (batch of 10) caused
        // Payload/sharp to choke on the image-resize pipeline with "invalid
        // filename" errors. Keeping products parallel but images serial keeps
        // concurrency bounded to BATCH_SIZE.
        const imageResults: Array<number | null> = []
        for (let idx = 0; idx < variant.imageUrls.length; idx++) {
          payload.logger.info(
            `  [${index + 1}]     image ${idx + 1}/${variant.imageUrls.length} ← ${variant.imageUrls[idx]}`,
          )
          const id = await uploadImage(
            variant.imageUrls[idx],
            productData.name,
            productData.nameEn,
            variant.color,
            variant.colorEn,
            productData.slug,
            idx,
          )
          imageResults.push(id)
        }
        const variantImageIds = imageResults.filter((id): id is number => id !== null)
        payload.logger.info(
          `  [${index + 1}]   variant "${variant.color}" done — ${variantImageIds.length}/${variant.imageUrls.length} images uploaded`,
        )

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

      // Override Vietnamese name + description with doc-sourced content when
      // available. Falls back to the hardcoded values in products.ts.
      const docOverride = productDocs[productData.slug]
      const viName = docOverride?.name?.trim() || productData.name
      const viDescription = docOverride?.description?.trim() || productData.description
      const enDescription = docOverride?.descriptionEn?.trim() || productData.descriptionEn

      // Build VI sizeChart payload (if present)
      const sizeChartVi = productData.sizeChart
        ? {
            columns: productData.sizeChart.columns.map((c) => ({ header: c.headerVi })),
            rows: productData.sizeChart.rows.map((cells) => ({
              cells: cells.map((value) => ({ value })),
            })),
            note: productData.sizeChart.noteVi,
          }
        : undefined

      // Create product with Vietnamese content
      payload.logger.info(`  [${index + 1}]   creating product (vi)...`)
      const product = await payload.create({
        collection: 'products',
        data: {
          name: viName,
          slug: productData.slug,
          category: uniqueCategoryIds,
          price: productData.price,
          originalPrice: productData.originalPrice,
          colorVariants: colorVariants,
          tag: productData.tag ? (tagIdByCode[productData.tag] ?? null) : null,
          featured: productData.featured,
          description: toRichText(viDescription) as any,
          features: productData.features.map((f) => ({ feature: f })),
          ...(sizeChartVi ? { sizeChart: sizeChartVi as any } : {}),
        },
        locale: 'vi',
      })
      payload.logger.info(`  [${index + 1}]   created product (vi) → id ${product.id}`)

      // Add English translation. Pass each variant's `id` from the vi
      // creation so Payload updates the en locale in place instead of
      // replacing the whole `colorVariants` array (which would wipe the vi
      // color name and leave the VI card blank).
      const createdVariants = ((product as any).colorVariants || []) as Array<{ id: string }>
      const colorVariantsEnWithIds = colorVariantsEn.map((cv, i) => ({
        ...cv,
        id: createdVariants[i]?.id,
      }))

      // Build EN sizeChart update — mirror column IDs from VI creation, EN headers only.
      // Rows are NOT passed in the EN update since cells aren't localized.
      const createdSizeChart = (product as any).sizeChart
      const sizeChartEn = productData.sizeChart
        ? {
            columns: productData.sizeChart.columns.map((c, i) => ({
              id: createdSizeChart?.columns?.[i]?.id,
              header: c.headerEn,
            })),
            note: productData.sizeChart.noteEn,
          }
        : undefined

      payload.logger.info(`  [${index + 1}]   updating en translation...`)
      await payload.update({
        collection: 'products',
        id: product.id,
        data: {
          name: productData.nameEn,
          colorVariants: colorVariantsEnWithIds,
          description: toRichText(enDescription) as any,
          features: productData.featuresEn.map((f) => ({ feature: f })),
          ...(sizeChartEn ? { sizeChart: sizeChartEn as any } : {}),
        },
        locale: 'en',
      })
      payload.logger.info(
        `  [${index + 1}] ✓ ${productData.name} fully done (${Date.now() - tProduct}ms)`,
      )

      payload.logger.info(
        `  [${index + 1}] ✓ ${productData.name} (${colorVariants.length} variants)`,
      )
    } catch (error) {
      payload.logger.error(`  [${index + 1}] ✗ Failed: ${productData.name}`)
    }
  }

  // Process products serially. Supabase's session-mode pool maxes out
  // around 10 connections, but each image upload (Payload media create +
  // 6 sharp variants + GCS writes) holds one connection for many seconds.
  // 8 products × 8 images in parallel exhausted the pool and stalled all
  // but the first product. Serial keeps total time ~bounded × the slowest
  // product (~140s × 8 ≈ 20min on prod) but reliably completes.
  const BATCH_SIZE = 1
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
              // Link.label is not localized in the shared `link()` field;
              // seed Vietnamese (primary audience). The NavComponent has
              // a matching VI fallback if the admin clears these.
              label: 'NAM',
              url: '/products?category=nam',
              newTab: false,
            },
          },
          {
            link: {
              type: 'custom',
              label: 'MỚI NHẤT',
              url: '/products?category=moi-nhat',
              newTab: false,
            },
          },
          {
            link: {
              type: 'custom',
              label: 'HOT',
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
            title: 'BỘ SƯU TẬP MÙA ĐÔNG 2026',
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
        ],
        activityCategories: activityCategoryIds,
        quickFilters: quickFiltersBase,
        featureHighlights: [
          {
            icon: 'zap',
            title: 'Hiệu Suất Cao',
            description: 'Vải công nghệ tiên tiến, thoáng khí và thấm hút mồ hôi tối ưu',
          },
          {
            icon: 'sparkles',
            title: 'Thiết Kế Hiện Đại',
            description: 'Phong cách tối giản, sang trọng phù hợp mọi hoạt động',
          },
          {
            icon: 'award',
            title: 'Chất Lượng Premium',
            description: 'Cam kết 100% chất lượng, bền bỉ theo thời gian',
          },
          {
            icon: 'flag',
            title: '100% Thuần Việt',
            description: 'Thiết kế, sản xuất và may đo hoàn toàn tại Việt Nam',
          },
        ],
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
            title: 'WINTER COLLECTION 2026',
            subtitle: 'Power in every step',
            ctaText: 'Explore Now',
          },
          {
            title: 'MODERN STYLE',
            subtitle: 'Optimized for every activity',
            ctaText: 'Explore Now',
          },
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

    // English feature highlights — same IDs, English copy
    const featureHighlightsEn = (savedHomepage.featureHighlights || []).map(
      (h: any, index: number) => {
        const en = [
          {
            title: 'High Performance',
            description: 'Advanced fabric tech — breathable and moisture-wicking',
          },
          { title: 'Modern Design', description: 'Minimalist, premium style for every activity' },
          { title: 'Premium Quality', description: '100% quality commitment, built to last' },
          {
            title: '100% Made in Vietnam',
            description: 'Designed, sourced and stitched entirely in Vietnam',
          },
        ]
        return {
          id: h.id,
          icon: h.icon,
          title: en[index]?.title || h.title,
          description: en[index]?.description || h.description,
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
        featureHighlights: featureHighlightsEn,
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
          bankName: 'BIDV',
          accountNumber: '8601104886',
          accountName: 'HO KINH DOANH THE WHITE ACTIVE',
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

    // 6b. Configure Wolfies AI assistant context
    payload.logger.info(`— Configuring chat assistant context...`)

    await payload.updateGlobal({
      slug: 'chat-context',
      locale: 'vi',
      data: {
        brandBio:
          'THE WHITE là thương hiệu thời trang thể thao Việt Nam, thiết kế và may đo 100% tại Việt Nam. ' +
          'Chúng tôi tập trung vào chất liệu kỹ thuật, phom dáng tối giản, ôm nhẹ, phù hợp cho gym, chạy bộ, yoga và hoạt động hằng ngày.',
        sizeGuide:
          'Bảng số đo chính thức THE WHITE (đo sản phẩm khi nằm phẳng, đơn vị cm, chiều cao cm/m, cân nặng kg). Với chất liệu Polyester + Spandex co giãn 4 chiều — giữa 2 size, chọn size nhỏ để ôm, size lớn để thoải mái.\n' +
          '\n' +
          '=== ÁO (Tanktop / Tay Ngắn / Tay Dài / Tank Hở Sườn) ===\n' +
          'Chỉ còn size L và XL.\n' +
          '- Size L: chiều cao 1m6–1m7, cân nặng 55–65 kg. Dài thân trước 69 · 1/2 ngang ngực 51 · 1/2 ngang gấu 51 · ngang cổ 15.\n' +
          '- Size XL: chiều cao 1m7–1m85, cân nặng 65–75 kg. Dài thân trước 71 · 1/2 ngang ngực 53 · 1/2 ngang gấu 53 · ngang cổ 16.5.\n' +
          '\n' +
          '=== QUẦN VẢI GÂN ===\n' +
          '- Size M: chiều cao 1m6–1m7, cân nặng 55–65 kg. Dài quần 45.5 · vòng eo 35.5 · vòng mông 18.5.\n' +
          '- Size L: chiều cao 1m7–1m85, cân nặng 65–75 kg. Dài quần 47 · vòng eo 36.5 · vòng mông 19.\n' +
          '\n' +
          '=== QUẦN SHORT 2 LỚP ===\n' +
          '- Size M: chiều cao 1m6–1m7, cân nặng 55–65 kg. Dài quần 38 · vòng eo 39.5 · vòng mông 30 · bo gấu 20.\n' +
          '- Size L: chiều cao 1m7–1m85, cân nặng 65–75 kg. Dài quần 39.2 · vòng eo 39.5 · vòng mông 31.5 · bo gấu 20.5.\n' +
          '\n' +
          '=== QUẦN 1 LỚP TÚI CHÉO ===\n' +
          '- Size M: chiều cao 1m6–1m7, cân nặng 55–65 kg. Dài quần 40 · vòng eo 68 · vòng mông 32.5.\n' +
          '- Size L: chiều cao 1m7–1m85, cân nặng 65–75 kg. Dài quần 41.5 · vòng eo 72 · vòng mông 34.\n' +
          '\n' +
          '=== QUẦN 1 LỚP TÚI SAU (TÍNH NĂNG) ===\n' +
          '- Size M: chiều cao 1m6–1m7, cân nặng 55–65 kg. Dài quần 43.5 · 1/2 eo 36 · vòng mông 53 · ngang đùi 34.5 · ngang ống 31.\n' +
          '- Size L: chiều cao 1m7–1m85, cân nặng 65–75 kg. Dài quần 44.5 · 1/2 eo 38 · vòng mông 55 · ngang đùi 35.5 · ngang ống 32.\n' +
          '\n' +
          'Gợi ý nhanh theo chiều cao:\n' +
          '- 1m65–1m72 / dưới 65 kg: áo XL (hơi rộng nhưng vẫn đẹp) · quần size M.\n' +
          '- 1m73–1m80 / 65–72 kg: áo XL vừa · quần M hoặc L tuỳ cân (dưới 70 kg → M, trên 70 kg → L).\n' +
          '- 1m81–1m88 / 72–80 kg: áo XL ôm · quần size L.',
        shippingPolicy:
          'Ship toàn quốc qua đơn vị vận chuyển. Phí ship cố định 30.000₫ (miễn phí khi áp mã giảm vận chuyển). Thời gian giao dự kiến: HCM/Hà Nội 1–2 ngày làm việc, các tỉnh khác 3–5 ngày.',
        returnPolicy:
          'Đổi/trả miễn phí trong 7 ngày kể từ ngày nhận hàng, với điều kiện sản phẩm còn nguyên tem mác, chưa qua sử dụng. Liên hệ Zalo hoặc email để mở yêu cầu đổi trả.',
        contactInfo:
          'Hotline/Zalo: +84 886 402 616\n' +
          'Email: contact@thewhite.cool\n' +
          'Facebook: facebook.com/thewhiteactive\n' +
          'Instagram: @thewhite.cool',
        siteFeatures:
          '- AI Thử Đồ Ảo (Virtual Try-On): upload ảnh cá nhân, hệ thống tạo ảnh mô phỏng mặc sản phẩm. Giới hạn 5 lượt/ngày mỗi tài khoản.\n' +
          '- AI Chọn Size Thông Minh: nhập chiều cao/cân nặng/số đo, gợi ý size phù hợp cho từng loại sản phẩm.\n' +
          '- Danh sách yêu thích (Wishlist): lưu sản phẩm để mua sau, đồng bộ giữa các thiết bị khi đăng nhập.\n' +
          '- So sánh sản phẩm (Compare): so sánh tối đa 4 sản phẩm cùng lúc trên một màn hình.\n' +
          '- Tích điểm Loyalty: 1 điểm / 10.000₫, 100 điểm = 10.000₫ giảm giá. +50-100 điểm cho đánh giá sản phẩm.\n' +
          '- Giới thiệu bạn bè (Referral): chia sẻ mã giới thiệu, nhận 200 điểm khi bạn đặt đơn đầu tiên.\n' +
          '- Thanh toán: Chuyển khoản (QR VietQR tự động) hoặc COD (thanh toán khi nhận hàng).',
      },
    })

    await payload.updateGlobal({
      slug: 'chat-context',
      locale: 'en',
      data: {
        brandBio:
          'THE WHITE is a Vietnamese athletic / streetwear brand, designed and stitched 100% in Vietnam. ' +
          'We focus on technical fabrics and minimalist silhouettes for gym, running, yoga, and everyday wear.',
        sizeGuide:
          'THE WHITE official size chart (flat-lay garment measurements in cm; height and weight are customer body metrics). Fabric is Polyester + 4-way-stretch Spandex — between two sizes, pick down for a tighter fit or up for a relaxed one.\n' +
          '\n' +
          '=== TOPS (Tanktop / Short Sleeve / Long Sleeve / Open-side Tank) ===\n' +
          'Only L and XL in stock.\n' +
          '- L: height 160–170 cm, weight 55–65 kg. Body length 69 · 1/2 chest 51 · 1/2 hem 51 · neck 15.\n' +
          '- XL: height 170–185 cm, weight 65–75 kg. Body length 71 · 1/2 chest 53 · 1/2 hem 53 · neck 16.5.\n' +
          '\n' +
          '=== KNIT (VẢI GÂN) PANTS ===\n' +
          '- M: height 160–170 cm, weight 55–65 kg. Inseam 45.5 · waist 35.5 · hip 18.5.\n' +
          '- L: height 170–185 cm, weight 65–75 kg. Inseam 47 · waist 36.5 · hip 19.\n' +
          '\n' +
          '=== 2-LAYER SHORTS ===\n' +
          '- M: 160–170 cm, 55–65 kg. Inseam 38 · waist 39.5 · hip 30 · hem 20.\n' +
          '- L: 170–185 cm, 65–75 kg. Inseam 39.2 · waist 39.5 · hip 31.5 · hem 20.5.\n' +
          '\n' +
          '=== 1-LAYER SIDE-POCKET SHORTS ===\n' +
          '- M: 160–170 cm, 55–65 kg. Inseam 40 · waist 68 · hip 32.5.\n' +
          '- L: 170–185 cm, 65–75 kg. Inseam 41.5 · waist 72 · hip 34.\n' +
          '\n' +
          '=== 1-LAYER BACK-POCKET (FUNCTIONAL) SHORTS ===\n' +
          '- M: 160–170 cm, 55–65 kg. Inseam 43.5 · 1/2 waist 36 · hip 53 · thigh 34.5 · leg opening 31.\n' +
          '- L: 170–185 cm, 65–75 kg. Inseam 44.5 · 1/2 waist 38 · hip 55 · thigh 35.5 · leg opening 32.\n' +
          '\n' +
          'Quick height guide:\n' +
          '- 165–172 cm / under 65 kg: XL top (slightly loose but still looks good) · M shorts.\n' +
          '- 173–180 cm / 65–72 kg: XL top fits well · M or L shorts based on weight (<70 → M, >70 → L).\n' +
          '- 181–188 cm / 72–80 kg: XL top snug · L shorts.',
        shippingPolicy:
          'Nationwide shipping via courier. Flat 30,000₫ fee (free with shipping-discount coupons). ETA: 1–2 business days to HCMC / Hanoi, 3–5 days to other provinces.',
        returnPolicy:
          'Free returns within 7 days of receipt if the item is unworn and tags are intact. Message us on Zalo or email to open a return request.',
        contactInfo:
          'Hotline / Zalo: +84 886 402 616\n' +
          'Email: contact@thewhite.cool\n' +
          'Facebook: facebook.com/thewhiteactive\n' +
          'Instagram: @thewhite.cool',
        siteFeatures:
          '- AI Virtual Try-On: upload a personal photo, get an AI-generated preview wearing the product. 5 tries/day per account.\n' +
          '- AI Smart Size Picker: enter height/weight/measurements, get a size recommendation per product line.\n' +
          '- Wishlist: save products for later, synced across devices when logged in.\n' +
          '- Compare: up to 4 products side by side.\n' +
          '- Loyalty points: earn 1 pt / 10,000₫ spent, redeem 100 pts = 10,000₫. +50-100 pts for product reviews.\n' +
          '- Referrals: share your code, get 200 pts when your friend places their first order.\n' +
          '- Payment: Bank transfer (auto VietQR) or COD (cash on delivery).',
      },
    })

    payload.logger.info(`  ✓ Chat assistant context configured (vi + en)`)

    // Footer is now hardcoded + category-driven; no fields to seed.
    // (See src/components/layout/Footer/Component.tsx.)
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
