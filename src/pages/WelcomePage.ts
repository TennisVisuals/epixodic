import { ViewPage } from './ViewPage';

export class WelcomePage extends ViewPage {
  private onEnter: (() => void) | null = null;

  protected activate(): void {
    this.show('welcome');

    const btn = document.querySelector('.landing-enter');
    if (btn) {
      this.onEnter = () => {
        const router = (window as any).appRouter;
        router?.navigate('/archive');
      };
      btn.addEventListener('click', this.onEnter);
    }
  }

  protected deactivate(): void {
    if (this.onEnter) {
      const btn = document.querySelector('.landing-enter');
      btn?.removeEventListener('click', this.onEnter);
      this.onEnter = null;
    }
    this.hide('welcome');
  }
}
