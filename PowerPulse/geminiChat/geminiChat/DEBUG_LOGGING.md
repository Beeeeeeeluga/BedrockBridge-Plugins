# Gemini AI Chat Plugin - Debug Logging Guide

**Comprehensive Logging System for Complete Transparency**

---

## 📋 Overview

Das Plugin hat ein **professionelles, detailliertes Logging-System**:

✅ **Kategorisiertes Logging** - DEBUG, INFO, WARN, ERROR
✅ **Konsole Output** - Jeder Schritt wird geloggt
✅ **Operation Tracking** - Vollständige Operationsprotokolle
✅ **Performance Metrics** - Zeitmessungen
✅ **Error Context** - Detaillierte Fehlerinformation
✅ **Buffer Storage** - Letzte 1000 Log-Einträge
✅ **Statistics** - Aggregierte Log-Statistiken
✅ **Admin Access** - `/gemini debug` zum Abrufen von Logs

---

## 🎯 Log Levels

### DEBUG (Level 0)
**Frequency**: Very High
**Use**: Development/detailed tracking
**Example**:
```
[DEBUG] [CHAT] Input cleaned successfully. Length: 42
[DEBUG] [API] Sending request to Gemini API
[DEBUG] [CONVERSATION] Retrieved conversation for Steve. Current messages: 5
```

### INFO (Level 1)
**Frequency**: High
**Use**: Normal operations
**Example**:
```
[INFO] [INIT] Plugin initialization complete
[INFO] [API] Successful API response for Steve. Response length: 234
[INFO] [DISCORD] Response sent to Discord from Steve
```

### WARN (Level 2)
**Frequency**: Medium
**Use**: Unusual but recoverable situations
**Example**:
```
[WARN] [CONFIG] API key not configured!
[WARN] [COMMAND] Steve attempted to set API key without permission
[WARN] [DISCORD] Response truncated to 2048 characters for Discord
```

### ERROR (Level 3)
**Frequency**: Low
**Use**: Failures and exceptions
**Example**:
```
[ERROR] [API] API Error from Steve: Rate limited (Status: 429)
[ERROR] [DISCORD] Failed to send response to Discord: Connection timeout
[ERROR] [ERROR] Unexpected error in chat request from Steve: ...
```

---

## 📤 Console Output Examples

### Successful Chat Request Flow

```
[2025-11-20 10:15:30:123 DEBUG] [CHAT] Chat request from Steve: What is Minecraft?...
[2025-11-20 10:15:30:145 DEBUG] [CHAT] Input cleaned successfully. Length: 20
[2025-11-20 10:15:30:167 DEBUG] [CHAT] Typing indicator sent to Steve
[2025-11-20 10:15:30:189 DEBUG] [CONVERSATION] Retrieved conversation for Steve. Current messages: 3
[2025-11-20 10:15:30:201 DEBUG] [CONVERSATION] ADD_MESSAGE | Player: a1b2c3d4 | Messages: 4
[2025-11-20 10:15:30:223 DEBUG] [CONVERSATION] Conversation updated. New message count: 4
[2025-11-20 10:15:30:245 DEBUG] [API] Sending request to Gemini API for Steve
[2025-11-20 10:15:33:456 DEBUG] [PERFORMANCE] API_Response_Steve: 3211ms
[2025-11-20 10:15:33:478 INFO] [API] Successful API response for Steve. Response length: 287
[2025-11-20 10:15:33:500 DEBUG] [CONVERSATION] ADD_RESPONSE | Player: a1b2c3d4 | Messages: 5
[2025-11-20 10:15:33:522 DEBUG] [CHAT] Response formatted and ready to send to Steve
[2025-11-20 10:15:33:544 INFO] [CHAT] Response sent to Steve
[2025-11-20 10:15:33:566 DEBUG] [DISCORD] Sending response to Discord for Steve
[2025-11-20 10:15:33:588 INFO] [DISCORD] Response sent to Discord from Steve
[2025-11-20 10:15:33:610 INFO] [STATS] Successful API call from Steve. Total time: 3211ms
[2025-11-20 10:15:33:632 INFO] [OPERATION] END: chat_request_Steve_1234567890 (success) | Details: {"responseTime": 3211, "textLength": 287}
```

### Error Flow

```
[2025-11-20 10:16:00:123 DEBUG] [CHAT] Chat request from Alex: Some question...
[2025-11-20 10:16:00:145 DEBUG] [CHAT] Input cleaned successfully. Length: 14
[2025-11-20 10:16:00:167 DEBUG] [API] Sending request to Gemini API for Alex
[2025-11-20 10:16:05:200 DEBUG] [PERFORMANCE] API_Response_Alex: 5055ms
[2025-11-20 10:16:05:222 ERROR] [API] API Error from Alex: Rate limited (Status: 429)
[2025-11-20 10:16:05:244 ERROR] [ERROR] Unexpected error in chat request from Alex: Rate limited
[2025-11-20 10:16:05:266 DEBUG] [ERROR_CONTEXT] {"playerName": "Alex", "prompt": "Some question"}
[2025-11-20 10:16:05:288 INFO] [OPERATION] END: chat_request_Alex_1234567899 (failure) | Details: {"error": "Rate limited", "status": 429}
```

### Command Execution

```
[2025-11-20 10:17:00:123 COMMAND] Steve executed: /gemini ui (executed)
[2025-11-20 10:17:00:145 DEBUG] [COMMAND] Player Steve executed: /gemini ui
[2025-11-20 10:17:00:167 DEBUG] [COMMAND] Opening UI menu for Steve

[2025-11-20 10:17:30:123 COMMAND] Admin executed: /gemini setkey *** (executed)
[2025-11-20 10:17:30:145 INFO] [COMMAND] Admin Admin attempting to set API key
[2025-11-20 10:17:30:167 WARN] [CONFIG] Admin changed apiKey: AIzaSy... → AIzaSy...
[2025-11-20 10:17:30:189 INFO] [CONFIG] API key successfully updated by Admin

[2025-11-20 10:17:40:123 COMMAND] Alex executed: /gemini debug (executed)
[2025-11-20 10:17:40:145 WARN] [COMMAND] Alex attempted to view debug info without permission
```

---

## 🔍 Log Categories

### INIT
Plugin-Initialisierung und Startup

```
[INIT] Initializing Gemini AI Chat Plugin v1.0.0
[INIT] Loading configuration...
[INIT] Discord integration initializing...
[INIT] Plugin initialization complete
```

### CONFIG
Konfigurationsänderungen und Validierung

```
[CONFIG] API key is configured and ready
[CONFIG] API key not configured!
[CONFIG] apiKey: AIzaSy... → AIzaSy... by Admin
[CONFIG] All settings reset to defaults successfully
```

### CHAT
Chat-Event-Verarbeitung

```
[CHAT] Chat request from Steve: What is...
[CHAT] Input cleaned successfully
[CHAT] Typing indicator sent to Steve
[CHAT] Response formatted and ready to send to Steve
[CHAT] Response sent to Steve
```

### CONVERSATION
Konversationsverlauf-Verwaltung

```
[CONVERSATION] Retrieved conversation for Steve. Current messages: 5
[CONVERSATION] ADD_MESSAGE | Player: a1b2c3d4 | Messages: 4
[CONVERSATION] ADD_RESPONSE | Player: a1b2c3d4 | Messages: 5
[CONVERSATION] CLEAR | Player: a1b2c3d4 | Messages: 0
```

### API
API-Request und Response-Verarbeitung

```
[API] Sending request to Gemini API for Steve
[API] Successful API response for Steve. Response length: 287
[API] API Error from Steve: Rate limited (Status: 429)
[API] Failed to parse API response: Invalid JSON
```

### DISCORD
Discord-Integration-Events

```
[DISCORD] Formatting embed for player: Steve
[DISCORD] Embed created with 287 characters
[DISCORD] Sending response to Discord for Steve
[DISCORD] Response sent to Discord from Steve
[DISCORD] Received message from Discord: DiscordUser
[DISCORD] Gemini request detected from Discord
[DISCORD] Discord integration enabled and active
```

### COMMAND
Befehlsausführung

```
[COMMAND] Steve executed: /gemini status (executed)
[COMMAND] Player Steve executed: /gemini ui
[COMMAND] Opening UI menu for Steve
[COMMAND] Admin Admin attempting to set API key
[COMMAND] Unknown command from Steve: unknown
```

### PERFORMANCE
Zeitmessungen und Performance-Metriken

```
[PERFORMANCE] API_Response_Steve: 3211ms
[PERFORMANCE] Command_Execution: 150ms
[PERFORMANCE] Discord_Embed_Creation: 45ms
```

### ERROR
Fehler und Exceptions

```
[ERROR] Unexpected error in chat request from Steve: ...
[ERROR] API Error from Steve: Rate limited (Status: 429)
[ERROR] Failed to send response to Discord: Connection timeout
[ERROR_CONTEXT] {"playerName": "Steve", "prompt": "..."}
```

### DEBUG
Detaillierte Debug-Informationen

```
[DEBUG] [CHAT] Input cleaned successfully. Length: 42
[DEBUG] [API] Sending request to Gemini API
[DEBUG] [DISCORD] Format embed for player
[DEBUG] [ERROR] Chat request error details
```

### OPERATION
Operation-Tracking (Start und Ende)

```
[OPERATION] START: chat_request_Steve_123456 (ID: chat_request_Steve_123456)
[OPERATION] END: chat_request_Steve_123456 (success) | Details: {"responseTime": 3211}
[OPERATION] END: chat_request_Steve_123456 (failure) | Details: {"error": "Rate limited"}
```

### STATS
Statistiken und Zusammenfassungen

```
[STATS] Successful API call from Steve. Total time: 3211ms
[STATS] Successful request. Success rate: 98%
```

### LOGGER
Logger-Verwaltung

```
[LOGGER] Debug logger initialized and ready
[LOGGER] Log level set to: DEBUG
[LOGGER] Log buffer cleared
```

---

## 🎯 Admin Debug Command

### Use `/gemini debug` to see:

```
/gemini debug

[Gemini Debug Info]
Active Conversations: 3
Total Logs: 234
Log Levels: DEBUG: 145, INFO: 67, WARN: 18, ERROR: 4
Discord Integration: ✓ Enabled

[Conversations]
a1b2c3d4: 8 msgs, 3.2 KB
x9y8z7w6: 5 msgs, 1.8 KB
... and 1 more
```

### Shows:
- Active conversation count
- Total log entries
- Log distribution by level
- Discord integration status
- Conversation details (player ID, message count, memory)

---

## 📊 Getting Log Statistics

### Via Admin Command:
```
/gemini debug
```

Shows:
- Active conversations
- Total logs
- DEBUG/INFO/WARN/ERROR breakdown
- Discord status

### Programmatically (Advanced):
```javascript
const stats = logger.getLogStats();
// Returns:
// {
//     totalEntries: 234,
//     byLevel: { DEBUG: 145, INFO: 67, WARN: 18, ERROR: 4 },
//     byCategory: { CHAT: 50, API: 45, ... },
//     oldestEntry: "2025-11-20T10:00:00",
//     newestEntry: "2025-11-20T10:15:00"
// }
```

---

## 🔧 Log Configuration

### Set Log Level

Default: DEBUG (shows everything)

```javascript
// Only show INFO and higher (skip DEBUG)
logger.setLogLevel(logger.LOG_LEVELS_ENUM.INFO);

// Only show WARN and higher (skip DEBUG, INFO)
logger.setLogLevel(logger.LOG_LEVELS_ENUM.WARN);

// Only show ERROR
logger.setLogLevel(logger.LOG_LEVELS_ENUM.ERROR);
```

### Clear Log Buffer

```javascript
logger.clearLogs();
```

### Get Recent Logs

```javascript
const recent = logger.getRecentLogs(50); // Last 50 logs
```

### Export Logs as String

```javascript
const chatLogs = logger.exportLogsAsString("CHAT");
```

---

## 🔍 Analyzing Logs

### Find All API Errors

```
Filter: [ERROR] [API]

Results:
[ERROR] [API] API Error from Steve: Rate limited (Status: 429)
[ERROR] [API] API Error from Alex: Network timeout
```

### Find Discord Issues

```
Filter: [DISCORD]

Results:
[DEBUG] [DISCORD] Sending response to Discord
[INFO] [DISCORD] Response sent to Discord
[WARN] [DISCORD] Response truncated to 2048 characters
```

### Find Permission Violations

```
Filter: permission|without permission

Results:
[WARN] [COMMAND] Steve attempted to set API key without permission
[WARN] [COMMAND] Alex attempted to view debug info without permission
```

### Performance Analysis

```
Filter: [PERFORMANCE]

Results:
[PERFORMANCE] API_Response_Steve: 3211ms
[PERFORMANCE] API_Response_Alex: 2156ms
[PERFORMANCE] API_Response_Bob: 4523ms

Average: 3297ms
```

---

## 📈 Performance Logging

### What Gets Logged

```
[PERFORMANCE] API_Response_[PlayerName]: [XXX]ms
```

### Analyzing Performance

```
Fast: < 2000ms
Normal: 2000-4000ms
Slow: > 4000ms (might indicate network issues)
```

### From Console:

```
[PERFORMANCE] API_Response_Steve: 2150ms  ← Normal
[PERFORMANCE] API_Response_Alex: 5234ms   ← Slow
[PERFORMANCE] API_Response_Bob: 1856ms    ← Fast
```

---

## 🐛 Debugging Common Issues

### API Connection Issues

**Log for**:
```
[ERROR] [API]
[DEBUG] [API]
```

**Example**:
```
[DEBUG] [API] Sending request to Gemini API for Steve
[ERROR] [API] API Error from Steve: Network timeout
```

### Discord Integration Issues

**Log for**:
```
[WARN] [DISCORD]
[ERROR] [DISCORD]
[DEBUG] [DISCORD]
```

**Example**:
```
[DEBUG] [DISCORD] Sending response to Discord for Steve
[ERROR] [DISCORD] Failed to send response to Discord: Connection timeout
```

### Permission Issues

**Log for**:
```
[WARN] [COMMAND]
permission|without permission
```

**Example**:
```
[WARN] [COMMAND] Steve attempted to set API key without permission
```

### Configuration Issues

**Log for**:
```
[WARN] [CONFIG]
[ERROR] [CONFIG]
```

**Example**:
```
[WARN] [CONFIG] API key not configured!
[WARN] [CONFIG] API key set attempt by Steve with no key provided
```

---

## 💾 Log Buffer

### Storage

- **Capacity**: Last 1000 log entries
- **Auto-cleanup**: Oldest entries removed when buffer full
- **In-memory**: Fast access, cleared on server restart
- **Searchable**: Filter by category, level, time

### Access

```javascript
// Get all logs
const allLogs = logger.getLogs();

// Get logs for specific category
const chatLogs = logger.getLogs("CHAT");

// Get logs for specific level
const errors = logger.getLogs(null, "ERROR");

// Get recent 50
const recent = logger.getRecentLogs(50);

// Get stats
const stats = logger.getLogStats();
```

---

## 📋 Log Message Format

### Standard Format:
```
[TIMESTAMP] [LEVEL] [CATEGORY] Message
```

### Example:
```
[2025-11-20T10:15:30:123] [INFO] [API] Successful API response for Steve
```

### Components:

- **TIMESTAMP**: ISO format with milliseconds
- **LEVEL**: DEBUG, INFO, WARN, ERROR
- **CATEGORY**: INIT, CONFIG, CHAT, API, DISCORD, etc.
- **Message**: Descriptive message with context

---

## ✅ Checklist für Logging-Setup

- [ ] Plugin lädt und zeigt Startup-Logs
- [ ] Chat-Requests werden geloggt
- [ ] API-Responses werden geloggt
- [ ] Fehler werden mit Kontext geloggt
- [ ] Discord-Events werden geloggt
- [ ] Command-Ausführung wird geloggt
- [ ] `/gemini debug` zeigt Logs
- [ ] Konsole ist voll von Logs (wird durch Log-Level gesteuert)

---

## 🎊 Summary

Das Logging-System bietet:

✅ **Vollständige Abdeckung** - Jeder Schritt wird geloggt
✅ **Kategorisiert** - 10+ Kategorien für einfaches Filtern
✅ **Level-basiert** - DEBUG bis ERROR
✅ **Performance-Tracking** - Zeitmessungen
✅ **Error-Kontext** - Detaillierte Fehlerinformation
✅ **Admin-Zugriff** - `/gemini debug` zum Abrufen
✅ **Storage** - Letzte 1000 Einträge
✅ **Statistiken** - Aggregierte Daten

**Alles ist durchdacht und produktionsreif!** 🚀

---

**Version**: 1.0.0
**Status**: Production Ready ✓
**Last Updated**: 2025-11-20
