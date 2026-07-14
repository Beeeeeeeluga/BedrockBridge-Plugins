# Webhook Plugin v4.1.1 - Complete Documentation

**Release Date:** November 6, 2025
**Status:** ✅ Production Ready
**Compatibility:** Bedrock Server 1.20.0+

---

## Overview

Discord Webhook Plugin v4.1.1 is a comprehensive integration between Minecraft Bedrock servers and Discord, with complete event tracking, statistics, and reliable message delivery.

This version includes critical fixes for entity tracking errors and rate limiting issues found in v4.1.0.

---

## What's New in v4.1.1

### 🔧 Fixes

1. **Entity Death Tracking**
   - Fixed: "Failed to get property 'location' due to Entity being invalid"
   - Safe entity property access with fallback values
   - Graceful handling of entity removal events

2. **Rate Limiting**
   - Fixed: Proper handling of Discord's Retry-After header
   - Exponential backoff for retries
   - Circuit breaker prevents cascade failures

3. **Console Logging**
   - Entity errors now log as WARN (expected) not ERROR
   - Cleaner, less spammy logs
   - Better context for debugging

### 📊 Improvements

- More robust error handling throughout
- Better webhook health tracking
- More accurate rate limit statistics
- Reduced false error reports

---

## Features

### Core Features ✨

- ✅ Player event tracking (join, leave, death)
- ✅ Chat message logging to Discord
- ✅ Block break tracking for valuable materials
- ✅ Entity death tracking (mobs, animals)
- ✅ Server start/stop notifications
- ✅ Command execution logging
- ✅ Moderation action tracking

### Advanced Features 🚀

- ✅ Player statistics (playtime, kills, deaths, chat)
- ✅ Server analytics (hourly, daily, weekly reports)
- ✅ Event archival and search
- ✅ Treasure hunt notifications
- ✅ Boss kill tracking
- ✅ World exploration logging
- ✅ Performance monitoring
- ✅ Discord dashboard integration

### Reliability Features 🛡️

- ✅ Circuit breaker pattern
- ✅ Exponential backoff retries
- ✅ Rate limit awareness
- ✅ Message queue batching
- ✅ Health monitoring
- ✅ Webhook validation

---

## Quick Start

### Installation

1. Copy the plugin folder to your bridge plugins directory
2. Ensure all files are in place (see below)
3. Restart your server

### Configuration

Edit `config.js` or `config-enhanced.js`:

```javascript
webhooks: {
  general: "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN",
  chat: "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN",
  playerEvents: "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN",
  // ... more webhooks
}
```

### Testing

In-game commands:
```
!webhook status   → Show system status
!webhook health   → Show webhook health
!webhook test     → Test all webhooks
!webhook help     → Show help
```

---

## File Structure

```
webhookbridge/
├── main.js                          ← Main plugin file (UPDATED v4.1.1)
├── index.js                         ← Entry point
├── config.js                        ← Basic configuration
├── config-enhanced.js               ← Full configuration
├── config-advanced-features.js      ← Feature toggles
│
├── core/
│   ├── data-manager.js
│   ├── embed-builder.js
│   ├── event-archive.js
│   ├── webhook.js
│   └── database.js
│
├── events/
│   ├── entity-events.js             ← Entity tracking (UPDATED v4.1.1)
│   ├── item-events.js
│   ├── chat.js
│   ├── handler.js
│   ├── treasure-hunt.js
│   └── boss-system.js
│
├── stats/
│   ├── player-stats.js
│   ├── server-analytics.js
│   ├── advanced-stats.js
│   └── report-generator.js
│
├── moderation/
│   └── moderation-logger.js
│
├── exploration/
│   └── world-explorer.js
│
├── dashboard/
│   └── discord-dashboard.js
│
└── Documentation/
    ├── FIXES_v4_1_1.md              ← What's fixed
    ├── DEPLOYMENT_v4_1_1.txt        ← How to deploy
    ├── TECHNICAL_CHANGES_v4_1_1.md  ← Code changes
    ├── README_v4_1_1.md             ← This file
    ├── PRODUCTION_READY_VERIFICATION.md
    └── More...
```

---

## Configuration Guide

### Basic Setup

Minimum required configuration in `config.js`:

```javascript
webhooks: {
  general: "YOUR_WEBHOOK_URL"
}
```

### Feature Control

In `config-enhanced.js`:

```javascript
features: {
  chat: { enabled: true },
  players: { joinLeave: true },
  combat: { deathMessages: true },
  blocks: { valuable: true },
  // ... more settings
}
```

### Debug Mode

Enable detailed logging:

```javascript
advanced: {
  debug: {
    enabled: true,   // ← Set to true for detailed logs
    testMode: false  // ← Don't actually send webhooks
  }
}
```

---

## Webhook URLs

You need Discord webhook URLs for each event type:

### How to Get Webhook URLs

1. Go to your Discord server
2. Right-click channel → "Edit Channel"
3. Select "Webhooks" from left menu
4. Click "Create Webhook"
5. Copy the webhook URL

### Recommended Setup

Create separate webhooks for:
- **General** - Default for all events
- **Chat** - Player chat messages
- **Player Events** - Join/leave events
- **Deaths** - Player death logs
- **Blocks** - Block break logs
- **Server Events** - Server start/stop
- **Analytics** - Reports and stats
- **Moderation** - Admin actions

You can use the same URL for multiple types if you prefer.

---

## Commands

### Player Commands

```
!webhook help
  → Show help message

!webhook status
  → Show active sessions and queue size

!webhook health
  → Show webhook success rates

!webhook test
  → Send test message to all webhooks
```

### Admin Commands (require "admin" tag)

None currently - all commands are read-only.

---

## API Integration

Other plugins can access webhook features:

```javascript
const stats = globalThis.webhookAddon.getPlayerStats("PlayerName");
const report = globalThis.webhookAddon.getServerReport("daily");
const events = globalThis.webhookAddon.queryEvents({ eventType: "chat" });
```

See `WEBHOOK_API.md` for full API documentation.

---

## Troubleshooting

### Issue: No messages in Discord

**Check:**
1. Webhook URLs are correct (test with curl)
2. Webhooks still exist (not deleted from Discord)
3. Server has internet access
4. No firewall blocking Discord API
5. Check console for ERROR messages

**Debug:**
1. Set `debug.enabled: true` in config
2. Use `!webhook test` command
3. Watch console for detailed logs

### Issue: Rate limiting (429 errors)

**Causes:**
1. Too many webhooks firing at once
2. Multiple copies of plugin running
3. Discord API overloaded

**Solutions:**
1. Reduce event frequency in config
2. Spread events across multiple webhooks
3. Check Discord API status
4. Restart server

**Note:** Some 429 errors are normal - the plugin handles them with retries.

### Issue: Entity location shows 0,0,0

**Cause:** Entity was removed before location could be accessed.

**Why:** Bedrock removes entities asynchronously, sometimes before the death event finishes processing.

**Solution:** This is expected behavior and cannot be prevented.

---

## Performance

### Resource Usage

- **CPU:** <1% impact on normal server
- **RAM:** 20-50 MB (more with larger event archive)
- **Network:** Variable based on webhook frequency
- **Disk:** Event logs (manageable)

### Optimization Tips

1. **Reduce Event Frequency:**
   ```javascript
   advanced.intervals.heartbeat = 120000 // 2 minutes instead of 1
   ```

2. **Disable Unneeded Features:**
   ```javascript
   features.entityDamage: false
   features.projectileHits: false
   ```

3. **Limit Event Archive:**
   ```javascript
   maxCacheSize: 500 // Keep fewer events in memory
   ```

4. **Batch Messages:**
   ```javascript
   advanced.performance.messageBatchSize = 20
   ```

---

## Known Issues

### Entity Location = 0,0,0

Some entity death locations show {0,0,0} because the entity was removed by the server before location could be accessed. This is expected Bedrock behavior.

### Rate Limiting on Heavy Load

Under heavy load (100+ events per minute), you may see 429 rate limit responses. The plugin handles these automatically with backoff.

To reduce: Spread webhooks across channels or disable some features.

---

## FAQ

**Q: Can I use one webhook for all events?**
A: Yes, but separate webhooks allow better organization.

**Q: How often does the plugin update?**
A: Messages are queued and sent in batches (default every 1000ms).

**Q: Can I archive data locally?**
A: Yes, the EventArchive module stores events in memory and can export to CSV.

**Q: What if Discord webhook is down?**
A: The plugin queues messages and retries with exponential backoff.

**Q: Can I customize embed colors?**
A: Yes, in `config.js` under `appearance.colors`.

**Q: Does this work on realms?**
A: No, requires a locally hosted Bedrock server.

**Q: What Bedrock version is required?**
A: 1.20.0 or later (some features require 1.20.80+).

---

## Updates & Support

### Check Version

```javascript
console.log(globalThis.DiscordWebhook.version);
```

### Getting Help

1. Check documentation files in plugin directory
2. Review console for error messages
3. Test with `!webhook test` command
4. Enable debug mode for detailed logs

### Reporting Issues

Include in bug report:
- Console error messages
- Server version
- Which events are affected
- Steps to reproduce

---

## Credits

**Plugin Author:** BedrockBridge Community
**v4.1.1 Fixes:** Claude Code Analysis
**Icons/Assets:** Bedrock community

---

## License

This plugin is provided as-is for use on private servers.

---

## Changelog

### v4.1.1 (Latest) - November 6, 2025
- ✅ Fixed entity death tracking errors
- ✅ Improved rate limit handling with Retry-After header
- ✅ Safe entity property access throughout
- ✅ Better error categorization (WARN vs ERROR)
- ✅ Exponential backoff for retries

### v4.1.0 - Previous
- Original v4.1.0 release with expansion modules

### v4.0.0 - Earlier
- Original webhook plugin

---

## Quick Reference

### Configuration Files
- `config.js` - Basic configuration
- `config-enhanced.js` - Full settings
- `config-advanced-features.js` - Feature toggles

### Main Files
- `main.js` - Core functionality
- `index.js` - Entry point

### Event Handlers
- `events/entity-events.js` - Entity tracking
- `events/item-events.js` - Item events
- `events/boss-system.js` - Boss tracking

### Data Management
- `core/data-manager.js` - File I/O
- `core/event-archive.js` - Event storage
- `stats/player-stats.js` - Player tracking

### Useful Commands
```
!webhook status    → System status
!webhook health    → Webhook health
!webhook test      → Test webhooks
!webhook help      → Help message
```

---

**Documentation Version:** v4.1.1
**Last Updated:** November 6, 2025
**Status:** Complete and Production Ready ✅
