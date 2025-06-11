import {type NextRequest, NextResponse} from 'next/server'

// Redirect home page to /?schema=detect
export function middleware(request: NextRequest) {
  const {searchParams, pathname} = request.nextUrl

  if (pathname === '/' && !searchParams.has('schema')) {
    const newUrl = new URL(request.url)
    newUrl.searchParams.set('schema', 'detect')
    return NextResponse.redirect(newUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/',
}
