/**
 * Rally Tree Wrapper
 * 
 * TypeScript wrapper for RallyTree.js visualization.
 * Adapts point episode data from UMO to RallyTree format.
 */

import * as d3 from 'd3';
import { rallyCount } from '../functions/legacyRally';

// Import RallyTree factory function
import rallyTreeFactory from './RallyTree.js';

// Make d3 globally available for RallyTree.js (legacy code expects it)
if (typeof window !== 'undefined') {
  (window as any).d3 = d3;
}

export class RallyTreeViz {
  private chart: any;
  // private container: HTMLElement;
  private selection: any;

  constructor(container: HTMLElement, options: any = {}) {
    console.log('RallyTreeViz: constructor called', { container, options });
    
    // Create D3 selection
    this.selection = d3.select(container);
    console.log('RallyTreeViz: D3 selection created', this.selection);
    
    // Initialize RallyTree using the imported factory
    if (!rallyTreeFactory) {
      console.error('RallyTree factory not available');
      return;
    }
    
    console.log('RallyTreeViz: Creating chart from factory');
    this.chart = rallyTreeFactory();
    console.log('RallyTreeViz: Chart created', this.chart);
    
    // Set initial options
    const chartOptions = {
      width: options.width || container.clientWidth || 800,
      height: options.height || container.clientHeight || 400,
      orientation: 'horizontal',
      display: { sizeToFit: true }
    };
    console.log('RallyTreeViz: Setting options', chartOptions);
    this.chart.options(chartOptions);
    
    // Call the chart on the selection
    console.log('RallyTreeViz: Calling chart on selection');
    this.selection.call(this.chart);
    console.log('RallyTreeViz: Constructor complete');
  }

  /**
   * Update visualization with point episodes
   */
  update(episodes: any[]): void {
    console.log('RallyTreeViz: update() called', { episodes: episodes?.length, hasChart: !!this.chart });
    
    if (!this.chart) {
      console.warn('RallyTree chart not initialized');
      return;
    }

    if (!episodes || episodes.length === 0) {
      console.log('RallyTreeViz: No episodes to display');
      return;
    }

    // Add rallyLength method to each point for RallyTree
    const pointsWithRallyLength = episodes.map(ep => ({
      ...ep.point,
      winner: ep.point.winner,
      server: ep.point.server,
      rally: ep.point.rally,
      rallyLength: function() {
        return this.rally ? rallyCount(this.rally) : 0;
      }
    }));

    console.log('RallyTreeViz: Processed points', {
      count: pointsWithRallyLength.length,
      sample: pointsWithRallyLength[0]
    });

    // Update the chart with processed points
    // RallyTree uses D3 pattern: call chart with data, then call it on selection
    console.log('RallyTreeViz: Setting chart data using D3 pattern');
    
    // Set the data on the chart (returns the chart for chaining)
    const chartWithData = this.chart.data ? 
      this.chart.data(pointsWithRallyLength) : 
      this.chart;
    
    console.log('RallyTreeViz: Chart with data', chartWithData);
    
    // Update by calling the chart on the selection again
    if (chartWithData.update) {
      console.log('RallyTreeViz: Calling chart.update()');
      chartWithData.update({ sizeToFit: true });
      console.log('RallyTreeViz: Update complete');
    } else {
      console.log('RallyTreeViz: No update method, re-calling chart on selection');
      this.selection.call(chartWithData);
      console.log('RallyTreeViz: Chart re-rendered');
    }
  }

  /**
   * Resize visualization
   */
  resize(width?: number, height?: number): void {
    if (!this.chart) return;
    
    const newOptions: any = {};
    if (width) newOptions.width = width;
    if (height) newOptions.height = height;
    
    if (Object.keys(newOptions).length > 0) {
      this.chart.options(newOptions);
      if (this.chart.update) {
        this.chart.update({ sizeToFit: true });
      }
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    // D3 cleanup
    this.selection.selectAll('*').remove();
    this.chart = null;
  }
}
