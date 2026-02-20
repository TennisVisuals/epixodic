import { showGameFish } from '../display/configureViz';
import { env, settings } from '../state/env';

export function checkMatchEnd(action?: any) {
  if (env.engine.isComplete()) {
    return true;
  } else if (action?.game?.complete && settings.display_gamefish) {
    showGameFish();
  }
}
