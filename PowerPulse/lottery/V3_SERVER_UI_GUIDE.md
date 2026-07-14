# 🎰 Lottery System v3.0.0 - Server UI Edition
## Complete Server UI, Money System & Admin Panel

---

## 📋 What's New in v3.0.0

### ✅ Complete Server UI
- Beautiful ActionFormData menus for players
- ModalFormData forms for input
- Navigation with "Back" buttons
- Texture icons for visual appeal

### ✅ Money System Support
- Uses `$` currency (configurable)
- Supports any money/economy system
- Proper currency formatting

### ✅ Admin Configuration Panel
- Change ticket prices in real-time
- Adjust draw intervals
- Modify prize amounts
- All without restarting server

### ✅ Fixed Error Handling
- Proper error message handling
- No more "not a function" errors
- Graceful error recovery

---

## 🎮 Player User Interface

### Main Menu (`!lotto-menu`)

When players type `!lotto-menu`, they see:

```
┌─────────────────────────────────┐
│     🎰 Lotterie System          │
│   Willkommen, PlayerName!        │
│   Wähle eine Option:             │
│                                 │
│  🎫 Tickets Kaufen              │
│  📊 Statistiken                 │
│  ℹ️ Information                 │
│  ❓ Hilfe                       │
└─────────────────────────────────┘
```

**Features:**
- Colored buttons with icons
- Smooth navigation
- Shows player name
- Texture-based visual design

### Tickets Kaufen (Buy Tickets)

Players enter desired ticket count:

```
┌─────────────────────────────────┐
│    🎫 Tickets Kaufen            │
│ Anzahl Tickets (1-10):          │
│ [_____________]                 │
│                                 │
│         [Bestätigen]            │
└─────────────────────────────────┘
```

**Validation:**
- Input must be 1-10
- Shows error if invalid
- Allows retry

**Output:**
- Purchase confirmation
- Ticket total displayed
- Pool size updated
- In-game broadcast to all

### Statistiken (Statistics)

Displays player statistics:

```
┌─────────────────────────────────┐
│    📊 Deine Statistiken         │
│ Spieler: PlayerName             │
│ Tickets: 15                     │
│ Ausgegeben: $150                │
│ Gewonnen: $5000                 │
│ Gewinne: 1                      │
│ Netto: +$4850                   │
│                                 │
│  [← Zurück]                     │
└─────────────────────────────────┘
```

**Tracked Data:**
- Total tickets owned
- Money spent
- Money won
- Number of wins
- Net profit/loss

### Information Menu

Shows current lottery state:

```
┌─────────────────────────────────┐
│ 🎰 Lotterie Information         │
│                                 │
│ Status: ✅ AKTIV                │
│ Ticket-Preis: $10               │
│ Tickets im Pool: 250            │
│ Aktueller Pot: $1750            │
│ Gesamte Spieler: 12             │
│                                 │
│ ━━━━ PREISE ━━━━               │
│ 1. Platz: $5000                 │
│ 2. Platz: $1000                 │
│ 3. Platz: $500                  │
│ 4. Platz: $200                  │
│ 5. Platz: $100                  │
└─────────────────────────────────┘
```

---

## 🔧 Admin Configuration Panel

### Admin Panel (`!lotto-admin`)

Admins see complete control panel:

```
┌─────────────────────────────────┐
│      ⚙️ Admin Panel             │
│   Wähle eine Admin-Funktion:    │
│                                 │
│  📊 Statistiken                 │
│  🎲 Ziehung Auslösen            │
│  ⚙️ Einstellungen               │
│  🔄 Daten Zurücksetzen          │
└─────────────────────────────────┘
```

### Statistiken (Admin Statistics)

View global lottery statistics:

```
┌─────────────────────────────────┐
│    📊 Admin Statistiken         │
│                                 │
│ Total Tickets Sold: 500         │
│ Total Money Spent: $5000        │
│ Server Revenue: $1500           │
│ Current Pot: $3500              │
│ Active Players: 50              │
│                                 │
│ ━━━━ TOP 5 PLAYERS ━━━━        │
│ 1. Player1 - 45 tickets         │
│ 2. Player2 - 38 tickets         │
│ 3. Player3 - 32 tickets         │
│ 4. Player4 - 28 tickets         │
│ 5. Player5 - 22 tickets         │
└─────────────────────────────────┘
```

### Einstellungen (Configuration)

Admins can adjust settings:

```
┌─────────────────────────────────┐
│   ⚙️ Lotterie Einstellungen    │
│                                 │
│ Ticket Preis:                   │
│ [10_________________]           │
│                                 │
│ Ziehungs-Intervall (ms):       │
│ [3600000____________]           │
│                                 │
│ Jackpot Preis:                 │
│ [5000_______________]           │
│                                 │
│ 2. Platz Preis:                │
│ [1000_______________]           │
│                                 │
│    [Bestätigen] [Abbrechen]    │
└─────────────────────────────────┘
```

**Configurable Settings:**
- Ticket price ($)
- Draw interval (milliseconds)
- Jackpot prize ($)
- 2nd place prize ($)
- (Easily extended for more settings)

### Daten Zurücksetzen (Reset Data)

Safe confirmation before reset:

```
┌─────────────────────────────────┐
│     ⚠️ WARNUNG!                │
│                                 │
│ Sind Sie sicher, dass Sie ALLE  │
│ Lotterie-Daten löschen möchten? │
│                                 │
│ ⚠️ DIESE AKTION KANN NICHT      │
│    RÜCKGÄNGIG GEMACHT WERDEN!   │
│                                 │
│  [🔄 Ja, Zurücksetzen]         │
│  [❌ Nein, Abbrechen]          │
└─────────────────────────────────┘
```

**Safety Features:**
- Confirmation required
- Warning message clear
- Can cancel anytime
- Discord notification sent

---

## 💰 Money System Integration

### Currency Configuration

```javascript
CONFIG.currency = '$';              // Display symbol
CONFIG.useMoney = true;             // Enable money system
CONFIG.currencyName = 'Dollars';    // Full name
CONFIG.ticketPrice = 10;            // $10 per ticket
```

### Revenue Tracking

```javascript
CONFIG.serverTake = 0.30;           // 30% server fee
CONFIG.potPercentage = 0.70;        // 70% to prize pool
```

**Example: Player buys 1 ticket for $10**
- Server receives: $3 (30%)
- Prize pool gets: $7 (70%)

### Currency Display

All amounts display with `$` symbol:
- `$10` - ticket price
- `$150` - total spent
- `$5000` - jackpot prize
- `$1750` - current pool

---

## 📊 Complete Feature List

### Player Features
✅ Open menu with `!lotto-menu`
✅ Buy tickets (1-10 per transaction)
✅ View personal statistics
✅ See help information
✅ Automatic participation in draws
✅ Receive notifications when winning
✅ Beautiful UI with navigation

### Admin Features
✅ Admin panel with `!lotto-admin`
✅ View global statistics
✅ Manually trigger draws
✅ Configure settings in real-time
✅ Reset all data (with confirmation)
✅ Top 5 players leaderboard
✅ Server revenue tracking

### System Features
✅ Server UI (ActionFormData/ModalFormData)
✅ Money system support ($)
✅ Discord embeds integration
✅ In-game broadcasting
✅ Console logging
✅ Auto-draw every hour
✅ 5-tier prize system
✅ Player statistics tracking
✅ Draw history
✅ Error handling

---

## 🚀 Quick Start

### Installation
```javascript
// Add to BedrockBridge index.js
import "./bridgePlugins/lottery/main.js";
```

### Restart Server
Server will automatically load and initialize

### Test Players
Type: `!lotto-menu`

### Test Admins
Type: `!lotto-admin`

---

## 🎯 Commands Summary

### Player Commands
| Command | Action |
|---------|--------|
| `!lotto-menu` | Open main menu |
| `!lotto-stats` | View statistics |
| `!lotto-help` | View help |

### Admin Commands
| Command | Action |
|---------|--------|
| `!lotto-admin` | Open admin panel |
| `!lotto-admin-draw` | Trigger draw |
| `!lotto-admin-reset` | Reset data (confirmation) |

---

## ⚙️ Configuration Options

Edit `CONFIG` object in main.js:

```javascript
// Currency Settings
CONFIG.currency = '$';                    // Display symbol
CONFIG.ticketPrice = 10;                  // Cost per ticket
CONFIG.useMoney = true;                   // Use money system

// Draw Settings
CONFIG.drawInterval = 3600000;            // 1 hour (in ms)
CONFIG.autoDrawEnabled = true;            // Auto-draw toggle

// Prize Settings
CONFIG.fixedPrizes.jackpot = 5000;       // 1st place
CONFIG.fixedPrizes.second = 1000;        // 2nd place
CONFIG.fixedPrizes.third = 500;          // 3rd place
CONFIG.fixedPrizes.fourth = 200;         // 4th place
CONFIG.fixedPrizes.fifth = 100;          // 5th place

// Revenue Settings
CONFIG.serverTake = 0.30;                // 30% server fee
CONFIG.potPercentage = 0.70;             // 70% to prizes

// Integration Settings
CONFIG.discordIntegration = true;        // Discord embeds
CONFIG.debugLogging = true;              // Console logging
```

---

## 🐛 Error Handling

### Fixed Issues
✅ Removed `isValid()` function call issue
✅ Improved error message formatting
✅ Added try-catch blocks around all UI operations
✅ Proper error logging with meaningful messages

### Error Messages
All errors logged as:
```
[🎰 Lottery] ❌ ERROR: Description of what went wrong
```

---

## 📝 Discord Integration

### Messages Sent
1. **Ticket Purchase** - When player buys tickets
2. **Draw Results** - When draw completes
3. **Configuration Change** - When admin changes settings
4. **Data Reset** - When admin resets data
5. **System Startup** - When server starts

### Embed Format
- **Title:** Event description
- **Description:** Details with emoji
- **Color:** Hex color code
- **Timestamp:** Auto-added

---

## 🎰 Draw System

### Automatic Draws
- Trigger every 1 hour (configurable)
- Only if there are tickets sold
- Selects 5 random winners
- Distributes prizes

### Manual Draws
- Admin can trigger with `!lotto-admin-draw`
- Shows confirmation on admin screen
- Broadcasts results to all channels

### Draw Results
```
🎰 ═══════════════════════════════════════
🎰 LOTTERIE ZIEHUNG #draw_1
🎰 ═══════════════════════════════════════
🎯 GEWINNER:
1. Platz: Player1 → $5000
2. Platz: Player2 → $1000
3. Platz: Player3 → $500
4. Platz: Player4 → $200
5. Platz: Player5 → $100

📊 Pool: $7200
🎟️ Tickets: 250
🎰 ═══════════════════════════════════════
```

---

## 📊 Data Tracking

### Per-Player Data
- Name
- Tickets owned
- Money spent
- Money won
- Number of wins
- Join date

### Global Data
- Total tickets sold
- Total money spent
- Server revenue earned
- Current prize pool
- Draw history
- Player count

---

## 🔐 Safety Features

### Admin Functions
- Reset requires confirmation
- Warning message shown
- Can cancel at any time
- Discord notification sent

### Input Validation
- Ticket amount must be 1-10
- Configuration values checked
- Division by zero prevented
- Type checking on inputs

---

## 🌍 Multi-Language Support

Current language: German (Deutsch)
Easy to change strings:

```javascript
form.title("§e🎰 Lotterie System");  // Change title
form.body("Willkommen!");             // Change text
form.button("Tickets Kaufen");        // Change button
```

---

## 📈 Server Performance

### Optimizations
- Uses Maps for efficient data storage
- No expensive database queries
- Efficient draw algorithm
- Minimal memory footprint
- No dynamic property bloat

### Auto-Draw Timing
- Runs on `system.runInterval()`
- Only checks when interval expires
- Skips if no tickets
- Efficient random selection

---

## ✅ Testing Checklist

- [ ] Server starts without errors
- [ ] `!lotto-menu` opens player menu
- [ ] Player can buy tickets in UI
- [ ] Statistics display correctly
- [ ] `!lotto-admin` opens admin panel
- [ ] Admin can change settings
- [ ] Draw results broadcast to all players
- [ ] Discord receives embeds
- [ ] Console logs all actions
- [ ] Currency displays with `$`
- [ ] Top 5 players list works
- [ ] Reset confirmation works

---

## 🎉 Summary

**Version 3.0.0 includes:**
- ✅ Complete Server UI with ActionFormData
- ✅ Money system support ($)
- ✅ Admin configuration panel
- ✅ Fixed error handling
- ✅ Beautiful player experience
- ✅ Powerful admin tools
- ✅ Full Discord integration
- ✅ Professional quality code

**Simply:**
1. Add import to BedrockBridge
2. Restart server
3. Players: Type `!lotto-menu`
4. Admins: Type `!lotto-admin`
5. Enjoy! 🎰

---

**Version:** 3.0.0 - Server UI Edition
**Status:** ✅ Production Ready
**Compatibility:** Bedrock 1.21.120+, BedrockBridge 1.0.3+
