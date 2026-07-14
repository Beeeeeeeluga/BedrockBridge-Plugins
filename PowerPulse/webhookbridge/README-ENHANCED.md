# Discord Webhook Plugin - Enhanced v4.0.0

Ein hochoptimiertes, modulares Discord Webhook System für BedrockBridge mit professioneller Architektur, erweiterten Funktionen und Best Practices.

## 🎯 Features

### Core Features
- **✅ Modulare Architektur** - Separierte Concerns für leichte Wartung
- **✅ Erweiterte Error-Handling** - Automatische Retry-Logik mit Exponential Backoff
- **✅ Circuit-Breaker Pattern** - Robuste Kommunikation bei Ausfällen
- **✅ Rate-Limiting Management** - Automatische Ratenlimit-Verwaltung
- **✅ Webhook-Health-Monitoring** - Realzeit Health-Checks und Statistiken
- **✅ Batch-Verarbeitung** - Optimierte Message-Queueing
- **✅ Comprehensive Logging** - Detailliertes Logging mit verschiedenen Levels
- **✅ Plugin-System** - Custom Handler Support für Erweiterungen
- **✅ Performance Optimizationen** - Caching, Event-Pooling, Cleanup

### Event Tracking
- **Player Events**: Join, Leave, First Join, AFK Status
- **Combat Events**: Deaths, PvP Kills, Boss Kills
- **World Events**: Boss Kills, Weather Changes, Dimension Changes
- **Block Events**: Valuable Block Breaks, Container Access
- **Server Events**: Start, Stop, Performance Alerts
- **Chat & Commands**: Message Logging, Command Tracking
- **Analytics**: Playtime, Statistics, Hourly/Daily Reports

### Advanced Features
- **Circuit Breaker** - Automatische Fehlerbehandlung
- **Metrics & Analytics** - Umfassende Statistiken
- **Health Checks** - Webhook-Status Monitoring
- **Event Emitter** - Plugin-basierte Architektur
- **Task Scheduler** - Planbare Tasks
- **Rate Limiter** - Schutz vor Überlastung
- **Cache System** - Intelligentes Caching mit TTL

## 📦 Installation

### 1. File Setup
Kopieren Sie folgende Dateien in `D:\BB\bridgePlugins\webhookbridge\`:

```
discord-webhook-enhanced.js    # Main Plugin
config-enhanced.js              # Configuration
utils-enhanced.js               # Utilities & Helpers
```

### 2. Konfiguration
Bearbeiten Sie `config-enhanced.js`:

```javascript
// Set your Discord webhook URLs
webhooks: {
  general: "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN",
  playerEvents: "https://discord.com/api/webhooks/...",
  // ... weitere Webhooks
}

// Server Information
appearance: {
  serverName: "My Minecraft Server",
  serverIcon: "https://...",
  // ... weitere Einstellungen
}

// Feature Toggles
features: {
  chat: { enabled: true, ... },
  players: { joinLeave: true, ... },
  // ... weitere Features
}
```

### 3. Import in index.js
```javascript
import "./webhookbridge/discord-webhook-enhanced.js"
```

### 4. Server Restart
Starten Sie den Server neu, um das Plugin zu laden.

## 🔧 Konfiguration

### Discord Webhooks
```javascript
webhooks: {
  general: "URL",           // Allgemeine Benachrichtigungen
  serverEvents: "URL",      // Server Start/Stop
  playerEvents: "URL",      // Join/Leave Events
  deaths: "URL",            // Tod-Nachrichten
  chat: "URL",              // Chat-Nachrichten
  errors: "URL",            // Fehler-Benachrichtigungen
  // ... weitere spezifische Webhooks
}
```

### Feature Toggles
```javascript
features: {
  chat: {
    enabled: true,          // Chat-Logging aktivieren
    logToDiscord: true,     // Zu Discord senden
    antiSpam: true,         // Anti-Spam aktivieren
    showPlayerTags: true    // Tags anzeigen (Admin, Mod, etc.)
  },

  players: {
    joinLeave: true,        // Join/Leave Events
    firstJoin: true,        // Spezielle First-Join Nachricht
    afkDetection: true,     // AFK-Erkennung
    afkTimeout: 300000      // 5 Minuten
  },

  combat: {
    deathMessages: true,    // Todnachrichten
    pvpKills: true,         // PvP-Kills
    bossKills: true         // Boss-Kills
  },

  // ... weitere Features
}
```

### Appearance & Colors
```javascript
appearance: {
  serverName: "My Server",

  colors: {
    info: 0x3498DB,      // Blau
    success: 0x2ECC71,   // Grün
    warning: 0xF39C12,   // Orange
    error: 0xE74C3C,     // Rot
    // ... weitere Farben
  },

  emojis: {
    join: "📥",
    leave: "📤",
    death: "💀",
    // ... weitere Emojis
  }
}
```

### Advanced Settings
```javascript
advanced: {
  debug: {
    enabled: false,        // Debug-Modus
    testMode: false        // Test-Modus (keine echten Requests)
  },

  performance: {
    messageQueueSize: 100,      // Maximale Queue-Größe
    messageQueueDelay: 1000,    // Batch-Verarbeitungs-Delay
    messageBatchSize: 10        // Nachrichtenanzahl pro Batch
  },

  rateLimiting: {
    enabled: true,
    maxRequestsPerMinute: 60
  }
}
```

## 📊 Commands

### Player Commands
```
!webhook health    # Zeige Webhook-Status
!webhook status    # Zeige System-Status
!webhook test      # Teste alle Webhooks
!webhook help      # Zeige Hilfe
```

### Admin Commands (mit Admin-Tag)
```
!whadmin test [webhook]    # Test spezifischen Webhook
!whadmin status            # Detaillierter System-Status
!whadmin health            # Health-Check Details
```

## 🏗️ Architektur

### WebhookManager
Verwaltet alle Webhook-Kommunikation:
- URL-Validierung
- Rate Limiting
- Circuit Breaker
- Retry Queue
- Statistiken

```javascript
webhookManager.validateUrl(url)              // URL validieren
webhookManager.getCircuitBreakerState(url)   // Circuit-Breaker Status
webhookManager.getHealthReport()             // Health-Bericht
```

### PlayerTracker
Verfolgt Player-Aktivitäten:
- Session Tracking
- AFK Detection
- Spam Tracking
- Achievements

```javascript
playerTracker.trackSession(playerId, player)
playerTracker.updateActivity(playerId)
playerTracker.checkSpam(playerId)
```

### EventSystem
Plugin-basiertes Event-System:
- Custom Handler Registration
- Event Emission
- Listener Management

```javascript
eventSystem.on("webhook:sent", (data) => {})
eventSystem.emit("webhook:sent", data)
eventSystem.registerHandler("custom", handler)
```

### Utilities Module
- **Logger**: Strukturiertes Logging
- **Cache**: TTL-basiertes Caching
- **RateLimiter**: Anfrage-Limits
- **Metrics**: Performance-Metriken
- **Validators**: Input-Validierung
- **EventEmitter**: Event-Management
- **TaskScheduler**: Task-Planung
- **HealthChecker**: Health-Checks

## 📈 Monitoring & Analytics

### Health Checks
```javascript
// Automatische Health-Checks
webhookManager.getHealthReport()  // Returns:
{
  "https://...": {
    attempts: 42,
    success: 40,
    failed: 2,
    successRate: "95.2%",
    circuitState: "CLOSED",
    rateLimited: false
  }
}
```

### Metrics
```javascript
metrics.increment("messages.sent")
metrics.setGauge("active.connections", 5)
metrics.recordHistogram("response.time", 145)
metrics.getReport()  // Alle Metriken
```

### Logging
```javascript
logger.info("Plugin initialized")
logger.warn("Rate limit approaching")
logger.error("Webhook failed", error)
logger.getLogs("error")  // Alle Fehler
```

## 🔌 Plugin-System

### Custom Handler erstellen
```javascript
eventSystem.on("webhook:sent", async (data) => {
  // Ihre Custom-Logik hier
  console.log("Webhook sent:", data.type);
});

// Oder mit Event Emitter
eventEmitter.on("custom:event", (data) => {
  // Handle custom event
});
```

### Event Listener
```javascript
// Globale Events
eventSystem.on("webhook:sent", (data) => {})
eventSystem.on("player:afk", ({ playerId, player }) => {})
eventSystem.on("player:active", ({ playerId }) => {})

// Player Activity Events
playerTracker.on("player:join", (player) => {})
playerTracker.on("player:leave", (player) => {})
playerTracker.on("player:death", (player) => {})
```

## 🚀 Performance Tips

### 1. Batch-Verarbeitung
```javascript
// Gute Konfiguration
advanced.performance.messageBatchSize: 10
advanced.performance.messageQueueDelay: 1000
```

### 2. Caching
```javascript
cache.set("player_data", data)
const cached = cache.get("player_data")
```

### 3. Rate Limiting
```javascript
if (rateLimiter.isAllowed("user_123")) {
  // Process request
}
```

### 4. Cleanup
```javascript
// Automatisches Cleanup
cache.cleanup()
playerTracker.cleanup(playerId)
```

## 🐛 Debugging

### Debug-Modus aktivieren
```javascript
advanced.debug.enabled: true
advanced.debug.showStackTraces: true
advanced.debug.testMode: false  // true = keine echten Requests
```

### Logs anzeigen
```javascript
// Console
logger.getLogs("error")
logger.getLogs("warn")

// Plugin Info
WebhookPlugin.status()
WebhookPlugin.webhookStats()
```

### Test-Webhook senden
```javascript
// Im Chat: !webhook test
// Oder via Console:
DiscordWebhook.testWebhook("general")
```

## 📋 Webhook Payload Beispiele

### Player Join
```json
{
  "embeds": [{
    "author": {
      "name": "PlayerName joined",
      "icon_url": "https://..."
    },
    "color": 3149679,
    "fields": [
      {
        "name": "Players Online",
        "value": "5",
        "inline": true
      }
    ],
    "timestamp": "2024-01-01T12:00:00.000Z"
  }]
}
```

### Player Death
```json
{
  "embeds": [{
    "author": {
      "name": "💀 PlayerName died",
      "icon_url": "https://..."
    },
    "color": 9868950,
    "fields": [
      {
        "name": "Location",
        "value": "123, 64, 456",
        "inline": true
      }
    ],
    "timestamp": "2024-01-01T12:00:00.000Z"
  }]
}
```

## 🔐 Sicherheit

### Best Practices
1. **Webhook URLs sicher speichern** - Niemals in Git committen
2. **Rate Limiting** - Aktivieren Sie das Limit
3. **Validation** - Alle Inputs validieren
4. **Filtering** - Chat-Filter verwenden
5. **Permissions** - Tags für Zugriffskontrolle

### Environment Variables
```bash
DISCORD_WEBHOOK_GENERAL=https://...
DISCORD_WEBHOOK_ERRORS=https://...
```

## 🆘 Troubleshooting

### Webhooks funktionieren nicht
1. URLs validieren: `!webhook test`
2. Discord Server/Channel Berechtigungen prüfen
3. Webhook existent und gültig?
4. Rate Limits prüfen: `!webhook health`

### Messages nicht ankommen
1. Test-Mode deaktivieren: `testMode: false`
2. Queue-Größe prüfen: `!webhook status`
3. Logs anschauen: `logger.getLogs()`
4. Error Webhook konfigurieren

### Performance Probleme
1. Batch-Size erhöhen
2. Message-Delay anpassen
3. Weniger Features aktivieren
4. Cache-TTL überprüfen

## 📚 API Reference

### sendWebhook(type, data, immediate = false)
Sendet eine Webhook-Nachricht.

```javascript
sendWebhook("chat", {
  content: "Message from player",
  username: "PlayerName",
  avatar_url: "https://..."
})
```

### webhookManager.getHealthReport()
Gibt Health-Report aller Webhooks.

```javascript
const report = webhookManager.getHealthReport()
```

### playerTracker.trackSession(playerId, player)
Verfolgt eine Player-Session.

```javascript
playerTracker.trackSession(player.id, player)
```

### cache.get(key), cache.set(key, value)
Cache-Operationen mit TTL.

```javascript
cache.set("key", value)
const data = cache.get("key")
```

## 🔄 Updates & Changelog

### Version 4.0.0 (Latest)
- ✅ Vollständige Überarbeitung der Architektur
- ✅ Neues Event-System
- ✅ Erweiterte Utilities
- ✅ Besseres Error-Handling
- ✅ Performance Optimizationen
- ✅ Umfassende Dokumentation

### Version 3.0.0
- Basis-Implementation
- Circuit Breaker
- Rate Limiting

## 📞 Support & Kontakt

Für Fragen oder Probleme:
1. Logs überprüfen
2. !webhook health ausführen
3. Debug-Mode aktivieren
4. BedrockBridge Community kontaktieren

## 📄 Lizenz

MIT License - Frei nutzbar und veränderbar.

## 🙏 Credits

**Entwicklung**: BedrockBridge Community
**Inspiration**: Best Practices aus modernen Node.js Frameworks
**Testing**: Community Contributors

---

**Viel Spaß mit dem Enhanced Discord Webhook Plugin! 🚀**
