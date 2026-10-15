// 내 강의실: 수강 중인 강좌와 진도율
// proxy.js가 비로그인 사용자를 /login 으로 돌려보내므로 여기서는 user가 있다고 본다
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/auth'
import { percent } from '@/lib/utils'
import CourseCard from '@/components/CourseCard'

export const metadata = { title: '내 강의실 — NEXTCLASS' }

export default async function MyPage() {
  const user = await getUser()
  const profile = await getProfile()
  const supabase = await createClient()

const [{ data: enrollments }, { data: progress }] = await Promise.all([
    supabase.from('enrollments')
      .select('created_at, courses(id, title, summary, category, level, profiles:instructor_id(name), lessons(count))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('lesson_progress').select('course_id, lesson_id').eq('user_id', user.id),
  ])

  // 강좌별 완료 수 세기: { 1: 3, 2: 1, ... }
  const doneByCourse = {}
  for (const p of progress ?? []) {
    doneByCourse[p.course_id] = (doneByCourse[p.course_id] ?? 0) + 1
  }

  const courses = (enrollments ?? []).map((e) => e.courses).filter(Boolean)
  const completed = courses.filter(
    (c) => percent(doneByCourse[c.id] ?? 0, c.lessons[0]?.count ?? 0) === 100
  ).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{profile?.name || '학습자'}님의 강의실</h1>
        <div className="mt-4 grid max-w-md grid-cols-2 gap-4">
          <Stat label="수강 중" value={courses.length} />
          <Stat label="완강" value={completed} />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-500">아직 수강 중인 강좌가 없습니다.</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-indigo-700 underline">강좌 둘러보기</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              progress={percent(doneByCourse[c.id] ?? 0, c.lessons[0]?.count ?? 0)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-extrabold text-indigo-700">{value}</p>
    </div>
  )
}
