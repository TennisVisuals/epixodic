/**
 * Stats Page
 * 
 * Displays match statistics and charts.
 * Replaces the stats view in viewManager.
 */

import { BasePage, PageOptions } from './BasePage';
import { env, options } from '../transition/env';
import { simpleChart } from '../visualizations/simpleChart';

export class StatsPage extends BasePage {
  private statsContainer: HTMLElement | null = null;
  private charts: any[] = [];

  constructor(container: HTMLElement, options: PageOptions = {}) {
    super(container, options);
  }

  protected async onBeforeMount(): Promise<void> {
    console.log('StatsPage: Mounting...');
  }

  protected render(): void {
    this.container.innerHTML = '';
    this.container.className = 'stats-page';

    // Create stats layout
    const header = this.createElement('div', {
      className: 'stats-header',
    });

    const statsContent = this.createElement('div', {
      className: 'stats-content',
      id: 'stats-content-container',
    });

    this.container.appendChild(header);
    this.container.appendChild(statsContent);

    this.statsContainer = statsContent;
  }

  protected async onMounted(): Promise<void> {
    console.log('StatsPage: Mounted, rendering statistics...');
    this.renderStats();
  }

  private renderStats(setFilter?: number): void {
    if (!this.statsContainer) return;

    // Clear existing content
    this.statsContainer.innerHTML = '';
    this.charts = [];

    const sets = env.match.sets().length;
    let html = '';

    // Set selector
    if (sets > 1) {
      html += '<div class="stats-set-selector">';
      html += '<button class="stats-set-btn" data-set="all">All Sets</button>';
      for (let i = 0; i < sets; i++) {
        html += `<button class="stats-set-btn" data-set="${i}">Set ${i + 1}</button>`;
      }
      html += '</div>';
    }

    // Stats content container
    html += '<div class="stats-charts-container"></div>';

    this.statsContainer.innerHTML = html;

    // Attach event listeners to set buttons
    const setButtons = this.statsContainer.querySelectorAll('.stats-set-btn');
    setButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const setNum = target.getAttribute('data-set');
        const filter = setNum === 'all' ? undefined : parseInt(setNum!);
        this.renderStats(filter);
      });
    });

    // Render stat charts
    this.renderStatCharts(setFilter);
  }

  private renderStatCharts(setFilter?: number): void {
    const chartsContainer = this.statsContainer?.querySelector('.stats-charts-container');
    if (!chartsContainer) return;

    // Reset stats calculation
    env.match.metadata.resetStats();

    const stats = env.match.metadata.calculateStats();
    const players = env.match.metadata.players();

    // Generate stat categories
    const statCategories = this.getStatCategories();

    statCategories.forEach(category => {
      const categoryDiv = this.createElement('div', {
        className: 'stat-category',
      });

      const categoryTitle = this.createElement('h3', {
        className: 'stat-category-title',
      });
      categoryTitle.textContent = category.title;

      categoryDiv.appendChild(categoryTitle);

      category.stats.forEach(statKey => {
        const chartContainer = this.createElement('div', {
          className: 'stat-chart-container',
        });

        const statData = this.getStatData(stats, statKey, players);
        
        if (statData) {
          const chart = simpleChart(chartContainer, statData);
          this.charts.push(chart);
        }

        categoryDiv.appendChild(chartContainer);
      });

      chartsContainer.appendChild(categoryDiv);
    });

    console.log(`StatsPage: Rendered ${this.charts.length} stat charts`);
  }

  private getStatCategories() {
    return [
      {
        title: 'Serve Statistics',
        stats: ['firstServePercentage', 'acesCount', 'doubleFaultsCount'],
      },
      {
        title: 'Return Statistics',
        stats: ['firstServeReturnWon', 'secondServeReturnWon'],
      },
      {
        title: 'Points Won',
        stats: ['servicePointsWon', 'returnPointsWon', 'totalPointsWon'],
      },
      {
        title: 'Break Points',
        stats: ['breakPointsConverted', 'breakPointsSaved'],
      },
    ];
  }

  private getStatData(stats: any, statKey: string, players: any[]) {
    // Extract stat data for both players
    // This is a simplified version - actual implementation would parse stats object
    
    if (!stats || !stats[statKey]) {
      return null;
    }

    return {
      label: this.formatStatLabel(statKey),
      values: [
        { label: players[0].participantName, value: stats[statKey][0] || 0 },
        { label: players[1].participantName, value: stats[statKey][1] || 0 },
      ],
    };
  }

  private formatStatLabel(key: string): string {
    // Convert camelCase to Title Case with spaces
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  protected async onBeforeUnmount(): Promise<void> {
    console.log('StatsPage: Unmounting...');
    
    // Cleanup charts
    this.charts.forEach(chart => {
      if (chart && chart.destroy) {
        chart.destroy();
      }
    });
    this.charts = [];
  }

  /**
   * Update statistics (e.g., when set filter changes)
   */
  updateStats(setFilter?: number): void {
    if (!this.mounted) return;
    this.renderStats(setFilter);
  }
}
