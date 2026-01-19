/**
 * Game Tree Page
 * 
 * Displays the game tree visualization with RallyTree below it.
 * This is the first page component created in the migration.
 */

import { BasePage, PageOptions } from './BasePage';
import { env, charts } from '../transition/env';
import { RallyTreeViz } from '../visualizations/rallyTreeWrapper';

export class GameTreePage extends BasePage {
  private gameTreeContainer: HTMLElement | null = null;
  private rallyTreeContainer: HTMLElement | null = null;
  private rallyTree: RallyTreeViz | null = null;

  constructor(container: HTMLElement, options: PageOptions = {}) {
    super(container, options);
  }

  protected async onBeforeMount(): Promise<void> {
    console.log('GameTreePage: Mounting...');
  }

  protected render(): void {
    // Create page layout
    this.container.innerHTML = '';
    this.container.className = 'game-tree-page';

    // Create two-section layout
    const gameTreeSection = this.createElement('div', {
      className: 'gametree-section',
      id: 'gametree-viz-container',
    });

    const rallyTreeSection = this.createElement('div', {
      className: 'rallytree-section',
      id: 'rallytree-viz-container',
    });

    const divider = this.createElement('div', {
      className: 'section-divider',
    });

    this.container.appendChild(gameTreeSection);
    this.container.appendChild(divider);
    this.container.appendChild(rallyTreeSection);

    this.gameTreeContainer = gameTreeSection;
    this.rallyTreeContainer = rallyTreeSection;
  }

  protected async onMounted(): Promise<void> {
    console.log('GameTreePage: Mounted, rendering visualizations...');
    
    // Render Game Tree
    this.renderGameTree();
    
    // Render Rally Tree (placeholder for now)
    this.renderRallyTree();
  }

  private renderGameTree(): void {
    if (!this.gameTreeContainer) return;

    const point_episodes = env.match.history.action('addPoint');
    
    // Check NoAD from Factory structure
    const noAd = env.match.format.structure?.setFormat?.NoAD || false;
    
    // Configure and render game tree
    charts.gametree.options({ display: { noAd } });
    charts.gametree.data(point_episodes).update();
    charts.gametree.update({ sizeToFit: true });

    console.log(`GameTreePage: Rendered game tree with ${point_episodes.length} points`);
  }

  private renderRallyTree(): void {
    if (!this.rallyTreeContainer) return;

    // Create RallyTree visualization
    if (!this.rallyTree) {
      this.rallyTree = new RallyTreeViz(this.rallyTreeContainer, {
        width: this.rallyTreeContainer.clientWidth,
        height: this.rallyTreeContainer.clientHeight || 400,
      });
    }

    // Get point episodes and update rally tree
    const point_episodes = env.match.history.action('addPoint');
    this.rallyTree.update(point_episodes);
    
    console.log(`GameTreePage: Rally tree updated with ${point_episodes.length} points`);
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
    
    this.renderGameTree();
    this.renderRallyTree();
  }
}
