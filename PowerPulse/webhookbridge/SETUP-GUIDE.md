# Discord Webhook Plugin - Setup Guide

Schritt-für-Schritt Anleitung zur Installation und Konfiguration des Enhanced Discord Webhook Plugins.

## 🎯 Überblick

Das Enhanced Plugin besteht aus 3 Hauptdateien:
- **discord-webhook-enhanced.js** - Hauptplugin mit Webhooks
- **config-enhanced.js** - Konfiguration und Helpers
- **utils-enhanced.js** - Utilities und Hilfsfunktionen

## 📋 Voraussetzungen

- ✅ BedrockBridge installiert
- ✅ Minecraft Server läuft
- ✅ Discord Server mit Webhook-Berechtigungen
- ✅ Node.js mit ES6 Module Support

## 🚀 Installation - Schritt für Schritt

### Schritt 1: Discord Webhooks erstellen

1. **Öffne Discord Server**
   - Gehe zu deinem Server
   - Wähle einen Channel (z.B. #server-logs)
   - Rechtsklick → Edit Channel

2. **Webhooks konfigurieren**
   - Gehe zu "Webhooks"
   - Klick "New Webhook"
   - Gebe einen Namen ein (z.B. "Minecraft Server")
   - Kopiere die URL

3. **Webhooks für verschiedene Events**
   ```
   #server-logs         → serverEvents, errors
   #player-activity     → playerEvents, deaths
   #chat-logs           → chat, commands
   #moderation          → moderation, teleportLogs
   #analytics           → analytics
   #world-events        → worldEvents, blockLogs
   ```

### Schritt 2: Plugin-Dateien installieren

1. **Wechsel ins webhookbridge Verzeichnis**
   ```bash
   cd D:\BB\bridgePlugins\webhookbridge
   ```

2. **Kopiere diese Dateien dorthin**
   - discord-webhook-enhanced.js
   - config-enhanced.js
   - utils-enhanced.js

3. **Verifiziere die Installation**
   ```bash
   dir  # Sollte alle 3 Dateien zeigen
   ```

### Schritt 3: Webhook-URLs konfigurieren

1. **Öffne config-enhanced.js**

2. **Ersetze die Placeholder-URLs**
   ```javascript
   webhooks: {
     general: "https://discord.com/api/webhooks/1234567890/abcdefg",
     serverEvents: "https://discord.com/api/webhooks/...",
     // ... weitere URLs
   }
   ```

3. **Server-Informationen einstellen**
   ```javascript
   appearance: {
     serverName: "Mein Server",
     serverIcon: "https://link-zu-image.png"
   }
   ```

### Schritt 4: Plugin laden

1. **Öffne index.js**
   ```javascript
   import "./webhookbridge/discord-webhook-enhanced.js"
   ```

2. **Server neu starten**
   ```bash
   # Server neu starten oder /reload ausführen
   ```

3. **Validiere Installation**
   - Prüfe Console auf: "[Webhook] Enhanced Discord Webhook Plugin v4.0.0 loaded"

## ⚙️ Konfiguration

### Minimal-Konfiguration (Schnelleinstieg)

```javascript
// config-enhanced.js

export const WHConfig = {
  webhooks: {
    general: "DEINE_WEBHOOK_URL",
    serverEvents: "DEINE_WEBHOOK_URL",
    playerEvents: "DEINE_WEBHOOK_URL",
    deaths: "DEINE_WEBHOOK_URL",
    errors: "DEINE_WEBHOOK_URL",
    chat: "DEINE_WEBHOOK_URL"
  },

  appearance: {
    serverName: "Mein Server"
  },

  features: {
    chat: { enabled: true },
    players: { joinLeave: true },
    combat: { deathMessages: true }
  }
  // Rest wird mit Defaults gefüllt
};
```

### Erweiterte Konfiguration

#### 1. Chat-System
```javascript
features: {
  chat: {
    enabled: true,
    logToDiscord: true,
    antiSpam: true,            // Anti-Spam aktivieren
    spamThreshold: 5,           // Nachrichten in 10s
    showPlayerTags: true        // [Admin], [Mod], etc.
  }
}
```

#### 2. Player Tracking
```javascript
features: {
  players: {
    joinLeave: true,
    firstJoin: true,            // Spezielle Welcome
    locationTracking: true,
    afkDetection: true,
    afkTimeout: 300000          // 5 Minuten
  }
}
```

#### 3. Block Monitoring
```javascript
features: {
  blocks: {
    valuable: true,
    watchlist: [
      "diamond",
      "netherite",
      "ancient_debris",
      "beacon"
    ]
  }
}
```

#### 4. Analytics
```javascript
features: {
  analytics: {
    enabled: true,
    hourlyReports: true,        // Stündliche Reports
    dailyReports: true          // Tägliche Reports
  }
}
```

#### 5. Performance
```javascript
advanced: {
  performance: {
    messageQueueSize: 100,       // Max Queue-Größe
    messageBatchSize: 10,        // Nachrichten pro Batch
    messageQueueDelay: 1000      // Batch-Verarbeitungs-Delay
  }
}
```

## 🧪 Testing

### Test 1: Basic Funktionalität

1. **Webhook-Test im Chat**
   ```
   !webhook test
   ```
   Sollte eine Test-Nachricht auf Discord senden.

2. **Status prüfen**
   ```
   !webhook health
   ```
   Zeigt Status aller konfigurierten Webhooks.

### Test 2: Player Events

1. **Join-Test**
   - Spieler verbindet sich
   - Prüfe Discord auf Join-Nachricht

2. **Chat-Test**
   - Spieler schreibt in Chat
   - Sollte auf Discord erscheinen

3. **Death-Test**
   - Spieler stirbt
   - Sollte Death-Nachricht auf Discord zeigen

### Test 3: Performance

```javascript
// Im Chat: !webhook status
// Oder in der Console:
WebhookPlugin.status()
```

Sollte zeigen:
- Initialization: true
- Queue Size: < 100
- Sessions: > 0

## 🔧 Häufige Konfigurationen

### Nur wichtige Events loggen

```javascript
features: {
  chat: { enabled: false },        // Chat nicht loggen
  players: { joinLeave: true },    // Nur Join/Leave
  combat: { deathMessages: true }, // Deaths
  blocks: { valuable: false }      // Blocks nicht loggen
}
```

### Maximale Details

```javascript
features: {
  chat: { enabled: true, logToDiscord: true },
  players: {
    joinLeave: true,
    firstJoin: true,
    locationTracking: true,
    afkDetection: true
  },
  combat: {
    deathMessages: true,
    pvpKills: true,
    itemDropAlerts: true
  },
  analytics: {
    enabled: true,
    hourlyReports: true,
    dailyReports: true
  }
}
```

### Minimal Setup (nur Server-Status)

```javascript
features: {
  server: { startStop: true },
  analytics: { enabled: true }
}
```

## 🎨 Farben & Styling

### Embed-Farben anpassen

```javascript
appearance: {
  colors: {
    info: 0x3498DB,       // Blau
    success: 0x2ECC71,    // Grün
    warning: 0xF39C12,    // Orange
    error: 0xE74C3C,      // Rot
    join: 0x2ECC71,       // Join = Grün
    leave: 0xE74C3C,      // Leave = Rot
    death: 0x95A5A6,      // Tod = Grau
    achievement: 0xF1C40F // Achievement = Gelb
  }
}
```

### Emojis einstellen

```javascript
appearance: {
  formatting: {
    emojis: {
      join: "📥",          // Oder "✅", "🔵", etc.
      leave: "📤",         // Oder "❌", "🔴", etc.
      death: "💀",         // Oder "⚰️", "🪦", etc.
      achievement: "🏆"    // Oder "⭐", "👑", etc.
    }
  }
}
```

## 🔐 Sicherheit

### 1. Webhook URLs schützen

**NIEMALS in Git committen!**

```bash
# .gitignore
config-enhanced.js
config.js
webhooks.json
```

### 2. Environment Variables nutzen

```javascript
// Statt hardcoded:
// webhooks.general: "https://discord.com/api/webhooks/..."

// Verwende:
webhooks: {
  general: process.env.DISCORD_WEBHOOK_GENERAL || "https://...",
  serverEvents: process.env.DISCORD_WEBHOOK_EVENTS || "https://..."
}
```

### 3. Berechtigungen konfigurieren

```javascript
permissions: {
  tags: {
    admin: "admin",
    moderator: "mod",
    vip: "vip"
  },

  commands: {
    webhook: ["admin", "mod"],
    whadmin: ["admin"]
  }
}
```

## 📊 Monitoring

### Health Dashboard in Discord

Erstelle einen Kanal für Monitoring:

```javascript
// Automatische Health-Reports
advanced.intervals.healthCheck = 300000  // Alle 5 Minuten

// Im Chat prüfen
!webhook health
```

### Log-Kanal

Richte einen separaten Kanal für Fehler ein:

```javascript
webhooks: {
  errors: "https://discord.com/api/webhooks/..."  // Error Channel
}
```

## 🐛 Debugging

### 1. Debug-Modus aktivieren

```javascript
advanced: {
  debug: {
    enabled: true,
    showStackTraces: true,
    logAllEvents: true
  }
}
```

### 2. Test-Mode verwenden

```javascript
advanced: {
  debug: {
    testMode: true  // Webhooks senden nicht, nur loggen
  }
}
```

### 3. Logs überprüfen

```javascript
// Im Chat:
!webhook status

// Oder Console:
DiscordWebhook.status()
DiscordWebhook.webhookStats()
```

## ✅ Checkliste

- [ ] Discord Webhooks erstellt
- [ ] Webhook-URLs kopiert
- [ ] config-enhanced.js bearbeitet
- [ ] discord-webhook-enhanced.js installiert
- [ ] utils-enhanced.js installiert
- [ ] index.js aktualisiert
- [ ] Server neu gestartet
- [ ] !webhook test ausgeführt
- [ ] Nachrichten auf Discord angekommen
- [ ] Chat-Logging aktiviert und getestet
- [ ] Death-Messages getestet
- [ ] !webhook health zeigt alle grün

## 🎓 Nächste Schritte

### 1. Custom Handler erstellen

```javascript
import { eventSystem } from "./utils-enhanced.js"

eventSystem.on("webhook:sent", async (data) => {
  console.log("Webhook gesendet:", data.type)
})
```

### 2. Events abfangen

```javascript
import { eventEmitter } from "./utils-enhanced.js"

eventEmitter.on("custom:event", (data) => {
  // Custom-Logik
})
```

### 3. Metriken tracken

```javascript
import { metrics } from "./utils-enhanced.js"

metrics.increment("custom.event")
const report = metrics.getReport()
```

## 📞 Support & Hilfe

### Logs prüfen
```javascript
DiscordWebhook.status()
logger.getLogs("error")
```

### Test-Webhook senden
```javascript
DiscordWebhook.testWebhook("general")
```

### Health-Report abrufen
```javascript
webhookManager.getHealthReport()
```

## 🎉 Fertig!

Dein Enhanced Discord Webhook Plugin ist jetzt einsatzbereit! 🚀

Viel Spaß mit allen Features:
- ✅ Player Event Logging
- ✅ Chat Integration
- ✅ Death Messages
- ✅ Analytics & Statistics
- ✅ Health Monitoring
- ✅ Error Tracking

---

**Fragen? Bugs? Feature-Requests?**
Kontaktiere die BedrockBridge Community!
