/**
 * ============================================
 * REPORT GENERATOR v4.1.0
 * ============================================
 *
 * Automatische Reports:
 * - Daily Reports
 * - Weekly Reports
 * - Monthly Reports
 * - Activity Analysis
 * - Performance Reports
 *
 * @module stats/report-generator
 */

export class ReportGenerator {
  constructor() {
    this.dailyReports = new Map();
    this.weeklyReports = new Map();
    this.monthlyReports = new Map();
    this.performanceMetrics = [];
  }

  /**
   * Generate daily report
   */
  generateDailyReport(date, playerStats, serverAnalytics) {
    const dateStr = date.toDateString();

    // Collect daily data
    const activePlayers = Array.from(playerStats.entries()).filter(([_, stats]) => {
      return stats.lastSeen && (Date.now() - stats.lastSeen) < 86400000; // Last 24 hours
    });

    const report = {
      type: "daily",
      date: dateStr,
      timestamp: Date.now(),
      summary: {
        totalPlayers: activePlayers.length,
        totalPlaytime: this.sumPlaytime(activePlayers),
        totalKills: this.sumMetric(activePlayers, "kills"),
        totalDeaths: this.sumMetric(activePlayers, "deaths"),
        totalMessages: this.sumMetric(activePlayers, "messages"),
        totalBlocksPlaced: this.sumMetric(activePlayers, "blocksPlaced"),
        totalBlocksDestroyed: this.sumMetric(activePlayers, "blocksDestroyed"),
        totalAchievements: this.sumMetric(activePlayers, "achievements")
      },
      topPlayers: {
        byPlaytime: this.getTop5(activePlayers, "totalPlaytime"),
        byKills: this.getTop5(activePlayers, "kills"),
        byMessages: this.getTop5(activePlayers, "messages"),
        byBlocks: this.getTop5Combined(activePlayers, ["blocksPlaced", "blocksDestroyed"])
      },
      statistics: {
        averagePlaytime: this.calculateAverage(activePlayers.map(([_, s]) => s.totalPlaytime)),
        averageKillsPerPlayer: this.calculateAverage(activePlayers.map(([_, s]) => s.kills || 0)),
        averageMessagesPerPlayer: this.calculateAverage(activePlayers.map(([_, s]) => s.messages || 0))
      }
    };

    this.dailyReports.set(dateStr, report);
    return report;
  }

  /**
   * Generate weekly report
   */
  generateWeeklyReport(endDate, dailyReports) {
    const weekStart = new Date(endDate);
    weekStart.setDate(weekStart.getDate() - 7);

    const weeklyKey = `${weekStart.toDateString()} - ${endDate.toDateString()}`;

    // Aggregate daily reports
    let totalPlayers = new Set();
    let aggregated = {
      totalPlaytime: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalMessages: 0,
      totalBlocksPlaced: 0,
      totalBlocksDestroyed: 0,
      totalAchievements: 0,
      dailyReports: 0
    };

    for (const [dateStr, report] of dailyReports.entries()) {
      const reportDate = new Date(dateStr);
      if (reportDate >= weekStart && reportDate <= endDate) {
        aggregated.totalPlaytime += report.summary.totalPlaytime;
        aggregated.totalKills += report.summary.totalKills;
        aggregated.totalDeaths += report.summary.totalDeaths;
        aggregated.totalMessages += report.summary.totalMessages;
        aggregated.totalBlocksPlaced += report.summary.totalBlocksPlaced;
        aggregated.totalBlocksDestroyed += report.summary.totalBlocksDestroyed;
        aggregated.totalAchievements += report.summary.totalAchievements;
        aggregated.dailyReports++;
        totalPlayers.add(report.summary.totalPlayers);
      }
    }

    const report = {
      type: "weekly",
      period: weeklyKey,
      timestamp: Date.now(),
      summary: {
        totalDays: aggregated.dailyReports,
        uniquePlayers: totalPlayers.size,
        totalPlaytime: aggregated.totalPlaytime,
        totalKills: aggregated.totalKills,
        totalDeaths: aggregated.totalDeaths,
        totalMessages: aggregated.totalMessages,
        totalBlocksPlaced: aggregated.totalBlocksPlaced,
        totalBlocksDestroyed: aggregated.totalBlocksDestroyed,
        totalAchievements: aggregated.totalAchievements
      },
      averages: {
        playtimePerDay: aggregated.totalPlaytime / Math.max(aggregated.dailyReports, 1),
        killsPerDay: aggregated.totalKills / Math.max(aggregated.dailyReports, 1),
        deathsPerDay: aggregated.totalDeaths / Math.max(aggregated.dailyReports, 1),
        messagesPerDay: aggregated.totalMessages / Math.max(aggregated.dailyReports, 1)
      }
    };

    this.weeklyReports.set(weeklyKey, report);
    return report;
  }

  /**
   * Generate monthly report
   */
  generateMonthlyReport(month, year, dailyReports) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const monthKey = `${monthStart.getFullYear()}-${String(month).padStart(2, "0")}`;

    // Aggregate daily reports
    let totalPlayers = new Set();
    let aggregated = {
      totalPlaytime: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalMessages: 0,
      totalBlocksPlaced: 0,
      totalBlocksDestroyed: 0,
      totalAchievements: 0,
      dailyReports: 0
    };

    for (const [dateStr, report] of dailyReports.entries()) {
      const reportDate = new Date(dateStr);
      if (reportDate >= monthStart && reportDate <= monthEnd) {
        aggregated.totalPlaytime += report.summary.totalPlaytime;
        aggregated.totalKills += report.summary.totalKills;
        aggregated.totalDeaths += report.summary.totalDeaths;
        aggregated.totalMessages += report.summary.totalMessages;
        aggregated.totalBlocksPlaced += report.summary.totalBlocksPlaced;
        aggregated.totalBlocksDestroyed += report.summary.totalBlocksDestroyed;
        aggregated.totalAchievements += report.summary.totalAchievements;
        aggregated.dailyReports++;
        totalPlayers.add(report.summary.totalPlayers);
      }
    }

    const report = {
      type: "monthly",
      period: monthKey,
      timestamp: Date.now(),
      summary: {
        totalDays: aggregated.dailyReports,
        uniquePlayers: totalPlayers.size,
        totalPlaytime: aggregated.totalPlaytime,
        totalKills: aggregated.totalKills,
        totalDeaths: aggregated.totalDeaths,
        totalMessages: aggregated.totalMessages,
        totalBlocksPlaced: aggregated.totalBlocksPlaced,
        totalBlocksDestroyed: aggregated.totalBlocksDestroyed,
        totalAchievements: aggregated.totalAchievements
      },
      averages: {
        playtimePerDay: aggregated.totalPlaytime / Math.max(aggregated.dailyReports, 1),
        killsPerDay: aggregated.totalKills / Math.max(aggregated.dailyReports, 1),
        deathsPerDay: aggregated.totalDeaths / Math.max(aggregated.dailyReports, 1),
        messagesPerDay: aggregated.totalMessages / Math.max(aggregated.dailyReports, 1),
        playersPerDay: totalPlayers.size / Math.max(aggregated.dailyReports, 1)
      }
    };

    this.monthlyReports.set(monthKey, report);
    return report;
  }

  /**
   * Get report as Discord embed
   */
  getReportEmbed(report) {
    const typeEmoji = {
      daily: "📅",
      weekly: "📊",
      monthly: "📈"
    };

    const emoji = typeEmoji[report.type] || "📋";

    const fields = [
      { name: "Total Players", value: (report.summary.uniquePlayers || report.summary.totalPlayers).toString(), inline: true },
      { name: "Total Playtime", value: this.formatDuration(report.summary.totalPlaytime), inline: true },
      { name: "Total Kills", value: report.summary.totalKills.toString(), inline: true },
      { name: "Total Deaths", value: report.summary.totalDeaths.toString(), inline: true },
      { name: "Total Messages", value: report.summary.totalMessages.toString(), inline: true },
      { name: "Total Blocks", value: (report.summary.totalBlocksPlaced + report.summary.totalBlocksDestroyed).toString(), inline: true }
    ];

    if (report.averages) {
      fields.push({ name: "\u200b", value: "\u200b", inline: false });
      fields.push({ name: "Avg Playtime/Day", value: this.formatDuration(report.averages.playtimePerDay), inline: true });
      fields.push({ name: "Avg Kills/Day", value: report.averages.killsPerDay.toFixed(1), inline: true });
      fields.push({ name: "Avg Messages/Day", value: report.averages.messagesPerDay.toFixed(1), inline: true });
    }

    return {
      title: `${emoji} ${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report`,
      description: report.period,
      color: 0x3498DB,
      fields,
      timestamp: new Date(report.timestamp).toISOString()
    };
  }

  /**
   * Helper: Sum playtime
   */
  sumPlaytime(players) {
    return players.reduce((sum, [_, stats]) => sum + (stats.totalPlaytime || 0), 0);
  }

  /**
   * Helper: Sum metric
   */
  sumMetric(players, metric) {
    return players.reduce((sum, [_, stats]) => sum + (stats[metric] || 0), 0);
  }

  /**
   * Helper: Get top 5
   */
  getTop5(players, metric) {
    return players
      .map(([id, stats]) => ({ name: stats.name, value: stats[metric] || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }

  /**
   * Helper: Get top 5 combined
   */
  getTop5Combined(players, metrics) {
    return players
      .map(([id, stats]) => ({
        name: stats.name,
        value: metrics.reduce((sum, m) => sum + (stats[m] || 0), 0)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }

  /**
   * Helper: Calculate average
   */
  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  /**
   * Helper: Format duration
   */
  formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  /**
   * Export all reports
   */
  exportReports() {
    return {
      daily: Object.fromEntries(this.dailyReports),
      weekly: Object.fromEntries(this.weeklyReports),
      monthly: Object.fromEntries(this.monthlyReports),
      timestamp: new Date().toISOString()
    };
  }
}

export default ReportGenerator;
