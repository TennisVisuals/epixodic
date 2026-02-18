import { resetButtons, setCourtSide, swapServer, updateState, visibleButtons } from '../display/displayUpdate';
import { pointLogger } from '../services/pointLogger';
import { env, options, updateMatchArchive } from '../state/env';
import { viewManager } from '../display/viewManager';
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
export function viewStats() {
  viewManager('stats');
}
export function viewMatchFormat() {
  viewManager('matchformat');
}
export function viewGameTree() {
  viewManager('gametree');
}
export function viewMomentum() {
  viewManager('momentum');
}
export function viewPointHistory() {
  viewManager('pointhistory');
}
export function settings() {
  viewManager('settings');
}
export function matchArchive() {
  viewManager('matcharchive');
}
export function outcomeEntry() {
  viewManager('entry');
}
export function mainMenu() {
  viewManager('mainmenu');
}
export function undoAction() {
  if (env.serve2nd || env.rally_mode) {
    env.serve2nd = false;
    env.rally_mode = false;
    env.rally = 0;
    env.lets = 0;
    resetButtons();
  } else {
    const undo = env.engine.undo();
    // Broadcasting removed
    if (undo) env.undone.push(undo);
    updateMatchArchive(true);
  }
  visibleButtons();
}
export function redoAction() {
  if (!env.undone.length) return;
  const point = env.undone.pop();
  pointLogger.log(point);

  // Pass server when redoing — the point has engine-derived server value
  const opts: any = { winner: point.winner, result: point.result };
  if (point.server !== undefined) opts.server = point.server;
  env.engine.addPoint(opts);
  // Broadcasting removed
}
export function changeServer() {
  console.log('changeServer');
  const points = env.engine.getState().history?.points || [];
  if (!points.length) {
    env.serving = 1 - env.serving;
    updateState();
    viewManager('entry');
  }
}
export function swapAction() {
  console.log('swapAction');
  options.user_swap = !options.user_swap;
  setCourtSide();
  swapServer();
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
