import type { ElementType } from 'react';
import {
  ETMS_GROUP_ITEM_IDS,
  ETMS_NAV_GROUPS,
  LEGACY_GROUP_ORDER,
  LEGACY_NAV_GROUP_LABEL,
  NAV_ITEMS,
  resolveNavItems,
  type NavGroup,
  type NavItem,
} from './navigation';
import { isFeatureFlagEnabled, isEtmsNavigationEnabled } from './features';

export const SIDEBAR_SECTIONS_KEY = 'ticketra_sidebar_sections';
const LEGACY_SIDEBAR_KEYS = ['yvi_sidebar_sections', 'sidebar_sections'] as const;

type UserLike = { role?: string } | null | undefined;

/** SUPER_ADMIN and FINANCE are referenced in legacy nav — map to ADMIN for filtering. */
function normalizeRole(role?: string): string | undefined {
  if (!role) return undefined;
  if (role === 'SUPER_ADMIN' || role === 'FINANCE') return 'ADMIN';
  return role;
}

function roleAllowed(item: NavItem | NavGroup, user: UserLike): boolean {
  const roles = item.roles;
  if (!roles || roles.length === 0) return true;
  const userRole = normalizeRole(user?.role);
  if (!userRole) return false;
  return roles.some((role) => normalizeRole(role) === userRole);
}

function flagAllowed(item: { featureFlag?: string }): boolean {
  return isFeatureFlagEnabled(item.featureFlag);
}

export function filterNavItem(item: NavItem, user: UserLike): boolean {
  if (!flagAllowed(item)) return false;
  return roleAllowed(item, user);
}

export function filterNavGroup(group: NavGroup, user: UserLike): NavGroup | null {
  if (!flagAllowed(group)) return null;
  if (!roleAllowed(group, user)) return null;
  const items = group.items.filter((item) => filterNavItem(item, user));
  if (items.length === 0) return null;
  return { ...group, items };
}

export function filterNavGroups(groups: NavGroup[], user: UserLike): NavGroup[] {
  return groups
    .map((group) => filterNavGroup(group, user))
    .filter((group): group is NavGroup => group !== null);
}

/** Build ETMS-primary sidebar groups. */
export function buildEtmsNavGroups(): NavGroup[] {
  return ETMS_NAV_GROUPS.map((groupMeta) => {
    const itemIds = ETMS_GROUP_ITEM_IDS[groupMeta.id] ?? [];
    return {
      ...groupMeta,
      items: resolveNavItems(itemIds),
    };
  });
}

/** ETMS-only nav item ids excluded from legacy sidebar reconstruction. */
const ETMS_ONLY_ITEM_IDS = new Set([
  'tickets-mine',
  'tickets-team',
  'tickets-all',
  'tickets-create',
  'assignments-mine',
  'assignments-team',
  'assignments-workload',
  'approvals-pending',
  'approvals-approved',
  'approvals-rejected',
  'kb-articles',
  'kb-categories',
  'kb-search',
  'comms-chat',
  'comms-announcements',
  'comms-discussions',
  'analytics-sla',
  'admin-users',
  'admin-departments',
  'admin-roles',
  'admin-settings',
  'operator-dashboard',
  'legacy-payroll',
  'legacy-attendance',
  'legacy-leaves',
  'legacy-projects',
  'legacy-meetups',
  'legacy-updates',
  'legacy-reports',
  'legacy-documents',
]);

/** Reconstruct pre-transformation sidebar grouping from registry items. */
export function buildLegacyNavGroups(): NavGroup[] {
  const items = NAV_ITEMS.filter(
    (item) => item.legacyGroup && !item.legacyOnly && !ETMS_ONLY_ITEM_IDS.has(item.id)
  );

  const groupMap = new Map<string, NavItem[]>();
  for (const item of items) {
    const label = item.legacyGroup!;
    if (!groupMap.has(label)) groupMap.set(label, []);
    groupMap.get(label)!.push(item);
  }

  const orderedLabels = [
    ...LEGACY_GROUP_ORDER,
    ...Array.from(groupMap.keys()).filter((k) => !LEGACY_GROUP_ORDER.includes(k)),
  ];

  return orderedLabels
    .filter((label) => groupMap.has(label))
    .map((label) => ({
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      defaultExpanded: [
        'Executive Overview',
        'Workforce Intelligence',
        'Operational Cycles',
        'Governance & Compliance',
        'Financial Orchestration',
        'Predictive Analytics',
        'Personalized Portal',
        'Human Capital Management',
        'Strategic Assets',
        'Service Management',
      ].includes(label),
      items: groupMap.get(label)!,
    }));
}

export function getNavGroupsForMode(etmsNavigation: boolean): NavGroup[] {
  return etmsNavigation ? buildEtmsNavGroups() : buildLegacyNavGroups();
}

export function getDefaultExpandedSections(etmsNavigation: boolean): Record<string, boolean> {
  const groups = getNavGroupsForMode(etmsNavigation);
  const defaults: Record<string, boolean> = {};
  for (const group of groups) {
    defaults[group.label] = group.defaultExpanded !== false;
  }
  if (etmsNavigation) {
    defaults[LEGACY_NAV_GROUP_LABEL] = false;
  }
  return defaults;
}

/** One-time migration from legacy localStorage keys. */
export function loadSidebarExpandedSections(etmsNavigation: boolean): Record<string, boolean> {
  const defaults = getDefaultExpandedSections(etmsNavigation);

  try {
    const current = localStorage.getItem(SIDEBAR_SECTIONS_KEY);
    if (current) {
      return { ...defaults, ...JSON.parse(current) };
    }
  } catch {
    // ignore corrupt storage
  }

  for (const legacyKey of LEGACY_SIDEBAR_KEYS) {
    try {
      const legacy = localStorage.getItem(legacyKey);
      if (legacy) {
        const parsed = JSON.parse(legacy) as Record<string, boolean>;
        if ('Legacy EMS' in parsed) {
          parsed[LEGACY_NAV_GROUP_LABEL] = parsed['Legacy EMS'];
          delete parsed['Legacy EMS'];
        }
        const migrated = { ...defaults, ...parsed };
        localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch {
      // ignore
    }
  }

  return defaults;
}

export function saveSidebarExpandedSections(sections: Record<string, boolean>): void {
  localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(sections));
}

export function isNavItemActive(item: NavItem, pathname: string, search: string): boolean {
  const [path, query] = item.href.split('?');
  if (query) {
    const params = new URLSearchParams(query);
    const currentParams = new URLSearchParams(search);
    if (pathname !== path) return false;
    for (const [key, value] of params.entries()) {
      if (currentParams.get(key) !== value) return false;
    }
    return true;
  }
  if (pathname === path) return true;
  if (path !== '/app/dashboard' && pathname.startsWith(`${path}/`)) return true;
  return false;
}

export interface SearchRegistryItem {
  id: string;
  title: string;
  href: string;
  keywords: string[];
  priority: number;
  isLegacy: boolean;
  roles?: string[];
  featureFlag?: string;
}

export function buildNavigationRegistry() {
  return {
    items: NAV_ITEMS,
    etmsGroups: ETMS_NAV_GROUPS,
    etmsGroupItemIds: ETMS_GROUP_ITEM_IDS,
    legacyGroupOrder: LEGACY_GROUP_ORDER,
  };
}

/** Legacy alias item ids hidden in ETMS navigation/search mode. */
const ETMS_MODE_EXCLUDE_IDS = new Set([
  'tickets-legacy-list',
  'kb-legacy-home',
  'comms-legacy',
  'legacy-dashboard-inline',
  'legacy-payroll-control',
]);

/** Filter registry entries by active sidebar mode (avoids duplicate palette/search results). */
export function filterByNavMode<T extends { id: string }>(items: T[], etmsNavigation = isEtmsNavigationEnabled): T[] {
  if (etmsNavigation) {
    return items.filter(
      (item) =>
        !ETMS_MODE_EXCLUDE_IDS.has(item.id) &&
        !item.id.includes('-inline') &&
        !item.id.startsWith('legacy-payroll-') &&
        !item.id.startsWith('legacy-profile') &&
        !item.id.startsWith('legacy-payslips') &&
        !item.id.startsWith('legacy-deductions') &&
        !item.id.startsWith('legacy-employees') &&
        !item.id.startsWith('legacy-departments-inline') &&
        !item.id.startsWith('legacy-attendance-inline') &&
        !item.id.startsWith('legacy-leaves-inline') &&
        !item.id.startsWith('legacy-documents-inline') &&
        !item.id.startsWith('legacy-reports-inline') &&
        !item.id.startsWith('legacy-settings-inline') &&
        !item.id.startsWith('legacy-meetups-inline')
    );
  }
  return items.filter((item) => !ETMS_ONLY_ITEM_IDS.has(item.id));
}

export function buildSearchRegistry(etmsNavigation = isEtmsNavigationEnabled): SearchRegistryItem[] {
  const items = filterByNavMode(
    NAV_ITEMS.filter((item) => !item.id.includes('-inline') && !item.id.includes('-legacy-')),
    etmsNavigation
  );
  return items
    .map((item) => ({
      id: item.id,
      title: item.title,
      href: item.href,
      keywords: item.keywords ?? [],
      priority: item.searchPriority ?? 60,
      isLegacy: Boolean(item.legacyOnly),
      roles: item.roles,
      featureFlag: item.featureFlag,
    }))
    .sort((a, b) => a.priority - b.priority);
}

export interface CommandRegistryItem {
  id: string;
  title: string;
  category: string;
  href: string;
  priority: number;
  isLegacy: boolean;
  roles?: string[];
  featureFlag?: string;
  icon?: ElementType;
}

export function buildCommandRegistry(etmsNavigation = isEtmsNavigationEnabled): CommandRegistryItem[] {
  const actionItems: CommandRegistryItem[] = [
    {
      id: 'cmd-create-ticket',
      title: 'Create Ticket',
      category: 'Actions',
      href: '/app/tickets/new',
      priority: 1,
      isLegacy: false,
      featureFlag: 'VITE_ENABLE_TICKETING',
    },
    {
      id: 'cmd-my-tickets',
      title: 'My Tickets',
      category: 'Navigation',
      href: '/app/tickets?scope=mine',
      priority: 2,
      isLegacy: false,
      featureFlag: 'VITE_ENABLE_TICKETING',
    },
    {
      id: 'cmd-my-queue',
      title: 'My Queue',
      category: 'Navigation',
      href: '/app/my-queue',
      priority: 3,
      isLegacy: false,
      featureFlag: 'VITE_ENABLE_TICKET_ASSIGNMENTS',
    },
    {
      id: 'cmd-notifications',
      title: 'Notifications',
      category: 'Navigation',
      href: '/app/notifications',
      priority: 4,
      isLegacy: false,
      featureFlag: 'VITE_ENABLE_NOTIFICATION_CENTER',
    },
    {
      id: 'cmd-kb-search',
      title: 'Knowledge Base',
      category: 'Navigation',
      href: '/app/knowledge-base',
      priority: 5,
      isLegacy: false,
      featureFlag: 'VITE_ENABLE_KNOWLEDGE_BASE',
    },
  ];

  const navItems = buildSearchRegistry(etmsNavigation).map((item) => ({
    id: `cmd-${item.id}`,
    title: item.title,
    category: item.isLegacy ? LEGACY_NAV_GROUP_LABEL : 'Navigation',
    href: item.href,
    priority: item.priority,
    isLegacy: item.isLegacy,
    roles: item.roles,
    featureFlag: item.featureFlag,
  }));

  const merged = [...actionItems, ...navItems];
  const seen = new Set<string>();
  return merged
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => a.priority - b.priority);
}

export function filterCommandRegistry(
  items: CommandRegistryItem[],
  user: UserLike,
  query?: string,
  etmsNavigation = isEtmsNavigationEnabled
): CommandRegistryItem[] {
  let filtered = filterByNavMode(items, etmsNavigation).filter((item) => {
    if (!flagAllowed(item)) return false;
    if (!roleAllowed(item, user)) return false;
    return true;
  });

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }

  return filtered;
}

export function filterSearchRegistry(
  items: SearchRegistryItem[],
  user: UserLike,
  query?: string,
  etmsNavigation = isEtmsNavigationEnabled
): SearchRegistryItem[] {
  let filtered = filterByNavMode(items, etmsNavigation).filter((item) => {
    if (!flagAllowed(item)) return false;
    if (!roleAllowed(item, user)) return false;
    return true;
  });

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }

  // ETMS items first, legacy ranked lower
  return filtered.sort((a, b) => {
    if (a.isLegacy !== b.isLegacy) return a.isLegacy ? 1 : -1;
    return a.priority - b.priority;
  });
}

/** Breadcrumb segments from pathname. */
export function buildBreadcrumbs(pathname: string, search: string, groups: NavGroup[]): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: 'Dashboard', href: '/app/dashboard' }];

  for (const group of groups) {
    for (const item of group.items) {
      if (isNavItemActive(item, pathname, search)) {
        if (group.isLegacy) {
          crumbs.push({ label: LEGACY_NAV_GROUP_LABEL });
        }
        crumbs.push({ label: group.label });
        crumbs.push({ label: item.title, href: item.href });
        return crumbs;
      }
    }
  }

  const segment = pathname.split('/').filter(Boolean).pop();
  if (segment) crumbs.push({ label: segment.replace(/-/g, ' ') });
  return crumbs;
}

export type { NavGroup, NavItem };
