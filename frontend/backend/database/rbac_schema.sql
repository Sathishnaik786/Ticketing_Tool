-- 1️⃣ USERS TABLE (Identity mapping only)
create table if not exists public.users (
  id uuid primary key, -- same as auth.users.id
  email text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2️⃣ EMPLOYEES TABLE (RBAC LIVES HERE)
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  role text not null check (role in ('ADMIN','HR','MANAGER','EMPLOYEE')),
  department_id uuid,
  manager_id uuid references employees(id),
  status text default 'ACTIVE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3️⃣ UPDATE TIMESTAMP TRIGGER (OPTIONAL BUT RECOMMENDED)
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_employees_updated on employees;
create trigger trg_employees_updated
before update on employees
for each row execute function update_updated_at_column();

-- 4️⃣ INITIAL ADMIN BOOTSTRAP (RUN ONCE)
-- Step A: Create Admin in Supabase Auth (Dashboard)
-- Email: admin@yvi.com
-- Password: Admin@123

-- Step B: Insert into users table
-- insert into users (id, email)
-- select id, email
-- from auth.users
-- where email = 'admin@yvi.com';

-- Step C: Insert into employees table
-- insert into employees (user_id, first_name, last_name, role)
-- select id, 'System', 'Admin', 'ADMIN'
-- from users
-- where email = 'admin@yvi.com';