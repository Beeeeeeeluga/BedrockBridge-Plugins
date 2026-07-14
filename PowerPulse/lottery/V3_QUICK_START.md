# 🎰 Lottery System v3.0.0 - Quick Start

## 2-Minute Setup

### Step 1: Add Import
Edit `D:\BB\Bedrock-Bridge\scripts\index.js`:

```javascript
import "./bridgePlugins/lottery/main.js";
```

### Step 2: Restart Server
Stop and restart your Bedrock server.

**That's it!** 🎉

---

## Test It

### Players
```
!lotto-menu
```
You'll see a beautiful menu!

### Admins
```
!lotto-admin
```
You'll see the admin panel!

---

## What You Get

### Player Menu
- 🎫 **Tickets Kaufen** - Buy tickets with nice UI
- 📊 **Statistiken** - View your stats
- ℹ️ **Information** - See lottery info
- ❓ **Hilfe** - Get help

### Admin Panel
- 📊 **Statistiken** - View global stats
- 🎲 **Ziehung Auslösen** - Trigger draw
- ⚙️ **Einstellungen** - Change settings in real-time
- 🔄 **Daten Zurücksetzen** - Reset with confirmation

---

## Main Features

✅ **Beautiful Server UI** - ActionFormData menus
✅ **Money System** - Uses $ currency
✅ **Real-time Config** - Change settings without restart
✅ **Admin Panel** - Full control
✅ **Discord Embeds** - All events send to Discord
✅ **Player Stats** - Track everything
✅ **5-Tier Draws** - 5 winners per draw
✅ **In-Game Broadcasting** - All players see announcements

---

## Quick Commands

| Command | What It Does |
|---------|-------------|
| `!lotto-menu` | Opens player menu |
| `!lotto-stats` | Quick stats view |
| `!lotto-help` | Show help |
| `!lotto-admin` | Opens admin panel |
| `!lotto-admin-draw` | Trigger draw |
| `!lotto-admin-reset` | Reset data |

---

## Configuration

Edit `CONFIG` in main.js:

```javascript
// Currency
CONFIG.currency = '$';           // Can be anything: $ € £
CONFIG.ticketPrice = 10;         // $10 per ticket

// Draw timing
CONFIG.drawInterval = 3600000;   // 1 hour (3600000 ms)

// Prizes
CONFIG.fixedPrizes.jackpot = 5000;   // 1st place
CONFIG.fixedPrizes.second = 1000;    // 2nd place
// ... etc

// Revenue
CONFIG.serverTake = 0.30;        // 30% server gets
CONFIG.potPercentage = 0.70;     // 70% for prizes
```

---

## How It Works

### Player Buys 1 Ticket
```
Player pays: $10
Server gets: $3
Prize pool gets: $7
Total tickets: +1
```

### Draw Happens
```
1. 5 random winners selected
2. Prizes awarded:
   - 1st: $5000
   - 2nd: $1000
   - 3rd: $500
   - 4th: $200
   - 5th: $100
3. New draw starts
```

---

## Error Fixes (v3.0.0)

✅ Fixed `isValid()` function error
✅ Better error messages
✅ Proper try-catch handling
✅ No more "not a function" errors

---

## Player Experience

### Menu Style
```
┌──────────────────────────────┐
│   🎰 Lotterie System         │
│  Willkommen, PlayerName!      │
│  Wähle eine Option:          │
│                              │
│ [🎫 Tickets Kaufen]          │
│ [📊 Statistiken]             │
│ [ℹ️ Information]             │
│ [❓ Hilfe]                   │
└──────────────────────────────┘
```

### Buy Tickets Form
```
┌──────────────────────────────┐
│  🎫 Tickets Kaufen           │
│                              │
│ Anzahl Tickets (1-10):       │
│ [_____________]              │
│                              │
│  [Bestätigen] [Abbrechen]    │
└──────────────────────────────┘
```

---

## Admin Experience

### Admin Panel
```
┌──────────────────────────────┐
│   ⚙️ Admin Panel             │
│ Wähle eine Admin-Funktion:   │
│                              │
│ [📊 Statistiken]             │
│ [🎲 Ziehung Auslösen]        │
│ [⚙️ Einstellungen]           │
│ [🔄 Daten Zurücksetzen]      │
└──────────────────────────────┘
```

### Configuration Form
```
┌──────────────────────────────┐
│ ⚙️ Lotterie Einstellungen   │
│                              │
│ Ticket Preis:               │
│ [10________________]        │
│                              │
│ Ziehungs-Intervall:         │
│ [3600000__________]         │
│                              │
│ Jackpot Preis:              │
│ [5000______________]        │
│                              │
│ [Bestätigen] [Abbrechen]    │
└──────────────────────────────┘
```

---

## Example Gameplay

### Minute 1: Player joins
- Types `!lotto-menu`
- Sees main menu

### Minute 2: Player buys tickets
- Clicks "Tickets Kaufen"
- Enters "5"
- Pays $50
- Sees confirmation
- All players see broadcast

### Hour 1: Draw happens
- 5 random winners selected
- Prizes awarded
- Discord notification sent
- New draw starts

### Admin: Changes settings
- Types `!lotto-admin`
- Clicks "Einstellungen"
- Changes ticket price to $20
- Saves changes
- Takes effect immediately!

---

## Discord Integration

**When something happens:**
1. Player buys ticket → Discord embed sent
2. Draw completes → Discord embed with winners
3. Admin changes config → Discord notification
4. Server starts → Startup message

---

## Troubleshooting

**Q: Menu doesn't appear?**
A: Make sure server restarted after import

**Q: Players see error?**
A: Check console for error messages

**Q: No Discord messages?**
A: Check Discord bot is set up in BedrockBridge

**Q: Settings don't save?**
A: They're stored in memory, lost on restart (intentional - easy to restore)

---

## Next Steps

1. ✅ Add import
2. ✅ Restart server
3. ✅ Test with `!lotto-menu`
4. ✅ Adjust CONFIG as needed
5. ✅ Monitor Discord
6. 🎉 Enjoy!

---

## What Changed From v2.0.0

| Feature | v2.0.0 | v3.0.0 |
|---------|--------|--------|
| Chat Commands | ✅ | ✅ |
| Server UI | ❌ | ✅ NEW |
| Admin Panel | ❌ | ✅ NEW |
| Money System | ❌ | ✅ NEW |
| Real-time Config | ❌ | ✅ NEW |
| Error Handling | ⚠️ | ✅ FIXED |

---

## Support

**Questions?**
See: `V3_SERVER_UI_GUIDE.md`

**Full Details?**
See: `BRIDGE_INTEGRATION_GUIDE.md`

**Issues?**
Check console for error messages

---

**Viel Spaß mit der Lotterie v3.0.0! 🎰**

Just type `!lotto-menu` and enjoy!
