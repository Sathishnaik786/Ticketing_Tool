create table public.attendance (
  id uuid not null default gen_random_uuid (),
  employee_id uuid null,
  date date not null,
  check_in time without time zone null,
  check_out time without time zone null,
  status text null default 'PRESENT'::text,
  work_hours numeric(4, 2) null,
  notes text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint attendance_pkey primary key (id),
  constraint unique_employee_date unique (employee_id, date),
  constraint attendance_employee_id_fkey foreign KEY (employee_id) references employees (id) on delete CASCADE,
  constraint attendance_status_check check (
    (
      status = any (
        array[
          'PRESENT'::text,
          'ABSENT'::text,
          'HALF_DAY'::text,
          'LATE'::text,
          'ON_LEAVE'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_attendance_employee_date on public.attendance using btree (employee_id, date) TABLESPACE pg_default;

create trigger trg_attendance_updated BEFORE
update on attendance for EACH row
execute FUNCTION update_updated_at_column ();



create table public.departments (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  manager_id uuid null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint departments_pkey primary key (id),
  constraint fk_manager foreign KEY (manager_id) references employees (id) on delete set null
) TABLESPACE pg_default;

create trigger trg_departments_updated BEFORE
update on departments for EACH row
execute FUNCTION update_updated_at_column ();



create table public.documents (
  id uuid not null default gen_random_uuid (),
  employee_id uuid null,
  name text not null,
  type text null default 'OTHER'::text,
  file_url text not null,
  file_size integer null,
  mime_type text null,
  uploaded_by uuid null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint documents_pkey primary key (id),
  constraint documents_employee_id_fkey foreign KEY (employee_id) references employees (id) on delete CASCADE,
  constraint documents_uploaded_by_fkey foreign KEY (uploaded_by) references employees (id) on delete set null,
  constraint documents_type_check check (
    (
      type = any (
        array[
          'ID_PROOF'::text,
          'ADDRESS_PROOF'::text,
          'EDUCATION'::text,
          'EXPERIENCE'::text,
          'CONTRACT'::text,
          'OTHER'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


create table public.employees (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  first_name text not null,
  last_name text not null,
  phone text null,
  avatar text null,
  department_id uuid null,
  position text null,
  salary numeric(15, 2) null,
  date_of_birth date null,
  date_of_joining date null,
  address text null,
  city text null,
  state text null,
  country text null,
  zip_code text null,
  emergency_contact text null,
  emergency_phone text null,
  status text null default 'ACTIVE'::text,
  manager_id uuid null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  role text null default 'EMPLOYEE'::text,
  constraint employees_pkey primary key (id),
  constraint employees_department_id_fkey foreign KEY (department_id) references departments (id) on delete set null,
  constraint employees_manager_id_fkey foreign KEY (manager_id) references employees (id) on delete set null,
  constraint employees_user_id_fkey foreign KEY (user_id) references users (id) on delete set null,
  constraint employees_role_check check (
    (
      role = any (
        array[
          'ADMIN'::text,
          'HR'::text,
          'MANAGER'::text,
          'EMPLOYEE'::text
        ]
      )
    )
  ),
  constraint employees_status_check check (
    (
      status = any (
        array[
          'ACTIVE'::text,
          'INACTIVE'::text,
          'ON_LEAVE'::text,
          'TERMINATED'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_employees_user_id on public.employees using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_employees_department_id on public.employees using btree (department_id) TABLESPACE pg_default;

create trigger trg_employees_updated BEFORE
update on employees for EACH row
execute FUNCTION update_updated_at_column ();



create table public.leave_types (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  days_allowed integer not null,
  carry_forward boolean null default false,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint leave_types_pkey primary key (id)
) TABLESPACE pg_default;



create table public.leaves (
  id uuid not null default gen_random_uuid (),
  employee_id uuid null,
  leave_type_id uuid null,
  start_date date not null,
  end_date date not null,
  total_days integer not null,
  reason text null,
  status text null default 'PENDING'::text,
  approved_by uuid null,
  comments text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint leaves_pkey primary key (id),
  constraint leaves_approved_by_fkey foreign KEY (approved_by) references employees (id) on delete set null,
  constraint leaves_employee_id_fkey foreign KEY (employee_id) references employees (id) on delete CASCADE,
  constraint leaves_leave_type_id_fkey foreign KEY (leave_type_id) references leave_types (id) on delete CASCADE,
  constraint check_leave_dates check ((start_date <= end_date)),
  constraint leaves_status_check check (
    (
      status = any (
        array[
          'PENDING'::text,
          'APPROVED'::text,
          'REJECTED'::text,
          'CANCELLED'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_leaves_employee_id on public.leaves using btree (employee_id) TABLESPACE pg_default;

create index IF not exists idx_leaves_status on public.leaves using btree (status) TABLESPACE pg_default;

create trigger trg_leaves_updated BEFORE
update on leaves for EACH row
execute FUNCTION update_updated_at_column ();


create table public.users (
  id uuid not null,
  email text not null,
  role text null default 'EMPLOYEE'::text,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_role_check check (
    (
      role = any (
        array[
          'ADMIN'::text,
          'HR'::text,
          'MANAGER'::text,
          'EMPLOYEE'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create trigger trg_users_updated BEFORE
update on users for EACH row
execute FUNCTION update_updated_at_column ();



create table public.work_comments (
  id uuid not null default gen_random_uuid (),
  work_item_id uuid null,
  comment text not null,
  created_by uuid null,
  created_at timestamp with time zone null default now(),
  constraint work_comments_pkey primary key (id),
  constraint work_comments_created_by_fkey foreign KEY (created_by) references employees (id),
  constraint work_comments_work_item_id_fkey foreign KEY (work_item_id) references work_items (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.work_items (
  id uuid not null default gen_random_uuid (),
  title text not null,
  description text null,
  type text not null,
  status text null default 'OPEN'::text,
  priority text null default 'MEDIUM'::text,
  created_by uuid null,
  assigned_to uuid null,
  department_id uuid null,
  start_date date null,
  due_date date null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint work_items_pkey primary key (id),
  constraint work_items_created_by_fkey foreign KEY (created_by) references employees (id),
  constraint work_items_department_id_fkey foreign KEY (department_id) references departments (id),
  constraint work_items_assigned_to_fkey foreign KEY (assigned_to) references employees (id),
  constraint work_items_priority_check check (
    (
      priority = any (
        array[
          'LOW'::text,
          'MEDIUM'::text,
          'HIGH'::text,
          'CRITICAL'::text
        ]
      )
    )
  ),
  constraint work_items_status_check check (
    (
      status = any (
        array[
          'OPEN'::text,
          'IN_PROGRESS'::text,
          'COMPLETED'::text,
          'BLOCKED'::text,
          'CANCELLED'::text
        ]
      )
    )
  ),
  constraint work_items_type_check check (
    (
      type = any (
        array[
          'PROJECT'::text,
          'TASK'::text,
          'TODO'::text,
          'MEETING'::text,
          'ASSIGNMENT'::text,
          'UPDATE'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;