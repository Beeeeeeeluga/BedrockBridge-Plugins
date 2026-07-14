// webhook/core/webhook.js - Webhook Communication System
import { system } from "@minecraft/server";
import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net";
import { getConfig, getHelpers } from '../config.js';
import { plugin } from './plugin.js';
import { logError } from '../utils/logger.js';

// Message queue for batching
const messageQueue = [];
let isProcessingQueue = false;

/**
 * Send a webhook message
 * @param {string} type - Webhook type (chat, playerEvents, etc.)
 * @param {object} data - Webhook data
 * @param {boolean} immediate - Send immediately without queuing
 */
export async function sendWebhook(type, data, immediate = false) {
  const config = getConfig();
  const helpers = getHelpers();
  const webhookUrl = helpers.getWebhook(type);
  
  if (!webhookUrl) {
    if (config.advanced.debug.enabled) {
      console.warn(`[Webhook] No webhook URL for type: ${type}`);
    }
    return;
  }
  
  // Test mode - don't send real webhooks
  if (config.advanced.debug.testMode) {
    console.log(`[Webhook] TEST MODE - Would send to ${type}:`, JSON.stringify(data, null, 2));
    return;
  }
  
  // Queue or send immediately
  if (immediate) {
    await sendWebhookImmediate(webhookUrl, data);
  } else {
    messageQueue.push({
      url: webhookUrl,
      data: data,
      timestamp: Date.now(),
      type: type
    });
    
    // Check queue limit
    if (messageQueue.length > config.advanced.performance.messageQueueSize) {
      messageQueue.shift();
    }
  }
}

/**
 * Send webhook immediately
 * @param {string} webhookUrl - Discord webhook URL
 * @param {object} data - Webhook data
 */
async function sendWebhookImmediate(webhookUrl, data) {
  const config = getConfig();
  
  try {
    // Try BridgeDirect first if available
    if (plugin.bridgeAvailable && plugin.bridge?.bridgeDirect?.ready) {
      const bridgeDirect = plugin.bridge.bridgeDirect;
      
      if (data.embeds && data.embeds[0]) {
        bridgeDirect.sendEmbed(
          data.embeds[0],
          data.username || config.appearance.serverName,
          data.avatar_url || config.appearance.serverIcon
        );
      } else if (data.content) {
        bridgeDirect.sendMessage(
          data.content,
          data.username || config.appearance.serverName,
          data.avatar_url || config.appearance.serverIcon
        );
      }
      return;
    }
    
    // Fallback to HTTP
    const request = new HttpRequest(webhookUrl);
    request.method = HttpRequestMethod.Post;
    request.headers = [
      new HttpHeader("Content-Type", "application/json")
    ];
    request.body = JSON.stringify(data);
    
    const response = await http.request(request);
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
    
  } catch (error) {
    logError("Webhook send failed", error);
  }
}

/**
 * Process queued messages
 */
export function processMessageQueue() {
  const config = getConfig();
  
  if (isProcessingQueue || messageQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  try {
    const batch = messageQueue.splice(0, config.advanced.performance.messageBatchSize);
    
    for (const message of batch) {
      // Skip old messages
      if (Date.now() - message.timestamp > 30000) continue;
      
      sendWebhookImmediate(message.url, message.data);
    }
  } catch (error) {
    logError("Queue processing error", error);
  } finally {
    isProcessingQueue = false;
  }
}

/**
 * Start the queue processor
 */
export function startQueueProcessor() {
  const config = getConfig();
  
  system.runInterval(() => {
    processMessageQueue();
  }, Math.floor(config.advanced.performance.messageQueueDelay / 50));
}

/**
 * Create an embed builder
 * @param {string} title - Embed title
 * @returns {object} Embed builder
 */
export function createEmbed(title) {
  const config = getConfig();
  
  return {
    title: title,
    color: null,
    description: null,
    fields: [],
    author: null,
    footer: null,
    timestamp: new Date().toISOString(),
    thumbnail: null,
    image: null,
    
    setColor(color) {
      this.color = typeof color === 'string' 
        ? parseInt(color.replace('#', ''), 16) 
        : color;
      return this;
    },
    
    setDescription(desc) {
      this.description = desc;
      return this;
    },
    
    addField(name, value, inline = false) {
      this.fields.push({ name, value: value.toString(), inline });
      return this;
    },
    
    setAuthor(name, iconUrl = null) {
      this.author = { name };
      if (iconUrl) this.author.icon_url = iconUrl;
      return this;
    },
    
    setFooter(text, iconUrl = null) {
      this.footer = { text };
      if (iconUrl) this.footer.icon_url = iconUrl;
      return this;
    },
    
    setThumbnail(url) {
      this.thumbnail = { url };
      return this;
    },
    
    setImage(url) {
      this.image = { url };
      return this;
    },
    
    build() {
      const embed = {
        title: this.title,
        timestamp: this.timestamp
      };
      
      if (this.color !== null) embed.color = this.color;
      if (this.description) embed.description = this.description;
      if (this.fields.length > 0) embed.fields = this.fields;
      if (this.author) embed.author = this.author;
      if (this.footer) embed.footer = this.footer;
      if (this.thumbnail) embed.thumbnail = this.thumbnail;
      if (this.image) embed.image = this.image;
      
      return embed;
    }
  };
}

/**
 * Get queue status
 */
export function getQueueStatus() {
  return {
    size: messageQueue.length,
    processing: isProcessingQueue,
    oldest: messageQueue[0]?.timestamp 
      ? new Date(messageQueue[0].timestamp).toISOString() 
      : null
  };
}