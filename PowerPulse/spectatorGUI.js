// 🎥 WIP V.0.0.1 Spectator Plugin – BedrockBridge Edition by PoWeROffAPT
import { world, system, GameMode } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { bridge } from "../addons";

const spectators = new Map(); // followerName -> targetPlayer
const updateInterval = 2; // in ticks (~0.1s)
const updateHandlers = new Map();
const menuPending = new Map();

function openSpectatorUI(player) {
  menuPending.delete(player.name);

  const form = new ActionFormData()
    .title("🎥 Spectator Manager")
    .body("Select a player to spectate:");

  const players = [...world.getPlayers()].filter(p => p.name !== player.name);
  if (players.length === 0) {
    player.sendMessage("§eNo other players online.");
    return;
  }

  players.forEach(p => form.button(`👁 ${p.name}`));

  form.show(player).then(res => {
    if (res.canceled) return;
    const target = players[res.selection];
    if (!target) return player.sendMessage("§cTarget player not found.");
    startSpectating(player, target);
  });
}

function startSpectating(spectator, target) {
  if (spectators.has(spectator.name)) stopSpectating(spectator);
  spectators.set(spectator.name, target);
  spectator.sendMessage(`§bYou are now spectating §e${target.name}`);

  try {
    spectator.setGameMode(GameMode.spectator);
  } catch {
    spectator.sendMessage("§cFailed to set gamemode – Make sure spectator mode is enabled.");
  }

  const handler = system.runInterval(() => {
    if (!spectators.has(spectator.name)) return;

    const t = spectators.get(spectator.name);
    if (!t || !world.getPlayers().includes(t)) {
      stopSpectating(spectator);
      return;
    }

    const loc = t.location;
    const rot = t.getRotation();
    const yaw = (rot.y % 360) * (Math.PI / 180);

    // Adjust to be behind and facing the same direction
    const offsetX = Math.cos(yaw) * -2;
    const offsetZ = Math.sin(yaw) * -2;

    const newPos = {
      x: loc.x + offsetX,
      y: loc.y + 1,
      z: loc.z + offsetZ
    };

    const facing = {
      x: loc.x + Math.cos(yaw),
      y: loc.y + 1,
      z: loc.z + Math.sin(yaw)
    };

    try {
      spectator.teleport(newPos, {
        facingLocation: facing,
        dimension: t.dimension
      });
    } catch (e) {
      spectator.sendMessage("§cTeleport error: " + e);
    }
  }, updateInterval);

  updateHandlers.set(spectator.name, handler);
}

function stopSpectating(player) {
  if (spectators.has(player.name)) {
    spectators.delete(player.name);
    const handler = updateHandlers.get(player.name);
    if (handler) {
      system.clearRun(handler);
      updateHandlers.delete(player.name);
    }
    try { player.setGameMode(GameMode.adventure); } catch {}
    player.sendMessage("§cSpectator mode ended.");
  } else {
    player.sendMessage("§7You are not currently spectating anyone.");
  }
}

bridge.bedrockCommands.registerCommand("spectate", (player) => {
  if (!player.hasTag("admin")) return player.sendMessage("§cNo permission.");

  if (menuPending.has(player.name)) {
    player.sendMessage("§7Menu is already being prepared...");
    return;
  }

  menuPending.set(player.name, true);
  player.sendMessage("§7Opening spectator menu in a few seconds...");

  let attempts = 0;
  const maxAttempts = 15;
  const waitForChat = system.runInterval(() => {
    if (!menuPending.has(player.name)) return system.clearRun(waitForChat);
    if (attempts++ >= maxAttempts) {
      menuPending.delete(player.name);
      player.sendMessage("§cMenu could not be opened. Please try again.");
      return system.clearRun(waitForChat);
    }
    try {
      openSpectatorUI(player);
      system.clearRun(waitForChat);
    } catch {}
  }, 20);
}, "Opens the spectator menu for admins.");

bridge.bedrockCommands.registerCommand("stopspectate", (player) => {
  stopSpectating(player);
}, "Ends the spectator mode.");

console.warn("🎥 Spectator Plugin loaded with real spectator mode, management UI & player follow logic.");
