import '../bootstrap-setup.js';
import { renderNavbar } from '../components/navbar.js';
import { requireLogin, getMyRole } from '../utils/guards.js';
import {
  getMyCourses, getEnrollmentsForCourse, updateEnrollmentStatus,
} from '../services/courseService.js';
import {
  uploadMaterial, getMaterials, deleteMaterial,
} from '../services/storageService.js';
import {
  getAllUsers, setUserRole, getAllCourses,
} from '../services/adminService.js';

const containerEl = document.getElementById('myCourses');
const messageEl = document.getElementById('panelMessage');

const statusBadge = {
  pending: '<span class="badge bg-warning text-dark">Pending</span>',
  approved: '<span class="badge bg-success">Approved</span>',
  rejected: '<span class="badge bg-danger">Rejected</span>',
  completed: '<span class="badge bg-info text-dark">Completed</span>',
};

function showMessage(text, type = 'info') {
  messageEl.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
}

// ---------- Admin section ----------
async function renderAdmin() {
  document.getElementById('adminArea').style.display = 'block';
  document.getElementById('panelTitle').textContent = 'Admin Panel';
  document.getElementById('panelSubtitle').textContent = 'Manage users, roles and all courses.';

  await renderUsersTable();
  await renderCoursesTable();
}

async function renderUsersTable() {
  const el = document.getElementById('usersTable');
  let users = [];
  try { users = await getAllUsers(); }
  catch (e) { console.error(e); el.innerHTML = '<div class="alert alert-danger">Could not load users.</div>'; return; }

  const roleSelect = (u) => `
    <select class="form-select form-select-sm role-select" data-id="${u.id}" style="max-width:140px;">
      ${['student', 'teacher', 'admin'].map((r) =>
        `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}
    </select>`;

  el.innerHTML = `
    <table class="table table-dark table-sm align-middle">
      <thead><tr><th>Name</th><th>Role</th></tr></thead>
      <tbody>
        ${users.map((u) => `<tr><td>${u.full_name || '(no name)'}</td><td>${roleSelect(u)}</td></tr>`).join('')}
      </tbody>
    </table>`;

  el.querySelectorAll('.role-select').forEach((sel) => {
    sel.addEventListener('change', async () => {
      try {
        await setUserRole(sel.dataset.id, sel.value);
        showMessage('Role updated.', 'success');
      } catch (err) {
        console.error(err);
        showMessage('Could not update role.', 'danger');
      }
    });
  });
}

async function renderCoursesTable() {
  const el = document.getElementById('coursesTable');
  let courses = [];
  try { courses = await getAllCourses(); }
  catch (e) { console.error(e); el.innerHTML = '<div class="alert alert-danger">Could not load courses.</div>'; return; }

  el.innerHTML = `
    <table class="table table-dark table-sm align-middle">
      <thead><tr><th>Title</th><th>Subject</th><th>Teacher</th><th>Published</th></tr></thead>
      <tbody>
        ${courses.map((c) => `<tr>
          <td>${c.title}</td>
          <td>${c.subject?.name || ''}</td>
          <td>${c.teacher?.full_name || ''}</td>
          <td>${c.is_published ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">Draft</span>'}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

// ---------- Teacher section (own courses + enrolments + materials) ----------
function enrollmentRow(en) {
  const name = en.student?.full_name || 'Student';
  const actions = en.status === 'pending'
    ? `<button class="btn btn-success btn-sm me-1 approve-btn" data-id="${en.id}">Approve</button>
       <button class="btn btn-outline-danger btn-sm reject-btn" data-id="${en.id}">Reject</button>`
    : '';
  return `<tr><td>${name}</td><td>${statusBadge[en.status] || en.status}</td><td class="text-end">${actions}</td></tr>`;
}

function materialRow(m) {
  return `<li class="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0">
      <span><i class="bi bi-file-earmark-text text-cyan me-2"></i>${m.title}</span>
      <button class="btn btn-outline-danger btn-sm del-material" data-id="${m.id}" data-path="${m.file_path}"><i class="bi bi-trash"></i></button>
    </li>`;
}

async function renderCourse(course) {
  let enrollments = [], materials = [];
  try { enrollments = await getEnrollmentsForCourse(course.id); } catch (e) { console.error(e); }
  try { materials = await getMaterials(course.id); } catch (e) { console.error(e); }

  const rows = enrollments.length ? enrollments.map(enrollmentRow).join('')
    : `<tr><td colspan="3" class="text-secondary">No enrolments yet.</td></tr>`;
  const matList = materials.length
    ? `<ul class="list-group list-group-flush">${materials.map(materialRow).join('')}</ul>`
    : `<p class="text-secondary small mb-0">No materials uploaded yet.</p>`;

  return `
    <div class="card mb-4" data-course-id="${course.id}">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0"><i class="bi ${course.subject?.icon || 'bi-journal'} text-cyan me-1"></i>${course.title}
            ${course.is_published ? '' : '<span class="badge bg-secondary ms-2">Draft</span>'}</h5>
          <span class="text-secondary small">${course.subject?.name || ''} · ${course.level || ''}</span>
        </div>
        <h6 class="text-secondary">Enrolments</h6>
        <table class="table table-dark table-sm align-middle">
          <thead><tr><th>Student</th><th>Status</th><th class="text-end">Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <h6 class="text-secondary mt-3">Materials</h6>
        ${matList}
        <div class="row g-2 mt-2">
          <div class="col-sm-5"><input type="text" class="form-control form-control-sm mat-title" placeholder="Material title" /></div>
          <div class="col-sm-5"><input type="file" class="form-control form-control-sm mat-file" /></div>
          <div class="col-sm-2"><button class="btn btn-petrion btn-sm w-100 upload-btn">Upload</button></div>
        </div>
      </div>
    </div>`;
}

async function renderMyCourses() {
  let courses = [];
  try { courses = await getMyCourses(); }
  catch (e) { console.error(e); showMessage('Could not load your courses.', 'danger'); return; }

  if (!courses.length) {
    containerEl.innerHTML = '<p class="text-secondary">You have no courses of your own.</p>';
    return;
  }
  const html = await Promise.all(courses.map(renderCourse));
  containerEl.innerHTML = html.join('');
  wireCourseEvents();
}

function wireCourseEvents() {
  containerEl.querySelectorAll('.approve-btn').forEach((b) =>
    b.addEventListener('click', () => handleUpdate(b.dataset.id, 'approved')));
  containerEl.querySelectorAll('.reject-btn').forEach((b) =>
    b.addEventListener('click', () => handleUpdate(b.dataset.id, 'rejected')));
  containerEl.querySelectorAll('.upload-btn').forEach((b) =>
    b.addEventListener('click', () => handleUpload(b)));
  containerEl.querySelectorAll('.del-material').forEach((b) =>
    b.addEventListener('click', () => handleDeleteMaterial(b.dataset.id, b.dataset.path)));
}

async function handleUpdate(id, status) {
  try { await updateEnrollmentStatus(id, status); await renderMyCourses(); }
  catch (err) { console.error(err); showMessage('Could not update enrolment.', 'danger'); }
}

async function handleUpload(btn) {
  const card = btn.closest('[data-course-id]');
  const courseId = card.dataset.courseId;
  const title = card.querySelector('.mat-title').value.trim();
  const file = card.querySelector('.mat-file').files[0];
  if (!title || !file) { showMessage('Please enter a title and choose a file.', 'warning'); return; }
  btn.disabled = true; btn.textContent = '...';
  try { await uploadMaterial(courseId, title, file); await renderMyCourses(); }
  catch (err) { console.error(err); showMessage('Upload failed: ' + err.message, 'danger'); btn.disabled = false; btn.textContent = 'Upload'; }
}

async function handleDeleteMaterial(id, path) {
  try { await deleteMaterial(id, path); await renderMyCourses(); }
  catch (err) { console.error(err); showMessage('Could not delete material.', 'danger'); }
}

// ---------- Entry ----------
async function main() {
  await requireLogin();
  const role = await getMyRole();

  if (role !== 'teacher' && role !== 'admin') {
    showMessage('This area is for teachers and admins only.', 'danger');
    return;
  }
  if (role === 'admin') await renderAdmin();
  await renderMyCourses();
}

renderNavbar();
await main();