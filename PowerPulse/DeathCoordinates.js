/**
 * DeathCoordinates @version 1.0.0 - BedrockBridge Plugin
 * 
 * This plugin tracks player deaths and provides location coordinates.
 * Features:
 * - Sends death location information only to the player who died
 * - Logs death information to server console (admin only)
 * - Adds a /lastdeath command for players to retrieve their own last death location
 */
import { world, Player } from '@minecraft/server';
import { bridge } from '../addons';

// Track last death locations (private to each player)
const lastDeathLocations = new Map();

// Subscribe to player death events using bridge events
bridge.events.playerDieLog.subscribe((event) => {
    const player = event.player;
    const { x, y, z } = player.location;
    const dimension = player.dimension;
    
    // Format coordinates for display (rounded to integers)
    const coords = {
        x: Math.round(x),
        y: Math.round(y),
        z: Math.round(z),
        dimension: dimension.id
    };
    
    // Store the death location for this player
    lastDeathLocations.set(player.id, coords);
    
    // Create formatted message for the player
    const playerMessage = `§cYou died! §fLast death location: ` + 
                        `X: §b${coords.x} §fY: §b${coords.y} §fZ: §b${coords.z} ` +
                        `§fin the §6${dimension.id.replace("minecraft:", "")}`;
    
    // Send message ONLY to the player who died
    player.sendMessage(playerMessage);
    
    // Log to server console (only admins will see this)
    console.warn(`Player ${player.name} died at X: ${coords.x} Y: ${coords.y} Z: ${coords.z} in the ${dimension.id.replace("minecraft:", "")}`);
});

// Also register the standard entity death event as fallback
world.afterEvents.entityDie.subscribe(({ damageSource, deadEntity }) => {
    // Only track player deaths
    if (deadEntity.typeId !== "minecraft:player") return;
    
    // This is a fallback in case the bridge event doesn't work
    const { x, y, z } = deadEntity.location;
    const dimension = deadEntity.dimension;
    
    // Save the death location
    lastDeathLocations.set(deadEntity.id, {
        x: Math.round(x),
        y: Math.round(y),
        z: Math.round(z),
        dimension: dimension.id
    });
    
    // Create formatted message for the player
    const playerMessage = `§cYou died! §fLast death location: ` + 
                        `X: §b${Math.round(x)} §fY: §b${Math.round(y)} §fZ: §b${Math.round(z)} ` +
                        `§fin the §6${dimension.id.replace("minecraft:", "")}`;
    
    // Send message ONLY to the player who died
    deadEntity.sendMessage(playerMessage);
    
    // Log to console (only visible to admins)
    console.warn(`Player ${deadEntity.name} died at X: ${Math.round(x)} Y: ${Math.round(y)} Z: ${Math.round(z)} in the ${dimension.id.replace("minecraft:", "")}`);
});

// Register a command to get last death location (only shows player's own death)
bridge.bedrockCommands.registerCommand("lastdeath", (player) => {
    const lastDeath = lastDeathLocations.get(player.id);
    
    if (lastDeath) {
        player.sendMessage(
            `§fYour last death location: ` +
            `X: §b${lastDeath.x} §fY: §b${lastDeath.y} §fZ: §b${lastDeath.z} ` +
            `§fin the §6${lastDeath.dimension.replace("minecraft:", "")}`
        );
    } else {
        player.sendMessage("§cNo death location recorded for you yet.");
    }
}, "Get your last death location");
