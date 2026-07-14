# 🎰 Lottery System - Vollständiger Index

Übersicht über alle Dateien und deren Funktionen.

---

## 📁 Plugin-Struktur

```
D:\BB\bridgePlugins\lottery\
│
├── 🎮 SPIELER & GAMEPLAY
│   ├── core.js              # Haupt-Logik und Datenmanagement
│   ├── commands.js          # Spieler-Befehle und Admin-Befehle
│   └── gui.js               # Interaktive Menüs und Formulare
│
├── 💾 SYSTEM & PERSISTENZ
│   ├── main.js              # Haupteinstiegspunkt und Integration
│   └── persistence.js       # Speichern und Laden
│
└── 📚 DOKUMENTATION
    ├── README.md            # Hauptdokumentation
    ├── SETUP_GUIDE.md       # Installation & Konfiguration
    ├── COMMANDS_REFERENCE.md # Alle Befehle erklärt
    ├── DEPLOYMENT_CHECKLIST.md # Testing & Deployment
    └── INDEX.md             # Diese Datei
```

---

## 📄 Dateidetails

### 🎮 Gameplay-Module

#### `core.js` (12 KB)
**Zweck**: Kern-Logik des Lottery Systems

**Hauptinhalte**:
- `CONFIG` - Vollständige Konfiguration
- `playerTickets` - Spieler-Daten Map
- `worldState` - Globale Welt-Statistiken
- `buyTicket()` - Ticket-Kauflogik
- `performDraw()` - Ziehungs-Logik
- `getPlayerStats()` - Statistik-Berechnung
- Utility-Funktionen (Validierung, Nachrichten, Währung)

**Dependencies**: `@minecraft/server`, `bridge`

**Exports**: 15 Funktionen & 3 Data Maps

---

#### `commands.js` (12 KB)
**Zweck**: Alle Spieler- und Admin-Befehle

**Befehle**:
- **Spieler** (7):
  - `/lotto` - Tickets kaufen
  - `/lottery` - Infoboard
  - `/lotto-stats` - Statistiken
  - `/lotto-info` - Lotterie-Info
  - `/lotto-claim` - Gewinne abholen
  - `/lotto-help` - Hilfe

- **Admin** (7):
  - `/lotto-admin-draw` - Ziehung
  - `/lotto-admin-stats` - Spieler-Stats
  - `/lotto-admin-reset` - Daten zurücksetzen
  - `/lotto-admin-config` - Konfiguration
  - `/lotto-world` - Weltstatistiken
  - (Weitere Admin-Tools)

**Dependencies**: `bridge`, `core.js`, `@minecraft/server`

---

#### `gui.js` (18 KB)
**Zweck**: Graphische Benutzeroberflächen

**GUIs**:
1. **Spieler-Menüs**:
   - Hauptmenü
   - Ticket-Kauf Formular
   - Statistiken-Anzeige
   - Gewinne-Verwaltung

2. **Admin-Menüs**:
   - Admin-Kontrollpanel
   - Ziehungs-Bestätigung
   - Weltstatistiken
   - Spieler-Suche

**Funktionen**:
- `showLotteryMainMenu()` - Hauptmenü
- `showBuyTicketForm()` - Ticket-Formular
- `showAdminMenu()` - Admin-Menü
- Weitere 5+ GUI-Funktionen

**Dependencies**: `@minecraft/server-ui`, `core.js`, `bridge`

---

### 💾 System-Module

#### `main.js` (13 KB)
**Zweck**: Haupteinstiegspunkt und Initialisierung

**Funktionen**:
- Importiert alle Module
- Registriert GUI-Befehle
- Startet Auto-Draw Timer
- Verbindet Bridge-Events
- Zeigt Init-Meldungen

**Exports**:
- Auto-Draw System
- Event-Handler
- Plugin-Status

**Init-Sequence**:
```
1. Imports Module
2. initializePersistence()
3. startAutoDrawTimer()
4. Registriert GUI-Befehle
5. Subscribe zu Bridge-Events
```

---

#### `persistence.js` (11 KB)
**Zweck**: Speichern und Laden von Daten

**Funktionen**:
- `saveAllData()` - Speichere alle Daten
- `loadAllData()` - Lade alle Daten
- `savePlayerData()` - Spielerdaten speichern
- `loadPlayerData()` - Spielerdaten laden
- `exportDataAsJSON()` - Backup-Export
- `importDataFromJSON()` - Daten-Import

**Speicher**:
- World Dynamic Properties
- Auto-Save alle 5 Minuten
- Sichere Serialisierung

---

### 📚 Dokumentation

#### `README.md` (7.5 KB)
**Zielgruppe**: Spieler & Admins

**Inhalte**:
- Feature-Übersicht
- Plugin-Struktur
- Installation
- Alle Spieler-Befehle
- Alle Admin-Befehle
- Konfiguration mit Beispielen
- FAQ & Troubleshooting

**Lese-Zeit**: 5-10 Minuten

---

#### `SETUP_GUIDE.md` (8 KB)
**Zielgruppe**: Server-Admins

**Inhalte**:
- Schnellstart
- Detaillierte Konfiguration
- Szenarien (SMP, großer Server, etc.)
- Monitoring & Wartung
- Performance-Optimierung
- Troubleshooting
- Deployment Checklist

**Lese-Zeit**: 10-15 Minuten

---

#### `COMMANDS_REFERENCE.md` (9.3 KB)
**Zielgruppe**: Spieler & Support-Team

**Inhalte**:
- Alle Befehle mit Details
- Parameter-Erklärungen
- Beispiel-Ausgaben
- Tabellensicht
- Häufige Fehler
- Szenarien

**Lese-Zeit**: 10 Minuten

---

#### `DEPLOYMENT_CHECKLIST.md` (7.8 KB)
**Zielgruppe**: Admins & QA

**Inhalte**:
- Pre-Deployment Checks
- Schritt-für-Schritt Testing
- Funktionalitäts-Überprüfung
- Fehler-Überprüfung
- Performance-Checks
- Go-Live Readiness

**Lese-Zeit**: 15-20 Minuten

---

#### `INDEX.md` (Diese Datei)
**Zielgruppe**: Alle

**Inhalte**:
- Dateien-Übersicht
- Schnelle Navigation
- Größen & Inhalte
- Dependencies
- Lese-Richtlinien

---

## 📊 Statistiken

| Metric | Wert |
|--------|------|
| **Gesamt Dateien** | 9 |
| **Code Dateien** | 5 |
| **Dokumentation** | 4 |
| **Gesamte Größe** | ~136 KB |
| **Code-Zeilen** | ~1500 |
| **Befehle** | 14 |
| **GUI-Screens** | 8+ |

---

## 🗺️ Quick Navigation

### Ich bin ein...

#### 👤 Neuer Spieler
1. Lese: `README.md` → Features & Spieler-Befehle
2. Nutze: `/lotto-help` im Spiel
3. Öffne: `/lotto-gui` zum spielen

#### 🎮 Erfahrener Spieler
1. Überfliegе: `COMMANDS_REFERENCE.md`
2. Nutze: `/lotto-stats` für Übersicht
3. Nutze: `/lotto-claim` für Gewinne

#### 👨‍💼 Server-Admin
1. Lese: `SETUP_GUIDE.md` → Installation & Konfiguration
2. Nutze: `/lotto-status` für Monitoring
3. Folge: `DEPLOYMENT_CHECKLIST.md` für Testing

#### 🔧 Entwickler
1. Überfliegе: `main.js` → Struktur verstehen
2. Studiere: `core.js` → Logik verstehen
3. Verändere: `core.js` → CONFIG anpassen

#### 🐛 Support-Team
1. Überfliegе: `COMMANDS_REFERENCE.md` → Befehle
2. Nutze: `SETUP_GUIDE.md` → Troubleshooting
3. Konsultiere: `README.md` → FAQ

---

## 🔗 Dependencies

### Minecraft APIs
```javascript
import { world, system } from '@minecraft/server'
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
```

### BedrockBridge
```javascript
import { bridge } from '../addons'
```

### Interne Module
```javascript
import { /* core */ } from './core.js'
import { /* persistence */ } from './persistence.js'
import { /* gui */ } from './gui.js'
// commands.js & main.js haben keine Exports
```

---

## 🚀 Einstiegspunkte

### Spieler
```
/lotto-gui        → Menü öffnen
/lotto 5          → Tickets kaufen
/lotto-stats      → Statistiken
```

### Admin
```
/lotto-admin-gui  → Admin-Menü
/lotto-status     → Status prüfen
/lotto-world      → Weltstatistiken
```

### System
```
world.setDynamicProperty()  → Daten speichern
system.runInterval()        → Auto-Draw Loop
bridge.bedrockCommands      → Befehle registrieren
```

---

## 📈 Code-Komplexität

| Datei | LOC | Komplexität | Zweck |
|-------|-----|-------------|-------|
| core.js | ~350 | Mittel | Logik |
| commands.js | ~350 | Mittel | Befehle |
| gui.js | ~500 | Hoch | UI |
| main.js | ~200 | Niedrig | Init |
| persistence.js | ~350 | Mittel | Storage |

---

## ✅ Versioning

```
Lottery System v1.0.0
├── Bedrock Kompatibilität: 1.21.120+
├── BedrockBridge Kompatibilität: Ja
├── Status: Production Ready ✅
└── Last Updated: 2024-11-18
```

---

## 📝 Lizenz & Credits

**Entwickelt für**: BedrockBridge
**Version**: 1.0.0
**Bedrock Edition**: 1.21.120+
**Status**: Production Ready

---

## 🎯 Nächste Schritte

1. **Installation prüfen**
   - [ ] Dateien vorhanden
   - [ ] index.js hat Import
   - [ ] Keine Syntax-Fehler

2. **Server starten**
   - [ ] Plugin lädt
   - [ ] Keine Fehler
   - [ ] [Lottery] Meldungen

3. **Tests durchführen**
   - [ ] Befehle funktionieren
   - [ ] Tickets können gekauft werden
   - [ ] Ziehung funktioniert
   - [ ] Daten werden gespeichert

4. **Go-Live**
   - [ ] Spieler informieren
   - [ ] Support trainieren
   - [ ] Monitoring starten
   - [ ] Monitoring starten

---

## 💬 Support & Hilfe

**In-Game Hilfe**:
```
/lotto-help    # Alle Befehle
/lotto-info    # Lotterie-Info
/lottery       # Infoboard
```

**Dokumentation**:
- `README.md` - Übersicht
- `SETUP_GUIDE.md` - Konfiguration
- `COMMANDS_REFERENCE.md` - Befehle
- `DEPLOYMENT_CHECKLIST.md` - Testing

---

**🎰 Viel Spaß mit dem Lottery System!**
