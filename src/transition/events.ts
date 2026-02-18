import { stateChangeEvent, swapServer } from '../display/displayUpdate';
import { buttons, env, updatePositions, getNextServer } from '../state/env';

export function defineActionEvents() {
  // No-op: events system removed with UMO
}

export function resetEvent() {
  env.metadata.match.date = null;

  env.serve2nd = false;
  env.rally_mode = false;
  env.serving = getNextServer();
  env.receiving = 1 - getNextServer();
  env.undone = [];
  env.rally = 0;
  env.lets = 0;

  resetStyles();
  updatePositions();
  swapServer();
  stateChangeEvent();
}

export function resetStyles() {
  Object.keys(buttons).forEach((id) => resetButton(id));
}

export function resetButton(id: string) {
  const button = document.getElementById(id);
  if (!button) return;
  if (buttons?.[id]?.color) {
    button.style.backgroundColor = 'white';
    button.style.color = buttons[id].color;
    button.style.borderColor = buttons[id].color;
  }
}
