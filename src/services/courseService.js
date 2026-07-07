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
// Optional subjectId filters by subject.
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
