import { renderNavbar } from '../components/navbar.js';
import { getCourseById } from '../services/courseService.js';
import { getMyEnrollment, enrollInCourse } from '../services/enrollmentService.js';
import { getMaterials, getDownloadUrl } from '../services/storageService.js';
import { supabase } from '../services/supabaseClient.js';

const contentEl = document.getElementById('courseContent');
const params = new URLSearchParams(window.location.search);
const courseId = params.get('id');

const statusBadge = {
  pending: '<span class="badge bg-warning text-dark">Pending approval</span>',
  approved: '<span class="badge bg-success">Enrolled</span>',
  rejected: '<span class="badge bg-danger">Rejected</span>',
  completed: '<span class="badge bg-info text-dark">Completed</span>',
};

async function render() {
  if (!courseId) {
    contentEl.innerHTML = '<div class="alert alert-danger">No course specified.</div>';
    return;
  }

  let course;
  try { course = await getCourseById(courseId); }
  catch (err) { console.error(err); contentEl.innerHTML = '<div class="alert alert-danger">Course not found.</div>'; return; }

  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  let enrollment = null;
  if (isLoggedIn) {
    try { enrollment = await getMyEnrollment(courseId); } catch (e) { console.error(e); }
  }

  const price = Number(course.price_per_lesson).toFixed(2);
  const subjectName = course.subject?.name || 'General';
  const subjectIcon = course.subject?.icon || 'bi-journal-bookmark';
  const teacherName = course.teacher?.full_name || 'Petrion Academy';

  let actionArea;
  if (!isLoggedIn) {
    actionArea = `<a href="login.html" class="btn btn-petrion">Log in to enroll</a>`;
  } else if (enrollment) {
    actionArea = `<div>Your status: ${statusBadge[enrollment.status] || enrollment.status}</div>`;
  } else {
    actionArea = `<button id="enrollBtn" class="btn btn-petrion"><i class="bi bi-mortarboard me-1"></i> Enroll in this course</button>`;
  }

  contentEl.innerHTML = `
    <a href="courses.html" class="text-decoration-none small"><i class="bi bi-arrow-left"></i> Back to courses</a>
    <div class="d-flex align-items-center mt-3 mb-2">
      <i class="bi ${subjectIcon} text-cyan fs-3 me-2"></i>
      <span class="badge bg-elevated text-cyan border border-secondary">${subjectName}</span>
      ${course.level ? `<span class="ms-2 text-tan small">${course.level}</span>` : ''}
    </div>
    <h1 class="fw-bold">${course.title}</h1>
    <p class="text-secondary">${course.description || ''}</p>
    <div class="card my-4"><div class="card-body"><div class="row g-3">
      <div class="col-sm-4"><small class="text-secondary d-block">Teacher</small><i class="bi bi-person me-1 text-cyan"></i>${teacherName}</div>
      <div class="col-sm-4"><small class="text-secondary d-block">Schedule</small><i class="bi bi-calendar-event me-1 text-cyan"></i>${course.schedule_text || 'Flexible'}</div>
      <div class="col-sm-4"><small class="text-secondary d-block">Price</small><span class="fw-bold text-cyan">£${price}</span> / lesson</div>
    </div></div></div>
    <div id="enrollMessage"></div>
    <div id="actionArea">${actionArea}</div>
    <div id="materialsArea" class="mt-4"></div>
  `;

  const enrollBtn = document.getElementById('enrollBtn');
  if (enrollBtn) {
    enrollBtn.addEventListener('click', async () => {
      enrollBtn.disabled = true;
      enrollBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Enrolling...';
      try {
        await enrollInCourse(courseId);
        document.getElementById('actionArea').innerHTML = `<div>Your status: ${statusBadge.pending}</div>`;
        document.getElementById('enrollMessage').innerHTML = '<div class="alert alert-success py-2">Enrollment request sent! Your teacher will review it.</div>';
      } catch (err) {
        console.error(err);
        document.getElementById('enrollMessage').innerHTML = `<div class="alert alert-danger py-2">${err.message}</div>`;
        enrollBtn.disabled = false;
        enrollBtn.innerHTML = '<i class="bi bi-mortarboard me-1"></i> Enroll in this course';
      }
    });
  }

  // Materials are only visible to approved students, the teacher, or admin (RLS enforced).
  await renderMaterials();
}

async function renderMaterials() {
  const area = document.getElementById('materialsArea');
  let materials = [];
  try { materials = await getMaterials(courseId); } catch (e) { console.error(e); }

  if (!materials.length) return; // nothing to show / not permitted

  area.innerHTML = `
    <h5 class="mb-3"><i class="bi bi-folder2-open text-cyan me-2"></i>Course materials</h5>
    <ul class="list-group list-group-flush" id="matList"></ul>`;

  const list = document.getElementById('matList');
  for (const m of materials) {
    const li = document.createElement('li');
    li.className = 'list-group-item bg-transparent d-flex justify-content-between align-items-center px-0';
    li.innerHTML = `<span><i class="bi bi-file-earmark-text text-cyan me-2"></i>${m.title}</span>
      <button class="btn btn-outline-petrion btn-sm">Download</button>`;
    li.querySelector('button').addEventListener('click', async (e) => {
      e.target.disabled = true;
      try {
        const url = await getDownloadUrl(m.file_path);
        window.open(url, '_blank');
      } catch (err) { console.error(err); }
      e.target.disabled = false;
    });
    list.appendChild(li);
  }
}

renderNavbar('courses');
await render();
