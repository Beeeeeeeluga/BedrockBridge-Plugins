# Discord Webhook Plugin - Konfiguration v4.0.0

## 📋 Übersicht

Das Plugin ist vollständig im `webhookbridge` Ordner enthalten und funktioniert selbstständig. Hier ist eine Anleitung zur Konfiguration.

## 🔧 Webhook-URLs konfigurieren

Öffne die Datei `main.js` und suche diese Sektion (ungefähr Zeile 20):

```javascript
const WHConfig = {
  webhooks: {
    general: "https://discord.com/api/webhooks/YOUR_ID_HERE/YOUR_TOKEN_HERE",
    chat: "https://discord.com/api/webhooks/YOUR_ID_HERE/YOUR_TOKEN_HERE",
    playerEvents: "https://discord.com/api/webhooks/YOUR_ID_HERE/YOUR_TOKEN_HERE",
    // ... weitere URLs
  },
```

### Discord Webhook URL erhalten:

1. **Discord Server öffnen**
2. **Channel auswählen** (z.B. #server-logs)
3. **Rechtsklick auf Channel → Edit Channel**
4. **Links: "Webhooks"** auswählen
5. **"New Webhook"** klicken
6. **Namen eingeben** (z.B. "Minecraft Server")
7. **URL kopieren** und in main.js einfügen

### Webhook-Typen (alle URLs sind optional):

```javascript
webhooks: {
  general: "...",           // Allgemeine Benachrichtigungen
  chat: "...",              // Chat-Nachrichten
  playerEvents: "...",      // Join/Leave
  deaths: "...",            // Death-Nachrichten
  achievements: "...",      // Erfolge
  serverEvents: "...",      // Server Start/Stop
  worldEvents: "...",       // Boss, Weather
  blockLogs: "...",         // Block Break/Place
  commands: "...",          // Command Logs
  moderation: "...",        // Moderation Actions
  analytics: "...",         // Statistics
  errors: "...",            // Error Logs
  teleportLogs: "...",      // Teleports
  weatherEvents: "..."      // Weather Changes
}
```

## ⚙️ Features konfigurieren

Suche in `main.js` die `features` Sektion (ungefähr Zeile 45):

### Chat-Einstellungen

```javascript
chat: {
  enabled: true,              // Chat-Logging aktivieren
  logToDiscord: true,         // Zu Discord senden
  showPlayerTags: true,       // [Admin], [Mod] anzeigen
  antiSpam: true,             // Anti-Spam Schutz
  mentionEveryone: false      // @everyone bei Nachrichten
}
```

### Player-Einstellungen

```javascript
players: {
  joinLeave: true,            // Join/Leave Messages
  firstJoin: true,            // Spezielle First-Join Message
  welcomeMessage: true,       // Willkommensnachricht
  locationTracking: true,     // Koordinaten anzeigen
  inventoryTracking: true,    // Inventar tracken
  afkDetection: true,         // AFK-Erkennung
  afkTimeout: 300000          // 5 Minuten AFK-Timeout
}
```

### Combat-Einstellungen

```javascript
combat: {
  deathMessages: true,        // Death-Nachrichten
  pvpKills: true,             // PvP Kills
  itemDropAlerts: true,       // Wertvolle Items warnen
  bossKills: true             // Boss-Kills
}
```

### World-Einstellungen

```javascript
world: {
  bossKills: true,            // Boss Kills
  weatherChanges: true,       // Wetter-Änderungen
  timeChanges: false,         // Day/Night Wechsel
  dimensionChanges: true      // Nether/End Reisen
}
```

### Block-Überwachung

```javascript
blocks: {
  valuable: true,             // Wertvolle Blöcke
  containers: true,           // Chests, Barrels
  spawners: true,             // Mob Spawner
  watchlist: [                // Blöcke zur Überwachung
    "diamond",
    "netherite",
    "ancient_debris",
    "beacon",
    "dragon_egg"
  ]
}
```

### Analytics

```javascript
analytics: {
  enabled: true,              // Analytics aktivieren
  hourlyReports: true,        // Stündliche Reports
  dailyReports: true          // Tägliche Reports
}
```

## 🎨 Farben und Emojis anpassen

Suche die `appearance` Sektion (ungefähr Zeile 140):

### Farben (Decimal Format)

```javascript
colors: {
  info: 0x3498DB,         // Blau
  success: 0x2ECC71,      // Grün
  warning: 0xF39C12,      // Orange
  error: 0xE74C3C,        // Rot
  join: 0x2ECC71,         // Join = Grün
  leave: 0xE74C3C,        // Leave = Rot
  death: 0x95A5A6,        // Tod = Grau
  achievement: 0xF1C40F,  // Achievement = Gelb
  chat: 0x7289DA,         // Chat = Discord Blau
  command: 0x9B59B6,      // Command = Purple
  boss: 0xE91E63          // Boss = Pink
}
```

### Emojis

```javascript
emojis: {
  join: "📥",         // Oder: ✅, 🔵, 👋, etc.
  leave: "📤",        // Oder: ❌, 🔴, 👋, etc.
  death: "💀",        // Oder: ⚰️, 🪦, ☠️, etc.
  achievement: "🏆",  // Oder: ⭐, 👑, 🎖️, etc.
  warning: "⚠️",
  error: "❌",
  info: "ℹ️",
  diamond: "💎",
  netherite: "🔷",
  boss: "🐉",
  teleport: "🌀"
}
```

## 💬 Nachrichten anpassen

Suche die `messages` Sektion (ungefähr Zeile 210):

### Player-Nachrichten

```javascript
messages: {
  player: {
    join: "{player} joined the game",       // {player} = Playername
    leave: "{player} left the game",
    firstJoin: "Welcome {player} to the server!",
    afkStart: "{player} is now AFK",
    afkEnd: "{player} is no longer AFK"
  },
```

### Death-Nachrichten

```javascript
  death: {
    generic: "{player} died",
    fall: "{player} fell from a high place",
    drowning: "{player} drowned",
    lava: "{player} tried to swim in lava",
    fire: "{player} went up in flames",
    suffocation: "{player} suffocated in a wall",
    void: "{player} fell out of the world",
    magic: "{player} was killed by magic",
    wither: "{player} withered away"
  }
```

## 🛠️ Advanced Settings

Suche die `advanced` Sektion (ungefähr Zeile 270):

### Debug-Einstellungen

```javascript
debug: {
  enabled: false,     // Debug-Meldungen anzeigen
  testMode: false     // Test-Mode: Keine echten Webhooks
}
```

### Performance-Einstellungen

```javascript
performance: {
  messageQueueSize: 100,      // Max. Nachrichten in der Queue
  messageQueueDelay: 1000,    // Delay zwischen Batch-Verarbeitung (ms)
  messageBatchSize: 10,       // Nachrichten pro Batch
  cacheSize: 1000,            // Max. Cache-Einträge
  cacheTTL: 300000            // Cache TTL (5 Minuten)
}
```

### Limits

```javascript
limits: {
  spamThreshold: 5,          // Nachrichten in 10 Sekunden
  maxRetries: 3              // Max. Retry-Versuche
}
```

### Intervals (in Millisekunden)

```javascript
intervals: {
  analytics: 3600000,        // 1 Stunde
  cleanup: 300000,           // 5 Minuten
  heartbeat: 60000           // 1 Minute
}
```

## 📊 Schnelle Konfigurationen

### Minimal (Nur Server-Status)

Setze alles auf `false` außer:
```javascript
server: { startStop: true },
analytics: { enabled: true }
```

### Standard (Public Server)

```javascript
chat: { enabled: true },
players: { joinLeave: true },
combat: { deathMessages: true },
blocks: { valuable: true }
```

### Full Monitoring (Private Server)

Lass alles auf `true`

### Performance-optimiert

```javascript
performance: {
  messageQueueSize: 50,
  messageQueueDelay: 2000,
  messageBatchSize: 5,
  cacheSize: 500
}
```

## 🚀 Installation & Aktivierung

1. **Öffne main.js** und trage deine Discord-Webhook-URLs ein
2. **Konfiguriere Features** nach deinem Bedarf
3. **In index.js von bridgePlugins:**
   ```javascript
   import "./webhookbridge/main.js"
   ```
4. **Server neu starten**
5. **Teste mit:** `!webhook test`

## 🎮 Im Spiel Testen

Nach dem Laden kannst du diese Commands nutzen:

```
!webhook health    → Zeigt Webhook-Status
!webhook status    → System-Informationen
!webhook test      → Testet alle Webhooks
!webhook help      → Zeigt Help-Text
```

## 🔐 Sicherheit

**WICHTIG:** Webhook-URLs sind sensibel!

1. **Niemals in Git committen!**
2. **In .gitignore eintragen:**
   ```
   webhookbridge/main.js
   webhookbridge/config.js
   ```
3. **Nur HTTPS verwenden** (alle Discord URLs sind HTTPS)
4. **Admin-Tags verwenden** für Zugriffskontrolle

## 📞 Support

Falls etwas nicht funktioniert:

1. **Teste Webhooks:** `!webhook test`
2. **Prüfe Status:** `!webhook health`
3. **Aktiviere Debug:**
   ```javascript
   advanced: {
     debug: {
       enabled: true,      // Console-Output
       testMode: false     // Keine echten Requests
     }
   }
   ```
4. **Prüfe Console** auf Fehler

## ✅ Checkliste

- [ ] Discord Webhook URLs erstellt
- [ ] Webhook URLs in main.js eingetragen
- [ ] Features konfiguriert
- [ ] Farben und Emojis angepasst (optional)
- [ ] index.js aktualisiert
- [ ] Server neu gestartet
- [ ] !webhook test ausgeführt
- [ ] Nachricht auf Discord angekommen
- [ ] !webhook health zeigt alle grün

---

**Fertig! Dein Webhook Plugin ist einsatzbereit! 🚀**
