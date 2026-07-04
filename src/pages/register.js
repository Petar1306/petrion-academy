import { supabase } from '../services/supabaseClient.js';

const registerBtn = document.getElementById('registerBtn');
const messageEl = document.getElementById('message');

function showMessage(text, type = 'danger') {
  messageEl.innerHTML = `<div class="alert alert-${type} py-2 mb-0">${text}</div>`;
}

async function handleRegister() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!fullName || !email || !password) {
    showMessage('Please fill in all fields.');
    return;
  }
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters.');
    return;
  }

  registerBtn.disabled = true;
  registerBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-1"></span> Creating...';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  registerBtn.disabled = false;
  registerBtn.innerHTML = '<i class="bi bi-person-plus me-1"></i> Register';

  if (error) {
    console.error('Registration error:', error);
    showMessage(error.message);
    return;
  }

  showMessage(
    'Account created! Check your email to confirm, then log in.',
    'success'
  );
}

registerBtn.addEventListener('click', handleRegister);
