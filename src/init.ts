import { app, restoreAppState, setOrientation, updateAppState } from './state/env';
import { configureViz, orientationEvent, vizUpdate } from './display/configureViz';
import { setInitialState } from './config/initialState';
import { setDev } from './services/helpers/setDev';
import { registerEvents } from './events/registerEvents';
import { touchManager } from './events/touchManager';
import { defineActionEvents } from './events/events';
import { registerDefaultSkins } from './scoring';
import { registerDefaultProfiles } from './decorations';
import { cModal } from 'courthive-components';
import clipboard from 'clipboard';
import { tools } from 'tods-competition-factory';

export function init() {
  registerDefaultSkins();
  registerDefaultProfiles();
  setDev();

  window.addEventListener(
    'orientationchange',
    function () {
      orientationEvent();
    },
    false,
  );
  window.addEventListener(
    'resize',
    function () {
      orientationEvent();
    },
    false,
  );

  const queryString: any = {};
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (typeof queryString[pair[0]] === 'undefined') {
      queryString[pair[0]] = pair[1];
    } else if (typeof queryString[pair[0]] === 'string') {
      const arr = [queryString[pair[0]], pair[1]];
      queryString[pair[0]] = arr;
    } else {
      queryString[pair[0]].push(pair[1]);
    }
  }
  history.pushState('', document.title, window.location.pathname + window.location.hash);

  touchManager.disableDrag();
  registerEvents();

  // dismiss notification of requirements
  const welcomeEl = document.getElementById('welcome');
  if (welcomeEl) welcomeEl.style.display = 'none';

  // initialize clipboard
  const clip = new clipboard('.c2c');
  clip.on('success', () => {
    cModal.close();
  });

  restoreAppState();
  checkUserUUID();
  // Broadcast disabled - not needed for standalone app
  // if (app.broadcast && navigator.onLine) startBroadcast();

  defineActionEvents();

  setOrientation();
  configureViz();
  vizUpdate();

  // Broadcasting/key functionality removed
  // if (queryString.key) {
  //   setTimeout(() => sendKey({ key: queryString.key }), 1000);
  // }

  setInitialState();
}

function checkUserUUID() {
  if (!app.user_uuid) {
    app.user_uuid = tools.UUID();
    updateAppState();
  }
}

