/**
 * EnhancedTrophyTP - Advanced Admin Teleport Menu (ULTIMATE v4.0.0)
 * @version 4.0.0
 * @compatible BedrockBridge v1.0+, Minecraft Bedrock 1.21.93+
 *
 * COMPLETE REWRITE - FULLY COMPATIBLE WITH BEDROCKBRIDGE API
 *
 * Features:
 * - Full BedrockBridge command registration
 * - Admin command with esploratori:admin tag
 * - Tag-based access control
 * - Advanced teleport menu system
 * - Multi-dimension support
 * - Player targeting with permission checks
 * - Comprehensive error handling
 * - Cooldown system for rate limiting
 * - Teleport history logging
 * - Database persistence
 * - ScriptEvent support
 *
 * by TrophySystem
 */

import { system, world, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { bridge, database } from '../addons';

// ===== CONFIGURATION =====
const CONFIG = {
  // Commands - MUST match BedrockBridge naming convention
  commands: {
    main: "trophyadmintp",
    menuAlias: "tatp",
  },

  // Permission Tags
  adminTags: ["esploratori:admin", "admin", "staff", "mod"],

  // UI Configuration
  ui: {
    title: "§9Admin Teleport Menu",
    menuBody: "Select a teleport action:",
    colors: {
      success: "§a",
      error: "§c",
      info: "§e",
      highlight: "§b",
      menu: "§9"
    },
    prefix: "§9[TrophyTP]§r",
    icons: {
      teleportToPlayer: "textures/ui/icon_multiplayer.png",
      teleportToMe: "textures/ui/icon_import.png",
      teleportPlayerToPlayer: "textures/ui/icon_world.png",
      back: "textures/ui/arrow_left.png",
      player: "textures/ui/icon_multiplayer.png",
      myself: "textures/ui/permissions_member_star.png"
    }
  },

  // Advanced Settings
  advanced: {
    menuOpenAttempts: 15,
    menuOpenDelay: 20,
    teleportYOffset: 0.2,
    notifyTargets: true,
    dimensionChangeAllowed: true,
    enableCooldown: true,
    cooldownDuration: 2000,
    enableHistory: true,
    maxHistorySize: 50,
    debug: false
  },

  // Database Settings
  database: {
    enabled: true,
    tableName: "admintp_history"
  },

  // ScriptEvent Settings
  scriptEvent: {
    name: "trophy:open_tp_menu",
    namespace: "trophy",
    enabled: true
  }
};

// ===== STATE MANAGEMENT =====
const menuPending = new Map();        // playerName -> {player, attempts, startTime}
const playerCooldowns = new Map();    // playerId -> timestamp
const teleportHistory = new Map();    // playerId -> []
let adminDatabase = null;             // Database reference

// ===== DATABASE INITIALIZATION =====
if (CONFIG.database.enabled && database) {
  try {
    adminDatabase = database.makeTable(CONFIG.database.tableName);
    console.warn("§e[TrophyTP] Database initialized");
  } catch (e) {
    console.warn("§c[TrophyTP] Database initialization failed: " + e.message);
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Check if player has admin permission
 * @param {Player} player
 * @returns {boolean}
 */
function hasAdminPermission(player) {
  if (!player || !player.isValid) return false;

  // Check operator status
  if (typeof player.isOp === 'function') {
    try {
      if (player.isOp()) return true;
    } catch (e) {}
  }

  // Check tags
  if (typeof player.hasTag === 'function') {
    for (const tag of CONFIG.adminTags) {
      try {
        if (player.hasTag(tag)) return true;
      } catch (e) {}
    }
  }

  return false;
}

/**
 * Send formatted message to player
 * @param {Player} player
 * @param {string} message
 * @param {string} type - 'success', 'error', 'info', 'highlight'
 */
function sendMessage(player, message, type = "info") {
  if (!player || !player.isValid) return;

  const color = CONFIG.ui.colors[type] || CONFIG.ui.colors.info;
  const formatted = `${CONFIG.ui.prefix} ${color}${message}`;

  try {
    player.sendMessage(formatted);
  } catch (e) {
    console.warn(`§c[TrophyTP] Failed to send message: ${e.message}`);
  }
}

/**
 * Get all other players (excluding specified player)
 * @param {Player} excludePlayer
 * @returns {Player[]}
 */
function getOtherPlayers(excludePlayer) {
  try {
    return world.getPlayers().filter(p =>
      p && p.isValid && p.id !== excludePlayer?.id
    );
  } catch (e) {
    console.warn(`§c[TrophyTP] Error getting players: ${e.message}`);
    return [];
  }
}

/**
 * Get dimension display string
 * @param {string} dimensionId
 * @returns {string}
 */
function getDimensionDisplay(dimensionId) {
  if (!dimensionId) return "";

  const dimColors = {
    "minecraft:overworld": "§a",
    "minecraft:nether": "§c",
    "minecraft:the_end": "§5"
  };

  const dimNames = {
    "minecraft:overworld": "Overworld",
    "minecraft:nether": "Nether",
    "minecraft:the_end": "End"
  };

  const color = dimColors[dimensionId] || "§7";
  const name = dimNames[dimensionId] || "Unknown";

  return `§7[${color}${name}§7]`;
}

/**
 * Check if player is on cooldown
 * @param {string} playerId
 * @returns {boolean}
 */
function isOnCooldown(playerId) {
  if (!CONFIG.advanced.enableCooldown) return false;

  const cooldownTime = playerCooldowns.get(playerId);
  if (!cooldownTime) return false;

  const elapsed = Date.now() - cooldownTime;
  if (elapsed >= CONFIG.advanced.cooldownDuration) {
    playerCooldowns.delete(playerId);
    return false;
  }

  return true;
}

/**
 * Set cooldown for player
 * @param {string} playerId
 */
function setCooldown(playerId) {
  if (CONFIG.advanced.enableCooldown) {
    playerCooldowns.set(playerId, Date.now());
  }
}

/**
 * Add teleport to history
 * @param {Player} fromPlayer
 * @param {Player} toPlayer
 * @param {Player} executor
 */
function addToHistory(fromPlayer, toPlayer, executor) {
  if (!CONFIG.advanced.enableHistory) return;

  try {
    const historyEntry = {
      from: fromPlayer.name,
      to: toPlayer.name,
      executor: executor.name,
      timestamp: new Date().toISOString(),
      fromDim: fromPlayer.dimension?.id,
      toDim: toPlayer.dimension?.id
    };

    // Store in memory
    const history = teleportHistory.get(fromPlayer.id) || [];
    history.push(historyEntry);

    if (history.length > CONFIG.advanced.maxHistorySize) {
      history.shift();
    }

    teleportHistory.set(fromPlayer.id, history);

    // Store in database
    if (adminDatabase) {
      try {
        adminDatabase.set(
          `${fromPlayer.id}_${Date.now()}`,
          historyEntry
        );
      } catch (dbError) {
        if (CONFIG.advanced.debug) {
          console.warn(`§c[TrophyTP] Database error: ${dbError.message}`);
        }
      }
    }
  } catch (e) {
    console.warn(`§c[TrophyTP] Error adding to history: ${e.message}`);
  }
}

// ===== TELEPORT FUNCTIONS =====

/**
 * Teleport player to destination
 * @param {Player} playerToMove
 * @param {Player} destination
 * @param {Player} messagePlayer
 * @returns {boolean}
 */
function teleportPlayer(playerToMove, destination, messagePlayer) {
  try {
    if (!playerToMove || !playerToMove.isValid || !destination || !destination.isValid) {
      throw new Error("Invalid player reference");
    }

    // Check cooldown
    if (isOnCooldown(messagePlayer?.id)) {
      throw new Error("Cooldown active. Please wait before next teleport.");
    }

    const destLocation = destination.location;
    const destDimension = destination.dimension;

    if (!destLocation || !destDimension) {
      throw new Error("Cannot get destination location");
    }

    // Check cross-dimension teleport
    const crossDimension = playerToMove.dimension?.id !== destDimension.id;
    if (crossDimension && !CONFIG.advanced.dimensionChangeAllowed) {
      throw new Error("Cross-dimension teleport not allowed");
    }

    // Perform teleport
    const teleportLocation = {
      x: destLocation.x,
      y: destLocation.y + CONFIG.advanced.teleportYOffset,
      z: destLocation.z
    };

    const teleportOptions = {
      dimension: destDimension,
      rotation: destination.getRotation ? destination.getRotation() : undefined,
      keepVelocity: false
    };

    system.run(() => {
      playerToMove.teleport(teleportLocation, teleportOptions);
    });

    // Add to history and set cooldown
    if (messagePlayer) {
      addToHistory(playerToMove, destination, messagePlayer);
      setCooldown(messagePlayer.id);
    }

    if (CONFIG.advanced.debug) {
      console.warn(`§a[TrophyTP] Teleported ${playerToMove.name} to ${destination.name}`);
    }

    return true;

  } catch (error) {
    if (messagePlayer && messagePlayer.isValid) {
      sendMessage(messagePlayer, `Teleport failed: ${error.message}`, "error");
    }
    console.warn(`§c[TrophyTP] Teleport error: ${error.message}`);
    return false;
  }
}

// ===== MENU FUNCTIONS =====

/**
 * Try to open menu with delay (handles chat being open)
 * @param {Player} player
 */
function tryOpenMenuWithDelay(player) {
  if (!player || !player.isValid) return;

  // Check if already pending
  if (menuPending.has(player.name)) {
    sendMessage(player, "Menu is already trying to open. Please close your chat.", "info");
    return;
  }

  sendMessage(player, "Teleport menu will open in a few seconds...", "info");
  sendMessage(player, "Please close your chat now.", "highlight");

  // Mark as pending
  menuPending.set(player.name, {
    player: player,
    attempts: 0,
    startTime: Date.now()
  });

  const maxAttempts = CONFIG.advanced.menuOpenAttempts;

  const tryOpen = system.runInterval(() => {
    const pendingData = menuPending.get(player.name);

    // Stop if no longer pending
    if (!pendingData || !player.isValid) {
      menuPending.delete(player.name);
      system.clearRun(tryOpen);
      return;
    }

    // Check max attempts
    if (pendingData.attempts++ >= maxAttempts) {
      menuPending.delete(player.name);
      sendMessage(player, "Could not open menu. Please try again.", "error");
      system.clearRun(tryOpen);
      return;
    }

    // Try to open the menu
    try {
      openTeleportMenu(player);
      system.clearRun(tryOpen);
    } catch (error) {
      // Retry
    }
  }, CONFIG.advanced.menuOpenDelay);
}

/**
 * Open the main teleport menu
 * @param {Player} player
 */
function openTeleportMenu(player) {
  if (!player || !player.isValid) return;

  menuPending.delete(player.name);

  const form = new ActionFormData()
    .title(CONFIG.ui.title)
    .body(CONFIG.ui.menuBody)
    .button("Teleport to a player", CONFIG.ui.icons.teleportToPlayer)
    .button("Teleport player to me", CONFIG.ui.icons.teleportToMe)
    .button("Teleport player to player", CONFIG.ui.icons.teleportPlayerToPlayer);

  form.show(player).then(response => {
    if (response.canceled || response.selection === undefined) {
      return;
    }

    switch (response.selection) {
      case 0:
        system.runTimeout(() => showTeleportToPlayer(player), 5);
        break;
      case 1:
        system.runTimeout(() => showTeleportToMe(player), 5);
        break;
      case 2:
        system.runTimeout(() => showTeleportPlayerToPlayer(player), 5);
        break;
    }
  }).catch((error) => {
    if (CONFIG.advanced.debug) {
      console.warn(`§c[TrophyTP] Menu error: ${error.message}`);
    }
  });
}

/**
 * Show teleport to player menu
 * @param {Player} player
 */
function showTeleportToPlayer(player) {
  if (!player || !player.isValid) return;

  const players = getOtherPlayers(player);

  if (players.length === 0) {
    sendMessage(player, "No other players are online.", "error");
    system.runTimeout(() => openTeleportMenu(player), 5);
    return;
  }

  const form = new ActionFormData()
    .title(`${CONFIG.ui.colors.menu}Teleport To Player`)
    .body("Select a player to teleport to:");

  players.forEach(p => {
    const dimInfo = getDimensionDisplay(p.dimension?.id);
    form.button(`${p.name} ${dimInfo}`, CONFIG.ui.icons.player);
  });

  form.button("§cBack", CONFIG.ui.icons.back);

  form.show(player).then(response => {
    if (response.canceled || response.selection === undefined) return;

    // Back button
    if (response.selection === players.length) {
      system.runTimeout(() => openTeleportMenu(player), 5);
      return;
    }

    const target = players[response.selection];
    if (!target || !target.isValid) {
      sendMessage(player, "Target player is no longer valid.", "error");
      return;
    }

    if (teleportPlayer(player, target, player)) {
      sendMessage(player, `Teleported to ${target.name}`, "success");
    }
  }).catch(() => {});
}

/**
 * Show teleport player to me menu
 * @param {Player} player
 */
function showTeleportToMe(player) {
  if (!player || !player.isValid) return;

  const players = getOtherPlayers(player);

  if (players.length === 0) {
    sendMessage(player, "No other players are online.", "error");
    system.runTimeout(() => openTeleportMenu(player), 5);
    return;
  }

  const form = new ActionFormData()
    .title(`${CONFIG.ui.colors.menu}Teleport Player To Me`)
    .body("Select a player to teleport to you:");

  players.forEach(p => {
    const dimInfo = getDimensionDisplay(p.dimension?.id);
    form.button(`${p.name} ${dimInfo}`, CONFIG.ui.icons.player);
  });

  form.button("§cBack", CONFIG.ui.icons.back);

  form.show(player).then(response => {
    if (response.canceled || response.selection === undefined) return;

    // Back button
    if (response.selection === players.length) {
      system.runTimeout(() => openTeleportMenu(player), 5);
      return;
    }

    const target = players[response.selection];
    if (!target || !target.isValid) {
      sendMessage(player, "Target player is no longer valid.", "error");
      return;
    }

    if (teleportPlayer(target, player, player)) {
      sendMessage(player, `Teleported ${target.name} to you`, "success");
      if (CONFIG.advanced.notifyTargets) {
        sendMessage(target, `You were teleported to ${player.name}`, "info");
      }
    }
  }).catch(() => {});
}

/**
 * Show teleport player to player menu
 * @param {Player} player
 */
function showTeleportPlayerToPlayer(player) {
  if (!player || !player.isValid) return;

  const allPlayers = world.getPlayers().filter(p => p && p.isValid);

  if (allPlayers.length < 2) {
    sendMessage(player, "Not enough players are online.", "error");
    system.runTimeout(() => openTeleportMenu(player), 5);
    return;
  }

  const form = new ActionFormData()
    .title(`${CONFIG.ui.colors.menu}Select Player to Move`)
    .body("Choose which player to teleport:");

  allPlayers.forEach(p => {
    const dimInfo = getDimensionDisplay(p.dimension?.id);
    const icon = p.id === player.id ? CONFIG.ui.icons.myself : CONFIG.ui.icons.player;
    const prefix = p.id === player.id ? "§e" : "";
    form.button(`${prefix}${p.name} ${dimInfo}`, icon);
  });

  form.button("§cBack", CONFIG.ui.icons.back);

  form.show(player).then(response => {
    if (response.canceled || response.selection === undefined) return;

    // Back button
    if (response.selection === allPlayers.length) {
      system.runTimeout(() => openTeleportMenu(player), 5);
      return;
    }

    const sourcePlayer = allPlayers[response.selection];
    if (!sourcePlayer || !sourcePlayer.isValid) {
      sendMessage(player, "Selected player is no longer valid.", "error");
      return;
    }

    system.runTimeout(() => showDestinationPlayerMenu(player, sourcePlayer), 5);
  }).catch(() => {});
}

/**
 * Show destination player selection menu
 * @param {Player} player
 * @param {Player} sourcePlayer
 */
function showDestinationPlayerMenu(player, sourcePlayer) {
  if (!player || !player.isValid || !sourcePlayer || !sourcePlayer.isValid) return;

  const possibleDestinations = world.getPlayers().filter(p =>
    p && p.isValid && p.id !== sourcePlayer.id
  );

  if (possibleDestinations.length === 0) {
    sendMessage(player, "No valid destination players.", "error");
    system.runTimeout(() => showTeleportPlayerToPlayer(player), 5);
    return;
  }

  const form = new ActionFormData()
    .title(`${CONFIG.ui.colors.menu}Select Destination`)
    .body(`Choose where to teleport ${sourcePlayer.name}:`);

  possibleDestinations.forEach(p => {
    const dimInfo = getDimensionDisplay(p.dimension?.id);
    const icon = p.id === player.id ? CONFIG.ui.icons.myself : CONFIG.ui.icons.player;
    const prefix = p.id === player.id ? "§e" : "";
    form.button(`${prefix}${p.name} ${dimInfo}`, icon);
  });

  form.button("§cBack", CONFIG.ui.icons.back);

  form.show(player).then(response => {
    if (response.canceled || response.selection === undefined) return;

    // Back button
    if (response.selection === possibleDestinations.length) {
      system.runTimeout(() => showTeleportPlayerToPlayer(player), 5);
      return;
    }

    const destinationPlayer = possibleDestinations[response.selection];
    if (!destinationPlayer || !destinationPlayer.isValid) {
      sendMessage(player, "Destination player is no longer valid.", "error");
      return;
    }

    if (teleportPlayer(sourcePlayer, destinationPlayer, player)) {
      if (sourcePlayer.id === player.id) {
        sendMessage(player, `Teleported to ${destinationPlayer.name}`, "success");
      } else if (destinationPlayer.id === player.id) {
        sendMessage(player, `Teleported ${sourcePlayer.name} to you`, "success");
        if (CONFIG.advanced.notifyTargets) {
          sendMessage(sourcePlayer, `You were teleported to ${player.name}`, "info");
        }
      } else {
        sendMessage(player, `Teleported ${sourcePlayer.name} to ${destinationPlayer.name}`, "success");
        if (CONFIG.advanced.notifyTargets) {
          sendMessage(sourcePlayer, `You were teleported to ${destinationPlayer.name}`, "info");
        }
      }
    }
  }).catch(() => {});
}

// ===== SCRIPT EVENT HANDLER =====

if (CONFIG.scriptEvent.enabled) {
  try {
    system.afterEvents.scriptEventReceive.subscribe((event) => {
      if (event.id !== CONFIG.scriptEvent.name) return;

      let targetPlayer = null;

      // Try to get player from sourceEntity
      if (event.sourceEntity && event.sourceEntity.typeId === 'minecraft:player') {
        targetPlayer = event.sourceEntity;
      }

      // Try to parse message for player name
      if (!targetPlayer && event.message) {
        try {
          const data = JSON.parse(event.message);
          if (data.player) {
            targetPlayer = world.getPlayers().find(p =>
              p.name.toLowerCase() === data.player.toLowerCase()
            );
          }
        } catch (e) {}
      }

      if (targetPlayer && targetPlayer.isValid && hasAdminPermission(targetPlayer)) {
        tryOpenMenuWithDelay(targetPlayer);
      }
    }, { namespaces: [CONFIG.scriptEvent.namespace] });

    console.warn(`§a[TrophyTP] ScriptEvent listener registered: ${CONFIG.scriptEvent.name}`);
  } catch (e) {
    console.warn(`§c[TrophyTP] ScriptEvent registration failed: ${e.message}`);
  }
}

// ===== BEDROCKBRIDGE COMMAND REGISTRATION =====
// THIS MUST BE AT TOP LEVEL - NOT IN FUNCTION

try {
  // Register main admin command
  bridge.bedrockCommands.registerAdminCommand(
    CONFIG.commands.main,
    (player) => {
      if (!player || !player.isValid) {
        return;
      }

      if (hasAdminPermission(player)) {
        tryOpenMenuWithDelay(player);
      } else {
        sendMessage(player, "You don't have permission to use this command.", "error");
      }
    },
    "Open the advanced admin teleport menu"
  );

  console.warn(`§a[TrophyTP] Admin command registered: ${CONFIG.commands.main}`);
} catch (error) {
  console.warn(`§c[TrophyTP] Failed to register admin command: ${error.message}`);
}

// Register alias command as tag-based
try {
  bridge.bedrockCommands.registerTagCommand(
    CONFIG.commands.menuAlias,
    (player) => {
      if (!player || !player.isValid) {
        return;
      }

      if (hasAdminPermission(player)) {
        tryOpenMenuWithDelay(player);
      } else {
        sendMessage(player, "You don't have permission to use this command.", "error");
      }
    },
    "Alias for admin teleport menu",
    ...CONFIG.adminTags
  );

  console.warn(`§a[TrophyTP] Tag command registered: ${CONFIG.commands.menuAlias}`);
} catch (error) {
  console.warn(`§c[TrophyTP] Failed to register tag command: ${error.message}`);
}

// ===== STARTUP MESSAGE =====
console.warn("");
console.warn("§9═══════════════════════════════════════════════════════════");
console.warn("§9EnhancedTrophyTP v4.0.0 - ULTIMATE ADMIN TELEPORT MENU");
console.warn("§9Compatible: Minecraft Bedrock 1.21.93+, BedrockBridge v1.0+");
console.warn("§9═══════════════════════════════════════════════════════════");
console.warn(`§aCommand: /${CONFIG.commands.main}`);
console.warn(`§aAlias: /${CONFIG.commands.menuAlias}`);
console.warn(`§aScriptEvent: /scriptevent ${CONFIG.scriptEvent.name}`);
console.warn("§9═══════════════════════════════════════════════════════════");
console.warn("");
