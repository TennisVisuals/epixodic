import { ViewPage } from './ViewPage';
import { touchManager } from '../events/touchManager';
import { charts, getEpisodes, getNoAd, getParticipantNames } from '../state/env';
import { ensureGameTreeChart } from '../display/configureViz';

function gametreeOptions() {
  const [player, opponent] = getParticipantNames();
  const noAd = getNoAd();
  return {
    display: { noAd },
    labels: { Player: player, Opponent: opponent },
  };
}

export class GameTreePage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = false;
    this.show('gametree');
    ensureGameTreeChart();

    // Defer chart update so browser completes layout after display change
    requestAnimationFrame(() => {
      if (!charts.gametree) return;
      charts.gametree.options(gametreeOptions());
      charts.gametree.data(getEpisodes()).update();
      charts.gametree.update({ sizeToFit: true });
    });
  }

  protected deactivate(): void {
    this.hide('gametree');
  }

  updateVisualizations(): void {
    if (!charts.gametree) return;
    charts.gametree.options(gametreeOptions());
    charts.gametree.data(getEpisodes()).update();
    charts.gametree.update({ sizeToFit: true });
  }
}
