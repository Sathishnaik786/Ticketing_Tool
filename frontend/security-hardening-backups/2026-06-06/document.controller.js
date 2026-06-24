const { supabase } = require('@lib/supabase');

exports.upload = async (req, res, next) => {
    try {
        const { employeeId, name, type, fileUrl, fileSize, mimeType } = req.body;

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
                uploaded_by: req.user.employee?.id || null
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
        const { employeeId } = req.params;
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
