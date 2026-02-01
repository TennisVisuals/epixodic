/**
 * Point Logger
 * 
 * Captures all point metadata/decorations submitted to UMO for statistics analysis.
 * This helps us understand the full range of point decorations that hive-eye uses.
 */

export interface PointDecoration {
  winner: number;
  server?: number;
  result?: string;
  stroke?: string;
  hand?: string;
  rally?: any[];
  location?: string;
  serve?: number;
  breakpoint?: boolean;
  code?: string;
  timestamp?: number;
  
  // Additional fields we might discover
  [key: string]: any;
}

export class PointLogger {
  private logs: PointDecoration[] = [];
  private enabled: boolean = true;
  
  log(point: PointDecoration): void {
    if (!this.enabled) return;
    
    const logEntry = { 
      ...point, 
      timestamp: Date.now() 
    };
    
    this.logs.push(logEntry);
    
    // Pretty print to console for real-time monitoring (disabled for v3/v4 testing)
    // console.log('[HVE] Point decoration:', JSON.stringify(logEntry, null, 2));
  }
  
  export(): { logs: PointDecoration[], summary: any, stats: any } {
    return {
      logs: this.logs,
      summary: this.summarize(),
      stats: this.getStats()
    };
  }
  
  summarize() {
    const uniqueValues = (field: keyof PointDecoration) => {
      return [...new Set(this.logs.map(p => p[field]).filter(Boolean))];
    };
    
    return {
      results: uniqueValues('result').sort(),
      strokes: uniqueValues('stroke').sort(),
      hands: uniqueValues('hand').sort(),
      locations: uniqueValues('location').sort(),
      codes: uniqueValues('code').sort(),
      totalPoints: this.logs.length,
      fields: this.getFieldUsage()
    };
  }
  
  private getFieldUsage() {
    // Count how often each field is populated
    const fields: Record<string, number> = {};
    
    this.logs.forEach(log => {
      Object.keys(log).forEach(key => {
        if (log[key] !== undefined && key !== 'timestamp') {
          fields[key] = (fields[key] || 0) + 1;
        }
      });
    });
    
    return fields;
  }
  
  private getStats() {
    const resultCounts: Record<string, number> = {};
    const strokeCounts: Record<string, number> = {};
    
    this.logs.forEach(log => {
      if (log.result) {
        resultCounts[log.result] = (resultCounts[log.result] || 0) + 1;
      }
      if (log.stroke) {
        strokeCounts[log.stroke] = (strokeCounts[log.stroke] || 0) + 1;
      }
    });
    
    return {
      byResult: resultCounts,
      byStroke: strokeCounts,
      breakpoints: this.logs.filter(p => p.breakpoint).length
    };
  }
  
  clear(): void {
    this.logs = [];
    console.log('🗑️  Point log cleared');
  }
  
  enable(): void {
    this.enabled = true;
    console.log('✅ Point logging enabled');
  }
  
  disable(): void {
    this.enabled = false;
    console.log('⏸️  Point logging disabled');
  }
  
  download(filename: string = 'point-decorations.json'): void {
    const data = this.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`💾 Downloaded ${filename}`);
  }
}

// Global singleton instance
export const pointLogger = new PointLogger();

// Expose to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).pointLogger = pointLogger;
  (window as any).exportPointLogs = () => {
    const data = pointLogger.export();
    console.log('📊 Point Logs Export:', data);
    pointLogger.download();
    return data;
  };
  
  // Point Logger disabled for v3/v4 parallel testing
  // console.log('[HVE] Point Logger initialized. Available commands:');
  // console.log('[HVE]   window.exportPointLogs() - Export and download logs');
  // console.log('[HVE]   window.pointLogger.clear() - Clear logs');
  // console.log('[HVE]   window.pointLogger.disable() - Disable logging');
  // console.log('[HVE]   window.pointLogger.enable() - Enable logging');
}
