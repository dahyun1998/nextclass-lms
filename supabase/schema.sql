-- =====================================================================
-- NEXTCLASS LMS — 데이터베이스 스키마
-- Supabase 대시보드 → SQL Editor → New query 에 붙여넣고 Run
-- =====================================================================

-- 1) 프로필: auth.users(로그인 계정)와 1:1. 이름과 역할(학생/강사)을 보관
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  role       text not null default 'student' check (role in ('student', 'instructor')),
  created_at timestamptz not null default now()
);

-- 회원가입하면 profiles 행을 자동으로 만드는 트리거
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    case when new.raw_user_meta_data ->> 'role' = 'instructor'
         then 'instructor' else 'student' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) 강좌
create table public.courses (
  id            bigint generated always as identity primary key,
  title         text not null,
  summary       text not null default '',
  description   text not null default '',
  category      text not null default '프로그래밍',
  level         text not null default '입문',
  instructor_id uuid references public.profiles (id) on delete set null,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);

-- 3) 강의(차시): 강좌 하나에 여러 개
create table public.lessons (
  id           bigint generated always as identity primary key,
  course_id    bigint not null references public.courses (id) on delete cascade,
  title        text not null,
  content      text not null default '',
  video_url    text,
  position     int  not null default 1,
  duration_min int  not null default 10,
  created_at   timestamptz not null default now()
);

-- 4) 수강신청: (학생, 강좌) 쌍이 기본키 → 같은 강좌 중복 신청 불가
create table public.enrollments (
  user_id    uuid   not null references public.profiles (id) on delete cascade,
  course_id  bigint not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- 5) 진도: 학생이 완료한 강의 기록
create table public.lesson_progress (
  user_id      uuid   not null references public.profiles (id) on delete cascade,
  lesson_id    bigint not null references public.lessons (id) on delete cascade,
  course_id    bigint not null references public.courses (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index on public.lessons (course_id, position);
create index on public.lesson_progress (user_id, course_id);

-- =====================================================================
-- RLS(행 수준 보안): "누가 어떤 행을 읽고 쓸 수 있는가"를 DB가 직접 검사
-- =====================================================================
alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.lessons         enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;

-- profiles: 이름은 누구나 조회(강사명 표시용), 수정은 본인만
create policy "profiles_select_all" on public.profiles
  for select using (true);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id);

-- courses: 공개 강좌는 누구나, 비공개는 담당 강사만 조회
create policy "courses_select" on public.courses
  for select using (is_published or instructor_id = (select auth.uid()));
create policy "courses_insert_instructor" on public.courses
  for insert with check (
    instructor_id = (select auth.uid())
    and exists (select 1 from public.profiles p
                where p.id = (select auth.uid()) and p.role = 'instructor')
  );
create policy "courses_update_own" on public.courses
  for update using (instructor_id = (select auth.uid()));
create policy "courses_delete_own" on public.courses
  for delete using (instructor_id = (select auth.uid()));

-- lessons: 읽을 수 있는 강좌의 강의만 조회, 쓰기는 담당 강사만
create policy "lessons_select" on public.lessons
  for select using (exists (
    select 1 from public.courses c
    where c.id = course_id
      and (c.is_published or c.instructor_id = (select auth.uid()))
  ));
create policy "lessons_write_own" on public.lessons
  for all using (exists (
    select 1 from public.courses c
    where c.id = course_id and c.instructor_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.courses c
    where c.id = course_id and c.instructor_id = (select auth.uid())
  ));

-- enrollments / lesson_progress: 본인 것만
create policy "enrollments_own" on public.enrollments
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
-- 강사는 자기 강좌의 수강신청 행을 볼 수 있다 (수강생 수 집계용)
create policy "enrollments_instructor_select" on public.enrollments
  for select using (exists (
    select 1 from public.courses c
    where c.id = course_id and c.instructor_id = (select auth.uid())
  ));
create policy "progress_own" on public.lesson_progress
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
