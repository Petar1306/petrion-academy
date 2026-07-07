import { supabase } from './supabaseClient.js';

// Get the current user's enrollment for a course (or null).
export async function getMyEnrollment(courseId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('enrollments')
    .select('id, status')
    .eq('course_id', courseId)
    .eq('student_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Enroll the current user into a course (status defaults to 'pending').
export async function enrollInCourse(courseId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to enroll.');

  const { data, error } = await supabase
    .from('enrollments')
    .insert({ course_id: courseId, student_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all enrollments for the current user, with course + subject info.
export async function getMyEnrollments() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id, status, created_at,
      course:courses (
        id, title, level, price_per_lesson, schedule_text,
        subject:subjects ( name, icon ),
        teacher:profiles ( full_name )
      )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
