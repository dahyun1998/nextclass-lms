// 강좌 관리: 공개 전환·삭제 + 강의 목록 + 강의 추가 폼
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { togglePublish, deleteCourse, addLesson, deleteLesson } from '../../actions'
import SubmitButton from '@/components/SubmitButton'

export default async function ManageCoursePage({ params }) {
  const { id } = await params
  const profile = await getProfile()
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*, lessons(id, title, position, duration_min, video_url)')
    .eq('id', id)
    .eq('instructor_id', profile?.id) // 내 강좌만
    .order('position', { referencedTable: 'lessons' })
    .single()

  if (!course) notFound()

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/instructor" className="text-sm text-indigo-700 hover:underline">← 강사 센터</Link>
        <h1 className="w-full text-2xl font-extrabold">{course.title}</h1>

        <form action={togglePublish.bind(null, course.id, course.is_published)}>
          <SubmitButton className={course.is_published ? 'bg-slate-200 text-slate-700' : 'bg-emerald-600 text-white'}>
            {course.is_published ? '비공개로 전환' : '공개하기'}
          </SubmitButton>
        </form>
        <Link href={`/courses/${course.id}`} className="rounded-md border border-slate-300 px-4 py-2 text-sm">학생 화면 보기</Link>
        <form action={deleteCourse.bind(null, course.id)} className="ml-auto">
          <SubmitButton className="border border-rose-300 text-sm text-rose-600 hover:bg-rose-50">강좌 삭제</SubmitButton>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 강의 목록 */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">강의 목록 ({course.lessons.length})</h2>
          <ol className="divide-y divide-slate-100">
            {course.lessons.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="font-bold text-indigo-700">{l.position}</span>
                <span className="flex-1">
                  {l.title}
                  {l.video_url && <span className="ml-2 text-xs text-slate-400">▶ 영상</span>}
                </span>
                <span className="text-xs text-slate-400">{l.duration_min}분</span>
                <form action={deleteLesson.bind(null, course.id, l.id)}>
                  <button className="text-xs text-rose-500 hover:underline">삭제</button>
                </form>
              </li>
            ))}
          </ol>
          {course.lessons.length === 0 && <p className="text-sm text-slate-500">오른쪽 폼으로 첫 강의를 추가하세요.</p>}
        </section>

        {/* 강의 추가: addLesson(courseId, formData) ← bind로 courseId를 앞에 끼움 */}
        <form action={addLesson.bind(null, course.id)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">강의 추가</h2>
          <div>
            <label className="label" htmlFor="l-title">강의 제목</label>
            <input id="l-title" name="title" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="l-video">유튜브 주소 (선택)</label>
            <input id="l-video" name="video_url" type="url" placeholder="https://youtu.be/..." className="input" />
          </div>
          <div>
            <label className="label" htmlFor="l-min">학습 시간(분)</label>
            <input id="l-min" name="duration_min" type="number" min={1} defaultValue={10} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="l-content">강의 내용</label>
            <textarea id="l-content" name="content" rows={5} className="input" />
          </div>
          <SubmitButton className="w-full bg-indigo-600 text-white hover:bg-indigo-700" pendingText="추가 중…">
            강의 추가
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}
