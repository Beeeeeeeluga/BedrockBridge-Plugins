# webhookbridge Folder Structure - Übersicht

## 📁 Vollständige Struktur

```
D:\BB\bridgePlugins\webhookbridge\
│
├─ ✅ ERFORDERLICHE DATEIEN (Neues System)
│  ├── main.js                    ⭐ HAUPTPLUGIN (35 KB)
│  │                                Alles was du brauchst!
│  │                                • WebhookManager
│  │                                • PlayerTracker
│  │                                • Event Handlers
│  │                                • Commands
│  │                                • Configuration
│  │
│  └── index.js.new              ← Kopiere zu index.js
│                                   Einstiegsdatei
│
├─ 📖 DOKUMENTATION (Lesen!)
│  ├── START_HERE.md              ⭐ BEGINNE HIER! (5 Min)
│  ├── CONFIG.md                  Konfigurationsanleitung
│  ├── README-ENHANCED.md         Feature-Referenz
│  ├── SETUP-GUIDE.md             Ausführliche Installation
│  ├── BEST-PRACTICES.md          Für Entwickler
│  ├── INDEX.md                   Dokumentations-Index
│  └── STRUCTURE.md               Diese Datei
│
├─ 📦 ALT (Optional - können gelöscht werden)
│  ├── config.js                  Alte Konfiguration
│  ├── config-enhanced.js         Superseded by main.js
│  ├── discord-webhook-enhanced.js Superseded by main.js
│  ├── utils-enhanced.js          Utilities (optional)
│  │
│  ├── core/                      Alte Modular-Struktur
│  │  ├── database.js
│  │  ├── events.js
│  │  ├── plugin.js
│  │  └── webhook.js
│  │
│  ├── api/                       Alte API-Struktur
│  │  └── index.js
│  │
│  ├── events/                    Alte Event-Handler
│  │  ├── chat.js
│  │  ├── handler.js
│  │  ├── custom/
│  │  └── player/
│  │
│  └── *.tar.gz                   Archive (können gelöscht werden)
│
└─ 📄 VERSCHIEDENES
   ├── SUMMARY.txt                Zusammenfassung
   └── ...
```

---

## 🎯 Was ist neu?

### ALT (Modular, getrennte Dateien)
```
core/database.js
core/events.js
core/plugin.js
core/webhook.js
api/index.js
events/chat.js
events/handler.js
```

### NEU (Alles in einer Datei)
```
main.js  ← Alles drin!
```

**Vorteil:** Einfacher, schneller, übersichtlicher! 🚀

---

## 🚀 Empfehlung für sauberes Setup

### Option 1: Minimales Setup (Empfohlen)

```
webhookbridge/
├── main.js              ⭐ ERFORDERLICH
├── index.js             ⭐ ERFORDERLICH (kopiert von index.js.new)
├── START_HERE.md        📖 Zu lesen
├── CONFIG.md            📖 Zu lesen
└── README-ENHANCED.md   📖 Für Referenz
```

**Dann können diese gelöscht werden:**
- `core/` Ordner (ganz)
- `api/` Ordner (ganz)
- `events/` Ordner (ganz)
- `config.js` (alt)
- `config-enhanced.js` (superseded)
- `discord-webhook-enhanced.js` (superseded)
- `utils-enhanced.js` (optional, aber deprecated)
- Alle `.tar.gz` Archive

### Option 2: Vollständiges Setup (Mit Dokumentation)

```
webhookbridge/
├── main.js
├── index.js
├── START_HERE.md
├── CONFIG.md
├── README-ENHANCED.md
├── SETUP-GUIDE.md
├── BEST-PRACTICES.md
├── INDEX.md
├── STRUCTURE.md
└── SUMMARY.txt
```

---

## 📋 Migration Guide (Von Alt zu Neu)

### Schritt 1: Alte Struktur verstehen
```
Die alte Struktur war modular verteilt:
- core/  → WebhookManager, Events, Database
- api/   → API-Interface
- events/ → Event-Handler
- config.js → Konfiguration
```

### Schritt 2: Neue Struktur laden
```
main.js enthält alles!
- Alle Classes
- Alle Handler
- Konfiguration
- Hilfsfunktionen
```

### Schritt 3: Migration durchführen

1. **Konfiguration aus config.js kopieren**
   ```
   Falls du custom config hast → in main.js einfügen
   ```

2. **Alte Dateien backup/löschen**
   ```bash
   # Backup
   tar -czf webhookbridge-backup.tar.gz core/ api/ events/

   # Dann löschen
   rm -rf core/ api/ events/
   rm config.js config-enhanced.js discord-webhook-enhanced.js
   ```

3. **index.js.new zu index.js kopieren**
   ```
   cp index.js.new index.js
   ```

4. **Server neu starten**

5. **Testen**
   ```
   !webhook test
   ```

---

## 🔍 Welche Datei macht was?

### main.js - Das Herzstück

```javascript
main.js
├─ WHConfig              (Alle Einstellungen)
├─ WHHelpers            (Hilfsfunktionen)
├─ WebhookManager       (HTTP + Discord)
│  ├─ validateUrl()
│  ├─ checkRateLimit()
│  ├─ circuitBreaker
│  ├─ retryQueue
│  └─ batchProcessing
├─ PlayerTracker        (Session + AFK + Spam)
│  ├─ trackSession()
│  ├─ updateActivity()
│  ├─ checkSpam()
│  └─ cleanup()
├─ Event Handlers
│  ├─ handleChatMessage()
│  ├─ handlePlayerJoin()
│  ├─ handlePlayerLeave()
│  ├─ handlePlayerDeath()
│  ├─ handleBlockBreak()
│  └─ checkAFKPlayers()
├─ Command Handlers
│  ├─ showWebhookHealth()
│  ├─ showStatus()
│  ├─ testWebhooks()
│  └─ showHelp()
└─ Initialization
   └─ initializePlugin()
```

### index.js.new - Einstiegspunkt

```javascript
index.js.new
├─ System-Import
├─ main.js-Import
└─ Plugin-Info Export
```

---

## ⚙️ Konfiguration

### Wo?
**Datei:** `main.js`
**Zeile:** ~20-400

### Was?
- Webhook-URLs
- Feature-Toggles
- Farben & Emojis
- Nachrichten-Templates
- Berechtigungen
- Advanced Settings

### Wie?
Einfach in der Datei die Werte ändern:
```javascript
const WHConfig = {
  webhooks: {
    general: "YOUR_URL_HERE",
    // ...
  },
  features: {
    chat: { enabled: true },
    // ...
  },
  // etc.
}
```

---

## 🎯 Die 3 Dateien die DU änderst

1. **main.js** (Konfiguration)
   - Webhook-URLs
   - Features
   - Farben & Emojis
   - Nachrichten

2. **index.js** (Einstiegspunkt)
   - Import Statement hinzufügen
   - `import "./webhookbridge/main.js"`

3. **Das war's!** 🎉

---

## 🗑️ Was kann weg?

### Vollständig obsolet (können gelöscht werden):

```
core/                           ← Ganz löschen
api/                            ← Ganz löschen
events/                         ← Ganz löschen
config.js                       ← Veraltet
config-enhanced.js              ← Superseded by main.js
discord-webhook-enhanced.js     ← Superseded by main.js
*.tar.gz                        ← Archive (nicht nötig)
```

### Optional (für Dokumentation halten):

```
README-ENHANCED.md              ← Für Referenz
SETUP-GUIDE.md                  ← Für Setup-Hilfe
BEST-PRACTICES.md               ← Für Entwickler
START_HERE.md                   ← Für Anfänger
CONFIG.md                       ← Für Konfiguration
STRUCTURE.md                    ← Diese Datei
INDEX.md                        ← Dokumentations-Index
SUMMARY.txt                     ← Zusammenfassung
```

---

## 📊 Größenvergleich

### ALT (Modular)
```
core/database.js        ~4 KB
core/events.js          ~8 KB
core/plugin.js          ~8 KB
core/webhook.js         ~6 KB
api/index.js            ~9 KB
events/chat.js          ~5 KB
config.js              ~50 KB
                       ───────
Total:                 ~90 KB
```

### NEU (Integrated)
```
main.js                ~35 KB
index.js.new           ~2 KB
                       ───────
Total:                 ~37 KB

EINSPARUNG: ~53 KB (59% kleiner!)
```

---

## 🚀 Setup nach Cleanup

```
webhookbridge/
├── main.js              ← Das Wichtigste
├── index.js             ← Einstiegspunkt
├── START_HERE.md        ← Zu lesen
├── CONFIG.md            ← Zu lesen
└── README-ENHANCED.md   ← Für Referenz
```

**Das ist alles was du brauchst!** 🎉

---

## 🎯 Schritt-für-Schritt Setup

```bash
# 1. Altes Backup machen
tar -czf webhookbridge-backup.tar.gz core/ api/ events/ *.js

# 2. Alte Dateien löschen
rm -rf core/ api/ events/
rm config.js config-enhanced.js discord-webhook-enhanced.js *.tar.gz

# 3. index.js.new zu index.js kopieren
cp index.js.new index.js

# 4. main.js konfigurieren
# Öffne main.js und trage Webhook-URLs ein

# 5. Server neu starten
# Teste mit: !webhook test

# 6. Dokumentation lesen (optional)
# START_HERE.md
# CONFIG.md
```

---

## ✅ Abschließende Checkliste

- [ ] main.js existent und konfiguriert
- [ ] index.js aktualisiert mit main.js-Import
- [ ] Webhook-URLs in main.js eingetragen
- [ ] Alte core/, api/, events/ Ordner gelöscht
- [ ] Alte config.js, discord-webhook-enhanced.js gelöscht
- [ ] Server neu gestartet
- [ ] !webhook test funktioniert
- [ ] Nachricht auf Discord angekommen

**Fertig! Dein Plugin läuft! 🚀**

---

## 📞 Fragen?

- **Anfänger?** → Lese `START_HERE.md`
- **Konfiguration?** → Lese `CONFIG.md`
- **Alle Features?** → Lese `README-ENHANCED.md`
- **Entwickler?** → Lese `BEST-PRACTICES.md`

---

**Das ist die neue, saubere, schnelle Struktur! 🚀**
