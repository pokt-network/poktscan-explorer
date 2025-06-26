import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (url.pathname === '/') {
    url.searchParams.set(
      'dashboard_services_card',
      request.cookies.get('dashboard_services_card')?.value || 'chart'
    )
  }

  url.searchParams.set('sp', request.nextUrl.searchParams.toString());
  url.searchParams.set('pt', request.nextUrl.pathname);

  const response = NextResponse.rewrite(url)

  // this is to have addresses in the layout of those pages
  if (['/tools/staking', '/tools/operator'].includes(url.pathname)) {
    response.headers.set('addresses', url.searchParams.get('addresses') || '')
  }

  return response;
}
