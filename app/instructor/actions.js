'use server'
// 강사용 Server Action 모음: 강좌 만들기·공개 전환·삭제, 강의 추가·삭제
// 권한 검사는 DB의 RLS가 한 번 더 한다 (남의 강좌는 수정되지 않음)
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'

async function requireInstructor() {
  const profile = await getProfile()
  if (profile?.role !== 'instructor') redirect('/instructor')
  return profile
}

export async function createCourse(formData) {
  const profile = await requireInstructor()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: formData.get('title'),
      summary: formData.get('summary'),
      description: formData.get('description'),
      category: formData.get('category'),
      level: formData.get('level'),
      instructor_id: profile.id,
      is_published: false, // 처음에는 비공개 → 강의를 채운 뒤 공개
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/instructor')
  redirect(`/instructor/courses/${data.id}`)
}

export async function togglePublish(courseId, current) {
  await requireInstructor()
  const supabase = await createClient()
  await supabase.from('courses').update({ is_published: !current }).eq('id', courseId)
  revalidatePath('/instructor')
  revalidatePath(`/instructor/courses/${courseId}`)
  revalidatePath('/')
}

export async function deleteCourse(courseId) {
  await requireInstructor()
  const supabase = await createClient()
  await supabase.from('courses').delete().eq('id', courseId)
  revalidatePath('/instructor')
  revalidatePath('/')
  redirect('/instructor')
}

export async function addLesson(courseId, formData) {
  await requireInstructor()
  const supabase = await createClient()

  // 다음 순서 번호 = 현재 강의 수 + 1
  const { count } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)

  const { error } = await supabase.from('lessons').insert({
    course_id: courseId,
    title: formData.get('title'),
    content: formData.get('content'),
    video_url: formData.get('video_url') || null,
    duration_min: Number(formData.get('duration_min')) || 10,
    position: (count ?? 0) + 1,
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/instructor/courses/${courseId}`)
  revalidatePath(`/courses/${courseId}`, 'layout')
}

export async function deleteLesson(courseId, lessonId) {
  await requireInstructor()
  const supabase = await createClient()
  await supabase.from('lessons').delete().eq('id', lessonId)
  revalidatePath(`/instructor/courses/${courseId}`)
  revalidatePath(`/courses/${courseId}`, 'layout')
}
