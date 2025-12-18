'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'vi' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionaries
const translations = {
  vi: {
    // Navigation
    'nav.home': 'Trang Chủ',
    'nav.products': 'Sản Phẩm',
    'nav.men': 'Nam',
    'nav.women': 'Nữ',
    'nav.kids': 'Trẻ Em',
    'nav.new': 'Mới Nhất',
    'nav.collections': 'Bộ Sưu Tập',
    'nav.about': 'Về Chúng Tôi',
    'nav.contact': 'Liên Hệ',
    'nav.search': 'Tìm kiếm...',
    'nav.account': 'Tài Khoản',
    'nav.wishlist': 'Yêu Thích',
    'nav.cart': 'Giỏ Hàng',
    'nav.login': 'Đăng Nhập',
    'nav.register': 'Đăng Ký',
    'nav.logout': 'Đăng Xuất',
    'nav.profile': 'Hồ Sơ',

    // Hero
    'hero.title': 'BỘ SƯU TẬP MÙA ĐÔNG 2024',
    'hero.subtitle': 'PHONG CÁCH THỂ THAO HIỆN ĐẠI',
    'hero.description':
      'Khám phá bộ sưu tập mới nhất với thiết kế tối giản, chất liệu cao cấp và công nghệ tiên tiến',
    'hero.cta': 'Khám Phá Ngay',
    'hero.lookbook': 'Xem Lookbook',
    'hero.stats.products': 'Sản Phẩm',
    'hero.stats.customers': 'Khách Hàng',
    'hero.stats.rating': 'Đánh Giá',
    'hero.discount.upto': 'GIẢM GIÁ ĐẾN',

    // Categories
    'categories.title': 'Mua Sắm Theo Hoạt Động',
    'categories.subtitle': 'Tìm kiếm trang phục phù hợp với mọi hoạt động thể thao của bạn',
    'categories.running': 'CHẠY BỘ',
    'categories.gym': 'TẬP GYM',
    'categories.yoga': 'YOGA',
    'categories.football': 'BÓNG ĐÁ',

    // Products
    'products.title': 'Sản Phẩm Nổi Bật',
    'products.subtitle': 'Những sản phẩm được yêu thích nhất',
    'products.new': 'Mới',
    'products.bestseller': 'Bán Chạy',
    'products.sale': 'Giảm Giá',
    'products.accessories': 'Phụ Kiện',
    'products.addToCart': 'Thêm Vào Giỏ',
    'products.quickView': 'Xem Nhanh',
    'products.viewAll': 'Xem Tất Cả',
    'products.filter': 'Lọc',
    'products.sort': 'Sắp Xếp',
    'products.size': 'Kích Thước',
    'products.color': 'Màu Sắc',
    'products.price': 'Giá',
    'products.category': 'Danh Mục',

    // Cart
    'cart.title': 'Giỏ Hàng',
    'cart.empty': 'Giỏ hàng trống',
    'cart.emptyDesc': 'Bạn chưa có sản phẩm nào trong giỏ hàng',
    'cart.continueShopping': 'Tiếp Tục Mua Sắm',
    'cart.checkout': 'Thanh Toán',
    'cart.total': 'Tổng Cộng',
    'cart.subtotal': 'Tạm Tính',
    'cart.shipping': 'Phí Vận Chuyển',
    'cart.discount': 'Giảm Giá',
    'cart.remove': 'Xóa',
    'cart.quantity': 'Số Lượng',

    // Checkout
    'checkout.title': 'Thanh Toán',
    'checkout.shipping': 'Thông Tin Giao Hàng',
    'checkout.payment': 'Phương Thức Thanh Toán',
    'checkout.review': 'Xác Nhận Đơn Hàng',
    'checkout.complete': 'Hoàn Tất',
    'checkout.next': 'Tiếp Theo',
    'checkout.back': 'Quay Lại',
    'checkout.placeOrder': 'Đặt Hàng',
    'checkout.fullName': 'Họ và Tên',
    'checkout.phone': 'Số Điện Thoại',
    'checkout.email': 'Email',
    'checkout.address': 'Địa Chỉ',
    'checkout.city': 'Tỉnh/Thành Phố',
    'checkout.district': 'Quận/Huyện',
    'checkout.ward': 'Phường/Xã',
    'checkout.note': 'Ghi Chú',
    'checkout.success': 'Đặt Hàng Thành Công!',
    'checkout.successDesc': 'Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.',
    'checkout.orderId': 'Mã Đơn Hàng',

    // Profile
    'profile.title': 'Hồ Sơ Của Tôi',
    'profile.info': 'Thông Tin',
    'profile.size': 'Size & Số Đo',
    'profile.vto': 'Virtual Try-On',
    'profile.orders': 'Đơn Hàng',
    'profile.addresses': 'Địa Chỉ',
    'profile.payment': 'Thanh Toán',
    'profile.logout': 'Đăng Xuất',
    'profile.edit': 'Chỉnh Sửa',
    'profile.save': 'Lưu',
    'profile.cancel': 'Hủy',

    // Orders
    'orders.title': 'Đơn Hàng Của Tôi',
    'orders.empty': 'Chưa Có Đơn Hàng',
    'orders.emptyDesc': 'Bạn chưa có đơn hàng nào. Hãy khám phá và mua sắm ngay!',
    'orders.orderId': 'Mã Đơn',
    'orders.date': 'Ngày Đặt',
    'orders.status': 'Trạng Thái',
    'orders.total': 'Tổng Tiền',
    'orders.items': 'sản phẩm',
    'orders.viewDetails': 'Chi Tiết',
    'orders.trackOrder': 'Theo Dõi Đơn Hàng',
    'orders.cancelOrder': 'Hủy Đơn',
    'orders.buyAgain': 'Mua Lại',
    'orders.review': 'Đánh Giá',
    'orders.delivered': 'Đã Giao',
    'orders.shipping': 'Đang Giao',
    'orders.processing': 'Đang Xử Lý',
    'orders.cancelled': 'Đã Hủy',

    // Footer
    'footer.about': 'Về TheWhite',
    'footer.aboutDesc': 'Thương hiệu thể thao Việt Nam với phong cách hiện đại, tối giản',
    'footer.customer': 'Khách Hàng',
    'footer.policy': 'Chính Sách',
    'footer.connect': 'Kết Nối',
    'footer.payment': 'Phương Thức Thanh Toán',
    'footer.shipping': 'Đối Tác Vận Chuyển',
    'footer.copyright': '© 2024 TheWhite. Bảo lưu mọi quyền.',
    'footer.privacy': 'Chính Sách Bảo Mật',
    'footer.terms': 'Điều Khoản Sử Dụng',

    // Footer Links
    'footer.products.shirts': 'Áo Thể Thao',
    'footer.products.pants': 'Quần Thể Thao',
    'footer.products.shoes': 'Giày Thể Thao',
    'footer.products.accessories': 'Phụ Kiện',
    'footer.products.new': 'Bộ Sưu Tập Mới',

    'footer.support.return': 'Chính Sách Đổi Trả',
    'footer.support.guide': 'Hướng Dẫn Mua Hàng',
    'footer.support.payment': 'Thanh Toán & Vận Chuyển',
    'footer.support.size': 'Hướng Dẫn Chọn Size',
    'footer.support.faq': 'Câu Hỏi Thường Gặp',

    'footer.contact.hours': 'Giờ làm việc: 8:00 - 22:00',
    'footer.contact.showroom': 'Showroom: Quận 1, TP.HCM',

    // Common
    'common.all': 'Tất Cả',
    'common.newest': 'Mới Nhất',
    'common.priceAsc': 'Giá Tăng Dần',
    'common.priceDesc': 'Giá Giảm Dần',
    'common.popular': 'Phổ Biến',
    'common.loading': 'Đang tải...',
    'common.error': 'Đã có lỗi xảy ra',
    'common.success': 'Thành công',
    'common.confirm': 'Xác nhận',
    'common.cancel': 'Hủy',
    'common.close': 'Đóng',
    'common.search': 'Tìm kiếm',
    'common.filter': 'Lọc',
    'common.sort': 'Sắp xếp',
    'common.apply': 'Áp dụng',
    'common.reset': 'Đặt lại',
    'common.viewMore': 'Xem Thêm',
    'common.viewLess': 'Thu Gọn',
    'common.readMore': 'Đọc Thêm',
    'common.showMore': 'Hiển Thị Thêm',
    'common.products': 'SẢN PHẨM',
    'common.explore': 'KHÁM PHÁ',

    // Carousel
    'carousel.slide1.title': 'BST MÙA ĐÔNG 2024',
    'carousel.slide1.subtitle': 'Sức mạnh trong từng bước chân',
    'carousel.slide2.title': 'PHONG CÁCH HIỆN ĐẠI',
    'carousel.slide2.subtitle': 'Tối ưu cho mọi hoạt động',
    'carousel.slide3.title': 'CHẤT LIỆU CAO CẤP',
    'carousel.slide3.subtitle': 'Thoải mái suốt cả ngày',
    'carousel.slide4.title': 'THIẾT KẾ TINH TẾ',
    'carousel.slide4.subtitle': 'Định nghĩa lại thể thao',
    'carousel.cta': 'Khám phá ngay',

    // Take Action Hero
    'takeAction.subtitle':
      'Đừng chỉ mơ về thành công. Hãy hành động ngay hôm nay với trang phục thể thao cao cấp TheWhite.',
    'takeAction.cta.explore': 'Khám Phá Thêm',
    'takeAction.cta.collection': 'Bộ Sưu Tập Mới',
    'takeAction.scroll': 'Cuộn xuống',

    // Brand Story
    'brandStory.label': 'VỀ THEWHITE',
    'brandStory.title': 'Thể Thao Là Phong Cách Sống',
    'brandStory.desc1':
      'TheWhite sinh ra từ niềm đam mê thể thao và khao khát mang đến những sản phẩm thời trang thể thao chất lượng cao cho người Việt Nam.',
    'brandStory.desc2':
      'Chúng tôi tin rằng trang phục thể thao không chỉ đơn thuần là quần áo tập luyện, mà còn là biểu tượng của một lối sống năng động, khỏe mạnh và tự tin.',
    'brandStory.desc3':
      'Với thiết kế tối giản, hiện đại kết hợp công nghệ vải tiên tiến, mỗi sản phẩm của TheWhite được tạo ra để đồng hành cùng bạn trong mọi hoạt động.',
    'brandStory.feature.material': 'Chất Liệu Cao Cấp',
    'brandStory.feature.materialDesc': 'Vải thấm hút mồ hôi tốt',
    'brandStory.feature.design': 'Thiết Kế Hiện Đại',
    'brandStory.feature.designDesc': 'Phong cách tối giản',
    'brandStory.feature.durable': 'Bền Bỉ',
    'brandStory.feature.durableDesc': 'Chất lượng lâu dài',
    'brandStory.feature.origin': 'Made in Vietnam',
    'brandStory.feature.originDesc': 'Tự hào Việt Nam',
    'brandStory.cta.explore': 'KHÁM PHÁ THÊM',
    'brandStory.cta.story': 'CÂU CHUYỆN CỦA CHÚNG TÔI',

    // Newsletter
    'newsletter.title': 'Nhận Ưu Đãi Độc Quyền',
    'newsletter.description':
      'Đăng ký nhận bản tin để cập nhật những sản phẩm mới nhất, ưu đãi đặc biệt và tips thể thao hữu ích',
    'newsletter.placeholder': 'Nhập email của bạn',
    'newsletter.button': 'ĐĂNG KÝ NGAY',
    'newsletter.buttonSuccess': '✓ ĐÃ ĐĂNG KÝ',
    'newsletter.note': 'Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên',

    // Explore More
    'exploreMore.title': 'Khám Phá Thêm',
    'exploreMore.subtitle':
      'Khám phá bộ sưu tập thể thao cao cấp được thiết kế để bạn luôn tự tin và thoải mái trong mọi chuyển động',
    'exploreMore.feature1.title': 'Hiệu Suất Cao',
    'exploreMore.feature1.desc': 'Vải công nghệ tiên tiến, thoáng khí và thấm hút mồ hôi tối ưu',
    'exploreMore.feature2.title': 'Thiết Kế Hiện Đại',
    'exploreMore.feature2.desc': 'Phong cách tối giản, sang trọng phù hợp mọi hoạt động',
    'exploreMore.feature3.title': 'Chất Lượng Premium',
    'exploreMore.feature3.desc': 'Cam kết 100% chất lượng, bền bỉ theo thời gian',
    'exploreMore.feature4.title': 'Tin Dùng Bởi 10K+',
    'exploreMore.feature4.desc': 'Hơn 10,000 vận động viên và người yêu thể thao tin dùng',
    'exploreMore.collection1.title': 'Áo Thể Thao',
    'exploreMore.collection1.desc': 'Thoáng mát, co giãn 4 chiều',
    'exploreMore.collection2.title': 'Quần Thể Thao',
    'exploreMore.collection2.desc': 'Linh hoạt, thoải mái tối đa',
    'exploreMore.collection3.title': 'Phụ Kiện',
    'exploreMore.collection3.desc': 'Hoàn thiện phong cách của bạn',
    'exploreMore.cta': 'Xem Tất Cả Sản Phẩm',

    // Virtual Try On
    'vto.label': 'CÔNG NGHỆ AI',
    'vto.title': 'Thử Đồ Ảo',
    'vto.subtitle':
      'Trải nghiệm công nghệ AI tiên tiến - Xem bạn trông như thế nào trong trang phục TheWhite',
    'vto.step1.title': 'Chọn Sản Phẩm',
    'vto.step1.desc': 'Chọn sản phẩm bạn muốn thử từ trang chi tiết sản phẩm',
    'vto.step2.title': 'Tải Ảnh & Thông Tin',
    'vto.step2.desc': 'Điền chiều cao, cân nặng và giới tính để kết quả chính xác hơn',
    'vto.step2.upload': 'Tải ảnh toàn thân của bạn',
    'vto.step3.title': 'Xem Kết Quả',
    'vto.step3.desc': 'AI tạo ảnh bạn mặc sản phẩm TheWhite chỉ trong vài giây',
    'vto.cta.title': 'Sẵn Sàng Thử?',
    'vto.cta.desc':
      'Chọn bất kỳ sản phẩm nào trong cửa hàng và nhấn nút "Thử Đồ Ảo" để bắt đầu trải nghiệm',
    'vto.cta.button': 'Khám Phá Sản Phẩm',
    'vto.info1.title': 'Dễ Sử Dụng',
    'vto.info1.desc': 'Chỉ cần 3 bước đơn giản là có kết quả ngay lập tức',
    'vto.info2.title': 'Công Nghệ AI',
    'vto.info2.desc': 'Sử dụng trí tuệ nhân tạo tiên tiến nhất',
    'vto.info3.title': 'Riêng Tư & An Toàn',
    'vto.info3.desc': 'Ảnh của bạn được bảo mật tuyệt đối',

    // Product Filter
    'filter.title': 'Bộ Lọc',
    'filter.clear': 'Xóa Tất Cả Bộ Lọc',
    'filter.apply': 'Áp Dụng',
    'filter.category': 'Danh Mục',
    'filter.price': 'Giá',
    'filter.size': 'Kích Thước',
    'filter.color': 'Màu Sắc',
    'filter.category.tshirt': 'Áo Thun',
    'filter.category.polo': 'Áo Polo',
    'filter.category.hoodie': 'Áo Hoodie',
    'filter.category.jacket': 'Áo Khoác',
    'filter.category.pants': 'Quần',
    'filter.category.shorts': 'Quần Short',
    'filter.price.all': 'Tất Cả',
    'filter.price.under500': 'Dưới 500k',
    'filter.price.500-1000': '500k - 1tr',
    'filter.price.1000-2000': '1tr - 2tr',
    'filter.price.above2000': 'Trên 2tr',
    'filter.color.white': 'Trắng',
    'filter.color.black': 'Đen',
    'filter.color.gray': 'Xám',
    'filter.color.navy': 'Xanh Navy',
    'filter.color.red': 'Đỏ',
    'filter.color.green': 'Xanh Lá',
    'filter.sort.newest': 'Mới Nhất',
    'filter.sort.priceAsc': 'Giá: Thấp → Cao',
    'filter.sort.priceDesc': 'Giá: Cao → Thấp',
    'filter.sort.popular': 'Phổ Biến',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.men': 'Men',
    'nav.women': 'Women',
    'nav.kids': 'Kids',
    'nav.new': 'New Arrivals',
    'nav.collections': 'Collections',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.search': 'Search...',
    'nav.account': 'Account',
    'nav.wishlist': 'Wishlist',
    'nav.cart': 'Cart',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',

    // Hero
    'hero.title': 'WINTER COLLECTION 2024',
    'hero.subtitle': 'MODERN ATHLETIC STYLE',
    'hero.description':
      'Discover our latest collection with minimalist design, premium materials and advanced technology',
    'hero.cta': 'Explore Now',
    'hero.lookbook': 'View Lookbook',
    'hero.stats.products': 'Products',
    'hero.stats.customers': 'Customers',
    'hero.stats.rating': 'Ratings',
    'hero.discount.upto': 'UP TO',

    // Categories
    'categories.title': 'Shop By Activity',
    'categories.subtitle': 'Find the perfect gear for your sport',
    'categories.running': 'RUNNING',
    'categories.gym': 'GYM',
    'categories.yoga': 'YOGA',
    'categories.football': 'FOOTBALL',

    // Products
    'products.title': 'Featured Products',
    'products.subtitle': 'Our most loved products',
    'products.new': 'New',
    'products.bestseller': 'Bestseller',
    'products.sale': 'Sale',
    'products.accessories': 'Accessories',
    'products.addToCart': 'Add to Cart',
    'products.quickView': 'Quick View',
    'products.viewAll': 'View All',
    'products.filter': 'Filter',
    'products.sort': 'Sort',
    'products.size': 'Size',
    'products.color': 'Color',
    'products.price': 'Price',
    'products.category': 'Category',

    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.emptyDesc': 'You have no items in your cart',
    'cart.continueShopping': 'Continue Shopping',
    'cart.checkout': 'Checkout',
    'cart.total': 'Total',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.discount': 'Discount',
    'cart.remove': 'Remove',
    'cart.quantity': 'Quantity',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping': 'Shipping Information',
    'checkout.payment': 'Payment Method',
    'checkout.review': 'Review Order',
    'checkout.complete': 'Complete',
    'checkout.next': 'Next',
    'checkout.back': 'Back',
    'checkout.placeOrder': 'Place Order',
    'checkout.fullName': 'Full Name',
    'checkout.phone': 'Phone Number',
    'checkout.email': 'Email',
    'checkout.address': 'Address',
    'checkout.city': 'City/Province',
    'checkout.district': 'District',
    'checkout.ward': 'Ward',
    'checkout.note': 'Note',
    'checkout.success': 'Order Placed Successfully!',
    'checkout.successDesc': 'Thank you for your order. We will contact you soon.',
    'checkout.orderId': 'Order ID',

    // Profile
    'profile.title': 'My Profile',
    'profile.info': 'Information',
    'profile.size': 'Size & Measurements',
    'profile.vto': 'Virtual Try-On',
    'profile.orders': 'Orders',
    'profile.addresses': 'Addresses',
    'profile.payment': 'Payment',
    'profile.logout': 'Logout',
    'profile.edit': 'Edit',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',

    // Orders
    'orders.title': 'My Orders',
    'orders.empty': 'No Orders Yet',
    'orders.emptyDesc': 'You have no orders yet. Start shopping now!',
    'orders.orderId': 'Order ID',
    'orders.date': 'Date',
    'orders.status': 'Status',
    'orders.total': 'Total',
    'orders.items': 'items',
    'orders.viewDetails': 'View Details',
    'orders.trackOrder': 'Track Order',
    'orders.cancelOrder': 'Cancel Order',
    'orders.buyAgain': 'Buy Again',
    'orders.review': 'Review',
    'orders.delivered': 'Delivered',
    'orders.shipping': 'Shipping',
    'orders.processing': 'Processing',
    'orders.cancelled': 'Cancelled',

    // Footer
    'footer.about': 'About TheWhite',
    'footer.aboutDesc': 'Vietnamese sportswear brand with modern, minimalist style',
    'footer.customer': 'Customer',
    'footer.policy': 'Policy',
    'footer.connect': 'Connect',
    'footer.payment': 'Payment Methods',
    'footer.shipping': 'Shipping Partners',
    'footer.copyright': '© 2024 TheWhite. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',

    // Footer Links
    'footer.products.shirts': 'Sports Shirts',
    'footer.products.pants': 'Sports Pants',
    'footer.products.shoes': 'Sports Shoes',
    'footer.products.accessories': 'Accessories',
    'footer.products.new': 'New Collection',

    'footer.support.return': 'Return Policy',
    'footer.support.guide': 'Shopping Guide',
    'footer.support.payment': 'Payment & Shipping',
    'footer.support.size': 'Size Guide',
    'footer.support.faq': 'FAQ',

    'footer.contact.hours': 'Working Hours: 8:00 - 22:00',
    'footer.contact.showroom': 'Showroom: District 1, HCMC',

    // Common
    'common.all': 'All',
    'common.newest': 'Newest',
    'common.priceAsc': 'Price: Low to High',
    'common.priceDesc': 'Price: High to Low',
    'common.popular': 'Popular',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.apply': 'Apply',
    'common.reset': 'Reset',
    'common.viewMore': 'View More',
    'common.viewLess': 'View Less',
    'common.readMore': 'Read More',
    'common.showMore': 'Show More',
    'common.products': 'PRODUCTS',
    'common.explore': 'EXPLORE',

    // Carousel
    'carousel.slide1.title': 'WINTER COLLECTION 2024',
    'carousel.slide1.subtitle': 'Power in every step',
    'carousel.slide2.title': 'MODERN STYLE',
    'carousel.slide2.subtitle': 'Optimized for every activity',
    'carousel.slide3.title': 'PREMIUM MATERIALS',
    'carousel.slide3.subtitle': 'Comfort all day long',
    'carousel.slide4.title': 'EXQUISITE DESIGN',
    'carousel.slide4.subtitle': 'Redefining sportswear',
    'carousel.cta': 'Explore Now',

    // Take Action Hero
    'takeAction.subtitle':
      "Don't just dream of success. Take action today with TheWhite premium sportswear.",
    'takeAction.cta.explore': 'Explore More',
    'takeAction.cta.collection': 'New Collection',
    'takeAction.scroll': 'Scroll Down',

    // Brand Story
    'brandStory.label': 'ABOUT THEWHITE',
    'brandStory.title': 'Sport Is A Lifestyle',
    'brandStory.desc1':
      'TheWhite was born from a passion for sports and a desire to bring high-quality sportswear to everyone.',
    'brandStory.desc2':
      'We believe sportswear is not just for training, but a symbol of an active, healthy, and confident lifestyle.',
    'brandStory.desc3':
      'With minimalist, modern design combined with advanced fabric technology, every TheWhite product is created to accompany you in every activity.',
    'brandStory.feature.material': 'Premium Material',
    'brandStory.feature.materialDesc': 'Excellent sweat absorption',
    'brandStory.feature.design': 'Modern Design',
    'brandStory.feature.designDesc': 'Minimalist style',
    'brandStory.feature.durable': 'Durable',
    'brandStory.feature.durableDesc': 'Long-lasting quality',
    'brandStory.feature.origin': 'Made in Vietnam',
    'brandStory.feature.originDesc': 'Proudly Vietnamese',
    'brandStory.cta.explore': 'EXPLORE MORE',
    'brandStory.cta.story': 'OUR STORY',

    // Newsletter
    'newsletter.title': 'Get Exclusive Offers',
    'newsletter.description':
      'Subscribe to our newsletter to get updates on the latest products, special offers and useful sports tips',
    'newsletter.placeholder': 'Enter your email',
    'newsletter.button': 'SUBSCRIBE NOW',
    'newsletter.buttonSuccess': '✓ SUBSCRIBED',
    'newsletter.note': 'Get a 10% discount code for your first order',

    // Explore More
    'exploreMore.title': 'Explore More',
    'exploreMore.subtitle':
      'Discover our premium sportswear collection designed to keep you confident and comfortable in every move',
    'exploreMore.feature1.title': 'High Performance',
    'exploreMore.feature1.desc':
      'Advanced technology fabric, breathable and optimal sweat absorption',
    'exploreMore.feature2.title': 'Modern Design',
    'exploreMore.feature2.desc': 'Minimalist, luxurious style suitable for all activities',
    'exploreMore.feature3.title': 'Premium Quality',
    'exploreMore.feature3.desc': '100% quality commitment, durable over time',
    'exploreMore.feature4.title': 'Trusted by 10K+',
    'exploreMore.feature4.desc': 'Trusted by over 10,000 athletes and sports lovers',
    'exploreMore.collection1.title': 'Sport Shirts',
    'exploreMore.collection1.desc': 'Breathable, 4-way stretch',
    'exploreMore.collection2.title': 'Sport Pants',
    'exploreMore.collection2.desc': 'Flexible, maximum comfort',
    'exploreMore.collection3.title': 'Accessories',
    'exploreMore.collection3.desc': 'Complete your style',
    'exploreMore.cta': 'View All Products',

    // Virtual Try On
    'vto.label': 'AI TECHNOLOGY',
    'vto.title': 'Virtual Try-On',
    'vto.subtitle': 'Experience advanced AI technology - See how you look in TheWhite sportswear',
    'vto.step1.title': 'Select Product',
    'vto.step1.desc': 'Choose the product you want to try from the product detail page',
    'vto.step2.title': 'Upload Photo & Info',
    'vto.step2.desc': 'Enter height, weight and gender for more accurate results',
    'vto.step2.upload': 'Upload your full body photo',
    'vto.step3.title': 'View Result',
    'vto.step3.desc': 'AI generates a photo of you wearing TheWhite product in seconds',
    'vto.cta.title': 'Ready to Try?',
    'vto.cta.desc':
      'Choose any product in the store and click "Virtual Try-On" to start the experience',
    'vto.cta.button': 'Explore Products',
    'vto.info1.title': 'Easy to Use',
    'vto.info1.desc': 'Just 3 simple steps to get results instantly',
    'vto.info2.title': 'AI Technology',
    'vto.info2.desc': 'Using the most advanced artificial intelligence',
    'vto.info3.title': 'Private & Secure',
    'vto.info3.desc': 'Your photos are strictly confidential',

    // Product Filter
    'filter.title': 'Filter',
    'filter.clear': 'Clear All Filters',
    'filter.apply': 'Apply',
    'filter.category': 'Category',
    'filter.price': 'Price',
    'filter.size': 'Size',
    'filter.color': 'Color',
    'filter.category.tshirt': 'T-Shirt',
    'filter.category.polo': 'Polo Shirt',
    'filter.category.hoodie': 'Hoodie',
    'filter.category.jacket': 'Jacket',
    'filter.category.pants': 'Pants',
    'filter.category.shorts': 'Shorts',
    'filter.price.all': 'All',
    'filter.price.under500': 'Under 500k',
    'filter.price.500-1000': '500k - 1m',
    'filter.price.1000-2000': '1m - 2m',
    'filter.price.above2000': 'Over 2m',
    'filter.color.white': 'White',
    'filter.color.black': 'Black',
    'filter.color.gray': 'Gray',
    'filter.color.navy': 'Navy',
    'filter.color.red': 'Red',
    'filter.color.green': 'Green',
    'filter.sort.newest': 'Newest',
    'filter.sort.priceAsc': 'Price: Low to High',
    'filter.sort.priceDesc': 'Price: High to Low',
    'filter.sort.popular': 'Popular',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with 'vi' to ensure server and client render the same
  // This prevents hydration mismatches
  const [language, setLanguageState] = useState<Language>('vi')

  // Load language from localStorage only after mount (client-side)
  // This ensures server and client initial renders match
  useEffect(() => {
    try {
      const storedLanguage = localStorage.getItem('thewhite-language') as Language
      if (storedLanguage && (storedLanguage === 'vi' || storedLanguage === 'en')) {
        setLanguageState(storedLanguage)
      }
    } catch {
      // localStorage might not be available
    }
  }, [])

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('thewhite-language', lang)
    } catch {
      // localStorage might not be available
    }
  }

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)['vi']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
