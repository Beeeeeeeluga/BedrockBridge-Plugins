/**
 * citymusic.js - BedrockBridge Location-Based Background Music Plugin
 *
 * Uses @minecraft/server:
 * - Plays zone-specific background music dynamically based on player coordinates
 * - Handles track queuing, duration timing, and non-repeating track randomization
 * - Provides player-controlled toggle command (!tgcitymusic <on|off>)
 * 
 * v1.0.0 by beeeeeeeluga (https://github.com/Beeeeeeeluga)
 * Discord: beeeeeeeluga (807236027189297212) 
 * More plugins: https://discord.gg/kB7dWtQZKx
 *
 * Addon Support Server: https://discord.com/invite/esploratori-development-1043447184210792468
 */

import { world, system } from "@minecraft/server";
import { bridge } from "../../addons.js";
import { MUSIC_ZONES } from "./musicsetting.js";

const playerMusicState = new Map();
const playerMusicEnabled = new Map();

bridge.bedrockCommands.registerCommand(
    "tgcitymusic",
    (player, option) => {
        const action = option ? String(option).trim().toLowerCase() : "";

        if (action === "on") {
            playerMusicEnabled.set(player.name, true);
            player.sendMessage("§a[Music System] City area music enabled.");
        } else if (action === "off") {
            playerMusicEnabled.set(player.name, false);

            const state = playerMusicState.get(player.name);
            if (state) {
                stopPlayerSound(player, state.currentTrackId);
                playerMusicState.delete(player.name);
            }

            player.sendMessage("§c[Music System] City area music disabled.");
        } else {
            player.sendMessage("§e[Music System] Usage: !tgcitymusic <on|off>");
        }
    },
    "Toggle city area music playback"
);

// Check player positions every 20 ticks (~1s)
system.runInterval(() => {
    const allPlayers = world.getAllPlayers();
    const now = Date.now();

    for (const player of allPlayers) {
        const pName = player.name;
        const pLoc = player.location;
        const pDimId = player.dimension.id;

        const isEnabled = playerMusicEnabled.get(pName) ?? true;

        let currentZone = null;
        for (const zone of MUSIC_ZONES) {
            const targetDim = zone.dimension || "minecraft:overworld";
            if (pDimId === targetDim) {
                const realMinX = Math.min(zone.minX, zone.maxX);
                const realMaxX = Math.max(zone.minX, zone.maxX);
                const realMinY = Math.min(zone.minY, zone.maxY);
                const realMaxY = Math.max(zone.minY, zone.maxY);
                const realMinZ = Math.min(zone.minZ, zone.maxZ);
                const realMaxZ = Math.max(zone.minZ, zone.maxZ);

                const isInZone = (
                    pLoc.x >= realMinX && pLoc.x <= realMaxX &&
                    pLoc.y >= realMinY && pLoc.y <= realMaxY &&
                    pLoc.z >= realMinZ && pLoc.z <= realMaxZ
                );

                if (isInZone) {
                    currentZone = zone;
                    break;
                }
            }
        }

        const state = playerMusicState.get(pName);

        if (currentZone && isEnabled) {
            if (!state || state.zoneId !== currentZone.id) {
                if (state && state.currentTrackId) {
                    stopPlayerSound(player, state.currentTrackId);
                }
                playRandomTrack(player, currentZone, now);
            } else {
                if (now >= state.nextTrackTime) {
                    playRandomTrack(player, currentZone, now, state.currentTrackId);
                }
            }
        } else {
            // Stop music if player leaves the zone
            if (state) {
                stopPlayerSound(player, state.currentTrackId);
                playerMusicState.delete(pName);
            }
        }
    }
}, 20);

function playRandomTrack(player, zone, nowTimestamp, lastTrackId = null) {
    if (!zone.tracks || zone.tracks.length === 0) return;

    let availableTracks = zone.tracks;
    if (zone.tracks.length > 1 && lastTrackId) {
        availableTracks = zone.tracks.filter(t => t.soundId !== lastTrackId);
    }

    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const selectedTrack = availableTracks[randomIndex];

    try {
        player.playMusic(selectedTrack.soundId, {
            volume: 100.0,
            fade: 1.0,
            loop: false
        });

        playerMusicState.set(player.name, {
            zoneId: zone.id,
            currentTrackId: selectedTrack.soundId,
            nextTrackTime: nowTimestamp + (selectedTrack.duration * 1000)
        });
    } catch (err) {
        console.error(`[MusicPlayer] Failed to play ${selectedTrack.soundId}:`, err);
    }
}

function stopPlayerSound(player, soundId) {
    if (!soundId) return;

    // Native API stop
    try {
        if (typeof player.stopSound === "function") {
            player.stopSound(soundId);
        }
    } catch (e) {}

    // Fallback stop command
    try {
        player.runCommandAsync(`stopsound @s ${soundId}`);
    } catch (e) {}
}

// Clean up player state on leave
world.afterEvents.playerLeave.subscribe(event => {
    playerMusicState.delete(event.playerName);
    playerMusicEnabled.delete(event.playerName);
});
