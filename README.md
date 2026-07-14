# Petrion Academy

An online tutoring platform for a family-run academy teaching languages, mathematics and music. Students browse courses, enrol, and download learning materials; teachers manage their own courses, approve enrolments and upload materials; an admin manages users, roles and the whole catalog.

Built as a capstone project for the SoftUni course **"Software Technologies with AI"**, using AI-assisted development with GitHub Copilot.

Part of the **Petrion AI** brand.

---

## Live demo

- **Live URL:** https://petrionacademy.co.uk
- **GitHub repo:** https://github.com/Petar1306/petrion-academy

### Demo credentials (password: `demo123`)

| Role    | Email                       |
|---------|-----------------------------|
| Admin   | demo.admin@petrionai.com    |
| Teacher | demo.teacher@petrionai.com  |
| Student | demo.student@petrionai.com  |

---

## What it does

**Guests** can browse the home page, the course catalog (with a subject filter) and the teachers page.

**Students** (default role after registration) can enrol in courses, see their enrolments and their status in *My Learning*, and download materials for courses they are approved for.

**Teachers** manage their own courses from the panel: they see who has requested to enrol, approve or reject requests, and upload learning materials (PDFs) that only approved students can download.

**Admins** get everything teachers have, plus an admin area to view all users, change any user's role, and see an overview of every course in the system.

---

## Architecture

A client–server application: a vanilla JavaScript multi-page frontend talks to a Supabase backend over its REST API.

### Technologies

- **Frontend:** HTML5, CSS3, vanilla JavaScript (ES modules), Bootstrap 5, Bootstrap Icons
- **Backend:** Supabase — PostgreSQL database, Authentication (JWT), Storage
- **Build tools:** Node.js, npm, Vite (multi-page mode)
- **Deployment:** Netlify

### Design

- Multi-page navigation: each screen is a separate `.html` file at the project root.
- Modular structure: pages, services, components and utilities live in separate folders.
- All Supabase access is isolated in the `src/services/` layer; pages never call Supabase directly.
- Security is enforced server-side with Row-Level Security (RLS) policies. Frontend role checks are for UX only.

---

## Database schema

Seven tables in the `public` schema, plus Supabase's built-in `auth.users`.

```
auth.users (Supabase Auth)
     |
     |-- profiles (1:1)  ------- user_roles (1:many)
     |
subjects --< courses >-- profiles (teacher)
                |
                |--< enrollments >-- profiles (student)
                |--< materials
                |--< reviews (reserved for future use)
```

| Table         | Purpose                                                        |
|---------------|---------------------------------------------------------------|
| `profiles`    | Extends `auth.users` with name, avatar, bio, phone            |
| `user_roles`  | RBAC roles (`student` / `teacher` / `admin`), one per user    |
| `subjects`    | Teaching subjects (English, Spanish, Maths, Music, …)         |
| `courses`     | Courses, each linked to a subject and a teacher               |
| `enrollments` | Student enrolments with status (pending/approved/rejected/completed) |
| `materials`   | Learning materials linked to a course and stored in Storage   |
| `reviews`     | Course reviews (schema in place, reserved for future use)     |

### Key security details

- A trigger (`handle_new_user`) automatically creates a `profiles` row and a default `student` role whenever a user signs up.
- A `has_role(user_id, role)` helper function is used inside RLS policies to check roles without recursion.
- RLS examples:
  - Students can read only their own enrolments; teachers see enrolments for their own courses.
  - Materials are readable only by the course teacher, admins, or students with an **approved** enrolment.
  - Storage (`course-files` bucket) mirrors these rules, so files download only via signed URLs for authorised users.

All schema changes are committed as SQL migration files in `supabase/migrations/`.

---

## Project structure

```
petrion-academy/
├── .github/
│   └── copilot-instructions.md   # AI agent context & rules
├── supabase/
│   └── migrations/               # SQL migration history
├── src/
│   ├── pages/                    # One entry JS module per HTML page
│   ├── services/                 # All Supabase calls (auth, courses, storage, admin…)
│   ├── components/               # Shared UI (navbar, course card)
│   ├── utils/                    # Route guards, helpers
│   ├── styles/                   # Petrion theme (main.css)
│   └── assets/                   # Logo and images
├── index.html, courses.html, course.html, teachers.html,
│   dashboard.html, admin.html, login.html, register.html
├── vite.config.js                # Multi-page build config
├── package.json
└── README.md
```

---

## Local development setup

**Prerequisites:** Node.js (18+) and npm.

1. Clone the repository:
   ```bash
   git clone https://github.com/Petar1306/petrion-academy.git
   cd petrion-academy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Apply the migrations in `supabase/migrations/` to your Supabase project (via the SQL Editor or the Supabase CLI), and create two Storage buckets:
   - `course-files` (private) — for learning materials
   - `avatars` (public) — for teacher photos

5. Start the dev server:
   ```bash
   npm run dev
   ```
   The app runs at `http://localhost:5173/`.

6. Build for production:
   ```bash
   npm run build
   ```

---

## App screens

1. Home (`index.html`)
2. Register (`register.html`)
3. Login (`login.html`)
4. Courses catalog (`courses.html`)
5. Course details (`course.html`)
6. Teachers (`teachers.html`)
7. My Learning — student dashboard (`dashboard.html`)
8. Teacher / Admin panel (`admin.html`)

---

© 2026 Petrion Academy · Part of Petrion AI
