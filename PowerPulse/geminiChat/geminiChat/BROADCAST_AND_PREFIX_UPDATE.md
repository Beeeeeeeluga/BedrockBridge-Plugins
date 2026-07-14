# Broadcast & Custom Prefix Update

**Date**: 2025-11-20
**Features Added**:
1. Broadcast responses to all players (not just requesting player)
2. Configurable custom prefix name
**Status**: ✅ IMPLEMENTED

---

## 🎯 What Was Fixed

**Problem 1: Only requesting player sees responses**
- Other players couldn't see Gemini responses
- Responses were sent only to `player.sendMessage()`

**Problem 2: Prefix was hardcoded as "[Gemini]"**
- Couldn't change to "BlockAI", "BedrockBridgeAI", or custom names
- Had to modify code to change prefix

---

## ✅ Solution Implemented

### Feature 1: Broadcast Responses

**What Changed**:
- Responses now sent to entire world via `world.sendMessage()`
- All players see Gemini responses in chat
- Configurable - can turn off and send only to requesting player

**How It Works**:
```javascript
// New config option: broadcastResponses (default: true)

if (broadcastResponses) {
    world.sendMessage(messagePart);  // Everyone sees it
} else {
    player.sendMessage(messagePart);  // Only requester sees it
}
```

### Feature 2: Custom Prefix

**What Changed**:
- New config option: `responsePrefix` (default: "BlockAI")
- Change it to any name you want
- Applies to responses, errors, and typing indicators

**How It Works**:
```javascript
// New config option: responsePrefix (default: "BlockAI")
const responsePrefix = getConfig("responsePrefix", "BlockAI");

// Used in all messages
§9§l[${responsePrefix}] §r§fMessage text...
```

---

## 🔧 Configuration Changes

### New Config Options Added

**1. `responsePrefix`** (String)
- Default: `"BlockAI"`
- Used for: Response messages, errors, typing indicators
- Examples: `"BedrockBridgeAI"`, `"AIAssistant"`, `"BlockGenius"`

**2. `broadcastResponses`** (Boolean)
- Default: `true`
- If `true`: All players see responses (broadcast)
- If `false`: Only requesting player sees responses

---

## 📝 How to Change Settings

### Option 1: In-Game Command (Admin)

**Change prefix to "BedrockBridgeAI"**:
```minecraft
/gemini setkey [existing_key]  # First (if needed to access admin features)
```
(You'll need to add a command interface for this - see below)

### Option 2: Direct Config Modification

In `config.js`, change:
```javascript
responsePrefix: "BlockAI"  // Change to what you want
broadcastResponses: true   // false to disable broadcasting
```

### Option 3: Via Command (If Implemented)

Future enhancement to add:
```minecraft
/gemini setprefix BedrockBridgeAI
/gemini setbroadcast true/false
```

---

## 🎨 Visual Examples

### Before (Only Requester Saw)
```
Steve asks: /say @g test

Console:
[CHAT] Response sent to Steve in 1 part(s)

Chat (Steve only sees):
[Gemini] Response text...

Chat (Other players see):
(nothing - they don't see the response)
```

### After (Everyone Sees + Custom Prefix)

**With broadcastResponses: true**:
```
Steve asks: /say @g test

Console:
[CHAT] Response sent to all players in 1 part(s)

Chat (All players see):
[BedrockBridgeAI] Response text...
[BedrockBridgeAI] (continuation if multiple parts)
```

**With broadcastResponses: false**:
```
Steve asks: /say @g test

Console:
[CHAT] Response sent to Steve in 1 part(s)

Chat (Only Steve sees):
[BedrockBridgeAI] Response text...

Chat (Other players see):
(nothing)
```

---

## 📊 Files Modified

### 1. config.js (Lines 12-28)
- Added: `responsePrefix: "BlockAI"`
- Added: `broadcastResponses: true`

### 2. main.js (Multiple locations)

**Lines 124-133**: Typing indicator
- Now uses `responsePrefix` from config
- Now broadcasts if `broadcastResponses` is true

**Lines 160-168**: Error message
- Now uses `responsePrefix` from config
- Now broadcasts if `broadcastResponses` is true

**Lines 173-174**: Get config values
- Retrieves `responsePrefix` and `broadcastResponses`

**Lines 177**: Format with custom prefix
- Passes `responsePrefix` to `formatMultilineResponse()`

**Lines 196-206**: Send response
- Uses `world.sendMessage()` if broadcasting
- Uses `player.sendMessage()` if not broadcasting

### 3. messageFormatter.js (Lines 108-117)
- Updated: `formatMultilineResponse(responseText, customPrefix)`
- Now accepts custom prefix parameter
- Uses prefix in all formatted messages

---

## 🧪 Testing

### Test 1: Broadcast to All Players

**Setup**: 2+ players on server

**Command**:
```
Player 1: /say @g What is mining?
```

**Expected Result**:
- ✅ Player 1 sees response
- ✅ Player 2 sees same response
- ✅ All players see: `[BedrockBridgeAI] response text...`
- ✅ Console shows: `Response sent to all players`

### Test 2: Custom Prefix

**If you change config to**:
```javascript
responsePrefix: "BedrockBridgeAI"
```

**You should see**:
```
[BedrockBridgeAI] Typing...
[BedrockBridgeAI] Response text...
```

Instead of:
```
[BlockAI] Typing...
[BlockAI] Response text...
```

### Test 3: Disable Broadcasting

**If you change config to**:
```javascript
broadcastResponses: false
```

**Result**:
- Only Player 1 (requester) sees response
- Player 2 sees nothing
- Console shows: `Response sent to Steve only`

---

## 🎯 Common Configurations

### Configuration 1: Everyone Sees (Default)
```javascript
responsePrefix: "BlockAI",
broadcastResponses: true
```
Result: `[BlockAI] Everyone sees responses`

### Configuration 2: Custom Name, Everyone Sees
```javascript
responsePrefix: "BedrockBridgeAI",
broadcastResponses: true
```
Result: `[BedrockBridgeAI] Everyone sees responses`

### Configuration 3: Only Requester Sees
```javascript
responsePrefix: "PrivateAI",
broadcastResponses: false
```
Result: Only requester sees `[PrivateAI] response`

### Configuration 4: Server-Wide AI Assistant
```javascript
responsePrefix: "ServerAI",
broadcastResponses: true
```
Result: `[ServerAI] Everyone sees and uses responses`

---

## 💾 How Config Is Stored

When you set a config value:
```javascript
setConfig("responsePrefix", "MyCustomName");
setConfig("broadcastResponses", false);
```

It's stored in world dynamic properties:
```
gemini:config:responsePrefix = "MyCustomName"
gemini:config:broadcastResponses = false
```

These persist across server restarts!

---

## 📋 Default Values

All defaults are in config.js:
```javascript
const DEFAULTS = {
    responsePrefix: "BlockAI",        // NEW
    broadcastResponses: true,         // NEW
    // ... other settings
};
```

If you never change them:
- Responses broadcast to everyone
- Prefix shows as "[BlockAI]"

---

## 🔄 Backward Compatibility

✅ Completely backward compatible:
- Existing conversations still work
- All other features unchanged
- Just adds new config options
- If not configured, uses defaults

---

## 🎊 Features Summary

### New Capabilities

✅ **Broadcast Responses**
- All players see Gemini responses
- Optional - can disable if needed
- Works with multiline messages

✅ **Custom Prefix**
- Any name: "BedrockBridgeAI", "BlockGenius", etc.
- Applies to responses, errors, typing
- Easy to change in config

✅ **Flexibility**
- Can broadcast or keep private
- Multiple prefix options
- Per-server customization

### What's Included

- [x] Broadcast via `world.sendMessage()`
- [x] Custom prefix in config
- [x] Typing indicator broadcasts
- [x] Error message broadcasts
- [x] Response message broadcasts
- [x] All multiline parts broadcast
- [x] Console logging shows broadcast status
- [x] Backward compatible

---

## 📚 Console Output

When responses are broadcast:
```
[CHAT] Typing indicator sent to all players
[CHAT] Response formatted into 2 part(s) for Steve
[CHAT] Broadcasted response part to all players
[CHAT] Broadcasted response part to all players
[CHAT] Response sent to all players in 2 part(s)
```

When responses are private:
```
[CHAT] Typing indicator sent to Steve only
[CHAT] Response formatted into 2 part(s) for Steve
[CHAT] Sent response part to Steve only
[CHAT] Sent response part to Steve only
[CHAT] Response sent to Steve only in 2 part(s)
```

---

## ✨ Summary

**Now possible**:
- ✅ Everyone sees AI responses in chat
- ✅ Customize prefix to any name
- ✅ Keep responses private if wanted
- ✅ Change settings without code modification
- ✅ Easy server-wide AI assistant setup

**Version**: 1.0.0+
**Status**: IMPLEMENTED AND READY
**Date**: 2025-11-20

