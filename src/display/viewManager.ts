import { formatChangePossible } from '../engine/formatChangePossible';
import { displayPointHistory } from './displayPointHistory';
import { displayMatchArchive } from '../transition/displayMatchArchive';
import { browserStorage } from '../state/browserStorage';
import { displayFormats } from './displayFormats';
import { strokeSlider } from '../events/strokeSlider';
import { touchManager } from '../events/touchManager';
import { env, options, charts, getEpisodes, getNoAd } from '../state/env';
import { ensureGameTreeChart } from './configureViz';
import { updateStats } from '../match/updateStats';

export const changeDisplay = (display: string, id: string) => {
  const element = document.getElementById(id);
  if (element) element.style.display = display;
};

export function viewManager(new_view = env.view, params?: any) {
  // hide strokeslider any time view changes
  strokeSlider();
  // changeDisplay('none', 'system');

  const views: any = {
    mainmenu({ activate = true } = {}) {
      if (activate) {
        touchManager.prevent_touch = false;

        const match_archive = JSON.parse(browserStorage.get('match_archive') || '[]');
        const menuMatchArchive = document.getElementById('menu_match_archive');
        if (menuMatchArchive) menuMatchArchive.style.display = match_archive.length ? 'flex' : 'none';

        const menuMatchFormat = document.getElementById('menu_match_format');
        if (menuMatchFormat) menuMatchFormat.style.display = formatChangePossible() ? 'flex' : 'none';

        const points = env.engine.getState().history?.points || [];
        const menuChangeServer = document.getElementById('menu_change_server');
        if (menuChangeServer) menuChangeServer.style.display = points.length == 0 ? 'flex' : 'none';
      }
      changeDisplay(activate ? 'flex' : 'none', 'mainmenu');
    },
    pointhistory({ activate = true } = {}) {
      if (activate) {
        touchManager.prevent_touch = false;
        displayPointHistory();
      }
      changeDisplay(activate ? 'flex' : 'none', 'pointhistory');
    },
    matcharchive({ activate = true } = {}) {
      if (activate) {
        touchManager.prevent_touch = false;
        displayMatchArchive();
      }
      changeDisplay(activate ? 'flex' : 'none', 'matcharchive');
    },
    matchformat({ activate = true } = {}) {
      displayFormats();
      if (activate) touchManager.prevent_touch = false;
      changeDisplay(activate ? 'flex' : 'none', 'matchformats');
    },
    settings({ activate = true } = {}) {
      changeDisplay(activate ? 'flex' : 'none', 'settings');
    },
    welcome({ activate = true } = {}) {
      changeDisplay(activate ? 'flex' : 'none', 'welcome');
    },
    matchdetails({ activate = true } = {}) {
      if (activate) touchManager.prevent_touch = false;
      changeDisplay(activate ? 'flex' : 'none', 'matchdetails');
    },
    entry({ activate = true } = {}) {
      if (activate) touchManager.prevent_touch = true;
      changeDisplay(activate && env.orientation == 'landscape' ? 'flex' : 'none', options.horizontal_view);
      changeDisplay(activate && env.orientation == 'portrait' ? 'flex' : 'none', options.vertical_view);
      changeDisplay(activate && env.orientation == 'portrait' ? 'flex' : 'none', 'toolbar');
    },
    stats({ activate = true } = {}) {
      // TODO: Migrate to page component once stats rendering is refactored
      // For now, use legacy stats view
      changeDisplay(activate ? 'flex' : 'none', 'statsscreen');
      if (activate) {
        touchManager.prevent_touch = false;
        updateStats();
      }
    },
    momentum({ activate = true } = {}) {
      if (!activate) {
        changeDisplay('none', 'momentum');
        changeDisplay('none', 'pts');
      } else {
        if (env.orientation == 'landscape') {
          changeDisplay('none', 'momentum');
          changeDisplay('flex', 'pts');
          charts.pts_match.data(getEpisodes());
          charts.pts_match.update();
        } else {
          changeDisplay('inline', 'momentum');
          changeDisplay('none', 'pts');
        }
        touchManager.prevent_touch = false;
        const point_episodes = getEpisodes();
        charts.mc.width(window.innerWidth).height(820);
        charts.mc.data(point_episodes).update();
        console.log('[HVE] MomentumView - Updated momentum chart with', point_episodes.length, 'points');
        charts.mc.update();
      }
    },
    gametree({ activate = true } = {}) {
      changeDisplay(activate ? 'flex' : 'none', 'gametree');
      if (activate) {
        touchManager.prevent_touch = false;
        ensureGameTreeChart();
        // Defer update to next frame so browser has completed layout after display change
        requestAnimationFrame(() => {
          const point_episodes = getEpisodes();
          const noAd = getNoAd();
          charts.gametree.options({ display: { noAd } });
          charts.gametree.data(point_episodes).update();
          charts.gametree.update({ sizeToFit: true });
        });
      }
    },
  };

  const view_keys = Object.keys(views);
  if (view_keys.indexOf(new_view) >= 0) {
    // Check if the new view is router-managed
    const isRouterManaged = typeof window !== 'undefined' && (window as any).appRouter?.hasPageComponent?.(new_view);

    if (isRouterManaged) {
      // Router-managed view: let it handle everything
      views[new_view]({ activate: true, params });
      env.view = new_view;

      // Deactivate other views (but they'll return early if router-managed)
      view_keys.filter((view) => view != new_view).forEach((view) => views[view]({ activate: false }));
    } else {
      // Legacy view: use traditional flow
      // First deactivate all other views
      view_keys.filter((view) => view != new_view).forEach((view) => views[view]({ activate: false }));

      // Manually hide any router-managed containers before showing legacy view
      if (typeof window !== 'undefined' && (window as any).appRouter) {
        const appRouter = (window as any).appRouter;
        if (appRouter.hasPageComponent) {
          // Hide gametree container if it's router-managed
          if (appRouter.hasPageComponent('gametree')) {
            const gametreeContainer = document.getElementById('gametree');
            if (gametreeContainer) {
              gametreeContainer.style.display = 'none';
            }
          }
        }
      }

      // Activate the new legacy view
      views[new_view]({ activate: true, params });
      env.view = new_view;
    }

    // PHASE 2: Update URL with router when view changes
    if (typeof window !== 'undefined' && (window as any).appRouter) {
      const appRouter = (window as any).appRouter;
      if (!appRouter.isNavigating) {
        const matchUpId = env.metadata.match?.matchUpId;
        let url = `/${new_view}`;

        if (matchUpId) {
          url += `?matchUpId=${matchUpId}`;
        }

        appRouter.updateURL(url);
      }
    }

    return new_view;
  }
}
