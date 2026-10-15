-- =====================================================================
-- NEXTCLASS LMS — 예제 데이터 (schema.sql 실행 후 실행)
-- 강사가 없는 "샘플 강좌" 4개와 강의 13개를 넣는다.
-- video_url 은 비워 두었다. 강사 화면에서 유튜브 주소를 넣어 보세요.
-- =====================================================================

insert into public.courses (title, summary, description, category, level) values
('Next.js 첫걸음',
 'App Router로 웹 서비스를 만드는 가장 빠른 길',
 '폴더 하나가 주소 하나가 되는 App Router의 규칙을 익히고, 서버 컴포넌트와 클라이언트 컴포넌트를 구분해 간단한 페이지를 만든다.',
 '프로그래밍', '입문'),
('Supabase로 만드는 백엔드',
 'SQL 몇 줄로 로그인과 데이터베이스를 한 번에',
 'PostgreSQL 테이블을 설계하고, 인증과 RLS(행 수준 보안)로 "내 데이터는 나만" 규칙을 DB에 직접 건다.',
 '데이터', '초급'),
('파이썬 데이터 분석 기초',
 'pandas로 표를 다루는 감각 익히기',
 'CSV 파일을 불러와 정렬·필터·집계하고 간단한 그래프로 결과를 확인한다.',
 '데이터', '입문'),
('생성형 AI 활용 실무',
 '프롬프트 → 컨텍스트 → 하네스 순서로 AI 다루기',
 '같은 요청도 규칙과 자료를 함께 주면 결과가 달라진다. 업무 문서를 예로 AI 활용 순서를 익힌다.',
 'AI', '입문');

insert into public.lessons (course_id, title, content, position, duration_min)
select c.id, l.title, l.content, l.position, l.duration_min
from public.courses c
join (values
  ('Next.js 첫걸음', 'Next.js는 무엇인가', 'React 위에 라우팅·서버 렌더링·배포 규칙을 얹은 프레임워크다. 이 강의에서는 왜 Next.js를 쓰는지부터 정리한다.', 1, 12),
  ('Next.js 첫걸음', '폴더 = 주소: App Router', 'app/courses/page.js 파일은 /courses 주소가 된다. [id] 폴더는 동적 주소가 된다.', 2, 15),
  ('Next.js 첫걸음', '서버 컴포넌트와 use client', '기본은 서버 컴포넌트다. 클릭·입력 상태가 필요할 때만 파일 맨 위에 "use client"를 쓴다.', 3, 18),
  ('Next.js 첫걸음', 'Server Action으로 폼 처리', 'form의 action에 서버 함수를 연결하면 API 라우트 없이 DB에 쓸 수 있다.', 4, 20),
  ('Supabase로 만드는 백엔드', '테이블 설계하기', '강좌·강의·수강신청·진도 네 테이블의 관계를 그려 본다.', 1, 14),
  ('Supabase로 만드는 백엔드', '회원가입과 로그인', 'supabase.auth.signUp / signInWithPassword 두 함수로 인증을 처리한다.', 2, 16),
  ('Supabase로 만드는 백엔드', 'RLS로 데이터 지키기', 'auth.uid() = user_id 정책 한 줄이 "내 데이터는 나만"을 보장한다.', 3, 20),
  ('파이썬 데이터 분석 기초', 'pandas 시작하기', 'read_csv로 파일을 읽고 head()로 처음 다섯 줄을 확인한다.', 1, 10),
  ('파이썬 데이터 분석 기초', '정렬과 필터', 'sort_values와 조건식으로 원하는 행만 고른다.', 2, 12),
  ('파이썬 데이터 분석 기초', 'groupby로 집계하기', '그룹별 평균·합계를 구해 표로 정리한다.', 3, 15),
  ('생성형 AI 활용 실무', '프롬프트·컨텍스트·하네스', '세 가지는 경쟁이 아니라 층이다. 규칙 위에 자료, 그 위에 요청을 놓는다.', 1, 12),
  ('생성형 AI 활용 실무', '전·후 비교 실습', '같은 요청을 규칙 없이/있이 보내고 결과를 나란히 비교한다.', 2, 15),
  ('생성형 AI 활용 실무', 'AI 결과 검증하기', 'AI는 그럴듯하게 틀린다. 자가 점검 → 교차 검토 → 동료 검토 순으로 확인한다.', 3, 15)
) as l(course_title, title, content, position, duration_min)
  on c.title = l.course_title;
