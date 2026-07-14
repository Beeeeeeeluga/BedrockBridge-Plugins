// webhook/events/chat.js - Chat message handler
import { world } from "@minecraft/server";
import { eventManager } from "../core/events.js";
import { WebhookAPI } from "../api/index.js";
import { state } from "../core/plugin.js";
import { isSpamming } from "../services/spam.js";
import { filterMessage } from "../services/filter.js";

// Register with Minecraft
world.afterEvents.chatSend.subscribe(async (event) => {
  const { sender, message } = event;
  
  // Emit pre-chat event (can be cancelled)
  const shouldContinue = await eventManager.emit("webhook:beforeChat", {
    player: sender,
    message: message,
    event: event
  });
  
  if (!shouldContinue || event.cancelled) return;
  
  // Check if chat webhooks are enabled
  if (!WebhookAPI.config.isEnabled("chat.enabled")) return;
  
  const config = WebhookAPI.config.get();
  const helpers = WebhookAPI.config.getHelpers();
  
  // Spam check
  if (helpers.isEnabled("chat.antiSpam") && !helpers.hasPermission(sender, "bypassAntiSpam")) {
    if (isSpamming(sender)) {
      event.cancel = true;
      sender.sendMessage("§cPlease slow down! Anti-spam protection activated.");
      
      // Emit spam event
      eventManager.emit("webhook:spam", {
        player: sender,
        message: message,
        action: "blocked"
      });
      
      return;
    }
  }
  
  // Filter check
  if (config.filters.chat.enabled) {
    const filtered = filterMessage(message);
    
    if (filtered.blocked) {
      event.cancel = true;
      sender.sendMessage("§cYour message was blocked by the chat filter.");
      
      // Emit filter event
      eventManager.emit("webhook:messageFiltered", {
        player: sender,
        message: message,
        reason: "blocked"
      });
      
      return;
    }
    
    if (filtered.warning) {
      sender.sendMessage("§eWarning: Your message contains inappropriate content.");
      
      // Emit warning event
      eventManager.emit("webhook:messageFiltered", {
        player: sender,
        message: message,
        reason: "warning"
      });
    }
  }
  
  // Build prefix based on tags
  let prefix = "";
  if (helpers.isEnabled("chat.showPlayerTags")) {
    const playerTags = sender.getTags();
    if (playerTags.includes(config.permissions.tags.admin)) prefix = "[Admin] ";
    else if (playerTags.includes(config.permissions.tags.moderator)) prefix = "[Mod] ";
    else if (playerTags.includes(config.permissions.tags.vip)) prefix = "[VIP] ";
  }
  
  // Apply hooks to modify message data
  const webhookData = await eventManager.applyHooks("chat:webhookData", {
    content: `${prefix}${sender.name}: ${message}`,
    username: sender.name,
    avatar_url: WebhookAPI.utils.getPlayerAvatar(sender.name)
  });
  
  // Send to Discord
  if (helpers.isEnabled("chat.logToDiscord")) {
    WebhookAPI.webhook.send("chat", webhookData);
  }
  
  // Update stats
  WebhookAPI.database.incrementStat(sender.id, "messages");
  
  // Update activity for AFK detection
  const session = state.playerSessions.get(sender.id);
  if (session) session.lastActivity = Date.now();
  
  // Emit post-chat event
  eventManager.emit("webhook:afterChat", {
    player: sender,
    message: message,
    prefix: prefix,
    webhookData: webhookData
  });
});

// Listen for custom chat messages (e.g., from Discord)
eventManager.on("webhook:sendChat", async (data) => {
  const { username, message, avatarUrl } = data;
  
  const webhookData = {
    content: message.content || `${username}: ${message}`,
    username: username,
    avatar_url: avatarUrl || WebhookAPI.utils.getPlayerAvatar(username)
  };
  
  // Add embed if provided
  if (message.embed) {
    webhookData.embeds = [{
      title: message.embed.title || null,
      description: message.embed.description || null,
      color: message.embed.color || null,
      footer: message.embed.footer || null,
      timestamp: message.embed.timestamp ? new Date().toISOString() : null
    }];
  }
  
  WebhookAPI.webhook.send("chat", webhookData);
});

// Command handler for chat commands
eventManager.on("webhook:command", async (data) => {
  const { player, command, args } = data;
  
  // !say command - send message to Discord
  if (command === "say" && args.length > 0) {
    if (!WebhookAPI.config.getHelpers().hasPermission(player, "webhook.say")) {
      player.sendMessage("§cYou don't have permission to use this command.");
      return;
    }
    
    const message = args.join(" ");
    
    eventManager.emit("webhook:sendChat", {
      username: player.name,
      message: message,
      avatarUrl: WebhookAPI.utils.getPlayerAvatar(player.name)
    });
    
    player.sendMessage("§aMessage sent to Discord!");
  }
});

// Export for API
export const chatEvents = {
  sendMessage: (username, message, avatarUrl) => {
    eventManager.emit("webhook:sendChat", {
      username,
      message,
      avatarUrl
    });
  },
  
  registerChatFilter: (filterFunc) => {
    eventManager.registerHook("chat:webhookData", filterFunc);
  }
};