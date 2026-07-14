# Testing & Verification Guide v4.1.0

Complete guide for testing and verifying all webhook bridge v4.1.0 modules.

## Quick Start Verification

### 1. Server Startup Check
- [ ] Server starts without errors
- [ ] All modules load with "[Webhook]" prefix in console
- [ ] No "Failed to initialize" messages
- [ ] "Plugin initialized successfully!" message appears

### 2. Console Output Verification
Look for initialization messages for all modules:
```
[Webhook] Initializing PlayerStatsManager...
[Webhook] Initializing ServerAnalytics...
[Webhook] Initializing DataManager...
[Webhook] Initializing EventArchive...
[Webhook] Initializing EntityEventManager...
[Webhook] Initializing ItemEventManager...
[Webhook] Initializing advanced feature modules...
[Webhook] EmbedBuilder initialized
[Webhook] AdvancedStats initialized
[Webhook] ReportGenerator initialized
[Webhook] PerformanceMonitor initialized
[Webhook] TreasureHunt initialized
[Webhook] BossSystem initialized
[Webhook] ModerationLogger initialized
[Webhook] WorldExplorer initialized
[Webhook] DiscordDashboard initialized
[Webhook] v4.1.0 advanced feature modules initialized successfully!
[Webhook] Plugin initialized successfully!
```

---

## Module Testing

### Advanced Statistics Module

**Test Case 1: Achievement Recording**
```
Expected: Achievement recorded with points
Steps:
  1. Call globalThis.webhookExpansion.advancedStats.recordAchievement()
  2. Verify data stored in memory
  3. Retrieve via getAchievementStats()
  4. Confirm embed generation works
```

**Test Case 2: Login Streak Tracking**
```
Expected: Player streaks incremented on join
Steps:
  1. Have player join server (simulated)
  2. Call updateLoginStreak() with player data
  3. Verify streak count increases
  4. Test milestone detection (7 day, 30 day, etc.)
  5. Verify Discord embed generation
```

**Test Case 3: Activity Scoring**
```
Expected: Activity score calculated from multiple metrics
Steps:
  1. Create player stats with various metrics
  2. Call calculateActivityScore()
  3. Verify score is within expected range
  4. Test with different metric weights
  5. Confirm leaderboard ordering
```

**Test Case 4: Leaderboard Generation**
```
Expected: Proper ranking and Discord embed
Steps:
  1. Create multiple players with varying stats
  2. Call getLeaderboardEmbed() for different metrics
  3. Verify correct ordering (highest first)
  4. Confirm top 10 limit is respected
  5. Check Discord embed formatting
```

### Embed Builder

**Test Case 1: All Embed Types**
```
Expected: All embed templates generate without errors
Steps:
  1. Test playerJoin() - ✅ Check
  2. Test playerLeave() - ✅ Check
  3. Test playerDeath() - ✅ Check
  4. Test playerKill() - ✅ Check
  5. Test achievement() - ✅ Check
  6. Test rareItemAlert() - ✅ Check
  7. Test blockBroken() - ✅ Check
  8. Test loginStreak() - ✅ Check
  9. Test bossFight() - ✅ Check
  10. Test playerStats() - ✅ Check
  11. Test serverStatus() - ✅ Check
```

**Test Case 2: Color & Emoji Mapping**
```
Expected: Correct colors and emojis for all event types
Steps:
  1. Verify all color codes are valid hex
  2. Verify all emojis display correctly
  3. Test item emoji mapping (diamond, gold, etc.)
  4. Test block emoji mapping (ore, blocks, etc.)
  5. Test duration formatting (ms → readable)
```

**Test Case 3: Discord Compatibility**
```
Expected: All embeds are Discord-compatible
Steps:
  1. Verify embed structure matches Discord spec
  2. Verify field counts don't exceed limits
  3. Verify title/description lengths valid
  4. Check timestamp format is ISO 8601
  5. Verify colors render correctly
```

### Report Generator

**Test Case 1: Daily Report Generation**
```
Expected: Daily report aggregates active players
Steps:
  1. Create multiple players with stats
  2. Mark some as active (joined in last 24h)
  3. Call generateDailyReport()
  4. Verify player count matches active count
  5. Verify metric totals are correct
  6. Test top 5 players ranking
  7. Verify average calculations
```

**Test Case 2: Weekly Report Aggregation**
```
Expected: Weekly report combines 7 daily reports
Steps:
  1. Create 7 daily reports
  2. Call generateWeeklyReport()
  3. Verify totals are sum of daily reports
  4. Verify averages are correct
  5. Check date range in report period
```

**Test Case 3: Monthly Report Aggregation**
```
Expected: Monthly report combines ~30 daily reports
Steps:
  1. Create daily reports for a month
  2. Call generateMonthlyReport()
  3. Verify all days included
  4. Verify aggregation accuracy
  5. Test leap year handling (Feb 29)
```

**Test Case 4: Report Embed Generation**
```
Expected: Reports format correctly for Discord
Steps:
  1. Generate daily/weekly/monthly reports
  2. Convert each to embed
  3. Verify emoji selection (📅, 📊, 📈)
  4. Verify color scheme
  5. Verify field organization
```

### Performance Monitor

**Test Case 1: Metric Recording**
```
Expected: Performance metrics captured accurately
Steps:
  1. Call recordMetric(world, system)
  2. Verify metric has timestamp
  3. Verify TPS value is recorded
  4. Verify player count is recorded
  5. Verify entity count is recorded
  6. Verify chunk estimation works
```

**Test Case 2: TPS History Tracking**
```
Expected: TPS history maintained and limited
Steps:
  1. Record multiple metrics over time
  2. Verify tpsHistory array grows
  3. Verify maxMetrics limit (1000) enforced
  4. Test FIFO removal when limit exceeded
  5. Verify getAverageTPS() calculation
```

**Test Case 3: Alert Generation**
```
Expected: Alerts generated on performance issues
Steps:
  1. Create low TPS scenario (< 10)
  2. Verify CRITICAL alert generated
  3. Create medium TPS (10-15)
  4. Verify WARNING alert generated
  5. Create high entity count
  6. Verify entity alert generated
  7. Test alert deduplication (5-minute window)
```

**Test Case 4: Performance Report**
```
Expected: Comprehensive report with status
Steps:
  1. Record multiple metrics
  2. Call getPerformanceReport()
  3. Verify status calculation (Healthy/Warning/Critical)
  4. Verify last metric is correct
  5. Verify average TPS calculation
  6. Test embed generation
```

### Treasure Hunt

**Test Case 1: Treasure Recording**
```
Expected: Valuable blocks recorded with rarity
Steps:
  1. Call recordTreasure() with diamond_ore
  2. Verify treasure stored in history
  3. Verify rarity tier assigned (Rare)
  4. Verify coordinates stored
  5. Test all rarity tiers (Legendary, Epic, Rare, Uncommon)
```

**Test Case 2: Mining Streak Detection**
```
Expected: Streaks tracked within 2-minute window
Steps:
  1. Record treasure at T=0
  2. Record treasure at T=1 minute
  3. Verify streak count = 2
  4. Record treasure at T=3 minutes (beyond window)
  5. Verify streak reset
  6. Test "hot streak" notification (5+ finds)
```

**Test Case 3: Treasure Statistics**
```
Expected: Per-player treasure stats aggregated
Steps:
  1. Record multiple treasures for player
  2. Call getTreasureStats()
  3. Verify total count
  4. Verify per-item counts
  5. Verify rarity breakdown
```

**Test Case 4: Leaderboard Generation**
```
Expected: Top treasure hunters ranked by value
Steps:
  1. Create multiple players with treasures
  2. Call getTopTreasureHunters()
  3. Verify ordering by treasure value
  4. Verify weight system (legendary = higher value)
  5. Test limit enforcement (top 10)
```

### Boss System

**Test Case 1: Boss Encounter Tracking**
```
Expected: Boss fights recorded with outcome
Steps:
  1. Call recordBossEncounter() with defeated=true
  2. Verify encounter stored
  3. Verify reward calculated
  4. Test with different bosses
  5. Test defeated vs encountered scenarios
```

**Test Case 2: Duel Tracking**
```
Expected: PvP duels recorded with winner
Steps:
  1. Call recordDuel() with two players
  2. Verify duel stored
  3. Verify winner tracked
  4. Verify loser identified
  5. Test stat updates for both players
```

**Test Case 3: Epic Battle Detection**
```
Expected: 3+ player battles recorded separately
Steps:
  1. Call recordEpicBattle() with 4 players, 2 victors
  2. Verify battle stored
  3. Verify all players listed
  4. Verify victors identified
  5. Verify rewards distributed to victors
```

**Test Case 4: Combat Statistics**
```
Expected: Kill/death ratios and win rates calculated
Steps:
  1. Create player with multiple encounters
  2. Call getCombatStatsEmbed()
  3. Verify K/D ratio calculated correctly
  4. Verify win rates accurate
  5. Verify embed formatting
```

### Moderation Logger

**Test Case 1: Kick Recording**
```
Expected: Kicks logged with reason
Steps:
  1. Call recordKick()
  2. Verify in history
  3. Verify player stats updated
  4. Verify moderator tracked
```

**Test Case 2: Ban System**
```
Expected: Temporary and permanent bans tracked
Steps:
  1. Record permanent ban (duration=0)
  2. Verify isBanned() returns true
  3. Record 7-day ban
  4. Verify expiration calculated
  5. Test ban expiration after time passes
  6. Verify recordUnban() works
```

**Test Case 3: Warning System**
```
Expected: Warnings escalated and tracked
Steps:
  1. Issue 3 warnings to player
  2. Verify warning count increases
  3. Call getModerationStats()
  4. Verify warning history available
  5. Test escalation logic
```

**Test Case 4: Spam Detection**
```
Expected: Messages tracked and spam detected
Steps:
  1. Send 5 messages quickly
  2. Verify trackMessage() returns false
  3. Send 10 messages in 5 seconds
  4. Verify trackMessage() returns true (spam)
  5. Verify violations counted
  6. Test auto-mute trigger
```

### World Explorer

**Test Case 1: Location Tracking**
```
Expected: Player positions recorded and distance calculated
Steps:
  1. Record location at (0, 64, 0)
  2. Record location at (100, 64, 0)
  3. Verify distance calculated (~100)
  4. Record location at (100, 65, 0)
  5. Verify 3D distance correct
```

**Test Case 2: Height Records**
```
Expected: Highest/lowest Y coordinates tracked per dimension
Steps:
  1. Record position at Y=60 (Overworld)
  2. Verify highest set to 60
  3. Record position at Y=100
  4. Verify highest updated to 100
  5. Record position at Y=30
  6. Verify lowest set to 30
  7. Test per-dimension tracking (Nether, End)
```

**Test Case 3: Dimension Tracking**
```
Expected: Dimension visits and counts recorded
Steps:
  1. Record locations in Overworld
  2. Verify Overworld visit recorded
  3. Record Nether location
  4. Verify first Nether visit recorded
  5. Record another Nether location
  6. Verify visit count incremented
```

**Test Case 4: Biome Discovery**
```
Expected: First-time biome discoveries tracked
Steps:
  1. Call recordBiomeDiscovery() with "jungle"
  2. Verify biome stored
  3. Call again with "jungle"
  4. Verify not duplicated
  5. Call with "desert"
  6. Verify new biome added
```

**Test Case 5: Exploration Leaderboard**
```
Expected: Top explorers ranked by distance
Steps:
  1. Create multiple players with different distances
  2. Call getTopExplorers("totalDistance")
  3. Verify ordering correct
  4. Test with "locationsVisited"
  5. Test with "dimensions"
```

### Discord Dashboard

**Test Case 1: Server Status Dashboard**
```
Expected: Dashboard displays current server state
Steps:
  1. Call generateServerStatusDashboard()
  2. Verify TPS displayed
  3. Verify player count
  4. Verify uptime formatted
  5. Verify chunks/entities shown
  6. Verify status color matches health
```

**Test Case 2: Player List Dashboard**
```
Expected: Players grouped by activity status
Steps:
  1. Create 3 active, 2 idle, 1 AFK player
  2. Call generatePlayerListDashboard()
  3. Verify grouping correct
  4. Verify activity determination
  5. Verify embed formatting
```

**Test Case 3: Announcements**
```
Expected: Announcements stored and formatted
Steps:
  1. Post "normal" priority announcement
  2. Post "important" priority announcement
  3. Post "critical" priority announcement
  4. Post "news" priority announcement
  5. Verify correct emoji for each
  6. Verify correct color for each
  7. Verify feed shows last 5
```

**Test Case 4: Update Scheduling**
```
Expected: Metrics update on correct intervals
Steps:
  1. Call shouldUpdate("status") at T=0
  2. Verify returns true
  3. Call shouldUpdate("status") at T=60 seconds
  4. Verify returns false (interval is 5 min)
  5. Call at T=5 min 1 second
  6. Verify returns true
```

---

## Integration Testing

### Test Case 1: Full Event Pipeline
```
Expected: Event triggers all relevant modules
Steps:
  1. Player joins server
  2. Verify advanced stats updated
  3. Verify world explorer location recorded
  4. Verify login streak updated
  5. Verify dashboard updated
  6. Verify embed sent to Discord
```

### Test Case 2: Treasure Workflow
```
Expected: Mining rare block triggers all systems
Steps:
  1. Player breaks diamond_ore
  2. Verify TreasureHunt records find
  3. Verify rarity assigned
  4. Verify mining streak updated
  5. Verify embed generated
  6. Verify Discord webhook called
```

### Test Case 3: Boss Fight Workflow
```
Expected: Boss defeat triggers combat tracking
Steps:
  1. Player defeats Ender Dragon
  2. Verify BossSystem records encounter
  3. Verify reward calculated
  4. Verify combat stats updated
  5. Verify leaderboard affected
  6. Verify Discord notification sent
```

### Test Case 4: Report Generation
```
Expected: Daily report aggregates all data
Steps:
  1. Run server with activity for 24 hours
  2. Trigger report generation
  3. Verify all player stats included
  4. Verify all metrics calculated
  5. Verify Discord embed formatted
  6. Verify webhook called
```

---

## Performance Testing

### Test Case 1: Memory Usage
```
Expected: Module memory footprint reasonable
Steps:
  1. Start server and monitor memory
  2. Run for 1 hour with normal activity
  3. Verify memory doesn't grow unbounded
  4. Check history limits enforced
  5. Verify cleanup processes work
```

### Test Case 2: CPU Impact
```
Expected: Modules don't cause CPU spikes
Steps:
  1. Monitor CPU during normal operation
  2. Trigger report generation
  3. Verify no CPU spike > 10%
  4. Record metric at 60-second interval
  5. Verify TPS stays stable
```

### Test Case 3: Disk I/O
```
Expected: Data exports don't block game
Steps:
  1. Enable data export
  2. Trigger export
  3. Verify game remains responsive
  4. Check files written correctly
  5. Verify no lag during export
```

---

## Discord Integration Testing

### Test Case 1: Webhook Delivery
```
Expected: All embeds reach Discord
Steps:
  1. Trigger various events
  2. Check Discord channels receive messages
  3. Verify embeds render correctly
  4. Check colors display properly
  5. Verify timestamps show
  6. Check all fields visible
```

### Test Case 2: Rate Limiting
```
Expected: Handles Discord rate limits gracefully
Steps:
  1. Trigger rapid events
  2. Verify messages queue if rate limited
  3. Verify queue processes in order
  4. Verify no messages lost
  5. Check server performance unaffected
```

### Test Case 3: Error Handling
```
Expected: Invalid webhooks handled gracefully
Steps:
  1. Use invalid webhook URL
  2. Trigger event
  3. Verify error logged
  4. Verify server continues
  5. Verify error webhook called if configured
```

---

## Configuration Testing

### Test Case 1: Feature Toggles
```
Expected: Disabling features works correctly
Steps:
  1. Disable advancedStats in config
  2. Trigger achievement event
  3. Verify not recorded
  4. Disable treasureHunt
  5. Verify mining events ignored
  6. Disable moderation
  7. Verify kicks not logged
```

### Test Case 2: Threshold Adjustment
```
Expected: Custom thresholds respected
Steps:
  1. Set TPS alert threshold to 18
  2. Run at TPS 17
  3. Verify alert triggered
  4. Change spam threshold to 5 messages
  5. Send 5 messages quickly
  6. Verify spam detected
```

### Test Case 3: Interval Configuration
```
Expected: Custom intervals applied
Steps:
  1. Set report interval to 1 hour
  2. Wait 1 hour
  3. Verify report generated
  4. Set performance interval to 30 seconds
  5. Verify metrics recorded every 30s
```

---

## Logging & Debugging

### Enable Debug Logging
Add to configuration:
```javascript
logging: {
  console: { logLevel: "debug", enabled: true },
  fileLogging: { enabled: true },
  discordLogging: { logErrors: true }
}
```

### Check Logs
- Console logs for initialization messages
- Console logs for errors and warnings
- File logs in `./logs/` directory
- Discord error channel for failures

### Common Issues & Solutions

**Issue: Module not initializing**
- Solution: Check file imports match file locations
- Solution: Verify no syntax errors in files
- Solution: Check console for specific error message

**Issue: Data not being recorded**
- Solution: Verify feature is enabled in config
- Solution: Check event handlers are attached
- Solution: Verify sendWebhook function works

**Issue: Discord messages not appearing**
- Solution: Verify webhook URLs are correct
- Solution: Check Discord channel permissions
- Solution: Verify webhook is still valid (not deleted)

**Issue: Performance degradation**
- Solution: Reduce maxHistorySize values
- Solution: Increase metric recording intervals
- Solution: Disable unused modules
- Solution: Check for memory leaks in logs

---

## Final Verification Checklist

- [ ] All modules load at startup
- [ ] No error messages in console
- [ ] All webhooks configured and reachable
- [ ] Test player join triggers stats update
- [ ] Test achievement recording
- [ ] Test treasure detection and notifications
- [ ] Test boss fight recording
- [ ] Test moderation actions logged
- [ ] Test exploration tracking
- [ ] Test performance monitoring
- [ ] Test report generation
- [ ] Test Discord dashboard updates
- [ ] Test all embeds display correctly
- [ ] Test configuration changes apply
- [ ] Test feature toggles work
- [ ] Monitor performance for 1 hour
- [ ] Verify no memory leaks
- [ ] Check Discord channels have new messages
- [ ] Verify data exports working
- [ ] Test moderation features
- [ ] Run with 10+ players simultaneously

---

## Sign-Off

**System Ready for Production**: ✅ YES / ❌ NO

**Date Verified**: _________________

**Verified By**: _________________

**Notes**: _________________________________________________________________

When all tests pass, the webhook bridge v4.1.0 is ready for production deployment!
