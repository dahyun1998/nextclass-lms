// 진도율 막대 — value는 0~100
export default function ProgressBar({ value }) {
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-1 text-right text-xs font-semibold text-indigo-700">{value}% 완료</p>
    </div>
  )
}
