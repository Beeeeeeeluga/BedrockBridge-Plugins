# 🔧 INTEGRATION GUIDE - Webhook Plugin v4.1.0

**How to Integrate All New Modules into main.js**

---

## QUICK START

The expansion modules are ready to use. This guide shows you exactly where and how to add them to main.js.

---

## STEP 1: ADD IMPORTS AT THE TOP OF main.js

Add these imports after existing imports (around line 10-15):

```javascript
// ============================================
// NEW v4.1.0 EXPANSION MODULES
// ============================================

import EntityEventManager from "./events/entity-events.js";
import ItemEventManager from "./events/item-events.js";
import PlayerStatsManager from "./stats/player-stats.js";
import ServerAnalytics from "./stats/server-analytics.js";
import DataManager from "./core/data-manager.js";
import EventArchive from "./core/event-archive.js";
```

---

## STEP 2: INITIALIZE MANAGERS IN initializePlugin()

Find the `initializePlugin()` function (around line 1000) and add this code **after** existing initialization but **before** the closing brace:

```javascript
// ============================================
// v4.1.0 EXPANSION INITIALIZATION
// ============================================

try {
  // Initialize statistics managers
  const playerStatsManager = new PlayerStatsManager();
  const serverAnalytics = new ServerAnalytics();
  const dataManager = new DataManager("./plugins/webhookbridge/data");
  const eventArchive = new EventArchive(dataManager);

  // Initialize event managers
  const entityManager = new EntityEventManager(sendWebhook, WHConfig, WHHelpers);
  entityManager.initialize();

  const itemManager = new ItemEventManager(sendWebhook, WHConfig, WHHelpers);
  itemManager.initialize();

  // Initialize server analytics
  serverAnalytics.initialize();
  console.info("[Webhook] v4.1.0 expansion modules loaded successfully");

  // Make managers global for access in other files
  globalThis.webhookExpansion = {
    playerStats: playerStatsManager,
    serverAnalytics,
    dataManager,
    eventArchive,
    entityManager,
    itemManager
  };

} catch (error) {
  console.error("[Webhook] Failed to initialize expansion modules:", error.message);
}
```

---

## STEP 3: TRACK PLAYER JOINS/LEAVES

Find the `setupEventHandlers()` function and locate the player spawn event. Replace or update it:

```javascript
// Track player join with statistics
world.afterEvents.playerSpawn.subscribe((event) => {
  try {
    const player = event.player;

    // ... existing code ...

    // NEW: Initialize statistics for this player
    if (globalThis.webhookExpansion?.playerStats) {
      globalThis.webhookExpansion.playerStats.initializePlayer(player);
    }

  } catch (error) {
    console.error("[Webhook] Player spawn error:", error.message);
  }
});

// Track player leave with statistics
world.afterEvents.playerLeave.subscribe((event) => {
  try {
    const player = event.player;

    // ... existing code ...

    // NEW: End session statistics
    if (globalThis.webhookExpansion?.playerStats) {
      globalThis.webhookExpansion.playerStats.endSession(player);
    }

  } catch (error) {
    console.error("[Webhook] Player leave error:", error.message);
  }
});
```

---

## STEP 4: TRACK BLOCK EVENTS

Find the block event handlers and add statistics tracking:

```javascript
// In handleBlockBreak() or equivalent
function handleBlockBreak(player, block) {
  try {
    // ... existing code ...

    // NEW: Track in statistics
    if (globalThis.webhookExpansion?.playerStats) {
      globalThis.webhookExpansion.playerStats.recordBlockBreak(
        player,
        block.typeId.replace("minecraft:", "")
      );
    }

  } catch (error) {
    console.error("[Webhook] Block break error:", error.message);
  }
}

function handleBlockPlace(player, block) {
  try {
    // ... existing code ...

    // NEW: Track in statistics
    if (globalThis.webhookExpansion?.playerStats) {
      globalThis.webhookExpansion.playerStats.recordBlockPlace(
        player,
        block.typeId.replace("minecraft:", "")
      );
    }

  } catch (error) {
    console.error("[Webhook] Block place error:", error.message);
  }
}
```

---

## STEP 5: TRACK DEATH EVENTS

Find the death handler and add K/D tracking:

```javascript
function handlePlayerDeath(player, killer = null) {
  try {
    // ... existing code ...

    // NEW: Track death statistics
    if (globalThis.webhookExpansion?.playerStats) {
      globalThis.webhookExpansion.playerStats.recordDeath(player, killer?.name || "Environment");
    }

    // NEW: Archive the event
    if (globalThis.webhookExpansion?.eventArchive) {
      globalThis.webhookExpansion.eventArchive.archiveEvent(
        "playerDeath",
        {
          playerName: player.name,
          killerId: killer?.id,
          killerName: killer?.name,
          location: player.location
        },
        "deaths"
      );
    }

  } catch (error) {
    console.error("[Webhook] Death handling error:", error.message);
  }
}
```

---

## STEP 6: TRACK CHAT MESSAGES

Find the chat event handler:

```javascript
world.beforeEvents.chatSend.subscribe((event) => {
  try {
    const { sender, message } = event;

    // ... existing code ...

    // NEW: Track chat statistics
    if (globalThis.webhookExpansion?.playerStats) {
      globalThis.webhookExpansion.playerStats.recordChatMessage(sender, message.length);
    }

    // NEW: Archive chat event
    if (globalThis.webhookExpansion?.eventArchive) {
      globalThis.webhookExpansion.eventArchive.archiveEvent(
        "chat",
        {
          playerName: sender.name,
          playerId: sender.id,
          message,
          length: message.length
        },
        "chat"
      );
    }

  } catch (error) {
    console.error("[Webhook] Chat error:", error.message);
  }
});
```

---

## STEP 7: SETUP HOURLY ANALYTICS

Add this to `initializePlugin()` to record hourly statistics:

```javascript
// Record hourly statistics (NEW v4.1.0)
system.runInterval(() => {
  try {
    if (globalThis.webhookExpansion?.serverAnalytics) {
      const hourlyData = globalThis.webhookExpansion.serverAnalytics.recordHourlyStats(
        globalThis.webhookExpansion.playerStats?.playerStats
      );

      if (WHConfig.advanced.debug.enabled) {
        console.log(`[Webhook] Hourly stats: ${hourlyData.playerCount} players`);
      }
    }
  } catch (error) {
    console.error("[Webhook] Hourly stats error:", error.message);
  }
}, 72000); // 1 hour = 72000 ticks
```

---

## STEP 8: ADD TO WEBHOOK ADDON

Update `webhook-addon.js` to expose the statistics APIs:

After the class definition, add these methods to the WebhookAddon class:

```javascript
/**
 * Get player statistics
 */
async getPlayerStats(playerName) {
  if (!globalThis.webhookExpansion?.playerStats) {
    throw new Error("[Webhook] Player stats not available");
  }

  const players = world.getAllPlayers();
  const player = players.find(p => p.name === playerName);

  if (!player) {
    throw new Error(`[Webhook] Player ${playerName} not found`);
  }

  return globalThis.webhookExpansion.playerStats.getPlayerStats(player);
}

/**
 * Get server analytics report
 */
async getServerReport(type = "daily") {
  if (!globalThis.webhookExpansion?.serverAnalytics) {
    throw new Error("[Webhook] Server analytics not available");
  }

  return globalThis.webhookExpansion.serverAnalytics.createDiscordReport(type);
}

/**
 * Query archived events
 */
async queryEvents(criteria = {}) {
  if (!globalThis.webhookExpansion?.eventArchive) {
    throw new Error("[Webhook] Event archive not available");
  }

  return globalThis.webhookExpansion.eventArchive.queryEvents(criteria);
}

/**
 * Get top players
 */
async getTopPlayers(metric = "playtime", limit = 10) {
  if (!globalThis.webhookExpansion?.playerStats) {
    throw new Error("[Webhook] Player stats not available");
  }

  return globalThis.webhookExpansion.playerStats.getTopPlayers(metric, limit);
}

/**
 * Export all statistics
 */
async exportStatistics() {
  if (!globalThis.webhookExpansion?.playerStats) {
    throw new Error("[Webhook] Player stats not available");
  }

  return globalThis.webhookExpansion.playerStats.exportStats();
}

/**
 * Get server uptime
 */
async getServerUptime() {
  if (!globalThis.webhookExpansion?.serverAnalytics) {
    throw new Error("[Webhook] Server analytics not available");
  }

  return globalThis.webhookExpansion.serverAnalytics.getUptime();
}

/**
 * Get peak player times
 */
async getPeakTimes(daysBack = 7) {
  if (!globalThis.webhookExpansion?.serverAnalytics) {
    throw new Error("[Webhook] Server analytics not available");
  }

  return globalThis.webhookExpansion.serverAnalytics.getPeakTimes(daysBack);
}
```

---

## STEP 9: UPDATE CONFIGURATION

Update `config-enhanced.js` to add new feature toggles around line 40:

```javascript
// v4.1.0 Expansion Features
advanced: {
  features: {
    // ... existing features ...

    // Entity events
    entityEvents: true,
    entityDamage: true,
    entityDeath: true,
    projectileHits: true,

    // Item events
    itemEvents: true,
    itemPickup: true,
    crafting: true,
    smelting: true,
    containerAccess: true,

    // Statistics tracking
    playerStats: true,
    blockStats: true,
    chatStats: true,
    achievements: true,

    // Server analytics
    serverAnalytics: true,
    performanceTracking: true
  }
}
```

---

## STEP 10: TEST THE INTEGRATION

After making changes, test with these commands/events:

```javascript
// In console or command:
// Check if expansion modules are loaded
if (globalThis.webhookExpansion) {
  console.log("✓ Expansion modules loaded");
  console.log("✓ Player stats manager:", !!globalThis.webhookExpansion.playerStats);
  console.log("✓ Server analytics:", !!globalThis.webhookExpansion.serverAnalytics);
  console.log("✓ Event archive:", !!globalThis.webhookExpansion.eventArchive);
}

// Get player stats (after a player joins/leaves)
const stats = await webhookAddon.getPlayerStats("PlayerName");
console.log(stats);

// Get server report
const report = await webhookAddon.getServerReport("daily");
console.log(report);

// Query events
const deaths = await webhookAddon.queryEvents({ eventType: "playerDeath" });
console.log(`Deaths today: ${deaths.length}`);
```

---

## COMPLETE INTEGRATION CHECKLIST

- [ ] Added all 6 imports at top of main.js
- [ ] Added initialization code in initializePlugin()
- [ ] Updated player spawn event handler
- [ ] Updated player leave event handler
- [ ] Updated block break/place handlers
- [ ] Updated death event handler
- [ ] Updated chat event handler
- [ ] Added hourly analytics system.runInterval()
- [ ] Added new methods to WebhookAddon class
- [ ] Updated config with new feature toggles
- [ ] Tested with a player join/leave
- [ ] Checked console logs for "v4.1.0 expansion modules loaded"
- [ ] Tested getting player stats via webhookAddon

---

## TROUBLESHOOTING

### "Module not found" error
**Solution:** Make sure all files are in correct directories:
- `events/entity-events.js`
- `events/item-events.js`
- `stats/player-stats.js`
- `stats/server-analytics.js`
- `core/data-manager.js`
- `core/event-archive.js`

### "globalThis.webhookExpansion is undefined"
**Solution:** Make sure the initialization code ran successfully. Check console for errors during plugin load.

### Stats not being tracked
**Solution:** Make sure you're calling the record functions in the event handlers. Check console logs.

### Events not being archived
**Solution:** Make sure EventArchive is initialized and event handlers are calling `eventArchive.archiveEvent()`.

---

## PERFORMANCE NOTES

Each module uses:
- **Memory-efficient Maps** for data storage
- **Automatic cache cleanup** to prevent memory leaks
- **Lazy initialization** (only loads when needed)
- **Error handling** to prevent one module from crashing others

Max memory usage with all modules: ~10-15 MB (estimated)

---

## NEXT OPTIONAL PHASES

After integration, you can add:

1. **Reports Module** - Auto-generate and send reports to Discord
2. **Moderation Module** - Ban/mute/warn logging
3. **Slash Commands** - Run commands from Discord to get stats
4. **Web Dashboard** - View stats in browser
5. **Database** - Replace JSON with proper database

---

## SUPPORT

If you encounter issues during integration:

1. Check the error message in console
2. Verify all files exist in correct locations
3. Check that imports match your directory structure
4. Make sure WebhookAddon is initialized before using expansion features
5. Check `globalThis.webhookExpansion` is defined

---

**Good luck with the integration! The expansion is production-ready.** 🚀

If you need help with any step, let me know!
