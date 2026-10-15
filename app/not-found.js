// notFound()를 호출하거나 없는 주소로 오면 보여 주는 화면
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl font-extrabold text-indigo-200">404</p>
      <h2 className="mt-4 text-xl font-bold">찾는 페이지가 없습니다</h2>
      <Link href="/" className="mt-6 inline-block text-indigo-700 underline">강좌 목록으로</Link>
    </div>
  )
}
