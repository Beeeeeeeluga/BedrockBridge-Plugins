# 🎰 Lottery System - BedrockBridge Plugin

Vollständiges Lotterie-System für Bedrock Edition 1.21.120+ mit BedrockBridge Integration.

## 📋 Features

- ✅ **Ticket-System**: Spieler können Tickets kaufen und an Lotterie-Ziehungen teilnehmen
- ✅ **Automatische Ziehungen**: Regelmäßige, konfigurierbare Lotterie-Ziehungen
- ✅ **Spieler-Statistiken**: Umfassende Tracking von Tickets, Ausgaben und Gewinnen
- ✅ **GUI-Menüs**: Benutzerfreundliche Interfaces für Ticket-Kauf und Verwaltung
- ✅ **Persistenz**: Automatisches Speichern aller Daten
- ✅ **Admin-Tools**: Umfangreiche Verwaltungsbefehle
- ✅ **Discord Integration**: Über BedrockBridge verbunden
- ✅ **Customizable**: Vollständig konfigurierbar

## 🗂️ Plugin-Struktur

```
lottery/
├── main.js           # Haupteinstiegspunkt & Initialisierung
├── core.js           # Kern-Logik & Datenmanagement
├── commands.js       # Alle Spieler & Admin-Befehle
├── gui.js            # GUI-Menüs & Formulare
├── persistence.js    # Speichern & Laden
└── README.md        # Diese Datei
```

## ⚙️ Installation

1. **Verzeichnis erstellen**: Das Plugin befindet sich in `D:\BB\bridgePlugins\lottery\`

2. **Integration**: Das Plugin wird automatisch geladen durch:
   ```javascript
   import "./lottery/main.js" // in index.js
   ```

3. **Server starten**: Normale Bedrock Server Start Prozedur

## 🎮 Spieler-Befehle

### Lotterie-GUI
```
/lotto-gui
```
Öffnet das Hauptmenü mit allen Optionen

### Ticket kaufen
```
/lotto <menge>
```
Kaufe 1-10 Tickets
- Beispiel: `/lotto 5` - Kaufe 5 Tickets

### Statistiken anzeigen
```
/lotto-stats
```
Zeige deine persönlichen Lotterie-Statistiken

### Lotterie-Info
```
/lotto-info
```
Informationen über die aktuelle Lotterie-Runde

### Gewinne abholen
```
/lotto-claim
```
Hole deine Gewinne

### Allgemeine Info
```
/lottery
```
Zeige allgemeine Lotterie-Informationen

### Hilfe
```
/lotto-help
```
Zeige alle verfügbaren Befehle

## 👨‍💼 Admin-Befehle

### Admin-Menü
```
/lotto-admin-gui
```
Öffnet das Admin-Menü mit Verwaltungsfunktionen

### Manuelle Ziehung
```
/lotto-admin-draw
```
Führe eine sofortige Lotterie-Ziehung durch

### Spieler-Statistiken
```
/lotto-admin-stats <Spieler>
```
Zeige Statistiken eines spezifischen Spielers

### Daten zurücksetzen
```
/lotto-admin-reset <Spieler>
```
Setze Lotterie-Daten eines Spielers zurück

### Konfiguration anzeigen
```
/lotto-admin-config
```
Zeige aktuelle Konfigurationseinstellungen

### Weltstatistiken
```
/lotto-world
```
Zeige weltweite Lotterie-Statistiken

### Plugin-Status
```
/lotto-status
```
Zeige aktuellen Plugin-Status und Informationen

## ⚙️ Konfiguration

Ändere die Einstellungen in `core.js`:

```javascript
const CONFIG = {
    enabled: true,                 // Plugin aktiviert/deaktiviert
    ticketPrice: 10,              // Preis pro Ticket (Smaragde)
    maxTicketsPerPlayer: 100,     // Max Tickets pro Spieler
    maxTicketsPerDraw: 10000,     // Max Tickets pro Ziehung
    drawInterval: 3600000,        // Ziehungsintervall (1 Stunde in ms)
    autoDrawEnabled: true,        // Automatische Ziehungen
    prizePool: {
        jackpot: 5000,            // 1. Platz Preis
        secondPlace: 1000,        // 2. Platz Preis
        thirdPlace: 500           // 3. Platz Preis
    },
    debugLogging: true,           // Debug-Ausgaben
    persistenceInterval: 300000,  // Speicher-Intervall (5 Minuten)
    currency: 'emerald'           // Währungs-Item
};
```

### Wichtige Konfigurationswerte

| Einstellung | Standard | Erklärung |
|------------|----------|-----------|
| `ticketPrice` | 10 | Wie viele Smaragde kostet ein Ticket |
| `drawInterval` | 3600000 | Millisekunden zwischen Ziehungen (3600000 = 1 Stunde) |
| `maxTicketsPerPlayer` | 100 | Maximale Tickets pro Spieler |
| `maxTicketsPerDraw` | 10000 | Maximale Tickets in einer Ziehung |
| `autoDrawEnabled` | true | Auto-Ziehung aktiviert |
| `currency` | 'emerald' | Währungs-Itemname |

## 💾 Datenspeicherung

Das Plugin speichert automatisch:

### Spielerdaten
- Gekaufte Tickets
- Ausgegeben Betrag
- Gewinn-Verlauf
- Gewinn-Rate

### Weltdaten
- Aktuelle Ziehung
- Ziehungs-Historie
- Globale Statistiken

**Auto-Save Intervall**: Alle 5 Minuten (konfigurierbar)

## 📊 Datenstruktur

### Spieler-Daten
```javascript
{
    name: "SpielerName",
    tickets: [],           // Array von Tickets
    totalSpent: 1000,     // Gesamt ausgegeben
    totalWins: 5000,      // Gesamt gewonnen
    winHistory: [],       // Array von Gewinnen
    joinedDate: 1234567890
}
```

### Ticket-Daten
```javascript
{
    id: "ticket_1234567890_abc123",
    playerName: "SpielerName",
    purchaseTime: 1234567890,
    drawId: "draw_1",
    claimed: false
}
```

### Ziehungs-Daten
```javascript
{
    id: "draw_1",
    timestamp: 1234567890,
    winnerName: "GlücklicheSpieler",
    winningTicketId: "ticket_...",
    prizeAmount: 5000,
    ticketsSold: 150,
    totalPot: 1500
}
```

## 🎯 Gameplay-Mechanik

1. **Ticket kaufen**: Spieler zahlen Smaragde für Tickets
2. **Pool**: Alle Tickets gehen in den Lotterie-Pool
3. **Ziehung**: Nach konfig. Zeit wird ein Ticket zufällig gezogen
4. **Gewinn**: Der Besitzer gewinnt den Jackpot
5. **Neue Runde**: Neue Ziehung startet sofort

## 🔧 Troubleshooting

### Problem: Befehle funktionieren nicht
**Lösung**:
- Überprüfe, dass das Plugin geladen wurde (Konsole)
- Stelle sicher, dass `index.js` das Plugin importiert
- Server neustarten

### Problem: Daten werden nicht gespeichert
**Lösung**:
- Überprüfe Zugriff auf World-Eigenschaften
- Erhöhe `persistenceInterval` wenn nötig
- Schaue in die Konsole nach Fehlern

### Problem: GUI öffnet sich nicht
**Lösung**:
- `/lotto-help` statt `/lotto-gui` versuchen
- Stelle sicher, dass der Spieler nicht op-Modus benötigt
- Überprüfe auf Fehler in der Konsole

### Problem: Auto-Draw funktioniert nicht
**Lösung**:
- Aktiviere `autoDrawEnabled` in CONFIG
- Überprüfe `drawInterval` (sollte > 0 sein)
- Stelle sicher, dass Tickets im Pool vorhanden sind

## 📈 Best Practices

### Für Server-Admins
1. Setze realistische Preise für deine Wirtschaft
2. Passe Draw-Intervale basierend auf Spieler-Aktivität an
3. Monitoring über `/lotto-status` und `/lotto-world`
4. Regelmäßige Backups der Daten

### Für Spieler
1. Nutze `/lotto-gui` für benutzerfreundliche Verwaltung
2. Überwache deine Stats mit `/lotto-stats`
3. Hole regelmäßig Gewinne mit `/lotto-claim`
4. Lese die Hilfe mit `/lotto-help`

## 🐛 Debug-Modus

Aktiviere ausführliches Logging in `core.js`:

```javascript
debugLogging: true
```

Dies zeigt ausführliche Informationen in der Server-Konsole.

## 📡 BedrockBridge Integration

Das Plugin integriert sich mit BedrockBridge für:
- Discord-Chat-Ereignisse
- Spieler-Join/Leave-Ereignisse
- Zukünftige Discord-Befehle

## 🔐 Sicherheit

- ✅ Alle Transaktionen werden validiert
- ✅ Itemstack-Limits beachtet
- ✅ Spieler-Daten werden isoliert
- ✅ Keine Exploit-Anfälligkeit

## 📝 Lizenz & Credits

**Entwickelt für**: BedrockBridge 1.21.120+
**Version**: 1.0.0
**Status**: Production Ready

## 🤝 Support

Bei Problemen oder Featurewünschen:
1. Überprüfe die Konsole auf Fehler
2. Aktiviere `debugLogging`
3. Überprüfe die Konfiguration
4. Konsultiere diese README

## 🚀 Zukünftige Features (optional)

- [ ] Multi-Tier Lotterie (verschiedene Jackpots)
- [ ] Lotterie-Serien
- [ ] Individuelle Tickets-Designs
- [ ] Statistik-Boards
- [ ] Lotterie-Events
- [ ] Anpassbare Preise

---

**Viel Spaß mit dem Lottery System! 🎰**
