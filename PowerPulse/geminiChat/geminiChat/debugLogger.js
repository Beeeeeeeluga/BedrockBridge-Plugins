/**
 * Gemini AI Chat Plugin - Debug Logger Module
 * @version 1.0.0
 * @author BedrockBridge Community
 *
 * Comprehensive logging system for debugging and audit trails
 * All operations are logged with timestamps and categories
 */

import { world } from "@minecraft/server";

// Log levels
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

// Current log level (can be adjusted)
let currentLogLevel = LOG_LEVELS.DEBUG;

// Log storage for in-game access
const logBuffer = [];
const MAX_LOG_ENTRIES = 1000;

/**
 * Format log message with timestamp and category
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param {string} category - Log category
 * @param {string} message - Log message
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, category, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${category}] ${message}`;
}

/**
 * Add log entry to buffer
 * @param {string} level - Log level
 * @param {string} category - Category
 * @param {string} message - Message
 */
function addToBuffer(level, category, message) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: level,
        category: category,
        message: message
    };

    logBuffer.push(logEntry);

    // Keep buffer size manageable
    if (logBuffer.length > MAX_LOG_ENTRIES) {
        logBuffer.shift();
    }
}

/**
 * Log debug message
 * @param {string} category - Log category
 * @param {string} message - Log message
 */
export function debug(category, message) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
        const formatted = formatLogMessage("DEBUG", category, message);
        console.log(formatted);
        addToBuffer("DEBUG", category, message);
    }
}

/**
 * Log info message
 * @param {string} category - Log category
 * @param {string} message - Log message
 */
export function info(category, message) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
        const formatted = formatLogMessage("INFO", category, message);
        console.log(formatted);
        addToBuffer("INFO", category, message);
    }
}

/**
 * Log warning message
 * @param {string} category - Log category
 * @param {string} message - Log message
 */
export function warn(category, message) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
        const formatted = formatLogMessage("WARN", category, message);
        console.warn(formatted);
        addToBuffer("WARN", category, message);
    }
}

/**
 * Log error message
 * @param {string} category - Log category
 * @param {string} message - Log message
 */
export function error(category, message) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
        const formatted = formatLogMessage("ERROR", category, message);
        console.error(formatted);
        addToBuffer("ERROR", category, message);
    }
}

/**
 * Log API request with full details
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} payload - Request payload
 * @param {number} attempt - Attempt number
 */
export function logApiRequest(endpoint, method, payload, attempt = 1) {
    const message = `${method} ${endpoint} (Attempt ${attempt}) - Payload: ${JSON.stringify(payload).substring(0, 100)}...`;
    debug("API", message);
}

/**
 * Log API response with status and content
 * @param {number} status - HTTP status code
 * @param {string} endpoint - API endpoint
 * @param {string} responseText - Response text
 */
export function logApiResponse(status, endpoint, responseText) {
    const message = `${status} ${endpoint} - Response: ${responseText.substring(0, 100)}...`;
    if (status === 200) {
        info("API", message);
    } else {
        warn("API", message);
    }
}

/**
 * Log chat message
 * @param {string} playerName - Player name
 * @param {string} message - Chat message
 * @param {string} source - Source (bedrock/discord)
 */
export function logChatMessage(playerName, message, source = "bedrock") {
    const formatted = `${source.toUpperCase()} | ${playerName}: ${message.substring(0, 80)}...`;
    info("CHAT", formatted);
}

/**
 * Log conversation operation
 * @param {string} operation - Operation type (create, update, clear)
 * @param {string} playerID - Player ID
 * @param {number} messageCount - Message count
 */
export function logConversationOp(operation, playerID, messageCount) {
    const message = `${operation.toUpperCase()} | Player: ${playerID.substring(0, 8)} | Messages: ${messageCount}`;
    debug("CONVERSATION", message);
}

/**
 * Log command execution
 * @param {string} playerName - Player name
 * @param {string} command - Command executed
 * @param {string} result - Command result (success/failure)
 */
export function logCommand(playerName, command, result = "success") {
    const message = `${playerName} executed: ${command} (${result})`;
    info("COMMAND", message);
}

/**
 * Log configuration change
 * @param {string} key - Config key
 * @param {string} oldValue - Old value
 * @param {string} newValue - New value
 * @param {string} author - Admin who changed it
 */
export function logConfigChange(key, oldValue, newValue, author = "system") {
    const message = `${author} changed ${key}: ${oldValue} → ${newValue}`;
    warn("CONFIG", message);
}

/**
 * Log performance metric
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {string} unit - Unit (ms, KB, etc)
 */
export function logPerformance(metric, value, unit = "ms") {
    const message = `${metric}: ${value}${unit}`;
    debug("PERFORMANCE", message);
}

/**
 * Log error with full context
 * @param {string} context - Error context
 * @param {Error} errorObj - Error object
 * @param {Object} additionalInfo - Additional context
 */
export function logErrorWithContext(context, errorObj, additionalInfo = {}) {
    const message = `${context} | Error: ${errorObj.message} | Stack: ${errorObj.stack ? errorObj.stack.substring(0, 100) : 'N/A'}`;
    error("ERROR", message);

    if (Object.keys(additionalInfo).length > 0) {
        debug("ERROR_CONTEXT", JSON.stringify(additionalInfo));
    }
}

/**
 * Get all logs from buffer
 * @param {string} category - Filter by category (optional)
 * @param {string} level - Filter by level (optional)
 * @returns {Array} Log entries
 */
export function getLogs(category = null, level = null) {
    let filtered = logBuffer;

    if (category) {
        filtered = filtered.filter(log => log.category === category);
    }

    if (level) {
        filtered = filtered.filter(log => log.level === level);
    }

    return filtered;
}

/**
 * Get recent logs
 * @param {number} count - Number of recent logs to get
 * @returns {Array} Recent log entries
 */
export function getRecentLogs(count = 50) {
    return logBuffer.slice(Math.max(0, logBuffer.length - count));
}

/**
 * Get log statistics
 * @returns {Object} Statistics object
 */
export function getLogStats() {
    const stats = {
        totalEntries: logBuffer.length,
        byLevel: {
            DEBUG: 0,
            INFO: 0,
            WARN: 0,
            ERROR: 0
        },
        byCategory: {},
        oldestEntry: logBuffer.length > 0 ? logBuffer[0].timestamp : null,
        newestEntry: logBuffer.length > 0 ? logBuffer[logBuffer.length - 1].timestamp : null
    };

    for (const log of logBuffer) {
        stats.byLevel[log.level]++;

        if (!stats.byCategory[log.category]) {
            stats.byCategory[log.category] = 0;
        }
        stats.byCategory[log.category]++;
    }

    return stats;
}

/**
 * Clear log buffer
 */
export function clearLogs() {
    logBuffer.length = 0;
    info("LOGGER", "Log buffer cleared");
}

/**
 * Set current log level
 * @param {number} level - Log level (0-3)
 */
export function setLogLevel(level) {
    if (level >= 0 && level <= 3) {
        currentLogLevel = level;
        info("LOGGER", `Log level set to: ${Object.keys(LOG_LEVELS)[level]}`);
    }
}

/**
 * Get current log level
 * @returns {string} Current log level
 */
export function getLogLevel() {
    return Object.keys(LOG_LEVELS)[currentLogLevel];
}

/**
 * Export logs as formatted string
 * @param {string} category - Filter by category (optional)
 * @returns {string} Formatted log string
 */
export function exportLogsAsString(category = null) {
    let logs = getLogs(category);
    return logs.map(log => {
        return `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message}`;
    }).join("\n");
}

/**
 * Log startup banner
 */
export function logStartupBanner() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  GEMINI AI CHAT PLUGIN v1.0.0");
    console.log("  Debug Logger Initialized");
    console.log("═══════════════════════════════════════════════════════════");
    info("LOGGER", "Debug logger initialized and ready");
}

/**
 * Log shutdown banner
 */
export function logShutdownBanner() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  GEMINI AI CHAT PLUGIN");
    console.log("  Debug Logger Shutdown");
    info("LOGGER", "Debug logger shutdown");
    const stats = getLogStats();
    console.log(`  Total logs: ${stats.totalEntries}`);
    console.log("═══════════════════════════════════════════════════════════");
}

/**
 * Create a detailed operation log
 * @param {string} operation - Operation name
 * @param {Object} details - Operation details
 * @returns {string} Operation log ID
 */
export function startOperationLog(operation) {
    const logId = `${operation}_${Date.now()}`;
    debug("OPERATION", `START: ${operation} (ID: ${logId})`);
    return logId;
}

/**
 * End operation log
 * @param {string} logId - Log ID from startOperationLog
 * @param {string} result - Result (success/failure)
 * @param {Object} details - Result details
 */
export function endOperationLog(logId, result = "success", details = {}) {
    const message = `END: ${logId} (${result}) | Details: ${JSON.stringify(details)}`;
    if (result === "success") {
        info("OPERATION", message);
    } else {
        warn("OPERATION", message);
    }
}

// Initialize logger
logStartupBanner();

export const LOG_LEVELS_ENUM = LOG_LEVELS;
