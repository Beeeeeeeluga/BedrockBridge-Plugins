/**
 * ============================================
 * SERVER ANALYTICS MODULE v4.1.0
 * ============================================
 *
 * Server-wide analytics and reporting:
 * - Daily/weekly/monthly stats
 * - Peak player times
 * - Uptime tracking
 * - Performance metrics
 * - Trend analysis
 *
 * @module stats/server-analytics
 */

import { world, system } from "@minecraft/server";

export class ServerAnalytics {
  constructor() {
    this.sessions = [];
    this.dailyStats = new Map();
    this.performanceMetrics = [];
    this.startTime = Date.now();
    this.lastTick = Date.now();
  }

  /**
   * Initialize server analytics tracking
   */
  initialize() {
    console.info("[ServerAnalytics] Server analytics initialized");
  }

  /**
   * Record hourly server statistics
   */
  recordHourlyStats(playerStats) {
    try {
      const now = new Date();
      const dateKey = this.getDateKey(now);
      const hourKey = `${dateKey}:${now.getHours()}`;

      const players = world.getAllPlayers();
      const playerCount = players.length;

      const hourlyData = {
        timestamp: Date.now(),
        hour: now.getHours(),
        playerCount,
        playerNames: players.map(p => p.name),
        eventCount: 0, // Would be populated by event archive
        peakTime: playerCount > 5,
        serverHealthy: true
      };

      // Store by hour
      if (!this.dailyStats.has(dateKey)) {
        this.dailyStats.set(dateKey, []);
      }

      const dayData = this.dailyStats.get(dateKey);
      dayData.push(hourlyData);

      // Keep only last 24 hours
      if (dayData.length > 24) {
        dayData.shift();
      }

      return hourlyData;
    } catch (error) {
      console.error("[ServerAnalytics] Failed to record hourly stats:", error.message);
      return null;
    }
  }

  /**
   * Record server session
   */
  recordSession(startTime, endTime, playerCount = 0) {
    const session = {
      startTime,
      endTime,
      duration: endTime - startTime,
      playerCount,
      peakPlayers: playerCount,
      timestamp: Date.now()
    };

    this.sessions.push(session);

    // Keep only last 100 sessions
    if (this.sessions.length > 100) {
      this.sessions.shift();
    }

    return session;
  }

  /**
   * Record performance metric
   */
  recordPerformanceMetric(tps, memoryUsage, chunkCount = 0) {
    const metric = {
      timestamp: Date.now(),
      tps: parseFloat(tps).toFixed(1),
      memoryUsage,
      chunkCount,
      healthy: parseFloat(tps) > 15
    };

    this.performanceMetrics.push(metric);

    // Keep only last 1000 metrics (about 16 hours at 1 per minute)
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics.shift();
    }

    return metric;
  }

  /**
   * Get daily statistics
   */
  getDailyStats(date = null) {
    const dateKey = date ? this.formatDate(new Date(date)) : this.getDateKey(new Date());
    const dayData = this.dailyStats.get(dateKey) || [];

    if (dayData.length === 0) {
      return {
        date: dateKey,
        noData: true
      };
    }

    const playerCounts = dayData.map(h => h.playerCount);
    const avgPlayers = Math.round(playerCounts.reduce((a, b) => a + b, 0) / playerCounts.length);
    const maxPlayers = Math.max(...playerCounts);
    const minPlayers = Math.min(...playerCounts);

    // Find peak hours
    const peakHours = dayData
      .filter(h => h.playerCount >= maxPlayers * 0.7)
      .map(h => h.hour);

    return {
      date: dateKey,
      totalHours: dayData.length,
      avgPlayers,
      maxPlayers,
      minPlayers,
      peakHours: [...new Set(peakHours)],
      hourlyBreakdown: dayData.map(h => ({
        hour: h.hour,
        players: h.playerCount,
        names: h.playerNames
      }))
    };
  }

  /**
   * Get weekly statistics
   */
  getWeeklyStats() {
    const stats = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const daily = this.getDailyStats(date);
      if (!daily.noData) {
        stats.push(daily);
      }
    }

    const avgPlayers = stats.length > 0
      ? Math.round(stats.reduce((sum, d) => sum + d.avgPlayers, 0) / stats.length)
      : 0;

    const totalUniquePlayers = new Set();
    stats.forEach(day => {
      day.hourlyBreakdown?.forEach(hour => {
        hour.names?.forEach(name => totalUniquePlayers.add(name));
      });
    });

    return {
      week: `${new Date(new Date().setDate(today.getDate() - 6)).toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`,
      daysTracked: stats.length,
      avgPlayersPerDay: avgPlayers,
      uniquePlayers: totalUniquePlayers.size,
      dailyBreakdown: stats.map(d => ({
        date: d.date,
        avgPlayers: d.avgPlayers,
        maxPlayers: d.maxPlayers
      }))
    };
  }

  /**
   * Get monthly statistics
   */
  getMonthlyStats() {
    const stats = [];
    const today = new Date();
    const daysInMonth = 30; // Simplified

    for (let i = daysInMonth - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const daily = this.getDailyStats(date);
      if (!daily.noData) {
        stats.push(daily);
      }
    }

    const avgPlayers = stats.length > 0
      ? Math.round(stats.reduce((sum, d) => sum + d.avgPlayers, 0) / stats.length)
      : 0;

    return {
      month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
      daysTracked: stats.length,
      avgPlayersPerDay: avgPlayers,
      weeklyBreakdown: this.groupByWeek(stats)
    };
  }

  /**
   * Get server uptime
   */
  getUptime() {
    const uptimeMs = Date.now() - this.startTime;
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return {
      uptimeMs,
      uptimeString: `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`,
      startTime: new Date(this.startTime).toISOString(),
      currentTime: new Date().toISOString(),
      sessions: this.sessions.length,
      avgSessionDuration: this.sessions.length > 0
        ? Math.round(this.sessions.reduce((sum, s) => sum + s.duration, 0) / this.sessions.length / 1000)
        : 0
    };
  }

  /**
   * Get performance report
   */
  getPerformanceReport(periodHours = 1) {
    const cutoffTime = Date.now() - periodHours * 60 * 60 * 1000;
    const recentMetrics = this.performanceMetrics.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length === 0) {
      return { noData: true };
    }

    const tpsValues = recentMetrics.map(m => parseFloat(m.tps));
    const avgTps = (tpsValues.reduce((a, b) => a + b, 0) / tpsValues.length).toFixed(1);
    const minTps = Math.min(...tpsValues).toFixed(1);
    const maxTps = Math.max(...tpsValues).toFixed(1);

    const lagSpikes = recentMetrics.filter(m => parseFloat(m.tps) < 15).length;
    const healthyMeasurements = recentMetrics.filter(m => m.healthy).length;

    return {
      periodHours,
      measurements: recentMetrics.length,
      avgTps,
      minTps,
      maxTps,
      lagSpikes,
      healthyPercent: ((healthyMeasurements / recentMetrics.length) * 100).toFixed(1),
      recommendation: parseFloat(avgTps) > 18 ? "Server running smoothly" : "Monitor server performance"
    };
  }

  /**
   * Get peak player times
   */
  getPeakTimes(daysBack = 7) {
    const peakHours = new Map();

    const today = new Date();
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const daily = this.getDailyStats(date);

      if (!daily.noData && daily.peakHours) {
        daily.peakHours.forEach(hour => {
          peakHours.set(hour, (peakHours.get(hour) || 0) + 1);
        });
      }
    }

    const sorted = Array.from(peakHours.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        peakDays: count
      }));

    return {
      daysAnalyzed: daysBack,
      peakHours: sorted.slice(0, 5)
    };
  }

  /**
   * Get trend analysis
   */
  getTrendAnalysis(metric = "playerCount", daysBack = 30) {
    const stats = [];
    const today = new Date();

    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const daily = this.getDailyStats(date);
      if (!daily.noData) {
        stats.push({
          date: daily.date,
          value: metric === "playerCount" ? daily.avgPlayers : 0
        });
      }
    }

    // Simple trend calculation
    if (stats.length < 2) {
      return { trend: "insufficient_data" };
    }

    const firstHalf = stats.slice(0, Math.floor(stats.length / 2));
    const secondHalf = stats.slice(Math.floor(stats.length / 2));

    const avgFirst = firstHalf.reduce((sum, s) => sum + s.value, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, s) => sum + s.value, 0) / secondHalf.length;

    const change = avgSecond - avgFirst;
    const changePercent = ((change / Math.max(avgFirst, 1)) * 100).toFixed(1);

    return {
      metric,
      daysBack,
      trend: change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable",
      changePercent,
      avgFirst: Math.round(avgFirst),
      avgSecond: Math.round(avgSecond)
    };
  }

  /**
   * Create analytics report for Discord
   */
  createDiscordReport(type = "daily") {
    let report;

    switch (type) {
      case "daily":
        report = this.getDailyStats();
        break;
      case "weekly":
        report = this.getWeeklyStats();
        break;
      case "monthly":
        report = this.getMonthlyStats();
        break;
      default:
        report = this.getDailyStats();
    }

    return {
      type,
      timestamp: new Date().toISOString(),
      data: report
    };
  }

  /**
   * Helper: Get date key
   */
  getDateKey(date) {
    return this.formatDate(date);
  }

  /**
   * Helper: Format date as YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper: Group stats by week
   */
  groupByWeek(stats) {
    const weeks = [];
    let currentWeek = [];

    for (const stat of stats) {
      if (currentWeek.length >= 7) {
        weeks.push({
          avgPlayers: Math.round(currentWeek.reduce((sum, s) => sum + s.avgPlayers, 0) / currentWeek.length),
          days: currentWeek.length
        });
        currentWeek = [];
      }
      currentWeek.push(stat);
    }

    if (currentWeek.length > 0) {
      weeks.push({
        avgPlayers: Math.round(currentWeek.reduce((sum, s) => sum + s.avgPlayers, 0) / currentWeek.length),
        days: currentWeek.length
      });
    }

    return weeks;
  }
}

export default ServerAnalytics;
