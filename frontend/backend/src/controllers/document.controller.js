const { supabase } = require('@lib/supabase');
const { hasViewAllAccess, logDeniedAccess } = require('@middlewares/ownership.middleware');

const canViewAllDocuments = (user) => hasViewAllAccess(user, {
    allowRoles: ['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER'],
    permissions: ['documents.view_all']
});

const resolveDocumentEmployeeId = (req, requestedEmployeeId) => {
    if (canViewAllDocuments(req.user) && requestedEmployeeId) {
        return requestedEmployeeId;
    }

    if (requestedEmployeeId && String(requestedEmployeeId) !== String(req.user.employeeId)) {
        return null;
    }

    return req.user.employeeId;
};

exports.upload = async (req, res, next) => {
    try {
        const { name, type, fileUrl, fileSize, mimeType } = req.body;
        const requestedEmployeeId = req.body.employeeId;
        const employeeId = resolveDocumentEmployeeId(req, requestedEmployeeId);

        if (!employeeId) {
            logDeniedAccess(req, requestedEmployeeId, 'document_upload_employee_mismatch');
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // In a real scenario, we would use multer and upload to Supabase Storage here
        // For now, we assume the frontend sends the URL or we mock it

        const { data, error } = await supabase
            .from('documents')
            .insert([{
                employee_id: employeeId,
                name,
                type,
                file_url: fileUrl || 'https://placeholder.com/doc.pdf',
                file_size: fileSize || 0,
                mime_type: mimeType || 'application/pdf',
                uploaded_by: req.user.employeeId || null
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.getByEmployee = async (req, res, next) => {
    try {
        const requestedEmployeeId = req.params.employeeId;
        const employeeId = resolveDocumentEmployeeId(req, requestedEmployeeId);

        if (!employeeId) {
            logDeniedAccess(req, requestedEmployeeId, 'document_read_employee_mismatch');
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('employee_id', employeeId);

        if (error) throw error;
        res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
        next(err);
    }
};
