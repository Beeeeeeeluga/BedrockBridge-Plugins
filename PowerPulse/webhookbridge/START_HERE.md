# 🎯 Discord Webhook Plugin v4.0.0 - START HERE

## 🚀 Schnelleinstieg (5 Minuten)

### Schritt 1: Webhook-URLs von Discord holen
```
1. Discord Server öffnen
2. Channel auswählen (z.B. #server-logs)
3. Rechtsklick → Edit Channel → Webhooks
4. "New Webhook" → Namen eingeben → URL kopieren
5. Wiederhole für mehrere Channels
```

### Schritt 2: Konfiguration anpassen
```
Öffne: webhookbridge/main.js
Suche: const WHConfig = {
  webhooks: {
    general: "DEINE_DISCORD_WEBHOOK_URL",
    // ... weitere URLs hier eintragen
```

### Schritt 3: Plugin laden
```javascript
// In: D:\BB\bridgePlugins\index.js
import "./webhookbridge/main.js"
```

### Schritt 4: Server neu starten
```
Nach dem Restart:
- Schreibe im Chat: !webhook test
- Prüfe Discord auf Test-Nachricht
```

### Schritt 5: Fertig! 🎉

---

## 📁 Dateien im webhookbridge Ordner

### ✅ DIESE DATEIEN BRAUCHST DU:

| Datei | Größe | Funktion |
|-------|-------|----------|
| **main.js** | 35 KB | Hauptplugin - ALLES DRIN! |
| **index.js.new** | 2 KB | Einstiegsdatei |
| **CONFIG.md** | 10 KB | Konfigurationsanleitung |
| **START_HERE.md** | Diese Datei | Schnelleinstieg |

### 📚 Zusätzliche Dokumentation (optional):

- `README-ENHANCED.md` - Komplette Feature-Referenz
- `SETUP-GUIDE.md` - Ausführliche Installation
- `BEST-PRACTICES.md` - Für Entwickler
- `INDEX.md` - Dokumentations-Index

---

## 🎮 Commands nach Installation

```
!webhook health    → Zeigt Webhook-Status
!webhook status    → System-Informationen
!webhook test      → Testet alle Webhooks
!webhook help      → Hilfe
```

---

## 🔧 Wichtigste Konfigurationen

### Webhook-URLs (ERFORDERLICH)

`main.js` Zeile ~20:
```javascript
webhooks: {
  general: "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN",
  chat: "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN",
  playerEvents: "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN",
  deaths: "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN",
  // ... weitere URLs
}
```

### Server-Name

`main.js` Zeile ~135:
```javascript
appearance: {
  serverName: "DEIN_SERVER_NAME"  // Z.B. "Mein Minecraft Server"
}
```

### Features aktivieren/deaktivieren

`main.js` Zeile ~45:
```javascript
features: {
  chat: { enabled: true },          // Chat-Logging
  players: { joinLeave: true },     // Join/Leave
  combat: { deathMessages: true },  // Deaths
  // ... weitere Features
}
```

---

## ✨ Was kann das Plugin?

### ✅ Player Events
- Join/Leave Nachrichten
- First-Join Welcome
- AFK Detection
- Statistics

### ✅ Combat
- Death-Nachrichten mit Location
- PvP-Kills
- Boss-Kills
- Item-Drops warnen

### ✅ World Events
- Boss Kills
- Weather Changes
- Dimension Changes
- Time Changes

### ✅ Chat & Commands
- Chat-Logging
- Anti-Spam
- Command-Logging
- Player Tags ([Admin], [Mod])

### ✅ Monitoring
- Webhook Health-Checks
- Circuit Breaker
- Automatic Retries
- Rate Limiting
- Error Tracking

### ✅ Blocks
- Valuable Blocks überwachen
- Container Tracking
- Spawner Alerts
- Custom Watchlist

---

## 📊 Architektur

Alles ist in `main.js` enthalten:

```
main.js
├─ WHConfig              ← Konfiguration
├─ WHHelpers            ← Hilfsfunktionen
├─ WebhookManager       ← HTTP/Discord Communication
├─ PlayerTracker        ← Player Sessions & AFK
├─ Event Handlers       ← Chat, Player, Combat, World, Blocks
└─ Command Handlers     ← !webhook commands
```

**Keine Dependencies außer Minecraft Server API!**

---

## 🆘 Häufige Probleme

### Problem: Webhooks funktionieren nicht

**Lösung:**
1. `!webhook test` im Chat ausführen
2. Discord URL validieren (muss mit `https://discord.com` starten)
3. Keine Platzhalter mehr drin (`YOUR_ID_HERE`)?
4. Discord Bot Berechtigungen prüfen

### Problem: Messages kommen nicht an

**Lösung:**
1. `!webhook health` prüfen
2. Error-Webhook konfigurieren
3. Test-Mode deaktivieren: `testMode: false`
4. Debug aktivieren: `enabled: true`

### Problem: Performance

**Lösung:**
1. Weniger Features aktivieren
2. Batch-Size erhöhen: `messageBatchSize: 20`
3. Message-Delay erhöhen: `messageQueueDelay: 2000`

---

## 🔐 Sicherheit

### Webhook-URLs schützen

❌ **FALSCH:**
```javascript
// Niemals in Git committen!
webhooks: {
  general: "https://discord.com/api/webhooks/..."
}
```

✅ **RICHTIG:**
```bash
# In .gitignore eintragen:
webhookbridge/main.js
webhookbridge/config.js
```

### Berechtigungen setzen

```javascript
permissions: {
  tags: {
    admin: "admin",
    moderator: "mod"
  }
}
```

---

## 📈 Performance-Tipps

1. **Message Batching aktivieren**
   ```javascript
   performance: {
     messageBatchSize: 10,
     messageQueueDelay: 1000
   }
   ```

2. **Cache nutzen**
   ```javascript
   cacheTTL: 300000  // 5 Minuten
   ```

3. **Weniger Features**
   - Nur aktivieren, was du brauchst
   - Reduziert Server-Load

---

## 🎨 Anpassungen

### Farben ändern

```javascript
colors: {
  success: 0x2ECC71,    // Grün
  error: 0xE74C3C,      // Rot
  info: 0x3498DB        // Blau
  // Decimal format verwenden!
}
```

### Emojis ändern

```javascript
emojis: {
  join: "📥",        // Oder: ✅, 👋, 🔵, etc.
  death: "💀",       // Oder: ☠️, ⚰️, 🪦, etc.
  achievement: "🏆"  // Oder: ⭐, 👑, 🎖️, etc.
}
```

### Nachrichten anpassen

```javascript
messages: {
  player: {
    join: "{player} hat den Server betreten",  // {player} = Name
    death: "{player} ist gestorben"
  }
}
```

---

## ✅ Installations-Checkliste

- [ ] Discord Webhooks erstellt (mindestens 1)
- [ ] Webhook-URLs in main.js eingetragen
- [ ] index.js aktualisiert (import "./webhookbridge/main.js")
- [ ] Server neu gestartet
- [ ] Console zeigt "[Webhook] Plugin loaded" ✅
- [ ] !webhook test funktioniert
- [ ] Nachricht auf Discord angekommen ✅

---

## 📞 Nächste Schritte

### Anfänger
1. Folge der 5-Minuten-Anleitung oben
2. Teste mit `!webhook test`
3. Lese `CONFIG.md` für weitere Optionen

### Fortgeschritten
1. Lese `README-ENHANCED.md` für alle Features
2. Passe Farben & Emojis an
3. Aktiviere/Deaktiviere Features

### Entwickler
1. Lese `BEST-PRACTICES.md`
2. Verstehe die Architektur
3. Modifiziere nach Bedarf

---

## 🎉 Fertig!

Dein Discord Webhook Plugin ist ready to go! 🚀

**Alle Dateien sind im webhookbridge Ordner enthalten.**
**Keine zusätzlichen Dateien nötig.**
**Einfach main.js laden und konfigurieren!**

---

## 📚 Dokumentation

- **START_HERE.md** ← Du bist hier
- **CONFIG.md** - Detaillierte Konfiguration
- **README-ENHANCED.md** - Feature-Referenz
- **SETUP-GUIDE.md** - Ausführliche Installation
- **BEST-PRACTICES.md** - Für Entwickler

---

**Viel Erfolg! Bei Fragen schau in die passende Dokumentation! 📖**
