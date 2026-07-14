/**
 * ============================================
 * ADVANCED FEATURES CONFIGURATION v4.1.0
 * ============================================
 *
 * Konfiguration für alle erweiterten Features:
 * - Advanced Statistics
 * - Performance Monitoring
 * - Moderation Logging
 * - World Exploration
 * - Discord Dashboard
 * - Treasure Hunt
 * - Boss System
 *
 * @module config-advanced-features
 */

export const AdvancedFeaturesConfig = {
  // ============================================
  // ADVANCED STATISTICS
  // ============================================
  advancedStats: {
    enabled: true,

    // Achievement System
    achievements: {
      enabled: true,
      trackPlaytime: true,
      trackKills: true,
      trackDeaths: true,
      trackMessages: true,
      trackBlocks: true
    },

    // Login Streak System
    streaks: {
      enabled: true,
      trackLoginStreak: true,
      rewardMilestones: true,
      milestoneInterval: 7 // Days
    },

    // Activity Scoring
    activityScoring: {
      enabled: true,
      playtimeWeight: 0.3,
      killWeight: 0.2,
      messagingWeight: 0.2,
      buildingWeight: 0.2,
      explorationWeight: 0.1
    },

    // Leaderboard Configuration
    leaderboards: {
      enabled: true,
      topPlayersLimit: 10,
      updateInterval: 3600000, // 1 hour
      categories: ["playtime", "kills", "messages", "blocks", "achievements"]
    }
  },

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================
  performanceMonitoring: {
    enabled: true,

    recordingInterval: 60000, // 60 seconds
    historySize: 1000,

    // Performance Thresholds
    thresholds: {
      tpsWarning: 15,
      tpsAlert: 10,
      entityWarning: 500,
      entityAlert: 1000,
      chunkWarning: 50000,
      chunkAlert: 100000
    },

    // Alert Configuration
    alerts: {
      enabled: true,
      enableAutoAlert: true,
      discordNotification: true,
      deduplicationTime: 300000, // 5 minutes
      keepAlerts: 100
    },

    // Metrics to Track
    metrics: {
      trackTPS: true,
      trackPlayers: true,
      trackEntities: true,
      trackChunks: true,
      trackMemory: true
    }
  },

  // ============================================
  // MODERATION LOGGING
  // ============================================
  moderationLogging: {
    enabled: true,

    // Kick Configuration
    kicks: {
      enabled: true,
      logToDiscord: true,
      keepHistory: true
    },

    // Ban Configuration
    bans: {
      enabled: true,
      logToDiscord: true,
      temporaryBanDuration: 604800000, // 7 days default
      keepHistory: true
    },

    // Warning System
    warnings: {
      enabled: true,
      logToDiscord: true,
      maxWarningsBeforeAction: 3,
      actionType: "kick", // kick | mute | ban
      keepHistory: true
    },

    // Mute System
    mutes: {
      enabled: true,
      logToDiscord: true,
      defaultDuration: 3600000, // 1 hour
      keepHistory: true
    },

    // Spam Detection
    spam: {
      enabled: true,
      messageThreshold: 10, // messages
      timeWindow: 5000, // milliseconds
      violationThreshold: 3, // auto-mute after 3 violations
      autoMuteDuration: 600000 // 10 minutes
    },

    // History
    historySize: 500
  },

  // ============================================
  // WORLD EXPLORATION
  // ============================================
  worldExploration: {
    enabled: true,

    // Location Tracking
    locationTracking: {
      enabled: true,
      recordInterval: 5000, // 5 seconds
      maxLocations: 500
    },

    // Height Records
    heightTracking: {
      enabled: true,
      trackHighestPoint: true,
      trackLowestPoint: true,
      perDimension: true
    },

    // Dimension Tracking
    dimensionTracking: {
      enabled: true,
      trackVisits: true,
      trackFirstVisit: true,
      trackVisitCount: true
    },

    // Biome Discovery
    biomeDiscovery: {
      enabled: true,
      trackBiomes: true,
      trackFirstDiscovery: true,
      rewardDiscovery: true,
      discoverReward: 2000
    },

    // Exploration Metrics
    milestones: {
      distanceTraveled: 10000,
      dimensionVisit: 5000,
      highestPoint: 3000,
      newBiome: 2000
    }
  },

  // ============================================
  // TREASURE HUNT
  // ============================================
  treasureHunt: {
    enabled: true,

    // Block Tracking
    blocks: {
      enabled: true,
      trackRareBlocks: true,
      notifyDiscord: true
    },

    // Rarity Tiers
    rarities: {
      legendary: {
        enabled: true,
        notifyAll: true,
        reward: 1000
      },
      epic: {
        enabled: true,
        notifyAll: false,
        reward: 500
      },
      rare: {
        enabled: true,
        notifyAll: false,
        reward: 100
      },
      uncommon: {
        enabled: true,
        notifyAll: false,
        reward: 10
      }
    },

    // Mining Streaks
    streaks: {
      enabled: true,
      timeWindow: 120000, // 2 minutes
      notifyLongStreaks: true,
      longStreakThreshold: 5
    },

    // History
    historySize: 500
  },

  // ============================================
  // BOSS SYSTEM
  // ============================================
  bossSystem: {
    enabled: true,

    // Boss Encounters
    bossEncounters: {
      enabled: true,
      trackEncounters: true,
      notifyDefeat: true,
      notifyEncounter: false
    },

    // PvP Duels
    pvpDuels: {
      enabled: true,
      trackDuels: true,
      notifyDuels: true,
      rewardWinner: true,
      winnerReward: 20
    },

    // Epic Battles (3+ players)
    epicBattles: {
      enabled: true,
      minPlayersForEpic: 3,
      notifyBattles: true,
      rewardVictors: true,
      victoryRewardPerPlayer: 30
    },

    // Combat Statistics
    combatStats: {
      enabled: true,
      trackKillDeathRatio: true,
      trackBossKills: true,
      trackDuelWins: true
    },

    // History
    historySize: 500
  },

  // ============================================
  // DISCORD DASHBOARD
  // ============================================
  discordDashboard: {
    enabled: true,

    // Server Status Dashboard
    serverStatus: {
      enabled: true,
      updateInterval: 300000, // 5 minutes
      showTPS: true,
      showPlayers: true,
      showUptime: true,
      showChunks: true,
      showEntities: true
    },

    // Player List Dashboard
    playerList: {
      enabled: true,
      updateInterval: 600000, // 10 minutes
      groupByActivity: true,
      showPlaytime: true
    },

    // Statistics Dashboard
    statistics: {
      enabled: true,
      updateInterval: 1800000, // 30 minutes
      showTopPlayers: true,
      topPlayersLimit: 5
    },

    // Announcements
    announcements: {
      enabled: true,
      maxAnnouncements: 50,
      priorities: ["normal", "important", "critical", "news"]
    },

    // Health Indicator
    healthIndicator: {
      enabled: true,
      updateInterval: 300000, // 5 minutes
      tpsWarning: 15,
      tpsAlert: 10
    }
  },

  // ============================================
  // EMBED BUILDER
  // ============================================
  embedBuilder: {
    // Color Scheme
    colors: {
      info: 0x3498DB,
      success: 0x2ECC71,
      warning: 0xF39C12,
      error: 0xE74C3C,
      primary: 0x9B59B6,
      danger: 0xE91E63,
      gold: 0xFFD700,
      gray: 0x95A5A6
    },

    // Emoji Configuration
    emojis: {
      player: "👤",
      kill: "⚔️",
      death: "💀",
      achievement: "🏆",
      diamond: "💎",
      netherite: "🔷",
      gold: "🟨",
      emerald: "🟩",
      fire: "🔥",
      water: "💧",
      warning: "⚠️",
      check: "✅",
      x: "❌",
      star: "⭐",
      crown: "👑",
      streak: "🔥"
    },

    // Template Configuration
    templates: {
      playerJoin: true,
      playerLeave: true,
      playerDeath: true,
      playerKill: true,
      achievement: true,
      rareItemAlert: true,
      blockBroken: true,
      loginStreak: true,
      bossFight: true,
      playerStats: true,
      serverStatus: true
    }
  },

  // ============================================
  // REPORT GENERATION
  // ============================================
  reportGeneration: {
    enabled: true,

    // Daily Reports
    daily: {
      enabled: true,
      generateTime: "00:00", // UTC
      sendToDiscord: true,
      includeMetrics: true
    },

    // Weekly Reports
    weekly: {
      enabled: true,
      generateDay: "Monday",
      generateTime: "06:00", // UTC
      sendToDiscord: true,
      includeMetrics: true
    },

    // Monthly Reports
    monthly: {
      enabled: true,
      generateDay: 1, // First day of month
      generateTime: "06:00", // UTC
      sendToDiscord: true,
      includeMetrics: true
    },

    // Report Content
    content: {
      includeTopPlayers: true,
      topPlayersLimit: 5,
      includeStatistics: true,
      includeAverages: true,
      includeAchievements: true
    }
  },

  // ============================================
  // INTEGRATION & DATA
  // ============================================
  integration: {
    // Data Export
    dataExport: {
      enabled: true,
      autoExport: true,
      exportInterval: 3600000, // 1 hour
      formats: ["json"],
      exportPath: "./plugins/webhookbridge/data/exports"
    },

    // Discord Webhook Integration
    webhookIntegration: {
      enabled: true,
      embedMode: true,
      coloredEmbeds: true,
      includeTimestamps: true
    },

    // Data Retention
    dataRetention: {
      enabled: true,
      maxHistoryEntries: 500,
      cleanupInterval: 86400000, // 24 hours
      keepDays: 30
    }
  },

  // ============================================
  // LOGGING & DEBUG
  // ============================================
  logging: {
    // Console Logging
    console: {
      enabled: true,
      logLevel: "info", // debug | info | warn | error
      detailedErrors: true
    },

    // File Logging
    fileLogging: {
      enabled: true,
      logPath: "./plugins/webhookbridge/logs",
      maxLogSize: 10485760, // 10 MB
      archiveOldLogs: true
    },

    // Discord Logging
    discordLogging: {
      enabled: true,
      logErrors: true,
      logWarnings: true,
      logInitialization: true
    }
  }
};

export default AdvancedFeaturesConfig;
