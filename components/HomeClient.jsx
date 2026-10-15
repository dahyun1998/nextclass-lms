'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import CourseCard from '@/components/CourseCard'
import { CATEGORIES } from '@/lib/utils'
import Sortable from 'sortablejs'

export default function HomeClient({ initialCourses, category, q }) {
    const [courses, setCourses] = useState(initialCourses)
    const listRef = useRef(null)

    // 검색어나 카테고리가 바뀔 때 갱신
    useEffect(() => {
        setCourses(initialCourses)
    }, [initialCourses])

    // 버튼으로 순서를 바꾸는 함수 (위/아래 이동)
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

    return (
        <div className="space-y-8">
            {/* 히어로 영역 (좌우 2단 배치) */}
            <section className="relative rounded-2xl bg-indigo-700 px-8 py-10 text-white overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">

                {/* 왼쪽: 텍스트 및 검색 영역 */}
                <div className="flex-1 w-full">
                    <p className="text-sm font-semibold text-amber-300">지금 배우고, 바로 만든다</p>
                    <h1 className="mt-2 text-3xl font-extrabold">SmartClass 온라인 강의실</h1>
                    <p className="mt-2 text-indigo-100">강좌를 고르고, 수강신청하고, 진도를 채워 보세요.</p>

                    <form className="mt-6 flex max-w-lg gap-2">
                        <input name="q" defaultValue={q} placeholder="강좌 이름 검색" className="input text-slate-900 bg-white px-4 py-2 rounded-md flex-1" />
                        {category && <input type="hidden" name="category" value={category} />}
                        <button className="rounded-md bg-amber-400 px-5 font-bold text-slate-900 hover:bg-amber-300 transition">검색</button>
                    </form>
                </div>

                {/* 오른쪽: 빈 공간에 들어갈 로고/이미지 영역 */}
                <div className="w-full md:w-auto flex justify-center items-center">
                    {/* 이미지가 있다면 아래 <img> 태그의 src를 수정하세요 (예: /logo.png) */}
                    {/* 이미지가 아직 없다면 예쁜 아이콘 박스로 대체해 두었습니다 */}
                    {/* <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-center min-w-[200px]">
            <span className="text-5xl mb-2">🎓</span>
            <span className="text-amber-300 font-extrabold text-lg tracking-wider">SmartClass</span>
            <span className="text-indigo-200 text-xs mt-1">Online LMS Platform</span>
          </div> */}
                    <img
                        src="/logo.png"
                        alt="SmartClass 로고"
                        className="h-66 w-auto object-contain rounded-xl shadow-md bg-white/10 p-3"
                    />
                </div>

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

            {/* 강좌 그리드 (드래그 및 버튼 순서 변경 적용) */}
            {courses.length === 0 ? (
                <p className="py-20 text-center text-slate-500">조건에 맞는 강좌가 없습니다.</p>
            ) : (
                <div ref={listRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 cursor-grab active:cursor-grabbing">
                    {courses.map((course, index) => (
                        <div key={course.id} data-id={course.id} className="relative rounded-xl bg-white shadow-sm border border-slate-100">

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

                            <CourseCard course={course} />
                        </div>
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
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${active
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-400 hover:bg-slate-50'
                }`}
        >
            {children}
        </Link>
    )
}