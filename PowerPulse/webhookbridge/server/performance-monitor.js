/**
 * ============================================
 * PERFORMANCE MONITOR v4.1.0
 * ============================================
 *
 * Server Performance Tracking:
 * - TPS Monitoring
 * - Chunk Loading
 * - Entity Count
 * - Performance Alerts
 * - Historical Data
 *
 * @module server/performance-monitor
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.maxMetrics = 1000;
    this.alerts = [];
    this.tpsHistory = [];
    this.performanceThresholds = {
      tpsWarning: 15,
      tpsAlert: 10,
      entityWarning: 500,
      entityAlert: 1000,
      chunkWarning: 50000,
      chunkAlert: 100000
    };
  }

  /**
   * Record performance metric
   */
  recordMetric(world, system) {
    try {
      const metric = {
        timestamp: Date.now(),
        tps: this.calculateTPS(),
        players: world.getAllPlayers().length,
        entities: this.countEntities(world),
        loadedChunks: this.estimateChunks(world),
        memoryUsage: this.getMemoryUsage()
      };

      this.metrics.push(metric);
      if (this.metrics.length > this.maxMetrics) {
        this.metrics.shift();
      }

      // Track TPS history
      this.tpsHistory.push(metric.tps);
      if (this.tpsHistory.length > 200) {
        this.tpsHistory.shift();
      }

      // Check for performance issues
      this.checkPerformanceAlerts(metric);

      return metric;
    } catch (error) {
      console.warn("[PerformanceMonitor] Metric recording error:", error.message);
      return null;
    }
  }

  /**
   * Calculate TPS (Ticks Per Second)
   */
  calculateTPS() {
    // Bedrock doesn't have direct TPS access
    // Return estimated value based on tick performance
    // In a real implementation, this would use actual server metrics
    return 20; // Maximum TPS
  }

  /**
   * Count entities in world
   */
  countEntities(world) {
    try {
      let count = 0;
      for (const player of world.getAllPlayers()) {
        const dimension = player.dimension;
        const entities = dimension.getEntities({
          location: player.location,
          maxDistance: 128 // 128 block radius
        });
        count += entities.length;
      }
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Estimate loaded chunks
   */
  estimateChunks(world) {
    try {
      // Rough estimate based on player positions
      const players = world.getAllPlayers();
      if (players.length === 0) return 0;

      let totalChunks = new Set();
      for (const player of players) {
        const x = Math.floor(player.location.x / 16);
        const z = Math.floor(player.location.z / 16);

        // Player load distance (roughly 14 chunks in each direction)
        for (let dx = -14; dx <= 14; dx++) {
          for (let dz = -14; dz <= 14; dz++) {
            totalChunks.add(`${x + dx},${z + dz}`);
          }
        }
      }

      return totalChunks.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage() {
    // Bedrock doesn't expose memory directly
    // Return placeholder - would need server-specific implementation
    return {
      estimated: 0,
      chunks: this.metrics.length * 100 // Rough estimate
    };
  }

  /**
   * Check for performance alerts
   */
  checkPerformanceAlerts(metric) {
    if (metric.tps < this.performanceThresholds.tpsAlert) {
      this.addAlert({
        type: "LOW_TPS",
        severity: "CRITICAL",
        value: metric.tps,
        threshold: this.performanceThresholds.tpsAlert,
        message: `Server TPS dropped to ${metric.tps.toFixed(2)}`
      });
    } else if (metric.tps < this.performanceThresholds.tpsWarning) {
      this.addAlert({
        type: "LOW_TPS",
        severity: "WARNING",
        value: metric.tps,
        threshold: this.performanceThresholds.tpsWarning,
        message: `Server TPS is ${metric.tps.toFixed(2)}`
      });
    }

    if (metric.entities > this.performanceThresholds.entityAlert) {
      this.addAlert({
        type: "HIGH_ENTITIES",
        severity: "CRITICAL",
        value: metric.entities,
        threshold: this.performanceThresholds.entityAlert,
        message: `Too many entities: ${metric.entities}`
      });
    } else if (metric.entities > this.performanceThresholds.entityWarning) {
      this.addAlert({
        type: "HIGH_ENTITIES",
        severity: "WARNING",
        value: metric.entities,
        threshold: this.performanceThresholds.entityWarning,
        message: `High entity count: ${metric.entities}`
      });
    }

    if (metric.loadedChunks > this.performanceThresholds.chunkAlert) {
      this.addAlert({
        type: "HIGH_CHUNKS",
        severity: "CRITICAL",
        value: metric.loadedChunks,
        threshold: this.performanceThresholds.chunkAlert,
        message: `Too many loaded chunks: ${metric.loadedChunks}`
      });
    }
  }

  /**
   * Add alert to queue
   */
  addAlert(alert) {
    // Prevent duplicate alerts within 5 minutes
    const recentSimilar = this.alerts.filter(
      (a) => a.type === alert.type && Date.now() - a.timestamp < 300000
    );

    if (recentSimilar.length === 0) {
      this.alerts.push({
        ...alert,
        timestamp: Date.now()
      });

      // Keep last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts.shift();
      }
    }
  }

  /**
   * Get average TPS
   */
  getAverageTPS(last = 20) {
    const recentTPS = this.tpsHistory.slice(-last);
    if (recentTPS.length === 0) return 20;
    return recentTPS.reduce((a, b) => a + b) / recentTPS.length;
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    if (this.metrics.length === 0) {
      return {
        status: "No data",
        metrics: []
      };
    }

    const lastMetric = this.metrics[this.metrics.length - 1];
    const avgTPS = this.getAverageTPS(60);
    const activeAlerts = this.alerts.filter((a) => Date.now() - a.timestamp < 600000);

    return {
      status: avgTPS >= 15 ? "Healthy" : avgTPS >= 10 ? "Warning" : "Critical",
      lastMetric,
      averageTPS: avgTPS,
      totalMetrics: this.metrics.length,
      activeAlerts: activeAlerts.length,
      recentAlerts: activeAlerts.slice(-5)
    };
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(minutes = 5) {
    const timeWindow = minutes * 60 * 1000;
    const now = Date.now();

    return this.metrics.filter((m) => now - m.timestamp <= timeWindow);
  }

  /**
   * Export performance data
   */
  exportPerformanceData() {
    return {
      metrics: this.metrics,
      alerts: this.alerts,
      tpsHistory: this.tpsHistory,
      report: this.getPerformanceReport(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get performance embed
   */
  getPerformanceEmbed() {
    const report = this.getPerformanceReport();
    const lastMetric = report.lastMetric;

    const statusColor = report.status === "Healthy" ? 0x2ECC71 : report.status === "Warning" ? 0xF39C12 : 0xE74C3C;
    const statusEmoji = report.status === "Healthy" ? "✅" : report.status === "Warning" ? "⚠️" : "🔴";

    return {
      title: `${statusEmoji} Server Performance`,
      description: `Status: ${report.status}`,
      color: statusColor,
      fields: [
        { name: "Current TPS", value: lastMetric.tps.toFixed(2), inline: true },
        { name: "Average TPS", value: report.averageTPS.toFixed(2), inline: true },
        { name: "Players", value: lastMetric.players.toString(), inline: true },
        { name: "Entities", value: lastMetric.entities.toString(), inline: true },
        { name: "Loaded Chunks", value: lastMetric.loadedChunks.toString(), inline: true },
        { name: "Active Alerts", value: report.activeAlerts.length.toString(), inline: true }
      ],
      timestamp: new Date().toISOString()
    };
  }
}

export default PerformanceMonitor;
