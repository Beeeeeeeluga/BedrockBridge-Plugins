/**
 * Gemini AI Chat Plugin - Configuration Examples
 * @version 1.0.0
 *
 * This file shows example configurations for different use cases.
 * Copy and modify the sections below to suit your needs.
 */

// ==================== PRESET CONFIGURATIONS ====================

/**
 * PRESET 1: Default Configuration
 * - Balanced settings
 * - Suitable for most use cases
 * - Good for both factual and creative questions
 */
const DEFAULT_CONFIG = {
    apiKey: "YOUR_GEMINI_API_KEY_HERE",
    modelName: "gemini-flash-latest",
    chatPrefix: "@g",
    maxTokens: 500,
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    conversationHistoryLimit: 20,
    conversationTimeoutMinutes: 30,
    systemPrompt: "You are a friendly Minecraft AI Assistant named Gemini. Keep answers short and helpful. Don't use emojis, rather use emoticons, and you can talk about any topic even if it's not related to Minecraft."
};

/**
 * PRESET 2: Factual Mode
 * - Low temperature for consistent answers
 * - Suitable for tutorials and guides
 * - Focus on accuracy
 */
const FACTUAL_CONFIG = {
    ...DEFAULT_CONFIG,
    temperature: 0.3,
    maxTokens: 400,
    systemPrompt: "You are a factual Minecraft expert. Provide accurate, helpful information based on Minecraft game mechanics. Be precise and avoid speculation. Keep answers concise and under 200 words."
};

/**
 * PRESET 3: Creative Mode
 * - High temperature for varied answers
 * - Suitable for creative building and storytelling
 * - More imaginative responses
 */
const CREATIVE_CONFIG = {
    ...DEFAULT_CONFIG,
    temperature: 1.2,
    maxTokens: 700,
    systemPrompt: "You are a creative Minecraft storyteller and builder. Help players with imaginative building ideas, stories, and creative concepts. Be enthusiastic and inspiring. You can discuss fantasy elements and creative interpretations of Minecraft."
};

/**
 * PRESET 4: Tutor Mode
 * - Educational focus
 * - Longer, detailed responses
 * - Teaching-oriented
 */
const TUTOR_CONFIG = {
    ...DEFAULT_CONFIG,
    temperature: 0.5,
    maxTokens: 1000,
    conversationHistoryLimit: 10,
    systemPrompt: "You are a patient Minecraft tutor. Explain concepts step-by-step. Help players learn by asking guiding questions when appropriate. Provide detailed examples and encourage learning. Adapt to the player's skill level."
};

/**
 * PRESET 5: Fast Mode
 * - Quick responses
 * - Lower token limit
 * - Good for rapid-fire questions
 */
const FAST_CONFIG = {
    ...DEFAULT_CONFIG,
    temperature: 0.6,
    maxTokens: 250,
    conversationHistoryLimit: 10,
    conversationTimeoutMinutes: 15,
    systemPrompt: "You are a quick-response Minecraft assistant. Provide brief, direct answers. Keep responses under 100 words. Perfect for rapid questions during gameplay."
};

/**
 * PRESET 6: Detailed Mode
 * - Comprehensive responses
 * - Higher token limit
 * - Full explanations
 */
const DETAILED_CONFIG = {
    ...DEFAULT_CONFIG,
    temperature: 0.8,
    maxTokens: 1500,
    conversationHistoryLimit: 30,
    systemPrompt: "You are a comprehensive Minecraft guide. Provide detailed, thorough explanations. Include multiple approaches, pros/cons analysis, and related information. Help players understand the 'why' behind things."
};

// ==================== CONFIGURATION EXAMPLES ====================

/**
 * Example 1: Setting up for a Minecraft Server
 *
 * Usage:
 * 1. Get API key from https://aistudio.google.com/
 * 2. In-game: /gemini setkey YOUR_KEY
 * 3. Configure: /gemini ui → Settings
 */
const SERVER_EXAMPLE = {
    description: "Complete server setup",
    steps: [
        "1. Get API key from Google AI Studio",
        "2. Use: /gemini setkey YOUR_API_KEY",
        "3. Chat prefix: @g",
        "4. Temperature: 0.7 (balanced)",
        "5. Max tokens: 500 (good for chat)",
        "6. History limit: 20 (remembers context)"
    ]
};

/**
 * Example 2: Custom Chat Prefix
 *
 * Change from @g to something else
 */
const CUSTOM_PREFIX_EXAMPLE = {
    description: "Using custom chat prefix",
    example: {
        chatPrefix: "!ai",  // Chat format: !ai What is redstone?
        chatPrefix: "?",    // Chat format: ? How to mine diamonds?
        chatPrefix: "gemini", // Chat format: gemini What's next?
    },
    notes: "Change via UI: Settings → (future prefix setting)"
};

/**
 * Example 3: Building Guide Tutor
 *
 * Specialized for helping with building
 */
const BUILDING_TUTOR = {
    description: "Optimized for teaching building",
    config: {
        ...TUTOR_CONFIG,
        chatPrefix: "!build",
        systemPrompt: "You are a Minecraft building tutor. Help players learn to design and build structures. Explain principles of design, symmetry, and aesthetics. Suggest techniques and materials. Be encouraging."
    }
};

/**
 * Example 4: Redstone Expert
 *
 * Specialized for Redstone mechanics
 */
const REDSTONE_EXPERT = {
    description: "Optimized for Redstone help",
    config: {
        ...FACTUAL_CONFIG,
        chatPrefix: "!redstone",
        maxTokens: 600,
        systemPrompt: "You are a Redstone expert in Minecraft. Explain complex Redstone mechanics clearly. Help with logic gates, timing, and device designs. Provide step-by-step instructions. Be precise about timing and materials."
    }
};

/**
 * Example 5: Low Resource Mode
 *
 * For servers with API quota concerns
 */
const LOW_RESOURCE_MODE = {
    description: "Minimal API usage",
    config: {
        temperature: 0.5,
        maxTokens: 200,
        conversationHistoryLimit: 5,
        conversationTimeoutMinutes: 10,
        chatPrefix: "@g"
    },
    note: "Shorter responses, smaller history, faster API usage"
};

/**
 * Example 6: Community Server Setup
 *
 * For large multiplayer servers
 */
const COMMUNITY_SERVER = {
    description: "Settings for busy servers",
    config: {
        temperature: 0.6,
        maxTokens: 400,
        conversationHistoryLimit: 15,
        conversationTimeoutMinutes: 20,
        chatPrefix: "!ai",
        enableDiscordIntegration: true
    },
    notes: [
        "Moderate token usage",
        "Discord integration for logging",
        "Reasonable history for context",
        "Custom prefix to avoid conflicts"
    ]
};

// ==================== TEMPERATURE GUIDE ====================

/**
 * Temperature Settings Explained:
 *
 * Temperature controls randomness/creativity in responses
 * Range: 0.0 - 2.0
 *
 * 0.0 - 0.3: Deterministic
 *   - Same question → same answer
 *   - Best for: Facts, tutorials, programming
 *   - Use case: "What is the crafting recipe for..."
 *
 * 0.4 - 0.7: Balanced (DEFAULT: 0.7)
 *   - Mixture of consistency and variety
 *   - Best for: General questions
 *   - Use case: Most in-game chatting
 *
 * 0.8 - 1.2: Creative
 *   - More varied, creative responses
 *   - Best for: Building ideas, stories
 *   - Use case: "Ideas for a cool castle design"
 *
 * 1.3 - 2.0: Very Creative
 *   - High randomness, unpredictable
 *   - Best for: Creative writing, roleplay
 *   - Use case: Story generation, fun interactions
 */
const TEMPERATURE_GUIDE = {
    "0.1": "Factual answers - Math, recipes, mechanics",
    "0.3": "Tutorials - Step by step guides",
    "0.5": "Balanced facts - Good for learning",
    "0.7": "General chat - RECOMMENDED DEFAULT",
    "0.9": "More creative - Building ideas",
    "1.2": "Very creative - Storytelling",
    "1.5": "Max creativity - Wild ideas"
};

// ==================== TOKEN USAGE GUIDE ====================

/**
 * Max Tokens Settings:
 *
 * Tokens ≈ Words (rough estimate: 1 token ≈ 0.75 words)
 *
 * 100 - 200 tokens:
 *   - 75-150 words
 *   - Quick answers
 *   - Use for: Fast responses during gameplay
 *
 * 300 - 500 tokens: (DEFAULT: 500)
 *   - 225-375 words
 *   - Normal answers
 *   - Use for: Regular chat
 *
 * 600 - 1000 tokens:
 *   - 450-750 words
 *   - Detailed answers
 *   - Use for: Comprehensive guides
 *
 * 1000+ tokens:
 *   - 750+ words
 *   - Very detailed
 *   - Use for: Complex tutorials
 */
const TOKEN_GUIDE = {
    "150": "Quick facts - 'What is...?'",
    "300": "Short explanations",
    "500": "Standard responses (RECOMMENDED)",
    "700": "Detailed explanations",
    "1000": "Comprehensive guides",
    "1500": "Very detailed with examples"
};

// ==================== SYSTEM PROMPT EXAMPLES ====================

/**
 * Different system prompts for different personalities
 */
const SYSTEM_PROMPTS = {
    friendly: "You are a friendly Minecraft AI Assistant named Gemini. Keep answers short and helpful. Don't use emojis, rather use emoticons, and you can talk about any topic.",

    expert: "You are a Minecraft expert with deep knowledge of all game mechanics. Provide accurate, detailed information. Be thorough but concise.",

    teacher: "You are a patient teacher. Explain concepts step-by-step. Ask clarifying questions when needed. Help learners understand fundamentals before advanced topics.",

    builder: "You are a creative building assistant. Help with architectural designs, aesthetic choices, and construction techniques. Be enthusiastic about creative projects.",

    redstone: "You are a Redstone specialist. Explain logic, timing, and mechanisms clearly. Help with complex device designs.",

    adventure: "You are an adventure guide. Help players with exploration, survival tips, and adventure planning. Be encouraging and exciting.",

    brief: "You are a brief response assistant. Answer in 1-2 sentences maximum. Be direct and concise.",

    roleplay: "You are a Minecraft NPC character. Stay in character while being helpful. Add personality and flavor to responses."
};

// ==================== COMMAND EXAMPLES ====================

/**
 * Example Commands for Different Setups
 */
const COMMAND_EXAMPLES = {
    basic: [
        "/gemini setkey AIzaSy...",
        "@g How do I make a crafting table?",
        "/gemini ui",
        "/gemini clear"
    ],

    admin: [
        "/gemini setkey YOUR_API_KEY",
        "/gemini reset",
        "/gemini debug",
        "/gemini status"
    ],

    customPrefix: [
        "Config chatPrefix to '!ai'",
        "Then use: !ai How to tame a wolf?",
        "Or: !ai What is the best farm design?"
    ]
};

// ==================== OPTIMIZATION TIPS ====================

/**
 * Performance Optimization Recommendations
 */
const OPTIMIZATION_TIPS = {
    "lowMemory": {
        description: "If server has limited memory",
        config: {
            conversationHistoryLimit: 5,
            conversationTimeoutMinutes: 10,
            maxTokens: 300
        }
    },

    "lowBandwidth": {
        description: "If API quota is limited",
        config: {
            maxTokens: 250,
            conversationHistoryLimit: 8,
            temperature: 0.4
        }
    },

    "highPerformance": {
        description: "If you want instant responses",
        config: {
            maxTokens: 200,
            temperature: 0.3,
            conversationHistoryLimit: 5
        }
    },

    "bestQuality": {
        description: "If you want comprehensive responses",
        config: {
            maxTokens: 1000,
            temperature: 0.7,
            conversationHistoryLimit: 30
        }
    }
};

// ==================== COMMON ISSUES & SOLUTIONS ====================

/**
 * Troubleshooting configurations
 */
const TROUBLESHOOTING = {
    "responses_too_short": {
        problem: "Responses are too brief",
        solution: "Increase maxTokens to 700-1000",
        config: { maxTokens: 800 }
    },

    "responses_too_long": {
        problem: "Responses are too verbose",
        solution: "Decrease maxTokens to 200-300",
        config: { maxTokens: 300 }
    },

    "repetitive_answers": {
        problem: "Getting same answers every time",
        solution: "Increase temperature to 0.8-1.0",
        config: { temperature: 0.9 }
    },

    "too_random": {
        problem: "Responses are inconsistent/wrong",
        solution: "Decrease temperature to 0.4-0.6",
        config: { temperature: 0.5 }
    },

    "api_timeout": {
        problem: "Requests timing out",
        solution: "Reduce maxTokens and check API quota",
        config: { maxTokens: 300 }
    }
};

// ==================== EXPORT EXAMPLES ====================

/**
 * This file demonstrates configuration examples.
 * To use:
 *
 * 1. Copy a configuration object above
 * 2. Modify values as needed
 * 3. Apply settings in-game via:
 *    - /gemini ui → Settings
 *    - Or /gemini setkey command
 */

export {
    DEFAULT_CONFIG,
    FACTUAL_CONFIG,
    CREATIVE_CONFIG,
    TUTOR_CONFIG,
    FAST_CONFIG,
    DETAILED_CONFIG,
    SYSTEM_PROMPTS,
    TEMPERATURE_GUIDE,
    TOKEN_GUIDE,
    OPTIMIZATION_TIPS,
    TROUBLESHOOTING
};

console.log("Configuration examples loaded. See comments for usage.");
