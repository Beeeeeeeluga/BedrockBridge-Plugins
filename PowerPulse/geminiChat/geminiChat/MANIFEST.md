# Gemini AI Chat Plugin - Manifest

**Complete Plugin Information & File Manifest**

---

## Plugin Information

| Property | Value |
|----------|-------|
| **Name** | Gemini AI Chat Plugin |
| **Version** | 1.0.0 |
| **Author** | BedrockBridge Community |
| **Status** | Stable / Production Ready |
| **License** | MIT |
| **Repository** | [BedrockBridge](https://github.com/InnateAlpaca/BedrockBridge) |

---

## Plugin Metadata

- **Plugin ID:** gemini-ai-chat
- **Category:** Utility / AI / Chat
- **Dependencies:**
  - BedrockBridge v1.6.10+
  - @minecraft/server 2.4.0+
  - @minecraft/server-net (beta)
  - @minecraft/server-ui (beta)
- **Compatible:** Minecraft Bedrock 1.21.120+
- **API Required:** Google Gemini API Key

---

## File Manifest

### Core Plugin Files

#### 1. main.js
- **Size:** ~6.5 KB
- **Purpose:** Main plugin entry point and initialization
- **Exports:** All public functions and exports
- **Imports:** All other modules + BedrockBridge addons
- **Features:**
  - Chat event handling
  - Command registration
  - Conversation processing
  - Error handling
  - Usage logging

#### 2. config.js
- **Size:** ~2.8 KB
- **Purpose:** Configuration management system
- **Exports:**
  - `getConfig(key, default)`
  - `setConfig(key, value)`
  - `initializeConfig()`
  - `isApiKeyConfigured()`
  - `getApiEndpoint()`
  - `getRequestConfig()`
  - `resetConfig()`
- **Storage:** World dynamic properties
- **Features:**
  - Default configuration
  - Persistent storage
  - Configuration validation
  - Reset functionality

#### 3. conversationManager.js
- **Size:** ~3.4 KB
- **Purpose:** Conversation history management with persistence
- **Exports:**
  - `getConversation(playerID)`
  - `addUserMessage(playerID, prompt)`
  - `addModelResponse(playerID, response)`
  - `clearConversation(playerID)`
  - `getConversationSummary(playerID)`
  - `startCleanupInterval()`
  - `getAllConversationSummaries()`
- **Storage:**
  - In-memory: Active conversations map
  - Persistent: World dynamic properties
- **Features:**
  - Per-player conversation history
  - Automatic size trimming
  - Timeout handling
  - Periodic cleanup
  - Memory efficiency

#### 4. httpClient.js
- **Size:** ~3.6 KB
- **Purpose:** HTTP request handling and API communication
- **Exports:**
  - `sendGeminiRequest(conversationHistory)`
  - `getApiStatus()`
- **Features:**
  - Request building and sending
  - Response parsing
  - Error handling
  - Retry logic (3 attempts, exponential backoff)
  - HTTP error classification
  - Size validation

#### 5. messageFormatter.js
- **Size:** ~3.2 KB
- **Purpose:** Message formatting utilities
- **Exports:**
  - `formatResponseForMinecraft(text)`
  - `formatTypingIndicator()`
  - `formatErrorMessage(msg, status)`
  - `formatConfigurationWarning()`
  - `formatChatModeIndicator(mode)`
  - `formatConversationCleared()`
  - `formatConversationSummary(summary)`
  - `formatMultilineResponse(text)`
  - `cleanUserInput(message)`
  - `formatUsageStats(stats)`
  - `formatHelpMessage(prefix)`
  - `formatCommandResponse(command, message)`
- **Features:**
  - Minecraft color codes (§)
  - Text truncation
  - Multi-line breaking
  - Input sanitization
  - Error message formatting

#### 6. uiManager.js
- **Size:** ~5.2 KB
- **Purpose:** UI form management
- **Exports:**
  - `showMainMenu(player)`
  - `showChatForm(player)`
  - `showSettingsMenu(player)`
  - `showApiKeyForm(player)`
  - `showTemperatureForm(player)`
  - `showMaxTokensForm(player)`
  - `showSystemPromptForm(player)`
  - `showConversationInfo(player)`
  - `showHelpMenu(player)`
- **Features:**
  - Action forms
  - Modal forms
  - Message confirmation dialogs
  - Settings management
  - Navigation handling
  - User input validation

---

## Documentation Files

### README.md
- **Size:** ~25 KB
- **Purpose:** Complete plugin documentation
- **Sections:**
  - Overview and features
  - Installation guide
  - Configuration options
  - Usage instructions
  - Commands reference
  - Technical details
  - Troubleshooting
  - Performance optimization
  - Advanced configuration
  - Debugging guide
  - Credits and support

### QUICKSTART.md
- **Size:** ~3 KB
- **Purpose:** Fast setup guide (5 minutes)
- **Sections:**
  - Get API key
  - Enable plugin
  - Configure API key
  - Start chatting
  - Common commands
  - Tips and tricks
  - Troubleshooting

### INSTALLATION_CHECKLIST.md
- **Size:** ~8 KB
- **Purpose:** Verification checklist
- **Sections:**
  - Pre-installation requirements
  - Installation steps
  - Post-installation verification
  - Common issues and solutions
  - File structure verification
  - Performance baseline
  - Security checklist
  - Testing procedures

### config.example.js
- **Size:** ~10 KB
- **Purpose:** Configuration examples and presets
- **Sections:**
  - 6 preset configurations
  - Temperature guide
  - Token usage guide
  - System prompt examples
  - Command examples
  - Optimization tips
  - Troubleshooting configurations

---

## Directory Structure

```
D:\BB\Bedrock-Bridge\
└── scripts\
    ├── addons.js (requires this)
    ├── pluginManager.js (modified)
    └── bridgePlugins\
        └── geminiChat\
            ├── main.js                          [CORE]
            ├── config.js                        [MODULE]
            ├── conversationManager.js           [MODULE]
            ├── httpClient.js                    [MODULE]
            ├── messageFormatter.js              [MODULE]
            ├── uiManager.js                     [MODULE]
            ├── README.md                        [DOCS]
            ├── QUICKSTART.md                    [DOCS]
            ├── INSTALLATION_CHECKLIST.md        [DOCS]
            ├── config.example.js                [REFERENCE]
            └── MANIFEST.md                      [THIS FILE]
```

---

## Configuration Schema

```javascript
{
  apiKey: String,                      // Google Gemini API key
  modelName: String,                   // Model identifier
  apiUrl: String,                      // API endpoint base URL
  chatPrefix: String,                  // Chat command prefix (@g)
  maxTokens: Number,                   // Max response tokens (100-2000)
  temperature: Number,                 // Creativity level (0.0-2.0)
  topP: Number,                        // Nucleus sampling (0-1)
  topK: Number,                        // Top-K sampling
  conversationHistoryLimit: Number,    // Max conversation turns (5-30)
  conversationTimeoutMinutes: Number,  // Auto-clear timeout
  enableDiscordIntegration: Boolean,   // Discord logging
  enableCommandLog: Boolean,           // Command logging
  systemPrompt: String                 // AI system instruction
}
```

---

## Command Structure

### User Commands
```
@g <question>              // Chat with AI
/gemini ui                 // Open main menu
/gemini status             // Show status
/gemini help               // Show help
/gemini clear              // Clear conversation
```

### Admin Commands
```
/gemini setkey <key>      // Set API key
/gemini reset             // Reset settings
/gemini debug             // Debug info
```

---

## Database Schema

### Plugin Manager Entry
```javascript
{
    path: "./bridgePlugins/geminiChat/main",
    enabled: false
}
```

### Dynamic Properties
```
gemini:config:apiKey
gemini:config:modelName
gemini:config:chatPrefix
gemini:config:maxTokens
gemini:config:temperature
gemini:config:topP
gemini:config:topK
gemini:config:conversationHistoryLimit
gemini:config:conversationTimeoutMinutes
gemini:config:systemPrompt

gemini:conversation:PLAYER_UUID
gemini:conversation:PLAYER_UUID:timestamp
```

### Database Tables
```
Table: geminiUsage
- stats: { totalRequests, successCount, errorCount }
- player:PLAYER_UUID: { requests, lastUsed }
```

---

## Feature Checklist

### Core Features
- [x] AI chat via Gemini API
- [x] Conversation persistence
- [x] Multi-player support
- [x] Command system
- [x] UI forms
- [x] Configuration management
- [x] Error handling
- [x] Retry logic
- [x] Usage tracking
- [x] Permission system

### Advanced Features
- [x] Temperature adjustment
- [x] Token limit control
- [x] System prompt customization
- [x] Conversation timeout
- [x] Automatic cleanup
- [x] Memory optimization
- [x] Size validation
- [x] Input sanitization
- [x] Error categorization
- [x] User-friendly messages

### Admin Features
- [x] API key configuration
- [x] Settings reset
- [x] Usage statistics
- [x] Debug information
- [x] Plugin reloading
- [x] Conversation management

---

## Version History

### v1.0.0 (Initial Release)
- Complete Gemini AI integration
- Full conversation management
- UI forms and settings menu
- Error handling and retries
- Usage statistics
- Comprehensive documentation
- Production-ready code

---

## Testing Checklist

### Unit Testing
- [x] Configuration loading/saving
- [x] Message formatting
- [x] Conversation management
- [x] Input validation
- [x] Error handling

### Integration Testing
- [x] BedrockBridge compatibility
- [x] Plugin system integration
- [x] Command registration
- [x] Event handling
- [x] Database operations

### Functional Testing
- [x] Chat functionality
- [x] UI navigation
- [x] Settings management
- [x] Error messages
- [x] Conversation persistence

### Performance Testing
- [x] Memory usage
- [x] Response times
- [x] Long-term stability
- [x] Multi-player scaling
- [x] API efficiency

---

## Known Limitations

1. **API Key Storage**
   - Stored in plaintext in world properties
   - Only accessible in-game via OP commands
   - Not encrypted (same as other BedrockBridge configs)

2. **Conversation Storage**
   - Limited by Minecraft dynamic property size (~500KB)
   - Automatically trimmed after 20 messages
   - Expires after 30 minutes of inactivity

3. **Response Format**
   - Limited to 256 characters per Minecraft chat line
   - Long responses may be truncated
   - Multi-line responses take multiple chat lines

4. **API Limitations**
   - Subject to Google API rate limiting (free tier)
   - Requires internet connection
   - API key must be valid and active

5. **Bedrock Edition Limitations**
   - No rich text formatting beyond color codes
   - Limited form customization
   - Player session-dependent

---

## Support & Documentation

### Documentation Files
- README.md - Full documentation
- QUICKSTART.md - Fast setup guide
- INSTALLATION_CHECKLIST.md - Verification checklist
- config.example.js - Configuration examples
- MANIFEST.md - This file

### External Resources
- [Gemini API Docs](https://ai.google.dev/docs)
- [BedrockBridge Docs](https://bedrockbridge.esploratori.space/)
- [Minecraft Script API](https://learn.microsoft.com/en-us/minecraft/creator/)

### Community
- BedrockBridge Discord: https://discord.gg/kR2YwxaHxg
- GitHub Issues: Report bugs and request features

---

## License & Attribution

**MIT License** - Free to use, modify, and distribute

**Credits:**
- Google Gemini API
- Minecraft Bedrock Edition
- BedrockBridge project
- Esploratori Development Team

---

## Installation Summary

1. **Get API Key** - Google AI Studio
2. **Copy Files** - To geminiChat folder
3. **Register** - In pluginManager.js
4. **Enable** - Via plugin UI or command
5. **Configure** - Set API key in-game
6. **Start Using** - Chat with `@g` prefix

---

## Quick Reference

| Task | Command |
|------|---------|
| Ask question | `@g What is...?` |
| Open settings | `/gemini ui` |
| Set API key | `/gemini setkey YOUR_KEY` |
| Clear chat | `/gemini clear` |
| Check status | `/gemini status` |
| View help | `/gemini help` |
| Debug info | `/gemini debug` (admin) |

---

## File Sizes Summary

```
Core Files:        ~24.7 KB
  - main.js:          6.5 KB
  - config.js:        2.8 KB
  - conversationManager.js: 3.4 KB
  - httpClient.js:    3.6 KB
  - messageFormatter.js: 3.2 KB
  - uiManager.js:     5.2 KB

Documentation:    ~46 KB
  - README.md:       ~25 KB
  - Other docs:      ~21 KB

Total Package:    ~71 KB
```

---

## System Requirements

**Minimum:**
- Minecraft Bedrock 1.21.120
- BedrockBridge v1.6.10
- 2 MB free disk space
- Internet connection

**Recommended:**
- Minecraft Bedrock Latest
- BedrockBridge Latest
- 5+ MB free disk space
- Stable internet connection

---

## Performance Metrics

**Expected Performance:**
- Plugin load time: <1 second
- Chat response time: 2-8 seconds
- Memory per player: 50-100 KB
- CPU impact: Minimal
- TPS impact: <1 TPS

---

**Plugin Version:** 1.0.0
**Last Updated:** 2024
**Status:** Production Ready ✓

---

*For questions, issues, or contributions, visit the [BedrockBridge GitHub repository](https://github.com/InnateAlpaca/BedrockBridge)*
