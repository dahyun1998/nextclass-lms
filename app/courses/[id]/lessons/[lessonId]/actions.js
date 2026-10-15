'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

// 강의 완료 체크 / 해제 (토글)
export async function toggleComplete(courseId, lessonId, isDone) {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  if (isDone) {
    await supabase.from('lesson_progress').delete()
      .eq('user_id', user.id).eq('lesson_id', lessonId)
  } else {
    // upsert: 없으면 넣고, 있으면 그대로 (두 번 눌러도 오류 없음)
    await supabase.from('lesson_progress')
      .upsert({ user_id: user.id, lesson_id: lessonId, course_id: courseId })
  }

  revalidatePath(`/courses/${courseId}`, 'layout') // 상세·강의 화면 모두 새로
  revalidatePath('/my')
}
