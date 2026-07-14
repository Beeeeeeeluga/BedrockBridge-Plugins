# 🔌 Webhook Addon Integration Guide

**Version:** 4.0.0
**Type:** BedrockBridge Plugin API Extension
**Status:** ✅ Production Ready

---

## What is the Webhook Addon?

The Webhook Addon is a **unified API** that other BedrockBridge plugins can use to send messages to Discord webhooks. It's similar to `BridgeDirect`, but specifically designed for webhook integration.

### Key Differences from Manual Webhooks

| Aspect | Manual Webhooks | Webhook Addon |
|--------|-----------------|----------------|
| Complexity | High (HTTP requests, headers, etc.) | Low (simple function calls) |
| Error Handling | Manual | Automatic (retries, logging) |
| Rate Limiting | Manual | Automatic |
| Message Batching | Manual | Automatic |
| Health Monitoring | Not included | Built-in |
| Configuration | Per-plugin | Centralized |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Other BedrockBridge Plugins              │
│    (use webhookAddon.sendEmbed(...), etc.)       │
└────────────────────┬────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────┐
│         Webhook Addon (webhook-addon.js)         │
│  - API Methods                                    │
│  - Event System (before/after/error)             │
│  - Error Handling                                │
└────────────────────┬────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────┐
│    Discord Webhook Plugin (main.js)             │
│  - WebhookManager (HTTP, retries, rate limit)    │
│  - PlayerTracker                                 │
│  - Event Handlers                                │
│  - Configuration                                 │
└────────────────────┬────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────┐
│       Discord Webhooks                           │
│    (HTTP requests to Discord API)                │
└─────────────────────────────────────────────────┘
```

---

## File Structure

```
D:\BB\
├── bridgeAPI/
│   └── webhookAddon.md          ← API documentation
│
└── bridgePlugins/
    └── webhookbridge/
        ├── main.js              ← Main plugin (creates addon instance)
        ├── index.js             ← Entry point
        ├── webhook-addon.js     ← Addon implementation ⭐
        ├── WEBHOOK_API.md       ← API reference documentation
        ├── ADDON_INTEGRATION.md ← This file
        │
        └── examples/
            ├── example-player-tracker.js    ← Full example
            └── example-simple-message.js    ← Simple example
```

---

## How It Works

### Step 1: Plugin Initialization

When the Discord Webhook Plugin starts:

1. `index.js` imports `main.js`
2. `main.js` initializes WebhookManager and PlayerTracker
3. `main.js` imports and creates WebhookAddon instance
4. WebhookAddon is exposed globally as `webhookAddon`

### Step 2: Other Plugins Use It

Other plugins can import and use the addon:

```javascript
import { webhookAddon } from "../webhookbridge/webhook-addon.js";

// Or access globally:
// const { webhookAddon } = globalThis;

await webhookAddon.sendText("Hello Discord!", "general");
```

### Step 3: Message Processing

```
Plugin calls sendEmbed()
         ↓
Addon validates & fires onBeforeSend event
         ↓
Message added to queue (or sent immediately)
         ↓
WebhookManager processes queue (batched)
         ↓
HTTP request to Discord API
         ↓
Response received
         ↓
Addon fires onAfterSend or onError event
```

---

## Integration with BedrockBridge

The addon integrates seamlessly with BedrockBridge's plugin system:

### Using the Bridge API

```javascript
import { bridge } from "esploratori/bridgeAPI";

// Register your addon usage
bridge.events.bridgeInitialize.subscribe((e) => {
  e.registerAddition("webhook_addon");
  // Now your plugin is registered as using webhook addon
});
```

### Global Access

The addon is automatically exposed globally:

```javascript
// Import method (recommended)
import { webhookAddon } from "../webhookbridge/webhook-addon.js";

// OR global access
const { webhookAddon } = globalThis;

// Both work!
await webhookAddon.sendText("Hello!");
```

---

## Quick Integration Example

### Step 1: Import the Addon

```javascript
import { world } from "@minecraft/server";
import { webhookAddon } from "../webhookbridge/webhook-addon.js";
```

### Step 2: Check Ready Status

```javascript
if (!webhookAddon.isReady()) {
  console.warn("Webhook addon not ready yet");
  return;
}
```

### Step 3: Send a Message

```javascript
// Simple text
await webhookAddon.sendText("Player joined!", "playerEvents");

// Rich embed
const embed = {
  title: "Custom Event",
  description: "Something happened",
  color: 0x3498DB
};
await webhookAddon.sendEmbed(embed, "general");

// Using helper
await webhookAddon.sendRichEmbed({
  title: "Player Event",
  description: `${player.name} joined`,
  color: 0x2ECC71,
  webhookType: "playerEvents"
});
```

---

## API Summary

### Core Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `sendText()` | Send plain text | `sendText("Hello!", "general")` |
| `sendEmbed()` | Send single embed | `sendEmbed(embed, "general")` |
| `sendEmbeds()` | Send multiple embeds | `sendEmbeds([e1, e2], "general")` |
| `sendMessage()` | Send raw Discord object | `sendMessage("general", data)` |
| `sendRichEmbed()` | Send pre-formatted embed | `sendRichEmbed({...})` |

### Status Methods

| Method | Purpose |
|--------|---------|
| `isReady()` | Check if addon is initialized |
| `getHealthReport()` | Get webhook health status |
| `getWebhookList()` | List all webhooks |

### Event Methods

| Method | Purpose |
|--------|---------|
| `onBeforeSend()` | Listen before message sent |
| `onAfterSend()` | Listen after message sent |
| `onError()` | Listen for errors |

### Helper Functions

| Function | Purpose |
|----------|---------|
| `createPlayerEventEmbed()` | Format player event embed |
| `createChatEmbed()` | Format chat message embed |
| `createErrorEmbed()` | Format error embed |
| `createSuccessEmbed()` | Format success embed |

---

## Common Use Cases

### 1. Track Player Events

```javascript
import { world } from "@minecraft/server";
import { webhookAddon, createPlayerEventEmbed } from "../webhookbridge/webhook-addon.js";

world.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn && webhookAddon.isReady()) {
    const embed = createPlayerEventEmbed(event.player.name, event.player.id, "join");
    webhookAddon.sendEmbed(embed, "playerEvents");
  }
});
```

### 2. Log Custom Events

```javascript
world.beforeEvents.chatSend.subscribe((event) => {
  if (event.message.startsWith("!special")) {
    webhookAddon.sendRichEmbed({
      title: "Special Command Used",
      description: `${event.sender.name} used special command`,
      color: 0xFF0000,
      webhookType: "commands"
    });
  }
});
```

### 3. Send Error Reports

```javascript
try {
  // Do something risky
} catch (error) {
  const embed = {
    title: "⚠️ Plugin Error",
    description: error.message,
    color: 0xE74C3C
  };
  webhookAddon.sendEmbed(embed, "errors", { immediate: true });
}
```

### 4. Monitor Server Health

```javascript
system.runInterval(() => {
  const players = world.getAllPlayers().length;
  const health = webhookAddon.getHealthReport();

  if (players > 10) {
    webhookAddon.sendRichEmbed({
      title: "High Player Count",
      description: `${players} players online`,
      color: 0xFFA500,
      webhookType: "analytics"
    });
  }
}, 3600);  // Every hour
```

---

## Error Handling

Always wrap webhook calls in try-catch:

```javascript
try {
  await webhookAddon.sendText("Hello Discord!", "general");
  console.log("Message sent successfully");
} catch (error) {
  console.error("Failed to send webhook:", error.message);

  // Handle specific errors:
  if (error.message.includes("Addon not ready")) {
    console.warn("Waiting for addon initialization...");
  } else if (error.message.includes("No webhook URL")) {
    console.error("Webhook not configured for this type");
  } else {
    console.error("Unknown error:", error);
  }
}
```

Or use event listeners:

```javascript
webhookAddon.onError(({ webhookType, error }) => {
  console.error(`Webhook ${webhookType} failed:`, error.message);
  // Log to file, notify admin, etc.
});
```

---

## Configuration

The addon uses the configuration from `main.js`. To modify webhooks:

**Edit:** `D:\BB\bridgePlugins\webhookbridge\main.js`

**Webhook URLs:** Lines 22-35
```javascript
webhooks: {
  general: "YOUR_WEBHOOK_URL",
  chat: "YOUR_WEBHOOK_URL",
  playerEvents: "YOUR_WEBHOOK_URL",
  // ... etc
}
```

**Features:** Lines 38-91 (enable/disable event tracking)

---

## Testing

### Test Method 1: Direct Call

```javascript
// In your plugin
webhookAddon.sendText("Test message!", "general");
```

### Test Method 2: Chat Command

```javascript
world.beforeEvents.chatSend.subscribe((event) => {
  if (event.message === "!webhook-test") {
    event.cancel = true;
    webhookAddon.sendText("Test from webhook!", "general");
    event.sender.sendMessage("Webhook test sent!");
  }
});
```

### Test Method 3: Health Check

```javascript
const health = webhookAddon.getHealthReport();
console.log(health);
// Verify webhooks are healthy
```

---

## Best Practices

### Do ✅
- Always check `isReady()` before sending
- Use appropriate webhook types
- Handle errors with try-catch
- Use helper functions for common patterns
- Monitor webhook health periodically
- Use `immediate: true` only for critical messages

### Don't ❌
- Don't send very frequently to the same webhook
- Don't send sensitive player data to Discord
- Don't use `immediate: true` for all messages
- Don't ignore errors
- Don't send more than 10 embeds per message
- Don't exceed 2000 characters per message

---

## Debugging

### Enable Debug Mode

Edit `main.js` line 168:
```javascript
debug: {
  enabled: true,  // Enable detailed logging
  testMode: false
}
```

### Check Webhook Health

```javascript
const health = webhookAddon.getHealthReport();
console.log(health);

// Output shows:
// - Success rate per webhook
// - Circuit breaker state
// - Number of attempts and failures
```

### Monitor Events

```javascript
webhookAddon.onBeforeSend(({ webhookType, data }) => {
  console.log(`📤 Sending ${webhookType}...`);
});

webhookAddon.onAfterSend(({ webhookType }) => {
  console.log(`📩 Sent ${webhookType} ✓`);
});

webhookAddon.onError(({ webhookType, error }) => {
  console.error(`❌ Error in ${webhookType}:`, error.message);
});
```

---

## Performance

### Message Batching

By default, messages are batched for efficiency:

```javascript
// These 10 messages will be sent together
for (let i = 0; i < 10; i++) {
  await webhookAddon.sendText(`Message ${i}`, "general");
}
// All sent in one HTTP request after ~1 second
```

### Immediate Send

For critical messages:

```javascript
await webhookAddon.sendText("Critical alert!", "errors", { immediate: true });
// Sent immediately, not batched
```

### Rate Limiting

The addon automatically handles Discord rate limiting:
- Tracks remaining requests
- Waits for rate limit reset
- Queues messages if rate limited
- Retries automatically

---

## Migration Guide

### From Manual Webhooks

**Before:**
```javascript
const request = new HttpRequest(url)
  .setMethod(HttpRequestMethod.Post)
  .setHeaders([new HttpHeader("Content-Type", "application/json")]);
request.body = JSON.stringify(data);
const response = await http.request(request);
```

**After:**
```javascript
await webhookAddon.sendMessage("general", data);
```

Much simpler! 🎉

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Addon not ready" error | Wait for initialization, check logs |
| Messages not appearing | Check webhook URL, verify Discord permissions |
| High latency | Reduce message frequency or increase batch size |
| Rate limit errors | Built-in handling, retries automatically |
| Plugin not loading | Check syntax, ensure webhook-addon.js exists |

---

## File Reference

### Main Files
- **webhook-addon.js** - Addon implementation
- **main.js** - Plugin initialization & addon registration
- **WEBHOOK_API.md** - Complete API documentation

### Examples
- **example-player-tracker.js** - Full featured example
- **example-simple-message.js** - Simple quick-start example

### Documentation
- **ADDON_INTEGRATION.md** - This file
- **WEBHOOK_API.md** - Detailed API reference
- **D:\BB\bridgeAPI\webhookAddon.md** - BedrockBridge API docs

---

## Version Info

- **Addon Version:** 4.0.0
- **Status:** ✅ Production Ready
- **BedrockBridge:** v1.6.10+
- **Minecraft Bedrock:** Latest

---

## Support

For detailed information:
1. **Quick Reference:** See examples/ folder
2. **API Details:** Read WEBHOOK_API.md
3. **Architecture:** Check main.js comments
4. **Troubleshooting:** Enable debug mode and check logs

---

**Ready to integrate webhooks into your plugins!** 🚀

Let me know if you need help with anything!
