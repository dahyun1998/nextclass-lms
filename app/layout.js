// 루트 레이아웃: 모든 페이지를 감싸는 공통 틀 (html, body, 상단 메뉴)
import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'NEXTCLASS — 온라인 강의실',
  description: 'Next.js App Router + Supabase로 만든 간단한 LMS',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="py-10 text-center text-xs text-slate-400">
          © NEXTCLASS · Next.js + Supabase + Vercel 실습 예제
        </footer>
      </body>
    </html>
  )
}
