import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import {
  clearAuthStorage,
  performLogout,
  setAuthTokens,
  tryRefreshSession,
} from '@/services/authSession';
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
  logout: () => Promise<void>;
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
        const response = await authApi.me();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          clearAuthStorage();
        }
      } catch (error: any) {
        if (error?.status === 401) {
          const refreshedToken = await tryRefreshSession();
          if (refreshedToken) {
            try {
              const retryResponse = await authApi.me();
              if (retryResponse.success && retryResponse.data?.user) {
                setUser(retryResponse.data.user);
                return;
              }
            } catch (retryError) {
              console.error('Error fetching user profile after refresh:', retryError);
            }
          }
        }

        console.error('Error fetching user profile:', error);
        clearAuthStorage();
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
        setAuthTokens(response.data.token, response.data.refresh_token);
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

  const logout = async () => {
    setUser(null);
    await performLogout(queryClient);
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