import { resetButtons, setCourtSide, swapServer, updateState, visibleButtons } from './displayUpdate';
import { env, options, updateMatchArchive } from './env';
import { viewManager } from './viewManager';
import { showGameFish } from './configureViz';
import { findUpClass } from './utilities';
import { editPoint } from './editPoint';

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
    const undo = env.match.undo();
    // Broadcasting removed
    if (undo) env.undone.push(undo);
    updateMatchArchive(true);
  }
  visibleButtons();
}
export function redoAction() {
  if (!env.undone.length) return;
  env.match.addPoint(env.undone.pop());
  // Broadcasting removed
}
export function changeServer() {
  console.log('changeServer');
  if (!env.match.history.points().length) {
    env.match.set.firstService(1 - env.serving);
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
