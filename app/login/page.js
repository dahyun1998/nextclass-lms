// 로그인 / 회원가입 페이지 — 폼 두 개가 서로 다른 Server Action을 호출
import { login, signup } from './actions'
import SubmitButton from '@/components/SubmitButton'

export const metadata = { title: '로그인 — SmartClass' }

export default async function LoginPage({ searchParams }) {
  const { message, next } = await searchParams

  return (
    <div className="mx-auto max-w-4xl">
      {message && (
        <p className="mb-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* 로그인 */}
        <form action={login} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">로그인</h2>
          <input type="hidden" name="next" value={next ?? ''} />
          <div>
            <label className="label" htmlFor="login-email">이메일</label>
            <input id="login-email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="login-pw">비밀번호</label>
            <input id="login-pw" name="password" type="password" required className="input" />
          </div>
          <SubmitButton className="w-full bg-indigo-600 text-white hover:bg-indigo-700" pendingText="로그인 중…">
            로그인
          </SubmitButton>
        </form>

        {/* 회원가입 */}
        <form action={signup} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">회원가입</h2>
          <div>
            <label className="label" htmlFor="su-name">이름</label>
            <input id="su-name" name="name" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="su-email">이메일</label>
            <input id="su-email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="su-pw">비밀번호 (6자 이상)</label>
            <input id="su-pw" name="password" type="password" minLength={6} required className="input" />
          </div>
          <fieldset>
            <legend className="label">가입 유형</legend>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1">
                <input type="radio" name="role" value="student" defaultChecked /> 학생
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="role" value="instructor" /> 강사
              </label>
            </div>
          </fieldset>
          <SubmitButton className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300" pendingText="가입 중…">
            가입하기
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}
