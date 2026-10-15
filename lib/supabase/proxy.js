// 모든 요청 앞에서 실행되어 로그인 세션(쿠키)을 갱신하고,
// 로그인이 필요한 주소에 비로그인 사용자가 오면 /login 으로 보낸다.
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const PROTECTED = ['/my', '/instructor']

export async function updateSession(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getClaims(): 토큰을 검증해 로그인 사용자 정보를 꺼낸다 (세션 갱신도 함께)
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const path = request.nextUrl.pathname
  if (!user && PROTECTED.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  return response
}
