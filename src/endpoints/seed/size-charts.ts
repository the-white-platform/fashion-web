/**
 * Size chart seed data — one JPEG per product line, sourced from the brand's Drive folder.
 * Images live at `src/endpoints/seed/size-charts/<fileName>` (downloaded via scripts/fetch-drive-assets.sh).
 * Linked to an existing category via `categoryTitle` (matches `categorySeedData` in ./products.ts).
 */

export interface SizeChartSeedData {
  fileName: string
  titleVi: string
  titleEn: string
  altVi: string
  altEn: string
  categoryTitle: string // VI title from categorySeedData
}

export const sizeChartSeedData: SizeChartSeedData[] = [
  {
    fileName: 'ao-tank-ho-suon.jpg',
    titleVi: 'Bảng size — Áo Tank Hở Sườn',
    titleEn: 'Size Chart — Open-Side Tank',
    altVi: 'Bảng hướng dẫn chọn size áo tank hở sườn',
    altEn: 'Size guide for open-side tank top',
    categoryTitle: 'Áo Thể Thao',
  },
  {
    fileName: 'ao-tank-sat-nach.jpg',
    titleVi: 'Bảng size — Áo Tank Sát Nách',
    titleEn: 'Size Chart — Fitted Tank',
    altVi: 'Bảng hướng dẫn chọn size áo tank sát nách',
    altEn: 'Size guide for fitted tank top',
    categoryTitle: 'Áo Thể Thao',
  },
  {
    fileName: 'ao-thun-tay-dai.jpg',
    titleVi: 'Bảng size — Áo Thun Tay Dài',
    titleEn: 'Size Chart — Long-Sleeve T-Shirt',
    altVi: 'Bảng hướng dẫn chọn size áo thun tay dài',
    altEn: 'Size guide for long-sleeve t-shirt',
    categoryTitle: 'Áo Thể Thao',
  },
  {
    fileName: 'ao-thun-tay-ngan.jpg',
    titleVi: 'Bảng size — Áo Thun Tay Ngắn',
    titleEn: 'Size Chart — Short-Sleeve T-Shirt',
    altVi: 'Bảng hướng dẫn chọn size áo thun tay ngắn',
    altEn: 'Size guide for short-sleeve t-shirt',
    categoryTitle: 'Áo Thể Thao',
  },
  {
    fileName: 'quan-short-2-lop.jpg',
    titleVi: 'Bảng size — Quần Short 2 Lớp',
    titleEn: 'Size Chart — Double-Layer Shorts',
    altVi: 'Bảng hướng dẫn chọn size quần short 2 lớp',
    altEn: 'Size guide for double-layer shorts',
    categoryTitle: 'Quần Short',
  },
  {
    fileName: 'quan-short-tui-cheo.jpg',
    titleVi: 'Bảng size — Quần Short Túi Chéo',
    titleEn: 'Size Chart — Diagonal-Pocket Shorts',
    altVi: 'Bảng hướng dẫn chọn size quần short túi chéo',
    altEn: 'Size guide for diagonal-pocket shorts',
    categoryTitle: 'Quần Short',
  },
  {
    fileName: 'quan-short-tui-sau.jpg',
    titleVi: 'Bảng size — Quần Short Túi Sau',
    titleEn: 'Size Chart — Back-Pocket Shorts',
    altVi: 'Bảng hướng dẫn chọn size quần short túi sau',
    altEn: 'Size guide for back-pocket shorts',
    categoryTitle: 'Quần Short',
  },
  {
    fileName: 'quan-vai-gan.jpg',
    titleVi: 'Bảng size — Quần Vải Gân',
    titleEn: 'Size Chart — Ribbed-Fabric Pants',
    altVi: 'Bảng hướng dẫn chọn size quần vải gân',
    altEn: 'Size guide for ribbed-fabric pants',
    categoryTitle: 'Quần Dài',
  },
]
