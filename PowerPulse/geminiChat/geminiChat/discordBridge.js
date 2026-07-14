/**
 * Gemini AI Chat Plugin - Discord Bridge Module
 * @version 1.0.0
 * @author BedrockBridge Community
 *
 * Proper integration with BedrockBridge's Discord system via chatUpStream
 * This module handles the actual communication with Discord through BedrockBridge
 */

import { world, system } from "@minecraft/server";
import { bridge } from "../../addons";
import { bridgeDirect } from "../../BridgeDirect.js";
import * as logger from "./debugLogger.js";
import * as embeds from "./discordEmbeds.js";

/**
 * Initialize Discord bridge connections
 * Subscribe to BedrockBridge chat events
 */
export function initializeDiscordBridge() {
    logger.info("DiscordBridge", "Initializing Discord Bridge");

    try {
        // Subscribe to chatUpStream to send Bedrock messages to Discord
        if (bridge && bridge.events && bridge.events.chatUpStream) {
            logger.debug("DiscordBridge", "Subscribing to chatUpStream events");

            bridge.events.chatUpStream.subscribe((event, player) => {
                logger.debug("DiscordBridge", `ChatUpStream event from ${player?.name || "Unknown"}`);
                // This event allows us to modify how Bedrock chat appears on Discord
            });

            logger.info("DiscordBridge", "Successfully subscribed to chatUpStream");
        } else {
            logger.warn("DiscordBridge", "chatUpStream not available");
        }

        // Subscribe to chatDownStream to receive Discord messages
        if (bridge && bridge.events && bridge.events.chatDownStream) {
            logger.debug("DiscordBridge", "Subscribing to chatDownStream events");

            bridge.events.chatDownStream.subscribe((event) => {
                logger.debug("DiscordBridge", `ChatDownStream event from ${event.author}`);
                // This allows us to process Discord messages in Bedrock

                // Check if this is a Gemini request from Discord
                if (event.message && isGeminiRequest(event.message)) {
                    logger.info("DiscordBridge", `Gemini request from Discord: ${event.author}`);
                    handleDiscordGeminiRequest(event);
                }
            });

            logger.info("DiscordBridge", "Successfully subscribed to chatDownStream");
        } else {
            logger.warn("DiscordBridge", "chatDownStream not available");
        }

    } catch (error) {
        logger.error("DiscordBridge", `Failed to initialize: ${error.message}`);
        logger.logErrorWithContext("DiscordBridge Init", error, {});
    }
}

/**
 * Check if a message is a Gemini request
 * @param {string} message - The message to check
 * @returns {boolean} True if it's a Gemini request
 */
function isGeminiRequest(message) {
    const prefixes = ["@gemini", "!ai", "!gemini", "/gemini"];

    for (const prefix of prefixes) {
        if (message.toLowerCase().startsWith(prefix.toLowerCase())) {
            logger.debug("DiscordBridge", `Gemini request detected with prefix: ${prefix}`);
            return true;
        }
    }

    return false;
}

/**
 * Handle a Gemini request from Discord
 * @param {Object} event - The chatDownStream event
 */
function handleDiscordGeminiRequest(event) {
    logger.info("DiscordBridge", `Processing Discord Gemini request from ${event.author}`);

    try {
        // Extract the prompt from the message
        let prompt = event.message;

        // Remove the trigger prefix
        const prefixes = ["@gemini", "!ai", "!gemini", "/gemini"];
        for (const prefix of prefixes) {
            if (prompt.toLowerCase().startsWith(prefix.toLowerCase())) {
                prompt = prompt.substring(prefix.length).trim();
                break;
            }
        }

        if (!prompt) {
            logger.warn("DiscordBridge", `Empty prompt from Discord user ${event.author}`);
            return;
        }

        logger.debug("DiscordBridge", `Discord prompt: ${prompt.substring(0, 80)}`);

        // Store the Discord request for main.js to process
        const requestKey = `gemini:discord_request:${Date.now()}`;
        world.setDynamicProperty(requestKey, JSON.stringify({
            author: event.author,
            prompt: prompt,
            roles: event.roles || [],
            color: event.color || null,
            timestamp: new Date().toISOString()
        }));

        logger.info("DiscordBridge", `Discord request stored: ${requestKey}`);

    } catch (error) {
        logger.error("DiscordBridge", `Failed to handle Discord request: ${error.message}`);
        logger.logErrorWithContext("DiscordBridge Handle", error, { author: event.author });
    }
}

/**
 * Send a Gemini response to Discord via BridgeDirect
 * @param {string} playerName - The player's name
 * @param {string} question - The original question
 * @param {string} response - The Gemini response
 * @returns {boolean} Success status
 */
export function sendGeminiResponseToDiscord(playerName, question, response) {
    logger.info("DiscordBridge", `Sending Gemini response to Discord from ${playerName}`);

    try {
        // Create the beautiful response embed
        const embed = embeds.createGeminiResponseEmbed(playerName, question, response);

        // Check if BridgeDirect is ready
        if (bridgeDirect && bridgeDirect.ready) {
            logger.debug("DiscordBridge", `BridgeDirect ready, sending embed directly`);

            // Send the embed directly to Discord
            bridgeDirect.sendEmbed(embed, playerName, "https://www.google.com/favicon.ico");

            logger.info("DiscordBridge", `Response embed sent to Discord successfully from ${playerName}`);
            logger.debug("DiscordBridge", `Question: ${question.substring(0, 80)}...`);
            logger.debug("DiscordBridge", `Response: ${response.substring(0, 80)}...`);
            return true;
        } else {
            logger.warn("DiscordBridge", `BridgeDirect not ready yet, attempting fallback`);

            // Fallback: try to send via embeds module
            const embedSent = embeds.sendGeminiResponseEmbed(playerName, question, response);

            if (embedSent) {
                logger.info("DiscordBridge", `Response sent via fallback method`);
                return true;
            } else {
                logger.warn("DiscordBridge", `All send methods failed`);
                return false;
            }
        }

    } catch (error) {
        logger.error("DiscordBridge", `Failed to send response: ${error.message}`);
        logger.logErrorWithContext("DiscordBridge Send", error, { playerName, question });
        return false;
    }
}

/**
 * Send an error message to Discord
 * @param {string} errorMessage - The error message
 * @param {string} playerName - The player's name
 * @param {number} statusCode - HTTP status code if applicable
 * @returns {boolean} Success status
 */
export function sendErrorToDiscord(errorMessage, playerName = "Unknown", statusCode = null) {
    logger.warn("DiscordBridge", `Sending error to Discord: ${errorMessage.substring(0, 60)}...`);

    try {
        // Create the error embed
        const embed = embeds.createErrorEmbed(errorMessage, playerName, statusCode);

        // Check if BridgeDirect is ready
        if (bridgeDirect && bridgeDirect.ready) {
            logger.debug("DiscordBridge", `BridgeDirect ready, sending error embed directly`);

            // Send the error embed directly to Discord
            bridgeDirect.sendEmbed(embed, "Gemini Error", "https://www.google.com/favicon.ico");

            logger.info("DiscordBridge", `Error embed sent to Discord successfully`);
            return true;
        } else {
            logger.warn("DiscordBridge", `BridgeDirect not ready, attempting fallback`);

            // Fallback: try to send via embeds module
            const embedSent = embeds.sendErrorEmbed(errorMessage, playerName, statusCode);

            return embedSent;
        }

    } catch (error) {
        logger.error("DiscordBridge", `Failed to send error: ${error.message}`);
        return false;
    }
}

/**
 * Send a status update to Discord
 * @param {Object} statusInfo - Status information
 * @returns {boolean} Success status
 */
export function sendStatusToDiscord(statusInfo) {
    logger.info("DiscordBridge", `Sending status update to Discord`);

    try {
        // Create the status embed
        const embed = embeds.createStatusEmbed(statusInfo);

        // Check if BridgeDirect is ready
        if (bridgeDirect && bridgeDirect.ready) {
            logger.debug("DiscordBridge", `BridgeDirect ready, sending status embed directly`);

            // Send the status embed directly to Discord
            bridgeDirect.sendEmbed(embed, "Gemini Status", "https://www.google.com/favicon.ico");

            logger.info("DiscordBridge", `Status embed sent to Discord successfully`);
            return true;
        } else {
            logger.warn("DiscordBridge", `BridgeDirect not ready, attempting fallback`);

            // Fallback: try to send via embeds module
            const embedSent = embeds.sendEmbedToDiscord(embed, "Gemini Status");

            return embedSent;
        }

    } catch (error) {
        logger.error("DiscordBridge", `Failed to send status: ${error.message}`);
        return false;
    }
}

/**
 * Get pending Discord requests
 * @returns {Array} Array of pending requests
 */
export function getPendingDiscordRequests() {
    try {
        const requests = [];
        let index = 0;

        while (true) {
            const key = `gemini:discord_request:${index}`;
            const data = world.getDynamicProperty(key);

            if (!data) break;

            try {
                requests.push(JSON.parse(data));
            } catch (e) {
                logger.warn("DiscordBridge", `Failed to parse request ${key}`);
            }

            index++;
        }

        logger.debug("DiscordBridge", `Found ${requests.length} pending requests`);
        return requests;
    } catch (error) {
        logger.error("DiscordBridge", `Failed to get pending requests: ${error.message}`);
        return [];
    }
}

/**
 * Clear a specific Discord request
 * @param {number} timestamp - Request timestamp
 */
export function clearDiscordRequest(timestamp) {
    try {
        const key = `gemini:discord_request:${timestamp}`;
        world.setDynamicProperty(key, undefined);
        logger.debug("DiscordBridge", `Cleared request: ${key}`);
    } catch (error) {
        logger.error("DiscordBridge", `Failed to clear request: ${error.message}`);
    }
}

/**
 * Get Discord bridge status
 * @returns {Object} Status information
 */
export function getDiscordBridgeStatus() {
    const status = {
        chatUpStreamAvailable: bridge?.events?.chatUpStream ? true : false,
        chatDownStreamAvailable: bridge?.events?.chatDownStream ? true : false,
        pendingRequests: getPendingDiscordRequests().length,
        pendingEmbeds: embeds.getPendingEmbeds().length,
        timestamp: new Date().toISOString()
    };

    logger.debug("DiscordBridge", `Status: ${JSON.stringify(status)}`);
    return status;
}

logger.info("DiscordBridge", "Discord Bridge module loaded");
