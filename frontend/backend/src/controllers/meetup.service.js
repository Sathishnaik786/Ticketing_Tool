const { supabase } = require('@lib/supabase');

class MeetupService {
  static async getAllMeetups(userId, role) {
    let query = supabase
      .from('meetups')
      .select(`
        *,
        created_by_user:employees!created_by(first_name, last_name, email),
        requested_by_user:employees!requested_by(first_name, last_name, email)
      `)
      .order('scheduled_at', { ascending: false });

    // For non-admins, only show approved meetups plus their own pending ones
    if (role !== 'ADMIN' && role !== 'MANAGER') {
      // Get the employee ID for the authenticated user
      const { data: userEmployee, error: userEmployeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (userEmployee && !userEmployeeError) {
        // Show approved meetups plus user's own pending meetups
        query = query.or(
          `status.eq.APPROVED, and(status.eq.PENDING,requested_by.eq.${userEmployee.id})`
        );
      } else {
        // If no employee record, only show approved
        query = query.eq('status', 'APPROVED');
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format the data to match the frontend API model
    return data.map(meetup => ({
      id: meetup.id,
      title: meetup.title,
      description: meetup.description,
      type: meetup.type,
      platform: meetup.platform,
      status: meetup.status,
      departmentId: meetup.department_id,
      createdBy: meetup.created_by,
      date: meetup.scheduled_at,
      dateLabel: meetup.scheduled_at ? new Date(meetup.scheduled_at).toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : undefined,
      timeLabel: meetup.start_time && meetup.end_time ? 
        `${meetup.start_time} - ${meetup.end_time}` : undefined,
      startTime: meetup.start_time,
      endTime: meetup.end_time,
      hostName: meetup.created_by_user ? 
        `${meetup.created_by_user.first_name} ${meetup.created_by_user.last_name}` : undefined,
      requestedBy: meetup.requested_by,
      requesterName: meetup.requested_by_user ? 
        `${meetup.requested_by_user.first_name} ${meetup.requested_by_user.last_name}` : undefined,
      link: meetup.meet_link
    }));
  }

  static async createMeetup(meetupData, userId, role) {
    if (!['ADMIN', 'MANAGER'].includes(role)) {
      throw new Error('Access denied: Only ADMIN and MANAGER can create approved meetups');
    }

    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (userEmployeeError || !userEmployee) {
      throw new Error('User does not have an associated employee record');
    }

    const { title, description, type, platform, link, date, startTime, endTime } = meetupData;

    const { data, error } = await supabase
      .from('meetups')
      .insert([{
        title,
        description,
        type,
        platform,
        status: 'APPROVED', // Admin/manager creates approved meetups
        created_by: userEmployee.id,
        scheduled_at: date,
        start_time: startTime,
        end_time: endTime,
        meet_link: link
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async requestMeetup(meetupData, userId, role) {
    // Any user can request a meetup
    // Get the employee ID for the current user
    const { data: userEmployee, error: userEmployeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (userEmployeeError || !userEmployee) {
      throw new Error('User does not have an associated employee record');
    }

    const { title, description, type, platform, link, date, startTime, endTime } = meetupData;

    const { data, error } = await supabase
      .from('meetups')
      .insert([{
        title,
        description,
        type,
        platform,
        status: 'PENDING', // User requests are pending
        requested_by: userEmployee.id,
        created_by: userEmployee.id, // Set both to the requesting user
        scheduled_at: date,
        start_time: startTime,
        end_time: endTime,
        meet_link: link
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async approveMeetup(meetupId, approved, userId, role) {
    if (!['ADMIN', 'MANAGER'].includes(role)) {
      throw new Error('Access denied: Only ADMIN and MANAGER can approve meetups');
    }

    // Get the meetup to check if it's already approved/rejected
    const { data: existingMeetup, error: fetchError } = await supabase
      .from('meetups')
      .select('*')
      .eq('id', meetupId)
      .single();

    if (fetchError) throw fetchError;
    if (!existingMeetup) throw new Error('Meetup not found');

    // Can only approve/reject pending meetups
    if (existingMeetup.status !== 'PENDING') {
      throw new Error('Only pending meetups can be approved or rejected');
    }

    const newStatus = approved ? 'APPROVED' : 'REJECTED';

    const { data, error } = await supabase
      .from('meetups')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', meetupId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async getMeetupById(meetupId, userId, role) {
    const { data, error } = await supabase
      .from('meetups')
      .select(`
        *,
        created_by_user:employees!created_by(first_name, last_name, email),
        requested_by_user:employees!requested_by(first_name, last_name, email)
      `)
      .eq('id', meetupId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Meetup not found');

    // Check permissions
    if (role !== 'ADMIN' && role !== 'MANAGER' && data.status !== 'APPROVED') {
      // For non-admins, only allow access to approved meetups or their own pending ones
      const { data: userEmployee, error: userEmployeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (userEmployeeError || !userEmployee || 
          (data.requested_by !== userEmployee.id && data.created_by !== userEmployee.id)) {
        throw new Error('Access denied: You do not have permission to view this meetup');
      }
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      platform: data.platform,
      status: data.status,
      departmentId: data.department_id,
      createdBy: data.created_by,
      date: data.scheduled_at,
      dateLabel: data.scheduled_at ? new Date(data.scheduled_at).toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : undefined,
      timeLabel: data.start_time && data.end_time ? 
        `${data.start_time} - ${data.end_time}` : undefined,
      startTime: data.start_time,
      endTime: data.end_time,
      hostName: data.created_by_user ? 
        `${data.created_by_user.first_name} ${data.created_by_user.last_name}` : undefined,
      requestedBy: data.requested_by,
      requesterName: data.requested_by_user ? 
        `${data.requested_by_user.first_name} ${data.requested_by_user.last_name}` : undefined,
      link: data.meet_link
    };
  }
}

module.exports = MeetupService;