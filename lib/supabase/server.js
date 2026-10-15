// 서버(서버 컴포넌트·Server Action·Route Handler)에서 쓰는 Supabase 클라이언트
// 로그인 정보는 쿠키에 있으므로 Next.js의 cookies()를 Supabase에 연결해 준다.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies() // Next.js 15+ : cookies()는 Promise

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 서버 컴포넌트에서는 쿠키를 쓸 수 없다 → proxy.js가 대신 갱신하므로 무시
          }
        },
      },
    }
  )
}
