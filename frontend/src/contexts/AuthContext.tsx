import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { Role } from '@/types';

interface AuthUser {
  id: string;
  email: string | null;
  role: Role;
  profile_image?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  hasRole: (role: string | string[]) => boolean;
  updateProfileImage: (image: string) => void;
  refreshProfileImage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileRequestPromiseRef = useRef<Promise<any> | null>(null);
  const queryClient = useQueryClient();


  // Check if user is already logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    // Prevent duplicate requests by returning the existing promise if one is in flight
    if (profileRequestPromiseRef.current) {
      return profileRequestPromiseRef.current;
    }

    const requestPromise = (async () => {
      try {
        setIsLoading(true);
        // Use the me() endpoint to get user profile
        const response = await authApi.me();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          // If me() endpoint doesn't exist or fails, clear token
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Clear token if there's an error
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
        // Clear the reference after the request completes
        profileRequestPromiseRef.current = null;
      }
    })();

    // Store the promise reference to prevent duplicate requests
    profileRequestPromiseRef.current = requestPromise;

    return requestPromise;
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        await fetchUserProfile();
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfileImage = (image: string) => {
    if (user) {
      setUser({
        ...user,
        profile_image: image,
      });
    }
  };

  const refreshProfileImage = async () => {
    if (!user) return;

    try {
      // Fetch fresh profile data with signed URL from backend
      const response = await authApi.me();
      if (response.success && response.data?.user) {
        const updatedUser = response.data.user;
        // Only update if profile_image actually changed to prevent unnecessary re-renders
        if (updatedUser.profile_image !== user.profile_image) {
          setUser({
            ...user,
            profile_image: updatedUser.profile_image,
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing profile image:', error);
      // Don't throw - fail silently to avoid breaking the UI
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole: (role: string | string[]) => {
      if (Array.isArray(role)) {
        return role.includes(user?.role || '');
      }
      return user?.role === role;
    },
    updateProfileImage,
    refreshProfileImage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};