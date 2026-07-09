import { supabase } from './supabaseClient.js';

// Get all profiles with their role (admin-only; RLS enforces this).
export async function getAllUsers() {
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, created_at')
    .order('created_at');
  if (pErr) throw pErr;

  const { data: roles, error: rErr } = await supabase
    .from('user_roles')
    .select('user_id, role');
  if (rErr) throw rErr;

  const roleByUser = {};
  for (const r of roles || []) roleByUser[r.user_id] = r.role;

  return (profiles || []).map((p) => ({
    ...p,
    role: roleByUser[p.id] || 'student',
  }));
}

// Change a user's role. Deletes existing role rows and inserts the new one.
export async function setUserRole(userId, newRole) {
  const { error: delErr } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);
  if (delErr) throw delErr;

  const { error: insErr } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role: newRole });
  if (insErr) throw insErr;
}

// Get all courses (admin overview).
export async function getAllCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, is_published,
      subject:subjects ( name ),
      teacher:profiles ( full_name )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
