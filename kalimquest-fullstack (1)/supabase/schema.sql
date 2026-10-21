-- KalimQuest database schema
-- Progress is private to each authenticated student.
create table if not exists public.student_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  absen text not null,
  display_name text not null default '',
  completed_locations text[] not null default '{}',
  stars integer not null default 0 check (stars >= 0),
  quiz_correct integer not null default 0 check (quiz_correct >= 0),
  quiz_attempts integer not null default 0 check (quiz_attempts >= quiz_correct),
  updated_at timestamptz not null default now()
);

create unique index if not exists student_progress_absen_unique
on public.student_progress(absen);

alter table public.student_progress enable row level security;

drop policy if exists "Murid membaca progres sendiri" on public.student_progress;
create policy "Murid membaca progres sendiri"
on public.student_progress for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Murid membuat progres sendiri" on public.student_progress;
create policy "Murid membuat progres sendiri"
on public.student_progress for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Murid memperbarui progres sendiri" on public.student_progress;
create policy "Murid memperbarui progres sendiri"
on public.student_progress for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Authenticated students cannot list other students. Teacher list operations go through a
-- server-side Netlify Function using service_role after teacher email verification.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists student_progress_updated_at on public.student_progress;
create trigger student_progress_updated_at
before update on public.student_progress
for each row execute procedure public.touch_updated_at();

-- NOTE: The service_role key bypasses RLS and must remain in Netlify server environment only.
