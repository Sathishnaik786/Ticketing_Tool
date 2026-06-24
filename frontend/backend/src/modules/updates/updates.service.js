const { supabase, supabaseAdmin } = require('@lib/supabase');

class UpdatesService {
    /**
     * Helper to enrich update with user profile
     */
    async _enrichUpdate(update) {
        if (!update) return update;

        const user = update.user || update.author;
        const employeeData = user?.employee;
        const employee = Array.isArray(employeeData) ? employeeData[0] : employeeData;

        let profileImageUrl = null;

        // If profile_image path exists in DB, try to generate a signed URL
        if (employee?.profile_image) {
            try {
                const ProfileImageService = require('../../controllers/profileImage.service');
                const signedUrl = await ProfileImageService.generateSignedUrl(employee.profile_image);
                if (signedUrl) {
                    profileImageUrl = signedUrl;
                }
            } catch (err) {
                console.error('Error generating signed URL for update user profile:', err);
            }
        }

        return {
            ...update,
            user_profile: {
                id: user?.id || update.user_id,
                name: employee ? `${employee.first_name} ${employee.last_name}` : (user?.email?.split('@')[0] || 'Unknown User'),
                role: user?.role || update.role || 'EMPLOYEE',
                position: employee?.position || 'Team Member',
                profile_image: profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${update.user_id}`
            }
        };
    }

    /**
     * Create a new update
     */
    async createUpdate(updateData, visibleToUserIds = []) {
        const { data: update, error: updateError } = await supabaseAdmin
            .from('employee_updates')
            .insert([updateData])
            .select(`
                *,
                user:users!user_id (
                    id,
                    role,
                    email,
                    employee:employees!user_id (
                        first_name,
                        last_name,
                        profile_image,
                        position
                    )
                )
            `)
            .single();

        if (updateError) throw updateError;

        // Add visibility if provided
        if (visibleToUserIds.length > 0) {
            const visibilityData = visibleToUserIds.map(userId => ({
                update_id: update.id,
                visible_to_user_id: userId
            }));

            const { error: visError } = await supabaseAdmin
                .from('employee_update_visibility')
                .insert(visibilityData);

            if (visError) {
                console.error('Error adding visibility:', visError);
            }
        }

        return await this._enrichUpdate(update);
    }

    /**
     * Get updates created by the user
     */
    async getMyUpdates(userId, filters = {}) {
        const { type, date, week, month } = filters;

        let query = supabaseAdmin
            .from('employee_updates')
            .select(`
                *,
                feedback:employee_update_feedback(*),
                user:users!user_id (
                    id,
                    role,
                    email,
                    employee:employees!user_id (
                        first_name,
                        last_name,
                        profile_image,
                        position
                    )
                )
            `)
            .eq('user_id', userId);

        if (type) query = query.eq('update_type', type);

        // Date filters
        if (date) {
            query = query.gte('created_at', `${date}T00:00:00Z`).lte('created_at', `${date}T23:59:59Z`);
        } else if (month) {
            // month format: YYYY-MM
            const [year, m] = month.split('-');
            const startDate = `${month}-01T00:00:00Z`;
            const endDate = new Date(year, m, 0).toISOString().split('T')[0] + 'T23:59:59Z';
            query = query.gte('created_at', startDate).lte('created_at', endDate);
        } else if (week) {
            // week format: YYYY-Www (e.g. 2024-W15)
            // Simplified: just use a range if provided or wait for more complex logic
            // For now, assume week is a date string of the start of the week
            const start = new Date(week);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return Promise.all(data.map(u => this._enrichUpdate(u)));
    }

    /**
     * Get updates visible to the user
     */
    async getVisibleUpdates(userId, filters = {}) {
        const { type, date, week, month } = filters;

        let query = supabaseAdmin
            .from('employee_updates')
            .select(`
                *,
                author:users!user_id (
                    id,
                    role,
                    email,
                    employee:employees!user_id (
                        first_name,
                        last_name,
                        profile_image,
                        position
                    )
                ),
                feedback:employee_update_feedback(*)
            `)
            .not('user_id', 'eq', userId);

        if (type) query = query.eq('update_type', type);

        // Apply same date filters
        if (date) {
            query = query.gte('created_at', `${date}T00:00:00Z`).lte('created_at', `${date}T23:59:59Z`);
        } else if (month) {
            const [year, m] = month.split('-');
            const startDate = `${month}-01T00:00:00Z`;
            const lastDay = new Date(year, m, 0).getDate();
            const endDate = `${month}-${lastDay}T23:59:59Z`;
            query = query.gte('created_at', startDate).lte('created_at', endDate);
        } else if (week) {
            const start = new Date(week);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return Promise.all(data.map(u => this._enrichUpdate(u)));
    }

    /**
     * Get analytics for the current user
     */
    async getAnalyticsMe(userId, filters = {}) {
        const { date, week, month } = filters;

        let query = supabaseAdmin
            .from('employee_updates')
            .select('update_type, created_at')
            .eq('user_id', userId);

        if (date) {
            query = query.gte('created_at', `${date}T00:00:00Z`).lte('created_at', `${date}T23:59:59Z`);
        } else if (month) {
            const [year, m] = month.split('-');
            const startDate = `${month}-01T00:00:00Z`;
            const lastDay = new Date(year, m, 0).getDate();
            const endDate = `${month}-${lastDay}T23:59:59Z`;
            query = query.gte('created_at', startDate).lte('created_at', endDate);
        } else if (week) {
            const start = new Date(week);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Basic aggregation logic
        const dailyUpdates = data.filter(u => u.update_type === 'DAILY');

        // Calculate Streak
        let streak = 0;
        if (dailyUpdates.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let currentDate = today;
            const updateDates = dailyUpdates.map(u => {
                const d = new Date(u.created_at);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
            });

            // Check if latest update is today or yesterday
            const latestUpdateDate = new Date(dailyUpdates[0].created_at);
            latestUpdateDate.setHours(0, 0, 0, 0);

            const diffInDays = Math.floor((today.getTime() - latestUpdateDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffInDays <= 1) {
                // Potential streak
                streak = 1;
                let checkDate = new Date(latestUpdateDate);

                for (let i = 1; i < dailyUpdates.length; i++) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    const prevUpdateDate = new Date(dailyUpdates[i].created_at);
                    prevUpdateDate.setHours(0, 0, 0, 0);

                    if (prevUpdateDate.getTime() === checkDate.getTime()) {
                        streak++;
                    } else if (prevUpdateDate.getTime() > checkDate.getTime()) {
                        continue; // Multiple updates on same day
                    } else {
                        break;
                    }
                }
            }
        }

        const stats = {
            total: data.length,
            daily: dailyUpdates.length,
            weekly: data.filter(u => u.update_type === 'WEEKLY').length,
            monthly: data.filter(u => u.update_type === 'MONTHLY').length,
            streak: streak,
            recent: data.slice(0, 10)
        };


        return stats;
    }

    /**
     * Get analytics for the manager's team
     */
    async getAnalyticsTeam(userId, filters = {}) {
        const { date, week, month } = filters;

        let query = supabaseAdmin
            .from('employee_updates')
            .select('user_id, update_type, created_at')
            .not('user_id', 'eq', userId);

        if (date) {
            query = query.gte('created_at', `${date}T00:00:00Z`).lte('created_at', `${date}T23:59:59Z`);
        } else if (month) {
            const [year, m] = month.split('-');
            const startDate = `${month}-01T00:00:00Z`;
            const lastDay = new Date(year, m, 0).getDate();
            const endDate = `${month}-${lastDay}T23:59:59Z`;
            query = query.gte('created_at', startDate).lte('created_at', endDate);
        } else if (week) {
            const start = new Date(week);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
            totalUpdates: data.length,
            byType: {
                DAILY: data.filter(u => u.update_type === 'DAILY').length,
                WEEKLY: data.filter(u => u.update_type === 'WEEKLY').length,
                MONTHLY: data.filter(u => u.update_type === 'MONTHLY').length
            },
            uniqueContributors: new Set(data.map(u => u.user_id)).size
        };
    }

    /**
     * Get analytics for the entire organization
     */
    async getAnalyticsOrg(filters = {}) {
        const { date, week, month } = filters;

        let query = supabaseAdmin
            .from('employee_updates')
            .select('update_type, created_at, user_id');

        if (date) {
            query = query.gte('created_at', `${date}T00:00:00Z`).lte('created_at', `${date}T23:59:59Z`);
        } else if (month) {
            const [year, m] = month.split('-');
            const startDate = `${month}-01T00:00:00Z`;
            const lastDay = new Date(year, m, 0).getDate();
            const endDate = `${month}-${lastDay}T23:59:59Z`;
            query = query.gte('created_at', startDate).lte('created_at', endDate);
        } else if (week) {
            const start = new Date(week);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
        }

        const { data: updates, error: updatesError } = await query;

        if (updatesError) throw updatesError;

        return {
            totalUpdates: updates.length,
            byType: {
                DAILY: updates.filter(u => u.update_type === 'DAILY').length,
                WEEKLY: updates.filter(u => u.update_type === 'WEEKLY').length,
                MONTHLY: updates.filter(u => u.update_type === 'MONTHLY').length
            },
            uniqueContributors: new Set(updates.map(u => u.user_id)).size
        };
    }

    /**
     * Add feedback to an update
     */
    async addFeedback(feedbackData) {
        const { data, error } = await supabaseAdmin
            .from('employee_update_feedback')
            .insert([feedbackData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update an existing update
     */
    async updateUpdate(id, userId, updateData) {
        // Enforce ownership
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('employee_updates')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing) throw new Error('Update not found');
        if (existing.user_id !== userId) throw new Error('Unauthorized');

        // Only allow updating certain fields
        const allowedUpdates = {
            title: updateData.title,
            content: updateData.content,
            project_id: updateData.project_id,
            updated_at: new Date().toISOString()
        };

        const { data: update, error: updateError } = await supabaseAdmin
            .from('employee_updates')
            .update(allowedUpdates)
            .eq('id', id)
            .select(`
                *,
                user:users!user_id (
                    id,
                    role,
                    email,
                    employee:employees!user_id (
                        first_name,
                        last_name,
                        profile_image,
                        position
                    )
                )
            `)
            .single();

        if (updateError) throw updateError;
        return await this._enrichUpdate(update);
    }

    /**
     * Delete an update
     */
    async deleteUpdate(id, userId) {
        // Enforce ownership
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('employee_updates')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing) throw new Error('Update not found');
        if (existing.user_id !== userId) throw new Error('Unauthorized');

        const { error: deleteError } = await supabaseAdmin
            .from('employee_updates')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;
        return { success: true };
    }
}

module.exports = new UpdatesService();
