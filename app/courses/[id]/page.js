// 강좌 상세: 소개 + 강의 목차 + 수강신청 버튼
// 동적 라우트 [id] → params.id 로 주소의 값을 받는다 (/courses/3 → id = "3")
// 강좌 상세: 소개 + 강의 목차 + 수강신청 버튼 + 후기 목록 및 작성 폼
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { CATEGORY_STYLE, percent } from '@/lib/utils'
import { enrollCourse, cancelEnrollment } from './actions'
import { createReview } from './actions'
import SubmitButton from '@/components/SubmitButton'
import ProgressBar from '@/components/ProgressBar'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('courses').select('title').eq('id', id).single()
  return { title: data ? `${data.title} — NEXTCLASS` : 'NEXTCLASS' }
}

export default async function CoursePage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getUser()

  // 1. 강좌 정보 + 강사 이름 + 강의 목록 + 후기 목록(작성자 프로필 포함)을 한 번에 불러오기
  const { data: course } = await supabase
    .from('courses')
    .select(`
      *, 
      profiles:instructor_id(name), 
      lessons(id, title, position, duration_min),
      reviews(id, rating, content, created_at, profiles:user_id(name))
    `)
    .eq('id', id)
    .order('position', { referencedTable: 'lessons' })
    .single()

  if (!course) notFound()

  // 로그인했다면: 수강 여부와 완료한 강의 목록
  let enrolled = false
  let doneIds = new Set()
  if (user) {
    const [{ data: enroll }, { data: progress }] = await Promise.all([
      supabase.from('enrollments').select('course_id').eq('user_id', user.id).eq('course_id', id).maybeSingle(),
      supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id).eq('course_id', id),
    ])
    enrolled = !!enroll
    doneIds = new Set((progress ?? []).map((p) => p.lesson_id))
  }

  const lessons = course.lessons || []
  const reviews = course.reviews || []
  const totalMin = lessons.reduce((sum, l) => sum + l.duration_min, 0)
  const nextLesson = lessons.find((l) => !doneIds.has(l.id)) ?? lessons[0]

  // 평균 별점 계산
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0'

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className={`rounded-2xl bg-linear-to-br ${CATEGORY_STYLE[course.category] ?? 'from-slate-600 to-slate-400'} p-8 text-white`}>
          <p className="text-sm font-semibold opacity-90">{course.category} · {course.level}</p>
          <h1 className="mt-2 text-3xl font-extrabold">{course.title}</h1>
          <p className="mt-2 opacity-90">{course.summary}</p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span>⭐ 평균 별점 {avgRating}</span>
            <span>·</span>
            <span>후기 {reviews.length}개</span>
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-2 text-lg font-bold">강좌 소개</h2>
          <p className="whitespace-pre-line leading-7 text-slate-700">{course.description}</p>
        </section>

        {/* 강의 목차 섹션 */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">
            강의 목차 <span className="text-sm font-normal text-slate-500">· {lessons.length}강 · {totalMin}분</span>
          </h2>
          <ol className="divide-y divide-slate-100">
            {lessons.map((lesson, i) => (
              <li key={lesson.id} className="flex items-center gap-3 py-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  doneIds.has(lesson.id) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {doneIds.has(lesson.id) ? '✓' : i + 1}
                </span>
                {enrolled ? (
                  <Link href={`/courses/${id}/lessons/${lesson.id}`} className="flex-1 hover:text-indigo-700">
                    {lesson.title}
                  </Link>
                ) : (
                  <span className="flex-1 text-slate-700">{lesson.title}</span>
                )}
                <span className="text-xs text-slate-400">{lesson.duration_min}분</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 수강평 및 후기 작성 섹션 */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          <h2 className="text-lg font-bold">수강생 후기 ({reviews.length})</h2>

          {/* 후기 목록 */}
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">아직 작성된 후기가 없습니다. 첫 후기를 남겨보세요!</p>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100">
              {reviews.map((review) => (
                <div key={review.id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800">
                      {review.profiles?.name || '수강생'}
                    </span>
                    <span className="text-amber-500 text-sm">
                      {'⭐'.repeat(review.rating)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{review.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* 수강생인 경우에만 후기 작성 폼 노출 */}
          {enrolled && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="text-md font-bold mb-4">후기 남기기</h3>
              <form action={createReview.bind(null, id)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">별점</label>
                  <select name="rating" required className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
                    <option value="4">⭐⭐⭐⭐ (4점)</option>
                    <option value="3">⭐⭐⭐ (3점)</option>
                    <option value="2">⭐⭐ (2점)</option>
                    <option value="1">⭐ (1점)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">내용</label>
                  <textarea
                    name="content"
                    rows="3"
                    required
                    placeholder="강좌에 대한 솔직한 후기를 남겨주세요."
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <SubmitButton className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                  후기 등록하기
                </SubmitButton>
              </form>
            </div>
          )}
        </section>
      </div>

     {/* 오른쪽 수강 상자 */}
      <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
        <p className="text-sm text-slate-500">강사 · {course.profiles?.name || 'SmartClass'}</p>

        {enrolled ? (
          <>
            <ProgressBar value={percent(doneIds.size, lessons.length)} />
            {nextLesson && (
              <Link href={`/courses/${id}/lessons/${nextLesson.id}`}
                className="block rounded-md bg-indigo-600 py-2 text-center font-semibold text-white hover:bg-indigo-700">
                {doneIds.size === 0 ? '학습 시작하기' : '이어서 학습하기'}
              </Link>
            )}

            {/* 💡 100% 완강 시 수료증 보기 버튼 노출 */}
            {lessons.length > 0 && doneIds.size >= lessons.length && (
              <Link href={`/courses/${id}/certificate`}
                className="block rounded-md bg-amber-500 py-2 text-center font-bold text-white hover:bg-amber-600 transition shadow-sm">
                🎓 수료증 보기
              </Link>
            )}

            <form action={cancelEnrollment.bind(null, course.id)}>
              <SubmitButton className="w-full border border-slate-300 text-sm text-slate-600 hover:bg-slate-50">
                수강 신청 취소
              </SubmitButton>
            </form>
          </>
        ) : (
          <form action={enrollCourse.bind(null, course.id, lessons[0]?.id)}>
            <SubmitButton className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300" pendingText="신청 중…">
              {user ? '무료 수강신청' : '로그인하고 수강신청'}
            </SubmitButton>
          </form>
        )}
      </aside>
    </div>
  )
}