// Next.js 16: middleware.js → proxy.js 로 이름이 바뀌었다.
// (Next.js 15 이하라면 파일명 middleware.js, 함수명 middleware 로 쓴다)
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request) {
  return await updateSession(request)
}

export const config = {
  // 정적 파일·이미지는 건너뛰고 나머지 모든 주소에서 실행
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
