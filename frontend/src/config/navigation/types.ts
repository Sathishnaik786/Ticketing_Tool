import type { ElementType } from 'react';

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: ElementType;
  permissions?: string[];
  roles?: string[];
  badge?: 'count' | 'dot';
  featureFlag?: string;
  keywords?: string[];
  legacyGroup?: string;
  searchPriority?: number;
  legacyOnly?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  icon?: ElementType;
  items: NavItem[];
  defaultExpanded?: boolean;
  featureFlag?: string;
  roles?: string[];
  isLegacy?: boolean;
}
