# Gemini AI Chat Plugin for BedrockBridge

**Version:** 1.0.0
**Author:** BedrockBridge Community
**License:** MIT
**Status:** Stable

---

## Overview

The **Gemini AI Chat Plugin** is a complete integration of Google's Gemini AI model with the Minecraft Bedrock Edition via BedrockBridge. This plugin enables players to have real-time conversations with an AI assistant directly in-game, with full persistence, error handling, and comprehensive configuration options.

### Key Features

✅ **Real-time AI Conversation** - Chat with Gemini AI directly in Minecraft
✅ **Conversation Persistence** - Maintains conversation history per player
✅ **Advanced Configuration** - Customize API settings, temperature, tokens, and system prompts
✅ **Error Handling & Retries** - Robust error handling with automatic retry logic
✅ **UI Forms** - Complete UI interface for settings and chat management
✅ **Command System** - Multiple command options for chat and configuration
✅ **Usage Tracking** - Track and log API usage statistics
✅ **Permission System** - Admin-only configuration commands
✅ **Multi-player Support** - Independent conversations per player
✅ **Production Ready** - Thoroughly tested and documented

---

## Installation

### Step 1: Verify BedrockBridge Installation

Ensure you have BedrockBridge installed and running properly:
- Check that `/scripts/addons.js` exists
- Verify bridge API is accessible
- Confirm `pluginManager.js` is active

### Step 2: Plugin File Structure

The plugin should be located at: `D:\BB\Bedrock-Bridge\scripts\bridgePlugins\geminiChat\`

Required files:
```
geminiChat/
├── main.js                    # Main plugin entry point
├── config.js                  # Configuration management
├── conversationManager.js      # Conversation history & persistence
├── httpClient.js              # API request handling
├── messageFormatter.js        # Message formatting utilities
├── uiManager.js               # UI forms and player interactions
└── README.md                  # This file
```

### Step 3: Enable the Plugin

#### Option A: Through Plugin Manager UI
1. Join your Bedrock server as admin
2. Run `/plugin ui`
3. Go to "Plugin List"
4. Find "Gemini Chat" and select it
5. Click "Enable"

#### Option B: Direct Command
```
/plugin enable ./bridgePlugins/geminiChat/main
```

#### Option C: Manual Database Edit
Edit `pluginManager.js` line 35 and change:
```javascript
{ path: "./bridgePlugins/geminiChat/main", enabled: false }
```
to:
```javascript
{ path: "./bridgePlugins/geminiChat/main", enabled: true }
```

---

## Configuration

### Obtaining a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy your API key

### Setting the API Key

#### Option A: In-Game Command (Admin)
```
/gemini setkey YOUR_API_KEY_HERE
```

#### Option B: Settings UI
1. Run `/gemini ui`
2. Select "Settings"
3. Click "API Key"
4. Enter your API key

#### Option C: Direct Configuration
The plugin stores settings in world dynamic properties:
```
gemini:config:apiKey
gemini:config:modelName
gemini:config:temperature
gemini:config:maxTokens
... (more settings)
```

### Configuration Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `apiKey` | String | YOUR_GEMINI_API_KEY_HERE | Your Google Gemini API key |
| `modelName` | String | gemini-flash-latest | The Gemini model to use |
| `chatPrefix` | String | @g | Chat command prefix (e.g., "@g question") |
| `maxTokens` | Number | 500 | Maximum response tokens (100-2000) |
| `temperature` | Number | 0.7 | Response creativity (0.0-2.0) |
| `topP` | Number | 0.95 | Nucleus sampling parameter |
| `topK` | Number | 40 | Top-K sampling parameter |
| `conversationHistoryLimit` | Number | 20 | Max conversation turns to keep |
| `conversationTimeoutMinutes` | Number | 30 | Auto-clear conversation after inactivity |
| `enableDiscordIntegration` | Boolean | true | Enable Discord bridge integration |
| `systemPrompt` | String | (friendly AI) | Base instruction for Gemini |

---

## Usage

### Chat with AI

**In-Game Prefix Command:**
```
@g What is the best way to farm diamonds?
```
(Default prefix is `@g`, customizable in settings)

**Response Format:**
```
[Gemini] Here's the best way to farm diamonds in Minecraft...
```

### Commands

#### Player Commands

| Command | Description | Example |
|---------|-------------|---------|
| `@g <question>` | Ask Gemini a question | `@g How to build a house?` |
| `/gemini ui` | Open main menu | `/gemini ui` |
| `/gemini status` | Show current status | `/gemini status` |
| `/gemini help` | Show help information | `/gemini help` |
| `/gemini clear` | Clear conversation history | `/gemini clear` |

#### Admin Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `/gemini setkey <key>` | Set API key | OP |
| `/gemini reset` | Reset settings to defaults | OP |
| `/gemini debug` | Show debug information | OP |

### UI Menu Navigation

**Main Menu:**
- Chat - Open chat form
- Settings - Configure plugin
- Conversation Info - View conversation details
- Help - Display help

**Settings Menu:**
- API Key Configuration
- Temperature Adjustment (0.0-2.0)
- Max Tokens Setting (100-2000)
- System Prompt Editing
- Reset to Defaults
- Back

**Conversation Info:**
- View message count and conversation turns
- Check memory usage
- Clear conversation history

---

## Technical Details

### Architecture

The plugin follows a modular architecture:

```
main.js (Core Logic)
  ├── config.js (Settings Management)
  ├── conversationManager.js (History & Persistence)
  ├── httpClient.js (API Communication)
  ├── messageFormatter.js (Message Formatting)
  └── uiManager.js (UI Forms)
```

### Data Storage

**Dynamic Properties (Persistent across server restarts):**
- `gemini:config:*` - Configuration settings
- `gemini:conversation:PLAYER_UUID` - Conversation history (JSON)
- `gemini:conversation:PLAYER_UUID:timestamp` - Last update timestamp

**In-Memory Storage:**
- Active conversations map
- Loaded plugins cache

**Database Tables:**
- `geminiUsage` - API usage statistics

### Error Handling

The plugin includes comprehensive error handling:

1. **API Key Validation** - Checks if key is configured before requests
2. **HTTP Error Handling** - Parses and reports API errors
3. **Retry Logic** - Automatic retries with exponential backoff
4. **Timeout Handling** - Prevents hung conversations
5. **Size Limits** - Automatically trims large conversation histories
6. **Fallback Messages** - User-friendly error messages

### HTTP Request Flow

```
1. User sends message with @g prefix
2. Message is validated and cleaned
3. Conversation history is retrieved
4. User message is added to history
5. Request sent to Gemini API with retry logic
6. Response is parsed and validated
7. Model response added to conversation
8. Response formatted for Minecraft
9. Message sent to player
10. Usage statistics logged
```

### Conversation Management

**Features:**
- Per-player conversation history
- Automatic timeout after inactivity (default: 30 minutes)
- Size-limited storage (trimmed to last 20 messages)
- Persistent storage in world dynamic properties
- Memory-efficient with periodic cleanup

**Conversation Format:**
```javascript
[
    { role: "user", parts: [{ text: "question 1" }] },
    { role: "model", parts: [{ text: "response 1" }] },
    { role: "user", parts: [{ text: "question 2" }] },
    { role: "model", parts: [{ text: "response 2" }] },
    ...
]
```

---

## Troubleshooting

### Plugin Not Loading

**Error:** "Failed to load plugin geminiChat/main"

**Solutions:**
1. Check file paths are correct
2. Verify all modules exist
3. Check BedrockBridge logs for syntax errors
4. Run `/plugin reload` to retry

### API Key Not Working

**Error:** "Error 401" or "API key not configured"

**Solutions:**
1. Verify API key from Google AI Studio
2. Use `/gemini setkey YOUR_KEY` to update
3. Check key doesn't have spaces or extra characters
4. Regenerate key if expired

### Rate Limiting

**Error:** "Error 429" or "Too many requests"

**Solutions:**
1. Wait a few moments before sending again
2. Reduce request frequency
3. Check API quota in Google Cloud Console
4. Upgrade API plan if needed

### Empty Responses

**Error:** "Empty or invalid response from Gemini"

**Solutions:**
1. Try a different question
2. Check system prompt is valid
3. Reduce max tokens if model is timing out
4. Check API status page

### Conversation Not Saving

**Error:** Conversation cleared unexpectedly

**Solutions:**
1. Check conversation timeout setting
2. Verify world has write permissions
3. Check available disk space
4. Review server logs for errors

---

## Performance Optimization

### Memory Management

- Conversations are automatically trimmed to last 20 messages
- Inactive conversations expire after 30 minutes
- Periodic cleanup runs every 5 minutes
- In-memory map is used for active conversations

### API Optimization

- Retry logic with exponential backoff prevents rate limiting
- Configurable max tokens limit response size
- Temperature setting affects generation speed
- Caching of configuration to avoid repeated lookups

### Best Practices

1. **Set appropriate temperature** - Lower for fact-based answers, higher for creative
2. **Keep history limit moderate** - Balances context with performance
3. **Monitor usage stats** - Check `/gemini debug` for conversation metrics
4. **Clean old conversations** - Use `/gemini clear` periodically

---

## Advanced Configuration

### Custom System Prompt

Change the base instruction for Gemini:

```
/gemini ui → Settings → System Prompt
```

Example prompts:
- **Friendly Helper:** "You are a helpful Minecraft guide..."
- **Roleplayer:** "You are a Minecraft NPC..."
- **Educator:** "You are a teacher helping students learn..."

### Temperature Tuning

**Low Temperature (0.0-0.5):**
- More consistent responses
- Better for facts and instructions
- Less creative

**High Temperature (1.0-2.0):**
- More varied responses
- Better for creative tasks
- More unpredictable

### Token Management

**Low Tokens (100-200):**
- Faster responses
- Shorter answers
- Less context

**High Tokens (1000+):**
- Longer, detailed answers
- More context awareness
- Slower responses

---

## API Costs

**Gemini API Pricing:**
- Free tier: 60 requests per minute
- Paid: Based on usage (input/output tokens)

**Cost Estimation:**
- Average question: ~100 input tokens, ~100 output tokens
- With free tier: Can handle ~30 players asking questions regularly

Monitor API usage at [Google Cloud Console](https://console.cloud.google.com/)

---

## Discord Integration (Optional)

If BedrockBridge Discord integration is enabled, conversations can be:
1. Logged to Discord channels
2. Triggered from Discord messages
3. Part of audit trails

See BedrockBridge documentation for Discord setup.

---

## Development & Extending

### Module API

**config.js:**
```javascript
getConfig(key, defaultValue)
setConfig(key, value)
initializeConfig()
isApiKeyConfigured()
getApiEndpoint()
```

**conversationManager.js:**
```javascript
getConversation(playerID)
addUserMessage(playerID, prompt)
addModelResponse(playerID, response)
clearConversation(playerID)
getConversationSummary(playerID)
```

**httpClient.js:**
```javascript
sendGeminiRequest(conversationHistory)
getApiStatus()
```

**messageFormatter.js:**
```javascript
formatResponseForMinecraft(text)
formatErrorMessage(error, status)
cleanUserInput(message)
formatMultilineResponse(text)
```

**uiManager.js:**
```javascript
showMainMenu(player)
showChatForm(player)
showSettingsMenu(player)
showConversationInfo(player)
```

### Creating Custom Behaviors

1. Import needed modules
2. Hook into world.afterEvents or bridge events
3. Use conversation manager for history
4. Send requests via httpClient
5. Format messages via messageFormatter

---

## Debugging

### Enable Debug Output

Run as admin:
```
/gemini debug
```

This shows:
- Active conversations
- Message counts
- Memory usage per player
- Last updated timestamps

### Console Logging

Server console will show:
```
[Gemini] Initializing...
[Gemini] Plugin loaded successfully
[Gemini API request] Attempt 1/3
[Gemini Stats] Total: 45, Success: 43, Errors: 2
```

### Check Stored Data

Conversations are stored as JSON in world properties:
- Format: `gemini:conversation:PLAYER_UUID`
- Can be inspected via debug commands

---

## Support & Issues

### Reporting Bugs

Include in bug reports:
1. Error message (full text)
2. What you were doing when it happened
3. Server version
4. BedrockBridge version
5. Console log output

### Performance Issues

If plugin causes lag:
1. Reduce `conversationHistoryLimit`
2. Increase `conversationTimeoutMinutes`
3. Check API response times
4. Monitor player count

### Compatibility

**Requirements:**
- Minecraft Bedrock 1.21.120+
- BedrockBridge v1.6.10+
- `@minecraft/server` 2.4.0+
- `@minecraft/server-net` beta
- `@minecraft/server-ui` beta

---

## Updates & Changelog

### Version 1.0.0 (Initial Release)
- Complete Gemini AI Chat integration
- Full conversation management
- UI forms and settings
- Error handling and retry logic
- Usage statistics tracking
- Comprehensive documentation

### Future Enhancements
- Multi-language support
- Custom response actions
- Integration with other plugins
- Advanced caching
- Per-player rate limiting

---

## License

This plugin is licensed under the MIT License. See LICENSE file for details.

**BedrockBridge:**
- Repository: [BedrockBridge GitHub](https://github.com/InnateAlpaca/BedrockBridge)
- Website: [bedrockbridge.esploratori.space](https://bedrockbridge.esploratori.space/)
- Discord: [Esploratori](https://discord.gg/kR2YwxaHxg)

---

## Credits

**Contributors:**
- BedrockBridge Community
- Google Gemini API
- Minecraft Bedrock Edition

**Special Thanks:**
- InnateAlpaca (BedrockBridge Creator)
- Esploratori Development Team

---

## Final Notes

This plugin is **production-ready** and has been tested for:
- ✅ Stability across multiple players
- ✅ Proper error handling
- ✅ Memory management
- ✅ Configuration persistence
- ✅ Command compatibility
- ✅ UI responsiveness

For questions or support, consult this documentation first, then reach out to the BedrockBridge community.

**Happy AI chatting! 🤖**
