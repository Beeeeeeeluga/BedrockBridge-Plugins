/**
 * ============================================
 * ENHANCED WEBHOOK CONFIGURATION v4.1.0
 * ============================================
 *
 * Umfassende Konfiguration für das erweiterte Discord Webhook Plugin v4.1.0
 * mit Advanced Statistics, Event Archival und Server Analytics
 * sowie allen erweiterten Optionen und Best Practices.
 */

export const WHConfig = {
  // ========================================
  // DISCORD WEBHOOK URLs
  // ========================================
  webhooks: {
    // System Events
    general: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",
    serverEvents: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",
    errors: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",

    // Player Events
    playerEvents: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",
    deaths: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",
    achievements: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",

    // Gameplay
    chat: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",
    commands: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",
    blockLogs: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",

    // World Events
    worldEvents: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",
    weatherEvents: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",

    // Moderation & Analytics
    moderation: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",
    analytics: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE",
    teleportLogs: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID_HERE"
  },

  // ========================================
  // FEATURE TOGGLES
  // ========================================
  features: {
    // Chat Configuration
    chat: {
      enabled: true,
      logToDiscord: true,
      showPlayerTags: true,
      antiSpam: true,
      mentionEveryone: false,
      maxMessageLength: 2000
    },

    // Player Tracking
    players: {
      joinLeave: true,
      firstJoin: true,
      welcomeMessage: true,
      locationTracking: true,
      inventoryTracking: true,
      afkDetection: true,
      afkTimeout: 300000, // 5 minutes
      achievements: true,
      playTimeTacking: true
    },

    // Combat & PvP
    combat: {
      deathMessages: true,
      pvpKills: true,
      itemDropAlerts: true,
      mobKills: true,
      advancedDeathInfo: true
    },

    // World Events
    world: {
      bossKills: true,
      weatherChanges: true,
      timeChanges: false,
      dimensionChanges: true,
      eventAnnouncements: true
    },

    // Block & Container Monitoring
    blocks: {
      valuable: true,
      containers: true,
      spawners: true,
      watchlist: [
        "diamond",
        "netherite",
        "ancient_debris",
        "beacon",
        "dragon_egg",
        "emerald",
        "gold",
        "lapis"
      ]
    },

    // Item Tracking
    items: {
      watchlist: [
        "diamond",
        "netherite",
        "elytra",
        "totem",
        "enchanted_golden_apple",
        "beacon",
        "dragon_egg"
      ],
      trackDrops: true,
      trackPickup: true
    },

    // Moderation
    moderation: {
      commands: true,
      teleports: true,
      gamemode: true,
      bans: true,
      kicks: true,
      mutePlayers: true
    },

    // Analytics
    analytics: {
      enabled: true,
      hourlyReports: true,
      dailyReports: true,
      trackPlaytime: true,
      trackKills: true,
      trackDeaths: true,
      detailedStats: true
    },

    // Server Management
    server: {
      startStop: true,
      performanceAlerts: true,
      tpsMonitoring: true,
      healthChecks: true,
      autoReporting: true
    },

    // ========================================
    // v4.1.0 EXPANSION FEATURES
    // ========================================

    // Entity Events (v4.1.0)
    entityEvents: true,
    entityDamage: true,
    entityDeath: true,
    projectileHits: true,

    // Item Events (v4.1.0)
    itemEvents: true,
    itemPickup: true,
    itemDrop: true,
    crafting: true,
    smelting: true,
    containerAccess: true,

    // Statistics Tracking (v4.1.0)
    playerStats: true,
    blockStats: true,
    chatStats: true,
    achievementTracking: true,
    playtimeTracking: true,
    killDeathTracking: true,
    loginStreakTracking: true,

    // Server Analytics (v4.1.0)
    serverAnalytics: true,
    hourlyAnalytics: true,
    dailyAnalytics: true,
    weeklyAnalytics: true,
    performanceTracking: true,
    peakTimeTracking: true,

    // Event Archival (v4.1.0)
    eventArchival: true,
    eventQuerying: true,
    eventSearch: true,
    eventExport: true,

    // Data Persistence (v4.1.0)
    dataPersistence: true,
    jsonStorage: true,
    csvExport: true,
    autoBackup: true,
    dataRetention: 30 // days
  },

  // ========================================
  // APPEARANCE & FORMATTING
  // ========================================
  appearance: {
    // Server Identity
    serverName: "My Minecraft Server",
    serverIcon: "https://via.placeholder.com/128",
    serverRegion: "EU",
    serverVersion: "1.20.0",

    // Player Avatars
    avatars: {
      service: "crafatar", // crafatar, minotar, cravatar
      size: 128,
      overlay: true,
      fallback: "https://crafatar.com/avatars/8667ba71-b112-a42c-a29f-6d945d4a288c"
    },

    // Embed Colors (Decimal Format)
    colors: {
      info: 0x3498DB,       // Blue
      success: 0x2ECC71,    // Green
      warning: 0xF39C12,    // Orange
      error: 0xE74C3C,      // Red
      join: 0x2ECC71,       // Green
      leave: 0xE74C3C,      // Red
      death: 0x95A5A6,      // Gray
      achievement: 0xF1C40F,// Yellow
      chat: 0x7289DA,       // Discord Blue
      command: 0x9B59B6,    // Purple
      boss: 0xE91E63,       // Pink
      pvp: 0xFF5733,        // Orange-Red
      admin: 0xDC143C       // Crimson
    },

    // Formatting Options
    formatting: {
      timestamps: true,
      embedFooter: true,
      inlineFields: true,
      playerImages: true,
      thumbnails: true,

      // Emojis für verschiedene Events
      emojis: {
        join: "📥",
        leave: "📤",
        death: "💀",
        achievement: "🏆",
        warning: "⚠️",
        error: "❌",
        info: "ℹ️",
        diamond: "💎",
        netherite: "🔷",
        boss: "🐉",
        teleport: "🌀",
        sword: "⚔️",
        bow: "🏹",
        fire: "🔥",
        water: "💧",
        house: "🏠",
        book: "📚",
        gear: "⚙️"
      }
    }
  },

  // ========================================
  // MESSAGE TEMPLATES
  // ========================================
  messages: {
    player: {
      join: "📥 {player} joined the game",
      leave: "📤 {player} left the game",
      firstJoin: "🎉 Welcome {player} to the server!",
      afkStart: "💤 {player} is now AFK",
      afkEnd: "👁️ {player} is no longer AFK",
      joinChat: "§a{player} joined the game (§b{online}§a online)",
      firstJoinChat: "§6Welcome §e{player}§6 to the server! 🎉"
    },

    death: {
      generic: "💀 {player} died",
      fall: "💀 {player} fell from a high place",
      drowning: "💀 {player} drowned",
      lava: "💀 {player} tried to swim in lava",
      fire: "💀 {player} went up in flames",
      suffocation: "💀 {player} suffocated in a wall",
      void: "💀 {player} fell out of the world",
      magic: "💀 {player} was killed by magic",
      wither: "💀 {player} withered away",
      anvil: "💀 {player} was squashed by a falling anvil",
      cactus: "💀 {player} was pricked to death",
      lightning: "⚡ {player} was struck by lightning",
      custom: {}
    },

    achievements: {
      generic: "🏆 {player} achieved {achievement}",
      advancement: "📈 {player} made an advancement: {achievement}"
    },

    server: {
      start: "🟢 {serverName} has started!",
      stop: "🔴 {serverName} has stopped!",
      crash: "💥 {serverName} crashed unexpectedly!",
      restart: "🔄 {serverName} is restarting..."
    },

    combat: {
      pvpKill: "⚔️ {killer} killed {victim}",
      mobKill: "🗡️ {player} killed a {mob}",
      bossKill: "🐉 {player} defeated the {boss}!"
    },

    world: {
      weatherChange: "🌦️ Weather changed to {weather}",
      dimensionChange: "📍 {player} traveled from {from} to {to}",
      timeChange: "🕐 Time changed to {time}"
    }
  },

  // ========================================
  // PERMISSIONS & ROLES
  // ========================================
  permissions: {
    defaultRole: "player",

    tags: {
      admin: "admin",
      moderator: "mod",
      vip: "vip",
      builder: "builder",
      donor: "donor"
    },

    commands: {
      webhook: ["admin", "mod"],
      whadmin: ["admin"],
      stats: ["player"],
      health: ["admin"]
    },

    bypassAntiSpam: ["admin", "mod", "vip"],
    bypassFilters: ["admin"],
    commandLogging: true,
    commandBlacklist: ["help", "?", "say"]
  },

  // ========================================
  // FILTERING & MODERATION
  // ========================================
  filters: {
    chat: {
      enabled: true,
      blockWords: [],
      warnWords: [],
      replaceWords: {},
      minLength: 1,
      maxLength: 256
    },

    events: {
      ignoreCommands: ["help", "?"],
      ignorePlayers: [],
      ignoreDimensions: [],
      ignoreMobs: []
    }
  },

  // ========================================
  // ADVANCED SETTINGS
  // ========================================
  advanced: {
    // Debug & Testing
    debug: {
      enabled: false,
      showStackTraces: true,
      logAllEvents: false,
      testMode: false,
      verboseLogging: false
    },

    // Performance Optimization
    performance: {
      messageQueueSize: 100,
      messageQueueDelay: 1000,
      messageBatchSize: 10,
      cacheSize: 1000,
      cacheTTL: 300000, // 5 minutes
      maxWebhooksPerMinute: 30,
      enableBatching: true,
      batchInterval: 5000
    },

    // Rate Limiting
    rateLimiting: {
      enabled: true,
      maxRequestsPerMinute: 60,
      maxRequestsPerSecond: 2,
      cooldownTime: 1000
    },

    // Limits
    limits: {
      maxMessageLength: 2000,
      maxEmbedFields: 25,
      maxEmbedDescriptionLength: 4096,
      maxFieldValueLength: 1024,
      spamThreshold: 5,
      spamTimeWindow: 10000,
      maxRetries: 3
    },

    // Intervals (in milliseconds)
    intervals: {
      analytics: 3600000,  // 1 hour
      cleanup: 300000,     // 5 minutes
      heartbeat: 60000,    // 1 minute
      healthCheck: 600000, // 10 minutes
      afkCheck: 10000      // 10 seconds
    },

    // Logging
    logging: {
      saveToFile: true,
      logLevel: "info", // "debug", "info", "warn", "error"
      maxLogSize: 10000,
      logChat: true,
      logCommands: true,
      logEvents: true,
      logErrors: true,
      logWebhooks: true
    },

    // Circuit Breaker
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000 // 30 seconds
    },

    // Webhook Validation
    validation: {
      validateUrls: true,
      validatePayload: true,
      checkHeaderSize: true,
      maxPayloadSize: 10000000 // 10 MB
    }
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

export const WHHelpers = {
  /**
   * Check if a feature is enabled
   * @param {string} path - Dot-separated path (e.g., "chat.enabled")
   * @returns {boolean}
   */
  isEnabled(path) {
    const parts = path.split('.');
    let current = WHConfig.features;

    for (const part of parts) {
      if (!current[part]) return false;
      current = current[part];
    }

    return current === true;
  },

  /**
   * Get webhook URL by type
   * @param {string} type - Webhook type
   * @returns {string|null}
   */
  getWebhook(type) {
    return WHConfig.webhooks[type] || WHConfig.webhooks.general;
  },

  /**
   * Check if player has permission
   * @param {object} player - Player object
   * @param {string} permission - Permission string
   * @returns {boolean}
   */
  hasPermission(player, permission) {
    const tags = WHConfig.permissions.tags;

    // Check admin
    if (player.hasTag(tags.admin)) return true;

    // Check specific permission
    if (permission === "bypassAntiSpam") {
      return player.hasTag(tags.admin) || player.hasTag(tags.moderator);
    }

    if (permission === "bypassFilters") {
      return player.hasTag(tags.admin);
    }

    // Check command permissions
    if (permission.startsWith("webhook.")) {
      const command = permission.split('.')[1];
      const allowedRoles = WHConfig.permissions.commands[command] || [];

      for (const role of allowedRoles) {
        if (player.hasTag(tags[role])) return true;
      }
    }

    return false;
  },

  /**
   * Get color for embed type
   * @param {string} type - Color type
   * @returns {number}
   */
  getColor(type) {
    return WHConfig.appearance.colors[type] || WHConfig.appearance.colors.info;
  },

  /**
   * Format message with placeholders
   * @param {string} template - Message template
   * @param {object} data - Data object
   * @returns {string}
   */
  formatMessage(template, data) {
    if (!template) return "";

    let message = template;
    for (const [key, value] of Object.entries(data || {})) {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return message;
  },

  /**
   * Get emoji for event
   * @param {string} name - Emoji name
   * @returns {string}
   */
  getEmoji(name) {
    return WHConfig.appearance.formatting.emojis[name] || "📌";
  },

  /**
   * Validate configuration
   * @returns {object} Validation result
   */
  validateConfig() {
    const errors = [];
    const warnings = [];

    // Check webhooks
    for (const [name, url] of Object.entries(WHConfig.webhooks)) {
      if (!url || url.includes("YOUR_WEBHOOK_ID")) {
        warnings.push(`Webhook ${name} not configured`);
      }
    }

    // Check server settings
    if (!WHConfig.appearance.serverName) {
      errors.push("Server name not configured");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Get config section
   * @param {string} section - Section name
   * @returns {object}
   */
  getSection(section) {
    return WHConfig[section] || null;
  }
};

// ========================================
// CONFIG EXPORTS
// ========================================

export const {
  webhooks,
  features,
  appearance,
  messages,
  permissions,
  filters,
  advanced
} = WHConfig;

export function getConfig() {
  return WHConfig;
}

export function getHelpers() {
  return WHHelpers;
}

export function validateAndGetConfig() {
  const validation = WHHelpers.validateConfig();

  if (!validation.valid) {
    console.error("[Webhook] Configuration validation errors:", validation.errors);
  }

  if (validation.warnings.length > 0) {
    console.warn("[Webhook] Configuration warnings:", validation.warnings);
  }

  return WHConfig;
}
