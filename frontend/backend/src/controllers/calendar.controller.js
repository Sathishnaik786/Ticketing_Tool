const { supabase } = require('@lib/supabase');

class CalendarController {
  // GET /api/calendar-events - get all calendar events (currently just approved meetups)
  static async getEvents(req, res) {
    try {
      const userId = req.user.id;
      const role = req.user.role;

      // Get approved meetups to show as calendar events
      let query = supabase
        .from('meetups')
        .select(`
          id,
          title,
          description,
          scheduled_at,
          start_time,
          end_time,
          platform,
          status,
          meet_link,
          created_by,
          requested_by,
          created_by_user:employees!created_by(first_name, last_name, email)
        `)
        .eq('status', 'APPROVED') // Only approved meetups appear as calendar events
        .order('scheduled_at', { ascending: true });

      // For non-admin users, we might want to limit visibility based on department or other criteria
      // For now, we'll return all approved meetups
      const { data, error } = await query;

      if (error) throw error;

      // Format the data to match the CalendarEventApiModel
      const calendarEvents = data.map(meetup => {
        // Combine scheduled_at date with start_time and end_time
        const scheduledDate = new Date(meetup.scheduled_at);
        const [startHours, startMinutes] = meetup.start_time.split(':').map(Number);
        const [endHours, endMinutes] = meetup.end_time.split(':').map(Number);

        const startDateTime = new Date(scheduledDate);
        startDateTime.setHours(startHours, startMinutes, 0, 0);

        const endDateTime = new Date(scheduledDate);
        endDateTime.setHours(endHours, endMinutes, 0, 0);

        return {
          id: meetup.id,
          meetupId: meetup.id,
          title: meetup.title,
          description: meetup.description,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          event_type: "MEETUP",
          created_by: meetup.created_by,
          platform: meetup.platform,
          status: meetup.status,
          meet_link: meetup.meet_link
        };
      });

      res.status(200).json({
        success: true,
        data: calendarEvents
      });
    } catch (error) {
      console.error('Error getting calendar events:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = CalendarController;