/**
 * ============================================
 * DISCORD DASHBOARD v4.1.0
 * ============================================
 *
 * Automatische Discord Updates:
 * - Live Server Status
 * - Spieler Status Board
 * - Echtzeit Statistiken
 * - News und Announcements
 * - Status Channels Management
 *
 * @module dashboard/discord-dashboard
 */

export class DiscordDashboard {
  constructor(sendWebhook, config) {
    this.sendWebhook = sendWebhook;
    this.config = config;
    this.dashboardMessages = new Map();
    this.statusUpdates = [];
    this.announcements = [];
    this.lastUpdateTimes = new Map();
    this.updateIntervals = {
      status: 300000, // 5 minutes
      playerList: 600000, // 10 minutes
      statistics: 1800000, // 30 minutes
      news: 3600000 // 1 hour
    };
  }

  /**
   * Generate server status dashboard
   */
  generateServerStatusDashboard(serverData) {
    const statusEmoji = serverData.tps >= 18 ? "✅" : serverData.tps >= 10 ? "⚠️" : "🔴";
    const tpsColor = serverData.tps >= 18 ? 0x2ECC71 : serverData.tps >= 10 ? 0xF39C12 : 0xE74C3C;

    const embed = {
      title: `${statusEmoji} Server Status Dashboard`,
      description: `Real-time server performance and player information`,
      color: tpsColor,
      fields: [
        {
          name: "👥 Online Players",
          value: `${serverData.onlinePlayers}/${serverData.maxPlayers}`,
          inline: true
        },
        {
          name: "⏱️ TPS",
          value: `${serverData.tps.toFixed(2)}`,
          inline: true
        },
        {
          name: "⏰ Uptime",
          value: this.formatDuration(serverData.uptime),
          inline: true
        },
        {
          name: "🗂️ Loaded Chunks",
          value: serverData.chunks?.toString() || "N/A",
          inline: true
        },
        {
          name: "🎭 Entities",
          value: serverData.entities?.toString() || "N/A",
          inline: true
        },
        {
          name: "💾 Memory Usage",
          value: serverData.memory || "N/A",
          inline: true
        },
        {
          name: "📊 Status Summary",
          value:
            serverData.tps >= 18
              ? "🟢 All systems normal"
              : serverData.tps >= 10
                ? "🟡 Minor performance issues"
                : "🔴 Server struggling - Low TPS",
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Last updated"
      }
    };

    this.dashboardMessages.set("server_status", {
      embed,
      lastUpdated: Date.now()
    });

    return embed;
  }

  /**
   * Generate player list dashboard
   */
  generatePlayerListDashboard(players) {
    const groupedByActivity = {
      active: [],
      idle: [],
      afk: []
    };

    for (const player of players) {
      if (player.lastActivityTime && Date.now() - player.lastActivityTime < 300000) {
        // Active in last 5 minutes
        groupedByActivity.active.push(player);
      } else if (player.lastActivityTime && Date.now() - player.lastActivityTime < 1800000) {
        // Idle in last 30 minutes
        groupedByActivity.idle.push(player);
      } else {
        // AFK
        groupedByActivity.afk.push(player);
      }
    }

    const playerLists = [];

    if (groupedByActivity.active.length > 0) {
      playerLists.push({
        name: `🟢 Active (${groupedByActivity.active.length})`,
        value: groupedByActivity.active.map((p) => `• ${p.name} (${Math.floor(p.playtime / 3600000)}h)`).join("\n"),
        inline: false
      });
    }

    if (groupedByActivity.idle.length > 0) {
      playerLists.push({
        name: `🟡 Idle (${groupedByActivity.idle.length})`,
        value: groupedByActivity.idle.map((p) => `• ${p.name}`).join("\n"),
        inline: false
      });
    }

    if (groupedByActivity.afk.length > 0) {
      playerLists.push({
        name: `⚪ AFK (${groupedByActivity.afk.length})`,
        value: groupedByActivity.afk.map((p) => `• ${p.name}`).join("\n"),
        inline: false
      });
    }

    const embed = {
      title: "👥 Online Players",
      description: `Total: ${players.length}/${players.length} players`,
      color: 0x3498DB,
      fields:
        playerLists.length > 0
          ? playerLists
          : [
              {
                name: "Server Status",
                value: "No players online",
                inline: false
              }
            ],
      timestamp: new Date().toISOString()
    };

    this.dashboardMessages.set("player_list", {
      embed,
      lastUpdated: Date.now()
    });

    return embed;
  }

  /**
   * Generate statistics dashboard
   */
  generateStatisticsDashboard(stats) {
    const topKillers = stats.topPlayers?.byKills?.slice(0, 5) || [];
    const topPlaytime = stats.topPlayers?.byPlaytime?.slice(0, 5) || [];

    const embed = {
      title: "📊 Server Statistics",
      description: "Overall server performance and player rankings",
      color: 0x9B59B6,
      fields: [
        {
          name: "📈 Total Statistics",
          value:
            `Total Playtime: ${this.formatDuration(stats.totalPlaytime || 0)}\n` +
            `Total Kills: ${stats.totalKills || 0}\n` +
            `Total Deaths: ${stats.totalDeaths || 0}`,
          inline: false
        }
      ]
    };

    // Add top killers
    if (topKillers.length > 0) {
      embed.fields.push({
        name: "⚔️ Top Killers",
        value: topKillers.map((p, i) => `${i + 1}. ${p.name || p} - ${p.value || 0} kills`).join("\n"),
        inline: true
      });
    }

    // Add top playtime
    if (topPlaytime.length > 0) {
      embed.fields.push({
        name: "🕐 Most Active",
        value: topPlaytime.map((p, i) => `${i + 1}. ${p.name || p}`).join("\n"),
        inline: true
      });
    }

    embed.timestamp = new Date().toISOString();

    this.dashboardMessages.set("statistics", {
      embed,
      lastUpdated: Date.now()
    });

    return embed;
  }

  /**
   * Post announcement
   */
  postAnnouncement(title, message, author = "Server", priority = "normal") {
    const colorMap = {
      normal: 0x3498DB,
      important: 0xF39C12,
      critical: 0xE74C3C,
      news: 0x9B59B6
    };

    const announcement = {
      title,
      message,
      author,
      priority,
      timestamp: Date.now(),
      id: Date.now().toString()
    };

    this.announcements.push(announcement);
    if (this.announcements.length > 50) {
      this.announcements.shift();
    }

    const emoji = {
      normal: "📢",
      important: "⚠️",
      critical: "🔴",
      news: "📰"
    }[priority];

    const embed = {
      title: `${emoji} ${title}`,
      description: message,
      color: colorMap[priority] || colorMap.normal,
      author: {
        name: author
      },
      timestamp: new Date(announcement.timestamp).toISOString()
    };

    return embed;
  }

  /**
   * Get announcement feed embed
   */
  getAnnouncementFeedEmbed() {
    const recentAnnouncements = this.announcements.slice(-5).reverse();

    const fields = recentAnnouncements.map((ann) => {
      const emoji = {
        normal: "📢",
        important: "⚠️",
        critical: "🔴",
        news: "📰"
      }[ann.priority];

      return {
        name: `${emoji} ${ann.title}`,
        value: `${ann.message}\n_by ${ann.author}_`,
        inline: false
      };
    });

    return {
      title: "📰 Recent Announcements",
      description: `Latest ${Math.min(5, this.announcements.length)} announcements`,
      color: 0x9B59B6,
      fields: fields.length > 0 ? fields : [{ name: "No announcements", value: "Check back soon!" }],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get all dashboard embeds
   */
  getAllDashboardEmbeds() {
    const embeds = [];

    for (const [name, data] of this.dashboardMessages.entries()) {
      embeds.push({
        name,
        embed: data.embed,
        lastUpdated: data.lastUpdated
      });
    }

    return embeds;
  }

  /**
   * Check if update is needed for specific metric
   */
  shouldUpdate(metric) {
    const lastUpdate = this.lastUpdateTimes.get(metric);
    const interval = this.updateIntervals[metric] || 300000;

    if (!lastUpdate || Date.now() - lastUpdate > interval) {
      this.lastUpdateTimes.set(metric, Date.now());
      return true;
    }

    return false;
  }

  /**
   * Format duration
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
   * Get health status indicator
   */
  getHealthIndicator(tps, playerCount, memory) {
    let status = "✅ HEALTHY";
    let color = 0x2ECC71;

    const issues = [];

    if (tps < 15) issues.push(`Low TPS (${tps.toFixed(2)})`);
    if (playerCount === 0) issues.push("No players online");
    if (memory && memory > 85) issues.push("High memory usage");

    if (issues.length > 0) {
      status = issues.length > 1 ? "🔴 CRITICAL" : "⚠️ WARNING";
      color = issues.length > 1 ? 0xE74C3C : 0xF39C12;
    }

    return {
      status,
      color,
      issues
    };
  }

  /**
   * Export dashboard data
   */
  exportDashboardData() {
    const dashboardObj = {};
    for (const [name, data] of this.dashboardMessages.entries()) {
      dashboardObj[name] = data.embed;
    }

    return {
      dashboards: dashboardObj,
      announcements: this.announcements,
      lastUpdates: Object.fromEntries(this.lastUpdateTimes),
      timestamp: new Date().toISOString()
    };
  }
}

export default DiscordDashboard;
