# 🎯 First Run Setup - Dein Plugin läuft!

## ✅ Server Status

```
[2025-11-05 23:57:12:857 INFO] [Webhook] Discord Webhook Plugin v4.0.0 loaded successfully!
[2025-11-05 23:57:12:904 INFO] [Webhook] Plugin initialized successfully!
```

**SUPER! Das Plugin läuft bereits! 🎉**

---

## ⚠️ Was du jetzt tun musst

Der Server zeigt:
```
[2025-11-05 23:57:12:904 ERROR] [Scripting] [Webhook] Invalid webhook URL for serverEvents
[2025-11-05 23:57:12:904 INFO] [Webhook] Validated 0 webhook URLs
```

Das heißt: **Keine Webhook-URLs sind konfiguriert!**

---

## 🔧 SOFORT KONFIGURIEREN (5 Minuten)

### Schritt 1: Discord Webhooks erstellen

1. **Discord Server öffnen**
2. **Channel auswählen** (z.B. #server-logs)
3. **Rechtsklick auf Channel → "Edit Channel"**
4. **Links in der Sidebar: "Webhooks"**
5. **"New Webhook" klicken**
6. **Namen eingeben** (z.B. "Minecraft Server")
7. **"Copy Webhook URL" klicken**
   ```
   https://discord.com/api/webhooks/XXXXXXXXXXXXX/YYYYYYYYYYYYYYYYYYYYYYY
   ```
8. **URL kopieren und speichern**

### Schritt 2: main.js konfigurieren

**Öffne:** `D:\BB\bridgePlugins\webhookbridge\main.js`

**Finde Zeile ~25:**
```javascript
const WHConfig = {
  webhooks: {
    general: "https://discord.com/api/webhooks/YOUR_ID_HERE/YOUR_TOKEN_HERE",
    chat: "https://discord.com/api/webhooks/YOUR_ID_HERE/YOUR_TOKEN_HERE",
    playerEvents: "https://discord.com/api/webhooks/YOUR_ID_HERE/YOUR_TOKEN_HERE",
    // ... etc
```

**Ersetze mit deinen Discord URLs:**
```javascript
const WHConfig = {
  webhooks: {
    general: "https://discord.com/api/webhooks/1234567890/abcdefghijklmnop",
    chat: "https://discord.com/api/webhooks/1234567890/abcdefghijklmnop",
    playerEvents: "https://discord.com/api/webhooks/1234567890/abcdefghijklmnop",
    // ... verwende die gleiche URL für alle (oder verschiedene URLs für verschiedene Channels)
```

### Schritt 3: Server neu starten

```
/reload
```

oder Server neustarten in deinem Hosting-Panel.

### Schritt 4: Testen

```
Im Chat: !webhook test
```

Prüfe dann Discord - es sollte eine Test-Nachricht ankommen! ✅

---

## 🎯 MINIMALE KONFIGURATION (1 URL reicht!)

Wenn du Zeit sparen willst: **Nutze eine URL für alle Webhooks!**

```javascript
const webhookUrl = "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN";

webhooks: {
  general: webhookUrl,
  chat: webhookUrl,
  playerEvents: webhookUrl,
  deaths: webhookUrl,
  serverEvents: webhookUrl,
  // ... alle auf die gleiche URL
}
```

Dann gehen alle Nachrichten in einen Channel. Später kannst du separate URLs hinzufügen!

---

## 🚀 SCHNECKHECK

Nach dem Neustarten solltest du sehen:
```
[Webhook] Validated X webhook URLs
```

Statt:
```
[Webhook] Validated 0 webhook URLs
[Webhook] Invalid webhook URL for serverEvents
```

---

## 🎮 DANACH KANNST DU TESTEN

```
!webhook health     → Status aller Webhooks
!webhook test       → Sende Test-Nachricht
!webhook status     → System-Informationen
!webhook help       → Zeige alle Commands
```

---

## ✨ DAS PLUGIN IST AKTIV!

Es lädt automatisch mit dem Server und verfolgt:
- ✅ Player Join/Leave
- ✅ Chat-Nachrichten
- ✅ Deaths
- ✅ Commands
- ✅ Server Events
- ✅ Und mehr!

---

## 📖 WEITERE ANPASSUNGEN (SPÄTER)

Nach dem ersten Setup kannst du in `main.js` anpassen:

**Zeile ~45:** Features ein/ausschalten
```javascript
chat: { enabled: true }        // Chat-Logging an/aus
players: { joinLeave: true }   // Join/Leave an/aus
```

**Zeile ~135:** Server-Name
```javascript
serverName: "Mein Server"
```

**Zeile ~150+:** Farben & Emojis
```javascript
colors: { success: 0x2ECC71 }
emojis: { join: "📥" }
```

---

## 🎉 DU BIST FAST FERTIG!

1. ✅ Plugin lädt
2. ⏳ Webhook-URLs eintragen (MACH DAS JETZT!)
3. ⏳ Server neu starten
4. ⏳ !webhook test
5. ✅ Discord Test-Nachricht erhalten = FERTIG!

---

## 📞 HILFE

- **Webhook-URL Fehler?** → Discord Webhook nochmal erstellen
- **Plugin lädt nicht?** → Schau logs, suche nach ERROR
- **Messages kommen nicht an?** → !webhook health prüfen
- **Allgemeine Hilfe?** → START_HERE.md oder CONFIG.md lesen

---

**LOS GEHT'S! 🚀 Webhook-URLs eintragen und Server neustarten!**
