'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { percent } from '@/lib/utils'
import CourseCard from '@/components/CourseCard'
import Sortable from 'sortablejs'

export default function MyClassClient({ initialCourses, initialProgress, profile }) {
  // 1. courses 상태 선언
  const [courses, setCourses] = useState(initialCourses)
  const listRef = useRef(null)

  // 2. 버튼으로 순서를 바꾸는 함수 (위/아래 이동)
  const moveItem = (index, direction) => {
    const newCourses = [...courses]
    const targetIndex = index + direction

    // 범위를 벗어나면 이동하지 않음
    if (targetIndex < 0 || targetIndex >= newCourses.length) return

    // 위치 맞바꾸기 (Swap)
    const temp = newCourses[index]
    newCourses[index] = newCourses[targetIndex]
    newCourses[targetIndex] = temp

    setCourses(newCourses)
  }

  // 드래그 앤 드롭 정렬 초기화
  useEffect(() => {
    if (listRef.current) {
      Sortable.create(listRef.current, {
        animation: 150,
        ghostClass: 'bg-indigo-50',
        onEnd: (evt) => {
          const newCourses = [...courses]
          const [movedItem] = newCourses.splice(evt.oldIndex, 1)
          newCourses.splice(evt.newIndex, 0, movedItem)
          setCourses(newCourses)
        },
      })
    }
  }, [courses])

  const doneByCourse = {}
  for (const p of initialProgress ?? []) {
    doneByCourse[p.course_id] = (doneByCourse[p.course_id] ?? 0) + 1
  }

  const completed = courses.filter(
    (c) => percent(doneByCourse[c.id] ?? 0, c.lessons[0]?.count ?? 0) === 100
  ).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{profile?.name || '학습자'}님의 강의실</h1>
        <div className="mt-4 grid max-w-md grid-cols-2 gap-4">
          <Stat label="수강 중" value={courses.length} />
          <Stat label="완강" value={completed} />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-500">아직 수강 중인 강좌가 없습니다.</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-indigo-700 underline">강좌 둘러보기</Link>
        </div>
      ) : (
        <div ref={listRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 cursor-grab active:cursor-grabbing">
          {courses.map((c, index) => (
            <div key={c.id} data-id={c.id} className="relative rounded-xl bg-white">
              
              {/* 우측 상단 순서 변경 버튼 (↑, ↓) */}
              <div className="absolute top-2 right-2 flex gap-1 z-10">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 shadow hover:bg-slate-200 disabled:opacity-30"
                  title="위로 이동"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === courses.length - 1}
                  className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 shadow hover:bg-slate-200 disabled:opacity-30"
                  title="아래로 이동"
                >
                  ↓
                </button>
              </div>

              <CourseCard
                course={c}
                progress={percent(doneByCourse[c.id] ?? 0, c.lessons[0]?.count ?? 0)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-extrabold text-indigo-700">{value}</p>
    </div>
  )
}