/**
 * Rally Tree Wrapper
 * 
 * TypeScript wrapper for RallyTree.js visualization.
 * Adapts point episode data from UMO to RallyTree format.
 */

// @ts-ignore - RallyTree.js is plain JavaScript
import RallyTree from './RallyTree.js';

export interface RallyData {
  points: any[];
  rallies: any[];
}

export class RallyTreeViz {
  private tree: any;
  private container: HTMLElement;
  private options: any;

  constructor(container: HTMLElement, options: any = {}) {
    this.container = container;
    this.options = {
      width: options.width || container.clientWidth || 800,
      height: options.height || container.clientHeight || 400,
      ...options
    };

    // Initialize RallyTree
    // Note: Will need to check RallyTree.js API to see how to properly initialize
    // For now, creating a placeholder structure
    this.tree = null;
  }

  /**
   * Update visualization with point episodes
   */
  update(episodes: any[]): void {
    if (!episodes || episodes.length === 0) {
      this.renderEmptyState();
      return;
    }

    const rallyData = this.extractRallyData(episodes);
    this.render(rallyData);
  }

  /**
   * Extract rally data from point episodes
   */
  private extractRallyData(episodes: any[]): RallyData {
    const rallies: any[] = [];
    
    episodes.forEach((episode, index) => {
      // Extract rally information from episode
      // This will depend on what data UMO provides in episodes
      const rally = {
        pointNumber: index + 1,
        server: episode.server,
        winner: episode.winner,
        shots: this.extractShots(episode),
        // Add more rally metadata as needed
      };
      
      rallies.push(rally);
    });

    return {
      points: episodes,
      rallies,
    };
  }

  /**
   * Extract shot sequence from episode
   */
  private extractShots(episode: any): any[] {
    // TODO: Parse shot data from episode
    // For now, return empty array - will implement when we know episode structure
    const shots: any[] = [];
    
    // Check if episode has rally/shot data
    if (episode.rally && Array.isArray(episode.rally)) {
      return episode.rally.map((shot: any, index: number) => ({
        shotNumber: index + 1,
        player: shot.player,
        type: shot.type,
        // Add more shot attributes
      }));
    }
    
    return shots;
  }

  /**
   * Render rally tree visualization
   */
  private render(data: RallyData): void {
    // Clear container
    this.container.innerHTML = '';

    // TODO: Initialize and render RallyTree when we understand its API
    // For now, render a data summary
    const summary = this.createElement('div', {
      className: 'rallytree-summary',
      style: {
        padding: '20px',
        fontFamily: 'monospace',
        fontSize: '12px',
      }
    });

    summary.innerHTML = `
      <h3>Rally Tree Data</h3>
      <p>Total rallies: ${data.rallies.length}</p>
      <p>Integration in progress...</p>
      <details>
        <summary>Rally Data Preview</summary>
        <pre>${JSON.stringify(data.rallies.slice(0, 3), null, 2)}</pre>
      </details>
    `;

    this.container.appendChild(summary);
  }

  /**
   * Render empty state
   */
  private renderEmptyState(): void {
    this.container.innerHTML = '';
    
    const empty = this.createElement('div', {
      className: 'rallytree-empty',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#999',
      }
    });
    
    empty.textContent = 'No rally data available';
    this.container.appendChild(empty);
  }

  /**
   * Resize visualization
   */
  resize(width?: number, height?: number): void {
    if (width) this.options.width = width;
    if (height) this.options.height = height;
    
    // Re-render with new dimensions
    // this.tree?.resize(this.options.width, this.options.height);
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    if (this.tree && typeof this.tree.destroy === 'function') {
      this.tree.destroy();
    }
    this.container.innerHTML = '';
  }

  /**
   * Utility: Create element
   */
  private createElement(tag: string, attrs: any = {}): HTMLElement {
    const element = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value as string;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value as string);
      }
    });
    
    return element;
  }
}
