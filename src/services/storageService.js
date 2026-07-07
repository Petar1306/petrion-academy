import { supabase } from './supabaseClient.js';

const BUCKET = 'course-files';

// Upload a file for a course and create a materials row.
// Path convention: {courseId}/{timestamp}-{filename}
export async function uploadMaterial(courseId, title, file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in.');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${courseId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file);
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('materials')
    .insert({
      course_id: courseId,
      title,
      file_path: path,
      file_type: file.type || null,
      uploaded_by: user.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// List materials for a course (RLS decides visibility).
export async function getMaterials(courseId) {
  const { data, error } = await supabase
    .from('materials')
    .select('id, title, file_path, file_type, created_at')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Create a temporary signed URL to download a private file.
export async function getDownloadUrl(filePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60); // valid 60 seconds
  if (error) throw error;
  return data.signedUrl;
}

// Delete a material (file + row).
export async function deleteMaterial(materialId, filePath) {
  await supabase.storage.from(BUCKET).remove([filePath]);
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', materialId);
  if (error) throw error;
}
