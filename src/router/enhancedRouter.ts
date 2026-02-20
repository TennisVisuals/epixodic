/**
 * Enhanced Router
 *
 * Wraps Navigo with additional features:
 * - Match-context routes: /match/:matchUpId/:view
 * - Page components (ViewPage subclasses) for all views
 * - Navigation guards
 * - Route parameter handling
 * - History management
 */

import Navigo from 'navigo';
import { routes, VIEW_MAP, GUARDED_VIEWS, matchPath, getPathForView } from './routes';
import { executeGuard } from './guards';
import { getCurrentMatchUpId, isMatchLoaded } from '../state/matchContext';
import { loadMatch } from '../match/loadMatch';
import { resetButtons, swapServer, visibleButtons } from '../display/displayUpdate';
import { strokeSlider } from '../events/strokeSlider';
import { env, options } from '../state/env';

import { GameTreePage } from '../pages/GameTreePage';
import { StatsPage } from '../pages/StatsPage';
import { MomentumPage } from '../pages/MomentumPage';
import { PointHistoryPage } from '../pages/PointHistoryPage';
import { MatchArchivePage } from '../pages/MatchArchivePage';
import { DetailsPage } from '../pages/DetailsPage';
import { EntryPage } from '../pages/EntryPage';
import { WelcomePage } from '../pages/WelcomePage';
import type { ViewPage } from '../pages/ViewPage';

export class EnhancedRouter {
  private navigo: Navigo;
  private currentRoute: string = '/';
  private isNavigating: boolean = false;
  private currentPage: ViewPage | null = null;
  private pageComponents: Map<string, new () => ViewPage> = new Map();

  /**
   * Get current page instance (for updates from external events)
   */
  getCurrentPage(): ViewPage | null {
    return this.currentPage;
  }

  constructor() {
    const useHash = true;
    this.navigo = new Navigo(useHash ? '/' : '/', {
      hash: useHash,
    });

    this.registerPageComponents();
    this.setupRoutes();
  }

  /**
   * Register all page components by their internal view names
   */
  private registerPageComponents() {
    this.pageComponents.set('gametree', GameTreePage);
    this.pageComponents.set('stats', StatsPage);
    this.pageComponents.set('momentum', MomentumPage);
    this.pageComponents.set('pointhistory', PointHistoryPage);
    this.pageComponents.set('matcharchive', MatchArchivePage);
    this.pageComponents.set('matchdetails', DetailsPage);
    this.pageComponents.set('entry', EntryPage);
    this.pageComponents.set('welcome', WelcomePage);
  }

  /**
   * Setup all routes
   */
  private setupRoutes() {
    // Match-context routes: /match/:matchUpId/:view and /match/:matchUpId
    this.navigo.on('/match/:matchUpId/:view', (match) => {
      this.handleMatchRoute(match);
    });

    this.navigo.on('/match/:matchUpId', (match) => {
      this.handleMatchRoute(match);
    });

    // Non-match routes
    routes.forEach((route) => {
      this.navigo.on(route.path, (params) => {
        this.handleNavigation(route.path, route.view, route.guard, params);
      });
    });

    // 404 handler
    this.navigo.notFound(() => {
      this.navigate('/welcome');
    });
  }

  /**
   * Handle match-context route: /match/:matchUpId/:view?
   */
  private async handleMatchRoute(match: any) {
    if (this.isNavigating) return;

    const matchUpId = match?.data?.matchUpId;
    const viewSegment = match?.data?.view || 'scoring';
    const internalView = VIEW_MAP[viewSegment] || 'entry';

    if (!matchUpId) {
      this.navigate('/archive');
      return;
    }

    // Load match if not already loaded
    if (!isMatchLoaded(matchUpId)) {
      const success = loadMatch(matchUpId);
      if (!success) {
        this.navigate('/archive');
        return;
      }
      swapServer();
      resetButtons();
      visibleButtons();
    }

    // Check guard
    const guardName = GUARDED_VIEWS[viewSegment];
    if (guardName) {
      const guardResult = executeGuard(guardName, { path: match.url, view: internalView }, { path: this.currentRoute });
      if (!guardResult.allow) {
        if (guardResult.message) {
          console.warn(guardResult.message);
        }
        this.navigate(matchPath(matchUpId, 'scoring'));
        return;
      }
    }

    this.currentRoute = `/match/${matchUpId}/${viewSegment}`;
    await this.mountPageComponent(internalView);
  }

  /**
   * Handle non-match navigation with guards
   */
  private async handleNavigation(path: string, view: string, guardName?: string, params?: any) {
    if (this.isNavigating) return;

    if (guardName) {
      const guardResult = executeGuard(guardName, { path, view, params }, { path: this.currentRoute });

      if (!guardResult.allow) {
        if (guardResult.message) {
          console.warn(guardResult.message);
        }
        if (guardResult.redirect) {
          this.navigate(guardResult.redirect);
        }
        return;
      }
    }

    this.currentRoute = path;
    await this.mountPageComponent(view);
  }

  /**
   * Hide all known view containers as a clean slate before showing a new view
   */
  private hideAllViews() {
    const containerIds = [
      'pointhistory',
      'matcharchive',
      'welcome',
      'matchdetails',
      'statsscreen',
      'momentum',
      'pts',
      'gametree',
      'gamefish',
      'toolbar',
    ];

    // Also hide the dynamic entry view containers
    if (options.horizontal_view) containerIds.push(options.horizontal_view);
    if (options.vertical_view) containerIds.push(options.vertical_view);

    for (const id of containerIds) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    }
  }

  /**
   * Mount a page component for the given view
   */
  private async mountPageComponent(view: string) {
    this.isNavigating = true;

    try {
      // Hide stroke slider on every view change
      strokeSlider();

      // Unmount current page
      if (this.currentPage) {
        await this.currentPage.unmount();
        this.currentPage = null;
      }

      // Hide all views for a clean slate
      this.hideAllViews();

      // Get the page component constructor
      const PageComponent = this.pageComponents.get(view);
      if (!PageComponent) {
        console.warn(`No page component registered for view: ${view}`);
        return;
      }

      // Create and mount the new page
      const page = new PageComponent();
      await page.mount();

      this.currentPage = page;
      env.view = view;
    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * Navigate to a path
   */
  navigate(path: string, _options?: any) {
    this.navigo.navigate(path);
  }

  /**
   * Navigate by view name (backward compatibility)
   */
  navigateToView(view: string, _params?: any) {
    const path = getPathForView(view);
    this.navigate(path);
  }

  /**
   * Go back in history
   */
  back() {
    window.history.back();
  }

  /**
   * Start the router and restore state from URL
   */
  start() {
    const hash = window.location.hash || '';

    // Explicit route (e.g. #/match/123/scoring, #/archive, #/settings)
    if (/^#\/.+/.test(hash)) {
      this.navigo.resolve();
      return;
    }

    // Root URL (no hash, #, or #/) — always show the landing page
    this.navigate('/welcome');
  }

  /**
   * Update URL without triggering navigation
   */
  updateURL(path: string) {
    const fullPath = path.startsWith('#') ? path : `#${path}`;
    window.history.replaceState(null, '', fullPath);
  }

  /**
   * Sync URL with current view (called externally if needed)
   */
  syncUrl(view: string) {
    if (this.isNavigating) return;

    const path = getPathForView(view);
    if (path && path !== this.currentRoute) {
      this.currentRoute = path;
      window.history.pushState({}, '', `#${path}`);
    }
  }

  /**
   * Get current route path
   */
  getCurrentPath(): string {
    return this.currentRoute;
  }

  /**
   * Check if a page component exists for a view
   */
  hasPageComponent(view: string): boolean {
    return this.pageComponents.has(view);
  }

  /**
   * Re-activate the current page (e.g. after orientation change)
   */
  async refreshCurrentView() {
    if (this.currentPage) {
      await this.currentPage.unmount();
      await this.currentPage.mount();
    }
  }
}

// Export singleton instance
export const router = new EnhancedRouter();
