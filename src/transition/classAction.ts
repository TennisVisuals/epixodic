import { updateState, visibleButtons } from './displayUpdate';
import { resetButton, resetStyles } from './events';
import { broadcastScore } from './broadcastScore';
import { checkMatchEnd } from './checkMatchEnd';
import { buttons, env, settings } from './env';
import { strokeSlider } from './strokeSlider';
import { broadcastStatus } from './coms';
import { DOUBLE_FAULT } from './constants';

const toggles: any = {};

export function classAction(element: any) {
  const action: string = element.getAttribute('action');
  let side: number = parseInt(element.getAttribute('side') ?? 0);
  const service: string = element.getAttribute('service');
  const playerRole: string = element.getAttribute('role');

  if (checkMatchEnd()) return;
  const slider_side = side ? 'right' : 'left';
  if (env.swap_sides && ['server', 'receiver'].indexOf(playerRole) < 0) side = 1 - side;
  resetStyles();

  function changeValue(classes: any, value: any) {
    const objs = Array.from(document.querySelectorAll(classes));
    objs.forEach((element) => (element.innerHTML = value));
  }

  function rallyMode() {
    env.rally_mode = true;
    Array.from(document.querySelectorAll('.modeforce')).forEach((div: any) => (div.style.display = 'flex'));
    changeValue('.vs_action_button.winner', 'Winner');
    changeValue('.vs_action_button.fault', 'UFE');
    changeValue('.vs_action_button.forced', 'Forced');
    Array.from(document.querySelectorAll('.vs_mode_button')).forEach((button) => {
      if (['Serve', 'Return', '2nd Serve'].indexOf(button.innerHTML) >= 0) button.innerHTML = 'Base Line';
    });
  }

  const actions: any = {
    firstServe() {
      env.serve2nd = false;
    },
    secondServe() {
      env.serve2nd = !toggles.serve2nd;
      toggles.serve2nd = !toggles.serve2nd;
    },
    fault(side: number) {
      if (side != env.serving) return undefined;
      if (env.serve2nd) return { code: 'D' };
      const player_side = env.swap_sides ? 1 - side : side;
      changeValue(`.fault.display_${player_side}_serving`, DOUBLE_FAULT);
      changeValue(`.fault.modeerr_player${player_side}`, DOUBLE_FAULT);
      const server_side = env.swap_sides ? 1 - env.serving : env.serving;
      const server_mode = `.modeaction_player${server_side}`;
      Array.from(document.querySelectorAll(server_mode)).forEach((div) => (div.innerHTML = '2nd Serve'));
      env.serve2nd = true;
      broadcastStatus('Service Fault');
    },
    doubleFault(side: number) {
      return side != env.serving ? undefined : { code: 'd' };
    },
    ace(side: number) {
      return side != env.serving ? undefined : env.serve2nd ? { code: 'a' } : { code: 'A' };
    },
    winner(side: number) {
      return { winner: side, result: 'Winner' };
    },
    unforced(side: number) {
      return { winner: 1 - side, result: 'Unforced Error' };
    },
    forced(side: number) {
      return { winner: 1 - side, result: 'Forced Error' };
    },
    point(side: number) {
      return { winner: side };
    },
    penalty(side: number) {
      console.log('penalty');
      return {
        winner: 1 - side,
        result: 'Penalty',
        code: side == env.serving ? 'P' : 'Q',
      };
    },

    modewin(side: number, point: any) {
      const action = element.innerHTML;
      if (action == 'Ace') return actions.ace(side, point);
      if (action == 'Winner') return actions.winner(side, point);
    },
    modeerr(side: number, point: any) {
      const action = element.innerHTML;
      if (action == 'Fault' || action == DOUBLE_FAULT) return actions.fault(side, point);
      if (action == 'UFE') return actions.unforced(side, point);
      if (action == 'Forced') return actions.forced(side, point);
      if (action == 'Let') return actions.let(side, point);
    },
    modeaction() {
      const action = element.innerHTML;
      if (['Serve', '2nd Serve', 'Return'].indexOf(action) >= 0) {
        rallyMode();
      }
      if (action == 'Serve' || action == 'Return') {
        rallyMode();
      }
      if (action == 'Net') {
        element.innerHTML = 'Base Line';
      }
      if (action == 'Base Line') {
        element.innerHTML = 'Net';
      }
    },
    rally() {
      const action = element.innerHTML;
      env.rally = parseInt((action.match(/\d+/g) || ['0']).join(''));
      env.rally += 1;
      changeValue(`.rally`, `Rally: ${env.rally}`);
      if (env.rally == 1) rallyMode();
    },
    let() {
      broadcastStatus('Service: Let');
      env.lets += 1;
      // reset serve clock
    },
  };

  const sound: any = document.getElementById('click');
  if (sound && settings.audible_clicks) {
    // Catch autoplay errors (browser policy)
    sound.play().catch(() => {
      /* Autoplay blocked - expected behavior */
    });
  }
  if (element.id) styleButton(element.id);
  if (service && service == 'second_service') env.serve2nd = true;
  if (Object.keys(actions).indexOf(action) < 0) return undefined;
  const player_position = ['server', 'receiver'].indexOf(playerRole);
  if (player_position >= 0) side = player_position ? env.receiving : env.serving;
  const point: any = env.serve2nd ? { first_serve: { error: 'Error', serves: ['0e'] } } : {};
  const result = actions[action](side, point);
  if (result) {
    checkStartTime();
    Object.assign(point, result);
    if (env.rally) point.rally = env.rally;
    const point_location = getPointLocation(point);
    if (point_location) point.location = point_location;

    // perhaps refactor to defer adding point until
    // stroke/result action, if any; then decorate point not necessary
    // and broadcast of point doesn't have to wait until decoration...
    // would require a global variable, perhaps 'pip' for point-in-progress
    const what = env.match.addPoint(point);

    if (
      settings.track_shot_types &&
      what.result &&
      what.point.result &&
      ['Penalty', 'Ace', 'Double Fault'].indexOf(what.point.result) < 0
    ) {
      strokeSlider(slider_side);
    } else {
      checkMatchEnd(what);
      broadcastScore(what);
    }

    env.rally = 0;
    env.lets = 0;
    env.undone = [];
    updateState();
  }
  visibleButtons();
}

function styleButton(id: string) {
  const button = document.getElementById(id);
  if (!button) return;
  if (buttons[id].type == 'flash') {
    button.style.backgroundColor = buttons[id].color;
    button.style.color = 'white';
    setTimeout(() => resetStyles(), 300);
  } else if (buttons[id].type == 'toggle') {
    if (button.style.backgroundColor == 'white') {
      env.serve2nd = id == 'second_serve';
      button.style.backgroundColor = buttons[id].color;
      button.style.color = 'white';
    } else {
      env.serve2nd = false;
      button.style.backgroundColor = 'white';
      button.style.color = buttons[id].color;
    }
    const toggle_ids = Object.keys(buttons).filter((f) => buttons[f].type == 'toggle');
    toggle_ids.filter((f) => f != id).forEach((id: string) => resetButton(id));
  }
}

function checkStartTime() {
  const points = env.match.history.points();
  if (points.length == 0) {
    // if no points, define new start time
    const date = new Date();
    env.match.metadata.defineMatch({ date: date.valueOf() });
  }
}

function getPointLocation(point: any) {
  const p0location = document.querySelectorAll('.modeaction_player0');
  const p1location = document.querySelectorAll('.modeaction_player1');
  if ((p0location && p0location[0].innerHTML == 'Net') || (p1location && p1location[0].innerHTML == 'Net')) {
    if (point.result == 'Unforced Error' || point.result == 'Forced Error') {
      if (point.winner == 0 && p1location[0].innerHTML == 'Net') return 'Net';
      if (point.winner == 1 && p0location[0].innerHTML == 'Net') return 'Net';
    } else if (point.result == 'Winner') {
      if (point.winner == 0 && p0location[0].innerHTML == 'Net') return 'Net';
      if (point.winner == 1 && p1location[0].innerHTML == 'Net') return 'Net';
    }
  }
}
