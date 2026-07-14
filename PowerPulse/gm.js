/**
 * GameMode Manager - Complete Admin Menu Plugin
 * All-in-one admin panel for gamemode management
 *
 * Features:
 * - View all players and their gamemodes
 * - Change your own gamemode
 * - Change other players' gamemodes (admin)
 * - Item trigger (compass)
 * - Single comprehensive menu
 * - Auto-close menu with configurable timer
 *
 * v3.0.0 - Complete English Edition with Timing
 */

import { world, system, GameMode } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { bridge } from "../addons";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const PLUGIN_NAME = "§9[GameMode]§r";
const PLUGIN_VERSION = "3.0.0";

// Menu auto-close timer in milliseconds (5 seconds default)
const MENU_AUTO_CLOSE_TIME = 5000;

const GAMEMODES = {
  "survival": { emoji: "⛏", name: "Survival", id: "survival" },
  "adventure": { emoji: "🗡", name: "Adventure", id: "adventure" },
  "creative": { emoji: "★", name: "Creative", id: "creative" },
  "spectator": { emoji: "👁", name: "Spectator", id: "spectator" }
};

const GAMEMODE_IDS = ["survival", "adventure", "creative", "spectator"];

// Player gamemode tracking
const playerModes = new Map();

// Menu timers for auto-close functionality
const menuTimers = new Map();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message, type = "info") {
  const icon = type === "error" ? "❌" : type === "success" ? "✓" : "ℹ";
  console.warn(`${PLUGIN_NAME} ${icon} ${message}`);
}

function sendMessage(player, message, type = "info") {
  const color = type === "error" ? "§c" : type === "success" ? "§a" : "§e";
  player.sendMessage(`${color}${PLUGIN_NAME} ${message}`);
}

function isAdmin(player) {
  if (!player) return false;

  const adminTags = ["admin", "staff", "mod", "esploratori:admin", "owner"];
  for (const tag of adminTags) {
    if (player.hasTag(tag)) return true;
  }

  return false;
}

/**
 * Set menu auto-close timer
 * Clears previous timer if exists
 */
function setMenuTimer(playerName, callback) {
  // Clear existing timer if any
  if (menuTimers.has(playerName)) {
    system.clearRun(menuTimers.get(playerName));
  }

  // Set new timer
  const timerId = system.runTimeout(() => {
    menuTimers.delete(playerName);
    if (callback) callback();
  }, MENU_AUTO_CLOSE_TIME);

  menuTimers.set(playerName, timerId);
}

/**
 * Clear menu timer for a player
 */
function clearMenuTimer(playerName) {
  if (menuTimers.has(playerName)) {
    system.clearRun(menuTimers.get(playerName));
    menuTimers.delete(playerName);
  }
}

function getAllPlayers() {
  try {
    return world.getPlayers().filter(p => p && p.name);
  } catch (error) {
    log(`Get players error: ${error.message}`, "error");
    return [];
  }
}

function normalizeGamemode(mode) {
  // Convert GameMode enum to string
  if (typeof mode === "string") return mode.toLowerCase();
  if (mode === "Survival") return "survival";
  if (mode === "Creative") return "creative";
  if (mode === "Adventure") return "adventure";
  if (mode === "Spectator") return "spectator";
  return "survival";
}

function stringToGameMode(modeString) {
  // Convert string ID to GameMode enum value
  const normalized = normalizeGamemode(modeString);

  switch (normalized) {
    case "survival":
      return GameMode.Survival;
    case "creative":
      return GameMode.Creative;
    case "adventure":
      return GameMode.Adventure;
    case "spectator":
      return GameMode.Spectator;
    default:
      return GameMode.Survival;
  }
}

function getPlayerMode(playerName) {
  // Try to get from all players first (live data)
  try {
    const players = world.getPlayers();
    for (const p of players) {
      if (p.name === playerName) {
        const mode = p.getGameMode();
        return normalizeGamemode(mode);
      }
    }
  } catch (e) {
    // Fallback to cache
  }

  // Fallback to cache
  const stored = playerModes.get(playerName);
  if (stored) return normalizeGamemode(stored);
  return "survival";
}

function setPlayerMode(playerName, mode) {
  playerModes.set(playerName, normalizeGamemode(mode));
}

function changeGamemode(player, modeId) {
  try {
    if (!player || !player.name) return false;

    // Convert string ID to GameMode enum and set it
    const gameModeEnum = stringToGameMode(modeId);
    player.setGameMode(gameModeEnum);

    // Save new mode immediately
    setPlayerMode(player.name, modeId);

    // Verify after a short delay
    system.runTimeout(() => {
      try {
        const currentMode = player.getGameMode();
        setPlayerMode(player.name, currentMode);
      } catch (e) {
        // Fallback
        setPlayerMode(player.name, modeId);
      }
    }, 1);

    const modeData = GAMEMODES[modeId] || GAMEMODES["survival"];
    sendMessage(player, `Gamemode changed to §b${modeData.emoji} ${modeData.name}§r!`, "success");
    log(`${player.name} -> ${modeId}`, "success");

    return true;
  } catch (error) {
    log(`Error changing gamemode for ${player.name}: ${error.message}`, "error");
    return false;
  }
}

// ============================================================================
// MAIN MENU - ONE COMPREHENSIVE MENU FOR EVERYTHING
// ============================================================================

function showMainMenu(player) {
  if (!player || !player.name) return;

  try {
    const isAdminPlayer = isAdmin(player);
    const allPlayers = getAllPlayers();

    const form = new ActionFormData()
      .title("§9★ GameMode Manager v3.0.0");

    let bodyText = `§e${isAdminPlayer ? "§9⚙ ADMIN PANEL" : "§9🎮 GAMEMODE MANAGER"}\n\n`;

    if (isAdminPlayer) {
      bodyText += `§7Admin Controls:\n`;
      bodyText += `§e→ §aChange My Gamemode\n`;
      bodyText += `§e→ §bChange Player Gamemode\n`;
      bodyText += `§e→ §cPlayer Details\n\n`;
    }

    bodyText += `§e§l👥 Online Players (${allPlayers.length}):\n\n`;

    allPlayers.forEach((p, i) => {
      const mode = getPlayerMode(p.name);
      const modeData = GAMEMODES[mode] || GAMEMODES["survival"];
      bodyText += `§7${i + 1}. §b${p.name}§r ${modeData.emoji} ${modeData.name}\n`;
    });

    form.body(bodyText);

    // Buttons for admins
    if (isAdminPlayer) {
      form.button("§a→ Change My Gamemode", "textures/ui/sidebar_icons/gamemode_s.png");
      form.button("§b→ Change Player Gamemode", "textures/ui/sidebar_icons/gamemode_c.png");
      form.button("§c→ Player Details", "textures/ui/icon_multiplayer.png");
      form.button("§7⟳ Refresh", "textures/ui/refresh.png");
    } else {
      // Regular players - only their own gamemode
      form.button("§a→ Change My Gamemode", "textures/ui/sidebar_icons/gamemode_s.png");
      form.button("§7⟳ Refresh", "textures/ui/refresh.png");
    }

    form.show(player).then(response => {
      clearMenuTimer(player.name);

      if (response.canceled) return;

      if (isAdminPlayer) {
        switch (response.selection) {
          case 0:
            showGamemodeSelection(player, player);
            break;
          case 1:
            showPlayerSelection(player);
            break;
          case 2:
            showPlayerDetails(player);
            break;
          case 3:
            system.runTimeout(() => showMainMenu(player), 2);
            break;
        }
      } else {
        switch (response.selection) {
          case 0:
            showGamemodeSelection(player, player);
            break;
          case 1:
            system.runTimeout(() => showMainMenu(player), 2);
            break;
        }
      }
    }).catch(error => {
      clearMenuTimer(player.name);
      log(`Menu error: ${error.message}`, "error");
    });

    // Set auto-close timer
    setMenuTimer(player.name, () => {
      sendMessage(player, "Menu closed automatically.", "info");
    });

  } catch (error) {
    log(`showMainMenu error: ${error.message}`, "error");
    sendMessage(player, "Error opening menu!", "error");
  }
}

// ============================================================================
// GAMEMODE SELECTION SUBMENU
// ============================================================================

function showGamemodeSelection(executor, targetPlayer) {
  if (!executor || !targetPlayer) return;

  try {
    const currentMode = getPlayerMode(targetPlayer.name);
    const isOwnMode = executor.name === targetPlayer.name;

    let title = isOwnMode
      ? `§9★ Your Gamemode`
      : `§9★ ${targetPlayer.name}'s Gamemode`;

    const form = new ActionFormData()
      .title(title);

    const currentModeData = GAMEMODES[currentMode] || GAMEMODES["survival"];
    let bodyText = `§eCurrent: §b${currentModeData.emoji} ${currentModeData.name}\n\n`;
    bodyText += `§eSelect a new gamemode:\n\n`;

    form.body(bodyText);

    GAMEMODE_IDS.forEach(modeId => {
      const modeData = GAMEMODES[modeId];
      const isCurrentMode = modeId === currentMode;
      const prefix = isCurrentMode ? "§6◆ " : "§7□ ";
      form.button(`${prefix}${modeData.emoji} ${modeData.name}`);
    });

    form.button("§c✕ Back");

    form.show(executor).then(response => {
      clearMenuTimer(executor.name);

      if (response.canceled) return;

      if (response.selection === GAMEMODE_IDS.length) {
        // Back button
        system.runTimeout(() => showMainMenu(executor), 2);
        return;
      }

      const selectedMode = GAMEMODE_IDS[response.selection];
      if (selectedMode) {
        changeGamemode(targetPlayer, selectedMode);

        if (!isOwnMode) {
          const selectedModeData = GAMEMODES[selectedMode] || GAMEMODES["survival"];
          sendMessage(targetPlayer, `Your gamemode was changed to §b${selectedModeData.emoji} ${selectedModeData.name}§r by §b${executor.name}§r!`, "info");
        }

        // Go back to menu
        system.runTimeout(() => showMainMenu(executor), 5);
      }
    }).catch(error => {
      clearMenuTimer(executor.name);
      log(`Gamemode selection error: ${error.message}`, "error");
    });

    // Set auto-close timer
    setMenuTimer(executor.name, () => {
      sendMessage(executor, "Menu closed automatically.", "info");
    });

  } catch (error) {
    log(`showGamemodeSelection error: ${error.message}`, "error");
  }
}

// ============================================================================
// PLAYER SELECTION SUBMENU (FOR ADMINS)
// ============================================================================

function showPlayerSelection(admin) {
  if (!admin || !isAdmin(admin)) {
    sendMessage(admin, "You do not have permission!", "error");
    return;
  }

  try {
    const allPlayers = getAllPlayers().filter(p => p.name !== admin.name);

    if (allPlayers.length === 0) {
      sendMessage(admin, "No other players online!", "info");
      return;
    }

    const form = new ActionFormData()
      .title("§9👥 Select Player")
      .body("§eSelect a player to change gamemode:\n\n");

    allPlayers.forEach(p => {
      const mode = getPlayerMode(p.name);
      const modeData = GAMEMODES[mode] || GAMEMODES["survival"];
      form.button(`${modeData.emoji} ${p.name}`);
    });

    form.button("§c✕ Back");

    form.show(admin).then(response => {
      clearMenuTimer(admin.name);

      if (response.canceled) return;

      if (response.selection === allPlayers.length) {
        // Back button
        system.runTimeout(() => showMainMenu(admin), 2);
        return;
      }

      const selectedPlayer = allPlayers[response.selection];
      if (selectedPlayer) {
        system.runTimeout(() => {
          showGamemodeSelection(admin, selectedPlayer);
        }, 3);
      }
    }).catch(error => {
      clearMenuTimer(admin.name);
      log(`Player selection error: ${error.message}`, "error");
    });

    // Set auto-close timer
    setMenuTimer(admin.name, () => {
      sendMessage(admin, "Menu closed automatically.", "info");
    });

  } catch (error) {
    log(`showPlayerSelection error: ${error.message}`, "error");
  }
}

// ============================================================================
// PLAYER DETAILS SUBMENU (FOR ADMINS)
// ============================================================================

function showPlayerDetails(admin) {
  if (!admin || !isAdmin(admin)) {
    sendMessage(admin, "You do not have permission!", "error");
    return;
  }

  try {
    const allPlayers = getAllPlayers();
    let bodyText = `§e§l📋 PLAYER DETAILS\n\n`;

    bodyText += `§e§lOnline: §b${allPlayers.length}\n\n`;

    allPlayers.forEach((p, i) => {
      const mode = getPlayerMode(p.name);
      const modeData = GAMEMODES[mode] || GAMEMODES["survival"];
      const loc = p.location;

      bodyText += `§7─────────────────────────────\n`;
      bodyText += `§b${i + 1}. ${p.name}\n`;
      bodyText += `§eGamemode: §b${modeData.emoji} ${modeData.name}\n`;
      bodyText += `§ePosition: §b(${Math.round(loc.x)}, ${Math.round(loc.y)}, ${Math.round(loc.z)})\n`;
      bodyText += `§eDimension: §b${p.dimension.id.split(":")[1]}\n`;
    });

    bodyText += `§7─────────────────────────────\n`;

    const form = new ActionFormData()
      .title("§9📋 Player Details")
      .body(bodyText)
      .button("§c✕ Back");

    form.show(admin).then(response => {
      clearMenuTimer(admin.name);

      if (!response.canceled && response.selection === 0) {
        system.runTimeout(() => showMainMenu(admin), 2);
      }
    }).catch(error => {
      clearMenuTimer(admin.name);
      log(`Player details error: ${error.message}`, "error");
    });

    // Set auto-close timer
    setMenuTimer(admin.name, () => {
      sendMessage(admin, "Menu closed automatically.", "info");
    });

  } catch (error) {
    log(`showPlayerDetails error: ${error.message}`, "error");
  }
}

// ============================================================================
// ITEM TRIGGER - COMPASS RIGHT CLICK
// ============================================================================

world.beforeEvents.itemUse.subscribe(event => {
  const item = event.itemStack;
  const player = event.source;

  if (!player || !player.name) return;
  if (item?.typeId !== "minecraft:compass") return;

  // Only open for admins
  if (!isAdmin(player)) {
    sendMessage(player, "Only admins can open this menu!", "error");
    return;
  }

  event.cancel = true;
  system.runTimeout(() => {
    showMainMenu(player);
  }, 2);
});

// ============================================================================
// PLAYER JOIN/LEAVE TRACKING
// ============================================================================

world.afterEvents.playerJoin.subscribe(event => {
  const player = event.player;
  try {
    const mode = player.getGameMode();
    setPlayerMode(player.name, mode);
    log(`${player.name} joined (${mode})`);
  } catch (error) {
    log(`Join tracking error: ${error.message}`, "error");
  }
});

world.afterEvents.playerLeave.subscribe(event => {
  playerModes.delete(event.playerName);
  clearMenuTimer(event.playerName);
  log(`${event.playerName} left`);
});

// Track live gamemode changes from commands or other sources
world.afterEvents.playerGameModeChange.subscribe(event => {
  try {
    const player = event.player;
    const newMode = event.newGameMode;
    setPlayerMode(player.name, newMode);
    log(`${player.name} changed gamemode to ${newMode}`, "success");
  } catch (error) {
    log(`Gamemode change event error: ${error.message}`, "error");
  }
});

// ============================================================================
// BEDROCK BRIDGE COMMANDS
// ============================================================================

// Main admin command - opens the menu
if (bridge?.bedrockCommands) {
  bridge.bedrockCommands.registerAdminCommand("gm", (user) => {
    if (!user || !user.name) return;

    if (!isAdmin(user)) {
      sendMessage(user, "You do not have permission!", "error");
      return;
    }

    system.runTimeout(() => {
      showMainMenu(user);
    }, 2);
  }, "Open the GameMode Manager menu (Admin only)");

  log("✓ Command registered: ?gm", "success");
}

// ============================================================================
// STARTUP
// ============================================================================

system.runTimeout(() => {
  log("════════════════════════════════════════", "info");
  log(`GameMode Manager v${PLUGIN_VERSION}`, "success");
  log("════════════════════════════════════════", "info");
  log("✓ Admin Command: ?gm", "success");
  log(`✓ Item Trigger: Compass (Admins only)`, "success");
  log(`✓ Auto-close Timer: ${MENU_AUTO_CLOSE_TIME / 1000} seconds`, "success");
  log("✓ Features: Player list, Gamemode changing, Player details", "success");
  log("════════════════════════════════════════", "info");

  // Initialize all current players
  getAllPlayers().forEach(player => {
    try {
      const mode = player.getGameMode();
      setPlayerMode(player.name, mode);
    } catch (error) {
      log(`Init error for ${player.name}: ${error.message}`, "error");
    }
  });

  log("Plugin ready!", "success");
}, 10);

console.warn("✓ GameMode Manager Plugin loaded!");
