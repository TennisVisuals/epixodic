/**
 * Point Logger
 * 
 * Captures all point metadata/decorations submitted to UMO for statistics analysis.
 * This helps us understand the full range of point decorations that epixodic uses.
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
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
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
  }
}

// Global singleton instance
export const pointLogger = new PointLogger();

// Expose to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).pointLogger = pointLogger;
  (window as any).exportPointLogs = () => {
    const data = pointLogger.export();
    pointLogger.download();
    return data;
  };
}
