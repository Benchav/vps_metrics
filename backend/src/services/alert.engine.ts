import type { SystemAlert } from '@vps-metrics/shared';

// We maintain history inside the engine or let the orchestrator pass it.
// The orchestrator will pass the history array, and the engine will mutate it or return new alerts to append.
// Returning new alerts is cleaner.

export class AlertEngine {
  private history: SystemAlert[] = [];

  constructor(private maxHistory = 100) {}

  public getHistory() {
    return this.history;
  }

  public evaluate(metrics: any): SystemAlert[] {
    const newAlerts: SystemAlert[] = [];

    const addAlert = (type: SystemAlert['type'], level: SystemAlert['level'], message: string, value: number) => {
      // Debounce logic: 10s window
      const now = Date.now();
      const recent = this.history.find(
        (a) => a.type === type && a.level === level && (now - new Date(a.timestamp).getTime()) < 10000
      );
      if (recent) return;

      const alert: SystemAlert = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        type,
        level,
        message,
        value,
      };
      
      newAlerts.push(alert);
      this.history.unshift(alert);
      if (this.history.length > this.maxHistory) {
        this.history.pop();
      }
    };

    if (metrics.cpu.load > 95) {
      addAlert('cpu', 'danger', `Critical CPU Load: ${metrics.cpu.load.toFixed(1)}%`, metrics.cpu.load);
    } else if (metrics.cpu.load > 85) {
      addAlert('cpu', 'warning', `High CPU Load: ${metrics.cpu.load.toFixed(1)}%`, metrics.cpu.load);
    }

    if (metrics.memory.usagePercentage > 95) {
      addAlert('ram', 'danger', `Critical RAM: ${metrics.memory.usagePercentage.toFixed(1)}%`, metrics.memory.usagePercentage);
    } else if (metrics.memory.usagePercentage > 85) {
      addAlert('ram', 'warning', `High RAM Usage: ${metrics.memory.usagePercentage.toFixed(1)}%`, metrics.memory.usagePercentage);
    }

    metrics.disks.forEach((d: any) => {
      if (d.usePercentage > 95) {
        addAlert('disk', 'danger', `Critical Disk ${d.fs}: ${d.usePercentage.toFixed(1)}%`, d.usePercentage);
      } else if (d.usePercentage > 90) {
        addAlert('disk', 'warning', `Disk ${d.fs} almost full: ${d.usePercentage.toFixed(1)}%`, d.usePercentage);
      }
    });

    return newAlerts;
  }
}
