const { supabase, supabaseAdmin } = require('@lib/supabase');
const { getUserRole } = require('../services/role-resolution.service');

exports.checkEmailExists = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // For demo purposes, recognize the demo emails
        const demoEmails = ['admin@company.com', 'hr@company.com', 'manager@company.com'];
        const isDemoEmail = demoEmails.includes(email);

        if (isDemoEmail) {
            return res.status(200).json({
                success: true,
                exists: true
            });
        }

        // For non-demo emails, check if the user exists in our database
        const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle(); // Use maybeSingle to avoid errors when no user is found

        if (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
        }

        res.status(200).json({
            success: true,
            exists: !!dbUser
        });
    } catch (err) {
        next(err);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // First, check if the user exists in our database
        const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle(); // Use maybeSingle to avoid errors when no user is found

        if (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
        }

        // If user doesn't exist in our database, return a success response but don't send email
        // This prevents email enumeration attacks
        if (!dbUser) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }

        // User exists, so send the password reset email
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`
        });

        if (error) {
            console.error('Forgot password error:', error);
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
    } catch (err) {
        next(err);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and password are required' });
        }

        // For Supabase, we need to use the admin client to update the user's password
        // First, we verify the token by getting the user
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

        if (userError) {
            console.error('Token verification error:', userError);
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Update the user's password
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            userData.user.id,
            { password: password }
        );

        if (error) {
            console.error('Reset password error:', error);
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.'
        });
    } catch (err) {
        next(err);
    }
};






exports.createUser = async (req, res, next) => {
    try {
        // Only allow admin users to create other users
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only admins can create users' });
        }

        let { email, role, departmentId, managerId } = req.body;

        // Validate required fields
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Default role to EMPLOYEE if not specified
        if (!role) {
            role = 'EMPLOYEE';
        }

        // Validate role
        const validRoles = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be one of: ADMIN, HR, MANAGER, EMPLOYEE'
            });
        }

        // Check if user already exists in Supabase Auth
        const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();
        if (searchError) {
            console.error('Error searching users:', searchError.message);
        }

        const existingUser = users?.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create Supabase Auth user using Service Role Key
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true, // Auto-confirm email to avoid verification steps
            password: 'TempPassword123!', // Default temporary password
        });

        if (authError) {
            console.error('Error creating auth user:', authError.message);
            return res.status(400).json({
                success: false,
                message: authError.message
            });
        }

        const userId = authData.user.id;

        // Insert into public.users table
        const { data: userRecord, error: userError } = await supabase
            .from('users')
            .insert([{
                id: userId,
                email,
                role
            }])
            .select()
            .single();

        if (userError) {
            console.error('Error inserting user record:', userError.message);
            // Rollback: delete the auth user since DB insert failed
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return res.status(500).json({
                success: false,
                message: 'Failed to create user record'
            });
        }

        // Check if employee record already exists for this user_id
        const { data: existingEmployee, error: existingError } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', userId)
            .single();

        let employeeRecord;
        let employeeError = null;

        if (existingEmployee) {
            // Update existing employee record
            const { data: updateData, error: updateError } = await supabase
                .from('employees')
                .update({
                    first_name: email.split('@')[0], // Use email prefix as first name
                    last_name: 'User',
                    role,
                    department_id: departmentId || null,
                    manager_id: managerId || null,
                    email
                })
                .eq('user_id', userId)
                .select()
                .single();

            employeeRecord = updateData;
            employeeError = updateError;
        } else {
            // Insert new employee record
            const { data: insertData, error: insertError } = await supabase
                .from('employees')
                .insert([{
                    user_id: userId,
                    first_name: email.split('@')[0], // Use email prefix as first name
                    last_name: 'User',
                    role,
                    department_id: departmentId || null,
                    manager_id: managerId || null,
                    email
                }])
                .select()
                .single();

            employeeRecord = insertData;
            employeeError = insertError;
        }

        if (employeeError) {
            console.error('Error inserting/updating employee record:', employeeError.message);
            // Rollback: delete the auth user and user record since employee operation failed
            await supabaseAdmin.auth.admin.deleteUser(userId);
            await supabase.from('users').delete().eq('id', userId);
            return res.status(500).json({
                success: false,
                message: 'Failed to create/update employee record'
            });
        }

        // Insert into user_roles table for access mapping
        // 1. Resolve role ID from roles table
        const { data: roleRecord, error: roleResolveError } = await supabase
            .from('roles')
            .select('id')
            .eq('role_code', role)
            .maybeSingle();

        if (roleResolveError || !roleRecord) {
            console.error('Error resolving role:', roleResolveError?.message || 'Role not found');
            // Rollback: delete employee, user, and auth user
            if (!existingEmployee) {
                await supabase.from('employees').delete().eq('user_id', userId);
            }
            await supabase.from('users').delete().eq('id', userId);
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return res.status(500).json({
                success: false,
                message: 'Failed to assign role (invalid configuration)'
            });
        }

        // 2. Clear existing role mappings for this user in user_roles (if any)
        await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId);

        // 3. Insert into user_roles
        const { error: userRoleError } = await supabase
            .from('user_roles')
            .insert([{
                user_id: userId,
                role_id: roleRecord.id
            }]);

        if (userRoleError) {
            console.error('Error inserting user_roles record:', userRoleError.message);
            // Rollback: delete employee, user, and auth user
            if (!existingEmployee) {
                await supabase.from('employees').delete().eq('user_id', userId);
            }
            await supabase.from('users').delete().eq('id', userId);
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return res.status(500).json({
                success: false,
                message: 'Failed to assign user role'
            });
        }

        // Return created user summary (no sensitive passwords or credentials returned)
        res.status(201).json({
            success: true,
            data: {
                id: employeeRecord.id,
                userId: userId,
                email,
                role,
                departmentId: departmentId || null,
                managerId: managerId || null
            },
            message: 'User created successfully.'
        });
    } catch (err) {
        console.error('Create user error:', err.message);
        next(err);
    }
};


// Login function
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error);
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        // Get user from the token
        const user = data.user;

        // Check if user exists in our employees table
        const { data: employee, error: empError } = await supabaseAdmin
            .from('employees')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (empError) {
            console.error('Employee lookup error:', empError);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }

        if (!employee) {
            console.log('No employee record found for user:', user.id);
            return res.status(403).json({
                success: false,
                message: 'Permission denied: User exists but is not mapped to an employee record',
            });
        }

        const resolvedRole = await getUserRole(supabaseAdmin, user.id);

        // Generate access token
        const token = data.session.access_token;

        let profileImageUrl = employee.profile_image;
        if (profileImageUrl) {
            try {
                const ProfileImageService = require('./profileImage.service');
                const signedUrl = await ProfileImageService.generateSignedUrl(profileImageUrl);
                if (signedUrl) {
                    profileImageUrl = signedUrl;
                }
            } catch (urlError) {
                console.error('Error generating signed URL in login:', urlError);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: resolvedRole || 'EMPLOYEE',
                    profile_image: profileImageUrl, // Use the signed URL
                    firstName: employee.first_name,
                    lastName: employee.last_name,
                    employeeId: employee.id,
                },
                token: token,
                refresh_token: data.session.refresh_token,
            },
            message: 'Login successful'
        });
    } catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};

// Get current user's profile
exports.getMe = async (req, res, next) => {
    try {
        // Get employee data to fetch profile_image and position with signed URL
        const { data: employee, error } = await supabase
            .from('employees')
            .select('profile_image, position')
            .eq('user_id', req.user.id)
            .single();

        let profileImageUrl = null;

        // Generate signed URL if profile_image exists
        if (employee?.profile_image) {
            try {
                const ProfileImageService = require('./profileImage.service');
                profileImageUrl = await ProfileImageService.generateSignedUrl(employee.profile_image);

                // If file doesn't exist, clean up invalid path from database
                if (!profileImageUrl && employee.profile_image) {
                    // Clean up invalid path asynchronously (don't block response)
                    supabase
                        .from('employees')
                        .update({ profile_image: null })
                        .eq('user_id', req.user.id)
                        .then(() => {
                            console.log(`Cleaned up invalid profile_image path for user ${req.user.id}`);
                        })
                        .catch(cleanupError => {
                            console.error('Error cleaning up invalid profile_image:', cleanupError);
                        });
                }
            } catch (urlError) {
                // Handle storage errors gracefully
                if (urlError.statusCode === '404' || urlError.status === 404 || urlError.__isStorageError) {
                    console.warn('Profile image file not found in storage, cleaning up database');
                    // Clean up invalid path
                    supabase
                        .from('employees')
                        .update({ profile_image: null })
                        .eq('user_id', req.user.id)
                        .catch(cleanupError => {
                            console.error('Error cleaning up invalid profile_image:', cleanupError);
                        });
                } else {
                    console.error('Error generating signed URL in getMe:', urlError);
                }
                // Continue without profile image if URL generation fails
            }
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    role: req.user.role,
                    position: employee?.position, // Include position from employee record
                    profile_image: profileImageUrl, // Include signed URL if available
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    employeeId: req.user.employeeId,
                }
            }
        });
    } catch (err) {
        next(err);
    }
};
