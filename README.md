# NEXTCLASS — Next.js App Router + Supabase LMS

강좌 목록 · 수강신청 · 강의 시청 · 진도율 · 강사용 강좌 관리를 갖춘 간단한 LMS(Learning Management System) 실습 예제입니다.

| 구분 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, JavaScript) |
| 스타일 | Tailwind CSS 4 |
| DB · 인증 | Supabase (PostgreSQL + Auth + RLS) |
| 배포 | Vercel |

## 1. 실행 순서

```bash
npm install
cp .env.example .env.local     # 값 채우기 (아래 2번)
npm run dev                    # http://localhost:3000
```

## 2. Supabase 준비

1. supabase.com → New project 생성
2. **SQL Editor**에서 `supabase/schema.sql` 실행 → `supabase/seed.sql` 실행
3. **Project Settings → API Keys**에서 Project URL과 Publishable key를 `.env.local`에 붙여넣기
4. (실습용) **Authentication → Sign In / Providers → Email**에서 *Confirm email*을 끄면 가입 즉시 로그인됩니다.

## 3. 폴더 구조

```
app/
├─ layout.js                     공통 틀 + 상단 메뉴
├─ page.js                       /            강좌 목록 (검색·카테고리 필터)
├─ loading.js · error.js · not-found.js
├─ login/                        /login       로그인·회원가입 (Server Action)
├─ courses/[id]/                 /courses/3   강좌 상세 · 수강신청
│  └─ lessons/[lessonId]/        /courses/3/lessons/7  강의 보기 · 완료 체크
├─ my/                           /my          내 강의실 (진도율)
└─ instructor/                   /instructor  강사 센터
   ├─ new/                       새 강좌
   └─ courses/[id]/              강좌 관리 · 강의 추가
components/   Header, CourseCard, ProgressBar, SubmitButton, VideoPlayer
lib/          supabase/(client·server·proxy), auth.js, utils.js
proxy.js      세션 갱신 + /my, /instructor 보호 (Next.js 16의 middleware)
supabase/     schema.sql, seed.sql
```

## 4. Vercel 배포

1. GitHub에 저장소를 올린다 (`.env.local`은 올라가지 않음)
2. vercel.com → Add New → Project → 저장소 Import
3. Environment Variables에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 입력 → Deploy
4. Supabase **Authentication → URL Configuration**의 Site URL을 Vercel 주소로 바꾼다

## 5. 연습 과제

- 강좌에 별점·후기 테이블 추가하기
- 강의 순서를 위/아래로 바꾸는 버튼 만들기
- 완강하면 수료증 페이지(`/my/certificate/[courseId]`) 보여 주기
