# Gemini AI Chat Plugin - Commands Reference

**Schneller Nachschlagebereich für alle Befehle**

---

## 🎯 Chat Commands

### Ask Gemini a Question
```
@g <your question>
```

**Examples:**
```
@g What is Minecraft?
@g How do I craft a diamond pickaxe?
@g Give me building tips for a castle
@g Explain Redstone mechanics
```

**Response:** AI responds within 2-8 seconds with answer

---

## 🎮 Player Commands

### Open Main Menu
```
/gemini ui
```
Opens the interactive menu with:
- Chat Form
- Settings
- Conversation Info
- Help

### Check Status
```
/gemini status
```
Shows:
- API Key configuration status
- Chat prefix
- Current temperature
- Max tokens setting

### Show Help
```
/gemini help
```
Displays quick command reference

### Clear Conversation
```
/gemini clear
```
Deletes entire conversation history for current player

---

## 👨‍💼 Admin Commands

### Set API Key
```
/gemini setkey YOUR_API_KEY_HERE
```
**Required:** OP/Admin
**Note:** Replace with actual Gemini API key from Google AI Studio

### Reset Settings
```
/gemini reset
```
**Required:** OP/Admin
**Effect:** Resets all settings to defaults

### Show Debug Info
```
/gemini debug
```
**Required:** OP/Admin
**Shows:**
- Active conversations
- Message counts
- Memory usage
- Player IDs

---

## 📋 UI Menu Navigation

### Main Menu
```
/gemini ui
```
**Options:**
1. **Chat** - Open chat form
2. **Settings** - Configure plugin
3. **Conversation Info** - View details
4. **Help** - Show help text

### Settings Menu
```
/gemini ui → Settings
```
**Options:**
1. **API Key** - Set/change API key
2. **Temperature** - Adjust (0.0-2.0)
3. **Max Tokens** - Set response length
4. **System Prompt** - Edit base instruction
5. **Reset to Defaults** - Restore defaults
6. **Back** - Return to main menu

### Conversation Info
```
/gemini ui → Conversation Info
```
**Shows:**
- Message count
- Turn count (questions/answers)
- Memory usage
- Last update time
- Player ID

**Options:**
- Clear Conversation
- Back to Menu

---

## 📱 Plugin Management Commands

### Enable Plugin
```
/plugin enable ./bridgePlugins/geminiChat/main
```
**Enables** the Gemini AI Chat Plugin

### Disable Plugin
```
/plugin disable ./bridgePlugins/geminiChat/main
```
**Disables** the Gemini AI Chat Plugin

### Open Plugin Manager
```
/plugin ui
```
Opens plugin manager where you can:
- View all plugins
- Enable/disable plugins
- Add new plugins
- Remove plugins

### Reload Plugins
```
/plugin reload
```
Reloads all enabled plugins (including changes)

---

## 🔧 Configuration via Commands

### Change Chat Prefix
**Default:** `@g`

Via Settings UI:
```
/gemini ui → Settings → (future prefix setting)
```

Or edit config file directly (advanced)

### Adjust Temperature
Via Settings UI:
```
/gemini ui → Settings → Temperature → Slide to desired value
```

**Values:**
- 0.0-0.3 = Factual (consistent)
- 0.4-0.7 = Balanced (default: 0.7)
- 0.8-1.2 = Creative
- 1.3-2.0 = Very Creative

### Change Max Tokens
Via Settings UI:
```
/gemini ui → Settings → Max Tokens → Set value
```

**Range:** 100-2000
**Default:** 500

### Update System Prompt
Via Settings UI:
```
/gemini ui → Settings → System Prompt → Edit text
```

---

## ⚡ Quick Command Combinations

### Full Setup Flow
```
1. /plugin enable ./bridgePlugins/geminiChat/main
2. /gemini setkey YOUR_API_KEY
3. /gemini ui → Settings (customize if needed)
4. @g Ask your first question!
```

### Troubleshooting Flow
```
1. /gemini status (check API key)
2. /gemini debug (if admin, view stats)
3. /gemini clear (clear conversation)
4. Try again: @g question
```

### Admin Maintenance
```
1. /gemini debug (check active conversations)
2. /plugin ui (manage plugin)
3. /gemini reset (if needed)
4. /plugin reload (apply changes)
```

---

## 📊 Command Categories

### Most Used
| Command | Purpose |
|---------|---------|
| `@g` | Ask question |
| `/gemini ui` | Open menu |
| `/gemini clear` | Clear history |
| `/gemini status` | Check status |

### Configuration
| Command | Purpose |
|---------|---------|
| `/gemini setkey` | Set API key (admin) |
| `/gemini reset` | Reset settings (admin) |
| `/gemini ui` → Settings | Change settings |

### Admin
| Command | Purpose |
|---------|---------|
| `/gemini debug` | View statistics |
| `/plugin enable` | Enable plugin |
| `/plugin disable` | Disable plugin |
| `/plugin reload` | Reload plugins |

---

## 🎓 Usage Examples

### First Time Setup
```
Player joins → Admin: /gemini setkey YOUR_KEY
Player: /gemini ui → Chat → Type question → Submit
Gemini responds with answer
```

### Asking Questions
```
Player: @g What is the best farm design?
Gemini: [Gemini] The best farm design depends on what you're farming...
```

### Changing Settings
```
Player: /gemini ui
→ Settings
→ Temperature
→ Slide to 1.0 (more creative)
→ Back
→ Chat with more creative responses
```

### Checking Status
```
Player: /gemini status
→ Shows: API Key: ✓ Configured, Prefix: @g, etc.
```

### Admin Management
```
Admin: /gemini debug
→ Shows: 5 active conversations, 127 total messages, etc.
```

---

## ⚠️ Error Handling

### Common Errors & Fixes

**Error: "API key not configured"**
```
Fix: /gemini setkey YOUR_API_KEY
```

**Error: "Empty response from Gemini"**
```
Fix: Try a different question or check API status
```

**Error: "Rate limited (429)"**
```
Fix: Wait a few minutes before asking again
```

**Error: "Connection timeout"**
```
Fix: Check internet connection or try again later
```

---

## 🔐 Permission Requirements

| Command | Required Permission |
|---------|-------------------|
| `@g` | Any player |
| `/gemini ui` | Any player |
| `/gemini status` | Any player |
| `/gemini help` | Any player |
| `/gemini clear` | Any player |
| `/gemini setkey` | **OP/Admin** |
| `/gemini reset` | **OP/Admin** |
| `/gemini debug` | **OP/Admin** |
| `/plugin *` | **OP/Admin** |

---

## 📖 Command Syntax Guide

### Command Format
```
/gemini [action] [parameters]
```

### Examples
```
/gemini ui                    # Action: ui, Parameters: none
/gemini setkey YOUR_KEY       # Action: setkey, Parameters: YOUR_KEY
@g Your question here         # Prefix action with question
```

### Variations
```
/gemini                       # Shows help (if no action)
/gemini help                  # Shows help text
/gemini status                # Shows status
/gemini clear                 # Clears conversation
```

---

## 🎯 For Different Users

### For New Players
**Essential Commands:**
```
@g question                   # Ask question
/gemini ui                    # Open menu
/gemini help                  # Get help
```

### For Regular Players
**Common Commands:**
```
@g question                   # Ask Gemini
/gemini ui                    # Manage settings
/gemini clear                 # Clear history
/gemini status                # Check status
```

### For Server Admins
**Management Commands:**
```
/gemini setkey KEY           # Set API key
/gemini debug                # View stats
/plugin ui                   # Manage plugin
/plugin reload               # Reload
```

---

## 📞 Getting Help

### In-Game Help
```
/gemini help                 # Quick command list
/gemini ui → Help            # Detailed help menu
```

### Documentation
- **README.md** - Full documentation
- **QUICKSTART.md** - 5-minute guide
- **config.example.js** - Configuration examples

---

## 🔗 Related Documentation

- **README.md** - Complete guide
- **QUICKSTART.md** - Fast setup
- **config.example.js** - Configuration presets
- **INSTALLATION_CHECKLIST.md** - Setup verification

---

**Last Updated:** 2024
**Plugin Version:** 1.0.0
**Status:** Production Ready ✓

---

*For more information, see the full README.md or QUICKSTART.md*
