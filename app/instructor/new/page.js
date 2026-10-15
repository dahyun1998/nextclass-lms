// 새 강좌 만들기 폼
import { createCourse } from '../actions'
import { CATEGORIES, LEVELS } from '@/lib/utils'
import SubmitButton from '@/components/SubmitButton'

export const metadata = { title: '새 강좌 — SmartClass' }

export default function NewCoursePage() {
  return (
    <form action={createCourse} className="mx-auto max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-extrabold">새 강좌 만들기</h1>

      <div>
        <label className="label" htmlFor="title">강좌 이름</label>
        <input id="title" name="title" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="summary">한 줄 소개</label>
        <input id="summary" name="summary" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="description">상세 소개</label>
        <textarea id="description" name="description" rows={5} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="category">분야</label>
          <select id="category" name="category" className="input">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="level">난이도</label>
          <select id="level" name="level" className="input">
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <SubmitButton className="w-full bg-indigo-600 text-white hover:bg-indigo-700" pendingText="만드는 중…">
        강좌 만들고 강의 추가하기
      </SubmitButton>
    </form>
  )
}
