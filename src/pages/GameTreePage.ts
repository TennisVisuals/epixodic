/**
 * Game Tree Page
 *
 * Displays the game tree visualization.
 * This is the first page component created in the migration.
 */

import { gameTree } from '@tennisvisuals/scoring-visualizations';
import { BasePage, PageOptions } from './BasePage';
import { env, getEpisodes, getNoAd } from '../transition/env';
import * as d3 from 'd3';

export class GameTreePage extends BasePage {
  private gameTreeContainer: HTMLElement | null = null;

  constructor(container: HTMLElement, options: PageOptions = {}) {
    super(container, options);
  }

  protected async onBeforeMount(): Promise<void> {
    // Mount lifecycle hook
  }

  protected render(): void {
    // Save fixedMenu header before clearing
    const fixedMenu = this.container.querySelector('.fixedmenu');

    // Clear container completely
    this.container.innerHTML = '';
    this.container.className = 'game-tree-page';

    // Restore fixedMenu header
    if (fixedMenu) {
      this.container.appendChild(fixedMenu);
    }

    // Use container directly for game tree
    this.gameTreeContainer = this.container;
  }

  protected async onMounted(): Promise<void> {
    // Render Game Tree using legacy charts.gametree
    this.renderGameTreeLegacy();
  }

  private renderGameTreeLegacy(): void {
    if (!this.gameTreeContainer) {
      console.error('[HVE] GameTree - gameTreeContainer is null!');
      return;
    }

    const episodes_for_visualization = getEpisodes();

    const noAd = getNoAd();

    // Always create a fresh chart instance - the library may not support reuse
    console.log('[HVE] GameTree - Creating fresh chart instance');
    const freshGameTree = gameTree();

    const players = env.metadata.players;

    // Configure with options from configureViz.ts
    const pcolors = { players: ['#a55194', '#6b6ecf'] };
    const options = {
      display: { sizeToFit: true, noAd },
      lines: {
        points: { winners: 'green', errors: '#BA1212', unknown: '#2ed2db' },
        colors: { underlines: 'black' },
      },
      nodes: {
        colors: {
          0: pcolors.players[0],
          1: pcolors.players[1],
          neutral: '#ecf0f1',
        },
      },
      selectors: {
        enabled: true,
        selected: { 0: true, 1: true }, // Show both players by default
      },
      labels: {
        Game: 'GAME',
        Player: players[0].participantName,
        Opponent: players[1].participantName,
      },
    };

    freshGameTree.options(options);
    console.log('[HVE] GameTree - Configured options for visualization');

    // Always bind chart - library requires it
    const selection = d3.select(this.gameTreeContainer);
    console.log('[HVE] GameTree - Calling selection.call(chart)...');
    try {
      selection.call(freshGameTree);
      console.log('[HVE] GameTree - selection.call() completed successfully');
    } catch (error) {
      console.error('[HVE] GameTree - ❌ selection.call() FAILED:', error);
      return;
    }

    // Add padding to gametreeRoot after it's created
    const gametreeRoot = this.gameTreeContainer.querySelector('.gametreeRoot') as HTMLElement;
    if (gametreeRoot) {
      gametreeRoot.style.paddingTop = '4em';
      console.log('[HVE] GameTree - Added padding to gametreeRoot');
    }

    // Update data and render
    try {
      console.log('[HVE] GameTree - Setting data with', episodes_for_visualization.length, 'episodes');
      freshGameTree.data(episodes_for_visualization);
      console.log('[HVE] GameTree - Data set successfully');

      console.log('[HVE] GameTree - Calling chart.update({})...');
      freshGameTree.update({});
      console.log('[HVE] GameTree - chart.update() completed');
    } catch (error) {
      console.error('[HVE] GameTree - ❌ data/update FAILED:', error);
      return;
    }

    // Use requestAnimationFrame to ensure DOM is fully rendered before sizeToFit
    requestAnimationFrame(() => {
      console.log('[HVE] GameTree - Calling chart.update({sizeToFit: true})...');
      try {
        freshGameTree.update({ sizeToFit: true });
        console.log('[HVE] GameTree - ✅ Visualization rendering COMPLETE');
      } catch (error) {
        console.error('[HVE] GameTree - ❌ sizeToFit update FAILED:', error);
      }
    });
  }

  protected async onBeforeUnmount(): Promise<void> {
    console.log('GameTreePage: Unmounting...');

  }

  /**
   * Update visualizations with new data
   */
  updateVisualizations(): void {
    if (!this.mounted) return;

    this.renderGameTreeLegacy();
  }
}
