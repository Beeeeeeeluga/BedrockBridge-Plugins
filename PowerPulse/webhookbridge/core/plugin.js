// webhook/core/plugin.js - Plugin Core Management
import { world, system } from "@minecraft/server";
import { getConfig, getHelpers } from '../config.js';
import { initializeDatabase } from './database.js';
import { sendWebhook, startQueueProcessor } from './webhook.js';

// Handler imports
import { setupChatHandlers } from '../handlers/chat.js';
import { setupPlayerHandlers } from '../handlers/player.js';
import { setupCombatHandlers } from '../handlers/combat.js';
import { setupWorldHandlers } from '../handlers/world.js';
import { setupBlockHandlers } from '../handlers/blocks.js';
import { setupCommandHandlers } from '../handlers/commands.js';

// Service imports
import { startAFKService } from '../services/afk.js';
import { startAnalyticsService } from '../services/analytics.js';
import { initializeSpamService } from '../services/spam.js';

// Plugin state
export const plugin = {
  initialized: false,
  bridge: null,
  bridgeAvailable: false,
  startTime: Date.now(),
  lastHeartbeat: Date.now()
};

// Shared runtime state
export const state = {
  recentMessages: new Map(),
  playerSessions: new Map(),
  afkPlayers: new Map(),
  spamTracking: new Map()
};

// Event emitters for cross-module communication
export const pluginEvents = {
  onInitialized: new Set(),
  onShutdown: new Set(),
  onPlayerActivity: new Set()
};

/**
 * Initialize the plugin
 * @param {object} bridge - BedrockBridge API instance
 */
export async function initialize(bridge) {
  try {
    console.info("[Webhook] Starting initialization...");
    
    // Store bridge reference
    if (bridge) {
      plugin.bridge = bridge;
      plugin.bridgeAvailable = true;
    }
    
    // Initialize database
    await initializeDatabase(bridge);
    
    // Setup all handlers
    await setupHandlers();
    
    // Start background services
    startBackgroundServices();
    
    // Send startup message
    const config = getConfig();
    const helpers = getHelpers();
    
    if (helpers.isEnabled("server.startStop")) {
      sendWebhook("serverEvents", {
        embeds: [{
          title: helpers.formatMessage(config.messages.server.start, {
            serverName: config.appearance.serverName
          }),
          color: helpers.getColor("success"),
          fields: [
            {
              name: "Version",
              value: "Webhook Plugin v2.1.0",
              inline: true
            },
            {
              name: "Mode",
              value: plugin.bridgeAvailable ? "BedrockBridge" : "Standalone",
              inline: true
            }
          ],
          thumbnail: { url: config.appearance.serverIcon },
          timestamp: new Date().toISOString()
        }]
      });
    }
    
    plugin.initialized = true;
    plugin.lastHeartbeat = Date.now();
    
    // Emit initialized event
    pluginEvents.onInitialized.forEach(callback => callback());
    
    console.info("[Webhook] Initialization complete!");
    
  } catch (error) {
    console.error(`[Webhook] Initialization failed: ${error}`);
    console.error(`[Webhook] Stack: ${error.stack}`);
  }
}

/**
 * Setup all event handlers
 */
async function setupHandlers() {
  const config = getConfig();
  const helpers = getHelpers();
  
  console.info("[Webhook] Setting up handlers...");
  
  // Chat handlers
  if (helpers.isEnabled("chat.enabled")) {
    setupChatHandlers(plugin.bridge);
  }
  
  // Player handlers
  if (helpers.isEnabled("players.joinLeave") || helpers.isEnabled("players.afkDetection")) {
    setupPlayerHandlers(plugin.bridge);
  }
  
  // Combat handlers
  if (helpers.isEnabled("combat.deathMessages") || helpers.isEnabled("combat.pvpKills")) {
    setupCombatHandlers(plugin.bridge);
  }
  
  // World handlers
  if (helpers.isEnabled("world.bossKills") || helpers.isEnabled("world.weatherChanges")) {
    setupWorldHandlers(plugin.bridge);
  }
  
  // Block handlers
  if (helpers.isEnabled("blocks.valuable") || helpers.isEnabled("blocks.containers")) {
    setupBlockHandlers(plugin.bridge);
  }
  
  // Command handlers
  setupCommandHandlers(plugin.bridge);
  
  console.info("[Webhook] Handlers setup complete");
}

/**
 * Start background services
 */
function startBackgroundServices() {
  const config = getConfig();
  const helpers = getHelpers();
  
  console.info("[Webhook] Starting background services...");
  
  // Message queue processor
  startQueueProcessor();
  
  // AFK detection service
  if (helpers.isEnabled("players.afkDetection")) {
    startAFKService();
  }
  
  // Analytics service
  if (helpers.isEnabled("analytics.enabled")) {
    startAnalyticsService();
  }
  
  // Spam service
  if (helpers.isEnabled("chat.antiSpam")) {
    initializeSpamService();
  }
  
  // Cleanup service
  startCleanupService();
  
  // Heartbeat
  system.runInterval(() => {
    plugin.lastHeartbeat = Date.now();
  }, Math.floor(config.advanced.intervals.heartbeat / 50));
  
  console.info("[Webhook] Background services started");
}

/**
 * Cleanup service
 */
function startCleanupService() {
  const config = getConfig();
  
  system.runInterval(() => {
    performCleanup();
  }, Math.floor(config.advanced.intervals.cleanup / 50));
}

/**
 * Perform cleanup tasks
 */
function performCleanup() {
  const config = getConfig();
  const now = Date.now();
  
  // Clean old cache entries
  for (const [key, time] of state.recentMessages) {
    if (now - time > config.advanced.performance.cacheTTL) {
      state.recentMessages.delete(key);
    }
  }
  
  // Clean spam tracking
  for (const [playerId, tracking] of state.spamTracking) {
    tracking.messages = tracking.messages.filter(time => now - time < 60000);
    if (tracking.messages.length === 0 && tracking.warnings === 0) {
      state.spamTracking.delete(playerId);
    }
  }
  
  // Limit cache size
  if (state.recentMessages.size > config.advanced.performance.cacheSize) {
    const sorted = Array.from(state.recentMessages.entries())
      .sort((a, b) => a[1] - b[1]);
    const toRemove = sorted.slice(0, sorted.length - config.advanced.performance.cacheSize);
    toRemove.forEach(([key]) => state.recentMessages.delete(key));
  }
}

/**
 * Shutdown the plugin
 */
export function shutdown() {
  const config = getConfig();
  const helpers = getHelpers();
  
  if (helpers.isEnabled("server.startStop")) {
    sendWebhook("serverEvents", {
      embeds: [{
        title: helpers.formatMessage(config.messages.server.stop, {
          serverName: config.appearance.serverName
        }),
        color: helpers.getColor("error"),
        fields: [
          {
            name: "Uptime",
            value: formatDuration(Date.now() - plugin.startTime),
            inline: true
          }
        ],
        thumbnail: { url: config.appearance.serverIcon },
        timestamp: new Date().toISOString()
      }]
    }, true);
  }
  
  // Emit shutdown event
  pluginEvents.onShutdown.forEach(callback => callback());
}

/**
 * Get plugin status
 */
export function getStatus() {
  const config = getConfig();
  
  return {
    initialized: plugin.initialized,
    mode: plugin.bridgeAvailable ? "BedrockBridge" : "Standalone",
    uptime: formatDuration(Date.now() - plugin.startTime),
    sessions: state.playerSessions.size,
    webhooksConfigured: Object.values(config.webhooks).filter(w => w).length,
    featuresActive: countActiveFeatures(),
    lastHeartbeat: new Date(plugin.lastHeartbeat).toISOString()
  };
}

/**
 * Count active features
 */
function countActiveFeatures() {
  const config = getConfig();
  let count = 0;
  
  function countObject(obj) {
    for (const value of Object.values(obj)) {
      if (value === true) count++;
      else if (typeof value === "object" && !Array.isArray(value)) countObject(value);
    }
  }
  
  countObject(config.features);
  return count;
}

/**
 * Format duration to human readable string
 */
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