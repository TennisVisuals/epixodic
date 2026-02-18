/**
 * Point History Page
 * 
 * Displays a chronological list of all points in the match.
 * Allows viewing and editing individual points.
 */

import { BasePage, PageOptions } from './BasePage';
import { env } from '../transition/env';
import { displayPointHistory } from '../transition/displayPointHistory';

export class PointHistoryPage extends BasePage {
  private historyContainer: HTMLElement | null = null;

  constructor(container: HTMLElement, options: PageOptions = {}) {
    super(container, options);
  }

  protected async onBeforeMount(): Promise<void> {
    console.log('PointHistoryPage: Mounting...');
  }

  protected render(): void {
    this.container.innerHTML = '';
    this.container.className = 'point-history-page';

    // Create header
    const header = this.createElement('div', {
      className: 'point-history-header',
    });

    const title = this.createElement('h2', {
      className: 'point-history-title',
    });
    title.textContent = 'Point History';

    header.appendChild(title);

    // Create history container
    // IMPORTANT: displayPointHistory() expects id='ph_frame'
    const historyContent = this.createElement('div', {
      className: 'point-history-content',
      id: 'ph_frame',
    });

    this.container.appendChild(header);
    this.container.appendChild(historyContent);

    this.historyContainer = historyContent;
  }

  protected async onMounted(): Promise<void> {
    console.log('PointHistoryPage: Mounted, rendering point history...');
    this.renderHistory();
  }

  private renderHistory(): void {
    if (!this.historyContainer) return;

    const points = env.engine.getState().history?.points || [];
    console.log('[HVE] PointHistory - Rendering', points.length, 'points');

    // Use existing displayPointHistory function (updates DOM directly)
    displayPointHistory();
  }

  protected async onBeforeUnmount(): Promise<void> {
    console.log('PointHistoryPage: Unmounting...');
  }

  /**
   * Refresh history (called when points are added/removed)
   */
  refresh(): void {
    if (!this.mounted) return;
    this.renderHistory();
  }
}
