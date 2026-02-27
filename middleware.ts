import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const mainDomain = 'i.catcat.meme'
  
  if (hostname === mainDomain || hostname === `www.${mainDomain}`) {
    return NextResponse.next()
  }
  
  let username = hostname
  if (username.startsWith('www.')) {
    username = username.substring(4)
  }
  
  if (username.endsWith(`.${mainDomain}`)) {
    username = username.replace(`.${mainDomain}`, '')
  }
  
  if (!username || username.includes('.') || username.includes('/')) {
    return new NextResponse('Not Found', { status: 404 })
  }
  
  const newUrl = `https://${mainDomain}/${username}${request.nextUrl.pathname}${request.nextUrl.search}`
  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
