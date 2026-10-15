// app/my/page.js
import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/auth'
import MyClassClient from '@/components/MyClassClient'

export const metadata = { title: '내 강의실 — SmartClass' }

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

  const courses = (enrollments ?? []).map((e) => e.courses).filter(Boolean)

  return (
    <MyClassClient 
      initialCourses={courses} 
      initialProgress={progress ?? []} 
      profile={profile} 
    />
  )
}