-- ============================================
-- Petrion Academy - Migration 3: Seed subjects
-- ============================================

insert into public.subjects (name, icon, description) values
  ('English',   'bi-translate',          'English language for all levels, from beginners to advanced.'),
  ('Spanish',   'bi-translate',          'Learn Spanish with a native-level teacher.'),
  ('Russian',   'bi-translate',          'Russian language lessons for children and adults.'),
  ('Chinese',   'bi-translate',          'Mandarin Chinese, characters, and conversation.'),
  ('Mathematics','bi-calculator',        'Maths from primary school to GCSE and A-Level.'),
  ('Music',     'bi-music-note-beamed',  'Music theory and practice for young and grown-up learners.'),
  ('Bulgarian & Literature', 'bi-book',  'Bulgarian language and literature, ideal for the community.')
on conflict (name) do nothing;
