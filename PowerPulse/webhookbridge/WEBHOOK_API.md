# 🔌 Webhook Addon API Documentation

**Version:** 4.0.0
**Type:** BedrockBridge Plugin Addon
**Purpose:** Unified webhook API for other BedrockBridge plugins

---

## Overview

The Webhook Addon provides a simple, powerful API for other BedrockBridge plugins to send messages to Discord webhooks without managing the complexity of webhook management, retries, rate limiting, or error handling.

Think of it like `BridgeDirect`, but for webhooks!

### Key Features
- ✅ Simple, intuitive API
- ✅ Automatic retry logic
- ✅ Rate limiting handling
- ✅ Error event system
- ✅ Message batching
- ✅ Health monitoring
- ✅ Event hooks (before/after send)

---

## How to Use

### Step 1: Import the Webhook Addon

In your BedrockBridge plugin:

```javascript
import { bridge } from "esploratori/bridgeAPI";
import { webhookAddon } from "../webhookbridge/webhook-addon.js";

// Wait for bridge to initialize
bridge.events.bridgeInitialize.subscribe((e) => {
  // Webhook addon will be available after initialization
  if (webhookAddon.isReady()) {
    console.log("Webhook addon is ready!");
  }
});
```

### Step 2: Send a Webhook Message

```javascript
// Simple text message
await webhookAddon.sendText(
  "Hello Discord!",
  "general"  // webhook type
);

// Rich embed
await webhookAddon.sendRichEmbed({
  title: "My Event",
  description: "Something happened",
  color: 0x2ECC71,
  webhookType: "general"
});

// Custom embed
const embed = {
  title: "Custom Embed",
  description: "Full control over the embed",
  color: 0xFF5733,
  fields: [
    { name: "Field 1", value: "Value 1", inline: true },
    { name: "Field 2", value: "Value 2", inline: true }
  ]
};

await webhookAddon.sendEmbed(embed, "general");
```

---

## API Reference

### Main Methods

#### `sendMessage(webhookType, data, options)`

Sends a raw Discord message object to a webhook.

**Parameters:**
- `webhookType` *(string)* - Type of webhook (e.g., 'general', 'chat', 'playerEvents')
- `data` *(object)* - Discord message data (embeds, content, etc.)
- `options` *(object)* - Additional options:
  - `immediate` *(boolean)* - Send immediately instead of batching (default: false)
  - `footer` *(object)* - Add footer to embed

**Returns:** `Promise<{success: true, webhookType: string}>`

**Example:**
```javascript
await webhookAddon.sendMessage('general', {
  content: "Hello!",
  embeds: [{
    title: "Embed Title",
    description: "Embed Description",
    color: 0x3498DB
  }]
});
```

---

#### `sendText(content, webhookType, options)`

Sends a simple text message to Discord.

**Parameters:**
- `content` *(string)* - Message text (max 2000 characters)
- `webhookType` *(string, optional)* - Webhook type (default: 'general')
- `options` *(object, optional)* - Additional options

**Returns:** `Promise<{success: true, webhookType: string}>`

**Example:**
```javascript
await webhookAddon.sendText("Player joined the server!", "playerEvents");
```

---

#### `sendEmbed(embed, webhookType, options)`

Sends a single Discord embed.

**Parameters:**
- `embed` *(object)* - Discord embed object
- `webhookType` *(string, optional)* - Webhook type (default: 'general')
- `options` *(object, optional)* - Additional options

**Returns:** `Promise<{success: true, webhookType: string}>`

**Example:**
```javascript
const embed = {
  title: "Player Event",
  description: "John joined the server",
  color: 0x2ECC71
};

await webhookAddon.sendEmbed(embed, "playerEvents");
```

---

#### `sendEmbeds(embeds, webhookType, options)`

Sends multiple embeds in a single message (max 10).

**Parameters:**
- `embeds` *(array)* - Array of embed objects
- `webhookType` *(string, optional)* - Webhook type (default: 'general')
- `options` *(object, optional)* - Additional options

**Returns:** `Promise<{success: true, webhookType: string}>`

**Example:**
```javascript
const embeds = [
  { title: "Embed 1", color: 0xFF0000 },
  { title: "Embed 2", color: 0x00FF00 },
  { title: "Embed 3", color: 0x0000FF }
];

await webhookAddon.sendEmbeds(embeds, "general");
```

---

#### `sendRichEmbed(config)`

Sends a rich, pre-formatted embed with common fields. Great for simple use cases!

**Parameters:**
- `config` *(object)* - Configuration object with properties:
  - `title` *(string, optional)* - Embed title
  - `description` *(string, optional)* - Embed description
  - `color` *(number, optional)* - Embed color (hex, default: 0x3498DB)
  - `fields` *(array, optional)* - Array of field objects
  - `footerText` *(string, optional)* - Footer text
  - `footerIcon` *(string, optional)* - Footer icon URL
  - `authorName` *(string, optional)* - Author name
  - `authorIcon` *(string, optional)* - Author icon URL
  - `thumbnailUrl` *(string, optional)* - Thumbnail image URL
  - `imageUrl` *(string, optional)* - Main image URL
  - `webhookType` *(string, optional)* - Webhook type (default: 'general')
  - `immediate` *(boolean, optional)* - Send immediately (default: false)

**Returns:** `Promise<{success: true, webhookType: string}>`

**Example:**
```javascript
await webhookAddon.sendRichEmbed({
  title: "Player Statistics",
  description: "Current server statistics",
  color: 0x2ECC71,
  fields: [
    { name: "Players Online", value: "5", inline: true },
    { name: "Uptime", value: "2h 30m", inline: true }
  ],
  footerText: "Server Stats",
  webhookType: "analytics"
});
```

---

### Helper Functions

#### `createPlayerEventEmbed(playerName, playerId, eventType, additionalFields)`

Creates a formatted embed for player events.

**Parameters:**
- `playerName` *(string)* - Player name
- `playerId` *(string)* - Player ID
- `eventType` *(string)* - Type: 'join', 'leave', 'death', 'achievement'
- `additionalFields` *(array, optional)* - Extra fields to add

**Returns:** *(object)* - Formatted embed object

**Example:**
```javascript
import { createPlayerEventEmbed } from "../webhookbridge/webhook-addon.js";

const embed = createPlayerEventEmbed(
  "John",
  "player-123",
  "join",
  [
    { name: "Level", value: "10", inline: true }
  ]
);

await webhookAddon.sendEmbed(embed, "playerEvents");
```

---

#### `createChatEmbed(playerName, message, serverName)`

Creates a formatted embed for chat messages.

**Parameters:**
- `playerName` *(string)* - Player who sent the message
- `message` *(string)* - Chat message content
- `serverName` *(string, optional)* - Server name for footer

**Returns:** *(object)* - Formatted embed object

**Example:**
```javascript
import { createChatEmbed } from "../webhookbridge/webhook-addon.js";

const embed = createChatEmbed("John", "Hello everyone!", "My Server");
await webhookAddon.sendEmbed(embed, "chat");
```

---

#### `createErrorEmbed(errorTitle, errorMessage, context)`

Creates a formatted embed for errors.

**Parameters:**
- `errorTitle` *(string)* - Error title
- `errorMessage` *(string)* - Error description
- `context` *(object, optional)* - Additional context fields

**Returns:** *(object)* - Formatted embed object

**Example:**
```javascript
import { createErrorEmbed } from "../webhookbridge/webhook-addon.js";

const embed = createErrorEmbed(
  "Database Error",
  "Failed to connect to database",
  { "Retry Count": 3, "Status": "Failed" }
);

await webhookAddon.sendEmbed(embed, "errors");
```

---

#### `createSuccessEmbed(title, description, fields)`

Creates a formatted embed for success messages.

**Parameters:**
- `title` *(string)* - Success title
- `description` *(string)* - Success description
- `fields` *(array, optional)* - Additional fields

**Returns:** *(object)* - Formatted embed object

**Example:**
```javascript
import { createSuccessEmbed } from "../webhookbridge/webhook-addon.js";

const embed = createSuccessEmbed(
  "Database Connected",
  "Successfully connected to database",
  [{ name: "Connection Time", value: "245ms", inline: true }]
);

await webhookAddon.sendEmbed(embed, "general");
```

---

### Status & Health Methods

#### `isReady()`

Check if the webhook addon is ready to use.

**Returns:** *(boolean)*

**Example:**
```javascript
if (webhookAddon.isReady()) {
  await webhookAddon.sendText("Ready!");
}
```

---

#### `getHealthReport()`

Get detailed health status of all webhooks.

**Returns:** *(object)* - Health report with success rates, circuit breaker states, etc.

**Example:**
```javascript
const health = webhookAddon.getHealthReport();
console.log(health);
// Output:
// {
//   "https://discord.com/api/webhooks/...": {
//     "attempts": 100,
//     "success": 98,
//     "failed": 2,
//     "successRate": 98,
//     "circuitState": "CLOSED"
//   }
// }
```

---

#### `getWebhookList()`

Get list of all configured webhooks.

**Returns:** *(array)* - Array of webhook info objects

**Example:**
```javascript
const webhooks = webhookAddon.getWebhookList();
webhooks.forEach(wh => {
  console.log(`${wh.name}: ${wh.valid ? '✓' : '✗'}`);
});
// Output:
// general: ✓
// chat: ✓
// playerEvents: ✓
// ...
```

---

### Event Listeners

#### `onBeforeSend(callback)`

Listen to before-send events.

**Parameters:**
- `callback` *(function)* - Called with {webhookType, data, options}

**Returns:** *(function)* - Unsubscribe function

**Example:**
```javascript
const unsubscribe = webhookAddon.onBeforeSend(({ webhookType, data, options }) => {
  console.log(`Sending webhook: ${webhookType}`);
});

// Later, to stop listening:
unsubscribe();
```

---

#### `onAfterSend(callback)`

Listen to after-send events.

**Parameters:**
- `callback` *(function)* - Called with {webhookType, data, options}

**Returns:** *(function)* - Unsubscribe function

**Example:**
```javascript
webhookAddon.onAfterSend(({ webhookType, data }) => {
  console.log(`Webhook sent: ${webhookType}`);
});
```

---

#### `onError(callback)`

Listen to error events.

**Parameters:**
- `callback` *(function)* - Called with {webhookType, data, error}

**Returns:** *(function)* - Unsubscribe function

**Example:**
```javascript
webhookAddon.onError(({ webhookType, error }) => {
  console.error(`Webhook error for ${webhookType}:`, error.message);
});
```

---

## Webhook Types

The following webhook types are available by default:

| Type | Purpose | Use Case |
|------|---------|----------|
| `general` | Default webhook | General purpose messages |
| `chat` | Chat messages | Chat logging |
| `playerEvents` | Player join/leave | Player tracking |
| `deaths` | Player deaths | Death logging |
| `achievements` | Achievements | Achievement tracking |
| `serverEvents` | Server events | Server start/stop |
| `worldEvents` | World events | Weather, time changes |
| `blockLogs` | Block changes | Block monitoring |
| `commands` | Command execution | Command logging |
| `moderation` | Moderation actions | Bans, kicks, mutes |
| `analytics` | Statistics | Analytics reports |
| `errors` | Error logging | Error tracking |
| `teleportLogs` | Player teleports | Teleport tracking |
| `weatherEvents` | Weather changes | Weather monitoring |

---

## Error Handling

All methods throw errors if something goes wrong:

```javascript
try {
  await webhookAddon.sendText("Hello!");
} catch (error) {
  console.error("Failed to send webhook:", error.message);
  // Handle error...
}
```

Common errors:
- **"Addon not ready"** - Webhook addon not initialized yet
- **"No webhook URL configured"** - Webhook type not configured
- **"Invalid webhook URL"** - Malformed webhook URL
- **"Content exceeds 2000 character limit"** - Message too long
- **"Maximum 10 embeds per message"** - Too many embeds

---

## Complete Example: Custom Plugin

Here's a complete example of a plugin using the Webhook API:

```javascript
import { world } from "@minecraft/server";
import { bridge } from "esploratori/bridgeAPI";
import {
  webhookAddon,
  createPlayerEventEmbed
} from "../webhookbridge/webhook-addon.js";

// Initialize
bridge.events.bridgeInitialize.subscribe((e) => {
  e.registerAddition("webhook_addon");
});

// Track player joins
world.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn && webhookAddon.isReady()) {
    const embed = createPlayerEventEmbed(
      event.player.name,
      event.player.id,
      "join"
    );

    webhookAddon.sendEmbed(embed, "playerEvents")
      .catch(err => console.error("Webhook error:", err));
  }
});

// Track player deaths
world.afterEvents.entityDie.subscribe((event) => {
  if (event.deadEntity instanceof Player && webhookAddon.isReady()) {
    const embed = createPlayerEventEmbed(
      event.deadEntity.name,
      event.deadEntity.id,
      "death",
      [
        {
          name: "Location",
          value: `${Math.floor(event.deadEntity.location.x)}, ${Math.floor(event.deadEntity.location.y)}, ${Math.floor(event.deadEntity.location.z)}`,
          inline: true
        }
      ]
    );

    webhookAddon.sendEmbed(embed, "deaths")
      .catch(err => console.error("Webhook error:", err));
  }
});

// Listen for webhook errors
webhookAddon.onError(({ webhookType, error }) => {
  console.error(`[MyPlugin] Webhook ${webhookType} failed:`, error.message);
});

console.log("[MyPlugin] Loaded with webhook support!");
```

---

## Best Practices

### Do ✅
- Use appropriate webhook types for different events
- Handle errors with try-catch
- Use helper functions for common embeds
- Set `immediate: true` only for critical messages
- Check `isReady()` before sending

### Don't ❌
- Don't send very large messages (keep under 6000 characters per message)
- Don't send more than 10 embeds per message
- Don't use `immediate: true` for high-volume events
- Don't ignore error events
- Don't send sensitive information to Discord

---

## Performance Tips

### Message Batching
By default, messages are batched for efficiency:
```javascript
// These 10 messages will be sent together (1 second later)
for (let i = 0; i < 10; i++) {
  await webhookAddon.sendText(`Message ${i}`, "general");
}
```

### Immediate Send
For critical messages, send immediately:
```javascript
await webhookAddon.sendText("Critical error!", "errors", { immediate: true });
```

### Event Listeners
Use listeners for debugging:
```javascript
webhookAddon.onBeforeSend(({ webhookType }) => {
  console.log(`Sending ${webhookType}...`);
});
```

---

## Troubleshooting

### Addon not ready
```javascript
if (!webhookAddon.isReady()) {
  console.warn("Webhook addon not ready yet, trying again in 5 seconds...");
  // Retry later
}
```

### Messages not appearing
1. Check console for errors
2. Verify webhook URL with `getHealthReport()`
3. Check Discord channel permissions
4. Enable error listener

### High latency
1. Use message batching (default behavior)
2. Avoid using `immediate: true` for all messages
3. Check Discord rate limits with `getHealthReport()`

---

## Migration from Manual Webhooks

If you were manually sending webhooks:

**Before:**
```javascript
import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net";

// Complex manual handling...
const request = new HttpRequest(url)
  .setMethod(HttpRequestMethod.Post)
  .setHeaders([new HttpHeader("Content-Type", "application/json")]);
request.body = JSON.stringify(data);
const response = await http.request(request);
// Error handling, retries...
```

**After:**
```javascript
import { webhookAddon } from "../webhookbridge/webhook-addon.js";

// Simple!
await webhookAddon.sendText("Hello Discord!", "general");
```

---

## API Version

- **Current Version:** 4.0.0
- **BedrockBridge Version:** 1.6.10+
- **Minecraft Bedrock:** Latest

---

## Support

- **Issues?** Check the webhook health: `webhookAddon.getHealthReport()`
- **Errors?** Enable error listener: `webhookAddon.onError(...)`
- **Debug?** Check main plugin logs for `[Webhook]` messages

---

**Ready to use the Webhook API in your plugin!** 🚀
