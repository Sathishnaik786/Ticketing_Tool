import { observability } from './observability.service';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

export function trackEvent(event: AnalyticsEvent): void {
  observability.captureMessage(`analytics:${event.name}`, {
    level: 'info',
    extra: event.properties,
  });
}

export function trackPageView(path: string): void {
  trackEvent({ name: 'page_view', properties: { path } });
}

export function trackInteraction(component: string, action: string): void {
  trackEvent({ name: 'interaction', properties: { component, action } });
}
