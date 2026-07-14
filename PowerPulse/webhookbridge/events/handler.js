// webhook/events/handler.js - Event Handler Loader
import { eventManager } from "../core/events.js";

// Core event handlers
import "./chat.js";
import "./player/joined.js";
import "./player/left.js";
import "./player/died.js";
import "./server/started.js";
import "./server/shutdown.js";
import "./world/weather.js";
import "./world/boss.js";
import "./blocks/break.js";
import "./blocks/place.js";
import "./blocks/container.js";
import "./moderation/command.js";
import "./analytics/stats.js";

// System event handlers
import "./system/afk.js";
import "./system/spam.js";
import "./system/dimension.js";

console.info("[Webhook] Loading event handlers...");

// Track loaded handlers
const loadedHandlers = [
  "chat",
  "player/joined",
  "player/left", 
  "player/died",
  "server/started",
  "server/shutdown",
  "world/weather",
  "world/boss",
  "blocks/break",
  "blocks/place",
  "blocks/container",
  "moderation/command",
  "analytics/stats",
  "system/afk",
  "system/spam",
  "system/dimension"
];

// Attempt to load custom events
const customEvents = [
  // Add custom event imports here
  // "./custom/my-custom-event.js",
];

// Dynamic custom event loader
let customLoaded = 0;
for (const eventFile of customEvents) {
  try {
    await import(eventFile);
    customLoaded++;
    console.info(`[Webhook] Loaded custom event: ${eventFile}`);
  } catch (error) {
    console.warn(`[Webhook] Failed to load custom event ${eventFile}:`, error.message);
  }
}

// Register handler info event
eventManager.on("webhook:getHandlerInfo", (data) => {
  data.response = {
    core: loadedHandlers,
    custom: customLoaded,
    total: loadedHandlers.length + customLoaded,
    events: eventManager.listEvents(),
    stats: eventManager.getStats()
  };
});

console.info(`[Webhook] Loaded ${loadedHandlers.length} core handlers and ${customLoaded} custom handlers`);

// Export handler utilities
export const HandlerUtils = {
  /**
   * Register a custom event handler
   * @param {string} name - Handler name
   * @param {function} init - Initialization function
   */
  registerCustomHandler: (name, init) => {
    try {
      init();
      console.info(`[Webhook] Registered custom handler: ${name}`);
      return true;
    } catch (error) {
      console.error(`[Webhook] Failed to register custom handler ${name}:`, error);
      return false;
    }
  },
  
  /**
   * Get loaded handler information
   */
  getHandlerInfo: async () => {
    const data = {};
    await eventManager.emit("webhook:getHandlerInfo", data);
    return data.response;
  }
};