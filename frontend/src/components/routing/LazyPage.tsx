import React, { lazy, Suspense, type ComponentType } from 'react';
import { AppLoader } from '@/components/common/AppLoader';

export function lazyPage<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(factory);
}

export function withPageSuspense(element: React.ReactNode) {
  return <Suspense fallback={<AppLoader isLoading />}>{element}</Suspense>;
}

