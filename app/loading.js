// 페이지 데이터를 불러오는 동안 자동으로 보여 주는 화면 (Suspense)
export default function Loading() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-60 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  )
}
