# Quick Reference - Webhook Bridge v4.1.0

Fast lookup guide for common operations with advanced modules.

## Module Access

All modules available via:
```javascript
globalThis.webhookExpansion.moduleName.method()
```

---

## Advanced Statistics

### Record Achievement
```javascript
globalThis.webhookExpansion.advancedStats.recordAchievement(
  playerName, playerId, achievementName, points
);
```

### Update Login Streak
```javascript
globalThis.webhookExpansion.advancedStats.updateLoginStreak(playerId, playerName);
```

### Get Leaderboard Embed
```javascript
const embed = globalThis.webhookExpansion.advancedStats.getLeaderboardEmbed(
  allStatsMap, "playtime" // "playtime", "kills", "messages", "blocks"
);
```

---

## Embed Builder

### Player Join Embed
```javascript
const embed = globalThis.webhookExpansion.embedBuilder.playerJoin(
  playerName, playerId, onlineCount, avatarUrl
);
```

### Player Death Embed
```javascript
const embed = globalThis.webhookExpansion.embedBuilder.playerDeath(
  playerName, killerName, location, kdRatio, avatarUrl
);
```

### Rare Item Alert
```javascript
const embed = globalThis.webhookExpansion.embedBuilder.rareItemAlert(
  playerName, itemType, quantity, location, avatarUrl
);
```

### Server Status
```javascript
const embed = globalThis.webhookExpansion.embedBuilder.serverStatus(
  playerCount, maxPlayers, uptime, tps
);
```

**Available Methods:**
- playerJoin, playerLeave, playerDeath, playerKill
- achievement, loginStreak, bossFight
- rareItemAlert, blockBroken
- playerStats, serverStatus

---

## Report Generator

### Generate Daily Report
```javascript
const report = globalThis.webhookExpansion.reportGenerator.generateDailyReport(
  date, playerStatsMap, serverAnalytics
);
const embed = globalThis.webhookExpansion.reportGenerator.getReportEmbed(report);
```

### Generate Weekly Report
```javascript
const weeklyReport = globalThis.webhookExpansion.reportGenerator.generateWeeklyReport(
  endDate, dailyReportsMap
);
```

### Generate Monthly Report
```javascript
const monthlyReport = globalThis.webhookExpansion.reportGenerator.generateMonthlyReport(
  month, year, dailyReportsMap
);
```

---

## Performance Monitor

### Record Metric
```javascript
globalThis.webhookExpansion.performanceMonitor.recordMetric(world, system);
// Automatically called every 60 seconds if enabled
```

### Get Performance Report
```javascript
const report = globalThis.webhookExpansion.performanceMonitor.getPerformanceReport();
// Returns: { status, lastMetric, averageTPS, totalMetrics, activeAlerts }
```

### Get Performance Embed
```javascript
const embed = globalThis.webhookExpansion.performanceMonitor.getPerformanceEmbed();
```

**Alert Thresholds:**
- TPS Warning: 15, Alert: 10
- Entity Warning: 500, Alert: 1000
- Chunk Warning: 50k, Alert: 100k

---

## Treasure Hunt

### Record Treasure
```javascript
const treasure = globalThis.webhookExpansion.treasureHunt.recordTreasure(
  playerName, playerId, blockType, location, quantity
);
```

### Get Treasure Stats
```javascript
const stats = globalThis.webhookExpansion.treasureHunt.getTreasureStats(playerId);
// Returns: { playerName, totalTreasures, items, streak }
```

### Get Top Treasure Hunters
```javascript
const topHunters = globalThis.webhookExpansion.treasureHunt.getTopTreasureHunters(10);
```

### Get Treasure Embed
```javascript
const embed = globalThis.webhookExpansion.treasureHunt.getTreasureEmbed(treasureObject);
```

**Rarity Tiers:**
- Legendary: 🌟 (Dragon Egg, Nether Star, Sculk Catalyst)
- Epic: 👑 (Ancient Debris, Deepslate Emerald)
- Rare: 💎 (Diamond, Emerald)
- Uncommon: 🔷 (Gold, Lapis)

---

## Boss System

### Record Boss Encounter
```javascript
globalThis.webhookExpansion.bossSystem.recordBossEncounter(
  playerName, playerId, bossType, defeated, location, duration
);
```

### Record PvP Duel
```javascript
globalThis.webhookExpansion.bossSystem.recordDuel(
  player1Name, player1Id, player2Name, player2Id, winner, location, duration
);
```

### Record Epic Battle
```javascript
globalThis.webhookExpansion.bossSystem.recordEpicBattle(
  playersArray, victorsArray, location, duration
);
```

### Get Combat Stats Embed
```javascript
const embed = globalThis.webhookExpansion.bossSystem.getCombatStatsEmbed(playerId);
```

### Get Leaderboards
```javascript
const duelWins = globalThis.webhookExpansion.bossSystem.getDuelLeaderboard(10);
const bossDefeats = globalThis.webhookExpansion.bossSystem.getBossSlayerLeaderboard(10);
```

**Default Bosses:**
- ender_dragon (100 pts)
- wither (80 pts)
- cave_spider (20 pts)
- creeper (10 pts)

---

## Moderation Logger

### Record Kick
```javascript
globalThis.webhookExpansion.moderationLogger.recordKick(
  playerName, playerId, reason, moderatorName
);
```

### Record Ban
```javascript
globalThis.webhookExpansion.moderationLogger.recordBan(
  playerName, playerId, reason, durationMs, moderatorName
);
// durationMs: 0 = permanent, 604800000 = 7 days
```

### Record Warning
```javascript
globalThis.webhookExpansion.moderationLogger.recordWarning(
  playerName, playerId, reason, moderatorName
);
```

### Record Mute
```javascript
globalThis.webhookExpansion.moderationLogger.recordMute(
  playerName, playerId, reason, durationMs, moderatorName
);
```

### Check Ban/Mute Status
```javascript
if (globalThis.webhookExpansion.moderationLogger.isBanned(playerId)) { }
if (globalThis.webhookExpansion.moderationLogger.isMuted(playerId)) { }
```

### Track Message for Spam
```javascript
const isSpam = globalThis.webhookExpansion.moderationLogger.trackMessage(
  playerId, playerName, messageLength
);
```

### Get Active Bans
```javascript
const activeBans = globalThis.webhookExpansion.moderationLogger.getActiveBans();
const embed = globalThis.webhookExpansion.moderationLogger.getActiveBansEmbed();
```

---

## World Explorer

### Record Location
```javascript
globalThis.webhookExpansion.worldExplorer.recordLocation(
  playerId, playerName, x, y, z, dimension
);
// dimension: "overworld", "nether", "end"
```

### Record Biome Discovery
```javascript
globalThis.webhookExpansion.worldExplorer.recordBiomeDiscovery(
  playerId, playerName, biomeType, location
);
```

### Get Exploration Stats
```javascript
const stats = globalThis.webhookExpansion.worldExplorer.getExplorationStats(playerId);
// Returns: { totalDistance, locationsVisited, dimensionsVisited, biomesDiscovered, ... }
```

### Get Top Explorers
```javascript
const topByDistance = globalThis.webhookExpansion.worldExplorer.getTopExplorers("totalDistance", 10);
const topByLocations = globalThis.webhookExpansion.worldExplorer.getTopExplorers("locationsVisited", 10);
const topByDimensions = globalThis.webhookExpansion.worldExplorer.getTopExplorers("dimensions", 10);
```

### Get Exploration Embeds
```javascript
const statsEmbed = globalThis.webhookExpansion.worldExplorer.getExplorationEmbed(playerId);
const biomesEmbed = globalThis.webhookExpansion.worldExplorer.getBiomeDiscoveriesEmbed(playerId);
const leaderboardEmbed = globalThis.webhookExpansion.worldExplorer.getExplorerLeaderboardEmbed("totalDistance");
```

---

## Discord Dashboard

### Generate Server Status Dashboard
```javascript
const dashboard = globalThis.webhookExpansion.discordDashboard.generateServerStatusDashboard({
  tps: 19.8,
  onlinePlayers: 5,
  maxPlayers: 20,
  uptime: 86400000,
  chunks: 512,
  entities: 250
});
```

### Generate Player List Dashboard
```javascript
const dashboard = globalThis.webhookExpansion.discordDashboard.generatePlayerListDashboard(playersArray);
```

### Generate Statistics Dashboard
```javascript
const dashboard = globalThis.webhookExpansion.discordDashboard.generateStatisticsDashboard(aggregatedStats);
```

### Post Announcement
```javascript
const embed = globalThis.webhookExpansion.discordDashboard.postAnnouncement(
  title, message, author, priority
);
// priority: "normal", "important", "critical", "news"
```

### Check Update Needed
```javascript
if (globalThis.webhookExpansion.discordDashboard.shouldUpdate("status")) {
  // Update server status dashboard
}
// Metrics: "status", "playerList", "statistics", "news"
```

---

## Common Patterns

### Send Embed to Discord
```javascript
sendWebhook("analytics", {
  embeds: [embedObject]
});
```

### Export Module Data
```javascript
const data = globalThis.webhookExpansion.moduleName.exportDataName();
```

### Check if Module Initialized
```javascript
if (globalThis.webhookExpansion?.moduleName) {
  // Module is available
}
```

---

## Configuration Quick Reference

### Enable/Disable Features
```javascript
advancedStats: { enabled: true }
performanceMonitoring: { enabled: true }
moderationLogging: { enabled: true }
worldExploration: { enabled: true }
treasureHunt: { enabled: true }
bossSystem: { enabled: true }
discordDashboard: { enabled: true }
reportGeneration: { enabled: true }
```

### Adjust Thresholds
```javascript
performanceMonitoring: {
  thresholds: {
    tpsWarning: 15,
    tpsAlert: 10,
    entityWarning: 500,
    entityAlert: 1000
  }
}

moderationLogging: {
  spam: {
    messageThreshold: 10,
    timeWindow: 5000,
    autoMuteDuration: 600000
  }
}
```

### Custom Intervals
```javascript
discordDashboard: {
  serverStatus: { updateInterval: 300000 },      // 5 min
  playerList: { updateInterval: 600000 },        // 10 min
  statistics: { updateInterval: 1800000 }        // 30 min
}
```

---

## Event Handling Examples

### On Player Join
```javascript
globalThis.webhookExpansion.advancedStats.updateLoginStreak(playerId, playerName);
globalThis.webhookExpansion.worldExplorer.recordLocation(playerId, playerName, x, y, z, "overworld");
```

### On Block Break (Treasure)
```javascript
const treasure = globalThis.webhookExpansion.treasureHunt.recordTreasure(
  player.name, player.id, blockType, player.location, 1
);
if (treasure) {
  sendWebhook("treasure", {
    embeds: [globalThis.webhookExpansion.embedBuilder.rareItemAlert(...)]
  });
}
```

### On Player Death
```javascript
const embed = globalThis.webhookExpansion.embedBuilder.playerDeath(
  playerName, killerName, location, kdRatio, avatar
);
sendWebhook("deaths", { embeds: [embed] });
```

### On Chat Message
```javascript
const isSpam = globalThis.webhookExpansion.moderationLogger.trackMessage(
  playerId, playerName, message.length
);
if (isSpam) {
  globalThis.webhookExpansion.moderationLogger.recordMute(
    playerName, playerId, "Spam", 600000, "AutoMod"
  );
}
```

---

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| Module undefined | Check globalThis.webhookExpansion.moduleName exists |
| Embed not showing | Verify webhook URL is correct and valid |
| Data not recording | Check feature enabled in config |
| Discord lag | Reduce history sizes, increase intervals |
| Memory spike | Reduce maxHistorySize, disable unused modules |
| Missing emoji | Check emoji config, verify Unicode support |

---

## Performance Tips

1. **Reduce history sizes** for large servers (100+ players)
2. **Increase intervals** if experiencing lag
3. **Disable unused modules** to save memory
4. **Use separate webhooks** for different event types
5. **Archive old data** periodically

---

## Help & Support

- Full guide: `ADVANCED_MODULES_GUIDE.md`
- Testing: `TESTING_GUIDE.md`
- Config: `config-advanced-features.js`
- Summary: `IMPLEMENTATION_SUMMARY.md`

**Version**: v4.1.0
**Status**: Production Ready ✅
