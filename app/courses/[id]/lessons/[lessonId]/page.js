// 강의 보기: 영상 + 본문 + 완료 체크 + 이전/다음 + 목차 사이드바
// 주소 /courses/1/lessons/3 → params = { id: "1", lessonId: "3" }
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { percent } from '@/lib/utils'
import { toggleComplete } from './actions'
import VideoPlayer from '@/components/VideoPlayer'
import ProgressBar from '@/components/ProgressBar'
import SubmitButton from '@/components/SubmitButton'

export default async function LessonPage({ params }) {
  const { id, lessonId } = await params
  const user = await getUser()
  if (!user) redirect(`/login?next=/courses/${id}/lessons/${lessonId}`)

  const supabase = await createClient()

  // 세 가지를 동시에 조회 (Promise.all → 기다리는 시간 단축)
  const [{ data: enroll }, { data: course }, { data: progress }] = await Promise.all([
    supabase.from('enrollments').select('course_id').eq('user_id', user.id).eq('course_id', id).maybeSingle(),
    supabase.from('courses')
      .select('id, title, lessons(id, title, content, video_url, position, duration_min)')
      .eq('id', id)
      .order('position', { referencedTable: 'lessons' })
      .single(),
    supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id).eq('course_id', id),
  ])

  if (!course) notFound()
  if (!enroll) redirect(`/courses/${id}`) // 수강신청 안 했으면 상세 페이지로

  const lessons = course.lessons
  const index = lessons.findIndex((l) => String(l.id) === lessonId)
  if (index === -1) notFound()

  const lesson = lessons[index]
  const prev = lessons[index - 1]
  const next = lessons[index + 1]
  const doneIds = new Set((progress ?? []).map((p) => p.lesson_id))
  const isDone = doneIds.has(lesson.id)

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <article className="space-y-6">
        <Link href={`/courses/${id}`} className="text-sm text-indigo-700 hover:underline">← {course.title}</Link>
        <h1 className="text-2xl font-extrabold">{index + 1}강. {lesson.title}</h1>

        <VideoPlayer url={lesson.video_url} title={lesson.title} />

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="whitespace-pre-line leading-8 text-slate-700">{lesson.content}</p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <form action={toggleComplete.bind(null, course.id, lesson.id, isDone)}>
            <SubmitButton
              className={isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
              pendingText="저장 중…"
            >
              {isDone ? '✓ 완료함 (취소하려면 클릭)' : '이 강의 완료하기'}
            </SubmitButton>
          </form>

          <div className="ml-auto flex gap-2">
            {prev && <NavLink href={`/courses/${id}/lessons/${prev.id}`}>← 이전</NavLink>}
            {next && <NavLink href={`/courses/${id}/lessons/${next.id}`}>다음 →</NavLink>}
          </div>
        </div>
      </article>

      {/* 사이드바 목차 */}
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
        <ProgressBar value={percent(doneIds.size, lessons.length)} />
        <ol className="mt-4 space-y-1">
          {lessons.map((l, i) => (
            <li key={l.id}>
              <Link
                href={`/courses/${id}/lessons/${l.id}`}
                className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                  l.id === lesson.id ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={doneIds.has(l.id) ? 'text-emerald-500' : 'text-slate-300'}>●</span>
                {i + 1}. {l.title}
              </Link>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}

function NavLink({ href, children }) {
  return (
    <Link href={href} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
      {children}
    </Link>
  )
}
