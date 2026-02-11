import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  payload.logger.info('— Bootstrap: creating essential data...')

  // 1. Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@thewhite.vn'
  const adminPassword = process.env.ADMIN_PASSWORD || 'TheWhite@2024'
  const adminName = process.env.ADMIN_NAME || 'Admin'

  const { totalDocs: userExists } = await payload.find({
    collection: 'users',
    where: { email: { equals: adminEmail } },
  })

  if (userExists === 0) {
    await payload.create({
      collection: 'users',
      data: { name: adminName, email: adminEmail, password: adminPassword },
    })
    payload.logger.info(`  ✓ Created admin user: ${adminEmail}`)
  } else {
    payload.logger.info('  ✓ Admin user already exists, skipping')
  }

  // 2. Header navigation
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        { link: { type: 'custom', label: 'Men', url: '/products?category=nam', newTab: false } },
        { link: { type: 'custom', label: 'Women', url: '/products?category=nu', newTab: false } },
        {
          link: { type: 'custom', label: 'Kids', url: '/products?category=tre-em', newTab: false },
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
  payload.logger.info('  ✓ Header navigation configured')

  // 3. Footer navigation (vi + en)
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

  const toNavItems = (links: { label: string; url: string }[]) =>
    links.map((link) => ({
      link: { type: 'custom' as const, label: link.label, url: link.url, newTab: false },
    }))

  await payload.updateGlobal({
    slug: 'footer',
    locale: 'vi',
    data: { navItems: toNavItems(footerLinksVi) },
  })

  await payload.updateGlobal({
    slug: 'footer',
    locale: 'en',
    data: { navItems: toNavItems(footerLinksEn) },
  })
  payload.logger.info('  ✓ Footer navigation configured (vi + en)')

  // 4. Payment methods (vi + en)
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
  payload.logger.info('  ✓ Payment methods configured (vi + en)')

  payload.logger.info('✅ Bootstrap essential data complete!')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // no-op — we don't want to wipe production data on rollback
  payload.logger.info('Bootstrap essential data down migration is a no-op')
}
