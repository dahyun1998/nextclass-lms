'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

// 수강신청: enrollCourse.bind(null, courseId) 로 courseId를 미리 묶어서 넘긴다
export async function enrollCourse(courseId, firstLessonId) {
  const user = await getUser()
  if (!user) redirect(`/login?next=/courses/${courseId}`)

  const supabase = await createClient()
  const { error } = await supabase
    .from('enrollments')
    .insert({ user_id: user.id, course_id: courseId })

  // 23505 = 기본키 중복(이미 신청함) → 오류로 보지 않는다
  if (error && error.code !== '23505') throw new Error(error.message)

  revalidatePath(`/courses/${courseId}`)
  revalidatePath('/my')
  redirect(firstLessonId ? `/courses/${courseId}/lessons/${firstLessonId}` : `/courses/${courseId}`)
}

// 수강 취소
export async function cancelEnrollment(courseId) {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  await supabase.from('enrollments').delete().eq('user_id', user.id).eq('course_id', courseId)
  await supabase.from('lesson_progress').delete().eq('user_id', user.id).eq('course_id', courseId)

  revalidatePath(`/courses/${courseId}`)
  revalidatePath('/my')
}

// 후기 작성 액션
export async function createReview(courseId, formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const rating = parseInt(formData.get('rating'), 10)
  const content = formData.get('content')

  if (!content || isNaN(rating)) {
    throw new Error('별점과 내용을 모두 입력해주세요.')
  }

  const { error } = await supabase.from('reviews').insert({
    course_id: courseId,
    user_id: user.id,
    rating,
    content,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error('이미 이 강좌에 후기를 작성하셨습니다.')
    }
    throw new Error(error.message)
  }

  // 상세 페이지 새로고침
  revalidatePath(`/courses/${courseId}`)
}
