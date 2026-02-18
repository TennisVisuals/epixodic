import { ViewPage } from './ViewPage';
import { displayFormats } from '../display/displayFormats';
import { touchManager } from '../events/touchManager';

export class FormatPage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = false;
    displayFormats();
    this.show('matchformats');
  }

  protected deactivate(): void {
    this.hide('matchformats');
  }
}
