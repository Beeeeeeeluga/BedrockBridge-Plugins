# Test Discord Integration - Quick Guide

**Date**: 2025-11-20
**Focus**: Verify Gemini responses appear in Discord

---

## ✅ Pre-Flight Checks

1. **Plugin loads**
   ```
   Console output should show:
   [INIT] Initializing Gemini AI Chat Plugin v1.0.0
   [INIT] Discord bridge initializing...
   Discord Integration: ✓ Ready
   ```

2. **Discord bot is online**
   - Check BedrockBridge Discord bot in your server
   - Verify it has message send permissions

3. **API key is set**
   ```
   /gemini debug
   Should show: [Gemini Status] API Key: ✓ Configured
   ```

---

## 🧪 Test 1: Simple Question

### In Minecraft Bedrock:
```
/say @g What is Minecraft?
```

### Expected Console Output:
```
[CHAT] Chat request from [PlayerName]: What is Minecraft?
[API] Sending request to Gemini API for [PlayerName]
[API] Successful API response (1234ms)
[DISCORD] Sending Gemini response to Discord for [PlayerName]
[Embeds] Creating Gemini response embed for [PlayerName]
[DiscordBridge] BridgeDirect ready, sending embed directly
[DiscordBridge] Response embed sent to Discord successfully from [PlayerName]
```

### Expected Minecraft Chat:
```
[Gemini] Minecraft is a sandbox video game where players can build...
```

### Expected Discord Message:
A beautiful embed will appear with:
- **Title**: 🤖 Gemini AI Response
- **Question field**: What is Minecraft?
- **Answer field**: Minecraft is a sandbox...
- **Player field**: [Your Player Name]
- **Server field**: Minecraft Bedrock
- **Color**: Purple
- **Footer**: Gemini AI Chat Plugin • BedrockBridge

---

## 🧪 Test 2: Error Handling

### In Minecraft Bedrock:
```
/gemini setkey invalid_key
/say @g question
```

### Expected Console Output:
```
[DISCORD] Sending error to Discord for [PlayerName]
[Embeds] Processing error embed: Invalid API key
[DiscordBridge] BridgeDirect ready, sending error embed directly
[DiscordBridge] Error embed sent to Discord successfully
```

### Expected Discord Message:
A red embed will appear with:
- **Title**: ⚠️ Gemini AI Error
- **Error field**: Invalid API key
- **Player field**: [Your Player Name]
- **Status Code field**: 401
- **Color**: Red (#E74C3C)

---

## 🧪 Test 3: Debug Information

### In Minecraft Bedrock:
```
/gemini debug
```

### Expected Output:
```
[Gemini Debug Info]
Active Conversations: 1
Total Logs: 156
Log Levels: DEBUG: 98, INFO: 48, WARN: 8, ERROR: 2

Discord Bridge:
  chatUpStream: ✓ Available
  chatDownStream: ✓ Available
  Pending Requests: 0
  Pending Embeds: 0

[Conversations]
  a1b2c3d4: 5 msgs, 2.1 KB
```

**Key Indicators**:
- ✅ chatUpStream: ✓ Available (Bedrock → Discord works)
- ✅ chatDownStream: ✓ Available (Discord → Bedrock works)
- ✅ Pending Embeds: 0 (No stuck embeds)

---

## 🧪 Test 4: Conversation History

### In Minecraft Bedrock:
```
/say @g What is AI?
/say @g Give me more details
/say @g What about machine learning?
```

### Expected Behavior:
- Each question builds on previous context
- Responses get progressively more detailed
- Console shows conversation messages accumulating

### Check in Discord:
Each response appears as a separate embed with the current question and answer.

---

## 🐛 Troubleshooting

### Issue: Embeds appear in console but not Discord

**Check 1**: BridgeDirect readiness
```
Console should show: "BridgeDirect ready, sending embed directly"
If you see: "BridgeDirect not ready - embed queued for later"
→ Wait 5-10 seconds and try again
```

**Check 2**: Discord permissions
- Bot has "Send Messages" permission in channel
- Bot has "Embed Links" permission
- Channel is not read-only

**Check 3**: BedrockBridge configuration
- Discord bot is online
- Webhook is configured
- Channel is set correctly

### Issue: Minecraft response works, Discord doesn't

**Check 1**: Is BridgeDirect available?
```javascript
// You should see in console:
[Embeds] Sending embed to Discord as [PlayerName]
[DiscordBridge] BridgeDirect ready, sending embed directly
```

**Check 2**: Import is correct
File: `discordEmbeds.js` line 12
```javascript
import { bridgeDirect } from "../../BridgeDirect.js";
```
Must be EXACT path or will fail silently.

**Check 3**: Try a different question
```
/say @g hello
```
If this works, first question may have hit API error.

### Issue: Console errors

**Look for**:
```
[ERROR] Failed to send response:
[ERROR] Failed to send error:
```

**What to check**:
1. BridgeDirect module exists at `../../BridgeDirect.js`
2. All imports are correct (capitalization matters!)
3. No syntax errors in discordBridge.js or discordEmbeds.js

---

## ✅ Verification Commands

### Check API Configuration
```
/gemini status
```
Look for: `API Key: ✓ Configured`

### Check Discord Bridge
```
/gemini debug
```
Look for:
- `Discord Bridge: ✓ Ready`
- `chatUpStream: ✓ Available`
- `chatDownStream: ✓ Available`

### Clear Conversation and Test
```
/gemini clear
/say @g Test question
```

---

## 📊 Success Indicators

### Console
- ✅ No red ERROR lines (except expected debug info)
- ✅ Shows "Response embed sent to Discord successfully"
- ✅ Multiple INFO level messages per request
- ✅ Proper timestamps on all logs

### Minecraft
- ✅ Player sees response in chat
- ✅ Typing indicator appears before response
- ✅ Response text formatted with [Gemini] prefix

### Discord
- ✅ Beautiful embed appears immediately
- ✅ Has all 4 fields (Question, Answer, Player, Server)
- ✅ Correct color (purple for response, red for error)
- ✅ Footer shows "Gemini AI Chat Plugin • BedrockBridge"
- ✅ Timestamp is current

---

## 🎯 Full Flow Test

Complete end-to-end test:

1. **Setup** (Pre-flight)
   - Verify plugin loads
   - Check API key configured
   - Verify Discord bot online

2. **Test Gemini Response**
   - Ask simple question: `@g What is water?`
   - Check Minecraft chat
   - Check Discord embed appears

3. **Test Error Handling**
   - Ask a question that might fail
   - Verify error appears in Discord with red embed

4. **Test Conversation**
   - Ask multiple related questions
   - Verify each gets context from previous

5. **Verify Logging**
   - Run `/gemini debug`
   - Check all Bridge status indicators

6. **Final Confirmation**
   - All embeds appear in Discord
   - All responses appear in Minecraft
   - Console shows no errors

---

## 📝 What to Report

If something doesn't work, provide:

1. **Exact command you ran**
   ```
   /say @g [your question]
   ```

2. **What you expected**
   ```
   Discord embed with question and answer
   ```

3. **What you got**
   ```
   No embed appeared
   ```

4. **Console output**
   ```
   [Copy the relevant log lines]
   ```

5. **Debug info**
   ```
   /gemini debug
   [Copy the output]
   ```

---

**Test Date**: [Date you test]
**Plugin Version**: 1.0.0+
**Status**: Ready to test ✅

