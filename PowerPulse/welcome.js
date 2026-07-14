/**
 * Welcome System - BedrockBridge Plugin
 *
 * Features:
 * - Detects first-time joins using a persistent tag
 * - Sends a warm in-game welcome message for brand-new players
 * - Sends a Discord embed for first-time joins (optional)
 * - Optional normal join messages for existing players (in-game + Discord)
 * - Uses tags to mark new players so staff can recognize them
 * - Simple in-game admin command: /welcomeconfig
 *
 * Command:
 *   /welcomeconfig
 *     -> Show current configuration
 *
 *   /welcomeconfig set <key> <on|off>
 *     -> Toggle a specific option
 *
 * Keys:
 *   first_ingame       - First-time join message in chat
 *   first_discord      - First-time join message to Discord
 *   first_tag_ingame   - Add NEW PLAYER tag in-game
 *   first_tag_discord  - Show "New Player" label in Discord embed
 *   normal_ingame      - Normal join message in chat (for known players)
 *   normal_discord     - Normal join message to Discord
 *
 * Installation:
 * 1. Put this file into:  Bedrock-Bridge/scripts/bridgePlugins/welcome.js
 * 2. In your main index:  import "./welcome";
 */

import { world } from "@minecraft/server";
import { bridge } from "../addons";
import { bridgeDirect } from "../BridgeDirect";

// --------------------------------------------------
// Tags & Runtime Configuration
// --------------------------------------------------

const NEW_PLAYER_KNOWN_TAG = "welcome:known";  // Marks the player as "seen" at least once
const NEW_PLAYER_LABEL_TAG = "welcome:new";    // Optional visible tag for brand-new players

/**
 * In-memory config (can later be wired to "database" if needed).
 * All options are togglable via /welcomeconfig.
 */
const welcomeConfig = {
    firstJoin: {
        inGame: true,            // Show welcome message for first-time players in chat
        discord: true,           // Send first-time joins to Discord
        useTagInGame: true,      // Add NEW_PLAYER_LABEL_TAG on new players
        useTagInDiscord: true    // Show "New Player" label in Discord embeds
    },
    normalJoin: {
        inGame: false,           // Show normal join messages for known players in chat
        discord: false           // Send normal joins for known players to Discord
    }
};

// --------------------------------------------------
// BedrockBridge / Discord Integration
// --------------------------------------------------

// Ensure the Discord addition is registered
bridge.events.bridgeInitialize.subscribe((e) => {
    e.registerAddition("discord_direct");
});

// --------------------------------------------------
// Helper Functions
// --------------------------------------------------

/**
 * Build a nice text summary of the current configuration for admins.
 */
function getConfigSummary() {
    const flag = (v) => (v ? "§aON§r" : "§cOFF§r");
    return [
        "§6[WelcomeConfig]§r Current Settings:",
        ` §eFirst Join In-Game§r: ${flag(welcomeConfig.firstJoin.inGame)}`,
        ` §eFirst Join Discord§r: ${flag(welcomeConfig.firstJoin.discord)}`,
        ` §eNew Tag In-Game§r: ${flag(welcomeConfig.firstJoin.useTagInGame)} (§7${NEW_PLAYER_LABEL_TAG}§r)`,
        ` §eNew Label Discord§r: ${flag(welcomeConfig.firstJoin.useTagInDiscord)}`,
        ` §eNormal Join In-Game§r: ${flag(welcomeConfig.normalJoin.inGame)}`,
        ` §eNormal Join Discord§r: ${flag(welcomeConfig.normalJoin.discord)}`
    ];
}

/**
 * First-join in-game message (only for brand-new players).
 */
function sendFirstJoinInGame(player) {
    const name = player.name;
    const baseMessage = `§aWelcome §e${name}§a to the server!`;
    const infoMessage = "§7This is your first time here – have fun and feel free to ask for help!";

    world.sendMessage(baseMessage);
    world.sendMessage(infoMessage);
}

/**
 * Normal join message for players that have been seen before.
 */
function sendNormalJoinInGame(player) {
    const name = player.name;
    world.sendMessage(`§7${name} §8joined the game.`);
}

/**
 * Discord embed for a first-time join.
 */
function sendFirstJoinDiscord(player) {
    if (!bridgeDirect.ready) return;

    const name = player.name;
    const newLabel = welcomeConfig.firstJoin.useTagInDiscord ? "🆕 New Player" : "Player";

    bridgeDirect.sendEmbed({
        title: "New Player Joined",
        description: `**${name}** joined the server for the very first time!\n\nLabel: \`${newLabel}\``,
        color: 5763719 // greenish
    });
}

/**
 * Discord embed for a normal join.
 */
function sendNormalJoinDiscord(player) {
    if (!bridgeDirect.ready) return;

    const name = player.name;

    bridgeDirect.sendEmbed({
        title: "Player Joined",
        description: `**${name}** joined the server.`,
        color: 3447003 // blue
    });
}

/**
 * Internal: set a boolean config flag by key.
 */
function setConfigFlag(key, value) {
    switch (key) {
        case "first_ingame":
            welcomeConfig.firstJoin.inGame = value;
            return true;
        case "first_discord":
            welcomeConfig.firstJoin.discord = value;
            return true;
        case "first_tag_ingame":
            welcomeConfig.firstJoin.useTagInGame = value;
            return true;
        case "first_tag_discord":
            welcomeConfig.firstJoin.useTagInDiscord = value;
            return true;
        case "normal_ingame":
            welcomeConfig.normalJoin.inGame = value;
            return true;
        case "normal_discord":
            welcomeConfig.normalJoin.discord = value;
            return true;
        default:
            return false;
    }
}

// --------------------------------------------------
// Event Handling: Player Spawn / First Login Detection
// --------------------------------------------------

/**
 * We use playerSpawn (afterEvents) with initialSpawn === true:
 * - initialSpawn === true: first spawn of this player for this login
 * - We distinguish between:
 *      - brand-new player (no NEW_PLAYER_KNOWN_TAG yet)
 *      - known player (already tagged before)
 */
world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;
    if (!event.initialSpawn) return; // Only care about first spawn per login

    const isKnown = player.hasTag(NEW_PLAYER_KNOWN_TAG);
    const isNewPlayer = !isKnown;

    if (isNewPlayer) {
        // Mark player as "known" so next joins are handled as normal
        player.addTag(NEW_PLAYER_KNOWN_TAG);

        // Optional visible tag in-game for new players
        if (welcomeConfig.firstJoin.useTagInGame) {
            player.addTag(NEW_PLAYER_LABEL_TAG);
        }

        // In-game first-join message
        if (welcomeConfig.firstJoin.inGame) {
            sendFirstJoinInGame(player);
        }

        // Discord first-join embed
        if (welcomeConfig.firstJoin.discord) {
            sendFirstJoinDiscord(player);
        }

    } else {
        // Known player handling
        if (welcomeConfig.normalJoin.inGame) {
            sendNormalJoinInGame(player);
        }

        if (welcomeConfig.normalJoin.discord) {
            sendNormalJoinDiscord(player);
        }
    }
});

// --------------------------------------------------
// Admin Command: /welcomeconfig
// --------------------------------------------------

/**
 * Command: /welcomeconfig
 *
 * Usage:
 *   /welcomeconfig
 *   /welcomeconfig show
 *     -> Shows the current configuration.
 *
 *   /welcomeconfig set <key> <on|off>
 *     -> Toggles a specific option.
 *
 * Available keys:
 *   first_ingame       - First-time join in-game message
 *   first_discord      - First-time join Discord message
 *   first_tag_ingame   - "welcome:new" tag in game
 *   first_tag_discord  - "New Player" label in Discord embed
 *   normal_ingame      - Normal in-game join message (known players)
 *   normal_discord     - Normal Discord join message (known players)
 */

bridge.bedrockCommands.registerAdminCommand(
    "welcomeconfig",
    (user, ...rawArgs) => {
        // Normalize arguments (BedrockBridge may pass them differently)
        let args = [];
        if (rawArgs.length === 1 && Array.isArray(rawArgs[0])) {
            args = rawArgs[0];
        } else {
            args = rawArgs.filter((x) => typeof x === "string");
        }

        if (!args.length || args[0].toLowerCase() === "show") {
            // Show current config
            for (const line of getConfigSummary()) {
                user.sendMessage(line);
            }
            user.sendMessage(
                "§7Use §e/welcomeconfig set <key> <on|off> §7to change options."
            );
            return;
        }

        const sub = args[0]?.toLowerCase();
        if (sub === "set") {
            const key = args[1]?.toLowerCase();
            const valRaw = args[2]?.toLowerCase();

            if (!key || !valRaw) {
                user.sendMessage(
                    "§cUsage: §e/welcomeconfig set <key> <on|off>"
                );
                return;
            }

            const value =
                valRaw === "on" ||
                valRaw === "true" ||
                valRaw === "1" ||
                valRaw === "yes";

            const ok = setConfigFlag(key, value);
            if (!ok) {
                user.sendMessage(
                    `§cUnknown key §e${key}§c. Valid keys: §7first_ingame, first_discord, first_tag_ingame, first_tag_discord, normal_ingame, normal_discord`
                );
                return;
            }

            user.sendMessage(
                `§a[WelcomeConfig] §rOption §e${key}§r was set to ${value ? "§aON" : "§cOFF"}§r.`
            );

            // Show summary again for clarity
            for (const line of getConfigSummary()) {
                user.sendMessage(line);
            }

            return;
        }

        // Fallback for unknown subcommand
        user.sendMessage("§cUnknown subcommand. Use:");
        user.sendMessage(" §e/welcomeconfig§7 or §e/welcomeconfig show");
        user.sendMessage(
            " §e/welcomeconfig set <key> <on|off> §7– see valid keys in the help."
        );
    },
    "Configure first-time and normal join messages for the Welcome System."
);
