import { ViewPage } from './ViewPage';
import { displayPointHistory } from '../display/displayPointHistory';
import { touchManager } from '../events/touchManager';

export class PointHistoryPage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = false;
    displayPointHistory();
    this.show('pointhistory');
  }

  protected deactivate(): void {
    this.hide('pointhistory');
  }

  updateVisualizations(): void {
    displayPointHistory();
  }
}
