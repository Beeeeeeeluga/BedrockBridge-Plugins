# Gemini AI Chat Plugin - Installation Checklist

**Complete verification that everything is set up correctly**

---

## Pre-Installation Requirements

### BedrockBridge Setup
- [ ] BedrockBridge version 1.6.10 or higher installed
- [ ] `/scripts/main.js` exists and loads properly
- [ ] `/scripts/addons.js` is accessible
- [ ] `/scripts/pluginManager.js` is active
- [ ] Server console shows no BedrockBridge errors on startup

### Minecraft Version
- [ ] Minecraft Bedrock Edition 1.21.120 or higher
- [ ] Server runs without errors on startup
- [ ] Admin account available for configuration

### API Key
- [ ] Google account created
- [ ] Visited [Google AI Studio](https://aistudio.google.com/)
- [ ] Generated Gemini API key
- [ ] API key copied and saved safely

---

## Installation Steps

### Step 1: File Placement
- [ ] Created folder: `D:\BB\Bedrock-Bridge\scripts\bridgePlugins\geminiChat\`
- [ ] Copied `main.js` to geminiChat folder
- [ ] Copied `config.js` to geminiChat folder
- [ ] Copied `conversationManager.js` to geminiChat folder
- [ ] Copied `httpClient.js` to geminiChat folder
- [ ] Copied `messageFormatter.js` to geminiChat folder
- [ ] Copied `uiManager.js` to geminiChat folder
- [ ] Copied `README.md` to geminiChat folder
- [ ] Copied `QUICKSTART.md` to geminiChat folder
- [ ] Copied `config.example.js` to geminiChat folder
- [ ] All files are in correct location

### Step 2: Plugin Registration
- [ ] Updated `pluginManager.js` with new plugin entry:
  ```javascript
  { path: "./bridgePlugins/geminiChat/main", enabled: false }
  ```
- [ ] Entry is at the end of the plugins array
- [ ] No syntax errors in modified file

### Step 3: Server Startup
- [ ] Started server with modified BedrockBridge
- [ ] Server console shows no error messages
- [ ] BedrockBridge initialization complete
- [ ] No file not found errors for plugin files

### Step 4: Plugin Enablement
- [ ] Joined server as admin player
- [ ] At least one of these works:
  - [ ] `/plugin enable ./bridgePlugins/geminiChat/main` succeeds
  - [ ] `/plugin ui` → Plugin List → Gemini Chat → Enable works
  - [ ] Server console shows "geminiChat" plugin loaded message

### Step 5: Initial Configuration
- [ ] API key set via `/gemini setkey YOUR_API_KEY`
- [ ] Confirmed in chat: "API key has been set successfully!"
- [ ] Server message: "API is now configured and ready to use."
- [ ] OR API key set through `/gemini ui` → Settings

### Step 6: Functionality Testing
- [ ] Chat command works: `@g What is Minecraft?`
- [ ] Received response from Gemini AI
- [ ] Response formatted correctly in Minecraft chat
- [ ] No error messages in console

---

## Post-Installation Verification

### Command Testing
- [ ] `/gemini ui` opens main menu ✓
- [ ] `/gemini status` shows correct settings ✓
- [ ] `/gemini help` displays help text ✓
- [ ] `/gemini clear` clears conversation ✓
- [ ] Chat with `@g` prefix works ✓

### Settings Testing
- [ ] Settings menu opens correctly
- [ ] Can change temperature setting
- [ ] Can change max tokens setting
- [ ] Can view/edit system prompt
- [ ] Can set API key through UI

### Conversation Management
- [ ] Conversation history persists
- [ ] Multiple messages remembered
- [ ] Conversation info shows correct count
- [ ] Clearing conversation works
- [ ] New conversation starts fresh

### Error Handling
- [ ] Invalid API key shows error
- [ ] Network timeout shows error
- [ ] Empty questions show usage help
- [ ] Rate limiting shows friendly message

### Performance
- [ ] Plugin loads without lag
- [ ] No memory leaks after extended use
- [ ] Console shows proper logging
- [ ] Conversations save to disk

---

## File Structure Verification

```
✓ D:\BB\Bedrock-Bridge\scripts\bridgePlugins\geminiChat\
  ├── ✓ main.js (2-3 KB)
  ├── ✓ config.js (2 KB)
  ├── ✓ conversationManager.js (3-4 KB)
  ├── ✓ httpClient.js (3-4 KB)
  ├── ✓ messageFormatter.js (3 KB)
  ├── ✓ uiManager.js (5-6 KB)
  ├── ✓ README.md (comprehensive guide)
  ├── ✓ QUICKSTART.md (5-minute setup)
  ├── ✓ config.example.js (configuration examples)
  └── ✓ INSTALLATION_CHECKLIST.md (this file)
```

---

## Common Issues & Solutions

### Plugin Not Loading

**Symptoms:**
- Error: "Failed to load plugin geminiChat"
- Plugin doesn't appear in plugin list

**Solutions:**
- [ ] Check all files exist in correct folder
- [ ] Check file names are correct (case-sensitive)
- [ ] Verify pluginManager.js was updated correctly
- [ ] Check console for specific error message
- [ ] Try `/plugin reload` to reload plugins

### API Key Not Accepted

**Symptoms:**
- Error: "API key not configured"
- Settings show old key

**Solutions:**
- [ ] Verify API key from Google AI Studio
- [ ] Check no extra spaces in key
- [ ] Use correct command: `/gemini setkey YOUR_KEY`
- [ ] Try setting through UI: `/gemini ui` → Settings
- [ ] Restart server and try again

### Chat Commands Not Working

**Symptoms:**
- `@g question` doesn't trigger response
- No "Typing..." indicator

**Solutions:**
- [ ] Verify API key is configured
- [ ] Check default prefix hasn't changed
- [ ] Verify message starts with prefix
- [ ] Check for typos in question
- [ ] Try `/gemini status` to check API status

### Conversation Not Saving

**Symptoms:**
- Conversation history lost
- Previous messages not remembered

**Solutions:**
- [ ] Check world has write permissions
- [ ] Verify available disk space
- [ ] Check conversation timeout settings
- [ ] Look for errors in console
- [ ] Try manually setting `/gemini clear` then asking new questions

### Memory Issues

**Symptoms:**
- Server getting slower
- High memory usage
- Lag when using plugin

**Solutions:**
- [ ] Reduce `conversationHistoryLimit` in settings
- [ ] Clear conversations: `/gemini clear` (as player)
- [ ] Check `/gemini debug` for active conversations
- [ ] Reduce `maxTokens` setting
- [ ] Increase `conversationTimeoutMinutes` to clear old conversations

---

## Performance Baseline

### Expected Performance

**Response Time:**
- [ ] First response: 3-8 seconds
- [ ] Subsequent responses: 2-6 seconds
- [ ] Rate limited: Wait 1 minute

**Memory Usage:**
- [ ] Per player: ~50-100 KB
- [ ] Total (10 players): ~500 KB - 1 MB
- [ ] No memory leaks over time

**Server Impact:**
- [ ] TPS impact: 0-1 TPS loss
- [ ] No noticeable lag during responses
- [ ] Works alongside other plugins

---

## Security Checklist

### API Key Security
- [ ] API key stored only in world properties
- [ ] API key not logged in plaintext
- [ ] Only OPs can set API key
- [ ] Key never exposed in chat

### Input Validation
- [ ] User input cleaned before sending
- [ ] Command injection prevention
- [ ] XSS prevention (not applicable in Minecraft)
- [ ] Rate limiting protection

### Network Security
- [ ] Using HTTPS for API calls
- [ ] SSL certificate validation
- [ ] No sensitive data in URLs
- [ ] Error messages don't expose system info

---

## Documentation Verification

- [ ] README.md exists and is comprehensive
- [ ] QUICKSTART.md available for quick setup
- [ ] config.example.js has useful examples
- [ ] INSTALLATION_CHECKLIST.md (this file) complete
- [ ] All commands documented
- [ ] All settings explained
- [ ] Troubleshooting section available

---

## First-Time User Testing

Have a test player:
- [ ] Join the server
- [ ] Use `/gemini help` to learn commands
- [ ] Set up API key if not already done
- [ ] Ask simple question: `@g What is Minecraft?`
- [ ] Ask complex question: `@g Give me tips for building a house`
- [ ] Use UI: `/gemini ui` → Chat
- [ ] Open settings: `/gemini ui` → Settings
- [ ] Successfully complete initial setup

---

## Admin Testing

As server admin, verify:
- [ ] `/gemini setkey` command works
- [ ] `/gemini reset` works correctly
- [ ] `/gemini debug` shows statistics
- [ ] `/plugin ui` manages plugin correctly
- [ ] `/plugin reload` reloads plugin successfully
- [ ] Permissions work correctly

---

## Multi-Player Testing

- [ ] Multiple players can chat simultaneously
- [ ] Each player has separate conversation
- [ ] No data leakage between players
- [ ] Conversations don't interfere
- [ ] All players see responses correctly

---

## Extended Use Testing

Run for 1+ hour with active players:
- [ ] No memory leaks
- [ ] Conversations persist correctly
- [ ] API calls remain reliable
- [ ] No performance degradation
- [ ] Server remains stable

---

## Final Verification

### System Status
- [ ] Server logs show no errors
- [ ] Console shows clean startup messages
- [ ] No warnings about missing modules
- [ ] All expected initialization messages present

### User Experience
- [ ] Plugin is easy to use
- [ ] Settings are intuitive
- [ ] Error messages are helpful
- [ ] Response quality is good
- [ ] Overall satisfaction with functionality

---

## Sign-Off

**Installation Date:** _______________

**Installer Name:** _______________

**Server:** _______________

**API Endpoint:** ✓ Working

**All Tests Passed:** [ ] Yes [ ] No

**Notes:**
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## Post-Installation Tips

1. **Monitor API Usage**
   - Check monthly quota at Google Cloud Console
   - Watch for rate limiting issues
   - Plan for paid tier if needed

2. **Regular Maintenance**
   - Periodically check `/gemini debug` stats
   - Clear old conversations if memory grows
   - Review error logs monthly

3. **User Education**
   - Share QUICKSTART.md with players
   - Explain how to ask good questions
   - Set expectations on response time

4. **Configuration Optimization**
   - Adjust temperature based on usage
   - Test different max token settings
   - Fine-tune based on player feedback

5. **Community Engagement**
   - Encourage players to use the feature
   - Get feedback on improvements
   - Share interesting responses

---

## Next Steps

1. ✓ Installation complete
2. Go to QUICKSTART.md for 5-minute setup
3. Read README.md for full documentation
4. Explore config.example.js for customization
5. Start using `/gemini` commands!

---

**Installation Complete! Enjoy chatting with Gemini! 🤖**
