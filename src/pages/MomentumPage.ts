import { ViewPage } from './ViewPage';
import { touchManager } from '../events/touchManager';
import { env, charts, getEpisodes } from '../state/env';

export class MomentumPage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = false;

    if (env.orientation === 'landscape') {
      this.hide('momentum');
      this.show('pts');
      charts.pts_match.data(getEpisodes());
      charts.pts_match.update();
    } else {
      this.show('momentum', 'inline');
      this.hide('pts');
    }

    const episodes = getEpisodes();
    charts.mc.width(window.innerWidth).height(820);
    charts.mc.data(episodes).update();
    charts.mc.update();
  }

  protected deactivate(): void {
    this.hide('momentum');
    this.hide('pts');
  }

  updateVisualizations(): void {
    const episodes = getEpisodes();
    if (env.orientation === 'landscape') {
      charts.pts_match.data(episodes);
      charts.pts_match.update();
    }
    charts.mc.data(episodes).update();
    charts.mc.update();
  }
}
