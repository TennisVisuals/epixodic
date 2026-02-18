import { ViewPage } from './ViewPage';
import { touchManager } from '../events/touchManager';
import { charts, getEpisodes, getNoAd } from '../state/env';
import { ensureGameTreeChart } from '../display/configureViz';

export class GameTreePage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = false;
    this.show('gametree');
    ensureGameTreeChart();

    // Defer chart update so browser completes layout after display change
    requestAnimationFrame(() => {
      if (!charts.gametree) return;
      const episodes = getEpisodes();
      const noAd = getNoAd();
      charts.gametree.options({ display: { noAd } });
      charts.gametree.data(episodes).update();
      charts.gametree.update({ sizeToFit: true });
    });
  }

  protected deactivate(): void {
    this.hide('gametree');
  }

  updateVisualizations(): void {
    if (!charts.gametree) return;
    const episodes = getEpisodes();
    const noAd = getNoAd();
    charts.gametree.options({ display: { noAd } });
    charts.gametree.data(episodes).update();
    charts.gametree.update({ sizeToFit: true });
  }
}
