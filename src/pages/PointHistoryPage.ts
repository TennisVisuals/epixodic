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
    console.log('[HVE] PointHistory - renderHistory() called');
    if (!this.historyContainer) {
      console.error('[HVE] PointHistory - historyContainer is null!');
      return;
    }

    // V3 data (drives visualization)
    const points = env.match.history.points();
    console.log('[HVE] PointHistory - V3 returned points:', points.length);
    if (points.length > 0) {
      console.log('[HVE] PointHistory - V3 first point sample:', {
        winner: points[0].winner,
        server: points[0].server,
        result: points[0].result,
        score: points[0].score
      });
    }
    
    // V4 data (parallel testing)
    const v4_points = env.matchUp.history?.points || [];
    console.log('[HVE] PointHistory - V4 returned points:', v4_points.length);
    if (v4_points.length > 0) {
      console.log('[HVE] PointHistory - V4 first point sample:', {
        winner: v4_points[0].winner,
        server: v4_points[0].server,
        result: v4_points[0].result,
        pointNumber: v4_points[0].pointNumber
      });
    }
    
    console.log('[HVE] PointHistory - Count match:', points.length === v4_points.length);
    console.log('[HVE] PointHistory - Calling displayPointHistory() with', points.length, 'points');

    // Use existing displayPointHistory function
    // This function updates the DOM directly
    displayPointHistory();
    
    console.log('[HVE] PointHistory - ✅ Visualization rendering COMPLETE');
    console.log(`PointHistoryPage: Rendered ${points.length} points`);
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
