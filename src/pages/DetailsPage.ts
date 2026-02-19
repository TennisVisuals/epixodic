import { ViewPage } from './ViewPage';
import { touchManager } from '../events/touchManager';

export class DetailsPage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = false;
    this.show('matchdetails');
  }

  protected deactivate(): void {
    this.hide('matchdetails');
  }
}
