import { showGameFish } from './configureViz';
import { showModal } from '../utils/utilities';
import { env, settings } from './env';

export function checkMatchEnd(action?: any) {
  if (env.engine.isComplete()) {
    const winnerIndex = (env.engine.getWinner() || 1) - 1;
    const winner = env.metadata.players[winnerIndex].participantName;
    showModal(
      `<div style="height: 50vh" class="flexcols flexcenter"><div>Match Complete!</div><div>Winner: ${winner}</div></div>`
    );
    return true;
  } else if (action?.game?.complete && settings.display_gamefish) {
    showGameFish();
  }
}
