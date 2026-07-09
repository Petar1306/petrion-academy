import { supabase } from './supabaseClient.js';

// Fetch teachers by looking at who teaches published courses.
// This avoids relying on user_roles (which is RLS-restricted for anonymous users).
export async function getTeachers() {
  // 1. Get all published courses with teacher + subject.
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      teacher_id,
      subject:subjects ( name ),
      teacher:profiles ( id, full_name, avatar_url, bio )
    `)
    .eq('is_published', true);
  if (error) throw error;

  // 2. Group by teacher, collecting unique subjects.
  const byId = {};
  for (const c of courses || []) {
    const t = c.teacher;
    if (!t) continue;
    if (!byId[t.id]) {
      byId[t.id] = {
        id: t.id,
        full_name: t.full_name,
        avatar_url: t.avatar_url,
        bio: t.bio,
        subjects: new Set(),
      };
    }
    if (c.subject?.name) byId[t.id].subjects.add(c.subject.name);
  }

  // 3. Return as array with subjects as plain arrays, sorted by name.
  return Object.values(byId)
    .map((t) => ({ ...t, subjects: Array.from(t.subjects) }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}
