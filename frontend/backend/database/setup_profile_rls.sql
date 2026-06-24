-- Setup RLS policies for employee profile access
-- Run these commands in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql)

-- First, enable RLS on the employees table if not already enabled
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can read own profile" ON employees
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON employees
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure authenticated users can access the employees table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON employees TO authenticated;
GRANT ALL ON employees TO authenticated;

-- If you have any sequences for the employees table, grant usage
-- ALTER DEFAULT PRIVILEGES FOR ROLE service_role GRANT USAGE ON SEQUENCES TO authenticated;