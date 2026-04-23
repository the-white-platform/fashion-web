const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // Legacy Payload admin management paths → new standalone /management dashboard
  const adminManagementRedirect = {
    source: '/admin/management/:slug*',
    destination: '/management/:slug*',
    permanent: true,
  }

  const redirects = [internetExplorerRedirect, adminManagementRedirect]

  return redirects
}

export default redirects
