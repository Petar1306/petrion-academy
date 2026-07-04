# Petrion Academy — AI Agent Instructions

## Project Overview
Petrion Academy is a multi-page JavaScript web app for a family-run online
tutoring academy (languages, mathematics, music). Students browse courses,
enroll, and download learning materials. Teachers manage their own courses
and approve enrollments. Admins manage everything.

This is a capstone project for SoftUni "Software Technologies with AI".

## Tech Stack (STRICT — do not deviate)
- Frontend: HTML5, CSS3, vanilla JavaScript (ES modules), Bootstrap 5, Bootstrap Icons
- NO TypeScript, NO React/Vue/Angular, NO jQuery
- Backend: Supabase (Postgres DB, Auth, Storage) via @supabase/supabase-js
- Build: Vite (multi-page mode), Node.js, npm
- Deployment: Netlify

## Architecture Rules
- MULTI-PAGE app: each screen is a separate .html file at project root
  (index, courses, course, teachers, dashboard, admin, login, register).
- Each page has ONE entry JS module in src/pages/ (e.g. src/pages/courses.js).
- All Supabase calls live in src/services/ (authService.js, courseService.js,
  enrollmentService.js, storageService.js). Pages NEVER call supabase directly.
- Shared UI (navbar, footer, course cards, toasts) lives in src/components/
  as functions that return/inject DOM.
- Route guards in src/utils/guards.js: redirect unauthenticated users from
  protected pages; check roles before rendering admin/teacher UI.
- Keep functions small and files focused. No monolith files.

## Supabase Rules
- Supabase client is created ONCE in src/services/supabaseClient.js using
  import.meta.env.VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
- Never hardcode keys. Never use the service_role key in frontend code.
- All schema changes go through SQL migration files in supabase/migrations/.
- Security is enforced by RLS policies server-side. Frontend role checks are
  for UX only, never for security.
- Roles live in the user_roles table (student | teacher | admin).
  Never store roles in the profiles table.

## Database Tables
profiles, user_roles, subjects, courses, enrollments, materials, reviews.
See supabase/migrations/ for the authoritative schema.

## UI / Branding
- Dark theme with electric cyan accents: primary #1699CD, background #1A1F22,
  secondary grey #454F54, warm tan accent #C4A882.
- Bootstrap 5 components, responsive mobile-first, Bootstrap Icons.
- Status badges: pending = warning, approved = success, rejected = danger.
- Use toast notifications for user feedback after actions.

## Code Style
- Modern ES6+: async/await, const/let, template literals, destructuring.
- Handle every Supabase error: show a toast, log to console.
- English for all UI text, code, comments, and commit messages.

## Git Workflow
- Small, frequent commits after each working step.
- Commit message format: short imperative summary, e.g. "Add course catalog
  page with subject filters".
