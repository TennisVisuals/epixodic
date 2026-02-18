import { ViewPage } from './ViewPage';
import { displayMatchArchive } from '../match/displayMatchArchive';
import { touchManager } from '../events/touchManager';

export class MatchArchivePage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = false;
    displayMatchArchive();
    this.show('matcharchive');
  }

  protected deactivate(): void {
    this.hide('matcharchive');
  }
}
