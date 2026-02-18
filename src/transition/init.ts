import { app, restoreAppState, setOrientation, updateAppState } from './env';
import { configureViz, orientationEvent, vizUpdate } from './configureViz';
import { setInitialState } from '../config/initialState';
import { setDev } from '../services/helpers/setDev';
import { browserStorage } from './browserStorage';
import { registerEvents } from './registerEvents';
import { newMatch } from './displayMatchArchive';
import { changeDisplay } from './viewManager';
import { touchManager } from './touchManager';
import { defineActionEvents } from './events';
import { generateRange } from './utilities';
import { modalHelp } from './modalHelp';
import { loadMatch } from './loadMatch';
import { closeModal } from './modals';
import clipboard from 'clipboard';
import { tools } from 'tods-competition-factory';
import {
  changePlayerName,
  checkPlayerName,
  loadDetails,
  resetButtons,
  swapServer,
  visibleButtons,
} from './displayUpdate';

import iocCodes from '../assets/ioc_codes.json';

export function init() {
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
  history.pushState('', document.title, window.location.pathname);

  touchManager.disableDrag();
  registerEvents();

  // dismiss notification of requirements
  changeDisplay('none', 'welcome');

  // initialize clipboard
  const clip = new clipboard('.c2c');
  clip.on('success', () => {
    closeModal();
  });

  restoreAppState();
  checkUserUUID();
  // Broadcast disabled - not needed for standalone app
  // if (app.broadcast && navigator.onLine) startBroadcast();

  defineEntryEvents();
  defineActionEvents();
  touchManager.addSwipeTarget(document.getElementById('mainmenu'));

  // populate drop down list box selectors
  const select_seed = Array.from(document.querySelectorAll('.md_seed'));
  select_seed.forEach((select: any) => {
    generateRange(0, 32).forEach((i: number) => {
      const optionValue = (i + 1).toString();
      select.options[i + 1] = new Option(optionValue, optionValue);
    });
  });
  const select_draw_position = Array.from(document.querySelectorAll('.md_draw_position'));
  select_draw_position.forEach((select: any) => {
    generateRange(0, 128).forEach((i) => {
      const optionValue = (i + 1).toString();
      select.options[i + 1] = new Option(optionValue, optionValue);
    });
  });
  const select_ioc = Array.from(document.querySelectorAll('.md_ioc'));
  select_ioc.forEach((select: any) => {
    iocCodes.forEach((entry: any, index: number) => (select.options[index + 1] = new Option(entry.name, entry.ioc)));
  });
  // load Details to be sure that ioc data can be used to populate country
  loadDetails();

  setOrientation();
  loadCurrent();
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

function defineEntryEvents() {
  const catchTab = (evt: any) => {
    if (evt.which == 9) {
      evt.preventDefault();
    }
  };
  const playername = document.getElementById('playername');
  if (playername) {
    playername.addEventListener('keyup', checkPlayerName, false);
    playername.addEventListener('keydown', catchTab, false);
    playername.onblur = function () {
      changePlayerName();
    };
    playername.onfocus = function () {
      setTimeout(() => {
        //@ts-expect-error unknown reason
        this.setSelectionRange(0, this.value.length);
      }, 100);
    };
  }
  const team = document.getElementById('team');
  if (team) {
    team.onblur = function () {
      changePlayerName();
    };
    team.onfocus = function () {
      setTimeout(() => {
        //@ts-expect-error unknown reason
        this.setSelectionRange(0, this.value.length);
      }, 100);
    };
  }

  const playerRank = document.getElementById('player_rank');
  if (playerRank) {
    playerRank.onfocus = function () {
      setTimeout(() => {
        //@ts-expect-error unknown reason
        this.setSelectionRange(0, this.value.length);
      }, 300);
    };
  }

  const playerWTN = document.getElementById('player_wtn');
  if (playerWTN) {
    playerWTN.onfocus = function () {
      setTimeout(() => {
        //@ts-expect-error unknown reason
        this.setSelectionRange(0, this.value.length);
      }, 300);
    };
  }

  const playerUTR = document.getElementById('player_utr');
  if (playerUTR) {
    playerUTR.onfocus = function () {
      setTimeout(() => {
        //@ts-expect-error unknown reason
        this.setSelectionRange(0, this.value.length);
      }, 300);
    };
  }

  const hold_targets = Array.from(document.querySelectorAll('.pressAndHold'));
  Array.from(hold_targets).forEach((target) => touchManager.addPressAndHold(target));
}

function loadCurrent() {
  const current_match_id = browserStorage.get('current_match');
  if (!current_match_id) {
    const match_archive = browserStorage.get('match_archive');
    // only show quick start if this is first launch
    newMatch();
    if (!match_archive) modalHelp(true);
  } else {
    loadMatch(current_match_id);
    swapServer();
    resetButtons();
    visibleButtons();
  }
}
