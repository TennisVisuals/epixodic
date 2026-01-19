import { showGameFish } from './configureViz';
import { showModal } from './utilities';
import { env, settings } from './env';

export function checkMatchEnd(action?: any) {
  if (env.match.complete()) {
    const winner = env.match.metadata.players()[env.match.winner()].participantName;
    showModal(
      `<div style="height: 50vh" class="flexcols flexcenter"><div>Match Complete!</div><div>Winner: ${winner}</div></div>`
    );
    return true;
  } else if (action?.game?.complete && settings.display_gamefish) {
    showGameFish();
  }
}
