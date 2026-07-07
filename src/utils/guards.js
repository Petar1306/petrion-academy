import { supabase } from '../services/supabaseClient.js';

// Returns the current user's session, or redirects to login if none.
export async function requireLogin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// Returns the current user's role (student | teacher | admin), or null.
export async function getMyRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (error) {
    console.error('Failed to fetch role:', error);
    return null;
  }
  const roles = (data || []).map((r) => r.role);
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('teacher')) return 'teacher';
  return 'student';
}
