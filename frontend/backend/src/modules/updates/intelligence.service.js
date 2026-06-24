const { supabaseAdmin } = require('@lib/supabase');
const updatesService = require('./updates.service');
const NotificationService = require('@controllers/notification.service');

class UpdateIntelligenceService {
    /**
     * Detect missing updates for all active employees
     */
    async detectMissingUpdates() {
        const { data: employees, error } = await supabaseAdmin
            .from('employees')
            .select('user_id, id, first_name, last_name, status')
            .eq('status', 'ACTIVE');

        if (error) throw error;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const results = {
            daily: [],
            weekly: [],
            monthly: []
        };

        for (const emp of employees) {
            // Check Daily
            const { data: daily, error: dError } = await supabaseAdmin
                .from('employee_updates')
                .select('id')
                .eq('user_id', emp.user_id)
                .eq('update_type', 'DAILY')
                .gte('created_at', today.toISOString());

            if (!dError && daily.length === 0) {
                results.daily.push(emp);
                await this.sendReminder(emp.user_id, 'DAILY');
            }

            // Check Weekly (on Fridays)
            if (today.getDay() === 5) { // Friday
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - 4); // Monday

                const { data: weekly, error: wError } = await supabaseAdmin
                    .from('employee_updates')
                    .select('id')
                    .eq('user_id', emp.user_id)
                    .eq('update_type', 'WEEKLY')
                    .gte('created_at', startOfWeek.toISOString());

                if (!wError && weekly.length === 0) {
                    results.weekly.push(emp);
                    await this.sendReminder(emp.user_id, 'WEEKLY');
                }
            }
        }

        return results;
    }

    /**
     * Send a reminder notification to a user
     */
    async sendReminder(userId, type) {
        const titles = {
            DAILY: 'Daily Standup Reminder',
            WEEKLY: 'Weekly Stand-out Reminder',
            MONTHLY: 'Monthly Review Reminder'
        };

        const messages = {
            DAILY: "Don't forget to post your daily standup! Keeping the team in sync is key.",
            WEEKLY: "It's the end of the week! Share your achievements and next week's focus.",
            MONTHLY: "Monthly review time! Reflect on your growth and strategic goals."
        };

        const links = {
            DAILY: '/app/updates/daily',
            WEEKLY: '/app/updates/weekly',
            MONTHLY: '/app/updates/monthly'
        };

        try {
            await NotificationService.notifySystemAlert(
                userId,
                titles[type],
                messages[type],
                links[type]
            );
        } catch (error) {
            console.error(`Failed to send ${type} reminder to ${userId}:`, error);
        }
    }

    /**
     * Generate an AI summary for a user based on their daily/weekly updates
     * (Simulated AI Logic)
     */
    async generateSummary(userId, type = 'MONTHLY', filters = {}) {
        const { date, week, month } = filters;

        let query = supabaseAdmin
            .from('employee_updates')
            .select('*')
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

        const { data: updates, error } = await query.order('created_at', { ascending: false });

        if (error || !updates || updates.length === 0) return null;

        const sourceUpdates = updates.filter(u =>
            type === 'MONTHLY' ? u.update_type === 'WEEKLY' : u.update_type === 'DAILY'
        );

        if (sourceUpdates.length === 0) return "Not enough data to generate a summary.";

        // Mock AI summarization logic
        const highlights = sourceUpdates.map(u =>
            type === 'MONTHLY' ? u.content.achievements : u.content.today
        ).filter(Boolean);

        const summary = {
            text: `Based on your ${sourceUpdates.length} recent updates, you've shown consistent progress in your projects.`,
            keyHighlights: highlights.slice(0, 3),
            suggestion: `Focus on closing the open items from ${type === 'MONTHLY' ? 'last week' : 'yesterday'} to maintain momentum.`
        };

        return summary;
    }
}

module.exports = new UpdateIntelligenceService();
