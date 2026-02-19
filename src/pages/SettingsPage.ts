import { ViewPage } from './ViewPage';

export class SettingsPage extends ViewPage {
  protected activate(): void {
    this.show('settings');
  }

  protected deactivate(): void {
    this.hide('settings');
  }
}
