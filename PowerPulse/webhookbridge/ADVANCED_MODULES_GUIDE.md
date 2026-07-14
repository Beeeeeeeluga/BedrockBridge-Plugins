# Advanced Modules Guide v4.1.0

Comprehensive documentation for all advanced webhook bridge feature modules.

## Table of Contents

1. [Advanced Statistics Module](#advanced-statistics-module)
2. [Embed Builder](#embed-builder)
3. [Report Generator](#report-generator)
4. [Performance Monitor](#performance-monitor)
5. [Treasure Hunt System](#treasure-hunt-system)
6. [Boss System](#boss-system)
7. [Moderation Logger](#moderation-logger)
8. [World Explorer](#world-explorer)
9. [Discord Dashboard](#discord-dashboard)
10. [Configuration Guide](#configuration-guide)

---

## Advanced Statistics Module

**Location:** `stats/advanced-stats.js`

### Purpose
Tracks and manages comprehensive player statistics including achievements, login streaks, activity scoring, and leaderboards.

### Key Features
- **Achievement Tracking**: Records player achievements with points
- **Login Streaks**: Tracks consecutive login days with milestone rewards
- **Activity Scoring**: Calculates activity scores based on multiple metrics
- **Leaderboards**: Generates ranked leaderboards for various categories
- **Playtime Milestones**: Rewards players for reaching playtime thresholds

### Main Methods

#### `recordAchievement(playerName, playerId, achievement, points)`
Records a new achievement for a player.

```javascript
globalThis.webhookExpansion.advancedStats.recordAchievement(
  "PlayerName",
  "uuid-123",
  "First Diamond",
  100
);
```

#### `updateLoginStreak(playerId, playerName)`
Updates a player's login streak when they join.

```javascript
globalThis.webhookExpansion.advancedStats.updateLoginStreak(
  "uuid-123",
  "PlayerName"
);
```

#### `calculateActivityScore(stats)`
Calculates an overall activity score based on various metrics.

```javascript
const score = globalThis.webhookExpansion.advancedStats.calculateActivityScore(playerStats);
```

#### `getLeaderboardEmbed(allStats, metric)`
Generates a Discord embed for a leaderboard.

```javascript
const embed = globalThis.webhookExpansion.advancedStats.getLeaderboardEmbed(
  playerStatsMap,
  "playtime"
);
```

### Configuration
```javascript
advancedStats: {
  enabled: true,
  achievements: { enabled: true },
  streaks: { enabled: true, rewardMilestones: true },
  activityScoring: { enabled: true },
  leaderboards: { enabled: true, topPlayersLimit: 10 }
}
```

---

## Embed Builder

**Location:** `core/embed-builder.js`

### Purpose
Centralized Discord embed creation with consistent styling, colors, and formatting for all event types.

### Key Features
- **Standardized Colors**: Predefined color scheme for consistency
- **Emoji Mapping**: Automatic emoji selection for items and blocks
- **Template Methods**: Pre-built embed templates for all events
- **Duration Formatting**: Automatic conversion of milliseconds to readable format

### Main Methods

#### Player Events
```javascript
// Player join event
const joinEmbed = embedBuilder.playerJoin(playerName, playerId, onlineCount, avatar);

// Player leave event
const leaveEmbed = embedBuilder.playerLeave(playerName, playerId, playtime, avatar);

// Player death event
const deathEmbed = embedBuilder.playerDeath(playerName, killer, location, kdRatio, avatar);

// Player kill event
const killEmbed = embedBuilder.playerKill(killerName, victimName, kdRatio, avatar);
```

#### Achievement & Milestone Events
```javascript
// Achievement unlock
const achievementEmbed = embedBuilder.achievement(playerName, achievementName, points, avatar);

// Login streak
const streakEmbed = embedBuilder.loginStreak(playerName, streakDays, longestStreak, avatar, "milestone");

// Boss fight
const bossFightEmbed = embedBuilder.bossFight(playerName, bossType, defeated, location, avatar);
```

#### Resource Events
```javascript
// Rare item found
const itemEmbed = embedBuilder.rareItemAlert(playerName, itemType, quantity, location, avatar);

// Block broken
const blockEmbed = embedBuilder.blockBroken(playerName, blockType, quantity, location, avatar);
```

#### Server Events
```javascript
// Player statistics
const statsEmbed = embedBuilder.playerStats(stats);

// Server status
const statusEmbed = embedBuilder.serverStatus(playerCount, maxPlayers, uptime, tps);
```

### Color Scheme
```javascript
info: 0x3498DB    // Blue
success: 0x2ECC71 // Green
warning: 0xF39C12 // Orange
error: 0xE74C3C   // Red
primary: 0x9B59B6 // Purple
danger: 0xE91E63  // Pink
gold: 0xFFD700    // Gold
gray: 0x95A5A6    // Gray
```

---

## Report Generator

**Location:** `stats/report-generator.js`

### Purpose
Generates daily, weekly, and monthly reports with aggregated statistics and performance metrics.

### Key Features
- **Daily Reports**: Aggregates daily player and server statistics
- **Weekly Reports**: Combines 7 days of daily reports
- **Monthly Reports**: Combines 30 days of daily reports
- **Automatic Aggregation**: Calculates totals, averages, and top performers
- **Discord Embeds**: Formatted reports for Discord display

### Main Methods

#### `generateDailyReport(date, playerStats, serverAnalytics)`
Generates a daily report.

```javascript
const report = reportGenerator.generateDailyReport(
  new Date(),
  playerStatsMap,
  serverAnalytics
);
```

#### `generateWeeklyReport(endDate, dailyReports)`
Generates a weekly report from daily data.

```javascript
const weeklyReport = reportGenerator.generateWeeklyReport(
  new Date(),
  dailyReportsMap
);
```

#### `generateMonthlyReport(month, year, dailyReports)`
Generates a monthly report.

```javascript
const monthlyReport = reportGenerator.generateMonthlyReport(
  11,
  2025,
  dailyReportsMap
);
```

#### `getReportEmbed(report)`
Converts a report to Discord embed format.

```javascript
const embed = reportGenerator.getReportEmbed(dailyReport);
```

### Report Contents
- Total players active
- Total playtime
- Total kills/deaths
- Total messages sent
- Total blocks placed/destroyed
- Top performers by category
- Average metrics per category

### Configuration
```javascript
reportGeneration: {
  daily: { enabled: true, generateTime: "00:00" },
  weekly: { enabled: true, generateDay: "Monday", generateTime: "06:00" },
  monthly: { enabled: true, generateDay: 1, generateTime: "06:00" }
}
```

---

## Performance Monitor

**Location:** `server/performance-monitor.js`

### Purpose
Real-time server performance tracking with TPS monitoring, entity counting, and automatic alerting.

### Key Features
- **TPS Tracking**: Monitors ticks per second
- **Entity Counting**: Tracks entity count in loaded areas
- **Chunk Estimation**: Estimates loaded chunks
- **Memory Monitoring**: Tracks memory usage
- **Automatic Alerting**: Generates alerts on performance degradation
- **Historical Data**: Maintains performance history

### Main Methods

#### `recordMetric(world, system)`
Records a performance metric snapshot.

```javascript
performanceMonitor.recordMetric(world, system);
```

#### `checkPerformanceAlerts(metric)`
Checks for performance issues and generates alerts.

```javascript
performanceMonitor.checkPerformanceAlerts(metric);
```

#### `getAverageTPS(last = 20)`
Gets average TPS over last N measurements.

```javascript
const avgTps = performanceMonitor.getAverageTPS(60);
```

#### `getPerformanceReport()`
Gets comprehensive performance report.

```javascript
const report = performanceMonitor.getPerformanceReport();
```

#### `getPerformanceEmbed()`
Gets performance report as Discord embed.

```javascript
const embed = performanceMonitor.getPerformanceEmbed();
```

### Alert Thresholds
```javascript
tpsWarning: 15     // Yellow alert
tpsAlert: 10       // Red alert
entityWarning: 500
entityAlert: 1000
chunkWarning: 50000
chunkAlert: 100000
```

### Automatic Recording
The system automatically records metrics every 60 seconds if enabled in configuration.

---

## Treasure Hunt System

**Location:** `events/treasure-hunt.js`

### Purpose
Automatic rare block and item detection with rarity tiers, mining streaks, and treasure hunting leaderboards.

### Key Features
- **Rarity Tiers**: 4-tier classification (Legendary, Epic, Rare, Uncommon)
- **Rare Block Detection**: Automatic detection during mining
- **Mining Streaks**: Tracks consecutive rare finds within 2-minute window
- **Treasure Value System**: Weighted point system for rare items
- **Leaderboards**: Top treasure hunters ranking
- **Discord Notifications**: Automatic alerts for valuable finds

### Rarity Tiers

| Tier | Emoji | Color | Examples | Reward |
|------|-------|-------|----------|--------|
| Legendary | 🌟 | Gold | Dragon Egg, Nether Star | 1000 pts |
| Epic | 👑 | Pink | Ancient Debris, Deepslate Emerald | 500 pts |
| Rare | 💎 | Cyan | Diamond, Emerald | 100 pts |
| Uncommon | 🔷 | Gold | Gold, Lapis | 10 pts |

### Main Methods

#### `recordTreasure(playerName, playerId, blockType, location, quantity)`
Records a treasure find.

```javascript
treasureHunt.recordTreasure(
  "PlayerName",
  "uuid-123",
  "diamond_ore",
  { x: 100, y: 64, z: 200 },
  1
);
```

#### `updateMiningStreak(playerId, playerName, rarity)`
Updates mining streak (automatic with recordTreasure).

```javascript
treasureHunt.updateMiningStreak(playerId, playerName, rarityObject);
```

#### `getTreasureStats(playerId)`
Gets treasure statistics for a player.

```javascript
const stats = treasureHunt.getTreasureStats("uuid-123");
```

#### `getTopTreasureHunters(limit = 10)`
Gets leaderboard of top treasure hunters.

```javascript
const topHunters = treasureHunt.getTopTreasureHunters(10);
```

### Mining Streak Rules
- Streak continues if treasures found within 2 minutes of last find
- Streak resets after 2 minute inactivity
- Streaks of 5+ treasures are highlighted as "hot streaks"

---

## Boss System

**Location:** `events/boss-system.js`

### Purpose
Comprehensive boss fight and PvP combat system with encounters, duels, epic battles, and combat statistics.

### Key Features
- **Boss Encounters**: Tracks encounters with defined bosses
- **PvP Duels**: Records 1v1 combat matches
- **Epic Battles**: Detects 3+ player engagements
- **Combat Statistics**: Tracks kills, deaths, ratios per player
- **Reward System**: Awards points for achievements
- **Leaderboards**: Rankings by boss defeats and duel wins

### Default Bosses

```javascript
ender_dragon: { name: "Ender Dragon", difficulty: "EXTREME", emoji: "🐉", reward: 100 },
wither: { name: "Wither", difficulty: "EXTREME", emoji: "☠️", reward: 80 },
cave_spider: { name: "Cave Spider", difficulty: "HARD", emoji: "🕷️", reward: 20 },
creeper: { name: "Creeper", difficulty: "MEDIUM", emoji: "💥", reward: 10 }
```

### Main Methods

#### `recordBossEncounter(playerName, playerId, bossType, defeated, location, duration)`
Records a boss encounter.

```javascript
bossSystem.recordBossEncounter(
  "PlayerName",
  "uuid-123",
  "ender_dragon",
  true,
  { x: 0, y: 100, z: 0 },
  300000
);
```

#### `recordDuel(player1Name, player1Id, player2Name, player2Id, winner, location, duration)`
Records a PvP duel.

```javascript
bossSystem.recordDuel(
  "Player1", "uuid-1",
  "Player2", "uuid-2",
  "Player1",
  { x: 100, y: 64, z: 100 },
  45000
);
```

#### `recordEpicBattle(players, victors, location, duration)`
Records an epic multi-player battle.

```javascript
bossSystem.recordEpicBattle(
  [player1, player2, player3, player4],
  [player1, player2],
  location,
  600000
);
```

#### `getCombatStatsEmbed(playerId)`
Gets player combat statistics as embed.

```javascript
const statsEmbed = bossSystem.getCombatStatsEmbed("uuid-123");
```

---

## Moderation Logger

**Location:** `moderation/moderation-logger.js`

### Purpose
Comprehensive moderation action tracking including kicks, bans, warnings, mutes, and spam detection.

### Key Features
- **Kick Logging**: Tracks player kicks with reasons
- **Ban Management**: Handles temporary and permanent bans
- **Warning System**: Issues warnings with escalation
- **Mute System**: Silence players with optional duration
- **Spam Detection**: Automatic spam detection and handling
- **Moderation History**: Complete history per player

### Main Methods

#### `recordKick(playerName, playerId, reason, moderator)`
Records a player kick.

```javascript
moderationLogger.recordKick(
  "PlayerName",
  "uuid-123",
  "Spamming",
  "Moderator"
);
```

#### `recordBan(playerName, playerId, reason, duration, moderator)`
Records a player ban.

```javascript
moderationLogger.recordBan(
  "PlayerName",
  "uuid-123",
  "Griefing",
  604800000, // 7 days, 0 for permanent
  "Moderator"
);
```

#### `recordWarning(playerName, playerId, reason, moderator)`
Issues a warning.

```javascript
moderationLogger.recordWarning(
  "PlayerName",
  "uuid-123",
  "Inappropriate behavior",
  "Moderator"
);
```

#### `recordMute(playerName, playerId, reason, duration, moderator)`
Mutes a player.

```javascript
moderationLogger.recordMute(
  "PlayerName",
  "uuid-123",
  "Spam",
  3600000, // 1 hour
  "AutoMod"
);
```

#### `isBanned(playerId)` / `isMuted(playerId)`
Checks if player is currently banned/muted.

```javascript
if (moderationLogger.isBanned("uuid-123")) {
  // Prevent player from joining
}
```

#### `trackMessage(playerId, playerName, messageLength)`
Tracks messages for spam detection.

```javascript
const isSpam = moderationLogger.trackMessage("uuid-123", "PlayerName", message.length);
```

### Spam Detection
- Threshold: 10 messages in 5 seconds
- Auto-mute: 10 minutes after 3 violations
- Configurable thresholds

---

## World Explorer

**Location:** `exploration/world-explorer.js`

### Purpose
Automatic world exploration tracking with dimension visits, height records, biome discoveries, and exploration metrics.

### Key Features
- **Location Tracking**: Records player movement history
- **Distance Calculation**: Calculates total distance traveled
- **Height Records**: Tracks highest and lowest points per dimension
- **Dimension Tracking**: Monitors dimension visits and stats
- **Biome Discovery**: Tracks first-time biome discoveries
- **Exploration Milestones**: Rewards for major achievements
- **Leaderboards**: Top explorers by distance, locations, dimensions

### Main Methods

#### `recordLocation(playerId, playerName, x, y, z, dimension)`
Records a player location.

```javascript
worldExplorer.recordLocation(
  "uuid-123",
  "PlayerName",
  100,
  64,
  200,
  "overworld"
);
```

#### `recordBiomeDiscovery(playerId, playerName, biomeType, location)`
Records a biome discovery.

```javascript
worldExplorer.recordBiomeDiscovery(
  "uuid-123",
  "PlayerName",
  "jungle",
  { x: 300, y: 70, z: 400 }
);
```

#### `getExplorationStats(playerId)`
Gets player exploration statistics.

```javascript
const stats = worldExplorer.getExplorationStats("uuid-123");
```

#### `getTopExplorers(metric, limit)`
Gets leaderboard of top explorers.

```javascript
const topByDistance = worldExplorer.getTopExplorers("totalDistance", 10);
const topByLocations = worldExplorer.getTopExplorers("locationsVisited", 10);
const topByDimensions = worldExplorer.getTopExplorers("dimensions", 10);
```

### Dimensions Tracked
- `overworld`: The main dimension (🌍)
- `nether`: The Nether (🔥)
- `end`: The End (🌑)

### Height Records
- Tracks highest Y coordinate per dimension
- Tracks lowest Y coordinate per dimension
- Records timestamp of records

---

## Discord Dashboard

**Location:** `dashboard/discord-dashboard.js`

### Purpose
Automated Discord dashboard with real-time server status, player lists, statistics, and announcements.

### Key Features
- **Server Status Dashboard**: Real-time TPS, players, uptime
- **Player List**: Grouped by activity status
- **Statistics Dashboard**: Top performers and metrics
- **Announcements**: Server news and important messages
- **Health Indicator**: Server health status
- **Automatic Updates**: Configurable update intervals

### Main Methods

#### `generateServerStatusDashboard(serverData)`
Creates server status dashboard.

```javascript
const dashboard = discordDashboard.generateServerStatusDashboard({
  tps: 19.8,
  onlinePlayers: 5,
  maxPlayers: 20,
  uptime: 86400000,
  chunks: 512,
  entities: 250
});
```

#### `generatePlayerListDashboard(players)`
Creates player list dashboard grouped by activity.

```javascript
const playerDashboard = discordDashboard.generatePlayerListDashboard(playerArray);
```

#### `generateStatisticsDashboard(stats)`
Creates statistics dashboard.

```javascript
const statsDashboard = discordDashboard.generateStatisticsDashboard(aggregatedStats);
```

#### `postAnnouncement(title, message, author, priority)`
Posts an announcement.

```javascript
discordDashboard.postAnnouncement(
  "Server Maintenance",
  "Server will restart at 6 AM UTC",
  "Admin",
  "important"
);
```

#### `shouldUpdate(metric)`
Checks if metric should be updated based on interval.

```javascript
if (discordDashboard.shouldUpdate("status")) {
  // Update server status dashboard
}
```

### Priority Levels
- `normal` (📢): Regular announcements
- `important` (⚠️): Important notices
- `critical` (🔴): Urgent alerts
- `news` (📰): Server news

### Update Intervals
```javascript
status: 300000      // 5 minutes
playerList: 600000  // 10 minutes
statistics: 1800000 // 30 minutes
news: 3600000       // 1 hour
```

---

## Configuration Guide

### Basic Setup

Add to your main configuration:

```javascript
import AdvancedFeaturesConfig from "./config-advanced-features.js";

const WHConfig = {
  // ... existing config ...
  advancedFeatures: AdvancedFeaturesConfig
};
```

### Feature Toggles

Enable/disable features in `config-advanced-features.js`:

```javascript
advancedStats: { enabled: true },
performanceMonitoring: { enabled: true },
moderationLogging: { enabled: true },
worldExploration: { enabled: true },
treasureHunt: { enabled: true },
bossSystem: { enabled: true },
discordDashboard: { enabled: true }
```

### Performance Tuning

Adjust intervals for optimal performance:

```javascript
performanceMonitoring: {
  recordingInterval: 60000,  // Adjust based on desired frequency
  historySize: 1000          // Reduce if memory is limited
},
reportGeneration: {
  daily: { enabled: true },
  weekly: { enabled: true },
  monthly: { enabled: true }
}
```

### Discord Webhook Routing

Webhooks are automatically routed to appropriate channels:

```javascript
webhooks: {
  analytics: "https://discord.com/api/webhooks/...",
  moderation: "https://discord.com/api/webhooks/...",
  treasure: "https://discord.com/api/webhooks/...",
  boss: "https://discord.com/api/webhooks/..."
}
```

---

## Usage Examples

### Complete Integration Example

```javascript
// In your event handler
world.afterEvents.playerJoin.subscribe((event) => {
  const player = event.player;

  // Update login streak
  globalThis.webhookExpansion.advancedStats.updateLoginStreak(
    player.id,
    player.name
  );

  // Start location tracking
  globalThis.webhookExpansion.worldExplorer.recordLocation(
    player.id,
    player.name,
    player.location.x,
    player.location.y,
    player.location.z,
    "overworld"
  );
});

// Block break event
world.afterEvents.blockBreak.subscribe((event) => {
  const block = event.brokenBlockPermutation.type;

  // Check if treasure
  const treasure = globalThis.webhookExpansion.treasureHunt.recordTreasure(
    player.name,
    player.id,
    block.id,
    player.location,
    1
  );

  if (treasure) {
    sendWebhook("treasure", {
      embeds: [globalThis.webhookExpansion.embedBuilder.rareItemAlert(
        player.name,
        block.id,
        1,
        player.location,
        avatar
      )]
    });
  }
});
```

### Periodic Report Generation

```javascript
system.runInterval(() => {
  // Generate daily report at midnight
  const report = globalThis.webhookExpansion.reportGenerator.generateDailyReport(
    new Date(),
    playerStatsMap,
    serverAnalytics
  );

  sendWebhook("analytics", {
    embeds: [globalThis.webhookExpansion.reportGenerator.getReportEmbed(report)]
  });
}, 72000); // Every hour (check time)
```

---

## Troubleshooting

### Module Not Initializing
- Check that all imports are correct
- Verify file paths match your directory structure
- Check console for error messages

### Performance Issues
- Reduce history sizes in configuration
- Increase recording intervals
- Disable unused modules

### Missing Data
- Verify webhook URLs are correct
- Check Discord permissions for webhooks
- Review configuration flags

### Memory Leaks
- Enable data retention cleanup
- Reduce maxHistorySize values
- Archive old reports regularly

---

## Support & Updates

For issues, improvements, or feature requests, consult the main webhook bridge documentation and configuration guide.

All modules are designed to be lightweight and optional - disable any that aren't needed for your server.
