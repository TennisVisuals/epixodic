import { ViewPage } from './ViewPage';
import { touchManager } from '../events/touchManager';
import { env, options } from '../state/env';

export class EntryPage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = true;

    if (env.orientation === 'landscape') {
      this.show(options.horizontal_view);
      this.hide(options.vertical_view);
      this.hide('toolbar');
    } else {
      this.hide(options.horizontal_view);
      this.show(options.vertical_view);
      this.show('toolbar');
    }
  }

  protected deactivate(): void {
    this.hide(options.horizontal_view);
    this.hide(options.vertical_view);
    this.hide('toolbar');
  }
}
