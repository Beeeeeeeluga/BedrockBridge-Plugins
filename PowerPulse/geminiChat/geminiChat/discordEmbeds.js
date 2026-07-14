/**
 * Gemini AI Chat Plugin - Discord Embeds Module
 * @version 1.0.0
 * @author BedrockBridge Community
 *
 * Creates beautiful Discord embeds using BedrockBridge's native embed system
 * Embeds are sent via the bridge.events system for proper Discord integration
 */

import { world, system } from "@minecraft/server";
import { bridge } from "../../addons";
import { bridgeDirect } from "../../BridgeDirect.js";
import * as logger from "./debugLogger.js";

// Discord embed colors (as decimal values)
const EMBED_COLORS = {
    success: 3066993,      // Green (#2ECC71)
    response: 9807270,     // Purple (#9B59B6)
    error: 15158332,       // Red (#E74C3C)
    info: 3447003,         // Blue (#3498DB)
    warning: 16776960,     // Yellow (#FFFF00)
    gemini: 10181046       // Google Blue (#9AA0A6)
};

/**
 * Create a beautiful Gemini response embed
 * @param {string} playerName - The player who asked
 * @param {string} question - The original question
 * @param {string} response - The Gemini response
 * @returns {Object} Discord embed object (BedrockBridge format)
 */
export function createGeminiResponseEmbed(playerName, question, response) {
    logger.debug("Embeds", `Creating Gemini response embed for ${playerName}`);

    // Truncate response if too long (Discord limit)
    let responseText = response;
    if (responseText.length > 2048) {
        responseText = responseText.substring(0, 2045) + "...";
        logger.warn("Embeds", `Response truncated to 2048 chars for Discord`);
    }

    // Truncate question if too long
    let questionText = question;
    if (questionText.length > 1024) {
        questionText = questionText.substring(0, 1021) + "...";
    }

    const embed = {
        title: "🤖 Gemini AI Response",
        description: "",
        color: EMBED_COLORS.response,
        fields: [
            {
                name: "❓ Question",
                value: questionText,
                inline: false
            },
            {
                name: "💬 Answer",
                value: responseText,
                inline: false
            },
            {
                name: "👤 Player",
                value: playerName,
                inline: true
            },
            {
                name: "🌍 Server",
                value: "Minecraft Bedrock",
                inline: true
            }
        ],
        thumbnail: {
            url: "https://www.google.com/favicon.ico",
            height: 256,
            width: 256
        },
        footer: {
            text: "Gemini AI Chat Plugin • BedrockBridge",
            icon_url: "https://www.google.com/favicon.ico"
        },
        timestamp: new Date().toISOString()
    };

    logger.debug("Embeds", `Embed created successfully (${responseText.length} chars)`);
    return embed;
}

/**
 * Create an error embed for Discord
 * @param {string} errorMessage - The error message
 * @param {string} playerName - Optional player name
 * @param {number} statusCode - Optional HTTP status code
 * @returns {Object} Discord embed object
 */
export function createErrorEmbed(errorMessage, playerName = "Unknown", statusCode = null) {
    logger.debug("Embeds", `Creating error embed: ${errorMessage.substring(0, 50)}`);

    const embed = {
        title: "⚠️ Gemini AI Error",
        description: "An error occurred while processing your request",
        color: EMBED_COLORS.error,
        fields: [
            {
                name: "📌 Error",
                value: errorMessage || "Unknown error",
                inline: false
            },
            {
                name: "👤 Player",
                value: playerName,
                inline: true
            }
        ],
        footer: {
            text: "Gemini AI Chat Plugin • BedrockBridge"
        },
        timestamp: new Date().toISOString()
    };

    if (statusCode) {
        embed.fields.push({
            name: "🔢 Status Code",
            value: statusCode.toString(),
            inline: true
        });
    }

    return embed;
}

/**
 * Create an info embed for Discord
 * @param {string} title - Embed title
 * @param {string} message - Main message
 * @param {Object} fields - Additional fields
 * @returns {Object} Discord embed object
 */
export function createInfoEmbed(title, message, fields = {}) {
    logger.debug("Embeds", `Creating info embed: ${title}`);

    const embed = {
        title: `ℹ️ ${title}`,
        description: message,
        color: EMBED_COLORS.info,
        fields: Object.entries(fields).map(([key, value]) => ({
            name: key,
            value: value.toString(),
            inline: true
        })),
        footer: {
            text: "Gemini AI Chat Plugin • BedrockBridge"
        },
        timestamp: new Date().toISOString()
    };

    return embed;
}

/**
 * Create a conversation summary embed
 * @param {Object} summary - Conversation summary object
 * @returns {Object} Discord embed object
 */
export function createConversationSummaryEmbed(summary) {
    logger.debug("Embeds", `Creating conversation summary embed`);

    const embed = {
        title: "📊 Conversation Summary",
        description: `Summary for player: ${summary.playerID.substring(0, 8)}`,
        color: EMBED_COLORS.info,
        fields: [
            {
                name: "📝 Total Messages",
                value: summary.messageCount.toString(),
                inline: true
            },
            {
                name: "🔄 Turns",
                value: summary.turnCount.toString(),
                inline: true
            },
            {
                name: "💾 Memory Usage",
                value: summary.memoryUsage,
                inline: true
            },
            {
                name: "⏰ Last Updated",
                value: summary.lastUpdate || "N/A",
                inline: false
            }
        ],
        footer: {
            text: "Gemini AI Chat Plugin • BedrockBridge"
        },
        timestamp: new Date().toISOString()
    };

    return embed;
}

/**
 * Create a status embed for Discord
 * @param {Object} statusInfo - Status information
 * @returns {Object} Discord embed object
 */
export function createStatusEmbed(statusInfo) {
    logger.debug("Embeds", `Creating status embed`);

    const statusColor = statusInfo.apiKeyConfigured ? EMBED_COLORS.success : EMBED_COLORS.warning;

    const embed = {
        title: "🔧 Gemini AI Plugin Status",
        description: "Current system status and configuration",
        color: statusColor,
        fields: [
            {
                name: "🔑 API Key Configured",
                value: statusInfo.apiKeyConfigured ? "✅ Yes" : "❌ No",
                inline: true
            },
            {
                name: "🌐 API Endpoint",
                value: statusInfo.apiEndpoint ? "✅ Valid" : "❌ Invalid",
                inline: true
            },
            {
                name: "💾 Active Conversations",
                value: statusInfo.activeConversations?.toString() || "0",
                inline: true
            },
            {
                name: "📊 Total Logs",
                value: statusInfo.totalLogs?.toString() || "0",
                inline: true
            },
            {
                name: "🔄 Discord Integration",
                value: statusInfo.discordEnabled ? "✅ Enabled" : "❌ Disabled",
                inline: true
            },
            {
                name: "⌚ Last Updated",
                value: new Date().toLocaleTimeString(),
                inline: true
            }
        ],
        footer: {
            text: "Gemini AI Chat Plugin • BedrockBridge"
        },
        timestamp: new Date().toISOString()
    };

    return embed;
}

/**
 * Send an embed to Discord via BridgeDirect
 * Uses the proper BedrockBridge API to send embeds directly to Discord
 * @param {Object} embed - Discord embed object (Discord API format)
 * @param {string} playerName - Name to show as sender
 * @returns {boolean} Success status
 */
export function sendEmbedToDiscord(embed, playerName = "Gemini AI") {
    try {
        logger.debug("Embeds", `Sending embed to Discord as ${playerName}`);

        // Check if BridgeDirect is ready
        if (!bridgeDirect || !bridgeDirect.ready) {
            logger.warn("Embeds", "BridgeDirect not ready - embed queued for later");
            // Store as fallback
            const embedKey = `gemini:embed:${Date.now()}`;
            world.setDynamicProperty(embedKey, JSON.stringify(embed));
            return false;
        }

        // Send embed directly to Discord using BridgeDirect API
        bridgeDirect.sendEmbed(embed, playerName, "https://www.google.com/favicon.ico");

        logger.info("Embeds", `Embed successfully sent to Discord as ${playerName}`);
        return true;
    } catch (error) {
        logger.error("Embeds", `Failed to send embed: ${error.message}`);

        // Fallback: store in world properties
        try {
            const embedKey = `gemini:embed:fallback:${Date.now()}`;
            world.setDynamicProperty(embedKey, JSON.stringify(embed));
            logger.warn("Embeds", `Embed stored as fallback at ${embedKey}`);
        } catch (fallbackError) {
            logger.error("Embeds", `Failed to store fallback embed: ${fallbackError.message}`);
        }

        return false;
    }
}

/**
 * Create and send a complete Gemini response embed
 * @param {string} playerName - Player name
 * @param {string} question - The question
 * @param {string} response - The response
 * @returns {boolean} Success status
 */
export function sendGeminiResponseEmbed(playerName, question, response) {
    try {
        logger.debug("Embeds", `Processing Gemini response embed for ${playerName}`);

        const embed = createGeminiResponseEmbed(playerName, question, response);
        const success = sendEmbedToDiscord(embed, playerName);

        if (success) {
            logger.info("Embeds", `Gemini response embed sent to Discord`);
            logger.debug("Embeds", `Q: ${question.substring(0, 50)}...`);
            logger.debug("Embeds", `A: ${response.substring(0, 50)}...`);
        }

        return success;
    } catch (error) {
        logger.error("Embeds", `Failed to send Gemini response embed: ${error.message}`);
        return false;
    }
}

/**
 * Send an error embed to Discord
 * @param {string} errorMessage - Error message
 * @param {string} playerName - Player name
 * @param {number} statusCode - HTTP status code
 * @returns {boolean} Success status
 */
export function sendErrorEmbed(errorMessage, playerName = "Unknown", statusCode = null) {
    try {
        logger.debug("Embeds", `Processing error embed: ${errorMessage.substring(0, 50)}`);

        const embed = createErrorEmbed(errorMessage, playerName, statusCode);
        const success = sendEmbedToDiscord(embed, "Gemini Error");

        if (success) {
            logger.info("Embeds", `Error embed sent to Discord`);
        }

        return success;
    } catch (error) {
        logger.error("Embeds", `Failed to send error embed: ${error.message}`);
        return false;
    }
}

/**
 * Get all pending embeds
 * @returns {Array} Array of pending embeds
 */
export function getPendingEmbeds() {
    try {
        const embeds = [];
        let index = 0;

        // Scan for stored embeds
        while (true) {
            const embedKey = `gemini:embed:${index}`;
            const embed = world.getDynamicProperty(embedKey);

            if (!embed) break;

            embeds.push(JSON.parse(embed));
            index++;
        }

        logger.debug("Embeds", `Found ${embeds.length} pending embeds`);
        return embeds;
    } catch (error) {
        logger.error("Embeds", `Failed to get pending embeds: ${error.message}`);
        return [];
    }
}

/**
 * Clear all pending embeds
 */
export function clearPendingEmbeds() {
    try {
        let cleared = 0;
        let index = 0;

        while (true) {
            const embedKey = `gemini:embed:${index}`;
            const embed = world.getDynamicProperty(embedKey);

            if (!embed) break;

            world.setDynamicProperty(embedKey, undefined);
            cleared++;
            index++;
        }

        logger.info("Embeds", `Cleared ${cleared} pending embeds`);
    } catch (error) {
        logger.error("Embeds", `Failed to clear pending embeds: ${error.message}`);
    }
}

logger.info("Embeds", "Discord Embeds module loaded");
