import { renderNavbar } from '../components/navbar.js';
import { requireLogin, getMyRole } from '../utils/guards.js';
import {
  getMyCourses, getEnrollmentsForCourse, updateEnrollmentStatus,
} from '../services/courseService.js';

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

function enrollmentRow(en) {
  const name = en.student?.full_name || 'Student';
  const actions = en.status === 'pending'
    ? `<button class="btn btn-success btn-sm me-1 approve-btn" data-id="${en.id}">Approve</button>
       <button class="btn btn-outline-danger btn-sm reject-btn" data-id="${en.id}">Reject</button>`
    : '';
  return `
    <tr>
      <td>${name}</td>
      <td>${statusBadge[en.status] || en.status}</td>
      <td class="text-end">${actions}</td>
    </tr>`;
}

async function renderCourse(course) {
  let enrollments = [];
  try {
    enrollments = await getEnrollmentsForCourse(course.id);
  } catch (e) { console.error(e); }

  const rows = enrollments.length
    ? enrollments.map(enrollmentRow).join('')
    : `<tr><td colspan="3" class="text-secondary">No enrolments yet.</td></tr>`;

  return `
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">
            <i class="bi ${course.subject?.icon || 'bi-journal'} text-cyan me-1"></i>
            ${course.title}
            ${course.is_published ? '' : '<span class="badge bg-secondary ms-2">Draft</span>'}
          </h5>
          <span class="text-secondary small">${course.subject?.name || ''} · ${course.level || ''}</span>
        </div>
        <table class="table table-dark table-sm align-middle mb-0">
          <thead><tr><th>Student</th><th>Status</th><th class="text-end">Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

async function render() {
  await requireLogin();
  const role = await getMyRole();
  if (role !== 'teacher' && role !== 'admin') {
    showMessage('This area is for teachers only.', 'danger');
    return;
  }

  let courses = [];
  try {
    courses = await getMyCourses();
  } catch (e) {
    console.error(e);
    showMessage('Could not load your courses.', 'danger');
    return;
  }

  if (!courses.length) {
    showMessage('You have no courses yet.', 'secondary');
    return;
  }

  const html = await Promise.all(courses.map(renderCourse));
  containerEl.innerHTML = html.join('');

  containerEl.querySelectorAll('.approve-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleUpdate(btn.dataset.id, 'approved'));
  });
  containerEl.querySelectorAll('.reject-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleUpdate(btn.dataset.id, 'rejected'));
  });
}

async function handleUpdate(enrollmentId, status) {
  try {
    await updateEnrollmentStatus(enrollmentId, status);
    await render();
  } catch (err) {
    console.error(err);
    showMessage('Could not update enrolment.', 'danger');
  }
}

renderNavbar();
await render();
