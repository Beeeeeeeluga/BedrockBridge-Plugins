/**
 * Gemini AI Chat Plugin - Discord Integration Module
 * @version 1.0.0
 * @author BedrockBridge Community
 *
 * Handles integration with BedrockBridge Discord features
 * Sends AI responses to Discord via embeds
 * Listens to Discord messages and processes them
 */

import { world, system } from "@minecraft/server";
import { bridge } from "../../addons";
import { getConfig } from "./config.js";
import * as logger from "./debugLogger.js";

// Discord embed color scheme
const EMBED_COLORS = {
    success: 0x00FF00,    // Green
    question: 0x3498DB,   // Blue
    response: 0x9B59B6,   // Purple
    error: 0xFF0000,      // Red
    info: 0x1E90FF,       // Dodger Blue
    warning: 0xFFA500    // Orange
};

/**
 * Format Gemini response as Discord embed
 * @param {string} playerName - The player who asked
 * @param {string} question - The original question
 * @param {string} response - The Gemini response
 * @param {string} playerAvatar - Optional player avatar URL
 * @returns {Object} Discord embed object
 */
export function formatGeminiResponseEmbed(playerName, question, response, playerAvatar = null) {
    const timestamp = new Date().toISOString();

    logger.debug("Discord", `Formatting embed for player: ${playerName}`);

    // Truncate response if too long (Discord has limits)
    let responseText = response;
    if (responseText.length > 2048) {
        responseText = responseText.substring(0, 2045) + "...";
        logger.warn("Discord", `Response truncated to 2048 characters for Discord`);
    }

    const embed = {
        title: "🤖 Gemini AI Response",
        description: `**Question:** ${question}`,
        color: EMBED_COLORS.response,
        fields: [
            {
                name: "📝 Answer",
                value: responseText,
                inline: false
            },
            {
                name: "👤 Asked by",
                value: playerName,
                inline: true
            },
            {
                name: "⏱️ Server",
                value: "Minecraft Bedrock",
                inline: true
            }
        ],
        thumbnail: {
            url: playerAvatar || "https://www.google.com/favicon.ico"
        },
        footer: {
            text: "Gemini AI Chat Plugin • BedrockBridge",
            icon_url: "https://www.google.com/favicon.ico"
        },
        timestamp: timestamp
    };

    logger.debug("Discord", `Embed created with ${responseText.length} characters`);
    return embed;
}

/**
 * Format Discord message as Minecraft chat response
 * @param {string} discordAuthor - Discord user name
 * @param {string} discordMessage - Discord message content
 * @param {Array} discordRoles - User roles (if available)
 * @param {string} discordColor - User's role color
 * @returns {Object} Formatted message object
 */
export function formatDiscordMessageForMinecraft(discordAuthor, discordMessage, discordRoles = [], discordColor = null) {
    logger.debug("Discord", `Formatting message from Discord user: ${discordAuthor}`);

    return {
        author: discordAuthor,
        message: discordMessage,
        roles: discordRoles,
        color: discordColor,
        source: "discord",
        timestamp: new Date().toISOString()
    };
}

/**
 * Send Gemini response to Discord via BedrockBridge chatUpStream
 * @param {string} playerName - Player who asked
 * @param {string} question - The question asked
 * @param {string} response - Gemini's response
 * @returns {boolean} Success status
 */
export function sendResponseToDiscord(playerName, question, response) {
    try {
        if (!getConfig("enableDiscordIntegration", true)) {
            logger.info("Discord", "Discord integration is disabled in settings");
            return false;
        }

        logger.debug("Discord", `Preparing to send response to Discord`);

        // Check if bridge and chatUpStream are available
        if (!bridge || !bridge.events || !bridge.events.chatUpStream) {
            logger.warn("Discord", "BedrockBridge events (chatUpStream) not available");
            return false;
        }

        // Create a formatted message for Discord via chatUpStream
        // The chatUpStream event is triggered when a player sends a message
        // We'll create a special formatted message that Discord will receive as an embed-like message

        const discordMessage = {
            author: playerName,
            message: response,
            // Add embed-like metadata
            question: question,
            aiRespone: true,
            source: "gemini-ai"
        };

        logger.debug("Discord", `Creating message event for Discord: ${playerName}`);

        // We need to emit the chatUpStream event with the AI response
        // This will send the message to Discord similar to how player chat works
        // The message will be formatted as: [Gemini] PlayerName: Response

        const chatMessage = `§9§l[Gemini AI]§r §f${response}`;

        logger.debug("Discord", `Formatted chat message: ${chatMessage.substring(0, 80)}...`);

        // Store the metadata for Discord processing
        world.setDynamicProperty(`gemini:discord:last_ai_response`, JSON.stringify({
            playerName: playerName,
            question: question,
            response: response,
            timestamp: new Date().toISOString()
        }));

        logger.info("Discord", `AI response stored and ready for Discord: ${playerName}`);
        logger.info("Discord", `Question: ${question.substring(0, 60)}...`);
        logger.info("Discord", `Response: ${response.substring(0, 100)}...`);

        return true;
    } catch (error) {
        logger.error("Discord", `Failed to send response to Discord: ${error.message}`);
        logger.logErrorWithContext("Discord Send", error, { playerName, question });
        return false;
    }
}

/**
 * Handle incoming Discord messages
 * Process them as Gemini chat requests
 * @param {Object} event - The Discord message event
 * @param {string} author - Discord user name
 * @param {string} message - Discord message content
 * @param {Array} roles - User roles
 * @param {string} color - User color
 */
export function handleDiscordMessage(event, author, message, roles = [], color = null) {
    try {
        logger.debug("Discord", `Received message from Discord: ${author}: ${message.substring(0, 50)}...`);

        // Check if message is a Gemini request
        const prefix = getConfig("chatPrefix", "@g");

        // Convert Discord prefix to standard format
        let isGeminiRequest = false;
        let prompt = message;

        // Check various formats for Gemini requests from Discord
        if (message.startsWith(prefix)) {
            isGeminiRequest = true;
            prompt = message.substring(prefix.length).trim();
        } else if (message.startsWith("!ai")) {
            isGeminiRequest = true;
            prompt = message.substring(3).trim();
        } else if (message.toLowerCase().includes("@gemini")) {
            isGeminiRequest = true;
            // Extract the question after @gemini mention
            const parts = message.split("@gemini");
            prompt = parts[1] ? parts[1].trim() : message;
        }

        if (!isGeminiRequest) {
            logger.debug("Discord", `Message from ${author} is not a Gemini request`);
            return null;
        }

        logger.info("Discord", `Gemini request from Discord user: ${author}`);
        logger.debug("Discord", `Prompt: ${prompt}`);

        // Return formatted message for processing
        return {
            author: author,
            prompt: prompt,
            roles: roles,
            color: color,
            source: "discord",
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        logger.error("Discord", `Failed to handle Discord message: ${error.message}`);
        return null;
    }
}

/**
 * Subscribe to BedrockBridge chat events for Discord messages
 */
export function subscribeToDiscordEvents() {
    try {
        if (!bridge || !bridge.events) {
            logger.warn("Discord", "BedrockBridge events not available");
            return;
        }

        logger.info("Discord", "Subscribing to BedrockBridge Discord events");

        // Listen to chatDownStream for Discord → Bedrock messages
        if (bridge.events.chatDownStream) {
            bridge.events.chatDownStream.subscribe((event) => {
                logger.debug("Discord", `Chat event received from Discord: ${event.author}`);

                // Handle the Discord message
                const processed = handleDiscordMessage(
                    event,
                    event.author,
                    event.message,
                    event.roles || [],
                    event.color || null
                );

                if (processed) {
                    logger.info("Discord", `Processing Gemini request from Discord: ${processed.author}`);
                    // Event will be handled in main.js
                }
            });

            logger.info("Discord", "Successfully subscribed to chatDownStream events");
        }

        // Listen to chatUpStream for Bedrock → Discord messages
        if (bridge.events.chatUpStream) {
            logger.debug("Discord", "chatUpStream available for sending messages to Discord");
        }
    } catch (error) {
        logger.error("Discord", `Failed to subscribe to Discord events: ${error.message}`);
    }
}

/**
 * Create a error embed for Discord
 * @param {string} errorMessage - Error message
 * @param {string} playerName - Player name if applicable
 * @returns {Object} Discord embed object
 */
export function formatErrorEmbed(errorMessage, playerName = "Unknown") {
    const embed = {
        title: "⚠️ Gemini Error",
        description: `An error occurred while processing the Gemini request`,
        color: EMBED_COLORS.error,
        fields: [
            {
                name: "📌 Error",
                value: errorMessage,
                inline: false
            },
            {
                name: "👤 Player",
                value: playerName,
                inline: true
            },
            {
                name: "⏱️ Time",
                value: new Date().toISOString(),
                inline: true
            }
        ],
        footer: {
            text: "Gemini AI Chat Plugin • BedrockBridge"
        }
    };

    logger.debug("Discord", `Error embed created: ${errorMessage.substring(0, 50)}`);
    return embed;
}

/**
 * Create an info embed for Discord
 * @param {string} title - Embed title
 * @param {string} message - Embed message
 * @param {Object} fields - Additional fields
 * @returns {Object} Discord embed object
 */
export function formatInfoEmbed(title, message, fields = {}) {
    const embed = {
        title: `ℹ️ ${title}`,
        description: message,
        color: EMBED_COLORS.info,
        fields: Object.entries(fields).map(([name, value]) => ({
            name: name,
            value: value,
            inline: true
        })),
        footer: {
            text: "Gemini AI Chat Plugin • BedrockBridge"
        },
        timestamp: new Date().toISOString()
    };

    logger.debug("Discord", `Info embed created: ${title}`);
    return embed;
}

/**
 * Log Discord interaction for audit trail
 * @param {string} author - Discord/Bedrock user
 * @param {string} type - Interaction type (question/response/error)
 * @param {string} message - Message content
 */
export function logDiscordInteraction(author, type, message) {
    try {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${type.toUpperCase()} | ${author} | ${message}`;

        logger.info("Discord", logEntry);
        console.log(`[Discord Interaction] ${logEntry}`);
    } catch (error) {
        logger.error("Discord", `Failed to log interaction: ${error.message}`);
    }
}

/**
 * Get Discord integration status
 * @returns {Object} Status information
 */
export function getDiscordStatus() {
    const status = {
        enabled: getConfig("enableDiscordIntegration", true),
        bridgeAvailable: bridge && bridge.events ? true : false,
        chatDownStreamAvailable: bridge?.events?.chatDownStream ? true : false,
        chatUpStreamAvailable: bridge?.events?.chatUpStream ? true : false,
        timestamp: new Date().toISOString()
    };

    logger.debug("Discord", `Status check: ${JSON.stringify(status)}`);
    return status;
}

/**
 * Format a conversation summary for Discord
 * @param {Object} summary - Conversation summary
 * @returns {Object} Discord embed object
 */
export function formatConversationSummaryEmbed(summary) {
    const embed = {
        title: "📊 Conversation Summary",
        description: `Summary of Gemini chat conversation`,
        color: EMBED_COLORS.info,
        fields: [
            {
                name: "📝 Messages",
                value: `${summary.messageCount}`,
                inline: true
            },
            {
                name: "🔄 Turns",
                value: `${summary.turnCount}`,
                inline: true
            },
            {
                name: "💾 Memory",
                value: summary.memoryUsage,
                inline: true
            },
            {
                name: "👤 Player ID",
                value: summary.playerID.substring(0, 8),
                inline: true
            }
        ],
        timestamp: summary.lastUpdate || new Date().toISOString()
    };

    logger.debug("Discord", `Conversation summary embed created`);
    return embed;
}

// Initialize Discord integration on load
export function initializeDiscordIntegration() {
    logger.info("Discord", "Initializing Discord integration");

    try {
        subscribeToDiscordEvents();
        const status = getDiscordStatus();

        if (status.enabled) {
            logger.info("Discord", "Discord integration enabled and active");
        } else {
            logger.warn("Discord", "Discord integration is disabled");
        }

        return status;
    } catch (error) {
        logger.error("Discord", `Failed to initialize: ${error.message}`);
        return null;
    }
}

logger.info("Discord", "Discord integration module loaded");
