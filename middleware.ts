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

  return NextResponse.rewrite(url);
}
