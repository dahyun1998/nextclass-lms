// 홈 = 강좌 목록 (서버 컴포넌트)
// 주소 예: /?category=데이터&q=파이썬  → searchParams로 필터
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/CourseCard'
import { CATEGORIES } from '@/lib/utils'

export default async function HomePage({ searchParams }) {
  const { category, q } = await searchParams // Next.js 15+ : searchParams는 Promise
  const supabase = await createClient()

  // 1) 기본 쿼리: 공개 강좌 + 강사 이름 + 강의 수
  let query = supabase
    .from('courses')
    .select('id, title, summary, category, level, profiles:instructor_id(name), lessons(count), reviews(rating)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // 2) 조건이 있으면 쿼리에 이어 붙인다
  if (category) query = query.eq('category', category)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: courses, error } = await query
  if (error) throw new Error(error.message) // → app/error.js 가 화면을 대신 그림

  return (
    <div className="space-y-8">
      {/* 히어로 */}
      <section className="rounded-2xl bg-indigo-700 px-8 py-10 text-white">
        <p className="text-sm font-semibold text-amber-300">지금 배우고, 바로 만든다</p>
        <h1 className="mt-2 text-3xl font-extrabold">NEXTCLASS 온라인 강의실</h1>
        <p className="mt-2 text-indigo-100">강좌를 고르고, 수강신청하고, 진도를 채워 보세요.</p>

        {/* GET 폼: 제출하면 /?q=검색어 로 이동 → 서버가 다시 그림 */}
        <form className="mt-6 flex max-w-lg gap-2">
          <input name="q" defaultValue={q} placeholder="강좌 이름 검색" className="input text-slate-900" />
          {category && <input type="hidden" name="category" value={category} />}
          <button className="rounded-md bg-amber-400 px-4 font-bold text-slate-900">검색</button>
        </form>
      </section>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        <FilterChip href="/" active={!category}>전체</FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} href={`/?category=${encodeURIComponent(c)}`} active={category === c}>
            {c}
          </FilterChip>
        ))}
      </div>

      {/* 강좌 그리드 */}
      {courses.length === 0 ? (
        <p className="py-20 text-center text-slate-500">조건에 맞는 강좌가 없습니다.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium ${active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-400'
        }`}
    >
      {children}
    </Link>
  )
}
