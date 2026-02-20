import { resetButtons, setCourtSide, stateChangeEvent, swapServer, updateState, visibleButtons } from '../display/displayUpdate';
import { editMatchDetails } from '../display/displayUpdate';
import { formatChangePossible } from '../engine/formatChangePossible';
import { getCurrentMatchUpId } from '../state/matchContext';
import { newMatch } from '../match/displayMatchArchive';
import { browserStorage } from '../state/browserStorage';
import { env, options, settings as appSettings, updateAppState, updateMatchArchive } from '../state/env';
import { openFormatEditor } from '../match/openFormatEditor';
import { matchPath } from '../router/routes';
import { showGameFish } from '../display/configureViz';
import { findUpClass } from '../utils/utilities';
import { editPoint } from '../match/editPoint';
import { cModal, renderForm } from 'courthive-components';

export function viewGameFish(element: any) {
  const gameIndex: number = parseInt(element.getAttribute('gameIndex') ?? 0);
  showGameFish(gameIndex);
}
export function viewEditPoint(element: any) {
  const parent = findUpClass(element, 'ph_episode');
  const pointIndex = parseInt(parent?.getAttribute('pointIndex') ?? 0);
  editPoint(pointIndex);
}
const getRouter = () => (window as any).appRouter;

export function viewStats() {
  getRouter()?.navigate(matchPath(getCurrentMatchUpId(), 'stats'));
}
export function viewMatchFormat() {
  // Navigate to scoring first (in case we're on another view)
  const router = getRouter();
  router?.navigate(matchPath(getCurrentMatchUpId(), 'scoring'));
  setTimeout(() => openFormatEditor(), 50);
}
export function viewGameTree() {
  getRouter()?.navigate(matchPath(getCurrentMatchUpId(), 'tree'));
}
export function viewMomentum() {
  getRouter()?.navigate(matchPath(getCurrentMatchUpId(), 'momentum'));
}
export function viewPointHistory() {
  getRouter()?.navigate(matchPath(getCurrentMatchUpId(), 'history'));
}
export function settings() {
  let inputs: any;

  const color = '#333';
  const content = (elem: HTMLElement) =>
    (inputs = renderForm(elem, [
      { label: 'Audible Clicks', field: 'audible_clicks', id: 'audible_clicks', checkbox: true, checked: appSettings.audible_clicks, color },
      { label: 'Track Shot Types', field: 'track_shot_types', id: 'track_shot_types', checkbox: true, checked: appSettings.track_shot_types, color },
      { label: 'GameFish Display', field: 'display_gamefish', id: 'display_gamefish', checkbox: true, checked: appSettings.display_gamefish, color },
      { label: 'Auto-swap Server Side', field: 'auto_swap_sides', id: 'auto_swap_sides', checkbox: true, checked: appSettings.auto_swap_sides, color },
    ]));

  const saveSettings = () => {
    if (inputs) {
      appSettings.audible_clicks = inputs.audible_clicks?.checked ?? appSettings.audible_clicks;
      appSettings.track_shot_types = inputs.track_shot_types?.checked ?? appSettings.track_shot_types;
      appSettings.display_gamefish = inputs.display_gamefish?.checked ?? appSettings.display_gamefish;
      appSettings.auto_swap_sides = inputs.auto_swap_sides?.checked ?? appSettings.auto_swap_sides;
      updateAppState();
    }
  };

  cModal.open({
    title: 'Settings',
    content,
    buttons: [{ label: 'Done', intent: 'is-info', onClick: saveSettings, close: true }],
    onClose: saveSettings,
  });
}
export function matchArchive() {
  getRouter()?.navigate('/archive');
}
export function outcomeEntry() {
  getRouter()?.navigate(matchPath(getCurrentMatchUpId(), 'scoring'));
}
export function mainMenu() {
  const router = getRouter();
  const points = env.engine.getState().history?.points || [];
  const hasArchive = JSON.parse(browserStorage.get('match_archive') || '[]').length > 0;
  const canChangeFormat = formatChangePossible();
  const canChangeServer = points.length === 0;

  const menuItem = (label: string, action: () => void) => {
    const div = document.createElement('div');
    div.textContent = label;
    div.style.cssText = 'padding: 0.75rem 1rem; cursor: pointer; font-size: 1.1rem; color: #333; border-bottom: 1px solid #eee;';
    div.addEventListener('mouseenter', () => (div.style.backgroundColor = '#f5f5f5'));
    div.addEventListener('mouseleave', () => (div.style.backgroundColor = ''));
    div.addEventListener('click', () => {
      cModal.close();
      action();
    });
    return div;
  };

  const content = (elem: HTMLElement) => {
    if (canChangeServer) elem.appendChild(menuItem('Change Server', changeServer));
    elem.appendChild(menuItem('New Match', newMatch));
    if (canChangeFormat) elem.appendChild(menuItem('Match Format', () => openFormatEditor()));
    elem.appendChild(menuItem('Match Details', editMatchDetails));
    if (hasArchive) elem.appendChild(menuItem('Match Archive', () => router?.navigate('/archive')));
    elem.appendChild(menuItem('Settings', settings));
  };

  cModal.open({ title: 'Menu', content });
}
export function undoAction() {
  if (env.serve2nd || env.rally_mode) {
    env.serve2nd = false;
    env.rally_mode = false;
    env.rally = 0;
    env.lets = 0;
    resetButtons();
  } else {
    const success = env.engine.undo();
    if (success) {
      updateMatchArchive(true);
      stateChangeEvent();
    }
  }
  visibleButtons();
}
export function redoAction() {
  if (!env.engine.canRedo()) return;
  const success = env.engine.redo();
  if (success) {
    updateMatchArchive(true);
    stateChangeEvent();
  }
  visibleButtons();
}
export function changeServer() {
  const points = env.engine.getState().history?.points || [];
  if (!points.length) {
    env.serving = 1 - env.serving;
    env.receiving = 1 - env.serving;
    swapServer();
    resetButtons();
    visibleButtons();
  }
}
export function swapAction() {
  options.user_swap = !options.user_swap;
  setCourtSide();
  swapServer();
  stateChangeEvent();
}
/*
export function menuAction(obj, action) {
  const actions = {
    horizontalview() {
      options.horizontal_view = options.horizontal_view == 'hblack' ? 'hwhite' : 'hblack';
      BrowserStorage.set('horizontal_view', options.horizontal_view);
      viewManager('entry');
    },
    verticalview() {
            options.vertical_view = (options.vertical_view == 'vblack') ? 'vwhite' : 'vblack';
            BrowserStorage.set('vertical_view', options.vertical_view);
            viewManager('entry');
    }
  };
}
*/
