/**
 * Enhanced Router
 *
 * Wraps Navigo with additional features:
 * - Integration with viewManager (during transition)
 * - Navigation guards
 * - Route parameter handling
 * - History management
 */

import Navigo from 'navigo';
import { routes, getPathForView } from './routes';
import { executeGuard } from './guards';
import { viewManager } from '../display/viewManager';

// Import page components
import { GameTreePage } from '../pages/GameTreePage';
import { StatsPage } from '../pages/StatsPage';
import { MomentumPage } from '../pages/MomentumPage';
import { PointHistoryPage } from '../pages/PointHistoryPage';
import { MatchArchivePage } from '../pages/MatchArchivePage';
import { SettingsPage } from '../pages/SettingsPage';
import { MainMenuPage } from '../pages/MainMenuPage';
import { FormatPage } from '../pages/FormatPage';
import { DetailsPage } from '../pages/DetailsPage';

export class EnhancedRouter {
  private navigo: Navigo;
  private currentRoute: string = '/';
  private isNavigating: boolean = false;
  private currentPage: any = null; // Current page component instance
  private pageComponents: Map<string, any> = new Map(); // Page component registry

  /**
   * Get current page instance (for updates from external events)
   */
  getCurrentPage(): any {
    return this.currentPage;
  }

  constructor() {
    // Initialize Navigo with hash-based routing
    const useHash = true;
    this.navigo = new Navigo(useHash ? '/' : '/', {
      hash: useHash,
    });

    this.registerPageComponents();
    this.setupRoutes();
  }

  /**
   * Register page components for views
   * PHASE 3: As we create page components, add them here
   */
  private registerPageComponents() {
    // Phase 4-5: Page components implemented
    this.pageComponents.set('gametree', GameTreePage);
    this.pageComponents.set('stats', StatsPage);
    this.pageComponents.set('momentum', MomentumPage);
    this.pageComponents.set('pointhistory', PointHistoryPage);
    this.pageComponents.set('matcharchive', MatchArchivePage);
    this.pageComponents.set('settings', SettingsPage);
    this.pageComponents.set('mainmenu', MainMenuPage);
    this.pageComponents.set('matchformat', FormatPage);
    this.pageComponents.set('matchdetails', DetailsPage);

    // TODO: Only ScoringPage remains (most complex - court view with touch)
    // this.pageComponents.set('entry', ScoringPage);
    // this.pageComponents.set('welcome', WelcomePage);
  }

  /**
   * Setup all routes from routes.ts
   */
  private setupRoutes() {
    routes.forEach((route) => {
      this.navigo.on(route.path, (params) => {
        this.handleNavigation(route.path, route.view, route.guard, params);
      });
    });

    // 404 handler - do nothing, let viewManager handle it
    this.navigo.notFound(() => {
      // Silent - viewManager will handle the view
    });
  }

  /**
   * Handle navigation with guards and viewManager integration
   */
  private async handleNavigation(path: string, view: string, guardName?: string, params?: any) {
    if (this.isNavigating) return;

    // Execute guard if present
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

    // Update current route
    this.currentRoute = path;

    this.isNavigating = true;

    // PHASE 3: Check if we have a page component for this view
    const PageComponent = this.pageComponents.get(view);

    if (PageComponent) {
      // Use new page component system
      await this.mountPageComponent(PageComponent, view, params);
    } else {
      // Fall back to viewManager for views not yet migrated
      viewManager(view, params);
    }

    this.isNavigating = false;
  }

  /**
   * Mount a page component
   */
  private async mountPageComponent(PageComponent: any, view: string, params?: any) {
    // Use viewManager to hide all other views properly
    const allViews = [
      'gametree',
      'stats',
      'momentum',
      'pointhistory',
      'entry',
      'mainmenu',
      'matcharchive',
      'matchformats',
      'settings',
      'welcome',
      'matchdetails',
    ];

    // Deactivate all views EXCEPT the one we're mounting
    allViews
      .filter((v) => v !== view)
      .forEach((v) => {
        try {
          viewManager(v, { activate: false });
        } catch (e) {
          // Ignore errors from views that don't exist
        }
      });

    // Unmount current page if exists
    if (this.currentPage) {
      await this.currentPage.unmount();
      this.currentPage = null;
    }

    // Get or create container for page
    const containerId = this.getContainerIdForView(view);
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.getElementById('gametree');
    }

    if (!container) {
      // Fall back to viewManager
      viewManager(view, params);
      return;
    }

    // Show the container
    container.style.display = 'flex';

    // Create and mount page component
    const page = new PageComponent(container, { params });
    await page.mount();

    this.currentPage = page;
  }

  /**
   * Get container ID for a view
   */
  private getContainerIdForView(view: string): string {
    // Map view names to container IDs
    const containerMap: Record<string, string> = {
      gametree: 'gametree',
      stats: 'statsscreen',
      momentum: 'momentum',
      entry: 'vblack', // vertical view
      // Add more as needed
    };

    return containerMap[view] || view;
  }

  /**
   * Navigate to a path
   */
  navigate(path: string, options?: any) {
    this.navigo.navigate(path);
  }

  /**
   * Navigate by view name (backward compatibility)
   */
  navigateToView(view: string, params?: any) {
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
    // Check for matchUpId in URL and load it
    const urlParams = new URLSearchParams(window.location.search);
    const matchUpId = urlParams.get('matchUpId');

    if (matchUpId) {
      // Restore match from URL silently
      const { loadMatch } = require('./transition/loadMatch');
      loadMatch(matchUpId);
    }

    this.navigo.resolve();
  }

  /**
   * Update URL without triggering navigation
   */
  updateURL(path: string) {
    // Use Navigo's navigate with silent option
    const fullPath = path.startsWith('#') ? path : `#${path}`;
    window.history.replaceState(null, '', fullPath);
  }

  /**
   * Sync URL with current view (called by viewManager)
   * This allows viewManager to update URL when it changes view
   */
  syncUrl(view: string) {
    if (this.isNavigating) return; // Prevent circular updates

    const path = getPathForView(view);
    if (path && path !== this.currentRoute) {
      this.currentRoute = path;
      // Update URL without triggering navigation
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
   * Manually trigger navigation to a view (called by viewManager)
   */
  async navigateToViewDirect(view: string, params?: any): Promise<void> {
    // Prevent redundant navigation if already navigating
    if (this.isNavigating) {
      return;
    }

    await this.navigateToView(view, params);
  }
}

// Export singleton instance
export const router = new EnhancedRouter();
