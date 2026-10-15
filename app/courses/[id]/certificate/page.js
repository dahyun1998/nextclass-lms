// 수료증 페이지: 100% 완강 시 발급
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/auth'
import PrintButton from './PrintButton'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('courses').select('title').eq('id', id).single()
  return { title: data ? `수료증 — ${data.title}` : '수료증' }
}

export default async function CertificatePage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getUser()
  const profile = await getProfile()

  if (!user) {
    notFound()
  }

  // 1. 강좌 정보 및 전체 강의(레슨) 목록 가져오기
  const { data: course } = await supabase
    .from('courses')
    .select('*, lessons(id, title)')
    .eq('id', id)
    .single()

  if (!course) notFound()

  // 2. 수강신청 여부 확인
  const { data: enroll } = await supabase
    .from('enrollments')
    .select('created_at')
    .eq('user_id', user.id)
    .eq('course_id', id)
    .maybeSingle()

  if (!enroll) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-lg font-bold text-slate-700">수강신청하지 않은 강좌입니다.</p>
        <Link href={`/courses/${id}`} className="text-indigo-600 underline font-semibold">강좌 상세로 돌아가기</Link>
      </div>
    )
  }

  // 3. 완료한 강의 목록 가져오기
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .eq('course_id', id)

  const lessons = course.lessons || []
  const doneCount = progress?.length || 0
  const totalCount = lessons.length

  // 100% 완강했는지 확인
  const isCompleted = totalCount > 0 && doneCount >= totalCount

  if (!isCompleted) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-10">
        <h2 className="text-xl font-bold text-slate-800">아직 수료 조건을 만족하지 못했습니다!</h2>
        <p className="text-slate-600">
          전체 {totalCount}개 강의 중 <span className="font-bold text-indigo-600">{doneCount}개</span>를 완료하셨습니다. 모든 강의를 완료해야 수료증이 발급됩니다.
        </p>
        <div className="pt-4">
          <Link href={`/courses/${id}`} className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 transition">
            학습 이어하기
          </Link>
        </div>
      </div>
    )
  }

  // 발급일 포맷팅
  const issueDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-3xl py-12 px-4">
      {/* 수료증 본문 디자인 박스 */}
      <div className="relative rounded-3xl border-8 border-double border-amber-400 bg-white p-12 text-center shadow-xl space-y-8">
        <div className="absolute top-6 left-6 text-xs font-semibold text-slate-400">NEXTCLASS LMS</div>
        <div className="absolute top-6 right-6 text-xs font-semibold text-slate-400">CERTIFICATE</div>

        <div className="space-y-3 pt-6">
          <h1 className="text-4xl font-extrabold tracking-widest text-slate-900">수 료 증</h1>
          <p className="text-sm tracking-wider text-slate-500">CERTIFICATE OF COMPLETION</p>
        </div>

        <div className="space-y-4 py-4">
          <p className="text-lg text-slate-700">성명 : <span className="font-bold text-slate-900 border-b-2 border-slate-300 pb-1 px-4">{profile?.name || '수강생'}</span></p>
          <p className="text-slate-600 leading-relaxed">
            위 사람은 넥스트클래스(NEXTCLASS)에서 주관하는<br />
            <strong className="text-xl text-indigo-700 font-bold">[{course.title}]</strong> 과정을 성실히 수료하였기에 이 증서를 수여합니다.
          </p>
        </div>

        <div className="pt-8 flex items-center justify-between border-t border-slate-100 text-sm text-slate-600">
          <div>
            <p className="font-semibold">발급일</p>
            <p className="text-slate-500">{issueDate}</p>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-indigo-600 text-lg">NEXTCLASS 교육원장</p>
          </div>
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/my" className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition">
          내 강의실로 돌아가기
        </Link>
        <PrintButton />
      </div>
    </div>
  )
}