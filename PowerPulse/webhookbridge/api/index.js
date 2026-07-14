// webhook/api/index.js - Public API for extensions
import { eventManager } from '../core/events.js';
import { sendWebhook, createEmbed, getQueueStatus } from '../core/webhook.js';
import { getConfig, getHelpers } from '../config.js';
import { db, getPlayerData, updatePlayerData, incrementPlayerStat, incrementGlobalStat } from '../core/database.js';
import { plugin, state } from '../core/plugin.js';
import { logError, logEvent } from '../utils/logger.js';

/**
 * Webhook Plugin API
 * This is the public API that other plugins can use to interact with the webhook system
 * @version 2.1.0
 */
export const WebhookAPI = {
  // Version information
  version: "2.1.0",
  pluginInfo: {
    name: "BedrockBridge Webhook Plugin",
    author: "BedrockBridge Community",
    description: "Advanced webhook integration for Minecraft Bedrock"
  },
  
  // Event System
  events: {
    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     * @param {number} priority - Priority (higher = earlier execution)
     */
    on: (event, callback, priority = 100) => eventManager.on(event, callback, priority),
    
    /**
     * Register a one-time event listener
     */
    once: (event, callback, priority = 100) => eventManager.once(event, callback, priority),
    
    /**
     * Remove an event listener
     */
    off: (event, callback) => eventManager.off(event, callback),
    
    /**
     * Emit an event
     * @returns {Promise<boolean>} - False if event was cancelled
     */
    emit: (event, data) => eventManager.emit(event, data),
    
    /**
     * Register a hook to modify data
     */
    registerHook: (name, callback) => eventManager.registerHook(name, callback),
    
    /**
     * List all available events
     */
    list: () => [
      // Chat events
      "webhook:beforeChat",
      "webhook:afterChat",
      "webhook:spam",
      "webhook:messageFiltered",
      "webhook:sendChat",
      
      // Player events
      "webhook:beforePlayerJoin",
      "webhook:afterPlayerJoin",
      "webhook:firstJoin",
      "webhook:beforePlayerLeave",
      "webhook:afterPlayerLeave",
      "webhook:playerDeath",
      "webhook:playerRespawn",
      "webhook:afkStart",
      "webhook:afkEnd",
      
      // World events
      "webhook:bossKill",
      "webhook:weatherChange",
      "webhook:dimensionChange",
      
      // Block events
      "webhook:blockBreak",
      "webhook:blockPlace",
      "webhook:containerAccess",
      
      // Server events
      "webhook:serverStart",
      "webhook:serverStop",
      "webhook:command",
      
      // Custom events
      "webhook:achievement",
      "webhook:customEvent"
    ]
  },
  
  // Webhook Functions
  webhook: {
    /**
     * Send a webhook message
     * @param {string} type - Webhook type (chat, playerEvents, etc.)
     * @param {object} data - Webhook data
     * @param {boolean} immediate - Send immediately without queuing
     */
    send: sendWebhook,
    
    /**
     * Create an embed builder
     * @param {string} title - Optional title
     */
    createEmbed: (title) => createEmbed(title),
    
    /**
     * Get webhook URL for a type
     */
    getWebhookUrl: (type) => getHelpers().getWebhook(type),
    
    /**
     * Register a new webhook type
     */
    registerWebhookType: (type, defaultUrl = null) => {
      const config = getConfig();
      if (!config.webhooks[type]) {
        config.webhooks[type] = defaultUrl;
        console.info(`[Webhook] Registered new webhook type: ${type}`);
      }
    },
    
    /**
     * Get queue status
     */
    getQueueStatus: () => getQueueStatus()
  },
  
  // Configuration Access
  config: {
    /**
     * Get the full configuration object
     */
    get: () => getConfig(),
    
    /**
     * Get configuration helpers
     */
    getHelpers: () => getHelpers(),
    
    /**
     * Check if a feature is enabled
     */
    isEnabled: (feature) => getHelpers().isEnabled(feature),
    
    /**
     * Check player permission
     */
    hasPermission: (player, permission) => getHelpers().hasPermission(player, permission),
    
    /**
     * Get color for a type
     */
    getColor: (type) => getHelpers().getColor(type),
    
    /**
     * Format a message with placeholders
     */
    formatMessage: (template, data) => getHelpers().formatMessage(template, data)
  },
  
  // Database Access
  database: {
    /**
     * Get player data
     */
    getPlayerData: (playerId) => getPlayerData(playerId),
    
    /**
     * Update player data
     */
    setPlayerData: (playerId, data) => updatePlayerData(playerId, data),
    
    /**
     * Increment a player stat
     */
    incrementStat: (playerId, stat, amount = 1) => incrementPlayerStat(playerId, stat, amount),
    
    /**
     * Get global stats
     */
    getGlobalStats: () => db.stats.get("global"),
    
    /**
     * Increment global stat
     */
    incrementGlobalStat: (stat, amount = 1) => incrementGlobalStat(stat, amount),
    
    /**
     * Access custom table
     */
    custom: (tableName) => {
      if (!db[tableName]) {
        db[tableName] = database.makeTable(`webhook_custom_${tableName}`);
      }
      return db[tableName];
    },
    
    /**
     * Log an event
     */
    logEvent: (type, data) => logEvent(type, data)
  },
  
  // Utility Functions
  utils: {
    /**
     * Format duration to human readable string
     */
    formatDuration: (ms) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days}d ${hours % 24}h`;
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
      return `${seconds}s`;
    },
    
    /**
     * Get player avatar URL
     */
    getPlayerAvatar: (playerName) => {
      const config = getConfig().appearance.avatars;
      switch (config.service) {
        case "crafatar":
          return `https://crafatar.com/avatars/${playerName}?size=${config.size}&overlay=${config.overlay}`;
        case "minotar":
          return `https://minotar.net/helm/${playerName}/${config.size}`;
        case "cravatar":
          return `https://cravatar.eu/helmavatar/${playerName}/${config.size}`;
        default:
          return config.service.replace("{name}", playerName).replace("{size}", config.size);
      }
    },
    
    /**
     * Log an error
     */
    logError: (message, error) => logError(message, error),
    
    /**
     * Get online players
     */
    getOnlinePlayers: () => world.getAllPlayers(),
    
    /**
     * Get player by name
     */
    getPlayerByName: (name) => world.getAllPlayers().find(p => 
      p.name.toLowerCase() === name.toLowerCase()
    ),
    
    /**
     * Get plugin status
     */
    getStatus: () => ({
      initialized: plugin.initialized,
      mode: plugin.bridgeAvailable ? "BedrockBridge" : "Standalone",
      uptime: this.formatDuration(Date.now() - plugin.startTime),
      sessions: state.playerSessions.size,
      webhooksConfigured: Object.values(getConfig().webhooks).filter(w => w).length
    })
  },
  
  // State access (read-only)
  state: {
    /**
     * Get player session info
     */
    getPlayerSession: (playerId) => state.playerSessions.get(playerId),
    
    /**
     * Check if player is AFK
     */
    isPlayerAFK: (playerId) => state.afkPlayers.has(playerId),
    
    /**
     * Get all active sessions
     */
    getActiveSessions: () => Array.from(state.playerSessions.entries())
  },
  
  // Register custom features
  register: {
    /**
     * Register a custom command
     * @param {string} command - Command name (without prefix)
     * @param {function} handler - Handler function(player, args)
     * @param {object} options - Command options
     */
    command: (command, handler, options = {}) => {
      eventManager.on("webhook:command", async (data) => {
        if (data.command === command) {
          // Check permission if specified
          if (options.permission && !getHelpers().hasPermission(data.player, options.permission)) {
            data.player.sendMessage("§cYou don't have permission to use this command.");
            return;
          }
          
          await handler(data.player, data.args, data);
        }
      });
      
      console.info(`[Webhook] Registered command: ${command}`);
    },
    
    /**
     * Register a statistic tracker
     */
    stat: (statName, defaultValue = 0) => {
      const stats = db.stats.get("global") || {};
      if (!(statName in stats)) {
        stats[statName] = defaultValue;
        db.stats.set("global", stats);
      }
    }
  }
};

// Make API globally available
globalThis.WebhookAPI = WebhookAPI;

// Export individual functions for convenience
export const { events, webhook, config, database, utils, state, register } = WebhookAPI;