-- ============================================
-- Petrion Academy - Migration 2: Courses domain
-- subjects, courses, enrollments + RLS
-- ============================================

-- 1. Subjects
create table public.subjects (
  id bigint generated always as identity primary key,
  name text not null unique,
  icon text,
  description text,
  created_at timestamptz not null default now()
);

-- 2. Courses
create table public.courses (
  id bigint generated always as identity primary key,
  subject_id bigint not null references public.subjects(id) on delete restrict,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  level text,
  price_per_lesson numeric(8,2) not null default 0,
  schedule_text text,
  cover_image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_courses_subject_id on public.courses(subject_id);
create index idx_courses_teacher_id on public.courses(teacher_id);

-- 3. Enrollments
create table public.enrollments (
  id bigint generated always as identity primary key,
  course_id bigint not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'completed')),
  created_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index idx_enrollments_course_id on public.enrollments(course_id);
create index idx_enrollments_student_id on public.enrollments(student_id);

-- 4. Enable RLS
alter table public.subjects enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;

-- 5. RLS: subjects (public read, admin write)
create policy "Subjects are viewable by everyone"
  on public.subjects for select using (true);

create policy "Admins manage subjects"
  on public.subjects for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 6. RLS: courses
-- Everyone can read published courses; teachers see their own drafts; admins see all.
create policy "Published courses are viewable by everyone"
  on public.courses for select
  using (
    is_published = true
    or teacher_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Teachers create own courses"
  on public.courses for insert
  with check (teacher_id = auth.uid() and public.has_role(auth.uid(), 'teacher'));

create policy "Teachers update own courses"
  on public.courses for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Teachers delete own courses"
  on public.courses for delete
  using (teacher_id = auth.uid());

create policy "Admins manage all courses"
  on public.courses for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 7. RLS: enrollments
-- Students see and create their own; teachers see/update enrollments for their courses.
create policy "Students view own enrollments"
  on public.enrollments for select
  using (student_id = auth.uid());

create policy "Teachers view enrollments for own courses"
  on public.enrollments for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = enrollments.course_id and c.teacher_id = auth.uid()
    )
  );

create policy "Admins view all enrollments"
  on public.enrollments for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Students enroll themselves"
  on public.enrollments for insert
  with check (student_id = auth.uid());

create policy "Teachers update enrollments for own courses"
  on public.enrollments for update
  using (
    exists (
      select 1 from public.courses c
      where c.id = enrollments.course_id and c.teacher_id = auth.uid()
    )
  );

create policy "Admins manage all enrollments"
  on public.enrollments for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
