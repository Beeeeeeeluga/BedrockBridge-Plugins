// webhookbridge/config.js - Webhook Plugin Configuration
// Edit this file to configure your webhooks and features

export const WHConfig = {
  // Discord Webhook URLs
  webhooks: {
    general: "xxx", // General notifications
    chat: "xxx", // Chat messages
    playerEvents: "xxx", // Join/Leave events
    deaths: "xxx", // Death messages
    achievements: "xxx", // Achievement notifications
    serverEvents: "xxx", // Server start/stop
    worldEvents: "xxx", // Boss kills, weather changes
    blockLogs: "xxx", // Block break/place logs
    commands: "xxx", // Command usage
    moderation: "xxx", // Moderation actions
    analytics: "xxx", // Statistics and reports
    errors: "xxx", // Error logs
    // Add custom webhook types here
  },
  
  // Feature toggles
  features: {
    chat: {
      enabled: true,
      logToDiscord: true,
      showPlayerTags: true,
      antiSpam: true,
      mentionEveryone: false
    },
    
    players: {
      joinLeave: true,
      firstJoin: true,
      welcomeMessage: true,
      locationTracking: true,
      inventoryTracking: true,
      afkDetection: true,
      afkTimeout: 300000 // 5 minutes
    },
    
    combat: {
      deathMessages: true,
      pvpKills: true,
      itemDropAlerts: true
    },
    
    world: {
      bossKills: true,
      weatherChanges: true,
      timeChanges: true
    },
    
    blocks: {
      valuable: true,
      containers: true,
      spawners: true,
      watchlist: ["diamond", "netherite", "ancient_debris", "beacon", "dragon_egg"]
    },
    
    items: {
      watchlist: ["diamond", "netherite", "elytra", "totem", "enchanted_golden_apple"]
    },
    
    moderation: {
      commands: true,
      teleports: true,
      gamemode: true,
      bans: true
    },
    
    analytics: {
      enabled: true,
      hourlyReports: true,
      dailyReports: true
    },
    
    server: {
      startStop: true,
      performanceAlerts: true
    }
  },
  
  // Appearance settings
  appearance: {
    serverName: "My Minecraft Server",
    serverIcon: "https://via.placeholder.com/128",
    
    avatars: {
      service: "crafatar", // crafatar, minotar, cravatar
      size: 128,
      overlay: true
    },
    
    colors: {
      info: 0x3498DB,
      success: 0x2ECC71,
      warning: 0xF39C12,
      error: 0xE74C3C,
      join: 0x2ECC71,
      leave: 0xE74C3C,
      death: 0x95A5A6,
      achievement: 0xF1C40F,
      chat: 0x7289DA,
      command: 0x9B59B6,
      boss: 0xE91E63
    },
    
    formatting: {
      timestamps: true,
      embedFooter: true,
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
        teleport: "🌀"
      }
    }
  },
  
  // Message templates
  messages: {
    player: {
      join: "{player} joined the game",
      leave: "{player} left the game",
      firstJoin: "Welcome {player} to the server!",
      afkStart: "{player} is now AFK",
      afkEnd: "{player} is no longer AFK",
      joinChat: "§a{player} joined the game ({online} online)",
      firstJoinChat: "§6Welcome §e{player}§6 to the server! 🎉"
    },
    
    death: {
      generic: "{player} died",
      fall: "{player} fell from a high place",
      drowning: "{player} drowned",
      lava: "{player} tried to swim in lava",
      fire: "{player} went up in flames",
      suffocation: "{player} suffocated in a wall",
      void: "{player} fell out of the world",
      magic: "{player} was killed by magic",
      wither: "{player} withered away",
      anvil: "{player} was squashed by a falling anvil",
      custom: {} // Add custom death messages
    },
    
    server: {
      start: "🟢 {serverName} has started!",
      stop: "🔴 {serverName} has stopped!"
    }
  },
  
  // Permission settings
  permissions: {
    defaultRole: "player",
    
    tags: {
      admin: "admin",
      moderator: "mod",
      vip: "vip",
      builder: "builder"
    },
    
    commands: {
      webhook: ["admin", "mod"],
      whadmin: ["admin"]
    }
  },
  
  // Filter settings
  filters: {
    chat: {
      enabled: true,
      blockWords: [],
      warnWords: [],
      replaceWords: {}
    },
    
    events: {
      ignoreCommands: ["help", "?"],
      ignorePlayers: []
    }
  },
  
  // Advanced settings
  advanced: {
    debug: {
      enabled: true,
      showStackTraces: true,
      logAllEvents: true,
      testMode: false
    },
    
    performance: {
      messageQueueSize: 100,
      messageQueueDelay: 1000,
      messageBatchSize: 10,
      cacheSize: 1000,
      cacheTTL: 300000 // 5 minutes
    },
    
    limits: {
      maxMessageLength: 2000,
      maxEmbedFields: 25,
      maxWebhooksPerMinute: 30,
      spamThreshold: 5
    },
    
    intervals: {
      analytics: 3600000, // 1 hour
      cleanup: 300000, // 5 minutes
      heartbeat: 60000 // 1 minute
    },
    
    logging: {
      saveToFile: false,
      maxLogSize: 10000,
      logLevel: "info"
    }
  }
};

// Helper functions for config access
export const WHHelpers = {
  /**
   * Check if a feature is enabled
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
   */
  getWebhook(type) {
    return WHConfig.webhooks[type] || WHConfig.webhooks.general;
  },
  
  /**
   * Check if player has permission
   */
  hasPermission(player, permission) {
    const tags = WHConfig.permissions.tags;
    
    // Check admin
    if (player.hasTag(tags.admin)) return true;
    
    // Check specific permission
    if (permission === "bypassAntiSpam") {
      return player.hasTag(tags.admin) || player.hasTag(tags.moderator);
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
   */
  getColor(type) {
    return WHConfig.appearance.colors[type] || WHConfig.appearance.colors.info;
  },
  
  /**
   * Format message with placeholders
   */
  formatMessage(template, data) {
    if (!template) return "";
    
    let message = template;
    for (const [key, value] of Object.entries(data)) {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return message;
  }
};

// Export individual config sections for convenience
export const { webhooks, features, appearance, messages, permissions, filters, advanced } = WHConfig;

// Export config getter
export function getConfig() {
  return WHConfig;
}

// Export helpers getter
export function getHelpers() {
  return WHHelpers;
}