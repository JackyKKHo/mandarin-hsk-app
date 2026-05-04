-- Run this in Supabase Dashboard → SQL Editor

create table if not exists progress (
  user_id uuid references auth.users not null,
  word_id text not null,
  primary key (user_id, word_id)
);

create table if not exists srs_cards (
  user_id uuid references auth.users not null,
  word_id text not null,
  interval integer not null default 0,
  ease_factor real not null default 2.5,
  due_date date not null,
  reps integer not null default 0,
  primary key (user_id, word_id)
);

create table if not exists favourites (
  user_id uuid references auth.users not null,
  word_id text not null,
  primary key (user_id, word_id)
);

create table if not exists dismissed (
  user_id uuid references auth.users not null,
  word_id text not null,
  primary key (user_id, word_id)
);

create table if not exists streaks (
  user_id uuid references auth.users not null primary key,
  count integer not null default 0,
  last_date date
);

-- Row-level security: users can only access their own data
alter table progress enable row level security;
alter table srs_cards enable row level security;
alter table favourites enable row level security;
alter table dismissed enable row level security;
alter table streaks enable row level security;

create policy "own progress" on progress for all using (auth.uid() = user_id);
create policy "own srs_cards" on srs_cards for all using (auth.uid() = user_id);
create policy "own favourites" on favourites for all using (auth.uid() = user_id);
create policy "own dismissed" on dismissed for all using (auth.uid() = user_id);
create policy "own streaks" on streaks for all using (auth.uid() = user_id);
