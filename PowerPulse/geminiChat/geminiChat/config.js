/**
 * Gemini AI Chat Plugin - Configuration Module
 * @version 1.0.0
 * @author BedrockBridge Community
 *
 * Manages all configuration settings for the Gemini AI Chat plugin
 */

import { world } from "@minecraft/server";

// Default configuration constants
const DEFAULTS = {
    apiKey: "yourapikey",
    modelName: "gemini-flash-latest",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    chatPrefix: "@g",
    responsePrefix: "BedrockBridgeAI",
    broadcastResponses: true,
    maxTokens: 500,
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    conversationHistoryLimit: 20,
    conversationTimeoutMinutes: 30,
    enableDiscordIntegration: true,
    enableCommandLog: false,
    systemPrompt: "You are a friendly Minecraft Bedrock Server Edition AI Assistant named BedrockBridgeAI. Keep answers short and helpful. Don't use emojis, rather use emoticons, and you can talk about any topic even if it's not related to Minecraft."
};

// Get configuration from world dynamic properties
export function getConfig(key, defaultValue = null) {
    const storedValue = world.getDynamicProperty(`gemini:config:${key}`);
    if (storedValue !== undefined) {
        return storedValue;
    }
    return defaultValue !== null ? defaultValue : DEFAULTS[key];
}

// Set configuration in world dynamic properties
export function setConfig(key, value) {
    if (typeof value === "object") {
        world.setDynamicProperty(`gemini:config:${key}`, JSON.stringify(value));
    } else {
        world.setDynamicProperty(`gemini:config:${key}`, value);
    }
}

// Initialize default configuration if not already set
export function initializeConfig() {
    for (const [key, value] of Object.entries(DEFAULTS)) {
        if (world.getDynamicProperty(`gemini:config:${key}`) === undefined) {
            setConfig(key, value);
        }
    }
}

// Validate API key is configured
export function isApiKeyConfigured() {
    const apiKey = getConfig("apiKey");
    return apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE";
}

// Get the full API endpoint URL
export function getApiEndpoint() {
    const modelName = getConfig("modelName");
    const apiKey = getConfig("apiKey");
    return `${getConfig("apiUrl")}/${modelName}:generateContent?key=${apiKey}`;
}

// Get configuration object for API requests
export function getRequestConfig() {
    return {
        maxTokens: getConfig("maxTokens"),
        temperature: getConfig("temperature"),
        topP: getConfig("topP"),
        topK: getConfig("topK"),
        systemPrompt: getConfig("systemPrompt")
    };
}

// Reset configuration to defaults
export function resetConfig() {
    for (const key of Object.keys(DEFAULTS)) {
        setConfig(key, DEFAULTS[key]);
    }
    console.log("Gemini plugin configuration reset to defaults.");
}

// Export defaults for reference
export const CONFIG_DEFAULTS = DEFAULTS;
