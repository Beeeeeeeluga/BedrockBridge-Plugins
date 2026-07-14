/**
 * Gemini AI Chat Plugin - HTTP Client Module
 * @version 1.0.0
 * @author BedrockBridge Community
 *
 * Handles HTTP requests to Gemini API with error handling and retry logic
 */

import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "@minecraft/server-net";
import { getConfig, getApiEndpoint, getRequestConfig } from "./config.js";

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Send a request to the Gemini API
 * @param {Array} conversationHistory - The conversation history including new message
 * @returns {Promise<Object>} Response object with status, text, and error details
 */
export async function sendGeminiRequest(conversationHistory) {
    // Validate API key first
    if (!validateApiKey()) {
        return {
            success: false,
            error: "API key not configured",
            status: 401,
            text: null
        };
    }

    // Build the request payload
    const payload = buildPayload(conversationHistory);

    // Try the request with retries
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`Gemini API request attempt ${attempt}/${MAX_RETRIES}`);

            const response = await sendRequest(payload);

            if (response.success) {
                return response;
            }

            // If it's a retry-able error and we have retries left, wait and retry
            if (isRetryable(response.status) && attempt < MAX_RETRIES) {
                const delayMs = RETRY_DELAY_MS * attempt; // Exponential backoff
                console.log(`Retrying Gemini request after ${delayMs}ms...`);
                await delay(delayMs);
                continue;
            }

            // Non-retryable error or last attempt
            return response;
        } catch (error) {
            console.error(`Gemini API request error (attempt ${attempt}): ${error.message}`);

            if (attempt < MAX_RETRIES) {
                const delayMs = RETRY_DELAY_MS * attempt;
                console.log(`Retrying after ${delayMs}ms...`);
                await delay(delayMs);
                continue;
            }

            return {
                success: false,
                error: error.message,
                status: 0,
                text: null
            };
        }
    }

    return {
        success: false,
        error: "Max retries exceeded",
        status: 0,
        text: null
    };
}

/**
 * Send the actual HTTP request
 * @private
 * @param {Object} payload - The request payload
 * @returns {Promise<Object>} Response object
 */
async function sendRequest(payload) {
    const apiUrl = getApiEndpoint();

    // Create HTTP request
    const request = new HttpRequest(apiUrl);
    request.method = HttpRequestMethod.Post;
    request.body = JSON.stringify(payload);
    request.headers = [new HttpHeader("Content-Type", "application/json")];

    // Send request
    const response = await http.request(request);

    // Parse response
    return parseResponse(response);
}

/**
 * Parse HTTP response and extract AI response text
 * @private
 * @param {Object} response - The HTTP response object
 * @returns {Object} Parsed response
 */
function parseResponse(response) {
    // Check for HTTP errors
    if (response.status !== 200) {
        let errorMessage = "Unknown error";

        try {
            const errorJson = JSON.parse(response.body);
            errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
        } catch {
            errorMessage = response.body || `HTTP ${response.status}`;
        }

        return {
            success: false,
            error: errorMessage,
            status: response.status,
            text: null
        };
    }

    // Parse success response
    try {
        const json = JSON.parse(response.body);

        console.log("[Gemini Response Debug] Full Response:", JSON.stringify(json).substring(0, 500));

        // Try multiple paths to find the response text
        let text = null;

        // Primary path: candidates[0].content.parts[0].text
        if (json?.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = json.candidates[0].content.parts[0].text;
            console.log("[Gemini Response] Found via primary path: candidates[0].content.parts[0].text");
        }
        // Alternative path: result.candidates[0].content.parts[0].text
        else if (json?.result?.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = json.result.candidates[0].content.parts[0].text;
            console.log("[Gemini Response] Found via alternative path: result.candidates[0]");
        }
        // Fallback: Check if response itself is the text
        else if (typeof json === 'string') {
            text = json;
            console.log("[Gemini Response] Found as direct string");
        }
        // Check for error in response
        else if (json?.error) {
            const errorMsg = json.error?.message || JSON.stringify(json.error);
            console.error("[Gemini Response] API returned error:", errorMsg);
            return {
                success: false,
                error: errorMsg,
                status: 200,
                text: null
            };
        }

        if (!text || text.trim().length === 0) {
            console.warn("[Gemini Response] Empty response detected. Full JSON:", JSON.stringify(json).substring(0, 1000));
            return {
                success: false,
                error: "Empty or invalid response from Gemini API",
                status: 200,
                text: null,
                debugInfo: json
            };
        }

        const trimmedText = text.trim();
        console.log("[Gemini Response] Successfully extracted text:", trimmedText.substring(0, 100) + "...");

        return {
            success: true,
            error: null,
            status: 200,
            text: trimmedText
        };
    } catch (error) {
        console.error("[Gemini Response Parse Error]", error.message);
        console.error("[Gemini Response Body]", response.body?.substring(0, 500));

        return {
            success: false,
            error: `Failed to parse API response: ${error.message}`,
            status: 200,
            text: null,
            rawBody: response.body?.substring(0, 500)
        };
    }
}

/**
 * Build the API request payload
 * @private
 * @param {Array} conversationHistory - The conversation history
 * @returns {Object} The request payload
 */
function buildPayload(conversationHistory) {
    const config = getRequestConfig();

    return {
        contents: conversationHistory,
        generationConfig: {
            maxOutputTokens: config.maxTokens,
            temperature: config.temperature,
            topP: config.topP,
            topK: config.topK
        },
        tools: [{ googleSearch: {} }],
        systemInstruction: {
            role: "system",
            parts: [{ text: config.systemPrompt }]
        }
    };
}

/**
 * Validate that API key is configured
 * @private
 * @returns {boolean} True if API key is configured
 */
function validateApiKey() {
    const apiKey = getConfig("apiKey");
    return apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE";
}

/**
 * Check if an HTTP error is retryable
 * @private
 * @param {number} status - HTTP status code
 * @returns {boolean} True if the error is retryable
 */
function isRetryable(status) {
    // Retry on server errors (5xx) and rate limit (429)
    return status >= 500 || status === 429 || status === 408;
}

/**
 * Simple delay utility
 * @private
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get API status (for diagnostics)
 * @returns {Promise<Object>} Status information
 */
export async function getApiStatus() {
    return {
        apiKeyConfigured: validateApiKey(),
        apiEndpoint: getApiEndpoint(),
        timestamp: new Date().toISOString()
    };
}
