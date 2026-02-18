import { ViewPage } from './ViewPage';

export class WelcomePage extends ViewPage {
  protected activate(): void {
    this.show('welcome');
  }

  protected deactivate(): void {
    this.hide('welcome');
  }
}
