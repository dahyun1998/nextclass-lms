'use client'
// 페이지에서 오류가 throw 되면 이 화면이 대신 나온다.
// error.js는 반드시 클라이언트 컴포넌트여야 한다 (reset 버튼 클릭 처리).
export default function Error({ error, reset }) {
  return (
    <div className="py-20 text-center">
      <h2 className="text-xl font-bold text-rose-600">문제가 생겼습니다</h2>
      <p className="mt-2 text-sm text-slate-500">{error.message}</p>
      <button onClick={() => reset()} className="mt-6 rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white">
        다시 시도
      </button>
    </div>
  )
}
