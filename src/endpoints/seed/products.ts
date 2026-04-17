/**
 * V1 product catalogue for The White — 8 SKUs with authoritative pricing
 * from the brand's finance sheet (Projected Revenue / DOANH THU GIẢ ĐỊNH).
 *
 * Image paths are relative to `src/endpoints/seed/lookbook/` (downloaded via
 * `scripts/fetch-drive-assets.sh`). The seed's `uploadImage()` helper detects
 * non-URL strings and reads them from disk.
 *
 * Prices source (VND, retail) — pants stock M/L only, tops stock XL only:
 *   QUẦN VẢI GÂN           455,000   (M/L × 100 = 200 units)
 *   QUẦN 2 LỚP             415,000   (M/L × 100 = 200)
 *   ÁO TAY DÀI             299,000   (XL × 50 = 50)
 *   QUẦN 1 LỚP             259,000   (M/L × 50 = 100)
 *   ÁO THUN TAY NGẮN       259,000   (XL × 50 = 50)
 *   QUẦN 1 LỚP TÍNH NĂNG   239,000   (M/L × 50 = 100)
 *   ÁO TANKTOP SÁT NÁCH    200,000   (XL × 50 = 50)
 *   ÁO TANKTOP HỞ SƯỜN     200,000   (XL × 50 = 50)
 *
 * Combos (bundle pricing, to be modeled later as Coupons or Bundle products):
 *   Combo 2 Áo Tank:                  359,000
 *   Combo 2 quần short:               469,000
 *   Combo áo thun tay ngắn + dài:     519,000
 *   Combo quần vải gân + 2 lớp:       829,000
 */

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
  imageUrls: string[] // local path under lookbook/ OR http(s) URL — seed auto-detects
}

export interface SizeChartColumnSeed {
  headerVi: string
  headerEn: string
}

export interface SizeChartSeed {
  columns: SizeChartColumnSeed[]
  rows: string[][] // each inner array is the cell values for one row, in column order
  noteVi?: string
  noteEn?: string
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
  sizeChart?: SizeChartSeed
}

// Taxonomy used by the storefront listing/filters. Trimmed to categories that
// actually map to v1 SKUs — drop Nữ / Trẻ Em / Bộ Tập Luyện / Giày Thể Thao /
// Bóng Đá until those product lines exist.
export const categorySeedData: Array<{ title: string; titleEn: string }> = [
  { title: 'Nam', titleEn: 'Men' },
  { title: 'Mới Nhất', titleEn: 'New Arrivals' },
  { title: 'Áo Thể Thao', titleEn: 'Sports Tops' },
  { title: 'Quần Short', titleEn: 'Shorts' },
  { title: 'Quần Dài', titleEn: 'Long Pants' },
  { title: 'Chạy Bộ', titleEn: 'Running' },
  { title: 'Gym', titleEn: 'Gym' },
  { title: 'Yoga', titleEn: 'Yoga' },
]

// Per-size inventory helpers — pants carry M/L only, tops carry XL only.
const pantsInventory = (qty: number): SizeInventoryItem[] =>
  ['M', 'L'].map((size) => ({ size, stock: qty, lowStockThreshold: 10 }))

const topsInventory = (qty: number): SizeInventoryItem[] => [
  { size: 'XL', stock: qty, lowStockThreshold: 10 },
]

const defaultColor = {
  color: 'Đen',
  colorEn: 'Black',
  colorHex: '#000000',
}

// Brand-wide promotional bonus — every v1 product ships with a branded
// "not-for-sale" gift. Spliced onto every product's `features` arrays below.
const GIFT_FEATURE_VI = '🎁 Kèm quà tặng không bán'
const GIFT_FEATURE_EN = '🎁 Includes complimentary not-for-sale gift'

// Shared size-chart note (all 8 products)
const SIZE_CHART_NOTE_VI =
  'Số đo đo trên sản phẩm khi nằm phẳng (cm). Chất liệu Polyester + Spandex co giãn 4 chiều — giữa 2 size, chọn size nhỏ để ôm, size lớn để thoải mái.'
const SIZE_CHART_NOTE_EN =
  'Garment measurements when laid flat (cm). Polyester + 4-way-stretch Spandex — between two sizes, pick down for a tighter fit or up for a relaxed one.'

// Size chart templates — reused across products of the same line.
const TOPS_SIZE_CHART: SizeChartSeed = {
  columns: [
    { headerVi: 'Size', headerEn: 'Size' },
    { headerVi: 'Chiều cao (cm)', headerEn: 'Height (cm)' },
    { headerVi: 'Cân nặng (kg)', headerEn: 'Weight (kg)' },
    { headerVi: 'Dài thân trước', headerEn: 'Front length' },
    { headerVi: '1/2 Ngang ngực', headerEn: '1/2 Chest' },
    { headerVi: '1/2 Ngang gấu', headerEn: '1/2 Hem' },
    { headerVi: 'Ngang cổ', headerEn: 'Neck' },
  ],
  rows: [
    ['L', '160–170', '55–65', '69', '51', '51', '15'],
    ['XL', '170–185', '65–75', '71', '53', '53', '16.5'],
  ],
  noteVi: SIZE_CHART_NOTE_VI,
  noteEn: SIZE_CHART_NOTE_EN,
}

const VAI_GAN_SIZE_CHART: SizeChartSeed = {
  columns: [
    { headerVi: 'Size', headerEn: 'Size' },
    { headerVi: 'Chiều cao (cm)', headerEn: 'Height (cm)' },
    { headerVi: 'Cân nặng (kg)', headerEn: 'Weight (kg)' },
    { headerVi: 'Dài quần', headerEn: 'Inseam' },
    { headerVi: 'Vòng eo', headerEn: 'Waist' },
    { headerVi: 'Vòng mông', headerEn: 'Hip' },
  ],
  rows: [
    ['M', '160–170', '55–65', '45.5', '35.5', '18.5'],
    ['L', '170–185', '65–75', '47', '36.5', '19'],
  ],
  noteVi: SIZE_CHART_NOTE_VI,
  noteEn: SIZE_CHART_NOTE_EN,
}

const SHORT_2_LOP_SIZE_CHART: SizeChartSeed = {
  columns: [
    { headerVi: 'Size', headerEn: 'Size' },
    { headerVi: 'Chiều cao (cm)', headerEn: 'Height (cm)' },
    { headerVi: 'Cân nặng (kg)', headerEn: 'Weight (kg)' },
    { headerVi: 'Dài quần', headerEn: 'Inseam' },
    { headerVi: 'Vòng eo', headerEn: 'Waist' },
    { headerVi: 'Vòng mông', headerEn: 'Hip' },
    { headerVi: 'Bo gấu', headerEn: 'Hem' },
  ],
  rows: [
    ['M', '160–170', '55–65', '38', '39.5', '30', '20'],
    ['L', '170–185', '65–75', '39.2', '39.5', '31.5', '20.5'],
  ],
  noteVi: SIZE_CHART_NOTE_VI,
  noteEn: SIZE_CHART_NOTE_EN,
}

const TUI_CHEO_SIZE_CHART: SizeChartSeed = {
  columns: [
    { headerVi: 'Size', headerEn: 'Size' },
    { headerVi: 'Chiều cao (cm)', headerEn: 'Height (cm)' },
    { headerVi: 'Cân nặng (kg)', headerEn: 'Weight (kg)' },
    { headerVi: 'Dài quần', headerEn: 'Inseam' },
    { headerVi: 'Vòng eo', headerEn: 'Waist' },
    { headerVi: 'Vòng mông', headerEn: 'Hip' },
  ],
  rows: [
    ['M', '160–170', '55–65', '40', '68', '32.5'],
    ['L', '170–185', '65–75', '41.5', '72', '34'],
  ],
  noteVi: SIZE_CHART_NOTE_VI,
  noteEn: SIZE_CHART_NOTE_EN,
}

const TUI_SAU_SIZE_CHART: SizeChartSeed = {
  columns: [
    { headerVi: 'Size', headerEn: 'Size' },
    { headerVi: 'Chiều cao (cm)', headerEn: 'Height (cm)' },
    { headerVi: 'Cân nặng (kg)', headerEn: 'Weight (kg)' },
    { headerVi: 'Dài quần', headerEn: 'Inseam' },
    { headerVi: '1/2 eo', headerEn: '1/2 Waist' },
    { headerVi: 'Vòng mông', headerEn: 'Hip' },
    { headerVi: 'Ngang đùi', headerEn: 'Thigh' },
    { headerVi: 'Ngang ống', headerEn: 'Leg opening' },
  ],
  rows: [
    ['M', '160–170', '55–65', '43.5', '36', '53', '34.5', '31'],
    ['L', '170–185', '65–75', '44.5', '38', '55', '35.5', '32'],
  ],
  noteVi: SIZE_CHART_NOTE_VI,
  noteEn: SIZE_CHART_NOTE_EN,
}

export const productSeedData: ProductSeedData[] = [
  {
    name: 'Quần Vải Gân',
    nameEn: 'Ribbed-Fabric Pants',
    slug: 'quan-vai-gan',
    categoryTitle: 'Quần Dài',
    additionalCategories: ['Nam', 'Yoga', 'Gym', 'Mới Nhất'],
    price: 455_000,
    tag: 'hot',
    featured: true,
    colorVariants: [
      {
        ...defaultColor,
        sizeInventory: pantsInventory(100),
        imageUrls: [
          'hi-res/N13.png',
          'hi-res/N14.png',
          'hi-res/N24.png',
          'hi-res/N27.png',
          'quan-vai-gan/ÁO_TANK_HỞ_SƯỜN_+_QUẦN_VẢI_GÂN.jpg',
          'quan-vai-gan/DSCF0991.JPG',

          'hi-res/qua-tang-khong-ban.png',
        ],
      },
    ],
    description:
      'Quần dài vải gân co giãn cao cấp — ôm chân vừa phải, bền đẹp, thích hợp yoga, gym và mặc hàng ngày.',
    descriptionEn:
      'Premium ribbed stretch pants with a flattering fit — yoga, gym, and everyday ready.',
    features: [
      GIFT_FEATURE_VI,
      'Vải gân co giãn cao cấp',
      'Ôm dáng vừa phải',
      'Đa dụng yoga • gym • hàng ngày',
    ],
    featuresEn: [
      GIFT_FEATURE_EN,
      'Premium ribbed stretch fabric',
      'Flattering fit',
      'Multi-use yoga • gym • daily',
    ],
    sizeChart: VAI_GAN_SIZE_CHART,
  },
  {
    name: 'Quần Short 2 Lớp',
    nameEn: 'Double-Layer Shorts',
    slug: 'quan-short-2-lop',
    categoryTitle: 'Quần Short',
    additionalCategories: ['Nam', 'Chạy Bộ', 'Gym'],
    price: 415_000,
    tag: 'bestseller',
    featured: true,
    colorVariants: [
      {
        ...defaultColor,
        sizeInventory: pantsInventory(100),
        imageUrls: [
          'hi-res/N9.png',
          'hi-res/N10.png',
          'hi-res/N23.png',
          'hi-res/N27.png',
          'quan-short-2-lop/_ÁO_THUN_TAY_NGẮN_+_QUẦN_SHORT_2_LỚP.jpg',
          'quan-short-2-lop/DSCF4022_3.JPG',

          'hi-res/qua-tang-khong-ban.png',
        ],
      },
    ],
    description:
      'Quần short 2 lớp — lớp compression bên trong nâng cơ, lớp ngoài thoáng khí. Dành cho chạy bộ và gym.',
    descriptionEn:
      'Double-layer shorts — inner compression liner plus airy outer shell. Running and gym ready.',
    features: [GIFT_FEATURE_VI, 'Thiết kế 2 lớp', 'Lớp trong compression', 'Phù hợp chạy bộ & gym'],
    featuresEn: [
      GIFT_FEATURE_EN,
      'Double-layer design',
      'Compression inner liner',
      'Ideal for running & gym',
    ],
    sizeChart: SHORT_2_LOP_SIZE_CHART,
  },
  {
    name: 'Áo Tay Dài',
    nameEn: 'Long-Sleeve T-Shirt',
    slug: 'ao-thun-tay-dai',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Chạy Bộ'],
    price: 299_000,
    featured: true,
    colorVariants: [
      {
        ...defaultColor,
        sizeInventory: topsInventory(50),
        imageUrls: [
          'hi-res/N15.png',
          'hi-res/N16.png',
          'hi-res/N19.png',
          'hi-res/N28.png',
          'ao-thun-tay-dai/_ÁO_TAY_DÀI_+_QUẦN_TÚI_SAU.jpg',
          'ao-thun-tay-dai/_ÁO_THUN_TAY_DÀI.jpg',

          'hi-res/qua-tang-khong-ban.png',
        ],
      },
    ],
    description:
      'Áo tay dài mỏng nhẹ — lớp nền lý tưởng cho các buổi chạy sáng sớm hoặc ngày lạnh.',
    descriptionEn:
      'Lightweight long-sleeve tee — perfect base layer for chilly mornings or cool-weather runs.',
    features: [GIFT_FEATURE_VI, 'Tay dài ôm gọn', 'Nhẹ và bám', 'Lớp nền tiện dụng'],
    featuresEn: [GIFT_FEATURE_EN, 'Snug long sleeves', 'Light and clingy', 'Versatile base layer'],
    sizeChart: TOPS_SIZE_CHART,
  },
  {
    name: 'Quần 1 Lớp',
    nameEn: 'Single-Layer Shorts',
    slug: 'quan-short-tui-cheo',
    categoryTitle: 'Quần Short',
    additionalCategories: ['Nam'],
    price: 259_000,
    featured: false,
    colorVariants: [
      {
        ...defaultColor,
        sizeInventory: pantsInventory(50),
        imageUrls: [
          'hi-res/N7.png',
          'hi-res/N8.png',
          'hi-res/N21.png',
          'hi-res/N22.png',
          'hi-res/N26.png',
          'quan-short-tui-cheo/QUẦN_TÚI_CHÉO_+_ÁO_TANK_SÁT_NÁCH.jpg',

          'hi-res/qua-tang-khong-ban.png',
        ],
      },
    ],
    description:
      'Quần short 1 lớp phom suông với túi chéo thời trang — dùng được cả khi đi tập và mặc thường ngày.',
    descriptionEn:
      'Single-layer shorts with stylish diagonal pockets — works for both workouts and casual wear.',
    features: [GIFT_FEATURE_VI, 'Túi chéo thời trang', 'Form suông', 'Đa dụng'],
    featuresEn: [GIFT_FEATURE_EN, 'Stylish diagonal pockets', 'Relaxed fit', 'Versatile'],
    sizeChart: TUI_CHEO_SIZE_CHART,
  },
  {
    name: 'Áo Thun Tay Ngắn',
    nameEn: 'Short-Sleeve T-Shirt',
    slug: 'ao-thun-tay-ngan',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Mới Nhất'],
    price: 259_000,
    tag: 'new',
    featured: true,
    colorVariants: [
      {
        ...defaultColor,
        sizeInventory: topsInventory(50),
        imageUrls: [
          'hi-res/N1.png',
          'hi-res/N2.png',
          'hi-res/N18.png',
          'hi-res/N28.png',
          'ao-thun-tay-ngan/ÁO_THUN_TAY_NGẮN_+_QUẦN_2_LỚP.jpg',
          'ao-thun-tay-ngan/DSCF0833.JPG',

          'hi-res/qua-tang-khong-ban.png',
        ],
      },
    ],
    description: 'Áo thun tay ngắn basic — dáng suông, chất vải mịn, mặc cả khi tập lẫn đi chơi.',
    descriptionEn: 'Basic short-sleeve tee — relaxed cut with soft fabric, training or casual.',
    features: [GIFT_FEATURE_VI, 'Dáng suông cơ bản', 'Chất vải mịn', 'Đa dụng'],
    featuresEn: [GIFT_FEATURE_EN, 'Classic relaxed cut', 'Soft fabric', 'Versatile'],
    sizeChart: TOPS_SIZE_CHART,
  },
  {
    name: 'Quần 1 Lớp Tính Năng',
    nameEn: 'Performance Single-Layer Shorts',
    slug: 'quan-short-tui-sau',
    categoryTitle: 'Quần Short',
    additionalCategories: ['Nam', 'Chạy Bộ'],
    price: 239_000,
    featured: false,
    colorVariants: [
      {
        ...defaultColor,
        sizeInventory: pantsInventory(50),
        imageUrls: [
          'hi-res/N11.png',
          'hi-res/N12.png',
          'hi-res/N26.png',
          'quan-short-tui-sau/_ÁO_TAY_DÀI_+_QUẦN_TÚI_SAU.jpg',
          'quan-short-tui-sau/59.jpg',
          'quan-short-tui-sau/Thiết_kế_chưa_có_tên_(1).jpg',

          'hi-res/qua-tang-khong-ban.png',
        ],
      },
    ],
    description:
      'Quần short chạy bộ 1 lớp tính năng — túi sau có khóa kéo giữ chìa khóa và tai nghe an toàn.',
    descriptionEn:
      'Performance single-layer running shorts — zippered back pocket secures keys and earbuds.',
    features: [GIFT_FEATURE_VI, 'Túi sau có khóa kéo', 'Phom nhẹ thoáng', 'Dành cho runner'],
    featuresEn: [GIFT_FEATURE_EN, 'Zippered back pocket', 'Lightweight fit', 'Runner-ready'],
    sizeChart: TUI_SAU_SIZE_CHART,
  },
  {
    name: 'Áo Tanktop Sát Nách',
    nameEn: 'Fitted Tank Top',
    slug: 'ao-tank-sat-nach',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Gym'],
    price: 200_000,
    featured: true,
    colorVariants: [
      {
        ...defaultColor,
        sizeInventory: topsInventory(50),
        imageUrls: [
          'hi-res/N3.png',
          'hi-res/N4.png',
          'hi-res/N17.png',
          'hi-res/N20.png',
          'hi-res/N25.png',
          'ao-tank-sat-nach/72.JPG',
          'ao-tank-sat-nach/IMG_2847.JPG',
          'ao-tank-sat-nach/QUẦN_TÚI_CHÉO_+_ÁO_TANK_SÁT_NÁCH.jpg',

          'hi-res/qua-tang-khong-ban.png',
        ],
      },
    ],
    description: 'Áo tanktop sát nách ôm vừa — khoe cơ vai và cánh tay khi tập gym.',
    descriptionEn:
      'Fitted tank with a slim-cut armhole — highlights shoulders and arms during training.',
    features: [GIFT_FEATURE_VI, 'Phom ôm vừa', 'Cổ tròn cơ bản', 'Dành cho gym'],
    featuresEn: [GIFT_FEATURE_EN, 'Slim fit', 'Classic crew neck', 'Gym-ready'],
    sizeChart: TOPS_SIZE_CHART,
  },
  {
    name: 'Áo Tanktop Hở Sườn',
    nameEn: 'Open-Side Tank Top',
    slug: 'ao-tank-ho-suon',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Gym'],
    price: 200_000,
    tag: 'hot',
    featured: true,
    colorVariants: [
      {
        ...defaultColor,
        sizeInventory: topsInventory(50),
        imageUrls: [
          'hi-res/N5.png',
          'hi-res/N6.png',
          'ao-tank-ho-suon/_ẢNH_CHI_TIẾT.jpg',
          'ao-tank-ho-suon/_ẢNH_NGƯỜI_MẪU.jpg',
          'ao-tank-ho-suon/ẢNH_NGƯỜI_MẪU.jpg',

          'hi-res/qua-tang-khong-ban.png',
        ],
      },
    ],
    description: 'Áo tanktop hở sườn — thoáng tối đa cho các buổi tập cường độ cao.',
    descriptionEn: 'Open-side tank top — maximum airflow for high-intensity sessions.',
    features: [GIFT_FEATURE_VI, 'Hở sườn thoáng khí', 'Nhẹ và mau khô', 'Dành cho gym'],
    featuresEn: [GIFT_FEATURE_EN, 'Open-side airflow', 'Lightweight quick-dry', 'Gym-focused'],
    sizeChart: TOPS_SIZE_CHART,
  },
]
