import { stateChangeEvent, updateState, visibleButtons } from '../display/displayUpdate';
import { resetButton, resetStyles } from './events';
import { checkMatchEnd } from '../engine/checkMatchEnd';
import { buttons, env, settings } from '../state/env';
import { strokeSlider } from './strokeSlider';
import { DOUBLE_FAULT } from '../utils/constants';
import { pointLogger } from '../services/pointLogger';

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
      if (env.serve2nd) return { winner: 1 - side, result: 'Double Fault', code: 'D' };
      const player_side = env.swap_sides ? 1 - side : side;
      changeValue(`.fault.display_${player_side}_serving`, DOUBLE_FAULT);
      changeValue(`.fault.modeerr_player${player_side}`, DOUBLE_FAULT);
      const server_side = env.swap_sides ? 1 - env.serving : env.serving;
      const server_mode = `.modeaction_player${server_side}`;
      Array.from(document.querySelectorAll(server_mode)).forEach((div) => (div.innerHTML = '2nd Serve'));
      env.serve2nd = true;
      // Broadcasting removed
    },
    doubleFault(side: number) {
      return side != env.serving ? undefined : { winner: 1 - side, result: 'Double Fault', code: 'd' };
    },
    ace(side: number) {
      return side != env.serving ? undefined : { winner: side, result: 'Ace', code: env.serve2nd ? 'a' : 'A' };
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
      // Broadcasting removed
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
    // would require a global variable, perhaps 'pip' for point-in-progress

    // Capture game count before addPoint to detect game completion
    const setsBefore = env.engine.getState().score?.sets || [];
    const gameCountBefore = setsBefore.reduce((sum: number, s: any) => sum + (s.side1Score || 0) + (s.side2Score || 0), 0);

    // Add point via ScoringEngine (returns void)
    // Let the engine derive the server based on matchUpFormat rules (handles tiebreaks, NOAD, etc.)
    const addPointOpts: any = { winner: point.winner, result: point.result };
    // Only pass server for the very first point to respect user's initial server choice
    const enginePoints = env.engine.getState().history?.points || [];
    if (enginePoints.length === 0) addPointOpts.server = env.serving;
    env.engine.addPoint(addPointOpts);

    // Sync env.serving from the engine's derived server
    const stateAfterPoint = env.engine.getState();
    const storedPoints = stateAfterPoint.history?.points || [];
    if (storedPoints.length > 0) {
      env.serving = storedPoints[storedPoints.length - 1].server ?? env.serving;
      env.receiving = 1 - env.serving;
    }

    const matchContinues = !env.engine.isComplete();
    const setsAfter = stateAfterPoint.score?.sets || [];
    const gameCountAfter = setsAfter.reduce((sum: number, s: any) => sum + (s.side1Score || 0) + (s.side2Score || 0), 0);
    const gameJustCompleted = gameCountAfter > gameCountBefore;

    pointLogger.log(point);

    if (
      settings.track_shot_types &&
      matchContinues &&
      point.result &&
      ['Penalty', 'Ace', 'Double Fault'].indexOf(point.result) < 0
    ) {
      strokeSlider(slider_side);
    } else {
      checkMatchEnd({ game: { complete: gameJustCompleted } });
    }

    env.rally = 0;
    env.lets = 0;
    
    // Call stateChangeEvent instead of updateState to trigger page updates
    // stateChangeEvent calls updateState internally + notifies current page
    console.log('[HVE] classAction - About to call stateChangeEvent()');
    stateChangeEvent();
    console.log('[HVE] classAction - stateChangeEvent() completed');
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
  const points = env.engine.getState().history?.points || [];
  if (points.length == 0) {
    // if no points, define new start time
    const date = new Date();
    Object.assign(env.metadata.match, { date: date.valueOf() });
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
