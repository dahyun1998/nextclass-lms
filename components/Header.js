// 상단 메뉴 (서버 컴포넌트): 로그인 여부와 역할에 따라 메뉴가 달라진다
import Link from 'next/link'
import { getProfile } from '@/lib/auth'
import { signOut } from '@/app/login/actions'

export default async function Header() {
  const profile = await getProfile()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-indigo-700">
          SMART<span className="text-amber-500">CLASS</span>
        </Link>

        <div className="flex gap-4 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-indigo-700">강좌</Link>
          {profile && <Link href="/my" className="hover:text-indigo-700">내 강의실</Link>}
          {profile?.role === 'instructor' && (
            <Link href="/instructor" className="hover:text-indigo-700">강사 센터</Link>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {profile ? (
            <>
              <span className="hidden text-slate-600 sm:inline">
                {profile.name || '이름 없음'}
                <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                  {profile.role === 'instructor' ? '강사' : '학생'}
                </span>
              </span>
              <form action={signOut}>
                <button className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-md bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-700">
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
