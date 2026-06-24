import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommand } from '@/contexts/CommandContext';

export function useShortcuts() {
  const navigate = useNavigate();
  const { setIsOpen } = useCommand();

  useEffect(() => {
    let keys: string[] = [];
    let timer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

      // Single Key Shortcuts
      if (e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Sequential Shortcuts (G + ...)
      keys.push(e.key.toLowerCase());
      clearTimeout(timer);
      
      timer = setTimeout(() => {
        keys = [];
      }, 500);

      const sequence = keys.join('');

      if (sequence === 'gd') navigate('/app/dashboard');
      if (sequence === 'ge') navigate('/app/employees');
      if (sequence === 'ga') navigate('/app/attendance');
      if (sequence === 'gl') navigate('/app/leaves');
      if (sequence === 'gp') navigate('/app/payroll');
      if (sequence === 'gs') navigate('/app/payroll/settings');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, setIsOpen]);
}
