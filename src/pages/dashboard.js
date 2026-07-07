import { renderNavbar } from '../components/navbar.js';
import { getMyEnrollments } from '../services/enrollmentService.js';
import { supabase } from '../services/supabaseClient.js';

const listEl = document.getElementById('enrollmentsList');
const messageEl = document.getElementById('dashMessage');

const statusBadge = {
  pending: '<span class="badge bg-warning text-dark">Pending approval</span>',
  approved: '<span class="badge bg-success">Enrolled</span>',
  rejected: '<span class="badge bg-danger">Rejected</span>',
  completed: '<span class="badge bg-info text-dark">Completed</span>',
};

function showMessage(text, type = 'info') {
  messageEl.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
}

async function guard() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function enrollmentCardHtml(en) {
  const course = en.course || {};
  const subjectIcon = course.subject?.icon || 'bi-journal-bookmark';
  const subjectName = course.subject?.name || 'General';
  const teacherName = course.teacher?.full_name || 'Petrion Academy';

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-elevated text-cyan border border-secondary">
              <i class="bi ${subjectIcon} me-1"></i>${subjectName}
            </span>
            ${statusBadge[en.status] || en.status}
          </div>
          <h5 class="card-title">${course.title || 'Course'}</h5>
          <div class="small text-secondary mb-3 flex-grow-1">
            <i class="bi bi-person me-1"></i> ${teacherName}<br>
            <i class="bi bi-calendar-event me-1"></i> ${course.schedule_text || 'Flexible'}
          </div>
          <a href="course.html?id=${course.id}" class="btn btn-outline-petrion btn-sm">
            View course <i class="bi bi-arrow-right ms-1"></i>
          </a>
        </div>
      </div>
    </div>`;
}

async function render() {
  if (!(await guard())) return;
  try {
    const enrollments = await getMyEnrollments();
    if (!enrollments.length) {
      showMessage('You have not enrolled in any courses yet. <a href="courses.html">Browse courses</a>.', 'secondary');
      return;
    }
    listEl.innerHTML = enrollments.map(enrollmentCardHtml).join('');
  } catch (err) {
    console.error(err);
    showMessage('Could not load your courses. Please try again later.', 'danger');
  }
}

renderNavbar();
await render();
