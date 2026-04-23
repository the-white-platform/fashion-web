import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next`, `/_vercel`, `/admin`, `/management`, `/next`
  // - … the ones containing a dot (e.g. `favicon.ico`, `/indexnow-<key>.txt`)
  // `/management` is our non-localised ops dashboard; prefixing it
  // with `/vi` or `/en` would produce nonsense URLs and break the
  // auth guard's redirects.
  matcher: ['/((?!api|_next|_vercel|admin|management|next|.*\\..*).*)'],
}
