import { ViewPage } from './ViewPage';
import { updateStats } from '../match/updateStats';
import { touchManager } from '../events/touchManager';

export class StatsPage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = false;
    this.show('statsscreen');
    updateStats();
  }

  protected deactivate(): void {
    this.hide('statsscreen');
  }

  updateVisualizations(): void {
    updateStats();
  }
}
