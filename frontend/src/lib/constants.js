export const ROLES = {
  MANAGER: 'RESORT_MANAGER',
  OPS: 'OPERATIONS_MANAGER',
  GUEST: 'GUEST',
};

export const ROLE_HOME = {
  RESORT_MANAGER: '/manager/dashboard',
  OPERATIONS_MANAGER: '/operations/dashboard',
  GUEST: '/guest/home',
};

export const FEATURE_FLAGS = {
  SHOW_P1_NAV: true,
};

export const NAV_ITEMS = {
  RESORT_MANAGER: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: 'LayoutDashboard', isP1: false },
    { label: 'Forecast', path: '/manager/forecast', icon: 'TrendingUp', isP1: false },
    { label: 'Recommendations', path: '/manager/recommendations', icon: 'Sparkles', isP1: false },
    { label: 'Pricing', path: '/manager/pricing', icon: 'DollarSign', isP1: true },
    { label: 'Sentiment', path: '/manager/sentiment', icon: 'MessageSquare', isP1: true },
  ],
  OPERATIONS_MANAGER: [
    { label: 'Dashboard', path: '/operations/dashboard', icon: 'LayoutDashboard', isP1: false },
    { label: 'Guests', path: '/operations/guests', icon: 'Users', isP1: false },
    { label: 'Cancellation Risk', path: '/operations/cancellations', icon: 'AlertTriangle', isP1: false },
    { label: 'Staffing', path: '/operations/staffing', icon: 'UserCheck', isP1: true },
    { label: 'Service Requests', path: '/operations/requests', icon: 'ClipboardList', isP1: true },
  ],
};
