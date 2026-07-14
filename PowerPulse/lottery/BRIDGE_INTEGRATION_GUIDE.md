# 🎰 BedrockBridge Lottery System v2.0.0
## Professional Integration Guide

---

## 📋 Table of Contents

1. [Installation](#installation)
2. [Architecture](#architecture)
3. [Command Reference](#command-reference)
4. [Discord Integration](#discord-integration)
5. [Configuration](#configuration)
6. [Testing Checklist](#testing-checklist)

---

## 🚀 Installation

### Prerequisites
- BedrockBridge 1.0.3 or higher
- Bedrock Edition 1.21.120 or higher
- Discord bot configured in BedrockBridge

### Step 1: Add Import to BedrockBridge

In your BedrockBridge `index.js` file, add:

```javascript
import "./bridgePlugins/lottery/main.js";
```

### Step 2: Verify Plugin Loading

When the server starts, you should see:

```
╔═══════════════════════════════════════════╗
║  🎰 LOTTERY SYSTEM v2.0.0                ║
║  Professional BedrockBridge Plugin       ║
╠═══════════════════════════════════════════╣
║  Status: ✅ LOADED                       ║
║  Commands: !lotto, !lotto-stats, etc.   ║
║  Discord: ✅ READY                       ║
║  Version: 2.0.0                         ║
╚═══════════════════════════════════════════╝

[🎰 Lottery] ✅ Plugin loaded successfully!
[🎰 Lottery] ✅ Commands available: !lotto, !lotto-stats, !lotto-help, !lottery
[🎰 Lottery] ✅ Admin commands: !lotto-admin-draw, !lotto-admin-reset, !lotto-admin-stats
```

### Step 3: Test in Game

Type `/lotto-help` in Minecraft chat to see all available commands.

---

## 🏗️ Architecture

### Integration Pattern

The lottery system uses BedrockBridge's standard command registration pattern:

```javascript
import { bridge } from '../addons';
import { bridgeDirect } from '../BridgeDirect';

// Player commands
bridge.bedrockCommands.registerCommand("lotto", (caller, amount) => {
    // Handle ticket purchase
}, "Buy lottery tickets");

// Admin commands
bridge.bedrockCommands.registerAdminCommand("lotto-admin-draw", (caller) => {
    // Trigger lottery draw
}, "Manually trigger a lottery draw");
```

### Command Flow

```
Player executes command in Minecraft chat
         ↓
BedrockBridge intercepts (with ! prefix)
         ↓
Command callback executed
         ↓
Triple Message Output:
    - In-game broadcast (world.sendMessage)
    - Discord embed (bridgeDirect.sendEmbed)
    - Console log (console.log)
```

### Message Classes

```
PlayerMessage    → In-game message to executor
BroadcastMessage → In-game message to all players
DiscordEmbed     → Formatted embed to Discord
ConsoleLog       → Server console logging
```

---

## 📖 Command Reference

### Player Commands

#### `/lottery` or `!lottery`
**Description:** Display lottery information and current status

**Usage:**
```
!lottery
```

**Output (3 channels):**
- ✅ In-game message with status
- ✅ Discord embed with current pool size
- ✅ Console log of player interaction

---

#### `/lotto <amount>` or `!lotto <amount>`
**Description:** Buy lottery tickets (1-10 per transaction)

**Usage:**
```
!lotto 5          (buy 5 tickets)
!lotto            (buy 1 ticket, default)
```

**Validation:**
- Amount must be between 1 and 10
- Cost: 10 emeralds per ticket
- 70% goes to prize pool, 30% server fee

**Output (3 channels):**
- ✅ In-game success message with receipt
- ✅ Discord embed with purchase details
- ✅ Console log with transaction record

**Error Handling:**
- Invalid amount → Red error message
- Logged to console as ERROR

---

#### `/lotto-stats` or `!lotto-stats`
**Description:** View your personal lottery statistics

**Usage:**
```
!lotto-stats
```

**Statistics Displayed:**
- Total tickets purchased
- Total amount spent
- Total winnings
- Number of wins
- Net profit/loss

**Output (3 channels):**
- ✅ Detailed in-game statistics display
- ✅ Discord embed with formatted stats
- ✅ Console log of access

---

#### `/lotto-help` or `!lotto-help`
**Description:** Display complete help and command list

**Usage:**
```
!lotto-help
```

**Content Shown:**
- All player commands with descriptions
- How the lottery works
- Prize distribution (5-tier system)
- Ticket pricing information

---

### Admin Commands

#### `/lotto-admin-draw` or `!lotto-admin-draw`
**Description:** Manually trigger a lottery draw (Admin only)

**Requirements:** Admin tag

**Usage:**
```
!lotto-admin-draw
```

**Behavior:**
- Requires at least 1 ticket sold
- Selects 5 random winners
- Distributes prizes based on 5-tier system
- Creates new draw automatically
- Resets ticket pool

**Draw Results:**
```
Draw ID: draw_1
Winners:
  1st Place: PlayerName → 5000 emeralds
  2nd Place: PlayerName → 1000 emeralds
  3rd Place: PlayerName → 500 emeralds
  4th Place: PlayerName → 200 emeralds
  5th Place: PlayerName → 100 emeralds
```

**Output (3 channels):**
- ✅ Formatted in-game draw announcement
- ✅ Discord embed with all winners
- ✅ Console log with draw details

**Error Handling:**
- No tickets → Draw cancelled, message shown
- Logged as ERROR

---

#### `/lotto-admin-reset` or `!lotto-admin-reset`
**Description:** Reset all lottery data (Admin only)

**Requirements:** Admin tag

**Usage:**
```
!lotto-admin-reset
```

**Clears:**
- All player statistics
- Draw history
- Current ticket pool
- All pending winnings

**⚠️ WARNING:** This action cannot be undone!

**Output (3 channels):**
- ✅ Confirmation message in-game
- ✅ Discord embed notification
- ✅ Console log of reset action

---

#### `/lotto-admin-stats` or `!lotto-admin-stats`
**Description:** View global lottery statistics (Admin only)

**Requirements:** Admin tag

**Usage:**
```
!lotto-admin-stats
```

**Statistics Shown:**
- Total tickets sold (all-time)
- Total money spent
- Current prize pool
- Number of active players
- Top 5 players by tickets

**Output (3 channels):**
- ✅ Detailed in-game statistics
- ✅ Discord embed with metrics
- ✅ Console log of access

---

## 🎯 Discord Integration

### Setup Requirements

1. **Bridge Initialization:**
   ```javascript
   bridge.events.bridgeInitialize.subscribe(e => {
       e.registerAddition("discord_direct");
   });
   ```

2. **Discord Connection:**
   ```javascript
   bridgeDirect.events.directInitialize.subscribe(() => {
       // Discord is ready, messages can be sent
   });
   ```

### Discord Embed Format

All Discord messages use standardized embeds:

```javascript
{
    title: "🎰 Lottery Event Title",
    description: "Event details and statistics",
    color: 0x00AA00,  // Hex color code
    timestamp: new Date().toISOString()
}
```

### Discord Messages Sent

#### 🎫 Ticket Purchase
- **Trigger:** Player buys tickets
- **Color:** Green (0x00AA00)
- **Content:** Purchase amount, cost, new pool size

#### 🎰 Lottery Draw
- **Trigger:** Draw occurs (manual or automatic)
- **Color:** Orange (0xFF6600)
- **Content:** All 5 winners, prize amounts, total pool

#### 📊 Statistics Viewed
- **Trigger:** Player views stats
- **Color:** Orange (0xFF8800)
- **Content:** Player's statistics summary

#### ⚙️ Admin Actions
- **Trigger:** Admin reset, draw, etc.
- **Color:** Varies by action
- **Content:** Admin name and action details

---

## ⚙️ Configuration

### CONFIG Object

```javascript
const CONFIG = {
    enabled: true,
    ticketPrice: 10,                    // Cost per ticket
    currency: 'emerald',                 // Currency name
    maxTicketsPerPlayer: 1000,          // Limit per player
    maxTicketsPerDraw: 50000,           // Limit per draw
    drawInterval: 3600000,              // Auto-draw interval (ms)
    autoDrawEnabled: true,              // Enable auto-draw

    // Prize distribution
    fixedPrizes: {
        jackpot: 5000,
        second: 1000,
        third: 500,
        fourth: 200,
        fifth: 100
    },

    // Pot distribution percentages
    potDistribution: {
        jackpot: 0.50,
        second: 0.25,
        third: 0.15,
        fourth: 0.07,
        fifth: 0.03
    },

    // Bonus multipliers
    bonusSystem: {
        enabled: true,
        multiTicketBonus: 0.05,
        weeklyBonus: 0.10,
        consecutiveWinBonus: 0.15
    },

    debugLogging: true,
    discordIntegration: true
};
```

### Customization Examples

**Increase Ticket Price:**
```javascript
CONFIG.ticketPrice = 50;  // 50 emeralds per ticket
```

**Adjust Prize Pool:**
```javascript
CONFIG.fixedPrizes.jackpot = 10000;  // Increase jackpot
```

**Change Draw Interval:**
```javascript
CONFIG.drawInterval = 7200000;  // 2 hours instead of 1
```

**Disable Discord:**
```javascript
CONFIG.discordIntegration = false;
```

---

## ✅ Testing Checklist

### Pre-Deployment Tests

- [ ] **Plugin Loading**
  - Server starts without errors
  - Startup message visible in console
  - No import errors logged

- [ ] **Player Commands**
  - [ ] `!lottery` displays info correctly
  - [ ] `!lotto 1` purchases ticket
  - [ ] `!lotto 10` purchases 10 tickets
  - [ ] `!lotto 0` shows error
  - [ ] `!lotto 11` shows error
  - [ ] `!lotto-stats` displays player stats
  - [ ] `!lotto-help` shows all commands

- [ ] **In-Game Messages**
  - [ ] All commands produce formatted responses
  - [ ] Colors display correctly
  - [ ] No formatting errors
  - [ ] Broadcasts appear to all players

- [ ] **Discord Messages**
  - [ ] Embeds send to Discord channel
  - [ ] Titles and descriptions format correctly
  - [ ] Colors display properly
  - [ ] Timestamps included

- [ ] **Console Logging**
  - [ ] [🎰 Lottery] prefix visible
  - [ ] All actions logged
  - [ ] Errors marked with ❌
  - [ ] Success actions marked with ✅

- [ ] **Admin Commands**
  - [ ] `!lotto-admin-draw` triggers draw
  - [ ] Draw selects 5 winners
  - [ ] Prizes distributed correctly
  - [ ] `!lotto-admin-stats` shows metrics
  - [ ] `!lotto-admin-reset` clears data

- [ ] **Data Management**
  - [ ] Player tickets tracked
  - [ ] Pool size calculated correctly
  - [ ] Winnings recorded properly
  - [ ] Statistics accurate

- [ ] **Auto-Draw**
  - [ ] Automatic draws occur at interval
  - [ ] Winners selected randomly
  - [ ] New draw created after completion

### Example Test Session

```
1. Start server
   ✓ Lottery plugin loads
   ✓ Startup messages appear

2. Player joins
   ✓ Player views !lottery info
   ✓ Discord notified
   ✓ Console logs action

3. Player buys tickets
   ✓ Player receives confirmation
   ✓ Pool size updated
   ✓ Discord purchase notification

4. Multiple players buy tickets
   ✓ All purchases tracked
   ✓ Pool grows correctly

5. Admin triggers draw
   ✓ 5 winners selected
   ✓ Prizes announced in-game
   ✓ Discord draw embed sent
   ✓ Console logs draw results

6. Players check stats
   ✓ Winners see winnings
   ✓ Losers see spending
   ✓ Discord notified

7. Verify data
   ✓ !lotto-admin-stats accurate
   ✓ Top players listed correctly
```

---

## 🔧 Troubleshooting

### Plugin doesn't load

**Check:**
1. File path: `D:\BB\bridgePlugins\lottery\main.js`
2. Import statement in BedrockBridge index.js
3. No syntax errors in main.js
4. BedrockBridge version 1.0.3+

**Log Location:** Server console

### Commands not recognized

**Check:**
1. Command prefix matches BedrockBridge (usually `!`)
2. Player has required tags for admin commands
3. Exact command name (case-sensitive)
4. No spaces in command name

### Discord messages not sending

**Check:**
1. `CONFIG.discordIntegration` is `true`
2. Discord bot configured in BedrockBridge
3. bridgeDirect is initialized
4. Discord channel permissions allow embeds

### Players not seeing messages

**Check:**
1. Chat events not cancelled elsewhere
2. Player is valid and online
3. Message contains valid Minecraft color codes
4. No special characters breaking format

---

## 📚 Related Files

- `main.js` - Main plugin file (this one)
- `QUICK_FIX.md` - Quick start guide
- `00_QUICK_START_FIX.txt` - Status overview

---

## 🎓 Learn More

- [BedrockBridge GitHub](https://github.com/InnateAlpaca/BedrockBridge)
- [Minecraft Script API Docs](https://learn.microsoft.com/en-us/minecraft/creator/documents/scriptingintroduction)
- [Discord Embed Specification](https://discord.com/developers/docs/resources/message#embed-object)

---

## 📝 Version History

- **v2.0.0** - Full BedrockBridge integration with Discord embeds
- **v1.1.0** - Standalone mode with basic commands
- **v1.0.0** - Initial development

---

**Last Updated:** 2025-11-18
**Status:** ✅ Production Ready
**Compatibility:** Bedrock 1.21.120+, BedrockBridge 1.0.3+
