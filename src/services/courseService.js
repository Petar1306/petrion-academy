import { supabase } from './supabaseClient.js';

// Fetch all subjects (for filters and forms).
export async function getSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

// Fetch published courses, with subject and teacher info joined.
export async function getPublishedCourses(subjectId = null) {
  let query = supabase
    .from('courses')
    .select(`
      id, title, description, level, price_per_lesson, schedule_text,
      cover_image_url, is_published,
      subject:subjects ( id, name, icon ),
      teacher:profiles ( id, full_name, avatar_url )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (subjectId) query = query.eq('subject_id', subjectId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Fetch a single course by id, with subject and teacher.
export async function getCourseById(id) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, description, level, price_per_lesson, schedule_text,
      cover_image_url, is_published, teacher_id,
      subject:subjects ( id, name, icon ),
      teacher:profiles ( id, full_name, avatar_url, bio )
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Fetch courses owned by the current teacher (RLS restricts to own rows).
export async function getMyCourses() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, level, price_per_lesson, is_published,
      subject:subjects ( name, icon )
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Fetch enrollments for a given course (RLS lets teacher see only own courses).
export async function getEnrollmentsForCourse(courseId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id, status, created_at,
      student:profiles ( id, full_name )
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Update an enrollment status (approve/reject). RLS enforces ownership.
export async function updateEnrollmentStatus(enrollmentId, status) {
  const { data, error } = await supabase
    .from('enrollments')
    .update({ status })
    .eq('id', enrollmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
