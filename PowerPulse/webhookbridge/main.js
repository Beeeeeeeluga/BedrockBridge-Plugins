/**
 * ============================================
 * DISCORD WEBHOOK PLUGIN v4.1.0 - MAIN
 * ============================================
 *
 * Vollständig integriertes, selbstständiges Plugin mit
 * Advanced Statistics, Event Archival & Server Analytics
 * Alle Funktionalität in diesem Ordner enthalten
 *
 * @author BedrockBridge Community
 * @version 4.1.0
 */

import { world, system, Player } from "@minecraft/server";
import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net";

// ============================================
// v4.1.0 EXPANSION MODULES
// ============================================

import EntityEventManager from "./events/entity-events.js";
import ItemEventManager from "./events/item-events.js";
import PlayerStatsManager from "./stats/player-stats.js";
import ServerAnalytics from "./stats/server-analytics.js";
import DataManager from "./core/data-manager.js";
import EventArchive from "./core/event-archive.js";

// ============================================
// v4.1.0 ADVANCED FEATURE MODULES
// ============================================

import AdvancedStats from "./stats/advanced-stats.js";
import EmbedBuilder from "./core/embed-builder.js";
import ReportGenerator from "./stats/report-generator.js";
import PerformanceMonitor from "./server/performance-monitor.js";
import TreasureHunt from "./events/treasure-hunt.js";
import BossSystem from "./events/boss-system.js";
import ModerationLogger from "./moderation/moderation-logger.js";
import WorldExplorer from "./exploration/world-explorer.js";
import DiscordDashboard from "./dashboard/discord-dashboard.js";

// ============================================
// ZENTRALE KONFIGURATION
// ============================================

const WHConfig = {
  webhooks: {
    general: "xxx",
    chat: "xxx",
    playerEvents: "xxx",
    deaths: "xxx",
    achievements: "xxx",
    serverEvents: "xxx",
    worldEvents: "xxx",
    blockLogs: "xxx",
    commands: "xxx",
    moderation: "xxx",
    analytics: "xxx",
    errors: "xxx",
    teleportLogs: "xxx",
    weatherEvents: "xxx"
  },

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
      afkTimeout: 300000
    },
    combat: {
      deathMessages: true,
      pvpKills: true,
      itemDropAlerts: true,
      bossKills: true
    },
    world: {
      bossKills: true,
      weatherChanges: true,
      timeChanges: false,
      dimensionChanges: true
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

  appearance: {
    serverName: "My Minecraft Server",
    serverIcon: "https://via.placeholder.com/128",
    avatars: {
      service: "crafatar",
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

  messages: {
    player: {
      join: "{player} joined the game",
      leave: "{player} left the game",
      firstJoin: "Welcome {player} to the server!",
      afkStart: "{player} is now AFK",
      afkEnd: "{player} is no longer AFK"
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
      wither: "{player} withered away"
    },
    server: {
      start: "🟢 {serverName} has started!",
      stop: "🔴 {serverName} has stopped!"
    }
  },

  permissions: {
    tags: {
      admin: "admin",
      moderator: "mod",
      vip: "vip"
    }
  },

  advanced: {
    debug: {
      enabled: false,
      testMode: false
    },
    performance: {
      messageQueueSize: 100,
      messageQueueDelay: 1000,
      messageBatchSize: 10,
      cacheSize: 1000,
      cacheTTL: 300000
    },
    limits: {
      spamThreshold: 5,
      maxRetries: 3
    },
    intervals: {
      analytics: 3600000,
      cleanup: 300000,
      heartbeat: 60000
    }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const WHHelpers = {
  isEnabled(path) {
    const parts = path.split('.');
    let current = WHConfig.features;
    for (const part of parts) {
      if (!current[part]) return false;
      current = current[part];
    }
    return current === true;
  },

  getWebhook(type) {
    return WHConfig.webhooks[type] || WHConfig.webhooks.general;
  },

  hasPermission(player, permission) {
    if (player.hasTag(WHConfig.permissions.tags.admin)) return true;
    if (permission === "bypassAntiSpam") {
      return player.hasTag(WHConfig.permissions.tags.admin) ||
             player.hasTag(WHConfig.permissions.tags.moderator);
    }
    return false;
  },

  getColor(type) {
    return WHConfig.appearance.colors[type] || WHConfig.appearance.colors.info;
  },

  formatMessage(template, data) {
    if (!template) return "";
    let message = template;
    for (const [key, value] of Object.entries(data || {})) {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return message;
  },

  getEmoji(name) {
    return WHConfig.appearance.formatting.emojis[name] || "📌";
  }
};

// ============================================
// WEBHOOK MANAGER
// ============================================

class WebhookManager {
  constructor() {
    this.webhookStats = new Map();
    this.rateLimitTracker = new Map();
    this.retryQueue = [];
    this.circuitBreaker = new Map();
    this.requestHistory = new Map();
    this.messageQueue = [];
    this.isProcessing = false;
  }

  validateUrl(url) {
    // Basic checks
    if (!url) {
      return false;
    }

    if (typeof url !== 'string') {
      console.warn(`[Webhook] validateUrl: URL is not a string, type: ${typeof url}`);
      return false;
    }

    // Don't accept placeholder URLs
    if (url.includes("YOUR_ID") || url.includes("YOUR_TOKEN") || url === "") {
      return false;
    }

    // Validate Discord webhook URL format without using URL class
    // Discord webhooks: https://discord.com/api/webhooks/{ID}/{TOKEN}
    const isValidFormat = url.startsWith('https://discord.com/api/webhooks/') &&
                          url.length > 80 &&
                          url.includes('/') &&
                          !url.includes(' ');

    if (WHConfig.advanced.debug.enabled) {
      console.log(`[Webhook] URL Validation: ${url.substring(0, 70)}... = ${isValidFormat}`);
    }

    return isValidFormat;
  }

  checkRateLimit(url) {
    const tracker = this.rateLimitTracker.get(url);
    if (!tracker) return true;
    if (Date.now() >= tracker.resetTime) {
      this.rateLimitTracker.delete(url);
      return true;
    }
    return false;
  }

  updateRateLimit(url, response) {
    // Bedrock response uses headers Map, not getHeader() method
    const remaining = parseInt(
      (response.headers?.get?.('X-RateLimit-Remaining') ||
       response.headers?.['X-RateLimit-Remaining'] ||
       '1')
    );

    // Prefer Retry-After for 429 responses (more accurate)
    let resetTime = Date.now() + 60000; // Default 1 minute

    const retryAfter = response.headers?.get?.('Retry-After') ||
                       response.headers?.['Retry-After'];

    if (retryAfter) {
      const retrySeconds = parseFloat(retryAfter);
      if (!isNaN(retrySeconds)) {
        resetTime = Date.now() + (retrySeconds * 1000);
      }
    } else {
      // Fallback to X-RateLimit-Reset
      const xResetTime = parseInt(
        (response.headers?.get?.('X-RateLimit-Reset') ||
         response.headers?.['X-RateLimit-Reset'] ||
         '0')
      );
      if (xResetTime > 0) {
        resetTime = xResetTime * 1000;
      }
    }

    this.rateLimitTracker.set(url, {
      remaining: Math.max(0, remaining),
      resetTime: resetTime
    });
    return remaining > 0;
  }

  getCircuitBreakerState(url) {
    const breaker = this.circuitBreaker.get(url);
    if (!breaker) {
      this.circuitBreaker.set(url, {
        state: 'CLOSED',
        failures: 0,
        successAfterOpen: 0,
        lastStateChange: Date.now()
      });
      return 'CLOSED';
    }

    if (breaker.state === 'OPEN' && Date.now() - breaker.lastStateChange > 30000) {
      breaker.state = 'HALF_OPEN';
      breaker.successAfterOpen = 0;
      breaker.lastStateChange = Date.now();
    }

    return breaker.state;
  }

  recordSuccess(url) {
    const breaker = this.circuitBreaker.get(url) || {
      state: 'CLOSED',
      failures: 0,
      successAfterOpen: 0
    };

    if (breaker.state === 'HALF_OPEN') {
      breaker.successAfterOpen++;
      if (breaker.successAfterOpen >= 2) {
        breaker.state = 'CLOSED';
        breaker.failures = 0;
        breaker.lastStateChange = Date.now();
      }
    } else if (breaker.state === 'CLOSED') {
      breaker.failures = Math.max(0, breaker.failures - 1);
    }

    this.circuitBreaker.set(url, breaker);
    this.recordAttempt(url, true);
  }

  recordFailure(url) {
    const breaker = this.circuitBreaker.get(url) || {
      state: 'CLOSED',
      failures: 0
    };
    breaker.failures++;

    if (breaker.state === 'CLOSED' && breaker.failures >= 5) {
      breaker.state = 'OPEN';
      breaker.lastStateChange = Date.now();
      console.warn(`[Webhook] Circuit breaker OPENED for ${url}`);
    } else if (breaker.state === 'HALF_OPEN') {
      breaker.state = 'OPEN';
      breaker.lastStateChange = Date.now();
    }

    this.circuitBreaker.set(url, breaker);
    this.recordAttempt(url, false);
  }

  recordAttempt(url, success) {
    if (!this.webhookStats.has(url)) {
      this.webhookStats.set(url, {
        attempts: 0,
        success: 0,
        failed: 0,
        lastError: null,
        lastSuccess: Date.now()
      });
    }

    const stats = this.webhookStats.get(url);
    stats.attempts++;
    if (success) {
      stats.success++;
      stats.lastSuccess = Date.now();
    } else {
      stats.failed++;
    }

    if (!this.requestHistory.has(url)) {
      this.requestHistory.set(url, []);
    }
    const history = this.requestHistory.get(url);
    history.push({ timestamp: Date.now(), status: success ? 'success' : 'failed' });
    if (history.length > 100) history.shift();
  }

  getStats(url) {
    return this.webhookStats.get(url) || {
      attempts: 0,
      success: 0,
      failed: 0,
      lastError: null,
      lastSuccess: null
    };
  }

  getSuccessRate(url) {
    const stats = this.getStats(url);
    return stats.attempts > 0 ? (stats.success / stats.attempts * 100).toFixed(1) : 'N/A';
  }

  addToRetryQueue(url, data, attempts = 0) {
    if (attempts >= 3) {
      console.error(`[Webhook] Max retries exceeded for ${url}`);
      return false;
    }

    const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
    this.retryQueue.push({
      url,
      data,
      attempts: attempts + 1,
      nextRetry: Date.now() + delay
    });

    return true;
  }

  processRetryQueue() {
    const now = Date.now();
    const toRetry = this.retryQueue.filter(item => item.nextRetry <= now);
    this.retryQueue = this.retryQueue.filter(item => item.nextRetry > now);

    for (const item of toRetry) {
      sendWebhookRequest(item.url, item.data, item.attempts);
    }
  }

  queueMessage(url, data, type) {
    this.messageQueue.push({
      url,
      data,
      type,
      timestamp: Date.now()
    });

    if (this.messageQueue.length > WHConfig.advanced.performance.messageQueueSize) {
      this.messageQueue.shift();
    }
  }

  processBatch() {
    if (this.isProcessing || this.messageQueue.length === 0) return;

    this.isProcessing = true;

    try {
      const batchSize = Math.min(
        WHConfig.advanced.performance.messageBatchSize,
        this.messageQueue.length
      );

      const batch = this.messageQueue.splice(0, batchSize);

      for (const message of batch) {
        if (Date.now() - message.timestamp > 30000) continue;
        sendWebhookRequest(message.url, message.data, 0);
      }
    } catch (error) {
      console.error(`[Webhook] Batch processing error:`, error);
    } finally {
      this.isProcessing = false;
    }
  }

  getHealthReport() {
    const report = {};

    for (const [url, stats] of this.webhookStats) {
      const breaker = this.circuitBreaker.get(url);
      report[url] = {
        attempts: stats.attempts,
        success: stats.success,
        failed: stats.failed,
        successRate: this.getSuccessRate(url),
        circuitState: breaker?.state || 'UNKNOWN',
        lastSuccess: stats.lastSuccess,
        rateLimited: this.rateLimitTracker.has(url)
      };
    }

    return report;
  }
}

const webhookManager = new WebhookManager();

// ============================================
// PLAYER TRACKER
// ============================================

class PlayerTracker {
  constructor() {
    this.sessions = new Map();
    this.afkPlayers = new Map();
    this.spamTracking = new Map();
  }

  trackSession(playerId, player) {
    this.sessions.set(playerId, {
      player: player.name,
      joinTime: Date.now(),
      lastActivity: Date.now(),
      location: player.location,
      dimension: player.dimension.id
    });
  }

  updateActivity(playerId) {
    const session = this.sessions.get(playerId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  endSession(playerId) {
    return this.sessions.get(playerId);
  }

  setAFK(playerId, isAFK) {
    if (isAFK) {
      this.afkPlayers.set(playerId, Date.now());
    } else {
      this.afkPlayers.delete(playerId);
    }
  }

  checkSpam(playerId, threshold = 5, timeWindow = 10000) {
    if (!this.spamTracking.has(playerId)) {
      this.spamTracking.set(playerId, { messages: [], warnings: 0 });
    }

    const tracking = this.spamTracking.get(playerId);
    const now = Date.now();
    tracking.messages = tracking.messages.filter(time => now - time < timeWindow);
    tracking.messages.push(now);

    return tracking.messages.length > threshold;
  }

  cleanup(playerId) {
    this.sessions.delete(playerId);
    this.afkPlayers.delete(playerId);
    this.spamTracking.delete(playerId);
  }

  getActiveCount() {
    return this.sessions.size;
  }
}

const playerTracker = new PlayerTracker();

// ============================================
// WEBHOOK SENDER
// ============================================

async function sendWebhookRequest(webhookUrl, data, attempts = 0) {
  try {
    // Validate inputs
    if (!webhookUrl || !data) {
      console.error("[Webhook] Invalid webhook request - missing url or data");
      return;
    }

    // Create request with method chaining (Bedrock API style)
    const request = new HttpRequest(webhookUrl)
      .setMethod(HttpRequestMethod.Post)
      .setHeaders([
        new HttpHeader("Content-Type", "application/json"),
        new HttpHeader("User-Agent", "BedrockBridge-Webhook/4.0")
      ]);

    // Set body
    request.body = JSON.stringify(data);

    // Send request
    const response = await http.request(request);

    // Safely update rate limit (handle potential errors)
    try {
      if (response && typeof response === 'object') {
        webhookManager.updateRateLimit(webhookUrl, response);
      }
    } catch (rateLimitError) {
      if (WHConfig.advanced.debug.enabled) {
        console.warn("[Webhook] Could not update rate limit:", rateLimitError.message);
      }
    }

    // Check response status
    if (response && response.status) {
      if (response.status === 200 || response.status === 204) {
        webhookManager.recordSuccess(webhookUrl);
        if (WHConfig.advanced.debug.enabled) {
          console.log(`[Webhook] Message sent successfully to ${webhookUrl.substring(0, 60)}...`);
        }
        return;
      } else if (response.status === 429) {
        // Rate limited - record as a limit, not a success, and retry with longer delay
        webhookManager.recordFailure(webhookUrl);
        webhookManager.addToRetryQueue(webhookUrl, data, attempts);
        if (WHConfig.advanced.debug.enabled) {
          console.warn(`[Webhook] Rate limited (429), queued for retry with exponential backoff...`);
        }
      } else if (response.status >= 500) {
        // Server error, retry
        webhookManager.recordFailure(webhookUrl);
        webhookManager.addToRetryQueue(webhookUrl, data, attempts);
        console.warn(`[Webhook] Server error (${response.status}), retrying...`);
      } else if (response.status >= 400) {
        // Client error, don't retry
        webhookManager.recordFailure(webhookUrl);
        console.error(`[Webhook] Client error ${response.status}: ${response.body || 'no response body'}`);
      }
    } else {
      // No valid response
      webhookManager.recordFailure(webhookUrl);
      console.warn(`[Webhook] No valid response from webhook`);
    }
  } catch (error) {
    webhookManager.recordFailure(webhookUrl);
    console.error(`[Webhook] Send failed (attempt ${attempts + 1}):`, error.message || error);

    // Retry up to 3 times with exponential backoff
    if (attempts < 3) {
      webhookManager.addToRetryQueue(webhookUrl, data, attempts);
    }
  }
}

async function sendWebhook(type, data, immediate = false) {
  const webhookUrl = WHHelpers.getWebhook(type);

  if (!webhookUrl) {
    if (WHConfig.advanced.debug.enabled) {
      console.warn(`[Webhook] No webhook URL for type: ${type}`);
    }
    return;
  }

  if (!webhookManager.validateUrl(webhookUrl)) {
    console.error(`[Webhook] Invalid webhook URL for ${type}`);
    return;
  }

  if (WHConfig.advanced.debug.testMode) {
    console.log(`[Webhook] TEST MODE - ${type}:`, JSON.stringify(data, null, 2));
    return;
  }

  const circuitState = webhookManager.getCircuitBreakerState(webhookUrl);
  if (circuitState === 'OPEN') {
    if (WHConfig.advanced.debug.enabled) {
      console.warn(`[Webhook] Circuit breaker OPEN for ${type}`);
    }
    webhookManager.addToRetryQueue(webhookUrl, data);
    return;
  }

  if (!webhookManager.checkRateLimit(webhookUrl)) {
    if (WHConfig.advanced.debug.enabled) {
      console.warn(`[Webhook] Rate limited for ${type}`);
    }
    webhookManager.addToRetryQueue(webhookUrl, data);
    return;
  }

  if (immediate) {
    await sendWebhookRequest(webhookUrl, data, 0);
  } else {
    webhookManager.queueMessage(webhookUrl, data, type);
  }
}

// ============================================
// HELPER UTILITIES
// ============================================

function getPlayerAvatar(playerName) {
  const config = WHConfig.appearance.avatars;
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
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventHandlers() {
  // Chat events
  if (WHHelpers.isEnabled("chat.enabled")) {
    world.afterEvents.chatSend.subscribe((event) => {
      handleChatMessage(event);
    });
  }

  // Player events
  if (WHHelpers.isEnabled("players.joinLeave")) {
    world.afterEvents.playerSpawn.subscribe((event) => {
      if (event.initialSpawn) {
        handlePlayerJoin(event.player);
      }
    });

    world.afterEvents.playerLeave.subscribe((event) => {
      handlePlayerLeave(event.playerId);
    });
  }

  // Death events
  if (WHHelpers.isEnabled("combat.deathMessages")) {
    world.afterEvents.entityDie.subscribe((event) => {
      if (event.deadEntity instanceof Player) {
        handlePlayerDeath(event);
      }
    });
  }

  // Block events
  if (WHHelpers.isEnabled("blocks.valuable")) {
    world.afterEvents.playerBreakBlock.subscribe((event) => {
      handleBlockBreak(event);
    });
  }

  // AFK Detection
  if (WHHelpers.isEnabled("players.afkDetection")) {
    world.afterEvents.playerMove?.subscribe((event) => {
      playerTracker.updateActivity(event.player.id);
    });

    world.afterEvents.chatSend?.subscribe((event) => {
      playerTracker.updateActivity(event.sender.id);
    });

    system.runInterval(() => {
      checkAFKPlayers();
    }, 200);
  }
}

async function handleChatMessage(event) {
  try {
    const player = event.sender;

    if (WHHelpers.isEnabled("chat.antiSpam") && playerTracker.checkSpam(player.id)) {
      event.cancel = true;
      player.sendMessage("§cBitte langsamer schreiben!");
      return;
    }

    // NEW v4.1.0: Track chat statistics
    if (globalThis.webhookExpansion?.playerStats) {
      try {
        globalThis.webhookExpansion.playerStats.recordChatMessage(player, event.message.length);
      } catch (statsError) {
        console.warn("[Webhook] Could not record chat stats:", statsError.message);
      }
    }

    // NEW v4.1.0: Archive chat event
    if (globalThis.webhookExpansion?.eventArchive) {
      try {
        globalThis.webhookExpansion.eventArchive.archiveEvent(
          "chat",
          {
            playerName: player.name,
            playerId: player.id,
            message: event.message,
            length: event.message.length
          },
          "chat"
        );
      } catch (archiveError) {
        console.warn("[Webhook] Could not archive chat event:", archiveError.message);
      }
    }

    if (WHHelpers.isEnabled("chat.logToDiscord")) {
      await sendWebhook("chat", {
        content: `${player.name}: ${event.message}`,
        username: player.name,
        avatar_url: getPlayerAvatar(player.name)
      });
    }
  } catch (error) {
    console.error("[Webhook] Chat handling error:", error);
  }
}

async function handlePlayerJoin(player) {
  try {
    // Defensive check: ensure player object exists and has required properties
    if (!player || typeof player !== 'object') {
      console.warn("[Webhook] Player join: Invalid player object received", player);
      return;
    }

    // Handle cases where player.id might be undefined
    const playerId = player.id || player.playerId || player.uuid;
    const playerName = player.name || player.username || "Unknown Player";

    if (!playerId) {
      console.warn("[Webhook] Player join: Cannot determine player ID", player);
      return;
    }

    playerTracker.trackSession(playerId, {
      id: playerId,
      name: playerName,
      location: player.location || { x: 0, y: 0, z: 0 },
      dimension: player.dimension || { id: "minecraft:overworld" }
    });

    // NEW v4.1.0: Initialize statistics for this player
    if (globalThis.webhookExpansion?.playerStats) {
      try {
        globalThis.webhookExpansion.playerStats.initializePlayer(player);
      } catch (statsError) {
        console.warn("[Webhook] Could not initialize player stats:", statsError.message);
      }
    }

    const embed = {
      author: {
        name: `${playerName} joined`,
        icon_url: getPlayerAvatar(playerName)
      },
      color: WHHelpers.getColor("join"),
      fields: [
        {
          name: "Players Online",
          value: world.getAllPlayers().length.toString(),
          inline: true
        },
        {
          name: "Player ID",
          value: playerId,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    };

    await sendWebhook("playerEvents", { embeds: [embed] });
  } catch (error) {
    console.error("[Webhook] Player join error:", error.message || error);
  }
}

async function handlePlayerLeave(playerId) {
  try {
    // Defensive check: ensure playerId exists
    if (!playerId) {
      console.warn("[Webhook] Player leave: No playerId provided");
      return;
    }

    // NEW v4.1.0: End session statistics for this player
    if (globalThis.webhookExpansion?.playerStats) {
      try {
        const players = world.getAllPlayers();
        const player = players.find(p => p.id === playerId);
        if (player) {
          globalThis.webhookExpansion.playerStats.endSession(player);
        }
      } catch (statsError) {
        console.warn("[Webhook] Could not end player stats session:", statsError.message);
      }
    }

    const session = playerTracker.endSession(playerId);
    if (!session) {
      console.warn(`[Webhook] No session found for player: ${playerId}`);
      return;
    }

    const sessionTime = Date.now() - session.joinTime;
    const playerName = session.player || "Unknown Player";

    await sendWebhook("playerEvents", {
      embeds: [{
        author: {
          name: `${playerName} left the game`
        },
        color: WHHelpers.getColor("leave"),
        fields: [
          {
            name: "Player ID",
            value: playerId,
            inline: true
          },
          {
            name: "Session Duration",
            value: formatDuration(sessionTime),
            inline: true
          },
          {
            name: "Players Online",
            value: Math.max(0, world.getAllPlayers().length - 1).toString(),
            inline: true
          }
        ],
        timestamp: new Date().toISOString()
      }]
    });

    playerTracker.cleanup(playerId);
  } catch (error) {
    console.error("[Webhook] Player leave error:", error.message || error);
  }
}

async function handlePlayerDeath(event) {
  try {
    const player = event.deadEntity;

    // Defensive check: ensure player exists
    if (!player) {
      console.warn("[Webhook] Death event received with no deadEntity");
      return;
    }

    const damageSource = event.damageSource;
    const killer = damageSource?.damagingEntity?.name || "Environment";

    // Safely get location - player might have been removed already
    let location = { x: 0, y: 0, z: 0 };
    try {
      if (player.location && typeof player.location === 'object') {
        location = player.location;
      }
    } catch (e) {
      console.warn("[Webhook] Could not get player death location (player may have been removed):", e.message);
      location = { x: 0, y: 0, z: 0 };
    }

    // NEW v4.1.0: Record death in statistics
    if (globalThis.webhookExpansion?.playerStats) {
      try {
        globalThis.webhookExpansion.playerStats.recordDeath(player, killer);
      } catch (statsError) {
        console.warn("[Webhook] Could not record death stats:", statsError.message);
      }
    }

    // NEW v4.1.0: Archive death event
    if (globalThis.webhookExpansion?.eventArchive) {
      try {
        globalThis.webhookExpansion.eventArchive.archiveEvent(
          "playerDeath",
          {
            playerName: player.name,
            playerId: player.id,
            killerId: damageSource?.damagingEntity?.id,
            killerName: killer,
            location: { x: location.x, y: location.y, z: location.z }
          },
          "deaths"
        );
      } catch (archiveError) {
        console.warn("[Webhook] Could not archive death event:", archiveError.message);
      }
    }

    const embed = {
      author: {
        name: `💀 ${player.name} died`,
        icon_url: getPlayerAvatar(player.name)
      },
      color: WHHelpers.getColor("death"),
      fields: [
        {
          name: "Killer",
          value: killer,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    };

    if (WHHelpers.isEnabled("players.locationTracking")) {
      embed.fields.push({
        name: "Location",
        value: `${Math.floor(location.x)}, ${Math.floor(location.y)}, ${Math.floor(location.z)}`,
        inline: true
      });
    }

    await sendWebhook("deaths", { embeds: [embed] });
  } catch (error) {
    console.warn("[Webhook] Death handling error:", error.message);
  }
}

async function handleBlockBreak(event) {
  try {
    const block = event.brokenBlockPermutation;
    const watchlist = WHConfig.features.blocks.watchlist;
    const blockType = block.type.id.replace("minecraft:", "");

    // NEW v4.1.0: Track block statistics
    if (globalThis.webhookExpansion?.playerStats) {
      try {
        globalThis.webhookExpansion.playerStats.recordBlockBreak(event.player, blockType);
      } catch (statsError) {
        console.warn("[Webhook] Could not record block stats:", statsError.message);
      }
    }

    if (watchlist.some(b => block.type.id.includes(b))) {
      const blockName = block.type.id.split(":")[1].replace(/_/g, " ");

      // NEW v4.1.0: Archive block event
      if (globalThis.webhookExpansion?.eventArchive) {
        try {
          globalThis.webhookExpansion.eventArchive.archiveEvent(
            "blockBreak",
            {
              playerName: event.player.name,
              playerId: event.player.id,
              blockType: blockName,
              location: event.block.location
            },
            "blockLogs"
          );
        } catch (archiveError) {
          console.warn("[Webhook] Could not archive block event:", archiveError.message);
        }
      }

      await sendWebhook("blockLogs", {
        embeds: [{
          author: {
            name: `${event.player.name} broke ${blockName}`,
            icon_url: getPlayerAvatar(event.player.name)
          },
          color: WHHelpers.getColor("warning"),
          fields: [
            {
              name: "Block",
              value: blockName,
              inline: true
            }
          ],
          timestamp: new Date().toISOString()
        }]
      });
    }
  } catch (error) {
    console.error("[Webhook] Block break error:", error);
  }
}

function checkAFKPlayers() {
  const afkTimeout = WHConfig.features.players.afkTimeout;

  for (const [playerId, session] of playerTracker.sessions) {
    const timeSinceActivity = Date.now() - session.lastActivity;
    const isAFK = playerTracker.afkPlayers.has(playerId);

    if (!isAFK && timeSinceActivity > afkTimeout) {
      playerTracker.setAFK(playerId, true);
    }
  }
}

// ============================================
// COMMAND HANDLERS
// ============================================

function setupCommands() {
  world.afterEvents.chatSend.subscribe((event) => {
    if (!event.message.startsWith("!webhook ")) return;

    const args = event.message.substring(9).split(" ");
    const command = args[0];

    switch (command) {
      case "health":
        showWebhookHealth(event.sender);
        break;
      case "status":
        showStatus(event.sender);
        break;
      case "test":
        testWebhooks(event.sender);
        break;
      case "help":
        showHelp(event.sender);
        break;
      default:
        event.sender.sendMessage("§e!webhook health|status|test|help");
    }
  });
}

function showWebhookHealth(player) {
  const report = webhookManager.getHealthReport();
  player.sendMessage("§6=== Webhook Health ===");

  for (const [url, data] of Object.entries(report)) {
    const color = data.circuitState === 'OPEN' ? '§c' : data.successRate < 80 ? '§e' : '§a';
    player.sendMessage(`${color}${url.substring(0, 50)}... §f${data.successRate}%`);
  }
}

function showStatus(player) {
  player.sendMessage("§6=== System Status ===");
  player.sendMessage(`§eActive Sessions: §f${playerTracker.getActiveCount()}`);
  player.sendMessage(`§eQueue Size: §f${webhookManager.messageQueue.length}`);
  player.sendMessage(`§eRetry Queue: §f${webhookManager.retryQueue.length}`);
}

async function testWebhooks(player) {
  player.sendMessage("§aTesting webhooks...");

  for (const [name, url] of Object.entries(WHConfig.webhooks)) {
    if (url && webhookManager.validateUrl(url)) {
      await sendWebhook(name, {
        embeds: [{
          title: "🧪 Webhook Test",
          description: `Testing ${name}`,
          color: 0x2ECC71,
          timestamp: new Date().toISOString()
        }]
      }, true);
    }
  }

  player.sendMessage("§aTest complete!");
}

function showHelp(player) {
  player.sendMessage("§6Discord Webhook Plugin v4.0.0");
  player.sendMessage("§eCommands:");
  player.sendMessage("§f!webhook health §7- Show webhook status");
  player.sendMessage("§f!webhook status §7- Show system status");
  player.sendMessage("§f!webhook test §7- Test webhooks");
}

// ============================================
// INITIALIZATION
// ============================================

let isInitialized = false;
const pluginStartTime = Date.now();

async function initializePlugin() {
  if (isInitialized) return;

  console.info("[Webhook] Initializing Discord Webhook Plugin v4.0.0...");

  try {
    // Validate webhooks
    let validCount = 0;
    console.info("[Webhook] Starting webhook URL validation...");
    for (const [name, url] of Object.entries(WHConfig.webhooks)) {
      const isValid = url && webhookManager.validateUrl(url);
      console.info(`[Webhook] ${name}: ${isValid ? '✓' : '✗'} - ${url ? url.substring(0, 60) + '...' : 'null'}`);
      if (isValid) {
        validCount++;
      }
    }
    console.info(`[Webhook] Validated ${validCount} webhook URLs`);

    // Setup background tasks
    system.runInterval(() => {
      webhookManager.processBatch();
    }, Math.floor(WHConfig.advanced.performance.messageQueueDelay / 50));

    system.runInterval(() => {
      webhookManager.processRetryQueue();
    }, 20);

    // Setup event handlers
    setupEventHandlers();
    setupCommands();

    // ============================================
    // v4.1.0 HOURLY ANALYTICS RECORDING
    // ============================================

    system.runInterval(() => {
      try {
        if (globalThis.webhookExpansion?.serverAnalytics && globalThis.webhookExpansion?.playerStats) {
          const hourlyData = globalThis.webhookExpansion.serverAnalytics.recordHourlyStats(
            globalThis.webhookExpansion.playerStats?.playerStats
          );

          if (WHConfig.advanced.debug.enabled) {
            console.log(`[Webhook] Hourly stats recorded: ${hourlyData.playerCount} players online`);
          }
        }
      } catch (error) {
        console.warn("[Webhook] Hourly stats recording error:", error.message);
      }
    }, 72000); // 1 hour = 72000 ticks

    // ============================================
    // v4.1.0 EXPANSION INITIALIZATION
    // ============================================

    try {
      // Initialize statistics managers
      console.info("[Webhook] Initializing PlayerStatsManager...");
      const playerStatsManager = new PlayerStatsManager();

      console.info("[Webhook] Initializing ServerAnalytics...");
      const serverAnalytics = new ServerAnalytics();

      console.info("[Webhook] Initializing DataManager...");
      const dataManager = new DataManager("./plugins/webhookbridge/data");

      console.info("[Webhook] Initializing EventArchive...");
      const eventArchive = new EventArchive(dataManager);

      // Initialize event managers
      console.info("[Webhook] Initializing EntityEventManager...");
      try {
        const entityManager = new EntityEventManager(sendWebhook, WHConfig, WHHelpers);
        entityManager.initialize();
        console.info("[Webhook] EntityEventManager initialized successfully");
      } catch (e) {
        console.warn("[Webhook] EntityEventManager initialization failed:", e.message);
      }

      console.info("[Webhook] Initializing ItemEventManager...");
      try {
        const itemManager = new ItemEventManager(sendWebhook, WHConfig, WHHelpers);
        itemManager.initialize();
        console.info("[Webhook] ItemEventManager initialized successfully");
      } catch (e) {
        console.warn("[Webhook] ItemEventManager initialization failed:", e.message);
      }

      // Initialize server analytics
      console.info("[Webhook] Initializing server analytics...");
      try {
        serverAnalytics.initialize();
        console.info("[Webhook] ServerAnalytics initialized successfully");
      } catch (e) {
        console.warn("[Webhook] ServerAnalytics initialization failed:", e.message);
      }

      // ============================================
      // Initialize Advanced Feature Modules
      // ============================================

      console.info("[Webhook] Initializing advanced feature modules...");

      const embedBuilder = new EmbedBuilder(WHConfig.appearance);
      console.info("[Webhook] EmbedBuilder initialized");

      const advancedStats = new AdvancedStats();
      console.info("[Webhook] AdvancedStats initialized");

      const reportGenerator = new ReportGenerator();
      console.info("[Webhook] ReportGenerator initialized");

      const performanceMonitor = new PerformanceMonitor();
      console.info("[Webhook] PerformanceMonitor initialized");

      const treasureHunt = new TreasureHunt(sendWebhook, WHConfig);
      console.info("[Webhook] TreasureHunt initialized");

      const bossSystem = new BossSystem(sendWebhook, WHConfig);
      console.info("[Webhook] BossSystem initialized");

      const moderationLogger = new ModerationLogger(sendWebhook, WHConfig);
      console.info("[Webhook] ModerationLogger initialized");

      const worldExplorer = new WorldExplorer(sendWebhook, WHConfig);
      console.info("[Webhook] WorldExplorer initialized");

      const discordDashboard = new DiscordDashboard(sendWebhook, WHConfig);
      console.info("[Webhook] DiscordDashboard initialized");

      // Setup periodic metric recording
      system.runInterval(() => {
        try {
          if (WHConfig.features?.server?.performanceMonitoring) {
            performanceMonitor.recordMetric(world, system);
          }
        } catch (e) {
          console.warn("[Webhook] Performance monitoring error:", e.message);
        }
      }, 1200); // Every 60 seconds (1200 ticks = 60 seconds)

      // Make managers global for access in other functions
      globalThis.webhookExpansion = {
        playerStats: playerStatsManager,
        serverAnalytics,
        dataManager,
        eventArchive,
        embedBuilder,
        advancedStats,
        reportGenerator,
        performanceMonitor,
        treasureHunt,
        bossSystem,
        moderationLogger,
        worldExplorer,
        discordDashboard,
        initialized: true
      };

      console.info("[Webhook] v4.1.0 advanced feature modules initialized successfully!");

    } catch (error) {
      console.error("[Webhook] Failed to initialize expansion modules:", error.message);
      console.error("[Webhook] Stack trace:", error.stack);
      console.warn("[Webhook] Plugin will continue with limited functionality");

      // Ensure globalThis.webhookExpansion is set even if initialization fails
      if (!globalThis.webhookExpansion) {
        globalThis.webhookExpansion = {
          initialized: false
        };
      }
    }

    // Mark as initialized FIRST to prevent retry loops
    isInitialized = true;
    console.info("[Webhook] Plugin initialized successfully!");

    // Send startup message (delayed to ensure everything is ready)
    if (WHHelpers.isEnabled("server.startStop")) {
      system.runTimeout(() => {
        sendWebhook("serverEvents", {
          embeds: [{
            title: "🟢 Server Started",
            description: `${WHConfig.appearance.serverName} is now online!`,
            color: WHHelpers.getColor("success"),
            fields: [
              {
                name: "Version",
                value: "Webhook Plugin v4.0.0",
                inline: true
              },
              {
                name: "Webhooks Configured",
                value: validCount.toString(),
                inline: true
              }
            ],
            thumbnail: { url: WHConfig.appearance.serverIcon },
            timestamp: new Date().toISOString()
          }]
        }, true);
      }, 100);  // Delay startup message by 100ms
    }

  } catch (error) {
    console.error(`[Webhook] Initialization error: ${error}`);
  }
}

// Try BedrockBridge Integration
try {
  const bridgeModule = await import("esploratori/bridgeAPI");
  const bridge = bridgeModule.bridge;

  if (bridge?.events?.bridgeInitialize) {
    bridge.events.bridgeInitialize.subscribe(() => {
      system.run(() => initializePlugin());
    });
  } else {
    system.run(() => initializePlugin());
  }
} catch (error) {
  console.warn("[Webhook] Running in standalone mode");
  system.run(() => initializePlugin());
}

// ============================================
// WEBHOOK ADDON INITIALIZATION
// ============================================

// Import addon
let WebhookAddon;
try {
  const addonModule = await import("./webhook-addon.js");
  WebhookAddon = addonModule.WebhookAddon;
} catch (error) {
  console.warn("[Webhook] Could not load webhook addon:", error.message);
}

// Initialize addon if available
let webhookAddon = null;
if (WebhookAddon) {
  webhookAddon = new WebhookAddon(webhookManager, WHHelpers, WHConfig);

  // Wait for initialization to complete
  system.runTimeout(() => {
    webhookAddon.initialize();
    console.info("[Webhook] Addon API initialized and ready for other plugins");
  }, 1);
}

// ============================================
// EXPORTS
// ============================================

// Export for external use (backwards compatibility)
globalThis.DiscordWebhook = {
  version: "4.0.0",
  status: () => ({
    initialized: isInitialized,
    uptime: formatDuration(Date.now() - pluginStartTime),
    activeSessions: playerTracker.getActiveCount(),
    queueSize: webhookManager.messageQueue.length,
    retryQueue: webhookManager.retryQueue.length,
    health: webhookManager.getHealthReport()
  }),

  sendWebhook,
  webhookManager,
  playerTracker,
  WHConfig,
  WHHelpers,

  testWebhook: (type = "general") => {
    sendWebhook(type, {
      embeds: [{
        title: "Manual Test",
        description: `Testing ${type}`,
        color: 0x2ECC71,
        timestamp: new Date().toISOString()
      }]
    }, true);
  }
};

// Export webhook addon if available
if (webhookAddon) {
  globalThis.webhookAddon = webhookAddon;
  console.info("[Webhook] Webhook Addon API exposed globally for plugins");
}

console.info("[Webhook] Discord Webhook Plugin v4.0.0 loaded successfully!");
