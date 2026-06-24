import { isTicketFeedbackEnabled } from '@/config/features';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeFeedbackWidget } from './EmployeeFeedbackWidget';
import { ManagerCsatWidget } from './ManagerCsatWidget';
import { AdminCsatWidget } from './AdminCsatWidget';

export function TicketFeedbackDashboardWidgets() {
  const { user } = useAuth();

  if (!isTicketFeedbackEnabled || !user) {
    return null;
  }

  if (user.role === 'EMPLOYEE') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <EmployeeFeedbackWidget />
      </div>
    );
  }

  if (user.role === 'MANAGER') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <ManagerCsatWidget />
      </div>
    );
  }

  if (user.role === 'ADMIN' || user.role === 'HR') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <AdminCsatWidget />
      </div>
    );
  }

  return null;
}
