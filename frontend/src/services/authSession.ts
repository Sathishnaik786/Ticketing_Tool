import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(accessToken: string, refreshToken?: string | null): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function supabaseSignOut(): Promise<void> {
  if (!supabase) {
    return;
  }

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn('Supabase signOut failed:', error);
  }
}

let refreshInFlight: Promise<string | null> | null = null;

export async function tryRefreshSession(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken || !supabase) {
    return null;
  }

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (error || !data.session?.access_token) {
        return null;
      }

      setAuthTokens(data.session.access_token, data.session.refresh_token);
      return data.session.access_token;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export async function performLogout(queryClient?: QueryClient): Promise<void> {
  clearAuthStorage();
  await supabaseSignOut();
  queryClient?.clear();
  window.location.href = '/login';
}
