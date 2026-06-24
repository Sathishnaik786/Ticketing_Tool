import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLoader } from './AppLoader';
import { chatService } from '@/services/chatService';
import { notificationService } from '@/services/notificationService';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useWebVitals } from '@/hooks/useWebVitals';
import { trackFeatureFlags } from '@/services/featureFlagTelemetry.service';
import { observability } from '@/services/observability';

interface AppBootstrapProps {
  children: React.ReactNode;
}

export const AppBootstrap: React.FC<AppBootstrapProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useWebVitals();
  useQueryInvalidation();

  useEffect(() => {
    trackFeatureFlags();
  }, []);

  useEffect(() => {
    if (user?.id) {
      observability.identifyUser(user.id, { role: user.role });
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Initialize services once authenticated
        const token = localStorage.getItem('token');
        if (token) {
          console.log('🚀 Bootstrapping application services...');
          
          // Connect sockets
          notificationService.connect(user.id, token);
          chatService.connect(user.id, token);
          
          // Small delay to ensure sockets are initializing
          const timer = setTimeout(() => {
            setIsReady(true);
          }, 500);
          
          return () => clearTimeout(timer);
        } else {
          setIsReady(true);
        }
      } else {
        setIsReady(true);
      }
    }
  }, [isLoading, isAuthenticated, user]);

  if (!isReady || isLoading) {
    return <AppLoader isLoading={true} />;
  }

  return <>{children}</>;
};
