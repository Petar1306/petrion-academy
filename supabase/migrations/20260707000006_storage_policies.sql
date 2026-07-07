-- ============================================
-- Petrion Academy - Migration 6: Storage policies
-- Policies for the course-files bucket
-- ============================================

create policy "Teachers upload course files"
  on storage.objects for insert
  with check (
    bucket_id = 'course-files'
    and public.has_role(auth.uid(), 'teacher')
  );

create policy "Teachers and admins read course files"
  on storage.objects for select
  using (
    bucket_id = 'course-files'
    and (
      public.has_role(auth.uid(), 'teacher')
      or public.has_role(auth.uid(), 'admin')
    )
  );

create policy "Enrolled students read course files"
  on storage.objects for select
  using (
    bucket_id = 'course-files'
    and exists (
      select 1
      from public.materials m
      join public.enrollments e on e.course_id = m.course_id
      where m.file_path = storage.objects.name
        and e.student_id = auth.uid()
        and e.status = 'approved'
    )
  );

create policy "Teachers delete course files"
  on storage.objects for delete
  using (
    bucket_id = 'course-files'
    and public.has_role(auth.uid(), 'teacher')
  );
