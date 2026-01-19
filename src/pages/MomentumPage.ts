/**
 * Momentum Page
 * 
 * Displays momentum chart visualization.
 * Shows momentum chart (portrait) or pts chart (landscape).
 */

import { BasePage, PageOptions } from './BasePage';
import { env, charts } from '../transition/env';

export class MomentumPage extends BasePage {
  private currentOrientation: 'portrait' | 'landscape' = 'portrait';
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, options: PageOptions = {}) {
    super(container, options);
    this.detectOrientation();
  }

  protected async onBeforeMount(): Promise<void> {
    console.log('MomentumPage: Mounting...');
  }

  protected render(): void {
    this.container.innerHTML = '';
    this.container.className = 'momentum-page';

    // Create containers for both chart types
    const momentumContainer = this.createElement('div', {
      className: 'momentum-chart-container',
      id: 'momentum-chart-viz',
    });

    const ptsContainer = this.createElement('div', {
      className: 'pts-chart-container',
      id: 'pts-chart-viz',
    });

    this.container.appendChild(momentumContainer);
    this.container.appendChild(ptsContainer);

    // Show appropriate chart based on orientation
    this.updateChartDisplay();
  }

  protected async onMounted(): Promise<void> {
    console.log('MomentumPage: Mounted, rendering momentum charts...');
    
    this.renderMomentumChart();
    this.renderPtsChart();
    
    // Setup resize observer for responsive layout
    this.setupResizeObserver();
  }

  private detectOrientation(): void {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.currentOrientation = width > height ? 'landscape' : 'portrait';
    }
  }

  private updateChartDisplay(): void {
    const momentumContainer = this.container.querySelector('.momentum-chart-container') as HTMLElement;
    const ptsContainer = this.container.querySelector('.pts-chart-container') as HTMLElement;

    if (!momentumContainer || !ptsContainer) return;

    if (this.currentOrientation === 'landscape') {
      momentumContainer.style.display = 'none';
      ptsContainer.style.display = 'flex';
    } else {
      momentumContainer.style.display = 'inline';
      ptsContainer.style.display = 'none';
    }
  }

  private renderMomentumChart(): void {
    const point_episodes = env.match.history.action('addPoint');
    
    if (!charts.mc) {
      console.warn('Momentum chart not initialized');
      return;
    }

    // Configure momentum chart
    charts.mc.width(window.innerWidth).height(820);
    charts.mc.data(point_episodes).update();
    charts.mc.update();

    console.log(`MomentumPage: Rendered momentum chart with ${point_episodes.length} points`);
  }

  private renderPtsChart(): void {
    const point_episodes = env.match.history.action('addPoint');
    
    if (!charts.pts_match) {
      console.warn('PTS chart not initialized');
      return;
    }

    // Update pts chart
    charts.pts_match.update();

    console.log(`MomentumPage: Rendered PTS chart`);
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });

    this.resizeObserver.observe(this.container);
  }

  private handleResize(): void {
    const oldOrientation = this.currentOrientation;
    this.detectOrientation();

    if (oldOrientation !== this.currentOrientation) {
      console.log(`MomentumPage: Orientation changed to ${this.currentOrientation}`);
      this.updateChartDisplay();
      
      // Update charts with new dimensions
      if (this.currentOrientation === 'landscape') {
        this.renderPtsChart();
      } else {
        this.renderMomentumChart();
      }
    }
  }

  protected async onBeforeUnmount(): Promise<void> {
    console.log('MomentumPage: Unmounting...');
    
    // Cleanup resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  /**
   * Update charts with new data
   */
  updateCharts(): void {
    if (!this.mounted) return;
    
    this.renderMomentumChart();
    this.renderPtsChart();
  }
}
