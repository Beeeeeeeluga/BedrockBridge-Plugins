// webhook/core/events.js - Event Management System
import { world, system } from "@minecraft/server";

/**
 * Event Manager for the Webhook Plugin
 * Handles custom events, hooks, and event priorities
 */
export class EventManager {
  constructor() {
    this.listeners = new Map();
    this.hooks = new Map();
    this.eventStats = new Map();
    this.debug = false;
  }
  
  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @param {number} priority - Priority (higher = earlier)
   */
  on(event, callback, priority = 100) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
      this.eventStats.set(event, { emitted: 0, listeners: 0 });
    }
    
    const listener = {
      callback,
      priority,
      id: Symbol(),
      addedAt: Date.now()
    };
    
    this.listeners.get(event).push(listener);
    
    // Sort by priority (highest first)
    this.listeners.get(event).sort((a, b) => b.priority - a.priority);
    
    // Update stats
    this.eventStats.get(event).listeners++;
    
    if (this.debug) {
      console.log(`[EventManager] Registered listener for '${event}' with priority ${priority}`);
    }
    
    return listener.id;
  }
  
  /**
   * Register a one-time event listener
   */
  once(event, callback, priority = 100) {
    const wrappedCallback = async (...args) => {
      const result = await callback(...args);
      this.off(event, wrappedCallback);
      return result;
    };
    
    // Store original callback reference
    wrappedCallback._originalCallback = callback;
    
    return this.on(event, wrappedCallback, priority);
  }
  
  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return false;
    
    const listeners = this.listeners.get(event);
    const index = listeners.findIndex(l => 
      l.callback === callback || l.callback._originalCallback === callback
    );
    
    if (index !== -1) {
      listeners.splice(index, 1);
      
      // Update stats
      if (this.eventStats.has(event)) {
        this.eventStats.get(event).listeners--;
      }
      
      if (this.debug) {
        console.log(`[EventManager] Removed listener for '${event}'`);
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
      if (this.eventStats.has(event)) {
        this.eventStats.get(event).listeners = 0;
      }
    } else {
      this.listeners.clear();
      this.eventStats.clear();
    }
  }
  
  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {object} data - Event data
   * @returns {Promise<boolean>} - False if cancelled
   */
  async emit(event, data = {}) {
    if (!this.listeners.has(event)) {
      if (this.debug) {
        console.log(`[EventManager] No listeners for event '${event}'`);
      }
      return true;
    }
    
    // Update stats
    if (this.eventStats.has(event)) {
      this.eventStats.get(event).emitted++;
    }
    
    const eventData = {
      ...data,
      event: event,
      timestamp: Date.now(),
      cancelled: false,
      stopPropagation: false,
      
      // Methods
      preventDefault() { 
        this.cancelled = true; 
      },
      
      stopImmediatePropagation() { 
        this.stopPropagation = true; 
      }
    };
    
    const listeners = this.listeners.get(event);
    
    if (this.debug) {
      console.log(`[EventManager] Emitting '${event}' to ${listeners.length} listeners`);
    }
    
    for (const listener of listeners) {
      if (eventData.stopPropagation) break;
      
      try {
        await listener.callback(eventData);
        
        if (eventData.cancelled) {
          if (this.debug) {
            console.log(`[EventManager] Event '${event}' was cancelled`);
          }
          return false;
        }
      } catch (error) {
        console.error(`[EventManager] Error in listener for '${event}':`, error);
        console.error(`[EventManager] Stack:`, error.stack);
        
        // Emit error event
        if (event !== "webhook:error") {
          this.emit("webhook:error", {
            originalEvent: event,
            error: error,
            listener: listener
          });
        }
      }
    }
    
    return !eventData.cancelled;
  }
  
  /**
   * Emit an event after a delay
   */
  emitDelayed(event, data, delayTicks) {
    system.runTimeout(() => {
      this.emit(event, data);
    }, delayTicks);
  }
  
  /**
   * Register a hook (modifiable data)
   */
  registerHook(name, callback) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    
    this.hooks.get(name).push({
      callback,
      addedAt: Date.now()
    });
    
    if (this.debug) {
      console.log(`[EventManager] Registered hook for '${name}'`);
    }
  }
  
  /**
   * Apply hooks to data
   */
  async applyHooks(name, data) {
    if (!this.hooks.has(name)) return data;
    
    let result = data;
    
    for (const hook of this.hooks.get(name)) {
      try {
        const hookResult = await hook.callback(result);
        if (hookResult !== undefined) {
          result = hookResult;
        }
      } catch (error) {
        console.error(`[EventManager] Error in hook '${name}':`, error);
      }
    }
    
    return result;
  }
  
  /**
   * Wait for an event
   */
  waitFor(event, timeout = 0) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      
      const handler = (data) => {
        if (timeoutId) {
          system.clearRunTimeout(timeoutId);
        }
        resolve(data);
      };
      
      this.once(event, handler);
      
      if (timeout > 0) {
        timeoutId = system.runTimeout(() => {
          this.off(event, handler);
          reject(new Error(`Timeout waiting for event '${event}'`));
        }, timeout);
      }
    });
  }
  
  /**
   * Get event statistics
   */
  getStats(event) {
    if (event) {
      return this.eventStats.get(event) || null;
    }
    
    return Object.fromEntries(this.eventStats);
  }
  
  /**
   * List all registered events
   */
  listEvents() {
    return Array.from(this.listeners.keys());
  }
  
  /**
   * Get listeners for an event
   */
  getListeners(event) {
    return this.listeners.get(event) || [];
  }
  
  /**
   * Enable/disable debug mode
   */
  setDebug(enabled) {
    this.debug = enabled;
  }
}

// Create singleton instance
export const eventManager = new EventManager();

// Register global error handler
world.afterEvents.worldInitialize?.subscribe(() => {
  eventManager.on("webhook:error", async (data) => {
    const { originalEvent, error } = data;
    console.error(`[Webhook] Unhandled error in event '${originalEvent}':`, error);
  });
});

// Export event types for TypeScript/documentation
export const WebhookEvents = {
  // Chat events
  BEFORE_CHAT: "webhook:beforeChat",
  AFTER_CHAT: "webhook:afterChat",
  SPAM: "webhook:spam",
  MESSAGE_FILTERED: "webhook:messageFiltered",
  SEND_CHAT: "webhook:sendChat",
  
  // Player events
  BEFORE_PLAYER_JOIN: "webhook:beforePlayerJoin",
  AFTER_PLAYER_JOIN: "webhook:afterPlayerJoin",
  FIRST_JOIN: "webhook:firstJoin",
  BEFORE_PLAYER_LEAVE: "webhook:beforePlayerLeave",
  AFTER_PLAYER_LEAVE: "webhook:afterPlayerLeave",
  PLAYER_DEATH: "webhook:playerDeath",
  PLAYER_RESPAWN: "webhook:playerRespawn",
  AFK_START: "webhook:afkStart",
  AFK_END: "webhook:afkEnd",
  
  // World events
  BOSS_KILL: "webhook:bossKill",
  WEATHER_CHANGE: "webhook:weatherChange",
  DIMENSION_CHANGE: "webhook:dimensionChange",
  
  // Block events
  BLOCK_BREAK: "webhook:blockBreak",
  BLOCK_PLACE: "webhook:blockPlace",
  CONTAINER_ACCESS: "webhook:containerAccess",
  
  // Server events
  SERVER_START: "webhook:serverStart",
  SERVER_STOP: "webhook:serverStop",
  COMMAND: "webhook:command",
  
  // System events
  ERROR: "webhook:error",
  
  // Custom events
  ACHIEVEMENT: "webhook:achievement",
  CUSTOM: "webhook:customEvent"
};