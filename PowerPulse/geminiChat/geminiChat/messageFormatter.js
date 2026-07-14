/**
 * Gemini AI Chat Plugin - Message Formatter Module
 * @version 1.0.0
 * @author BedrockBridge Community
 *
 * Handles message formatting for Minecraft chat and Discord integration
 */

/**
 * Format AI response for Minecraft chat
 * @param {string} responseText - The raw response text from Gemini
 * @returns {string} Formatted message for Minecraft
 */
export function formatResponseForMinecraft(responseText) {
    if (!responseText) {
        return "§c[Gemini] Error: No response received.";
    }

    // Clean up response text
    let formatted = responseText.trim();

    // Limit length to fit in Minecraft chat (max ~256 characters per line)
    const maxLength = 256;
    if (formatted.length > maxLength) {
        // Try to break at a word boundary
        let truncated = formatted.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(" ");
        if (lastSpace > maxLength - 50) {
            truncated = formatted.substring(0, lastSpace);
        }
        formatted = truncated + "...";
    }

    // Apply Minecraft formatting
    return `§9§l[Gemini] §r§f${formatted}`;
}

/**
 * Format typing indicator message
 * @returns {string} Typing indicator message
 */
export function formatTypingIndicator() {
    return "§9§l[Gemini] §7⏳ Typing...";
}

/**
 * Format error message
 * @param {string} errorMessage - The error message
 * @param {number} statusCode - HTTP status code if applicable
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(errorMessage, statusCode = null) {
    let message = errorMessage || "Unknown error";

    // Limit error message length
    if (message.length > 100) {
        message = message.substring(0, 97) + "...";
    }

    if (statusCode) {
        return `§c[Gemini] Error (${statusCode}): ${message}`;
    }

    return `§c[Gemini] Error: ${message}`;
}

/**
 * Format configuration warning
 * @returns {string} Configuration warning message
 */
export function formatConfigurationWarning() {
    return "§4[Gemini] §cERROR: API key not configured. Please set it using: §f/setgeminikey <your_key>";
}

/**
 * Format chat mode indicator
 * @param {string} mode - The chat mode
 * @returns {string} Formatted mode message
 */
export function formatChatModeIndicator(mode) {
    return `§a[Gemini] §eChat mode: ${mode}`;
}

/**
 * Format conversation cleared message
 * @returns {string} Conversation cleared message
 */
export function formatConversationCleared() {
    return "§a[Gemini] §eConversation history cleared.";
}

/**
 * Format conversation summary message
 * @param {Object} summary - The conversation summary
 * @returns {string} Formatted summary
 */
export function formatConversationSummary(summary) {
    return `§9[Gemini] §rConversation: ${summary.messageCount} messages, ${summary.turnCount} turns`;
}

/**
 * Format multi-line response for Minecraft
 * Breaks long responses into multiple chat messages
 * @param {string} responseText - The response text
 * @param {string} customPrefix - Custom prefix name (optional, defaults to "BlockAI")
 * @returns {Array<string>} Array of formatted messages
 */
export function formatMultilineResponse(responseText, customPrefix = "BlockAI") {
    if (!responseText) {
        return [`§c[${customPrefix}] Error: No response received.`];
    }

    const messages = [];
    const maxLength = 320; // Minecraft chat character limit is around 320-340

    // First message with prefix
    const firstPrefix = `§9§l[${customPrefix}] §r§f`;
    // Continuation messages without full prefix (cleaner)
    const contPrefix = "§f";

    // Clean and split text
    let text = responseText.trim();
    let messageIndex = 0;

    while (text.length > 0) {
        let currentMessage = "";
        const prefix = messageIndex === 0 ? firstPrefix : contPrefix;

        // Available space considering prefix
        const prefixLength = messageIndex === 0 ? firstPrefix.length : contPrefix.length;
        const availableSpace = maxLength - prefixLength;

        if (text.length <= availableSpace) {
            // Remaining text fits in one message
            currentMessage = prefix + text;
            text = "";
        } else {
            // Need to split at word boundary
            let tryText = text.substring(0, availableSpace);

            // Try to break at last space
            const lastSpace = tryText.lastIndexOf(" ");
            if (lastSpace > availableSpace - 100) {
                // Found a good space break point
                const messagePart = text.substring(0, lastSpace).trim();
                currentMessage = prefix + messagePart;
                text = text.substring(lastSpace).trim();
            } else {
                // No good break point, just cut at character limit
                currentMessage = prefix + tryText.trim();
                text = text.substring(availableSpace).trim();
            }
        }

        if (currentMessage.trim().length > firstPrefix.length) {
            messages.push(currentMessage);
            messageIndex++;
        } else {
            break;
        }

        // Safety check to prevent infinite loops
        if (messageIndex > 50) {
            messages.push("§c[Gemini] Message too long, truncated");
            break;
        }
    }

    return messages.length > 0 ? messages : ["§c[Gemini] Error: Empty response."];
}

/**
 * Clean user input message
 * @param {string} userMessage - The raw user message
 * @returns {string} Cleaned message
 */
export function cleanUserInput(userMessage) {
    if (!userMessage) {
        return "";
    }

    // Trim whitespace
    let cleaned = userMessage.trim();

    // Remove potential command injection
    cleaned = cleaned.replace(/^\//, "");

    // Limit length
    const maxLength = 500;
    if (cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength);
    }

    return cleaned;
}

/**
 * Format usage statistics message
 * @param {Object} stats - Usage statistics
 * @returns {string} Formatted statistics
 */
export function formatUsageStats(stats) {
    return `§9[Gemini] §rTotal requests: ${stats.totalRequests}, Success: ${stats.successCount}, Errors: ${stats.errorCount}`;
}

/**
 * Create a help message
 * @param {string} prefix - The chat command prefix
 * @returns {string} Formatted help message
 */
export function formatHelpMessage(prefix) {
    return `§9[Gemini] §eUsage: §f${prefix} <your question>\n§9[Gemini] §eExample: §f${prefix} How do I make a crafting table?`;
}

/**
 * Format command response
 * @param {string} command - The command name
 * @param {string} message - The response message
 * @returns {string} Formatted command response
 */
export function formatCommandResponse(command, message) {
    return `§9[Gemini] §r${message}`;
}
