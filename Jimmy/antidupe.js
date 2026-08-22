/**
 * antidupe.js - BedrockBridge Anti-Bundle Duplication Protection Plugin
 *
 * Uses @minecraft/server:
 * - Monitors container interactions (hoppers, dispensers, droppers) for bundle insertion
 * - Detects and automatically removes bundle items from redstone containers to prevent duping
 * - Pinpoints suspect players within radius and broadcasts in-game warning messages
 * - Logs detailed interception reports to Discord via BedrockBridge embeds
 * - Admin bypass for player tags (admin, esploratori:admin)
 * - Registers administrative command (!togglehoppercheck <on/off>) for real-time control
 * 
 * v1.0.0 by beeeeeeeluga (https://github.com/Beeeeeeeluga)
 * Discord: beeeeeeeluga (807236027189297212) 
 * More plugins: https://discord.gg/kB7dWtQZKx
 *
 * Addon Support Server: https://discord.com/invite/esploratori-development-1043447184210792468
 */

import { world, system } from "@minecraft/server";
import { bridge } from "../addons";
import { bridgeDirect } from "../BridgeDirect";


bridge.events.bridgeInitialize.subscribe(e => {
    e.registerAddition("discord_direct");
});

// Config
const RADIUS_BLOCKS = 50;                 // scan radius
const HOPPER_BLOCKIDS = new Set([
    "minecraft:hopper", 
    "minecraft:dispenser", 
    "minecraft:dropper"
]);
// all colors
const BUNDLE_IDS = new Set(["minecraft:bundle", "minecraft:white_bundle", "minecraft:orange_bundle", "minecraft:magenta_bundle", "minecraft:light_blue_bundle", "minecraft:yellow_bundle", "minecraft:lime_bundle", "minecraft:pink_bundle", "minecraft:gray_bundle", "minecraft:light_gray_bundle", "minecraft:cyan_bundle", "minecraft:purple_bundle", "minecraft:blue_bundle", "minecraft:brown_bundle", "minecraft:green_bundle", "minecraft:red_bundle", "minecraft:black_bundle"]);
const SCAN_INTERVAL_TICKS = 5;            // every 5 ticks (1/4secs)
const WATCH_TTL_TICKS = 80;               // follow time: check after player interact
const NEAREST_ALERT_MAX_DIST = 3;         // decide suspect max distance

const BROADCAST_PREFIX = "§6[bundle dupe]§r "; 

// State
// key = `${dim.id}|x,y,z` -> { tickExpires, lastUserName, lastUserId, isAdmin }
const watchedHoppers = new Map();
let isAntiBundleEnabled = true;

let currentTick = 0;
system.runInterval(() => currentTick++, 1);

function hopperKey(dim, loc) { return `${dim.id}|${Math.floor(loc.x)},${Math.floor(loc.y)},${Math.floor(loc.z)}`; }
function withinRadius(p, loc, r) { const dx=p.location.x-loc.x, dy=p.location.y-loc.y, dz=p.location.z-loc.z; return dx*dx+dy*dy+dz*dz <= r*r; }

function sendLogToDiscord(title, description, isWarning = true) {

    if (bridgeDirect.ready) { 
        try {
            bridgeDirect.sendEmbed({
                title: title,
                description: description,
                color: isWarning ? 0xffaa00 : 0x99aab5
            });
        } catch (err) {
            console.warn("[antidupe] Discord send fail: " + err);
        }
    }
}

world.afterEvents.itemStartUseOn.subscribe(ev => {
    if (!isAntiBundleEnabled) return;
    
    try {
        const b = ev.block;
        // must use .has() , !== fail
        if (!b || !HOPPER_BLOCKIDS.has(b.typeId)) return;
        
        const player = ev.source;
        const key = hopperKey(b.dimension, b.location);

        // admin whitelist
        const isAdmin = player.hasTag("admin") || player.hasTag("esploratori:admin");

        watchedHoppers.set(key, {
            tickExpires: currentTick + WATCH_TTL_TICKS,
            lastUserName: player.name,
            lastUserId: player.id,
            isAdmin: isAdmin
        });
    } catch {  }
});


system.runInterval(() => {
    if (!isAntiBundleEnabled) return;

    // clear past
    for (const [key, meta] of Array.from(watchedHoppers)) {
        if (meta.tickExpires <= currentTick) watchedHoppers.delete(key);
    }

    const players = [...world.getPlayers()];

    for (const [key, meta] of Array.from(watchedHoppers)) {
        try {
            // if last is admin, skip scan of this block
            if (meta.isAdmin) continue;

            const sep = key.indexOf("|");
            if (sep === -1) { watchedHoppers.delete(key); continue; }
            const dimId = key.slice(0, sep);
            const [x,y,z] = key.slice(sep+1).split(",").map(n => parseInt(n, 10));
            const dim = world.getDimension(dimId);
            const block = dim.getBlock({ x, y, z });
            
            if (!block || !HOPPER_BLOCKIDS.has(block.typeId)) { watchedHoppers.delete(key); continue; }

            const container = block.getComponent("minecraft:inventory")?.container;
            if (!container) { watchedHoppers.delete(key); continue; }

            // only player near will do scan
            const nearby = players.filter(p => p.dimension === dim && withinRadius(p, {x,y,z}, RADIUS_BLOCKS));
            if (nearby.length === 0) continue;

            // if nearby blocks admin exist, whitelist
            const adminNearby = nearby.some(p => (p.hasTag("admin") || p.hasTag("esploratori:admin")) && withinRadius(p, {x,y,z}, NEAREST_ALERT_MAX_DIST));
            if (adminNearby) continue;

            // check and clear bundle
            let removed = false;
            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (item && BUNDLE_IDS.has(item.typeId)) {
                    container.setItem(i, undefined);
                    removed = true;
                }
            }
            if (!removed) continue;

            // find player
            let culprit = players.find(p => p.id === meta.lastUserId);
            const loc = { x, y, z };
            const isClose = culprit && culprit.dimension === dim && withinRadius(culprit, loc, NEAREST_ALERT_MAX_DIST);
            
            if (!isClose) {
                // if the original player left, find the nearest player
                let best = null, bestD2 = Number.MAX_VALUE;
                for (const p of nearby) {
                    if (p.hasTag("admin") || p.hasTag("esploratori:admin")) continue; // ignore admin
                    const dx=p.location.x-x, dy=p.location.y-y, dz=p.location.z-z; const d2=dx*dx+dy*dy+dz*dz;
                    if (d2 < bestD2) { bestD2 = d2; best = p; }
                }
                if (best && Math.sqrt(bestD2) <= NEAREST_ALERT_MAX_DIST) culprit = best;
            }

            if (culprit) {
                const msg = `${BROADCAST_PREFIX}§cPossible duping attempt by §e${culprit.name}§r at §7(${x} ${y} ${z})§r.`;
                world.sendMessage(msg);
                
                sendLogToDiscord(
                    "⚠️ Suspected duping items interception warning",
                    `**Playerr:** "${culprit.name}" *(${culprit.id})*\n**事件:** try to put bundle into a container\n**location:** coords \`(${x}, ${y}, ${z})\` [${dimId}]`
                );
            } else {
                // not find
                const msg = `${BROADCAST_PREFIX}Removed a bundle from a container at §7(${x} ${y} ${z})§r. Culprit unknown.`;
                world.sendMessage(msg);
                
                sendLogToDiscord(
                    "ℹ️ container clear",
                    `auto cleared at \`(${x}, ${y}, ${z})\` [${dimId}] bundle, but failed to find the specific operator。`,
                    false
                );
            }

            watchedHoppers.delete(key);
        } catch {
            // prevent log spam
        }
    }
}, SCAN_INTERVAL_TICKS);


bridge.bedrockCommands.registerTagCommand(
    "togglehoppercheck",
    (player, state) => {
        if (!state) {
            player.sendMessage(`§eusage: !togglehoppercheck <on/off> (status: ${isAntiBundleEnabled ? "§aom" : "§coff"}§e)`);
            return;
        }

        const arg = state.toString().toLowerCase();

        if (arg === "on") {
            isAntiBundleEnabled = true;
            player.sendMessage("§a[antidupe] antidupe bundle systen has turned on");
        } else if (arg === "off") {
            isAntiBundleEnabled = false;
            player.sendMessage("§c[antidupe] antidupe bundle systen has turned off");
        } else {
            player.sendMessage("§cinvalid variable, please enter on or off");
        }
    },
    "toggle bundle antidupe on or off",
    "esploratori:admin"
);
