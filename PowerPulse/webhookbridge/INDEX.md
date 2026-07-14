# Discord Webhook Plugin Enhanced v4.0.0 - Dokumentationsindex

Ein hochoptimiertes, modulares Discord Webhook System für BedrockBridge mit professioneller Architektur.

## 📁 Dateien im webhookbridge Verzeichnis

### Core Plugin-Dateien (ERFORDERLICH)

#### 1. **discord-webhook-enhanced.js** (26.8 KB)
Das Hauptplugin mit allen Event-Handlern und Webhook-Logik.

**Enthält:**
- `WebhookManager` - HTTP-Kommunikation, Circuit Breaker, Rate Limiting
- `EventSystem` - Plugin-basierte Architektur für Custom Handlers
- `PlayerTracker` - Session-, AFK-, und Spam-Tracking
- Event-Handler für Chat, Player, Combat, World, Blocks
- Command-System (!webhook, !whadmin)
- Health-Checks und Monitoring

**Installation:**
1. Kopiere die Datei ins webhookbridge Verzeichnis
2. Füge `import "./webhookbridge/discord-webhook-enhanced.js"` in index.js ein

#### 2. **config-enhanced.js** (14.1 KB)
Zentrale Konfigurationsdatei mit allen Settings und Helfer-Funktionen.

**Enthält:**
- Webhook URLs für verschiedene Event-Typen
- Feature-Toggles für alle Funktionen
- Farben, Emojis, und Nachrichten-Templates
- Permissions und Rollen-System
- Chat-Filter und Event-Filter
- Advanced Settings (Debug, Performance, Rate Limits)

**Konfiguriere:**
1. Webhook URLs von Discord eintragen
2. Server-Name und Icon einstellen
3. Features nach Bedarf aktivieren/deaktivieren
4. Farben und Emojis anpassen

#### 3. **utils-enhanced.js** (14.3 KB)
Umfangreiche Utility-Klassen und Hilfsfunktionen.

**Enthält:**
- `Logger` - Structured Logging mit verschiedenen Levels
- `Cache` - TTL-basiertes Caching System
- `RateLimiter` - Request-Limiting pro User
- `Metrics` - Performance-Metriken und Statistiken
- `DataFormatter` - Formatierung von Daten
- `Validator` - Input-Validierung
- `EventEmitter` - Event-Management System
- `TaskScheduler` - Task-Planung
- `HealthChecker` - Health-Check System

**Nutzer:**
```javascript
import { logger, cache, rateLimiter, metrics } from "./utils-enhanced.js"

logger.info("Message")
cache.set("key", value)
metrics.increment("counter")
```

---

### Dokumentations-Dateien

#### 📖 **README-ENHANCED.md** (11.6 KB)
Hauptdokumentation mit Features, Installation und Übersicht.

**Lese dies zuerst!**

Inhalt:
- Features-Übersicht
- Installation in 4 Schritten
- Konfigurationsoptionen
- Commands und Anwendung
- Plugin-System Erklärung
- Webhook-Payload Beispiele
- Troubleshooting Guide

#### 🚀 **SETUP-GUIDE.md** (9.6 KB)
Schritt-für-Schritt Anleitung für Anfänger.

Inhalt:
- Discord Webhooks erstellen (mit Screenshots)
- Plugin-Installation
- Basis-Konfiguration
- Testing und Validierung
- Häufige Konfigurationen
- Sicherheits-Tipps
- Debugging-Guide
- Checkliste

**Für Anfänger empfohlen!**

#### 🏗️ **BEST-PRACTICES.md** (12.0 KB)
Architektur, Patterns und Best Practices.

Inhalt:
- Architektur-Überblick
- Design Patterns (Circuit Breaker, Event-Driven, etc.)
- Request-Verarbeitungs-Pipeline
- Performance Optimizations
- Error-Handling Strategie
- Security Best Practices
- Testing Strategien
- Code Quality Standards

**Für Entwickler und Fortgeschrittene!**

---

## 🎯 Schnelleinstieg

### Schritt 1: Webhooks erstellen (Discord)
```
Discord Server → #channel → Rechtsklick → Edit Channel
→ Webhooks → New Webhook → URL kopieren
```

### Schritt 2: Plugin installieren
```bash
# Dateien ins webhookbridge Verzeichnis kopieren:
discord-webhook-enhanced.js
config-enhanced.js
utils-enhanced.js
```

### Schritt 3: Konfigurieren
```javascript
// config-enhanced.js
webhooks: {
  general: "https://discord.com/api/webhooks/ID/TOKEN",
  serverEvents: "https://...",
  // ... weitere Webhooks
}

appearance: {
  serverName: "Mein Server"
}
```

### Schritt 4: Laden
```javascript
// index.js
import "./webhookbridge/discord-webhook-enhanced.js"
```

### Schritt 5: Testen
```
Starte den Server neu.
Schreibe im Chat: !webhook test
Prüfe Discord - es sollte eine Test-Nachricht ankommen!
```

---

## 📚 Feature-Dokumentation

### Player Events
- **Join/Leave**: Automatische Benachrichtigungen
- **First Join**: Spezielle Willkommensnachricht
- **AFK Status**: Automatische AFK-Erkennung
- **Location Tracking**: Wo ist der Spieler?

**Aktivieren in config-enhanced.js:**
```javascript
features: {
  players: {
    joinLeave: true,
    firstJoin: true,
    afkDetection: true,
    afkTimeout: 300000  // 5 Minuten
  }
}
```

### Chat & Commands
- **Chat Logging**: Alle Nachrichten zu Discord
- **Anti-Spam**: Automatischer Spam-Schutz
- **Command Logging**: Alle Commands tracken
- **Player Tags**: [Admin], [Mod], etc.

**Aktivieren:**
```javascript
features: {
  chat: {
    enabled: true,
    antiSpam: true,
    showPlayerTags: true
  }
}
```

### Combat & Deaths
- **Death Messages**: Mit Location und Killer Info
- **PvP Kills**: Track PvP Statistiken
- **Boss Kills**: Besondere Benachrichtigungen
- **Item Drops**: Wertvolle Items warnen

**Aktivieren:**
```javascript
features: {
  combat: {
    deathMessages: true,
    pvpKills: true,
    bossKills: true,
    itemDropAlerts: true
  }
}
```

### World Events
- **Boss Kills**: Ender Dragon, Wither, etc.
- **Weather Changes**: Regen, Schnee, etc.
- **Dimension Changes**: Nether, End, etc.
- **Time Changes**: Day/Night Wechsel

### Block Monitoring
- **Valuable Blocks**: Diamond, Netherite, etc.
- **Containers**: Chest, Barrel, etc.
- **Spawners**: Mob Spawner Tracking
- **Custom Watchlist**: Beliebige Blöcke

```javascript
features: {
  blocks: {
    valuable: true,
    watchlist: ["diamond", "netherite", "ancient_debris"]
  }
}
```

### Analytics & Reports
- **Hourly Reports**: Stündliche Statistiken
- **Daily Reports**: Tägliche Zusammenfassungen
- **Player Stats**: Playtime, Kills, Deaths
- **Server Stats**: Uptime, Player Count

---

## 💡 Häufige Use Cases

### Use Case 1: Nur Server-Status
```javascript
features: {
  server: { startStop: true },
  analytics: { enabled: true }
}
// Alles andere: false
```

### Use Case 2: Public Server mit moderarem Logging
```javascript
features: {
  chat: { enabled: true },
  players: { joinLeave: true },
  combat: { deathMessages: true },
  blocks: { valuable: true }
}
```

### Use Case 3: Vollständiges Monitoring
```javascript
// Alle Features: true
// Mit detailliertem Logging
debug: { enabled: true }
```

### Use Case 4: Performance-optimiert
```javascript
// Nur wichtige Events
features: {
  server: { startStop: true },
  players: { joinLeave: true },
  combat: { deathMessages: true }
}

// Batching aktivieren
advanced.performance.messageBatchSize = 20
advanced.performance.messageQueueDelay = 2000
```

---

## 🔧 Wichtige Commands

### Player Commands
```
!webhook health    # Zeige Webhook-Status
!webhook status    # System-Informationen
!webhook test      # Teste alle Webhooks
!webhook help      # Zeige Help-Text
```

### Admin Commands (mit admin Tag)
```
!whadmin test [name]    # Teste spezifischen Webhook
!whadmin status         # Detaillierter Status
!whadmin health         # Health-Check
```

### Console Commands
```javascript
// Global verfügbar als DiscordWebhook
DiscordWebhook.status()              // Status
DiscordWebhook.testWebhook("chat")   // Test
webhookManager.getHealthReport()     // Report
```

---

## 🆘 Troubleshooting

### Problem: Webhooks funktionieren nicht
**Lösung:**
1. URLs validieren: `!webhook test`
2. Discord Server/Channel Berechtigungen prüfen
3. Webhook existent?
4. Rate Limits prüfen: `!webhook health`

### Problem: Messages kommen nicht an
**Lösung:**
1. Test-Mode deaktivieren: `testMode: false`
2. Queue prüfen: `!webhook status`
3. Errors aktivieren: `errors` Webhook konfigurieren
4. Debug-Mode: `debug.enabled: true`

### Problem: Performance-Probleme
**Lösung:**
1. Weniger Features aktivieren
2. Batch-Size erhöhen
3. Message-Delay erhöhen
4. Cache-Cleanup häufiger

---

## 📊 Architektur-Übersicht

```
┌─────────────────────────────────────────┐
│     discord-webhook-enhanced.js         │
├─────────────────────────────────────────┤
│  ├─ WebhookManager                      │
│  │  ├─ validateUrl()                    │
│  │  ├─ checkRateLimit()                 │
│  │  ├─ getCircuitBreakerState()         │
│  │  ├─ recordSuccess/Failure()          │
│  │  └─ getHealthReport()                │
│  │                                       │
│  ├─ EventSystem                         │
│  │  ├─ on(), off(), emit()             │
│  │  └─ registerHandler()                │
│  │                                       │
│  ├─ PlayerTracker                       │
│  │  ├─ trackSession()                   │
│  │  ├─ updateActivity()                 │
│  │  ├─ checkSpam()                      │
│  │  └─ cleanup()                        │
│  │                                       │
│  └─ Event-Handler                       │
│     ├─ handleChatMessage()              │
│     ├─ handlePlayerJoin()               │
│     ├─ handlePlayerDeath()              │
│     └─ ...mehr Handler                  │
│                                          │
├─────────────────────────────────────────┤
│  config-enhanced.js (Konfiguration)     │
├─────────────────────────────────────────┤
│  utils-enhanced.js (Utilities)          │
│  ├─ Logger, Cache, RateLimiter         │
│  ├─ Metrics, Validators                │
│  └─ EventEmitter, TaskScheduler        │
└─────────────────────────────────────────┘
```

---

## 📈 Performance Metriken

Das Plugin verfolgt automatisch:
- ✅ Webhook Success Rate
- ✅ Request Latency
- ✅ Queue Size
- ✅ Active Sessions
- ✅ Circuit Breaker State
- ✅ Cache Hit Rate
- ✅ Error Count

Abrufen mit:
```javascript
DiscordWebhook.status()
webhookManager.getHealthReport()
metrics.getReport()
```

---

## 🔐 Sicherheit

### Wichtige Sicherheits-Features
- ✅ URL-Validierung
- ✅ Input-Sanitization
- ✅ Rate-Limiting
- ✅ Payload-Validierung
- ✅ Error-Masking (keine Secrets in Fehlern)

### Sicherheits-Checkliste
- [ ] Webhook-URLs nicht in Git committen
- [ ] config-enhanced.js in .gitignore
- [ ] Nur HTTPS Webhooks verwenden
- [ ] Admin-Permissions setzen
- [ ] Rate-Limiting aktivieren
- [ ] Chat-Filter aktivieren

---

## 🚀 Next Steps

### Für Anfänger
1. **README-ENHANCED.md** lesen
2. **SETUP-GUIDE.md** folgen
3. Plugin testen: `!webhook test`

### Für Fortgeschrittene
1. **BEST-PRACTICES.md** studieren
2. Custom Handler schreiben
3. Metriken tracken
4. Events abfangen

### Für Entwickler
1. Plugin-System verstehen
2. Utilities nutzen
3. Events erweitern
4. Performance optimieren

---

## 📞 Support Resources

### Selbsthilfe
- `!webhook health` - Status prüfen
- `!webhook status` - System-Info
- `logger.getLogs("error")` - Fehler-Logs
- `DiscordWebhook.testWebhook()` - Test

### Debugging
```javascript
// Console
DiscordWebhook.status()
webhookManager.getHealthReport()
metrics.getReport()

// Konfiguration
advanced.debug.enabled = true
advanced.debug.testMode = true
```

---

## 📝 Version-Information

**Version:** 4.0.0 Enhanced
**Status:** ✅ Production Ready
**Letzte Aktualisierung:** November 6, 2024

### Was ist neu in v4.0.0
- ✨ Vollständige Neuarchitektur
- ✨ Event-System für Plugins
- ✨ Erweiterte Utilities
- ✨ Besseres Error-Handling
- ✨ Umfassende Dokumentation
- ✨ Performance-Optimierungen

---

## 📜 Lizenz

MIT License - Frei nutzbar und änderbar

---

## 🎉 Ready to Go!

Das Enhanced Discord Webhook Plugin ist bereit für den produktiven Einsatz!

**Viel Erfolg beim Einsatz! 🚀**

---

## Quick Links

📖 **Dokumentation**
- [README-ENHANCED.md](README-ENHANCED.md) - Hauptdokumentation
- [SETUP-GUIDE.md](SETUP-GUIDE.md) - Schritt-für-Schritt Anleitung
- [BEST-PRACTICES.md](BEST-PRACTICES.md) - Best Practices & Architektur

💻 **Code**
- [discord-webhook-enhanced.js](discord-webhook-enhanced.js) - Hauptplugin
- [config-enhanced.js](config-enhanced.js) - Konfiguration
- [utils-enhanced.js](utils-enhanced.js) - Utilities

---

**Fragen? Gehe zu README-ENHANCED.md oder SETUP-GUIDE.md! 📚**
