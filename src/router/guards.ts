/**
 * Navigation Guards
 * 
 * Functions that determine whether navigation to a route should be allowed.
 * Guards can redirect to other routes or block navigation entirely.
 */

import { env } from '../state/env';

export interface GuardResult {
  allow: boolean;
  redirect?: string;
  message?: string;
}

export type NavigationGuard = (to: any, from: any) => GuardResult | boolean;

/**
 * Check if match has any points
 * Used to prevent navigation to stats/charts when no data exists
 */
export function hasPoints(): GuardResult {
  const points = env.engine.getState().history?.points || [];

  if (points.length === 0) {
    return {
      allow: false,
      redirect: 'scoring',
      message: 'No points recorded yet. Start scoring to view statistics.',
    };
  }

  return { allow: true };
}

/**
 * Check if match format can be changed
 * Format can only be changed before first point
 */
export function canChangeFormat(): GuardResult {
  const points = env.engine.getState().history?.points || [];

  if (points.length > 0) {
    return {
      allow: false,
      redirect: 'scoring',
      message: 'Cannot change format after points have been recorded.',
    };
  }

  return { allow: true };
}

/**
 * Check if match archive exists
 */
export function hasMatchArchive(): GuardResult {
  // This will be implemented when we have proper storage access
  return { allow: true };
}

/**
 * Registry of all guards
 */
export const guards: Record<string, NavigationGuard> = {
  hasPoints,
  canChangeFormat,
  hasMatchArchive,
};

/**
 * Execute a guard by name
 */
export function executeGuard(
  guardName: string,
  to: any,
  from: any
): GuardResult {
  const guard = guards[guardName];
  
  if (!guard) {
    console.warn(`Guard "${guardName}" not found`);
    return { allow: true };
  }
  
  const result = guard(to, from);
  
  // Normalize boolean return to GuardResult
  if (typeof result === 'boolean') {
    return { allow: result };
  }
  
  return result;
}
