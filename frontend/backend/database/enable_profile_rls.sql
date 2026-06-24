-- Enable Row Level Security for employees table with proper policies
-- This allows users to only access their own profile data

-- Enable RLS on the employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can read own profile" ON employees
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON employees
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to insert their own profile (if needed)
-- This is typically not needed since profiles are created by admin
-- but included for completeness
CREATE POLICY "Users can insert own profile" ON employees
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own profile (if needed)
-- This is typically not needed for profile management
CREATE POLICY "Users can delete own profile" ON employees
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Ensure the authenticated role exists and has proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE employees TO authenticated;