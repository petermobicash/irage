/**
 * Routes Configuration Constants
 * Centralizes all route definitions for better maintainability
 * and easier route management across the application.
 */

import React from 'react';
import { ROUTES } from './app.config';

// Route configuration interface
export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  index?: boolean;
}

// Lazy load all page components for optimal performance
const Home = React.lazy(() => import('../pages/Home'));
const About = React.lazy(() => import('../pages/About'));
const Spiritual = React.lazy(() => import('../pages/Spiritual'));
const Philosophy = React.lazy(() => import('../pages/Philosophy'));
const Culture = React.lazy(() => import('../pages/Culture'));
const Programs = React.lazy(() => import('../pages/Programs'));
const GetInvolved = React.lazy(() => import('../pages/GetInvolved'));
const Membership = React.lazy(() => import('../pages/Membership'));
const Volunteer = React.lazy(() => import('../pages/Volunteer'));
const Donate = React.lazy(() => import('../pages/Donate'));
const Partnership = React.lazy(() => import('../pages/Partnership'));
const Resources = React.lazy(() => import('../pages/Resources'));
const News = React.lazy(() => import('../pages/News'));
const Contact = React.lazy(() => import('../pages/Contact'));
const Admin = React.lazy(() => import('../pages/Admin'));
const CMSPage = React.lazy(() => import('../pages/CMS'));
const SystemTest = React.lazy(() => import('../pages/SystemTest'));
const ContentGuide = React.lazy(() => import('../pages/ContentGuide'));
const DeploymentGuide = React.lazy(() => import('../pages/DeploymentGuide'));
const ChatDemo = React.lazy(() => import('../pages/ChatDemo'));
const WhatsAppChatDemo = React.lazy(() => import('../pages/WhatsAppChatDemo'));
const AdvancedFeatures = React.lazy(() => import('../pages/AdvancedFeatures'));
const PublicChat = React.lazy(() => import('../pages/PublicChat'));
const Stories = React.lazy(() => import('../pages/Stories'));
const UserManagement = React.lazy(() => import('../pages/UserManagement'));
const Privacy = React.lazy(() => import('../pages/Privacy'));
const DynamicPage = React.lazy(() => import('../pages/DynamicPage'));

/**
 * Public routes configuration
 * These routes are accessible to all users without authentication
 */
export const publicRoutes: RouteConfig[] = [
  { path: ROUTES.HOME, element: React.createElement(Home), index: true },
  { path: ROUTES.ABOUT, element: React.createElement(About) },
  { path: ROUTES.SPIRITUAL, element: React.createElement(Spiritual) },
  { path: ROUTES.PHILOSOPHY, element: React.createElement(Philosophy) },
  { path: ROUTES.CULTURE, element: React.createElement(Culture) },
  { path: ROUTES.PROGRAMS, element: React.createElement(Programs) },
  { path: ROUTES.GET_INVOLVED, element: React.createElement(GetInvolved) },
  { path: ROUTES.MEMBERSHIP, element: React.createElement(Membership) },
  { path: ROUTES.VOLUNTEER, element: React.createElement(Volunteer) },
  { path: ROUTES.DONATE, element: React.createElement(Donate) },
  { path: ROUTES.PARTNERSHIP, element: React.createElement(Partnership) },
  { path: ROUTES.RESOURCES, element: React.createElement(Resources) },
  { path: ROUTES.NEWS, element: React.createElement(News) },
  { path: ROUTES.CONTACT, element: React.createElement(Contact) },
  { path: ROUTES.ADMIN, element: React.createElement(Admin) },
  { path: ROUTES.ADMIN_LOGIN, element: React.createElement(Admin) },
  { path: ROUTES.DYNAMIC_PAGE, element: React.createElement(DynamicPage) },
  { path: ROUTES.SYSTEM_TEST, element: React.createElement(SystemTest) },
  { path: ROUTES.CONTENT_GUIDE, element: React.createElement(ContentGuide) },
  { path: ROUTES.DEPLOYMENT_GUIDE, element: React.createElement(DeploymentGuide) },
  { path: ROUTES.CHAT_DEMO, element: React.createElement(ChatDemo) },
  { path: ROUTES.WHATSAPP_CHAT_DEMO, element: React.createElement(WhatsAppChatDemo) },
  { path: ROUTES.CHAT, element: React.createElement(PublicChat) },
  { path: ROUTES.ADVANCED_FEATURES, element: React.createElement(AdvancedFeatures) },
  { path: ROUTES.STORIES, element: React.createElement(Stories) },
  { path: ROUTES.USER_MANAGEMENT, element: React.createElement(UserManagement) },
  { path: ROUTES.PRIVACY, element: React.createElement(Privacy) },
];

/**
 * CMS route configuration
 * Separate route for CMS without header/footer
 */
export const cmsRoute: RouteConfig = {
  path: ROUTES.CMS,
  element: React.createElement(CMSPage),
};