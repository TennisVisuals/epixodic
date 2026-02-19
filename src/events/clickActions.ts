import { resetButtons, setCourtSide, stateChangeEvent, swapServer, updateState, visibleButtons } from '../display/displayUpdate';
import { getCurrentMatchUpId } from '../state/matchContext';
import { env, options, updateMatchArchive } from '../state/env';
import { openFormatEditor } from '../match/openFormatEditor';
import { matchPath } from '../router/routes';
import { showGameFish } from '../display/configureViz';
import { findUpClass } from '../utils/utilities';
import { editPoint } from '../match/editPoint';

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
  getRouter()?.navigate('/settings');
}
export function matchArchive() {
  getRouter()?.navigate('/archive');
}
export function outcomeEntry() {
  getRouter()?.navigate(matchPath(getCurrentMatchUpId(), 'scoring'));
}
export function mainMenu() {
  getRouter()?.navigate('/');
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
    updateState();
    getRouter()?.navigate(matchPath(getCurrentMatchUpId(), 'scoring'));
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
