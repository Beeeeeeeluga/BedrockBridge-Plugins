# 🎰 Lottery System v2.0.0 - Installation Guide

## Quick Start (2 Steps)

### Step 1: Add One Line to BedrockBridge

Edit your BedrockBridge `index.js` file and add this import:

```javascript
import "./bridgePlugins/lottery/main.js";
```

### Step 2: Restart Server

```bash
Stop the server
Start the server
```

That's it! The lottery system is now active.

---

## Verify Installation

When your server starts, you should see this output:

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
```

---

## Test It!

### In Minecraft Chat:
```
!lottery                # View status
!lotto 5                # Buy 5 tickets
!lotto-stats            # View your stats
!lotto-help             # See all commands
```

### Console Commands (Admin):
```
!lotto-admin-draw       # Trigger a draw
!lotto-admin-stats      # View global stats
!lotto-admin-reset      # Reset all data
```

---

## Features Included

✅ **Player Commands:**
- View lottery info
- Buy tickets
- Check statistics
- Get help

✅ **Admin Commands:**
- Manual draw trigger
- Global statistics
- Data reset

✅ **Discord Integration:**
- Ticket purchase notifications
- Draw result announcements
- Statistics notifications
- Admin action logs

✅ **In-Game Broadcasting:**
- Colored messages to all players
- Draw announcements
- Purchase broadcasts

✅ **Console Logging:**
- All actions logged
- Error reporting
- Debug information

---

## Prize System

**5-Tier Draw:**
```
1st Place: 5000 emeralds (50%)
2nd Place: 1000 emeralds (25%)
3rd Place:  500 emeralds (15%)
4th Place:  200 emeralds (7%)
5th Place:  100 emeralds (3%)
```

**Ticket Price:** 10 emeralds
**Draw Interval:** Every 1 hour (automatic)

---

## Configuration

Edit the `CONFIG` object in `main.js` to customize:

```javascript
CONFIG.ticketPrice = 10;          // Change ticket price
CONFIG.drawInterval = 3600000;    // Change draw interval (ms)
CONFIG.autoDrawEnabled = true;    // Toggle auto-draw
CONFIG.discordIntegration = true; // Toggle Discord
```

---

## Troubleshooting

**Q: Commands not working?**
A: Make sure you're using the correct prefix (default `!`)

**Q: No Discord messages?**
A: Check Discord bot is configured in BedrockBridge

**Q: Plugin not loading?**
A: Check the import statement is in your index.js file

**Q: Players not seeing messages?**
A: Check player is online and has valid username

---

## Full Documentation

See `BRIDGE_INTEGRATION_GUIDE.md` for:
- Complete command reference
- Discord integration details
- Configuration options
- Testing checklist
- Troubleshooting guide

---

## What's Inside

```
lottery/
├── main.js                          ← Main plugin file
├── INSTALLATION.md                  ← This file
├── BRIDGE_INTEGRATION_GUIDE.md       ← Full documentation
├── QUICK_FIX.md                     ← Quick start
└── 00_QUICK_START_FIX.txt           ← Status overview
```

---

## Support

- **GitHub:** [BedrockBridge](https://github.com/InnateAlpaca/BedrockBridge)
- **Docs:** See `BRIDGE_INTEGRATION_GUIDE.md`
- **Discord:** Check BedrockBridge community

---

**Version:** 2.0.0
**Status:** ✅ Production Ready
**Compatibility:** Bedrock 1.21.120+, BedrockBridge 1.0.3+

Viel Spaß mit der Lotterie! 🎰
