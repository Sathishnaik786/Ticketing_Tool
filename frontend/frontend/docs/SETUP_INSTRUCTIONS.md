# YVI_EWS Admin Setup Instructions

This guide will help you set up the initial admin user for the YVI_EWS application.

## Step 1: Create a User in Supabase Dashboard

1. Go to your [Supabase dashboard](https://app.supabase.com/)
2. Navigate to your project
3. Go to **Authentication** > **Users**
4. Click **"New User"**
5. Enter the following details:
   - **Email**: `admin@yvi-ews.com`
   - **Password**: `AdminPassword123!`
   - **Confirm password**: `AdminPassword123!`
   - Uncheck "Email confirmation required"
6. Click **"Create User"**
7. After creation, copy the **User ID** (UUID) shown in the user details

## Step 2: Set the User ID in Environment

Add the copied User ID to your backend `.env` file:

```bash
# In c:\Users\sathi\OneDrive\Desktop\YVI_EWS\backend\.env

# ... existing variables ...

# Add this line with your actual User ID:
SUPABASE_ADMIN_USER_ID=your-actual-uuid-here
```

## Step 3: Run the Admin Setup Script

1. Open a command prompt/terminal
2. Navigate to the backend directory:
   ```bash
   cd c:\Users\sathi\OneDrive\Desktop\YVI_EWS\backend
   ```
3. Run the setup script:
   ```bash
   node manual_admin_setup.js
   ```

## Step 4: Verify Setup

1. Start your backend server:
   ```bash
   npm start
   # or
   node src/server.js
   ```

2. Start your frontend:
   ```bash
   cd c:\Users\sathi\OneDrive\Desktop\YVI_EWS\frontend
   npm run dev
   ```

3. Go to `http://localhost:8080` in your browser
4. Try logging in with:
   - **Email**: `admin@yvi-ews.com`
   - **Password**: `AdminPassword123!`

## Troubleshooting

If you encounter issues:

1. **Connection errors**: Make sure your Supabase URL and keys in `.env` are correct
2. **Login fails**: Verify the user was created in Supabase Auth and the database records were inserted
3. **Permission errors**: Check that the user has the 'ADMIN' role in both `users` and `employees` tables

## Alternative: Direct Database Setup

If the above method doesn't work, you can manually insert the records using Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to your project
3. Go to **Database** > **SQL Editor**
4. Run these SQL commands (replace `YOUR_USER_ID` with the actual User ID from step 1):

```sql
-- Insert into users table
INSERT INTO users (id, email, role) 
VALUES ('YOUR_USER_ID', 'admin@yvi-ews.com', 'ADMIN');

-- Insert into employees table
INSERT INTO employees (user_id, first_name, last_name, role, status, email) 
VALUES ('YOUR_USER_ID', 'System', 'Admin', 'ADMIN', 'ACTIVE', 'admin@yvi-ews.com');
```

After completing these steps, you should be able to log in as an admin user and access all RBAC functionality.