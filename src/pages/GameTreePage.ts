/**
 * Game Tree Page
 * 
 * Displays the game tree visualization with RallyTree below it.
 * This is the first page component created in the migration.
 */

import { BasePage, PageOptions } from './BasePage';
import { env } from '../transition/env';
import { RallyTreeViz } from '../visualizations/rallyTreeWrapper';
import * as d3 from 'd3';
import { gameTree } from '../visualizations/gameTree';

export class GameTreePage extends BasePage {
  private gameTreeContainer: HTMLElement | null = null;
  private rallyTreeContainer: HTMLElement | null = null;
  private rallyTree: RallyTreeViz | null = null;
  private gameTreeChart: any = null; // Store chart instance to reuse
  private chartBound: boolean = false; // Track if we've called chart() on this instance

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
    
    // TODO: Render Rally Tree (disabled until Game Tree working)
    // this.renderRallyTree();
  }

  private renderGameTreeLegacy(): void {
    if (!this.gameTreeContainer) return;

    const point_episodes = env.match.history.action('addPoint');
    const noAd = env.match.format.structure?.setFormat?.NoAD || false;
    
    // Create gameTree instance only once, reuse on subsequent renders
    if (!this.gameTreeChart) {
      this.gameTreeChart = gameTree();
    }
    const freshGameTree = this.gameTreeChart;
    
    // Configure with options from configureViz.ts
    const pcolors = { players: ['#a55194', '#6b6ecf'] };
    const options = {
      display: { sizeToFit: true, noAd },
      lines: {
        points: { winners: 'green', errors: '#BA1212', unknown: '#2ed2db' },
        colors: { underlines: 'black' }
      },
      nodes: {
        colors: {
          0: pcolors.players[0],
          1: pcolors.players[1],
          neutral: '#ecf0f1'
        }
      },
      selectors: {
        enabled: true,
        selected: { 0: true, 1: true }  // Show both players by default
      }
    };
    
    freshGameTree.options(options);
    
    // Call chart on selection BEFORE setting data (matches configureViz.ts pattern)
    const selection = d3.select(this.gameTreeContainer);
    selection.call(freshGameTree);
    
    // Add padding to gametreeRoot after it's created
    const gametreeRoot = this.gameTreeContainer.querySelector('.gametreeRoot') as HTMLElement;
    if (gametreeRoot) {
      gametreeRoot.style.paddingTop = '4em';
    }
    
    // Set data and update (matches viewManager pattern)
    freshGameTree.data(point_episodes).update();
    
    // Use requestAnimationFrame to ensure DOM is fully rendered before sizeToFit
    requestAnimationFrame(() => {
      freshGameTree.update({ sizeToFit: true });
    });
  }

  private renderRallyTree(): void {
    
    if (!this.rallyTreeContainer) {
      console.error('GameTreePage: rallyTreeContainer is null!');
      return;
    }

    console.log('GameTreePage: rallyTreeContainer dimensions:', {
      width: this.rallyTreeContainer.clientWidth,
      height: this.rallyTreeContainer.clientHeight,
      offsetWidth: this.rallyTreeContainer.offsetWidth,
      offsetHeight: this.rallyTreeContainer.offsetHeight
    });

    // Create RallyTree visualization
    if (!this.rallyTree) {
      console.log('GameTreePage: Creating new RallyTreeViz instance');
      this.rallyTree = new RallyTreeViz(this.rallyTreeContainer, {
        width: this.rallyTreeContainer.clientWidth || 800,
        height: this.rallyTreeContainer.clientHeight || 400,
      });
      console.log('GameTreePage: RallyTreeViz created:', this.rallyTree);
    }

    // Get point episodes and update rally tree
    const point_episodes = env.match.history.action('addPoint');
    console.log(`GameTreePage: Updating rally tree with ${point_episodes.length} points`);
    
    if (this.rallyTree) {
      this.rallyTree.update(point_episodes);
      console.log('GameTreePage: Rally tree update complete');
    } else {
      console.error('GameTreePage: rallyTree is null after creation attempt!');
    }
  }

  protected async onBeforeUnmount(): Promise<void> {
    console.log('GameTreePage: Unmounting...');
    
    // Cleanup rally tree
    if (this.rallyTree) {
      this.rallyTree.destroy();
      this.rallyTree = null;
    }
  }

  /**
   * Update visualizations with new data
   */
  updateVisualizations(): void {
    if (!this.mounted) return;
    
    this.renderGameTreeLegacy();
    this.renderRallyTree();
  }
}
