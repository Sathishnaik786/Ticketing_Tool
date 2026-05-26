const { supabase, supabaseAdmin } = require('@lib/supabase');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log(`🛡️  [${new Date().toISOString()}] Auth Middleware: ${req.method} ${req.originalUrl || req.url}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No Bearer token found in headers');
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  console.log(`🔑 Token extracted (length: ${token.length})`);

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      console.log('Invalid token:', error?.message || 'No user data');
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Load employee mapping to get role - use admin client to bypass RLS during auth
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (empError) {
      console.error('Employee lookup error:', empError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!employee) {
      console.log('No employee record found for user:', data.user.id);
      return res.status(403).json({
        message: 'Permission denied: User exists but is not mapped to an employee record',
      });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: employee.role?.toUpperCase() || 'EMPLOYEE',
      employeeId: employee.id,
      firstName: employee.first_name,
      lastName: employee.last_name,
    };

    console.log(`✅ User authenticated: ${req.user.email} (Role: ${req.user.role})`);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authMiddleware;
