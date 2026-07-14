// webhook/events/player/joined.js - Player join handler
import { world } from "@minecraft/server";
import { eventManager } from "../../core/events.js";
import { WebhookAPI } from "../../api/index.js";
import { state, plugin } from "../../core/plugin.js";

// Handle both BedrockBridge and vanilla events
if (plugin.bridgeAvailable && plugin.bridge?.events?.playerJoinLog) {
  plugin.bridge.events.playerJoinLog.subscribe(handlePlayerJoin);
} else {
  world.afterEvents.playerJoin.subscribe((event) => {
    handlePlayerJoin({ 
      player: event.player,
      playerName: event.playerName 
    });
  });
}

async function handlePlayerJoin(event) {
  const player = event.player;
  
  // Emit pre-join event
  const shouldContinue = await eventManager.emit("webhook:beforePlayerJoin", {
    player: player,
    event: event
  });
  
  if (!shouldContinue) return;
  
  // Check if join/leave webhooks are enabled
  if (!WebhookAPI.config.isEnabled("players.joinLeave")) return;
  
  try {
    // Use player name as unique identifier since Bedrock doesn't have player.id
    const playerIdentifier = player.name;
    const config = WebhookAPI.config.get();
    const helpers = WebhookAPI.config.getHelpers();
    
    // Initialize session
    state.playerSessions.set(playerIdentifier, {
      joinTime: Date.now(),
      lastActivity: Date.now(),
      dimension: player.dimension.id,
      location: player.location
    });
    
    // Get/Create player data
    const playerData = WebhookAPI.database.getPlayerData(playerIdentifier) || {
      name: player.name,
      firstJoin: Date.now(),
      lastJoin: Date.now(),
      totalJoins: 0,
      totalPlaytime: 0,
      achievements: []
    };
    
    // Update player data
    playerData.name = player.name;
    playerData.lastJoin = Date.now();
    playerData.totalJoins++;
    
    const isFirstJoin = playerData.totalJoins === 1;
    WebhookAPI.database.setPlayerData(playerIdentifier, playerData);
    
    // Build embed
    const embed = WebhookAPI.webhook.createEmbed()
      .setAuthor(
        isFirstJoin && helpers.isEnabled("players.firstJoin")
          ? helpers.formatMessage(config.messages.player.firstJoin, { player: player.name })
          : helpers.formatMessage(config.messages.player.join, { player: player.name }),
        WebhookAPI.utils.getPlayerAvatar(player.name)
      )
      .setColor(helpers.getColor("join"))
      .addField("Players Online", world.getAllPlayers().length.toString(), true);
    
    if (isFirstJoin) {
      embed.setDescription("Welcome to the server! 🎉");
      
      // Emit first join event
      eventManager.emit("webhook:firstJoin", {
        player: player,
        playerData: playerData
      });
    } else {
      embed.addField("Total Joins", playerData.totalJoins.toString(), true);
      
      // Add last seen info
      if (playerData.lastJoin) {
        const timeSinceLastJoin = Date.now() - playerData.lastJoin;
        if (timeSinceLastJoin > 60000) { // Only show if more than 1 minute
          embed.addField("Last Seen", WebhookAPI.utils.formatDuration(timeSinceLastJoin) + " ago", true);
        }
      }
    }
    
    // Apply hooks to modify embed
    const finalEmbed = await eventManager.applyHooks("playerJoin:embed", embed.build());
    
    // Send webhook
    WebhookAPI.webhook.send("playerEvents", { embeds: [finalEmbed] });
    
    // Update global stats
    WebhookAPI.database.incrementGlobalStat("totalJoins");
    
    // Show welcome message in-game
    if (helpers.isEnabled("players.welcomeMessage")) {
      const welcomeMessage = isFirstJoin 
        ? config.messages.player.firstJoinChat 
        : config.messages.player.joinChat;
        
      if (welcomeMessage) {
        world.sendMessage(helpers.formatMessage(welcomeMessage, { 
          player: player.name,
          online: world.getAllPlayers().length 
        }));
      }
    }
    
    // Log player info for debugging
    if (config.advanced.debug.enabled) {
      console.log(`[Webhook] Player joined: ${player.name}`);
      console.log(`[Webhook] Player properties:`, Object.getOwnPropertyNames(player));
    }
    
    // Emit post-join event
    eventManager.emit("webhook:afterPlayerJoin", {
      player: player,
      playerData: playerData,
      isFirstJoin: isFirstJoin
    });
    
  } catch (error) {
    WebhookAPI.utils.logError("Player join error", error);
  }
}

// Listen for custom join notifications
eventManager.on("webhook:announceJoin", async (data) => {
  const { playerName, message, color } = data;
  
  const embed = WebhookAPI.webhook.createEmbed()
    .setAuthor(
      message || `${playerName} joined the server`,
      WebhookAPI.utils.getPlayerAvatar(playerName)
    )
    .setColor(color || WebhookAPI.config.getHelpers().getColor("join"))
    .addField("Players Online", world.getAllPlayers().length.toString(), true)
    .build();
  
  WebhookAPI.webhook.send("playerEvents", { embeds: [embed] });
});

// Track join streaks
eventManager.on("webhook:afterPlayerJoin", async (data) => {
  const { player, playerData } = data;
  
  // Check for daily join streak
  const lastJoin = new Date(playerData.lastJoin);
  const today = new Date();
  
  if (lastJoin.toDateString() === today.toDateString()) {
    // Same day, maintain streak
    return;
  }
  
  const daysSinceLastJoin = Math.floor((today - lastJoin) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastJoin === 1) {
    // Consecutive day - increase streak
    playerData.joinStreak = (playerData.joinStreak || 0) + 1;
    
    // Milestone notifications
    const milestones = [7, 30, 100, 365];
    if (milestones.includes(playerData.joinStreak)) {
      const embed = WebhookAPI.webhook.createEmbed()
        .setTitle("🔥 Join Streak Milestone!")
        .setDescription(`**${player.name}** has joined ${playerData.joinStreak} days in a row!`)
        .setColor(0xFF6B6B)
        .setThumbnail(WebhookAPI.utils.getPlayerAvatar(player.name))
        .build();
      
      WebhookAPI.webhook.send("achievements", { embeds: [embed] });
    }
  } else if (daysSinceLastJoin > 1) {
    // Streak broken
    if (playerData.joinStreak && playerData.joinStreak > 3) {
      player.sendMessage(`§cYour ${playerData.joinStreak} day join streak has been broken!`);
    }
    playerData.joinStreak = 1;
  }
  
  WebhookAPI.database.setPlayerData(player.name, playerData);
});