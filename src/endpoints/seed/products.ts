// Product seed data for development environment
// Uses placeholder images from Unsplash for dev only

export interface ProductSeedData {
  name: string
  slug: string
  categoryTitle: string // Will be resolved to category ID
  additionalCategories?: string[] // Additional categories like Gender
  price: number
  originalPrice?: number
  tag?: string
  inStock: boolean
  featured: boolean
  colors: { name: string; hex: string }[]
  sizes: string[]
  description: string
  features: string[]
  imageUrls: string[] // Placeholder URLs for dev
}

// Dev placeholder images from Unsplash (free, high-quality fashion/sportswear images)
const placeholderImages = {
  sportswear: [
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80', // Sports apparel
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', // Fashion model
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', // Shopping fashion
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80', // Fashion retail
  ],
  running: [
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80', // Running person
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80', // Running shoes
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80', // Athletic shoes
  ],
  gym: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', // Gym weights
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', // Gym training
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', // Workout gear
  ],
}

// Product seed data
export const productSeedData: ProductSeedData[] = [
  // Áo Thể Thao
  {
    name: 'Áo Training Performance',
    slug: 'ao-training-performance',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Gym'],
    price: 890000,
    tag: 'MỚI',
    inStock: true,
    featured: true,
    colors: [
      { name: 'Đen', hex: '#1d2122' },
      { name: 'Trắng', hex: '#ebe7db' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description:
      'Áo training cao cấp với công nghệ thấm hút mồ hôi, thiết kế hiện đại phù hợp cho các hoạt động thể thao cường độ cao.',
    features: [
      'Chất liệu polyester cao cấp',
      'Công nghệ thấm hút mồ hôi',
      'Form dáng slim fit hiện đại',
      'Thoáng khí, nhanh khô',
    ],
    imageUrls: [placeholderImages.sportswear[0], placeholderImages.sportswear[1]],
  },
  {
    name: 'Áo Polo Slim Fit',
    slug: 'ao-polo-slim-fit',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam'],
    price: 790000,
    tag: 'BÁN CHẠY',
    inStock: true,
    featured: true,
    colors: [{ name: 'Đen', hex: '#1d2122' }],
    sizes: ['S', 'M', 'L', 'XL', '2X'],
    description:
      'Áo polo thể thao thiết kế slim fit, chất liệu cotton pha thoáng mát, phù hợp cho thể thao và công sở.',
    features: ['Cotton pha 60/40', 'Form dáng slim fit', 'Cổ bẻ classic', 'Thích hợp nhiều dịp'],
    imageUrls: [placeholderImages.sportswear[1], placeholderImages.sportswear[2]],
  },
  {
    name: 'Áo Thun Basic Heavy',
    slug: 'ao-thun-basic-heavy',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Nữ'],
    price: 690000,
    tag: 'MỚI',
    inStock: true,
    featured: false,
    colors: [
      { name: 'Xám', hex: '#a9a9a9' },
      { name: 'Đen', hex: '#1d2122' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description:
      'Áo thun heavyweight cotton 100%, oversize form phù hợp cho gym và đi chơi hàng ngày.',
    features: [
      'Cotton 100% heavyweight',
      'Form oversize trendy',
      'Độ bền cao',
      'Thoải mái vận động',
    ],
    imageUrls: [placeholderImages.sportswear[2], placeholderImages.sportswear[3]],
  },
  {
    name: 'Áo Khoác Thể Thao',
    slug: 'ao-khoac-the-thao',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Chạy Bộ'],
    price: 1290000,
    originalPrice: 1590000,
    tag: 'GIẢM 20%',
    inStock: true,
    featured: true,
    colors: [{ name: 'Đen', hex: '#1d2122' }],
    sizes: ['M', 'L', 'XL'],
    description:
      'Áo khoác thể thao chống gió, chống nước nhẹ, thiết kế năng động với phong cách streetwear.',
    features: [
      'Chống gió, chống nước nhẹ',
      'Túi zip tiện lợi',
      'Mũ trùm điều chỉnh được',
      'Chất liệu bền bỉ',
    ],
    imageUrls: [placeholderImages.sportswear[3], placeholderImages.sportswear[0]],
  },
  // Quần Short
  {
    name: 'Quần Short Training',
    slug: 'quan-short-training',
    categoryTitle: 'Gym',
    additionalCategories: ['Nam', 'Quần Short'],
    price: 590000,
    tag: 'MỚI',
    inStock: false,
    featured: false,
    colors: [{ name: 'Đen', hex: '#1d2122' }],
    sizes: ['S', 'M', 'L', 'XL'],
    description:
      'Quần short training với chất liệu co giãn 4 chiều, phù hợp cho mọi bài tập thể thao.',
    features: ['Co giãn 4 chiều', 'Túi zip bảo mật', 'Lưng thun thoải mái', 'Nhanh khô'],
    imageUrls: [placeholderImages.gym[0], placeholderImages.gym[1]],
  },
  {
    name: 'Quần Short 2 in 1',
    slug: 'quan-short-2-in-1',
    categoryTitle: 'Gym',
    additionalCategories: ['Nam', 'Chạy Bộ', 'Quần Short'],
    price: 690000,
    tag: 'BÁN CHẠY',
    inStock: true,
    featured: true,
    colors: [
      { name: 'Đen', hex: '#1d2122' },
      { name: 'Xám', hex: '#a9a9a9' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Quần short 2 lớp với lớp lót compression, thiết kế tối ưu cho chạy bộ và gym.',
    features: [
      'Thiết kế 2 lớp',
      'Lớp lót compression',
      'Túi đựng điện thoại',
      'Phản quang an toàn',
    ],
    imageUrls: [placeholderImages.gym[1], placeholderImages.gym[2]],
  },
  // Set tập
  {
    name: 'Set Đồ Tập Gym Premium',
    slug: 'set-do-tap-gym-premium',
    categoryTitle: 'Gym',
    additionalCategories: ['Nam', 'Bộ Tập Luyện'],
    price: 1490000,
    tag: 'BÁN CHẠY',
    inStock: true,
    featured: true,
    colors: [
      { name: 'Xanh', hex: '#a6d6ca' },
      { name: 'Xám', hex: '#d9d9d9' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description:
      'Bộ đồ tập gym cao cấp gồm áo và quần short, thiết kế đồng bộ với chất liệu premium.',
    features: [
      'Bộ đồng bộ cao cấp',
      'Chất liệu thoáng mát',
      'Co giãn linh hoạt',
      'Phong cách thời thượng',
    ],
    imageUrls: [placeholderImages.gym[0], placeholderImages.sportswear[1]],
  },
  {
    name: 'Set Yoga Flow',
    slug: 'set-yoga-flow',
    categoryTitle: 'Yoga',
    additionalCategories: ['Nữ', 'Bộ Tập Luyện'],
    price: 1290000,
    tag: 'MỚI',
    inStock: true,
    featured: false,
    colors: [
      { name: 'Trắng', hex: '#ebe7db' },
      { name: 'Xám', hex: '#a9a9a9' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Bộ đồ yoga với chất liệu mềm mại, co giãn 4 chiều, mang lại sự thoải mái tối đa.',
    features: ['Chất liệu mềm mại', 'Co giãn 4 chiều', 'Thấm hút mồ hôi', 'Thiết kế tối giản'],
    imageUrls: [placeholderImages.running[0], placeholderImages.running[1]],
  },
  // Giày
  {
    name: 'Giày Chạy Bộ Elite',
    slug: 'giay-chay-bo-elite',
    categoryTitle: 'Chạy Bộ',
    additionalCategories: ['Nam', 'Nữ', 'Giày Thể Thao'],
    price: 1890000,
    tag: 'BÁN CHẠY',
    inStock: true,
    featured: true,
    colors: [
      { name: 'Đen', hex: '#1d2122' },
      { name: 'Trắng', hex: '#ffffff' },
    ],
    sizes: ['39', '40', '41', '42', '43', '44'],
    description: 'Giày chạy bộ cao cấp với công nghệ đệm tiên tiến, hỗ trợ tối đa cho runner.',
    features: ['Đệm công nghệ cao', 'Đế ngoài bền bỉ', 'Upper thoáng khí', 'Nhẹ và êm ái'],
    imageUrls: [placeholderImages.running[1], placeholderImages.running[2]],
  },
  {
    name: 'Giày Training CrossFit',
    slug: 'giay-training-crossfit',
    categoryTitle: 'Chạy Bộ',
    additionalCategories: ['Nam', 'Gym', 'Giày Thể Thao'],
    price: 1690000,
    originalPrice: 1990000,
    tag: 'GIẢM 20%',
    inStock: true,
    featured: false,
    colors: [{ name: 'Đen', hex: '#1d2122' }],
    sizes: ['40', '41', '42', '43'],
    description: 'Giày training đa năng cho CrossFit và tập gym, đế phẳng ổn định.',
    features: ['Đế phẳng ổn định', 'Chống trượt', 'Upper chắc chắn', 'Đa năng cho nhiều bài tập'],
    imageUrls: [placeholderImages.running[2], placeholderImages.running[0]],
  },
  // Additional products for variety
  {
    name: 'Áo Tank Top Gym',
    slug: 'ao-tank-top-gym',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Gym'],
    price: 490000,
    tag: 'MỚI',
    inStock: true,
    featured: false,
    colors: [
      { name: 'Đen', hex: '#1d2122' },
      { name: 'Xám', hex: '#a9a9a9' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo tank top gym với thiết kế tối giản, thoáng mát cho bài tập cường độ cao.',
    features: ['Thiết kế tối giản', 'Thoáng mát', 'Nhanh khô', 'Form fit'],
    imageUrls: [placeholderImages.gym[2], placeholderImages.gym[0]],
  },
  {
    name: 'Quần Jogger Training',
    slug: 'quan-jogger-training',
    categoryTitle: 'Quần Dài',
    additionalCategories: ['Nam', 'Gym'],
    price: 890000,
    tag: 'BÁN CHẠY',
    inStock: true,
    featured: false,
    colors: [
      { name: 'Đen', hex: '#1d2122' },
      { name: 'Xám', hex: '#a9a9a9' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Quần jogger phong cách thể thao, phù hợp tập luyện và thường ngày.',
    features: ['Chất liệu co giãn', 'Túi zip', 'Cạp thun thoải mái', 'Gấu bo ôm gọn'],
    imageUrls: [placeholderImages.gym[1], placeholderImages.gym[2]],
  },
  {
    name: 'Áo Hoodie Oversize',
    slug: 'ao-hoodie-oversize',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Nữ'],
    price: 990000,
    tag: 'HOT',
    inStock: true,
    featured: true,
    colors: [
      { name: 'Đen', hex: '#1d2122' },
      { name: 'Xám', hex: '#a9a9a9' },
      { name: 'Trắng', hex: '#ebe7db' },
    ],
    sizes: ['M', 'L', 'XL', '2X'],
    description: 'Hoodie oversize phong cách streetwear, chất liệu cotton fleece ấm áp.',
    features: [
      'Cotton fleece dày dặn',
      'Form oversize trendy',
      'Mũ trùm có dây rút',
      'Túi kangaroo',
    ],
    imageUrls: [placeholderImages.sportswear[0], placeholderImages.sportswear[2]],
  },
  {
    name: 'Legging Compression',
    slug: 'legging-compression',
    categoryTitle: 'Quần Dài',
    additionalCategories: ['Nữ', 'Gym', 'Yoga'],
    price: 790000,
    tag: 'MỚI',
    inStock: true,
    featured: false,
    colors: [{ name: 'Đen', hex: '#1d2122' }],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Quần legging compression hỗ trợ cơ bắp, co giãn 4 chiều.',
    features: [
      'Compression technology',
      'Co giãn 4 chiều',
      'Không lộ đường may',
      'Định hình cơ thể',
    ],
    imageUrls: [placeholderImages.running[0], placeholderImages.running[2]],
  },
  {
    name: 'Áo Windbreaker',
    slug: 'ao-windbreaker',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Nữ', 'Chạy Bộ'],
    price: 1190000,
    tag: 'MỚI',
    inStock: true,
    featured: false,
    colors: [
      { name: 'Đen', hex: '#1d2122' },
      { name: 'Xanh dương', hex: '#b9c1e8' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo gió chạy bộ siêu nhẹ, chống nước, gấp gọn tiện lợi.',
    features: ['Chống gió, chống nước nhẹ', 'Siêu nhẹ', 'Gấp gọn bỏ túi', 'Phản quang an toàn'],
    imageUrls: [placeholderImages.running[1], placeholderImages.running[0]],
  },
  {
    name: 'Quần Short Basketball',
    slug: 'quan-short-basketball',
    categoryTitle: 'Bóng Đá',
    additionalCategories: ['Nam', 'Quần Short'],
    price: 650000,
    tag: 'BÁN CHẠY',
    inStock: true,
    featured: false,
    colors: [
      { name: 'Đen', hex: '#1d2122' },
      { name: 'Trắng', hex: '#ffffff' },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2X'],
    description: 'Quần short bóng rổ form rộng, chất liệu mesh thoáng mát.',
    features: ['Chất liệu mesh', 'Form rộng thoải mái', 'Túi hông', 'Lưng thun có dây rút'],
    imageUrls: [placeholderImages.gym[0], placeholderImages.gym[2]],
  },
  {
    name: 'Sports Bra High Support',
    slug: 'sports-bra-high-support',
    categoryTitle: 'Bộ Tập Luyện',
    additionalCategories: ['Nữ', 'Gym', 'Yoga'],
    price: 590000,
    tag: 'MỚI',
    inStock: true,
    featured: false,
    colors: [
      { name: 'Đen', hex: '#1d2122' },
      { name: 'Xám', hex: '#a9a9a9' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Sports bra hỗ trợ cao, phù hợp cho các bài tập cường độ cao.',
    features: ['Hỗ trợ cao', 'Dây điều chỉnh', 'Móc cài sau', 'Thấm hút mồ hôi'],
    imageUrls: [placeholderImages.gym[1], placeholderImages.gym[0]],
  },
  {
    name: 'Áo Thun Long Sleeve',
    slug: 'ao-thun-long-sleeve',
    categoryTitle: 'Áo Thể Thao',
    additionalCategories: ['Nam', 'Chạy Bộ'],
    price: 750000,
    tag: 'MỚI',
    inStock: true,
    featured: false,
    colors: [
      { name: 'Đen', hex: '#1d2122' },
      { name: 'Trắng', hex: '#ebe7db' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Áo thun dài tay thể thao, chống UV, phù hợp cho chạy bộ ngoài trời.',
    features: ['Chống UV', 'Dài tay bảo vệ', 'Nhanh khô', 'Nhẹ và thoáng'],
    imageUrls: [placeholderImages.running[2], placeholderImages.running[1]],
  },
  {
    name: 'Quần Track Pants',
    slug: 'quan-track-pants',
    categoryTitle: 'Quần Dài',
    additionalCategories: ['Nam', 'Chạy Bộ'],
    price: 850000,
    originalPrice: 990000,
    tag: 'GIẢM 20%',
    inStock: true,
    featured: false,
    colors: [{ name: 'Đen', hex: '#1d2122' }],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Quần track pants cổ điển với đường sọc bên hông, phong cách retro.',
    features: ['Đường sọc bên hông', 'Zip gấu quần', 'Túi zip', 'Chất liệu tricot'],
    imageUrls: [placeholderImages.sportswear[3], placeholderImages.sportswear[0]],
  },
  {
    name: 'Set Tennis Classic',
    slug: 'set-tennis-classic',
    categoryTitle: 'Bộ Tập Luyện',
    additionalCategories: ['Nam', 'Quần Short', 'Áo Thể Thao'],
    price: 1390000,
    tag: 'MỚI',
    inStock: true,
    featured: true,
    colors: [
      { name: 'Trắng', hex: '#ffffff' },
      { name: 'Xanh dương', hex: '#b9c1e8' },
    ],
    sizes: ['S', 'M', 'L'],
    description: 'Bộ đồ tennis phong cách classic, thanh lịch và năng động.',
    features: ['Thiết kế classic', 'Chất liệu cao cấp', 'Co giãn linh hoạt', 'Thấm hút mồ hôi'],
    imageUrls: [placeholderImages.running[0], placeholderImages.sportswear[1]],
  },
]

// Categories to be seeded
export const categorySeedData = [
  { title: 'Nam', slug: 'nam' },
  { title: 'Nữ', slug: 'nu' },
  { title: 'Trẻ Em', slug: 'tre-em' },
  { title: 'Mới Nhất', slug: 'moi-nhat' },
  { title: 'Áo Thể Thao', slug: 'ao-the-thao' },
  { title: 'Quần Short', slug: 'quan-short' },
  { title: 'Quần Dài', slug: 'quan-dai' },
  { title: 'Bộ Tập Luyện', slug: 'bo-tap-luyen' },
  { title: 'Giày Thể Thao', slug: 'giay-the-thao' },
  { title: 'Chạy Bộ', slug: 'chay-bo' },
  { title: 'Gym', slug: 'gym' },
  { title: 'Yoga', slug: 'yoga' },
  { title: 'Bóng Đá', slug: 'bong-da' },
]
