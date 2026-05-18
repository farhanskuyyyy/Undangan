create table guests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  qr_code text unique not null,
  rsvp_status boolean default false,
  souvenir_taken boolean default false,
  message text,
  attendance_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table guests enable row level security;

-- Public read for specific guest (via qr_code)
create policy "Public read by QR" on guests for select using (true);

-- Public update for RSVP
create policy "Public update RSVP" on guests for update using (true);
