-- FairFare / PWA Apps Supabase Bootstrap
-- Project: https://rnlknmceslfzlkizscpr.supabase.co
-- Run this whole script once in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- =====================================================
-- 1) Tables
-- =====================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'rider',
  full_name text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('rider', 'driver', 'admin'))
);

create table if not exists public.driver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  vehicle_type text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  vehicle_color text,
  vehicle_plate text,
  license_number text,
  is_available boolean not null default false,
  is_active boolean not null default false,
  last_location_lat double precision,
  last_location_lng double precision,
  last_location_updated_at timestamptz,
  rating_avg numeric(3,2) not null default 0,
  total_trips integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references public.profiles(id) on delete cascade,
  driver_id uuid references public.driver_profiles(id) on delete set null,
  pickup_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  dropoff_address text not null,
  dropoff_lat double precision,
  dropoff_lng double precision,
  fare_estimate numeric(10,2),
  fare_final numeric(10,2),
  payment_intent_id text,
  payment_status text not null default 'unpaid',
  distance_miles numeric(10,2),
  duration_minutes integer,
  vehicle_type text,
  status text not null default 'matching',
  requested_at timestamptz not null default now(),
  scheduled_at timestamptz,
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  canceled_at timestamptz,
  canceled_by text,
  driver_current_lat double precision,
  driver_current_lng double precision,
  last_location_update timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.driver_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  vehicle_color text,
  license_plate text,
  drivers_license text,
  insurance_policy text,
  status text not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint driver_applications_status_check check (status in ('pending', 'approved', 'rejected'))
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references public.rides(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  recipient_type text,
  message_text text not null,
  read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  rider_id uuid references public.profiles(id) on delete set null,
  -- Keep flexible because current app writes either profile-id or driver-profile-id in some flows.
  driver_id uuid,
  rider_rating integer,
  rider_comment text,
  driver_rating integer,
  driver_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rider_rating_range check (rider_rating is null or rider_rating between 1 and 5),
  constraint driver_rating_range check (driver_rating is null or driver_rating between 1 and 5)
);

-- =====================================================
-- 2) Indexes
-- =====================================================

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_driver_profiles_user_id on public.driver_profiles(user_id);
create index if not exists idx_driver_profiles_availability on public.driver_profiles(is_available, is_active);

create index if not exists idx_rides_rider_id on public.rides(rider_id);
create index if not exists idx_rides_driver_id on public.rides(driver_id);
create index if not exists idx_rides_status on public.rides(status);
create index if not exists idx_rides_requested_at on public.rides(requested_at desc);

create index if not exists idx_messages_ride_id on public.messages(ride_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_recipient_id on public.messages(recipient_id);
create index if not exists idx_messages_created_at on public.messages(created_at desc);

create index if not exists idx_ratings_ride_id on public.ratings(ride_id);
create index if not exists idx_ratings_driver_id on public.ratings(driver_id);

create unique index if not exists uq_driver_applications_user on public.driver_applications(user_id);

-- =====================================================
-- 3) updated_at helper trigger
-- =====================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_driver_profiles_updated_at on public.driver_profiles;
create trigger trg_driver_profiles_updated_at
before update on public.driver_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_rides_updated_at on public.rides;
create trigger trg_rides_updated_at
before update on public.rides
for each row execute function public.set_updated_at();

drop trigger if exists trg_driver_applications_updated_at on public.driver_applications;
create trigger trg_driver_applications_updated_at
before update on public.driver_applications
for each row execute function public.set_updated_at();

drop trigger if exists trg_ratings_updated_at on public.ratings;
create trigger trg_ratings_updated_at
before update on public.ratings
for each row execute function public.set_updated_at();

-- =====================================================
-- 4) RLS + policies
-- =====================================================

alter table public.profiles enable row level security;
alter table public.driver_profiles enable row level security;
alter table public.rides enable row level security;
alter table public.driver_applications enable row level security;
alter table public.messages enable row level security;
alter table public.ratings enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

-- Drop policies if re-running

drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;

drop policy if exists driver_profiles_select on public.driver_profiles;
drop policy if exists driver_profiles_insert on public.driver_profiles;
drop policy if exists driver_profiles_update on public.driver_profiles;

drop policy if exists rides_select on public.rides;
drop policy if exists rides_insert on public.rides;
drop policy if exists rides_update on public.rides;

drop policy if exists driver_apps_select on public.driver_applications;
drop policy if exists driver_apps_insert on public.driver_applications;
drop policy if exists driver_apps_update on public.driver_applications;

drop policy if exists messages_select on public.messages;
drop policy if exists messages_insert on public.messages;
drop policy if exists messages_update on public.messages;

drop policy if exists ratings_select on public.ratings;
drop policy if exists ratings_insert on public.ratings;
drop policy if exists ratings_update on public.ratings;

-- PROFILES
create policy profiles_select on public.profiles
for select
using (auth.uid() = id or public.is_admin(auth.uid()));

create policy profiles_insert on public.profiles
for insert
with check (auth.uid() = id or public.is_admin(auth.uid()));

create policy profiles_update on public.profiles
for update
using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

-- DRIVER PROFILES
create policy driver_profiles_select on public.driver_profiles
for select
using (true); -- rider, driver, admin all need to read driver details

create policy driver_profiles_insert on public.driver_profiles
for insert
with check (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
);

create policy driver_profiles_update on public.driver_profiles
for update
using (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
)
with check (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
);

-- RIDES
create policy rides_select on public.rides
for select
using (
  rider_id = auth.uid()
  or public.is_admin(auth.uid())
  or exists (
    select 1
    from public.driver_profiles dp
    where dp.id = rides.driver_id and dp.user_id = auth.uid()
  )
  or (rides.driver_id is null and rides.status in ('matching', 'requested'))
);

create policy rides_insert on public.rides
for insert
with check (
  rider_id = auth.uid() or public.is_admin(auth.uid())
);

create policy rides_update on public.rides
for update
using (
  rider_id = auth.uid()
  or public.is_admin(auth.uid())
  or exists (
    select 1
    from public.driver_profiles dp
    where dp.user_id = auth.uid()
  )
)
with check (
  rider_id = auth.uid()
  or public.is_admin(auth.uid())
  or exists (
    select 1
    from public.driver_profiles dp
    where dp.user_id = auth.uid() and (rides.driver_id is null or rides.driver_id = dp.id)
  )
);

-- DRIVER APPLICATIONS
create policy driver_apps_select on public.driver_applications
for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy driver_apps_insert on public.driver_applications
for insert
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy driver_apps_update on public.driver_applications
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- MESSAGES
create policy messages_select on public.messages
for select
using (
  sender_id = auth.uid()
  or recipient_id = auth.uid()
  or public.is_admin(auth.uid())
  or (
    ride_id is not null and exists (
      select 1 from public.rides r
      left join public.driver_profiles dp on dp.id = r.driver_id
      where r.id = messages.ride_id
        and (r.rider_id = auth.uid() or dp.user_id = auth.uid())
    )
  )
);

create policy messages_insert on public.messages
for insert
with check (sender_id = auth.uid());

create policy messages_update on public.messages
for update
using (
  recipient_id = auth.uid()
  or sender_id = auth.uid()
  or public.is_admin(auth.uid())
)
with check (
  recipient_id = auth.uid()
  or sender_id = auth.uid()
  or public.is_admin(auth.uid())
);

-- RATINGS
create policy ratings_select on public.ratings
for select
using (true);

create policy ratings_insert on public.ratings
for insert
with check (
  rider_id = auth.uid()
  or exists (
    select 1 from public.driver_profiles dp where dp.user_id = auth.uid()
  )
  or public.is_admin(auth.uid())
);

create policy ratings_update on public.ratings
for update
using (
  rider_id = auth.uid()
  or public.is_admin(auth.uid())
  or exists (
    select 1 from public.driver_profiles dp where dp.user_id = auth.uid()
  )
)
with check (
  rider_id = auth.uid()
  or public.is_admin(auth.uid())
  or exists (
    select 1 from public.driver_profiles dp where dp.user_id = auth.uid()
  )
);

-- =====================================================
-- 5) Realtime for rides/messages
-- =====================================================

do $$
begin
  begin
    alter publication supabase_realtime add table public.rides;
  exception when duplicate_object then
    null;
  end;

  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then
    null;
  end;
end;
$$;

-- =====================================================
-- 6) Helpful checks
-- =====================================================

-- select table_name from information_schema.tables where table_schema = 'public' order by table_name;
-- select * from public.profiles limit 5;

