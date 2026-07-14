/**
 * Gemini AI Chat Plugin - Conversation Manager Module
 * @version 1.0.0
 * @author BedrockBridge Community
 *
 * Manages conversation history per player with persistence and cleanup
 */

import { world, system } from "@minecraft/server";
import { getConfig } from "./config.js";

// In-memory storage for active conversations
const activeConversations = new Map();

// Conversation cleanup interval (in ticks) - 5 minutes
const CLEANUP_INTERVAL = 6000;

/**
 * Get or create a conversation for a player
 * @param {string} playerID - The player's UUID
 * @returns {Array} Conversation history array
 */
export function getConversation(playerID) {
    if (!activeConversations.has(playerID)) {
        const conversation = loadConversationFromStorage(playerID);
        activeConversations.set(playerID, conversation);
    }
    return activeConversations.get(playerID);
}

/**
 * Add a user message to the conversation
 * @param {string} playerID - The player's UUID
 * @param {string} prompt - The user's message
 * @returns {Array} Updated conversation history
 */
export function addUserMessage(playerID, prompt) {
    const conversation = getConversation(playerID);
    conversation.push({
        role: "user",
        parts: [{ text: prompt }]
    });

    // Trim conversation history if it exceeds limit
    const historyLimit = getConfig("conversationHistoryLimit", 20);
    if (conversation.length > historyLimit) {
        conversation.splice(0, conversation.length - historyLimit);
    }

    saveConversationToStorage(playerID, conversation);
    return conversation;
}

/**
 * Add a model response to the conversation
 * @param {string} playerID - The player's UUID
 * @param {string} response - The AI's response
 * @returns {Array} Updated conversation history
 */
export function addModelResponse(playerID, response) {
    const conversation = getConversation(playerID);
    conversation.push({
        role: "model",
        parts: [{ text: response }]
    });

    // Trim conversation history if it exceeds limit
    const historyLimit = getConfig("conversationHistoryLimit", 20);
    if (conversation.length > historyLimit) {
        conversation.splice(0, conversation.length - historyLimit);
    }

    saveConversationToStorage(playerID, conversation);
    return conversation;
}

/**
 * Clear a player's conversation
 * @param {string} playerID - The player's UUID
 */
export function clearConversation(playerID) {
    activeConversations.delete(playerID);
    world.setDynamicProperty(`gemini:conversation:${playerID}`, undefined);
}

/**
 * Get conversation summary for debugging
 * @param {string} playerID - The player's UUID
 * @returns {Object} Conversation summary
 */
export function getConversationSummary(playerID) {
    const conversation = getConversation(playerID);
    return {
        playerID: playerID,
        messageCount: conversation.length,
        turnCount: Math.floor(conversation.length / 2),
        lastUpdate: world.getDynamicProperty(`gemini:conversation:${playerID}:timestamp`),
        memoryUsage: JSON.stringify(conversation).length + " bytes"
    };
}

/**
 * Save conversation to persistent storage
 * @private
 * @param {string} playerID - The player's UUID
 * @param {Array} conversation - The conversation history
 */
function saveConversationToStorage(playerID, conversation) {
    try {
        // Store as JSON string in dynamic properties
        const conversationJSON = JSON.stringify(conversation);

        // Check size limit (Minecraft has a limit on dynamic property sizes)
        if (conversationJSON.length > 30000) {
            console.warn(`Conversation for player ${playerID} exceeds size limit. Trimming...`);
            // Keep only last 5 exchanges
            const trimmed = conversation.slice(Math.max(0, conversation.length - 10));
            world.setDynamicProperty(`gemini:conversation:${playerID}`, JSON.stringify(trimmed));
        } else {
            world.setDynamicProperty(`gemini:conversation:${playerID}`, conversationJSON);
        }

        // Update timestamp
        world.setDynamicProperty(`gemini:conversation:${playerID}:timestamp`, Date.now());
    } catch (error) {
        console.error(`Failed to save conversation for player ${playerID}: ${error.message}`);
    }
}

/**
 * Load conversation from persistent storage
 * @private
 * @param {string} playerID - The player's UUID
 * @returns {Array} Conversation history
 */
function loadConversationFromStorage(playerID) {
    try {
        const stored = world.getDynamicProperty(`gemini:conversation:${playerID}`);
        const timestamp = world.getDynamicProperty(`gemini:conversation:${playerID}:timestamp`);

        if (!stored) {
            return [];
        }

        // Check if conversation has timed out
        const timeoutMinutes = getConfig("conversationTimeoutMinutes", 30);
        if (timestamp && (Date.now() - timestamp) > (timeoutMinutes * 60 * 1000)) {
            console.log(`Conversation for player ${playerID} timed out. Clearing...`);
            world.setDynamicProperty(`gemini:conversation:${playerID}`, undefined);
            world.setDynamicProperty(`gemini:conversation:${playerID}:timestamp`, undefined);
            return [];
        }

        return JSON.parse(stored);
    } catch (error) {
        console.error(`Failed to load conversation for player ${playerID}: ${error.message}`);
        return [];
    }
}

/**
 * Periodic cleanup of expired conversations
 * @private
 */
function cleanupExpiredConversations() {
    try {
        const timeoutMinutes = getConfig("conversationTimeoutMinutes", 30);
        const timeoutMs = timeoutMinutes * 60 * 1000;
        const now = Date.now();

        // Check all stored conversations
        for (const playerID of activeConversations.keys()) {
            const timestamp = world.getDynamicProperty(`gemini:conversation:${playerID}:timestamp`);

            if (timestamp && (now - timestamp) > timeoutMs) {
                clearConversation(playerID);
                console.log(`Cleaned up expired conversation for player ${playerID}`);
            }
        }
    } catch (error) {
        console.error(`Error during conversation cleanup: ${error.message}`);
    }
}

/**
 * Start the cleanup interval
 * @private
 */
export function startCleanupInterval() {
    system.runInterval(() => {
        cleanupExpiredConversations();
    }, CLEANUP_INTERVAL);
}

/**
 * Get all active conversations (for admin purposes)
 * @returns {Array} Array of conversation summaries
 */
export function getAllConversationSummaries() {
    const summaries = [];
    for (const playerID of activeConversations.keys()) {
        summaries.push(getConversationSummary(playerID));
    }
    return summaries;
}
