'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 transition"
    >
      수료증 인쇄 / PDF 저장
    </button>
  )
}