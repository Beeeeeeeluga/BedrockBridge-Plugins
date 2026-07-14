/**
 * ============================================
 * EXAMPLE: Player Tracker Plugin
 * ============================================
 *
 * This example shows how to use the Webhook Addon
 * to track player events and send them to Discord
 *
 * USAGE:
 * 1. Copy this file to your bridgePlugins folder
 * 2. Import it in your plugin manager
 * 3. Watch Discord for player event messages
 */

import { world } from "@minecraft/server";
import { bridge } from "esploratori/bridgeAPI";
import {
  webhookAddon,
  createPlayerEventEmbed,
  createSuccessEmbed
} from "../webhook-addon.js";

let webhookReady = false;

// Wait for BedrockBridge to initialize
bridge.events.bridgeInitialize.subscribe((e) => {
  // Register that we'll use webhook addon
  e.registerAddition("webhook_addon");
  webhookReady = true;
  console.info("[PlayerTracker] Webhook addon initialized");
});

// Track player joins
world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn || !webhookReady) return;

  const player = event.player;
  const onlineCount = world.getAllPlayers().length;

  try {
    // Create a formatted embed for the join event
    const embed = createPlayerEventEmbed(
      player.name,
      player.id,
      "join",
      [
        {
          name: "Players Online",
          value: onlineCount.toString(),
          inline: true
        },
        {
          name: "Dimension",
          value: player.dimension.id,
          inline: true
        }
      ]
    );

    // Send to Discord
    webhookAddon.sendEmbed(embed, "playerEvents")
      .catch(err => console.error("[PlayerTracker] Send error:", err));

  } catch (error) {
    console.error("[PlayerTracker] Error processing join:", error);
  }
});

// Track player leaves
world.afterEvents.playerLeave.subscribe((event) => {
  if (!webhookReady) return;

  try {
    const onlineCount = world.getAllPlayers().length;

    // Create a formatted embed for the leave event
    const embed = createPlayerEventEmbed(
      event.playerName,
      event.playerId,
      "leave",
      [
        {
          name: "Players Online",
          value: onlineCount.toString(),
          inline: true
        }
      ]
    );

    // Send to Discord
    webhookAddon.sendEmbed(embed, "playerEvents")
      .catch(err => console.error("[PlayerTracker] Send error:", err));

  } catch (error) {
    console.error("[PlayerTracker] Error processing leave:", error);
  }
});

// Track deaths
world.afterEvents.entityDie.subscribe((event) => {
  if (!webhookReady || !(event.deadEntity instanceof world.Player)) return;

  try {
    const player = event.deadEntity;
    const location = player.location;

    const embed = createPlayerEventEmbed(
      player.name,
      player.id,
      "death",
      [
        {
          name: "Location",
          value: `${Math.floor(location.x)}, ${Math.floor(location.y)}, ${Math.floor(location.z)}`,
          inline: true
        },
        {
          name: "Dimension",
          value: player.dimension.id,
          inline: true
        }
      ]
    );

    // Send death to Discord (immediately - it's important!)
    webhookAddon.sendEmbed(embed, "deaths", { immediate: true })
      .catch(err => console.error("[PlayerTracker] Send error:", err));

  } catch (error) {
    console.error("[PlayerTracker] Error processing death:", error);
  }
});

// Listen for webhook errors and log them
webhookAddon.onError(({ webhookType, error }) => {
  console.error(`[PlayerTracker] Webhook error (${webhookType}):`, error.message);
});

// Send startup message
setTimeout(() => {
  if (webhookReady) {
    const embed = createSuccessEmbed(
      "Server Started",
      "Player Tracker is now monitoring player events",
      [
        { name: "Feature", value: "Player tracking", inline: true },
        { name: "Status", value: "Active", inline: true }
      ]
    );

    webhookAddon.sendEmbed(embed, "serverEvents")
      .catch(err => console.error("[PlayerTracker] Startup message error:", err));
  }
}, 2000);

console.info("[PlayerTracker] Plugin loaded! Webhook-enabled player tracking ready.");
