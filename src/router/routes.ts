/**
 * Route Definitions
 * 
 * Central configuration for all application routes.
 * Maps URL paths to view names and defines navigation guards.
 */

export interface RouteConfig {
  path: string;
  view: string;
  name: string;
  guard?: string;
  params?: Record<string, any>;
}

/**
 * Main application routes
 * Maps to viewManager view names during transition period
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    view: 'mainmenu',
    name: 'menu',
  },
  {
    path: '/menu',
    view: 'mainmenu',
    name: 'menu-explicit',
  },
  {
    path: '/scoring',
    view: 'entry',
    name: 'scoring',
  },
  {
    path: '/match/:matchId',
    view: 'entry',
    name: 'match-load',
    // Will load specific match from archive
  },
  {
    path: '/stats',
    view: 'stats',
    name: 'stats',
    guard: 'hasPoints',
  },
  {
    path: '/tree',
    view: 'gametree',
    name: 'tree',
    guard: 'hasPoints',
  },
  {
    path: '/momentum',
    view: 'momentum',
    name: 'momentum',
    guard: 'hasPoints',
  },
  {
    path: '/history',
    view: 'pointhistory',
    name: 'history',
  },
  {
    path: '/archive',
    view: 'matcharchive',
    name: 'archive',
  },
  {
    path: '/format',
    view: 'matchformat',
    name: 'format',
  },
  {
    path: '/details',
    view: 'matchdetails',
    name: 'details',
  },
  {
    path: '/settings',
    view: 'settings',
    name: 'settings',
  },
  {
    path: '/welcome',
    view: 'welcome',
    name: 'welcome',
  },
];

/**
 * Get route by name
 */
export function getRouteByName(name: string): RouteConfig | undefined {
  return routes.find(route => route.name === name);
}

/**
 * Get route by view name (for backward compatibility with viewManager)
 */
export function getRouteByView(view: string): RouteConfig | undefined {
  return routes.find(route => route.view === view);
}

/**
 * Get route path by view name
 */
export function getPathForView(view: string): string {
  const route = getRouteByView(view);
  return route?.path || '/';
}
