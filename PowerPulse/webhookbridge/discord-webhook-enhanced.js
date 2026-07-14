/**
 * ============================================
 * DISCORD WEBHOOK PLUGIN - ENHANCED v4.0.0
 * ============================================
 *
 * Ein hochoptimiertes, modulares Discord Webhook System für BedrockBridge
 * mit professioneller Architektur, erweiterten Funktionen und Best Practices.
 *
 * Features:
 * - Modulare Architektur mit separaten Concerns
 * - Erweiterte Error-Handling und Retry-Logik
 * - Circuit-Breaker Pattern für robuste Kommunikation
 * - Rate-Limiting Management
 * - Webhook-Health-Monitoring
 * - Automatische Batch-Verarbeitung
 * - Comprehensive Analytics und Logging
 * - Plugin-System für Custom Handlers
 * - Performance Optimizationen
 *
 * @author BedrockBridge Community
 * @version 4.0.0
 */

import { world, system, Player } from "@minecraft/server";
import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net";
import { WHConfig, WHHelpers } from "./config.js";

// ============================================
// WEBHOOK MANAGER - Enhanced Communication System
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

  /**
   * Validiere Webhook URL
   */
  validateUrl(url) {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' &&
             (urlObj.hostname.includes('discord.com') ||
              urlObj.hostname.includes('webhooks'));
    } catch {
      return false;
    }
  }

  /**
   * Prüfe Rate Limits
   */
  checkRateLimit(url) {
    const tracker = this.rateLimitTracker.get(url);
    if (!tracker) return true;

    if (Date.now() >= tracker.resetTime) {
      this.rateLimitTracker.delete(url);
      return true;
    }
    return false;
  }

  /**
   * Update Rate Limit Informationen
   */
  updateRateLimit(url, response) {
    const remaining = parseInt(response.getHeader('X-RateLimit-Remaining') || '1');
    const resetTime = parseInt(response.getHeader('X-RateLimit-Reset') || '0') * 1000;

    this.rateLimitTracker.set(url, {
      remaining: Math.max(0, remaining),
      resetTime: resetTime || Date.now() + 60000
    });

    return remaining > 0;
  }

  /**
   * Circuit Breaker State Management
   */
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

    // Auto-Transition OPEN -> HALF_OPEN nach 30s
    if (breaker.state === 'OPEN' && Date.now() - breaker.lastStateChange > 30000) {
      breaker.state = 'HALF_OPEN';
      breaker.successAfterOpen = 0;
      breaker.lastStateChange = Date.now();
    }

    return breaker.state;
  }

  /**
   * Erfolgreiche Request aufzeichnen
   */
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

  /**
   * Fehlgeschlagene Request aufzeichnen
   */
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

  /**
   * Request Attempt Statistiken
   */
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

    // Request History (max 100)
    if (!this.requestHistory.has(url)) {
      this.requestHistory.set(url, []);
    }
    const history = this.requestHistory.get(url);
    history.push({ timestamp: Date.now(), status: success ? 'success' : 'failed' });
    if (history.length > 100) history.shift();
  }

  /**
   * Hole Webhook Statistiken
   */
  getStats(url) {
    return this.webhookStats.get(url) || {
      attempts: 0,
      success: 0,
      failed: 0,
      lastError: null,
      lastSuccess: null
    };
  }

  /**
   * Berechne Success Rate
   */
  getSuccessRate(url) {
    const stats = this.getStats(url);
    return stats.attempts > 0 ? (stats.success / stats.attempts * 100).toFixed(1) : 'N/A';
  }

  /**
   * Retry Queue Management
   */
  addToRetryQueue(url, data, attempts = 0) {
    if (attempts >= 3) {
      logError(`Max retries exceeded for ${url}`);
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

  /**
   * Verarbeite Retry Queue
   */
  processRetryQueue() {
    const now = Date.now();
    const toRetry = this.retryQueue.filter(item => item.nextRetry <= now);
    this.retryQueue = this.retryQueue.filter(item => item.nextRetry > now);

    for (const item of toRetry) {
      sendWebhookRequest(item.url, item.data, item.attempts);
    }
  }

  /**
   * Queue Message für Batch-Processing
   */
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

  /**
   * Batch-Verarbeitung
   */
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
      logError("Batch processing error", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Health Check Bericht
   */
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
// EVENT SYSTEM - Plugin-Architecture
// ============================================

class EventSystem {
  constructor() {
    this.events = new Map();
    this.listeners = new Map();
  }

  /**
   * Registriere Event Listener
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  /**
   * Emit Event
   */
  async emit(eventName, data) {
    const callbacks = this.listeners.get(eventName) || [];
    for (const callback of callbacks) {
      try {
        await callback(data);
      } catch (error) {
        logError(`Event error for ${eventName}`, error);
      }
    }
  }

  /**
   * Registriere Custom Handler
   */
  registerHandler(name, handler) {
    this.events.set(name, handler);
    console.info(`[Webhook] Handler registered: ${name}`);
  }

  /**
   * Hole Handler
   */
  getHandler(name) {
    return this.events.get(name);
  }

  /**
   * Liste alle Handler auf
   */
  listHandlers() {
    return Array.from(this.events.keys());
  }
}

const eventSystem = new EventSystem();

// ============================================
// WEBHOOK SENDER - Enhanced HTTP Communication
// ============================================

async function sendWebhookRequest(webhookUrl, data, attempts = 0) {
  try {
    const request = new HttpRequest(webhookUrl);
    request.method = HttpRequestMethod.Post;
    request.headers = [
      new HttpHeader("Content-Type", "application/json"),
      new HttpHeader("User-Agent", "BedrockBridge-Webhook/4.0")
    ];
    request.body = JSON.stringify(data);

    const response = await http.request(request);
    const rateLimitOk = webhookManager.updateRateLimit(webhookUrl, response);

    if (response.status === 200 || response.status === 204) {
      webhookManager.recordSuccess(webhookUrl);
      return;
    } else if (response.status === 429) {
      webhookManager.recordSuccess(webhookUrl);
      webhookManager.addToRetryQueue(webhookUrl, data, attempts);
    } else if (response.status >= 500) {
      webhookManager.recordFailure(webhookUrl);
      webhookManager.addToRetryQueue(webhookUrl, data, attempts);
    } else if (response.status >= 400) {
      webhookManager.recordFailure(webhookUrl);
      throw new Error(`Webhook failed with status ${response.status}: ${response.body}`);
    }
  } catch (error) {
    webhookManager.recordFailure(webhookUrl);
    logError(`Webhook send failed (attempt ${attempts + 1})`, error);

    if (attempts < 3) {
      webhookManager.addToRetryQueue(webhookUrl, data, attempts);
    }
  }
}

// ============================================
// PLAYER TRACKING SYSTEM
// ============================================

class PlayerTracker {
  constructor() {
    this.sessions = new Map();
    this.afkPlayers = new Map();
    this.spamTracking = new Map();
    this.achievements = new Map();
  }

  /**
   * Track Player Session
   */
  trackSession(playerId, player) {
    this.sessions.set(playerId, {
      player: player.name,
      joinTime: Date.now(),
      lastActivity: Date.now(),
      location: player.location,
      dimension: player.dimension.id
    });
  }

  /**
   * Update Activity
   */
  updateActivity(playerId) {
    const session = this.sessions.get(playerId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  /**
   * End Session
   */
  endSession(playerId) {
    return this.sessions.get(playerId);
  }

  /**
   * Track AFK Status
   */
  setAFK(playerId, isAFK) {
    if (isAFK) {
      this.afkPlayers.set(playerId, Date.now());
    } else {
      this.afkPlayers.delete(playerId);
    }
  }

  /**
   * Check Spam
   */
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

  /**
   * Track Achievement
   */
  trackAchievement(playerId, achievement) {
    if (!this.achievements.has(playerId)) {
      this.achievements.set(playerId, []);
    }
    this.achievements.get(playerId).push(achievement);
  }

  /**
   * Cleanup
   */
  cleanup(playerId) {
    this.sessions.delete(playerId);
    this.afkPlayers.delete(playerId);
    this.spamTracking.delete(playerId);
  }

  /**
   * Get Active Sessions Count
   */
  getActiveCount() {
    return this.sessions.size;
  }
}

const playerTracker = new PlayerTracker();

// ============================================
// HELPER FUNCTIONS
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

function createEmbed(title, color = 0x3498DB) {
  return {
    title,
    color,
    fields: [],
    timestamp: new Date().toISOString()
  };
}

function logError(message, error = null) {
  console.error(`[Webhook] ${message}`, error?.message || "");

  sendWebhook("errors", {
    embeds: [{
      title: "❌ Error",
      description: message,
      color: WHHelpers.getColor("error"),
      fields: error ? [{
        name: "Details",
        value: error.toString().substring(0, 1024),
        inline: false
      }] : [],
      timestamp: new Date().toISOString()
    }]
  });
}

// ============================================
// MAIN WEBHOOK SENDER
// ============================================

async function sendWebhook(type, data, immediate = false) {
  const webhookUrl = WHHelpers.getWebhook(type);

  if (!webhookUrl) {
    if (WHConfig.advanced.debug.enabled) {
      console.warn(`[Webhook] No webhook URL for type: ${type}`);
    }
    return;
  }

  if (!webhookManager.validateUrl(webhookUrl)) {
    logError(`Invalid webhook URL for ${type}`);
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

  // Emit event
  await eventSystem.emit("webhook:sent", { type, data });
}

// ============================================
// INITIALIZATION
// ============================================

let isInitialized = false;
const pluginStartTime = Date.now();

async function initializePlugin() {
  if (isInitialized) return;

  console.info("[Webhook] Initializing Enhanced Discord Webhook Plugin v4.0.0...");

  try {
    // Validate webhooks
    let validCount = 0;
    for (const [name, url] of Object.entries(WHConfig.webhooks)) {
      if (url && webhookManager.validateUrl(url)) {
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

    // Send startup message
    if (WHHelpers.isEnabled("server.startStop")) {
      await sendWebhook("serverEvents", {
        embeds: [{
          title: "🟢 Server Started",
          description: `${WHConfig.appearance.serverName} is now online!`,
          color: WHHelpers.getColor("success"),
          fields: [
            {
              name: "Version",
              value: "Webhook Plugin v4.0.0 Enhanced",
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
    }

    isInitialized = true;
    console.info("[Webhook] Plugin initialized successfully!");

  } catch (error) {
    console.error(`[Webhook] Initialization error: ${error}`);
  }
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

// ============================================
// INDIVIDUAL HANDLERS
// ============================================

async function handleChatMessage(event) {
  try {
    const player = event.sender;

    if (WHHelpers.isEnabled("chat.antiSpam") && playerTracker.checkSpam(player.id)) {
      event.cancel = true;
      player.sendMessage("§cBitte langsamer schreiben!");
      return;
    }

    if (WHHelpers.isEnabled("chat.logToDiscord")) {
      await sendWebhook("chat", {
        content: `${player.name}: ${event.message}`,
        username: player.name,
        avatar_url: getPlayerAvatar(player.name)
      });
    }
  } catch (error) {
    logError("Chat handling error", error);
  }
}

async function handlePlayerJoin(player) {
  try {
    playerTracker.trackSession(player.id, player);

    const embed = {
      author: {
        name: `${player.name} joined`,
        icon_url: getPlayerAvatar(player.name)
      },
      color: WHHelpers.getColor("join"),
      fields: [
        {
          name: "Players Online",
          value: world.getAllPlayers().length.toString(),
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    };

    await sendWebhook("playerEvents", { embeds: [embed] });
  } catch (error) {
    logError("Player join error", error);
  }
}

async function handlePlayerLeave(playerId) {
  try {
    const session = playerTracker.endSession(playerId);
    if (!session) return;

    const sessionTime = Date.now() - session.joinTime;

    await sendWebhook("playerEvents", {
      embeds: [{
        author: {
          name: `${session.player} left the game`
        },
        color: WHHelpers.getColor("leave"),
        fields: [
          {
            name: "Session Duration",
            value: formatDuration(sessionTime),
            inline: true
          }
        ],
        timestamp: new Date().toISOString()
      }]
    });

    playerTracker.cleanup(playerId);
  } catch (error) {
    logError("Player leave error", error);
  }
}

async function handlePlayerDeath(event) {
  try {
    const player = event.deadEntity;
    const location = player.location;

    const embed = {
      author: {
        name: `💀 ${player.name} died`,
        icon_url: getPlayerAvatar(player.name)
      },
      color: WHHelpers.getColor("death"),
      fields: [],
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
    logError("Death handling error", error);
  }
}

async function handleBlockBreak(event) {
  try {
    const block = event.brokenBlockPermutation;
    const watchlist = WHConfig.features.blocks.watchlist;

    if (watchlist.some(b => block.type.id.includes(b))) {
      const blockName = block.type.id.split(":")[1].replace(/_/g, " ");

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
    logError("Block break error", error);
  }
}

function checkAFKPlayers() {
  const afkTimeout = WHConfig.features.players.afkTimeout;

  for (const [playerId, session] of playerTracker.sessions) {
    const timeSinceActivity = Date.now() - session.lastActivity;
    const isAFK = playerTracker.afkPlayers.has(playerId);

    if (!isAFK && timeSinceActivity > afkTimeout) {
      playerTracker.setAFK(playerId, true);
      // Emit AFK event
      eventSystem.emit("player:afk", { playerId, player: session.player });
    }
  }
}

// ============================================
// PLUGIN COMMANDS
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
  player.sendMessage(`§eInitialized: §a${isInitialized}`);
  player.sendMessage(`§eUptime: §f${formatDuration(Date.now() - pluginStartTime)}`);
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
// STARTUP
// ============================================

console.info("[Webhook] Loading Enhanced Discord Webhook Plugin v4.0.0...");

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

// Setup commands
setupCommands();

// Export for external use
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
  eventSystem,
  playerTracker,

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

console.info("[Webhook] Enhanced Discord Webhook Plugin v4.0.0 loaded successfully!");
