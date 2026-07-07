-- ============================================
-- Petrion Academy - Migration 5: Course materials
-- materials table + RLS (only enrolled students can read)
-- ============================================

create table public.materials (
  id bigint generated always as identity primary key,
  course_id bigint not null references public.courses(id) on delete cascade,
  title text not null,
  file_path text not null,
  file_type text,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_materials_course_id on public.materials(course_id);

alter table public.materials enable row level security;

-- Read: enrolled+approved students, the course teacher, or admins.
create policy "Enrolled students and owners can read materials"
  on public.materials for select
  using (
    public.has_role(auth.uid(), 'admin')
    or exists (
      select 1 from public.courses c
      where c.id = materials.course_id and c.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.enrollments e
      where e.course_id = materials.course_id
        and e.student_id = auth.uid()
        and e.status = 'approved'
    )
  );

-- Insert: only the teacher who owns the course.
create policy "Teachers add materials to own courses"
  on public.materials for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.courses c
      where c.id = materials.course_id and c.teacher_id = auth.uid()
    )
  );

-- Delete: teacher of the course, or admin.
create policy "Teachers delete own course materials"
  on public.materials for delete
  using (
    public.has_role(auth.uid(), 'admin')
    or exists (
      select 1 from public.courses c
      where c.id = materials.course_id and c.teacher_id = auth.uid()
    )
  );
