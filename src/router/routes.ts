/**
 * Route Definitions
 *
 * Central configuration for all application routes.
 * Match-context routes use /match/:matchUpId/:view pattern.
 * Non-match routes stay at top-level paths.
 */

import { getCurrentMatchUpId } from '../state/matchContext';

export interface RouteConfig {
  path: string;
  view: string;
  name: string;
  guard?: string;
  params?: Record<string, any>;
}

/** Maps URL view segments to internal viewManager view names */
export const VIEW_MAP: Record<string, string> = {
  scoring: 'entry',
  stats: 'stats',
  tree: 'gametree',
  momentum: 'momentum',
  history: 'pointhistory',
  details: 'matchdetails',
};

/** Views that require guards (guard name as value) */
export const GUARDED_VIEWS: Record<string, string> = {
  stats: 'hasPoints',
  tree: 'hasPoints',
  momentum: 'hasPoints',
};

/** Build a match-context path */
export function matchPath(matchUpId: string | null, view = 'scoring'): string {
  if (!matchUpId) return '/';
  return `/match/${matchUpId}/${view}`;
}

/** Non-match routes */
export const routes: RouteConfig[] = [
  {
    path: '/',
    view: 'welcome',
    name: 'root',
  },
  {
    path: '/archive',
    view: 'matcharchive',
    name: 'archive',
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
  return routes.find((route) => route.name === name);
}

/**
 * Get route by view name (for backward compatibility with viewManager)
 */
export function getRouteByView(view: string): RouteConfig | undefined {
  return routes.find((route) => route.view === view);
}

/**
 * Get route path by view name.
 * For match-context views, returns a path with the current matchUpId.
 */
export function getPathForView(view: string): string {
  // Check non-match routes first
  const route = getRouteByView(view);
  if (route) return route.path;

  // Check match-context views
  const urlSegment = Object.entries(VIEW_MAP).find(([, v]) => v === view)?.[0];
  if (urlSegment) {
    return matchPath(getCurrentMatchUpId(), urlSegment);
  }

  return '/';
}
