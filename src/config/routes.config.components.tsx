/**
 * Routes Configuration Components
 * Centralizes all route components for Fast refresh compatibility
 * and easier route management across the application.
 */

import { Suspense, ReactElement, ComponentType } from 'react';

/**
 * Loading fallback component for lazy-loaded routes
 */
export const LoadingFallback = (): ReactElement => (
  <div className="flex items-center justify-center p-8">
    <div className="w-6 h-6 rounded-full animate-spin border-2 border-blue-600 border-t-transparent"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

/**
 * Wrapper component for lazy-loaded pages with Suspense
 */
export const LazyRoute = ({ component: Component }: { component: React.LazyExoticComponent<ComponentType<any>> }): ReactElement => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);