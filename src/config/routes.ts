export const routes = {
  // Rutas públicas
  public: {
    home: '/',
    login: '/login',
    register: '/register',
    qrAccess: '/qr-access',
  },

  // Rutas protegidas
  protected: {
    dashboard: '/dashboard',
    profile: '/user/profile',
    materials: '/materials',
    perks: '/perks',
    events: '/dashboard/events',
    users: '/dashboard/users',
    scan: '/scan',
  },

  // Rutas de API
  api: {
    auth: '/api/auth',
    user: '/api/user',
    events: '/api/events',
    perks: '/api/perks',
    access: '/api/access',
  },
} as const;

// Tipos para las rutas
export type PublicRoute = typeof routes.public[keyof typeof routes.public];
export type ProtectedRoute = typeof routes.protected[keyof typeof routes.protected];
export type ApiRoute = typeof routes.api[keyof typeof routes.api];

// Función para verificar si una ruta está protegida
export const isProtectedRoute = (path: string): boolean => {
  return Object.values(routes.protected).some(route => path.startsWith(route));
};

// Función para verificar si una ruta es una ruta de API
export const isApiRoute = (path: string): boolean => {
  return Object.values(routes.api).some(route => path.startsWith(route));
};

// Función para obtener la ruta de redirección después del login
export const getLoginRedirectPath = (path: string): string => {
  if (isProtectedRoute(path)) {
    return path;
  }
  return routes.protected.dashboard;
}; 