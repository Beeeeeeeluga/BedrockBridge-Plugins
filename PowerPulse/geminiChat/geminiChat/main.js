/**
 * Gemini AI Chat Plugin - Main Module
 * @version 1.0.0
 * @author BedrockBridge Community
 *
 * Complete integration of Gemini AI Assistant with BedrockBridge
 * Provides chat-based AI interaction for Minecraft players
 */

import { world, system } from "@minecraft/server";
import { bridge, database } from "../../addons";

// Import all plugin modules
import { getConfig, setConfig, initializeConfig, isApiKeyConfigured, resetConfig } from "./config.js";
import {
    getConversation,
    addUserMessage,
    addModelResponse,
    clearConversation,
    getConversationSummary,
    getAllConversationSummaries,
    startCleanupInterval
} from "./conversationManager.js";
import { sendGeminiRequest } from "./httpClient.js";
import * as formatter from "./messageFormatter.js";
import * as uiManager from "./uiManager.js";
import * as discordBridge from "./discordBridge.js";
import * as discordEmbeds from "./discordEmbeds.js";
import * as logger from "./debugLogger.js";

// ==================== INITIALIZATION ====================

// Initialize configuration on server load
world.afterEvents.worldLoad.subscribe(() => {
    logger.info("INIT", "Initializing Gemini AI Chat Plugin v1.0.0");
    logger.debug("INIT", "Loading configuration...");

    initializeConfig();
    startCleanupInterval();

    logger.info("INIT", "Discord bridge initializing...");
    discordBridge.initializeDiscordBridge();

    console.log("================================================");
    console.log("Gemini AI Chat Plugin v1.0.0 initialized");
    console.log("Discord Integration: ✓ Ready");
    console.log("Debug Logging: ✓ Active");
    console.log("================================================");
    logger.info("INIT", "Plugin initialization complete");
    logger.info("INIT", "All systems ready");

    if (!isApiKeyConfigured()) {
        logger.warn("CONFIG", "API key not configured!");
        world.sendMessage(formatter.formatConfigurationWarning());
    } else {
        logger.info("CONFIG", "API key is configured and ready");
        const prefix = getConfig("chatPrefix");
        world.sendMessage(`§a[Gemini] §eReady! Type §f${prefix} <question> §eto chat, or use §f/gemini ui`);
    }
});

// ==================== CHAT HANDLING ====================

// Handle chat messages with the configured prefix
world.afterEvents.chatSend.subscribe(async (event) => {
    const player = event.sender;
    const message = event.message?.trim();

    if (!message) return;

    const prefix = getConfig("chatPrefix", "@g");

    // Check if message starts with the prefix
    if (!message.toLowerCase().startsWith(prefix.toLowerCase())) {
        return;
    }

    // Prevent default chat behavior for Gemini messages
    event.cancel = true;

    // Extract the prompt
    const prompt = message.substring(prefix.length).trim();

    if (!prompt.length) {
        player.sendMessage(formatter.formatHelpMessage(prefix));
        return;
    }

    // Check if API key is configured
    if (!isApiKeyConfigured()) {
        player.sendMessage(formatter.formatConfigurationWarning());
        return;
    }

    // Process the chat request
    await processChatRequest(player, prompt);
});

/**
 * Process a chat request from a player
 * @param {Player} player - The player sending the message
 * @param {string} prompt - The user's prompt
 */
async function processChatRequest(player, prompt) {
    const playerID = player.id;
    const playerName = player.name;
    const operationID = logger.startOperationLog(`chat_request_${playerName}`);

    // Get config values once at the start
    const responsePrefix = getConfig("responsePrefix", "BlockAI");
    const broadcastResponses = getConfig("broadcastResponses", true);

    try {
        logger.debug("CHAT", `Chat request from ${playerName}: ${prompt.substring(0, 50)}...`);

        // Clean and validate input
        const cleanedPrompt = formatter.cleanUserInput(prompt);
        if (!cleanedPrompt) {
            logger.warn("CHAT", `Invalid input from ${playerName}`);
            const invalidMsg = `§c[${responsePrefix}] Invalid input.`;
            if (broadcastResponses) {
                world.sendMessage(invalidMsg);
            } else {
                player.sendMessage(invalidMsg);
            }
            logger.endOperationLog(operationID, "failure", { reason: "Invalid input" });
            return;
        }

        logger.debug("CHAT", `Input cleaned successfully. Length: ${cleanedPrompt.length}`);

        // Show typing indicator
        const typingMsg = `§9§l[${responsePrefix}] §7⏳ Typing...`;
        if (broadcastResponses) {
            world.sendMessage(typingMsg);
        } else {
            player.sendMessage(typingMsg);
        }
        logger.debug("CHAT", `Typing indicator sent to ${broadcastResponses ? "all players" : playerName}`);

        // Get current conversation
        const conversation = getConversation(playerID);
        logger.debug("CONVERSATION", `Retrieved conversation for ${playerName}. Current messages: ${conversation.length}`);

        // Add user message to conversation
        addUserMessage(playerID, cleanedPrompt);
        logger.logConversationOp("add_message", playerID, conversation.length + 1);

        // Get updated conversation with new message
        const updatedConversation = getConversation(playerID);
        logger.debug("CONVERSATION", `Conversation updated. New message count: ${updatedConversation.length}`);

        // Log API request
        logger.debug("API", `Sending request to Gemini API for ${playerName}`);
        const startTime = Date.now();

        // Send request to Gemini API
        const response = await sendGeminiRequest(updatedConversation);
        const responseTime = Date.now() - startTime;

        logger.logPerformance(`API_Response_${playerName}`, responseTime, "ms");

        if (!response.success) {
            // Handle error response
            logger.error("API", `API Error from ${playerName}: ${response.error} (Status: ${response.status})`);
            const errorMsg = `§c[${responsePrefix}] Error${response.status ? ` (${response.status})` : ""}: ${response.error || "Unknown error"}`;

            if (broadcastResponses) {
                world.sendMessage(errorMsg);
            } else {
                player.sendMessage(errorMsg);
            }

            // Send error to Discord if enabled
            if (getConfig("enableDiscordIntegration", true)) {
                logger.debug("DISCORD", `Sending error to Discord for ${playerName}`);
                discordBridge.sendErrorToDiscord(response.error, playerName, response.status);
            }

            logApiUsage(playerID, false);
            logger.endOperationLog(operationID, "failure", { error: response.error, status: response.status });
            return;
        }

        logger.info("API", `Successful API response for ${playerName}. Response length: ${response.text.length}`);

        // Add model response to conversation
        addModelResponse(playerID, response.text);
        logger.logConversationOp("add_response", playerID, updatedConversation.length + 1);

        // Format response with multiline support for long messages
        const formattedMessages = formatter.formatMultilineResponse(response.text, responsePrefix);
        logger.debug("CHAT", `Response formatted into ${formattedMessages.length} part(s) for ${playerName}`);

        // Send to Discord FIRST (before Bedrock messages for proper ordering)
        if (getConfig("enableDiscordIntegration", true)) {
            logger.debug("DISCORD", `Sending response to Discord for ${playerName}`);
            const discordSent = discordBridge.sendGeminiResponseToDiscord(playerName, prompt, response.text);
            if (discordSent) {
                logger.info("DISCORD", `Response sent to Discord successfully`);
                logger.debug("DISCORD", `Embed sent to Discord`);
            } else {
                logger.warn("DISCORD", `Failed to send response to Discord`);
            }
        }

        // Send response in game loop to avoid timing issues (after Discord)
        system.runTimeout(() => {
            // Send each part of the response
            for (const messagePart of formattedMessages) {
                if (broadcastResponses) {
                    // Broadcast to all players in the world
                    world.sendMessage(messagePart);
                    logger.debug("CHAT", `Broadcasted response part to all players`);
                } else {
                    // Send only to the requesting player
                    player.sendMessage(messagePart);
                    logger.debug("CHAT", `Sent response part to ${playerName} only`);
                }
            }
            logger.info("CHAT", `Response sent to ${broadcastResponses ? "all players" : playerName} in ${formattedMessages.length} part(s)`);
        }, 2); // Small delay to ensure proper ordering

        // Log successful request
        logApiUsage(playerID, true);
        logger.info("STATS", `Successful API call from ${playerName}. Total time: ${responseTime}ms`);
        logger.endOperationLog(operationID, "success", { responseTime: responseTime, textLength: response.text.length });

    } catch (error) {
        logger.error("ERROR", `Unexpected error in chat request from ${playerName}: ${error.message}`);
        logger.logErrorWithContext("ChatRequest", error, { playerName: playerName, prompt: prompt });

        const errorMsg = formatter.formatErrorMessage("An unexpected error occurred", null);
        system.run(() => {
            player.sendMessage(errorMsg);
        });

        logApiUsage(playerID, false);
        logger.endOperationLog(operationID, "failure", { error: error.message });
    }
}

// ==================== COMMAND HANDLERS ====================

/**
 * Register the /gemini command for players
 */
bridge.bedrockCommands.registerCommand("gemini", (player, action, ...args) => {
    const actionStr = action ? action.toString().toLowerCase() : "ui";
    logger.logCommand(player.name, `/gemini ${actionStr}`, "executed");
    logger.debug("COMMAND", `Player ${player.name} executed: /gemini ${actionStr}`);

    switch (actionStr) {
        case "ui":
            logger.debug("COMMAND", `Opening UI menu for ${player.name}`);
            system.runTimeout(() => uiManager.showMainMenu(player), 5);
            break;

        case "clear":
            logger.info("COMMAND", `${player.name} cleared conversation history`);
            clearConversation(player.id);
            player.sendMessage(formatter.formatConversationCleared());
            break;

        case "status":
            logger.debug("COMMAND", `Showing status to ${player.name}`);
            showStatus(player);
            break;

        case "help":
            logger.debug("COMMAND", `Showing help to ${player.name}`);
            showHelp(player);
            break;

        case "setkey":
            if (player.isOp()) {
                logger.info("COMMAND", `Admin ${player.name} attempting to set API key`);
                handleSetApiKey(player, args[0]);
            } else {
                logger.warn("COMMAND", `${player.name} attempted to set API key without permission`);
                player.sendMessage("§c[Gemini] You do not have permission to set the API key.");
            }
            break;

        case "reset":
            if (player.isOp()) {
                logger.info("COMMAND", `Admin ${player.name} resetting all settings`);
                handleResetSettings(player);
            } else {
                logger.warn("COMMAND", `${player.name} attempted to reset settings without permission`);
                player.sendMessage("§c[Gemini] You do not have permission to reset settings.");
            }
            break;

        case "debug":
            if (player.isOp()) {
                logger.info("COMMAND", `Admin ${player.name} requested debug info`);
                showDebugInfo(player);
            } else {
                logger.warn("COMMAND", `${player.name} attempted to view debug info without permission`);
                player.sendMessage("§c[Gemini] You do not have permission to view debug info.");
            }
            break;

        default:
            logger.debug("COMMAND", `Unknown command from ${player.name}: ${actionStr}`);
            showHelp(player);
    }
}, "Gemini AI Assistant");

/**
 * Show status information
 * @param {Player} player - The player
 */
function showStatus(player) {
    const apiConfigured = isApiKeyConfigured();
    const prefix = getConfig("chatPrefix");
    const status = apiConfigured ? "§a✓ Configured" : "§c✗ Not configured";

    player.sendMessage(
        `§9[Gemini Status]§r\n` +
        `API Key: ${status}\n` +
        `Chat Prefix: ${prefix}\n` +
        `Temperature: ${getConfig("temperature")}\n` +
        `Max Tokens: ${getConfig("maxTokens")}`
    );
}

/**
 * Show help information
 * @param {Player} player - The player
 */
function showHelp(player) {
    const prefix = getConfig("chatPrefix");
    player.sendMessage(
        `§9[Gemini Help]§r\n` +
        `§eChat:§r ${prefix} <question>\n` +
        `§eUI:§r /gemini ui\n` +
        `§eInfo:§r /gemini status | help\n` +
        `§eConv:§r /gemini clear\n`
    );
}

/**
 * Handle setting the API key
 * @param {Player} player - The player
 * @param {string} apiKey - The API key
 */
function handleSetApiKey(player, apiKey) {
    if (!apiKey) {
        logger.warn("CONFIG", `API key set attempt by ${player.name} with no key provided`);
        player.sendMessage("§c[Gemini] Usage: /gemini setkey <your_api_key>");
        return;
    }

    const oldKey = getConfig("apiKey");
    const newKey = apiKey.toString();

    setConfig("apiKey", newKey);
    logger.logConfigChange("apiKey", oldKey.substring(0, 10) + "...", newKey.substring(0, 10) + "...", player.name);
    logger.info("CONFIG", `API key successfully updated by ${player.name}`);

    player.sendMessage("§a[Gemini] API key has been set successfully!");
    world.sendMessage("§a[Gemini] API is now configured and ready to use.");
}

/**
 * Handle resetting settings
 * @param {Player} player - The player
 */
function handleResetSettings(player) {
    logger.info("CONFIG", `${player.name} reset all settings to defaults`);
    resetConfig();
    logger.info("CONFIG", "All settings reset to defaults successfully");
    player.sendMessage("§a[Gemini] All settings have been reset to defaults.");
}

/**
 * Show debug information (admin only)
 * @param {Player} player - The player
 */
function showDebugInfo(player) {
    logger.debug("DEBUG", `Debug info requested by ${player.name}`);
    const summaries = getAllConversationSummaries();
    const logStats = logger.getLogStats();
    const discordStatus = discordBridge.getDiscordBridgeStatus();

    player.sendMessage("§9[Gemini Debug Info]§r");
    player.sendMessage(`§eActive Conversations: ${summaries.length}`);
    player.sendMessage(`§eTotal Logs: ${logStats.totalEntries}`);
    player.sendMessage(`§eLog Levels: DEBUG: ${logStats.byLevel.DEBUG}, INFO: ${logStats.byLevel.INFO}, WARN: ${logStats.byLevel.WARN}, ERROR: ${logStats.byLevel.ERROR}`);
    player.sendMessage(`§e§lDiscord Bridge:§r`);
    player.sendMessage(`  §echatUpStream: ${discordStatus.chatUpStreamAvailable ? "§a✓ Available" : "§c✗ Unavailable"}`);
    player.sendMessage(`  §echatDownStream: ${discordStatus.chatDownStreamAvailable ? "§a✓ Available" : "§c✗ Unavailable"}`);
    player.sendMessage(`  §ePending Requests: ${discordStatus.pendingRequests}`);
    player.sendMessage(`  §ePending Embeds: ${discordStatus.pendingEmbeds}`);

    if (summaries.length > 0) {
        player.sendMessage(`§9[Conversations]§r`);
        for (const summary of summaries.slice(0, 5)) {
            player.sendMessage(`  §f${summary.playerID.substring(0, 8)}: §e${summary.messageCount} msgs, §f${summary.memoryUsage}`);
        }

        if (summaries.length > 5) {
            player.sendMessage(`  §7... and ${summaries.length - 5} more`);
        }
    }

    logger.info("DEBUG", `Debug info displayed to ${player.name}`);
}

// ==================== USAGE LOGGING ====================

// Database for tracking API usage
const usageDB = database.makeTable("geminiUsage");

/**
 * Log API usage statistics
 * @param {string} playerID - The player's UUID
 * @param {boolean} success - Whether the request was successful
 */
function logApiUsage(playerID, success) {
    try {
        const stats = usageDB.get("stats") || {
            totalRequests: 0,
            successCount: 0,
            errorCount: 0
        };

        stats.totalRequests++;
        if (success) {
            stats.successCount++;
        } else {
            stats.errorCount++;
        }

        usageDB.set("stats", stats);

        // Also track per-player usage
        const playerStats = usageDB.get(`player:${playerID}`) || {
            requests: 0,
            lastUsed: null
        };
        playerStats.requests++;
        playerStats.lastUsed = new Date().toISOString();
        usageDB.set(`player:${playerID}`, playerStats);
    } catch (error) {
        console.error(`Failed to log API usage: ${error.message}`);
    }
}

// ==================== PERIODIC CLEANUP ====================

// Periodically log statistics (every 30 minutes)
system.runInterval(() => {
    try {
        const stats = usageDB.get("stats") || { totalRequests: 0, successCount: 0, errorCount: 0 };
        console.log(`[Gemini Stats] Total: ${stats.totalRequests}, Success: ${stats.successCount}, Errors: ${stats.errorCount}`);
    } catch (error) {
        console.error(`Failed to log statistics: ${error.message}`);
    }
}, 36000); // 30 minutes in ticks

// ==================== EXPORT FOR TESTING ====================

// Export functions for potential testing or extension
export {
    processChatRequest,
    getConversation,
    clearConversation,
    getConversationSummary,
    isApiKeyConfigured,
    getConfig,
    setConfig
};

console.log("Gemini AI Chat Plugin loaded successfully!");
