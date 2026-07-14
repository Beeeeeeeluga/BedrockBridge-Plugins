# ClearLag++ Installationen & Setup-Anleitung

Eine vollständige Schritt-für-Schritt Anleitung zum Installieren und Konfigurieren von ClearLag++ für Ihren Minecraft Bedrock Server.

## 📋 Voraussetzungen

- Minecraft Bedrock Server (1.20+)
- Bedrock-Bridge Installation
- Script API Modul aktiviert
- Node.js (für Development/Testing)

## 🚀 Installation

### Schritt 1: Plugin-Dateien kopieren

1. Navigiere zu deinem Bedrock-Bridge Verzeichnis:
   ```
   D:\BB\bridgePlugins\
   ```

2. Das Plugin sollte bereits vorhanden sein:
   ```
   D:\BB\bridgePlugins\ClearLag++\
   ├── manifest.json
   ├── README.md
   ├── INSTALLATION.md
   └── src/
       ├── main.js
       ├── config.js
       ├── entityManager.js
       ├── performanceMonitor.js
       ├── commandHandler.js
       ├── logger.js
       ├── discordIntegration.js
       └── uiDashboard.js
   ```

### Schritt 2: Plugin-Manifest aktualisieren

Die `manifest.json` sollte korrekt konfiguriert sein:

```json
{
  "format_version": 2,
  "header": {
    "description": "ClearLag++ - Advanced Lag Elimination & Server Performance Plugin",
    "name": "ClearLag++",
    "uuid": "clearlag-plus-plus-001",
    "version": [1, 0, 0],
    "min_engine_version": [1, 19, 0]
  },
  "modules": [
    {
      "description": "Main ClearLag++ Module",
      "type": "script",
      "uuid": "clearlag-main-module",
      "version": [1, 0, 0],
      "entry": "src/main.js",
      "language": "javascript"
    }
  ]
}
```

### Schritt 3: Bedrock-Bridge Konfigurieren

1. Öffne deine Bedrock-Bridge `config.js` oder das Plugin-Loading-System
2. Stelle sicher, dass ClearLag++ geladen wird:

```javascript
// In pluginManager.js oder ähnlich
const plugins = [
  // ... andere Plugins
  {
    name: "ClearLag++",
    enabled: true,
    path: "./bridgePlugins/ClearLag++"
  }
];
```

### Schritt 4: Konfiguration anpassen

Bearbeite `src/config.js` nach deinen Anforderungen:

#### Auto-Cleanup einstellen

```javascript
autoCleanup: {
  enabled: true,              // An/Aus
  items: {
    enabled: true,
    delayTicks: 6000,          // 5 Minuten (in Ticks)
    showCountdown: true,       // Countdown anzeigen
    countdownStartAt: 3000     // Ab 2.5 Min Countdown zeigen
  }
}
```

**Tick-Konversionen:**
- 1 Minute = 1.200 Ticks
- 5 Minuten = 6.000 Ticks
- 10 Minuten = 12.000 Ticks

#### Performance-Schwellenwerte

```javascript
monitoring: {
  tps: {
    enabled: true,
    warnThreshold: 10,         // Warnung bei < 10 TPS
    criticalThreshold: 5       // Kritisch bei < 5 TPS
  },
  mspt: {
    enabled: true,
    warnThreshold: 40,         // Warnung bei > 40ms/Tick
    criticalThreshold: 50      // Kritisch bei > 50ms/Tick
  }
}
```

#### Discord-Integration

```javascript
discord: {
  enabled: true,              // An/Aus
  webhooks: {
    cleanupNotification: { enabled: true },
    performanceAlert: { enabled: true },
    commandLog: { enabled: true }
  }
}
```

**Für Webhooks:**
- Stelle sicher, dass webhookAddon konfiguriert ist
- Oder verwende BridgeDirect für Discord-Integration

#### Logging

```javascript
logging: {
  enabled: true,
  console: {
    enabled: true,
    logLevel: "info",          // "debug", "info", "warn", "error"
    logCleanups: true,
    logErrors: true,
    logCommands: true
  }
}
```

### Schritt 5: Server neu starten

1. Stoppe deinen Server
2. Starte ihn neu
3. Die Konsole sollte zeigen:
   ```
   [ClearLag++] Main-Modul geladen!
   [ClearLag++] Entity Manager wird initialisiert...
   [ClearLag++] Performance Monitor wird initialisiert...
   [ClearLag++] Logger wird initialisiert...
   [ClearLag++] ClearLag++ erfolgreich initialisiert!
   ```

## ✅ Verifikation

Nach der Installation:

1. **Spieler-Command Test**:
   ```
   /clearlag help
   ```
   → Sollte Hilfe-Text anzeigen

2. **Status-Check**:
   ```
   /clearlag status
   ```
   → Sollte aktuelle Server-Metriken zeigen

3. **Dashboard-Test**:
   - Als Op/Admin spielen
   - Die UI sollte verfügbar sein (abhängig von Bridge-Integration)

## 🔧 Erweiterte Konfiguration

### Entity-Limits pro Chunk

```javascript
mobManagement: {
  chunkLimiter: {
    enabled: true,
    maxPerChunk: 30,           // Max Entities pro Chunk
    maxPassivePerChunk: 15,    // Max Passive Mobs
    maxHostilePerChunk: 20     // Max Feindselige Mobs
  }
}
```

### Redstone-Optimierung feintunen

```javascript
redstoneOptimization: {
  enabled: true,
  updateRate: {
    enabled: true,
    maxUpdatesPerSecond: 100,  // Block-Updates/Sekunde
    maxUpdatesPerChunk: 50     // Block-Updates/Chunk
  }
}
```

### Broadcasts konfigurieren

```javascript
broadcasts: {
  enabled: true,
  cleanupMessage: {
    enabled: true,
    format: "§e{prefix} §7Cleanup: §a{itemsRemoved}§7 Items, §a{entitiesRemoved}§7 Entities"
  },
  performanceWarning: {
    enabled: true,
    format: "§c{prefix} §7Lag! TPS: §c{tps}§7, MSPT: §c{mspt}ms"
  }
}
```

## 🎮 Erste Schritte als Admin

### 1. Admin-Tag setzen

```
/tag @s add clearlag:admin
```

### 2. Plugin-Status überprüfen

```
/clearlag status
```

### 3. Erste Cleanup durchführen

```
/clearlag cleanup
```

### 4. Statistiken anschauen

```
/clearlag stats
```

### 5. Broadcast-Nachrichten toggle

```
/clearlag broadcast cleanup
/clearlag broadcast performance
/clearlag broadcast events
```

## 🔗 Discord-Integration Setup

### Option 1: BridgeDirect

```javascript
// In main.js wird automatisch versucht:
if (typeof bridgeDirect !== "undefined") {
  // Nutzt BridgeDirect für Discord-Nachrichten
}
```

### Option 2: Webhooks

Stelle sicher, dass in deiner Bridge-Config verfügbar ist:
```javascript
const webhookAddon = require("./webhookAddon");
```

### Test-Nachricht senden

In der Konsole/Script:
```javascript
discordIntegration.sendTestMessage();
```

## 📊 Performance-Tuning

### Für low-end Server

Reduziere Monitoring-Frequency:
```javascript
monitoring: {
  tps: {
    updateIntervalTicks: 40    // Statt 20 (nur alle 2 Sekunden)
  }
}
```

Reduziere Cleanup-Häufigkeit:
```javascript
autoCleanup: {
  items: {
    delayTicks: 12000          // 10 Min statt 5 Min
  }
}
```

### Für high-end server

Erhöhe Detailgenauigkeit:
```javascript
monitoring: {
  tps: {
    updateIntervalTicks: 10    // Jede 0.5 Sekunden
  }
}
```

Aggressivere Cleanup:
```javascript
autoCleanup: {
  items: {
    delayTicks: 3000           // 2.5 Min statt 5 Min
  }
}
```

## 🐛 Debugging

### Debug-Mode aktivieren

```javascript
plugin: {
  debugMode: true,            // In config.js
  enabled: true
}
```

Log-Level ändern:
```javascript
logging: {
  console: {
    logLevel: "debug"          // Zeige alle Debug-Messages
  }
}
```

### Logs überprüfen

In-Game:
```
/clearlag logs
```

## 🚨 Häufige Probleme

### Problem: Plugin lädt nicht
**Lösung:**
1. Überprüfe die manifest.json auf Syntax-Fehler
2. Stelle sicher, dass alle src-Dateien vorhanden sind
3. Prüfe die Server-Console auf Fehler

### Problem: Commands funktionieren nicht
**Lösung:**
1. Überprüfe, dass du Admin-Tag hast: `/tag @s add clearlag:admin`
2. Verwende `/clearlag help` für Syntax
3. Prüfe die Logs

### Problem: Performance-Monitoring zeigt Null
**Lösung:**
1. Warten Sie 20-30 Sekunden
2. Überprüfen Sie, dass mindestens 1 Entity/Item im Überworld existiert
3. Aktivieren Sie Monitoring in config.js

### Problem: Discord-Nachrichten kommen nicht an
**Lösung:**
1. Überprüfen Sie Discord-Integration: `enabled: true`
2. Teste mit: `discordIntegration.sendTestMessage()`
3. Prüfe Server-Webhooks/BridgeDirect-Konfiguration
4. Überprüfe Logs auf Fehler

## 📈 Monitoring & Wartung

### Tägliche Checks

```
/clearlag status      → Server-Performance
/clearlag stats       → Cleanup-Aktivität
```

### Wöchentliche Wartung

- Logs überprüfen: `/clearlag logs`
- Konfiguration reviewen
- Discord-Alerts prüfen

### Monatliche Analysen

- Performance-Trends anschauen
- Cleanup-Statistiken analysieren
- Redstone-Optimierung prüfen

## 📚 Zusätzliche Ressourcen

- **README.md**: Umfassende Feature-Dokumentation
- **config.js**: Ausführliche Konfigurationsoptionen
- **main.js**: Plugin-Quellcode und Struktur

## 🆘 Support & Kontakt

Bei Problemen:
1. Lesen Sie diese Dokumentation durch
2. Überprüfen Sie die Logs (`/clearlag help`)
3. Aktivieren Sie Debug-Mode
4. Überprüfen Sie die Konfiguration

---

**Installation erfolgreich abgeschlossen!** 🎉

Dein ClearLag++ Plugin ist nun voll konfiguriert und betriebsbereit.
