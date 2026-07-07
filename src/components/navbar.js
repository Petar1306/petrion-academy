import { supabase } from '../services/supabaseClient.js';
import { getMyRole } from '../utils/guards.js';
import logoUrl from '../assets/favicon.svg';

// Renders the shared navbar into the element with id="navbar".
export async function renderNavbar(activePage = '') {
  const navbarEl = document.getElementById('navbar');
  if (!navbarEl) return;

  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  let role = null;
  if (isLoggedIn) {
    try { role = await getMyRole(); } catch (e) { console.error(e); }
  }

  const link = (href, label, key) => `
    <li class="nav-item">
      <a class="nav-link ${activePage === key ? 'active text-cyan' : ''}" href="${href}">${label}</a>
    </li>`;

  const panelBtn = (role === 'teacher' || role === 'admin')
    ? `<a href="admin.html" class="btn btn-outline-petrion btn-sm me-2">
         <i class="bi bi-speedometer2 me-1"></i> ${role === 'admin' ? 'Admin' : 'Panel'}
       </a>`
    : '';

  const authArea = isLoggedIn
    ? `${panelBtn}
       <a href="dashboard.html" class="btn btn-outline-petrion btn-sm me-2">
         <i class="bi bi-mortarboard me-1"></i> My Learning
       </a>
       <button id="logoutBtn" class="btn btn-petrion btn-sm">
         <i class="bi bi-box-arrow-right me-1"></i> Log out
       </button>`
    : `<a href="login.html" class="btn btn-outline-petrion btn-sm me-2">Log in</a>
       <a href="register.html" class="btn btn-petrion btn-sm">Register</a>`;

  navbarEl.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-petrion sticky-top">
      <div class="container">
        <a class="navbar-brand fw-bold d-flex align-items-center" href="index.html">
          <img src="${logoUrl}" alt="Petrion" width="32" height="32" class="me-2" />
          Petrion <span class="text-cyan ms-1">Academy</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${link('index.html', 'Home', 'home')}
            ${link('courses.html', 'Courses', 'courses')}
            ${link('teachers.html', 'Teachers', 'teachers')}
          </ul>
          <div class="d-flex align-items-center flex-wrap">
            ${authArea}
          </div>
        </div>
      </div>
    </nav>`;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    });
  }
}
