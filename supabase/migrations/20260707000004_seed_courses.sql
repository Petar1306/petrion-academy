-- ============================================
-- Petrion Academy - Migration 4: Seed sample courses
-- ============================================

insert into public.courses
  (subject_id, teacher_id, title, description, level, price_per_lesson, schedule_text, is_published)
select
  s.id,
  (select p.id from public.profiles p join auth.users u on u.id = p.id where u.email = c.teacher_email),
  c.title, c.description, c.level, c.price, c.schedule, true
from (values
  ('English',   'nikolina@petrionai.com', 'English for Beginners',
   'Start speaking English with confidence. Grammar, vocabulary and conversation for absolute beginners.',
   'Beginner', 20.00, 'Mon & Wed, 18:00'),
  ('Spanish',   'nikolina@petrionai.com', 'Conversational Spanish',
   'Practical Spanish focused on real conversations, travel and everyday life.',
   'Intermediate', 22.00, 'Tue & Thu, 19:00'),
  ('Chinese',   'nikolina@petrionai.com', 'Mandarin Chinese Basics',
   'Learn Mandarin from scratch: pinyin, tones, characters and simple dialogues.',
   'Beginner', 25.00, 'Sat, 10:00'),
  ('Mathematics', 'nicol@petrionai.com', 'GCSE Maths Mastery',
   'Targeted preparation for GCSE Maths. Build problem-solving skills and exam confidence.',
   'GCSE', 24.00, 'Mon & Fri, 17:00'),
  ('Mathematics', 'nicol@petrionai.com', 'Primary Maths Fun',
   'Friendly maths for young learners: numbers, times tables and early problem solving.',
   'Primary', 18.00, 'Wed, 16:00'),
  ('Music',     'nicol@petrionai.com', 'Music Theory 101',
   'The foundations of music theory: notes, rhythm, scales and reading sheet music.',
   'Beginner', 20.00, 'Thu, 18:00')
) as c(subject_name, teacher_email, title, description, level, price, schedule)
join public.subjects s on s.name = c.subject_name;
