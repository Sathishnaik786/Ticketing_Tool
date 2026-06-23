import { RouteObject } from 'react-router-dom';
import DailyStandupPage from './daily/DailyStandupPage';
import WeeklyStandoutPage from './weekly/WeeklyStandoutPage';
import MonthlyUpdatePage from './monthly/MonthlyUpdatePage';
import AnalyticsPage from './analytics/AnalyticsPage';
import AutomationPage from './automation/AutomationPage';
import EmployeeUpdatesPage from './EmployeeUpdatesPage';
import { guardFromMetadata } from '@/config/routeMetadata.utils';

// Feature Flag Checks
// Feature Flag Checks - Enabled by default if not explicitly disabled
const isDailyUpdatesEnabled = import.meta.env.VITE_ENABLE_DAILY_UPDATES !== 'false';
const isWeeklyUpdatesEnabled = import.meta.env.VITE_ENABLE_WEEKLY_UPDATES !== 'false';
const isMonthlyUpdatesEnabled = import.meta.env.VITE_ENABLE_MONTHLY_UPDATES !== 'false';
const isAnalyticsEnabled = import.meta.env.VITE_ENABLE_UPDATE_ANALYTICS !== 'false';
const isAutomationEnabled =
    import.meta.env.VITE_ENABLE_UPDATE_REMINDERS !== 'false' ||
    import.meta.env.VITE_ENABLE_AI_SUMMARIES !== 'false' ||
    import.meta.env.VITE_ENABLE_EXPORTS !== 'false';

const routes: RouteObject[] = [];

if (isDailyUpdatesEnabled) {
    routes.push({
        path: 'updates/daily',
        element: guardFromMetadata('/app/updates/daily', <DailyStandupPage />),
    });
}

if (isWeeklyUpdatesEnabled) {
    routes.push({
        path: 'updates/weekly',
        element: guardFromMetadata('/app/updates/weekly', <WeeklyStandoutPage />),
    });
}

if (isMonthlyUpdatesEnabled) {
    routes.push({
        path: 'updates/monthly',
        element: guardFromMetadata('/app/updates/monthly', <MonthlyUpdatePage />),
    });
}

if (isAnalyticsEnabled) {
    routes.push({
        path: 'updates/analytics',
        element: guardFromMetadata('/app/updates/analytics', <AnalyticsPage />),
    });
}

if (isAutomationEnabled) {
    routes.push({
        path: 'updates/automation',
        element: guardFromMetadata('/app/updates/automation', <AutomationPage />),
    });
}

routes.push({
    path: 'updates/employee/:employeeId',
    element: guardFromMetadata('/app/updates/employee/:employeeId', <EmployeeUpdatesPage />),
});

export const updatesRoutes: RouteObject[] = routes;

export default updatesRoutes;
