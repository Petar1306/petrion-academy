import '../bootstrap-setup.js';
import { supabase } from '../services/supabaseClient.js';

const loginBtn = document.getElementById('loginBtn');
const messageEl = document.getElementById('message');

function showMessage(text, type = 'danger') {
  messageEl.innerHTML = `<div class="alert alert-${type} py-2 mb-0">${text}</div>`;
}

async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('Please enter your email and password.');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-1"></span> Logging in...';

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login error:', error);
    showMessage(error.message);
    loginBtn.disabled = false;
    loginBtn.innerHTML =
      '<i class="bi bi-box-arrow-in-right me-1"></i> Log in';
    return;
  }

  // Success — redirect to the home page (index.html, created later).
  window.location.href = 'index.html';
}

loginBtn.addEventListener('click', handleLogin);