import { MessageSquare, Activity, BarChart3 } from 'lucide-react';
import { isCommunicationTrackingEnabled } from '@/config/features';

export const communicationTrackingNavGroups = isCommunicationTrackingEnabled
  ? [
      {
        label: 'Communications',
        items: [
          { title: 'Communications', href: '/app/communications', icon: MessageSquare },
          { title: 'Activity Timeline', href: '/app/activity-timeline', icon: Activity },
          { title: 'Communication Analytics', href: '/app/communication-analytics', icon: BarChart3 },
        ],
      },
    ]
  : [];
