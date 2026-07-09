import '../bootstrap-setup.js';
import { renderNavbar } from '../components/navbar.js';
import { getTeachers } from '../services/teacherService.js';

const gridEl = document.getElementById('teachersGrid');
const messageEl = document.getElementById('teachersMessage');

function showMessage(text, type = 'info') {
  messageEl.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
}

function avatarHtml(teacher) {
  if (teacher.avatar_url) {
    return `<img src="${teacher.avatar_url}" alt="${teacher.full_name}"
      class="rounded-circle mb-3" width="110" height="110"
      style="object-fit: cover; border: 3px solid var(--petrion-cyan);" />`;
  }
  // Placeholder: cyan circle with a person icon.
  return `<div class="rounded-circle mb-3 d-inline-flex align-items-center justify-content-center"
      style="width:110px;height:110px;background:var(--petrion-bg-elevated);border:3px solid var(--petrion-cyan);">
      <i class="bi bi-person-fill text-cyan" style="font-size:3rem;"></i>
    </div>`;
}

function teacherCardHtml(teacher) {
  const subjectBadges = teacher.subjects.length
    ? teacher.subjects.map((s) =>
        `<span class="badge bg-elevated text-cyan border border-secondary me-1 mb-1">${s}</span>`
      ).join('')
    : '<span class="text-secondary small">Petrion Academy tutor</span>';

  return `
    <div class="col-md-6 col-lg-5">
      <div class="card h-100 text-center">
        <div class="card-body p-4">
          ${avatarHtml(teacher)}
          <h5 class="fw-bold mb-1">${teacher.full_name}</h5>
          <div class="mb-3">${subjectBadges}</div>
          <p class="text-secondary small mb-0">${teacher.bio || ''}</p>
        </div>
      </div>
    </div>`;
}

async function render() {
  try {
    const teachers = await getTeachers();
    if (!teachers.length) {
      showMessage('No teachers to show yet.', 'secondary');
      return;
    }
    gridEl.innerHTML = teachers.map(teacherCardHtml).join('');
  } catch (err) {
    console.error(err);
    showMessage('Could not load teachers. Please try again later.', 'danger');
  }
}

renderNavbar('teachers');
await render();