import { touchManager } from '../events/touchManager';
import type { ScoringSkin } from './types';

export abstract class BaseSkin implements ScoringSkin {
  abstract readonly id: string;
  abstract readonly label: string;
  abstract readonly orientation: 'vertical' | 'horizontal';

  private _rendered = false;
  private root: HTMLElement | null = null;

  get rendered(): boolean {
    return this._rendered;
  }

  render(container: HTMLElement): void {
    if (this._rendered) return;

    const root = document.createElement('div');
    root.id = this.id;
    root.className = 'noselect';
    root.style.display = 'none';

    this.buildDOM(root);
    container.appendChild(root);
    this.root = root;

    const holdTargets = root.querySelectorAll('.pressAndHold');
    holdTargets.forEach((target) => touchManager.addPressAndHold(target));

    this._rendered = true;
  }

  show(): void {
    if (this.root) this.root.style.display = 'flex';
  }

  hide(): void {
    if (this.root) this.root.style.display = 'none';
  }

  destroy(): void {
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
    this._rendered = false;
  }

  protected abstract buildDOM(root: HTMLElement): void;
}
