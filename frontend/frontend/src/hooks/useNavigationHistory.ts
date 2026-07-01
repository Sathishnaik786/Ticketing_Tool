import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface HistoryItem {
  path: string;
  title: string;
  timestamp: number;
}

const MAX_HISTORY = 10;
const STORAGE_KEY = 'ticketra_nav_history';
const LEGACY_STORAGE_KEYS = ['yvi_nav_history'] as const;

function readNavHistory(): HistoryItem[] {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return JSON.parse(current);
  } catch {
    // ignore corrupt storage
  }

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    try {
      const legacy = localStorage.getItem(legacyKey);
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy);
        return JSON.parse(legacy);
      }
    } catch {
      // ignore
    }
  }

  return [];
}

export function useNavigationHistory() {
  const location = useLocation();
  const [history, setHistory] = useState<HistoryItem[]>(readNavHistory);

  const addToHistory = useCallback((path: string, title: string) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.path !== path);
      const next = [{ path, title, timestamp: Date.now() }, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Effect to track navigation
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/app/')) {
      // Map common paths to readable titles
      const titles: Record<string, string> = {
        '/app/dashboard': 'Executive Dashboard',
        '/app/employees': 'Personnel Directory',
        '/app/attendance': 'Attendance Registry',
        '/app/leaves': 'Leave Management',
        '/app/payroll': 'Payroll Hub',
        '/app/payroll/cycles': 'Active Payroll Cycles',
        '/app/admin/users': 'System Orchestration',
        '/app/reports': 'Intelligence Reports',
        '/app/profile': 'Personal Identity Hub'
      };

      const title = titles[path] || path.split('/').pop()?.replace(/-/g, ' ') || 'Page';
      addToHistory(path, title);
    }
  }, [location.pathname, addToHistory]);

  return { history, addToHistory };
}
