// 홈 = 강좌 목록 (서버 컴포넌트)
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/utils'
import HomeClient from '@/components/HomeClient' // 클라이언트 컴포넌트 임포트

export default async function HomePage({ searchParams }) {
  const { category, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('courses')
    .select('id, title, summary, category, level, profiles:instructor_id(name), lessons(count), reviews(rating)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: courses, error } = await query
  if (error) throw new Error(error.message)

  return (
    <HomeClient 
      initialCourses={courses ?? []} 
      category={category} 
      q={q} 
    />
  )
}