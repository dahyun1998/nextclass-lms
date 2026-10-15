// 강사 센터: 내가 만든 강좌 목록 + 새 강좌 버튼
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'

export const metadata = { title: '강사 센터 — SmartClass' }

export default async function InstructorPage() {
  const profile = await getProfile()

  // 학생 계정이면 안내만 보여 준다
  if (profile?.role !== 'instructor') {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">강사 계정만 이용할 수 있습니다</h1>
        <p className="mt-2 text-slate-500">회원가입할 때 가입 유형을 &lsquo;강사&rsquo;로 선택하세요.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, category, level, is_published, lessons(count), enrollments(count)')
    .eq('instructor_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">강사 센터</h1>
        <Link href="/instructor/new" className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
          + 새 강좌
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">강좌</th>
              <th className="px-4 py-3">강의</th>
              <th className="px-4 py-3">수강생</th>
              <th className="px-4 py-3">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(courses ?? []).map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <Link href={`/instructor/courses/${c.id}`} className="font-semibold hover:text-indigo-700">{c.title}</Link>
                  <p className="text-xs text-slate-400">{c.category} · {c.level}</p>
                </td>
                <td className="px-4 py-3">{c.lessons[0]?.count ?? 0}</td>
                <td className="px-4 py-3">{c.enrollments[0]?.count ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    c.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {c.is_published ? '공개' : '비공개'}
                  </span>
                </td>
              </tr>
            ))}
            {courses?.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">아직 만든 강좌가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
