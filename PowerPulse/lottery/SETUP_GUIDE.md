# 🎰 Lottery System - Setup & Deployment Guide

Vollständiges Setup-Handbuch für das BedrockBridge Lottery Plugin.

## 🚀 Schnellstart

### 1. Installation (Automatisch)

Das Plugin ist bereits installiert in:
```
D:\BB\bridgePlugins\lottery\
```

Und importiert in:
```
D:\BB\bridgePlugins\index.js
```

### 2. Server starten

Starte deinen Bedrock Server normalerweise. Das Plugin wird automatisch geladen.

### 3. Testen

Tritt als Admin bei und führe aus:
```
/lotto-status
```

## 📋 Voraussetzungen

- ✅ Bedrock Edition 1.21.120+
- ✅ BedrockBridge installiert und aktiv
- ✅ ScriptAPI aktiviert
- ✅ Bedrock-Bridge Add-on geladen

## 🔧 Konfiguration

### Standard-Einstellungen anpassen

Bearbeite `D:\BB\bridgePlugins\lottery\core.js`:

```javascript
const CONFIG = {
    enabled: true,
    ticketPrice: 10,              // Änderbar
    maxTicketsPerPlayer: 100,     // Änderbar
    maxTicketsPerDraw: 10000,     // Änderbar
    drawInterval: 3600000,        // 1 Stunde in Millisekunden
    autoDrawEnabled: true,        // true = auto, false = manuell
    prizePool: {
        jackpot: 5000,            // 1. Platz
        secondPlace: 1000,        // 2. Platz (optional in Zukunft)
        thirdPlace: 500           // 3. Platz (optional in Zukunft)
    },
    debugLogging: true,           // Debug-Ausgaben
    persistenceInterval: 300000,  // 5 Minuten
    currency: 'emerald'           // Minecraft-Item
};
```

### Szenarien

#### Szenario 1: Kleine SMP (bis 10 Spieler)
```javascript
ticketPrice: 5
drawInterval: 1800000      // 30 Minuten
prizePool: { jackpot: 1000, ... }
maxTicketsPerPlayer: 50
```

#### Szenario 2: Mittlerer Server (10-50 Spieler)
```javascript
ticketPrice: 10
drawInterval: 3600000      // 1 Stunde
prizePool: { jackpot: 5000, ... }
maxTicketsPerPlayer: 100
```

#### Szenario 3: Großer Server (50+ Spieler)
```javascript
ticketPrice: 25
drawInterval: 7200000      // 2 Stunden
prizePool: { jackpot: 20000, ... }
maxTicketsPerPlayer: 200
```

#### Szenario 4: Kreativ / Test
```javascript
ticketPrice: 1
drawInterval: 60000        // 1 Minute
autoDrawEnabled: false     // Manuelle Ziehungen
```

## 📁 Dateistruktur & Erklärung

```
lottery/
│
├── main.js
│   ├── Initialisiert das Plugin
│   ├── Registriert GUI-Commands
│   ├── Startet Auto-Draw Timer
│   └── Verbindet mit Bridge-Events
│
├── core.js
│   ├── CONFIG - Alle Einstellungen
│   ├── Spielerdaten-Management
│   ├── Ticket-Management
│   ├── Ziehungs-Logik
│   └── Utility-Funktionen
│
├── commands.js
│   ├── Spieler-Befehle (lotto, lotto-stats, etc.)
│   ├── Admin-Befehle (lotto-admin-*, lotto-world)
│   └── Help & Info Commands
│
├── gui.js
│   ├── Hauptmenü
│   ├── Ticket-Kauf Formular
│   ├── Statistiken-Menü
│   ├── Gewinne-Menü
│   ├── Admin-Menü
│   └── World-Stats
│
├── persistence.js
│   ├── Speichern (saveAllData)
│   ├── Laden (loadAllData)
│   ├── Export/Import
│   └── Auto-Save Loop
│
└── README.md
    └── Dokumentation
```

## 🎮 Erste Schritte für Spieler

### Als Spieler:

1. **Tritt dem Server bei**
   - Erhältst willkommens Nachricht

2. **Öffne das Lotterie-Menü**
   ```
   /lotto-gui
   ```

3. **Kaufe Tickets**
   - Wähle "Ticket Kaufen"
   - Eingabe Anzahl (1-10)
   - Bestätige Kauf

4. **Überwache deine Stats**
   - `/lotto-stats`
   - Zeigt Tickets, Ausgegeben, Gewonnen

5. **Hole Gewinne**
   - `/lotto-claim` oder via GUI
   - Erhalte deine Gewinne

## 👨‍💼 Erste Schritte für Admins

### Als Admin:

1. **Überprüfe Plugin-Status**
   ```
   /lotto-status
   ```

2. **Zeige Weltstatistiken**
   ```
   /lotto-world
   ```

3. **Öffne Admin-Menü**
   ```
   /lotto-admin-gui
   ```

4. **Führe Test-Ziehung durch**
   ```
   /lotto-admin-draw
   ```

5. **Überprüfe Spieler-Daten**
   ```
   /lotto-admin-stats <Spieler>
   ```

## 🔍 Monitoring & Wartung

### Tägliche Checks

```bash
# Status überprüfen
/lotto-status

# Sollte zeigen:
# - Status: AKTIV
# - Spieler im System: X
# - Aktuelle Tickets: Y
```

### Wöchentliche Checks

```bash
# Weltstatistiken
/lotto-world

# Sollte zeigen:
# - Gesamte Tickets
# - Geld in Umlauf
# - Ziehungs-Historie
```

### Bei Problemen

1. **Konsole überprüfen**
   - [Lottery] Meldungen anschauen
   - Fehler notieren

2. **Debug aktivieren**
   ```javascript
   debugLogging: true  // in core.js
   ```

3. **Plugin neustarten**
   ```
   Server neu starten
   ```

## 💾 Backup & Recovery

### Manuelle Daten-Sicherung

Die Daten werden automatisch in der Welt gespeichert (World Dynamic Properties).

Bei Bedarf manuell exportieren:
```javascript
// Diese Funktion in persistence.js verwenden
exportDataAsJSON()
```

### Recovery bei Datenverlust

Falls Daten verloren gehen:

1. Stop den Server
2. Stelle Backup wieder her
3. Verwende `importDataFromJSON()` in persistence.js
4. Starte Server neu

## 🐛 Troubleshooting

### Problem 1: Plugin lädt nicht

**Symptom**: Befehle funktionieren nicht

**Lösung**:
```
1. Überprüfe console auf [Lottery] Meldungen
2. Stelle sicher index.js das Plugin importiert
3. Überprüfe Syntax-Fehler
4. Server neu starten
```

### Problem 2: Tickets werden nicht verkauft

**Symptom**: Spieler können keine Tickets kaufen

**Lösung**:
```
1. Überprüfe Spieler hat genug Smaragde
2. Überprüfe ticketPrice in CONFIG
3. Überprüfe maxTicketsPerPlayer nicht überschritten
4. Debug-Log anschauen
```

### Problem 3: Ziehungen funktionieren nicht

**Symptom**: Keine automatischen Ziehungen

**Lösung**:
1. Überprüfe `autoDrawEnabled: true`
2. Überprüfe `drawInterval` > 0
3. Überprüfe Tickets im Pool vorhanden
4. Server-Logs auf Fehler überprüfen

### Problem 4: Daten gehen verloren

**Symptom**: Spieler-Daten weg nach Neustart

**Lösung**:
```
1. Überprüfe persistenceInterval Einstellung
2. Stelle sicher World nicht mit Backup überschrieben
3. Aktiviere Debug-Logging
4. Überprüfe Speicherplatz auf Festplatte
```

## 🎯 Performance-Optimierung

### Für große Server (100+ Spieler)

1. **Reduziere Draw-Häufigkeit**
   ```javascript
   drawInterval: 14400000  // 4 Stunden statt 1
   ```

2. **Erhöhe Ticket-Preis**
   ```javascript
   ticketPrice: 50  // Limitiert Transaktionen
   ```

3. **Reduziere Auto-Save**
   ```javascript
   persistenceInterval: 600000  // 10 Minuten statt 5
   ```

4. **Debug ausschalten**
   ```javascript
   debugLogging: false
   ```

## 📊 Statistiken & Reporting

### /lotto-world zeigt:
- Gesamte Tickets verkauft
- Geld in Umlauf
- Ziehungen durchgeführt
- Letzte 5 Gewinner

### /lotto-admin-stats <spieler>:
- Gekaufte Tickets
- Ausgegeben Betrag
- Gewinne gesamt
- Win-Rate Prozent

## 🔐 Sicherheits-Checkliste

- [ ] Currency korrekt eingestellt (emerald)
- [ ] Ticket-Preis angemessen
- [ ] Max-Tickets gesetzt
- [ ] Admin-Befehle sind op-only
- [ ] Regelmäßige Backups
- [ ] Logs regelmäßig überprüfen

## 📝 Logging & Debugging

### Konsolen-Ausgaben

```
[Lottery] ✅ Plugin erfolgreich geladen
[Lottery] Version: 1.0.0
[Lottery] Bedrock: 1.21.120+
[Lottery] Auto-Draw: AKTIV
```

### Bei Fehlern:

```
[Lottery] Fehler beim Ticket-Kauf: <Error Message>
[Lottery] Konnte Nachricht nicht senden an <Player>
[Lottery] Fehler bei Player Join: <Error>
```

## 🚀 Deployment Checklist

- [ ] Konfiguration angepasst
- [ ] Index.js hat Import
- [ ] Server startet ohne Fehler
- [ ] Befehle funktionieren
- [ ] Test-Ziehung erfolgreich
- [ ] Spieler können Tickets kaufen
- [ ] Daten werden gespeichert
- [ ] Admin-Befehle funktionieren
- [ ] GUI öffnet sich
- [ ] Gewinne werden verteilt

## 📞 Support & Hilfe

### Fragen beantworten:
- `/lotto-help` - Zeigt alle Befehle
- `/lotto-info` - Aktuelle Lotterie-Info
- `/lotto-stats` - Persönliche Statistiken

### Für Admins:
- `/lotto-status` - Plugin-Status
- `/lotto-world` - Weltstatistiken
- Konsole überprüfen auf [Lottery] Meldungen

---

**Deployment erfolgreich! Viel Spaß! 🎰**
