import { renderNavbar } from '../components/navbar.js';
import { courseCardHtml } from '../components/courseCard.js';
import { getSubjects, getPublishedCourses } from '../services/courseService.js';

const gridEl = document.getElementById('coursesGrid');
const messageEl = document.getElementById('coursesMessage');
const filterEl = document.getElementById('subjectFilter');

function showMessage(text, type = 'info') {
  messageEl.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
}

async function loadSubjectsIntoFilter() {
  try {
    const subjects = await getSubjects();
    for (const s of subjects) {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      filterEl.appendChild(opt);
    }
  } catch (err) {
    console.error('Failed to load subjects:', err);
  }
}

async function loadCourses(subjectId = null) {
  gridEl.innerHTML = '';
  messageEl.innerHTML = '';
  try {
    const courses = await getPublishedCourses(subjectId);
    if (!courses.length) {
      showMessage('No courses available yet. Please check back soon.', 'secondary');
      return;
    }
    gridEl.innerHTML = courses.map(courseCardHtml).join('');
  } catch (err) {
    console.error('Failed to load courses:', err);
    showMessage('Could not load courses. Please try again later.', 'danger');
  }
}

filterEl.addEventListener('change', () => {
  loadCourses(filterEl.value || null);
});

renderNavbar('courses');
await loadSubjectsIntoFilter();
await loadCourses();
