/**
 * Route Constants and Type Definitions
 * Centralizes route-related constants and type definitions
 */

// Route parameter types
export interface RouteParams {
  [key: string]: string | string[];
}

// Route query parameters
export interface RouteQuery {
  [key: string]: string | string[] | undefined;
}

// Route metadata
export interface RouteMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  requiresAuth?: boolean;
  requiredRoles?: string[];
}

// Extended route configuration
export interface ExtendedRouteConfig {
  path: string;
  element: React.ReactElement;
  index?: boolean;
  metadata?: RouteMetadata;
  children?: ExtendedRouteConfig[];
}

// Navigation item interface
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
  requiresAuth?: boolean;
  requiredRoles?: string[];
}

// Breadcrumb item
export interface BreadcrumbItem {
  label: string;
  path: string;
}

// Route change event
export interface RouteChangeEvent {
  from: string;
  to: string;
  params: RouteParams;
  query: RouteQuery;
}

// Animation directions for page transitions
export enum AnimationDirection {
  FORWARD = 'forward',
  BACKWARD = 'backward',
  SLIDE_LEFT = 'slide-left',
  SLIDE_RIGHT = 'slide-right',
}

// Route loading states
export enum RouteLoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Error types for routing
export enum RouteErrorType {
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown',
}

// Route error interface
export interface RouteError {
  type: RouteErrorType;
  message: string;
  code?: string | number;
  details?: any;
}

// Export commonly used route patterns
export const ROUTE_PATTERNS = {
  DYNAMIC_PAGE: '/:slug',
  CATEGORY_PAGE: '/category/:category',
  TAG_PAGE: '/tag/:tag',
  SEARCH_PAGE: '/search/:query',
  USER_PROFILE: '/profile/:userId',
  ADMIN_SECTION: '/admin/:section?',
  CMS_PAGE: '/cms/:page?',
};

// Export route validation schemas (for runtime validation)
export const ROUTE_SCHEMAS = {
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  userId: /^[a-zA-Z0-9_-]+$/,
  category: /^[a-zA-Z0-9_-]+$/,
  tag: /^[a-zA-Z0-9_-]+$/,
  query: /^[a-zA-Z0-9\s\-_]+$/,
} as const;

// Default route metadata
export const DEFAULT_ROUTE_METADATA: RouteMetadata = {
  requiresAuth: false,
  requiredRoles: [],
};

// Animation duration constants
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;