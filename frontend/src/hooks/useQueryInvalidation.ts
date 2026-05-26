/**
 * Hook for handling real-time data invalidation
 * Listens to socket events and invalidates TanStack Query cache
 */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import { notificationService } from '@/services/notificationService';

import { useAuth } from '@/contexts/AuthContext';

export const useQueryInvalidation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const chatSocket = chatService.getSocket();
    const notificationSocket = notificationService.getSocket();
    
    // We want to listen to both if they exist
    const sockets = [chatSocket, notificationSocket].filter(Boolean);

    if (sockets.length === 0) {
      console.log('🔌 No sockets found for invalidation hook');
      return;
    }

    console.log(`🔌 Registering invalidation listeners on ${sockets.length} sockets`);

    const handleDataInvalidation = (payload: { type: string; action?: string }) => {
      console.log('🔄 Invalidating cache for:', payload.type);
      queryClient.invalidateQueries({ queryKey: [payload.type] });
      
      // Handle list queries too
      const listMappings: Record<string, string> = {
        'employee': 'employees',
        'project': 'projects',
        'department': 'departments',
        'attendance': 'attendance',
        'leave': 'leaves'
      };
      
      if (listMappings[payload.type]) {
        queryClient.invalidateQueries({ queryKey: [listMappings[payload.type]] });
      }
    };

    const handleNotificationNew = () => {
      console.log('🔔 New notification received, invalidating...');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleEmployeeUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee'] });
    };

    const handleProjectUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    };

    const handleAttendanceUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    sockets.forEach(socket => {
      if (!socket) return;
      socket.on('data:invalidated', handleDataInvalidation);
      socket.on('notification:new', handleNotificationNew);
      socket.on('employee:updated', handleEmployeeUpdate);
      socket.on('project:updated', handleProjectUpdate);
      socket.on('attendance:updated', handleAttendanceUpdate);
    });

    return () => {
      sockets.forEach(socket => {
        if (!socket) return;
        socket.off('data:invalidated', handleDataInvalidation);
        socket.off('notification:new', handleNotificationNew);
        socket.off('employee:updated', handleEmployeeUpdate);
        socket.off('project:updated', handleProjectUpdate);
        socket.off('attendance:updated', handleAttendanceUpdate);
      });
    };
  }, [queryClient, user]);
};




