export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  description?: string;
  badge?: string | number;
  children?: NavigationItem[];
  external?: boolean;
  requiresAuth?: boolean;
  order: number;
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
  order: number;
}

// Main navigation configuration
export const mainNavigation: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: '🏠',
    description: 'Welcome to our community',
    order: 1
  },
  {
    id: 'stories',
    label: 'Stories',
    path: '/stories',
    icon: '📚',
    description: 'Community stories and experiences',
    order: 2
  },
  {
    id: 'news',
    label: 'News',
    path: '/news',
    icon: '📰',
    description: 'Latest updates and announcements',
    order: 3
  },
  {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
    icon: '📞',
    description: 'Get in touch with us',
    order: 4
  }
];

// Learn/Educational section
export const learnNavigation: NavigationItem[] = [
  {
    id: 'spiritual',
    label: 'Spiritual',
    path: '/spiritual',
    icon: '🙏',
    description: 'Spiritual growth and guidance',
    order: 1
  },
  {
    id: 'philosophy',
    label: 'Philosophy',
    path: '/philosophy',
    icon: '🧠',
    description: 'Philosophical insights and wisdom',
    order: 2
  },
  {
    id: 'culture',
    label: 'Culture',
    path: '/culture',
    icon: '🏺',
    description: 'Cultural heritage and traditions',
    order: 3
  },
  {
    id: 'resources',
    label: 'Resources',
    path: '/resources',
    icon: '📖',
    description: 'Educational materials and resources',
    order: 4
  }
];

// Community/Action section
export const communityNavigation: NavigationItem[] = [
  {
    id: 'about',
    label: 'About Us',
    path: '/about',
    icon: '🏛️',
    description: 'Learn about our mission and values',
    order: 1
  },
  {
    id: 'programs',
    label: 'Programs',
    path: '/programs',
    icon: '🎓',
    description: 'Our programs and initiatives',
    order: 2
  },
  {
    id: 'membership',
    label: 'Membership',
    path: '/membership',
    icon: '👥',
    description: 'Join our community',
    order: 3
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    path: '/volunteer',
    icon: '💪',
    description: 'Volunteer opportunities',
    order: 4
  },
  {
    id: 'partnership',
    label: 'Partnership',
    path: '/partnership',
    icon: '🤝',
    description: 'Partner with us',
    order: 5
  }
];

// Support section
export const supportNavigation: NavigationItem[] = [
  {
    id: 'donate',
    label: 'Donate',
    path: '/donate',
    icon: '💝',
    description: 'Support our cause',
    order: 1
  },
  {
    id: 'get-involved',
    label: 'Get Involved',
    path: '/get-involved',
    icon: '🤝',
    description: 'Ways to contribute',
    order: 2
  }
];

// Mobile bottom navigation - curated for mobile
export const mobileBottomNavigation: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: '🏠',
    order: 1
  },
  {
    id: 'spiritual',
    label: 'Spiritual',
    path: '/spiritual',
    icon: '🙏',
    order: 2
  },
  {
    id: 'philosophy',
    label: 'Philosophy',
    path: '/philosophy',
    icon: '🧠',
    order: 3
  },
  {
    id: 'resources',
    label: 'Resources',
    path: '/resources',
    icon: '📖',
    order: 4
  }
];

// Mobile menu items - comprehensive
export const mobileMenuNavigation: NavigationSection[] = [
  {
    id: 'main',
    title: 'Main',
    items: mainNavigation,
    order: 1
  },
  {
    id: 'learn',
    title: 'Learn',
    items: learnNavigation,
    order: 2
  },
  {
    id: 'community',
    title: 'Community',
    items: communityNavigation,
    order: 3
  },
  {
    id: 'support',
    title: 'Support',
    items: supportNavigation,
    order: 4
  }
];

// Desktop sections
export const desktopNavigationSections: NavigationSection[] = [
  {
    id: 'main',
    title: 'Main Navigation',
    items: mainNavigation,
    order: 1
  },
  {
    id: 'learn',
    title: 'Learn',
    items: learnNavigation,
    order: 2
  }
];

// Admin/CMS navigation
export const adminNavigation: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
    icon: '📊',
    description: 'Admin dashboard',
    order: 1,
    requiresAuth: true
  },
  {
    id: 'cms',
    label: 'CMS',
    path: '/cms',
    icon: '⚙️',
    description: 'Content management',
    order: 2,
    requiresAuth: true
  },
  {
    id: 'users',
    label: 'User Management',
    path: '/user-management',
    icon: '👤',
    description: 'Manage users',
    order: 3,
    requiresAuth: true
  }
];

// Quick actions
export const quickActions = [
  {
    id: 'emergency',
    label: 'Emergency',
    action: 'tel:+250788310932',
    icon: '📞',
    color: 'red'
  },
  {
    id: 'chat',
    label: 'Chat',
    action: '/chat',
    icon: '💬',
    color: 'blue'
  },
  {
    id: 'contact',
    label: 'Contact',
    action: '/contact',
    icon: '✉️',
    color: 'green'
  },
  {
    id: 'donate',
    label: 'Donate',
    action: '/donate',
    icon: '💝',
    color: 'purple'
  }
];

// Helper functions
export const getNavigationBySection = (sectionId: string): NavigationItem[] => {
  switch (sectionId) {
    case 'main':
      return mainNavigation;
    case 'learn':
      return learnNavigation;
    case 'community':
      return communityNavigation;
    case 'support':
      return supportNavigation;
    default:
      return [];
  }
};

export const getMobileMenuSection = (sectionId: string): NavigationSection | undefined => {
  return mobileMenuNavigation.find(section => section.id === sectionId);
};

export const getAllNavigationItems = (): NavigationItem[] => {
  return [
    ...mainNavigation,
    ...learnNavigation,
    ...communityNavigation,
    ...supportNavigation,
    ...adminNavigation
  ];
};

export const findNavigationItem = (path: string): NavigationItem | undefined => {
  const allItems = getAllNavigationItems();
  return allItems.find(item => item.path === path);
};

export const getBreadcrumbItems = (pathname: string): NavigationItem[] => {
  const currentItem = findNavigationItem(pathname);
  if (!currentItem) return [];
  
  // For now, return just the current item
  // In a full implementation, you might build a hierarchy
  return [currentItem];
};

export default {
  mainNavigation,
  learnNavigation,
  communityNavigation,
  supportNavigation,
  mobileBottomNavigation,
  mobileMenuNavigation,
  desktopNavigationSections,
  adminNavigation,
  quickActions,
  getNavigationBySection,
  getMobileMenuSection,
  getAllNavigationItems,
  findNavigationItem,
  getBreadcrumbItems
};