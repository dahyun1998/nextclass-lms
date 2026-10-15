// 강좌 카드 (서버 컴포넌트) — props로 받은 강좌 한 개를 그린다
import Link from 'next/link'
import { CATEGORY_STYLE } from '@/lib/utils'
import ProgressBar from './ProgressBar'

export default function CourseCard({ course, progress }) {
  const gradient = CATEGORY_STYLE[course.category] ?? 'from-slate-600 to-slate-400'
  const lessonCount = course.lessons?.[0]?.count ?? 0

  // 후기 평점 및 개수 계산
  const reviews = course.reviews || []
  const reviewCount = reviews.length
  const avgRating = reviewCount > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1) 
    : '0.0'

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className={`flex h-32 items-end bg-linear-to-br ${gradient} p-4`}>
        <span className="rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {course.category} · {course.level}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-bold text-slate-900 group-hover:text-indigo-700">{course.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{course.summary}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{course.profiles?.name || 'NEXTCLASS'} · 강의 {lessonCount}개</span>
          {reviewCount > 0 && (
            <span className="font-medium text-slate-700">
              ⭐ {avgRating} ({reviewCount})
            </span>
          )}
        </div>
        {progress !== undefined && <ProgressBar value={progress} />}
      </div>
    </Link>
  )
}