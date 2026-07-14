/**
 * ============================================
 * WEBHOOK ADDON FOR BEDROCKBRIDGE
 * ============================================
 *
 * Provides a unified Webhook API that other BedrockBridge plugins
 * can use to send messages to Discord webhooks
 *
 * Similar to BridgeDirect but for webhooks
 *
 * @author BedrockBridge Community
 * @version 4.0.0
 */

/**
 * WebhookAddon Class
 * Main API for sending webhooks from other plugins
 */
export class WebhookAddon {
  constructor(webhookManager, WHHelpers, WHConfig) {
    this.webhookManager = webhookManager;
    this.WHHelpers = WHHelpers;
    this.WHConfig = WHConfig;
    this.ready = false;
    this.events = {
      onBeforeSend: new Set(),
      onAfterSend: new Set(),
      onError: new Set()
    };
  }

  /**
   * Initialize the addon (called by main plugin)
   */
  initialize() {
    this.ready = true;
    console.info("[Webhook Addon] Initialized and ready for use");
  }

  /**
   * Check if addon is ready to send webhooks
   */
  isReady() {
    return this.ready && this.webhookManager;
  }

  /**
   * Send a custom webhook message
   * @param {string} webhookType - Type of webhook (e.g., 'general', 'chat', 'playerEvents')
   * @param {object} data - Discord message data (embeds, content, etc.)
   * @param {object} options - Additional options (reserved for future use)
   */
  async sendMessage(webhookType, data, options = {}) {
    if (!this.isReady()) {
      throw new Error("[Webhook] Addon not ready - webhook manager not initialized");
    }

    if (!webhookType) {
      throw new Error("[Webhook] webhookType is required");
    }

    const webhookUrl = this.WHHelpers.getWebhook(webhookType);
    if (!webhookUrl) {
      throw new Error(`[Webhook] No webhook URL configured for type: ${webhookType}`);
    }

    if (!this.webhookManager.validateUrl(webhookUrl)) {
      throw new Error(`[Webhook] Invalid webhook URL for: ${webhookType}`);
    }

    // Fire before-send event
    await this._fireEvent('onBeforeSend', { webhookType, data, options });

    try {
      // Add metadata
      if (!data.embeds) data.embeds = [];
      if (options.footer) {
        if (!data.embeds[0]) data.embeds[0] = {};
        data.embeds[0].footer = options.footer;
      }

      // Queue the message (immediate send via direct is not reliable in Bedrock)
      // Always use the queue for consistency
      this.webhookManager.queueMessage(webhookUrl, data, webhookType);

      // Fire after-send event
      await this._fireEvent('onAfterSend', { webhookType, data, options });

      return { success: true, webhookType };
    } catch (error) {
      // Fire error event
      await this._fireEvent('onError', { webhookType, data, error });
      throw error;
    }
  }

  /**
   * Send a Discord embed
   * @param {object} embed - Embed object
   * @param {string} webhookType - Webhook type to use
   * @param {object} options - Additional options
   */
  async sendEmbed(embed, webhookType = 'general', options = {}) {
    if (!embed) {
      throw new Error("[Webhook] Embed object is required");
    }

    // Validate embed structure
    if (typeof embed !== 'object') {
      throw new Error("[Webhook] Embed must be an object");
    }

    return this.sendMessage(webhookType, { embeds: [embed] }, options);
  }

  /**
   * Send multiple embeds at once
   * @param {array} embeds - Array of embed objects
   * @param {string} webhookType - Webhook type to use
   * @param {object} options - Additional options
   */
  async sendEmbeds(embeds, webhookType = 'general', options = {}) {
    if (!Array.isArray(embeds)) {
      throw new Error("[Webhook] Embeds must be an array");
    }

    if (embeds.length === 0) {
      throw new Error("[Webhook] At least one embed is required");
    }

    if (embeds.length > 10) {
      throw new Error("[Webhook] Maximum 10 embeds per message");
    }

    return this.sendMessage(webhookType, { embeds }, options);
  }

  /**
   * Send a simple text message
   * @param {string} content - Message content
   * @param {string} webhookType - Webhook type to use
   * @param {object} options - Additional options
   */
  async sendText(content, webhookType = 'general', options = {}) {
    if (!content || typeof content !== 'string') {
      throw new Error("[Webhook] Content must be a non-empty string");
    }

    if (content.length > 2000) {
      throw new Error("[Webhook] Message content exceeds 2000 character limit");
    }

    return this.sendMessage(webhookType, { content }, options);
  }

  /**
   * Send a rich embed with common fields
   * @param {object} config - Configuration object
   */
  async sendRichEmbed(config) {
    if (!config) {
      throw new Error("[Webhook] Configuration object is required");
    }

    const {
      title,
      description,
      color = 0x3498DB,
      fields = [],
      footerText,
      footerIcon,
      authorName,
      authorIcon,
      thumbnailUrl,
      imageUrl,
      webhookType = 'general',
      immediate = false
    } = config;

    const embed = {
      title: title || "Event",
      description: description || "",
      color: color,
      fields: fields,
      timestamp: new Date().toISOString()
    };

    // Add footer if provided
    if (footerText) {
      embed.footer = {
        text: footerText,
        icon_url: footerIcon
      };
    }

    // Add author if provided
    if (authorName) {
      embed.author = {
        name: authorName,
        icon_url: authorIcon
      };
    }

    // Add images if provided
    if (thumbnailUrl) {
      embed.thumbnail = { url: thumbnailUrl };
    }

    if (imageUrl) {
      embed.image = { url: imageUrl };
    }

    return this.sendEmbed(embed, webhookType, { immediate });
  }

  /**
   * Get webhook health report
   */
  getHealthReport() {
    if (!this.isReady()) {
      throw new Error("[Webhook] Addon not ready");
    }

    return this.webhookManager.getHealthReport();
  }

  /**
   * Get list of all configured webhooks
   */
  getWebhookList() {
    if (!this.isReady()) {
      throw new Error("[Webhook] Addon not ready");
    }

    return Object.entries(this.WHConfig.webhooks).map(([name, url]) => ({
      name,
      url: url.substring(0, 50) + '...',
      valid: this.webhookManager.validateUrl(url)
    }));
  }

  /**
   * Register a listener for before-send events
   * @param {function} callback - Callback function
   */
  onBeforeSend(callback) {
    if (typeof callback !== 'function') {
      throw new Error("[Webhook] Callback must be a function");
    }
    this.events.onBeforeSend.add(callback);
    return () => this.events.onBeforeSend.delete(callback); // Return unsubscribe function
  }

  /**
   * Register a listener for after-send events
   * @param {function} callback - Callback function
   */
  onAfterSend(callback) {
    if (typeof callback !== 'function') {
      throw new Error("[Webhook] Callback must be a function");
    }
    this.events.onAfterSend.add(callback);
    return () => this.events.onAfterSend.delete(callback);
  }

  /**
   * Register a listener for error events
   * @param {function} callback - Callback function
   */
  onError(callback) {
    if (typeof callback !== 'function') {
      throw new Error("[Webhook] Callback must be a function");
    }
    this.events.onError.add(callback);
    return () => this.events.onError.delete(callback);
  }

  /**
   * Fire an event and call all registered listeners
   * @private
   */
  async _fireEvent(eventName, data) {
    if (!this.events[eventName]) return;

    for (const callback of this.events[eventName]) {
      try {
        await callback(data);
      } catch (error) {
        console.error(`[Webhook] Error in ${eventName} callback:`, error);
      }
    }
  }

  // ============================================
  // v4.1.0 EXPANSION API METHODS
  // ============================================

  /**
   * Get player statistics (v4.1.0)
   */
  async getPlayerStats(playerName) {
    if (!globalThis.webhookExpansion?.playerStats) {
      throw new Error("[Webhook] Player stats not available");
    }

    const { world } = await import("@minecraft/server");
    const players = world.getAllPlayers();
    const player = players.find(p => p.name === playerName);

    if (!player) {
      throw new Error(`[Webhook] Player ${playerName} not found`);
    }

    return globalThis.webhookExpansion.playerStats.getPlayerStats(player);
  }

  /**
   * Get server analytics report (v4.1.0)
   */
  async getServerReport(type = "daily") {
    if (!globalThis.webhookExpansion?.serverAnalytics) {
      throw new Error("[Webhook] Server analytics not available");
    }

    return globalThis.webhookExpansion.serverAnalytics.createDiscordReport(type);
  }

  /**
   * Query archived events (v4.1.0)
   */
  async queryEvents(criteria = {}) {
    if (!globalThis.webhookExpansion?.eventArchive) {
      throw new Error("[Webhook] Event archive not available");
    }

    return globalThis.webhookExpansion.eventArchive.queryEvents(criteria);
  }

  /**
   * Get top players by metric (v4.1.0)
   */
  async getTopPlayers(metric = "playtime", limit = 10) {
    if (!globalThis.webhookExpansion?.playerStats) {
      throw new Error("[Webhook] Player stats not available");
    }

    return globalThis.webhookExpansion.playerStats.getTopPlayers(metric, limit);
  }

  /**
   * Export all statistics (v4.1.0)
   */
  async exportStatistics() {
    if (!globalThis.webhookExpansion?.playerStats) {
      throw new Error("[Webhook] Player stats not available");
    }

    return globalThis.webhookExpansion.playerStats.exportStats();
  }

  /**
   * Get server uptime (v4.1.0)
   */
  async getServerUptime() {
    if (!globalThis.webhookExpansion?.serverAnalytics) {
      throw new Error("[Webhook] Server analytics not available");
    }

    return globalThis.webhookExpansion.serverAnalytics.getUptime();
  }

  /**
   * Get peak player times (v4.1.0)
   */
  async getPeakTimes(daysBack = 7) {
    if (!globalThis.webhookExpansion?.serverAnalytics) {
      throw new Error("[Webhook] Server analytics not available");
    }

    return globalThis.webhookExpansion.serverAnalytics.getPeakTimes(daysBack);
  }

  /**
   * Search events by content (v4.1.0)
   */
  async searchEvents(searchTerm) {
    if (!globalThis.webhookExpansion?.eventArchive) {
      throw new Error("[Webhook] Event archive not available");
    }

    return globalThis.webhookExpansion.eventArchive.searchEvents(searchTerm);
  }

  /**
   * Get server statistics summary (v4.1.0)
   */
  async getServerStats() {
    if (!globalThis.webhookExpansion?.playerStats) {
      throw new Error("[Webhook] Player stats not available");
    }

    return globalThis.webhookExpansion.playerStats.getServerStats();
  }

}

/**
 * Helper function to create a formatted player event embed
 */
export function createPlayerEventEmbed(playerName, playerId, eventType, additionalFields = []) {
  const colorMap = {
    join: 0x2ECC71,      // Green
    leave: 0xE74C3C,     // Red
    death: 0x8B0000,     // Dark Red
    achievement: 0xFFD700 // Gold
  };

  const titleMap = {
    join: `✅ ${playerName} joined`,
    leave: `❌ ${playerName} left`,
    death: `💀 ${playerName} died`,
    achievement: `🏆 ${playerName} unlocked`
  };

  const fields = [
    {
      name: "Player",
      value: playerName,
      inline: true
    },
    {
      name: "Player ID",
      value: playerId,
      inline: true
    },
    ...additionalFields
  ];

  return {
    title: titleMap[eventType] || `${eventType} - ${playerName}`,
    color: colorMap[eventType] || 0x3498DB,
    fields: fields,
    timestamp: new Date().toISOString()
  };
}

/**
 * Helper function to create a formatted chat message embed
 */
export function createChatEmbed(playerName, message, serverName = "Server") {
  return {
    title: `💬 Chat Message`,
    description: `${message}`,
    author: {
      name: playerName
    },
    color: 0x3498DB,
    footer: {
      text: serverName
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Helper function to create a formatted error embed
 */
export function createErrorEmbed(errorTitle, errorMessage, context = {}) {
  return {
    title: `⚠️ ${errorTitle}`,
    description: errorMessage,
    color: 0xE74C3C,
    fields: Object.entries(context).map(([key, value]) => ({
      name: key,
      value: String(value),
      inline: true
    })),
    timestamp: new Date().toISOString()
  };
}

/**
 * Helper function to create a formatted success embed
 */
export function createSuccessEmbed(title, description, fields = []) {
  return {
    title: `✅ ${title}`,
    description: description,
    color: 0x2ECC71,
    fields: fields,
    timestamp: new Date().toISOString()
  };
}

export default WebhookAddon;
