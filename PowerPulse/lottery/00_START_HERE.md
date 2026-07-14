# 🎰 Lottery System - START HERE

**Willkommen zum BedrockBridge Lottery Plugin!**

Dies ist deine Einstiegshilfe für alle wichtigen Informationen.

---

## 🚀 Schnellstart (5 Minuten)

### 1. Installation bestätigen
```
✅ D:\BB\bridgePlugins\lottery\ existiert
✅ index.js hat: import "./lottery/main.js"
✅ Alle Dateien vorhanden
```

### 2. Server starten
Dein Bedrock Server wird das Plugin automatisch laden.

**In der Konsole sollte erscheinen:**
```
[Lottery] 🎰 Initialisiere Lottery Plugin...
[Lottery] ✅ Plugin erfolgreich geladen
[Lottery] Auto-Draw: AKTIV
```

### 3. Im Spiel testen
```
/lotto-status     # ← Teste das zuerst!
/lotto-gui        # ← Spieler-Menü
/lotto-admin-gui  # ← Admin-Menü (nur Admins)
```

---

## 📚 Dokumentation - Welche Datei für mich?

### 👤 Ich bin ein Spieler
👉 **Lese:** `README.md` (Spieler-Befehle Sektion)
- Wie kaufe ich Tickets? (`/lotto`)
- Wo finde ich Statistiken? (`/lotto-stats`)
- Wie hole ich Gewinne? (`/lotto-claim`)

### 🎮 Ich bin ein Zocker
👉 **Lese:** `COMMANDS_REFERENCE.md`
- Alle Befehle mit Beispielen
- Schnelle Referenztabelle
- Häufige Fehler & Lösungen

### 👨‍💼 Ich bin Server-Admin
👉 **Lese:** `SETUP_GUIDE.md`
- Installation & Konfiguration
- Monitoring & Wartung
- Troubleshooting

### 🔧 Ich bin ein Entwickler
👉 **Lese:** `INDEX.md`
- Dateistruktur verstehen
- Dependencies überprüfen
- Code-Komplexität

### 🐛 Ich bin im Support
👉 **Lese:** `DEPLOYMENT_CHECKLIST.md` + `README.md` FAQ
- Testing & Deployment
- Common Issues
- Hilfe für Spieler

---

## 🎯 Die 3 wichtigsten Befehle

### Für Spieler:
```
/lotto-gui        → Alles machen (Tickets, Statistiken, Gewinne)
/lotto 5          → 5 Tickets kaufen
/lotto-claim      → Gewinne abholen
```

### Für Admins:
```
/lotto-status     → Plugin-Status prüfen (MACHEN!)
/lotto-world      → Statistiken anschauen
/lotto-admin-gui  → Admin-Menü
```

---

## 📋 Was ist in der Box?

### 🎮 Code (5 Dateien)
1. **main.js** - Hauptprogramm & Initialisierung
2. **core.js** - Logik, Datenmanagement, Konfiguration
3. **commands.js** - 14 Befehle (Spieler & Admin)
4. **gui.js** - Menüs & Formulare (8+ Screens)
5. **persistence.js** - Speichern & Laden

### 📚 Dokumentation (5 Dateien)
1. **README.md** - Übersicht für Alle
2. **SETUP_GUIDE.md** - Für Admins
3. **COMMANDS_REFERENCE.md** - Für Spieler & Support
4. **DEPLOYMENT_CHECKLIST.md** - Für QA & Testing
5. **INDEX.md** - Für Entwickler

### 📄 Hilfe (2 Dateien)
1. **00_START_HERE.md** - Diese Datei!
2. **PROJECT_SUMMARY.txt** - Projekt-Übersicht

---

## ⚙️ Basiskonfiguration

Alle Einstellungen in `core.js`:

```javascript
const CONFIG = {
    ticketPrice: 10,              // Preis pro Ticket
    drawInterval: 3600000,        // 1 Stunde
    autoDrawEnabled: true,        // Auto-Ziehung
    prizePool: {
        jackpot: 5000             // Preis für Gewinner
    }
};
```

**Ändern & Server neustarten = Fertig!**

---

## 🔍 Troubleshooting Quick-Check

### Problem: Plugin lädt nicht
```
1. Überprüfe Console: [Lottery] Meldungen?
2. Überprüfe index.js: Hat das Import?
3. Server neustarten
```

### Problem: Befehle funktionieren nicht
```
1. /lotto-help durchführen (funktioniert das?)
2. /lotto-status (hat Plugin Error?)
3. Konsole auf [Lottery] ERROR prüfen
```

### Problem: Daten gehen verloren
```
1. Das sollte nicht passieren (Auto-Save alle 5min)
2. Stelle sicher World nicht überschrieben wird
3. Überprüfe festplatte Speicherplatz
```

Mehr Details: Siehe `SETUP_GUIDE.md` → Troubleshooting

---

## 🎮 Spieler-Experience

### Neuer Spieler:
```
1. Server betreten → Welcome-Nachricht
2. /lotto-gui → Menü öffnen
3. Tickets kaufen → Tickets erscheinen
4. Auf Ziehung warten → Auto-Draw durchführen
5. /lotto-claim → Gewinne abholen
```

### Ergebnis:
✅ Spieler haben Spaß
✅ Server-Wirtschaft aktiv
✅ Faire Chancen für Alle
✅ Transparent & Spannend

---

## 📊 Stats Anschauen

### Spieler-Statistiken:
```
/lotto-stats              # Meine Stats
/lotto-admin-stats Steve  # Stats von Steve
```

Zeigt:
- Gekaufte Tickets
- Ausgegeben / Gewonnen
- Win-Rate (%)

### Weltstatistiken:
```
/lotto-world
```

Zeigt:
- Gesamte Tickets
- Geld in Umlauf
- Letzte Gewinner

---

## 🔧 Erste Admin-Aufgaben

### Nach Installation:
1. [ ] `/lotto-status` → Status prüfen
2. [ ] `/lotto-admin-config` → Konfiguration anschauen
3. [ ] `/lotto-admin-draw` → Test-Ziehung
4. [ ] Spieler informieren dass Lotterie aktiv ist
5. [ ] Regelmäßig `/lotto-world` überprüfen

---

## 🆘 Brauchst du Hilfe?

### Im Spiel:
```
/lotto-help        # Zeigt alle Befehle
/lotto-info        # Zeigt Lotterie-Info
/lottery           # Zeigt Infoboard
```

### In Dateien:
| Problem | Datei |
|---------|-------|
| Was ist das Plugin? | README.md |
| Wie konfiguriere ich? | SETUP_GUIDE.md |
| Welche Befehle gibt es? | COMMANDS_REFERENCE.md |
| Wie teste ich? | DEPLOYMENT_CHECKLIST.md |
| Datei-Übersicht? | INDEX.md |

### In Konsole:
```
[Lottery] Meldungen überprüfen
```

---

## ✅ Deployment Checklist

Vor Go-Live überprüfen:

- [ ] Server startet ohne Fehler
- [ ] [Lottery] Meldungen in Console
- [ ] `/lotto-status` funktioniert
- [ ] `/lotto-gui` öffnet ohne Fehler
- [ ] Spieler können Tickets kaufen
- [ ] Ziehung funktioniert
- [ ] Gewinne werden verteilt
- [ ] Daten werden gespeichert

Alle grün? → **Dann GO-LIVE!** 🚀

---

## 🎰 Nächste Schritte

### JETZT SOFORT:
1. Server starten
2. `/lotto-status` testen
3. Konsole auf Fehler überprüfen

### INNERHALB 1 STUNDE:
1. Alle Befehle testen
2. Test-Ziehung durchführen
3. Spieler informieren

### INNERHALB 1 TAG:
1. Spieler spielen lassen
2. Statistiken überprüfen
3. Feedback sammeln

### REGELMÄSSIG:
1. Backups machen
2. Stats überprüfen
3. Performance monitoren

---

## 📞 Support & Links

**Im Plugin:**
- `/lotto-help` - Alle Befehle
- `/lotto-status` - Plugin-Status
- `/lotto-admin-config` - Konfiguration

**In Dateien:**
- README.md - Dokumentation
- SETUP_GUIDE.md - Anleitung
- COMMANDS_REFERENCE.md - Befehle
- PROJECT_SUMMARY.txt - Übersicht

---

## 🎉 Das wars!

Du hast jetzt:
- ✅ Ein funktionierendes Lottery System
- ✅ Umfassende Dokumentation
- ✅ Spieler-freundliche Befehle
- ✅ Admin-Kontrollpanel
- ✅ Automatische Ziehungen

**Viel Spaß damit! 🎰**

---

## 📖 Weitere Tipps

### Tipps für Admin:
- Passe Config an deine Server-Wirtschaft an
- Überwache regelmäßig `/lotto-world`
- Mache regelmäßig Backups
- Informiere Spieler über Gewinne

### Tipps für Support:
- `/lotto-help` ist dein Freund
- Verwende `COMMANDS_REFERENCE.md` als Guide
- FAQ im `README.md` überprüfen
- Wenn stuck: `/lotto-status` gibt Hinweise

### Tipps für Spieler:
- Nutze `/lotto-gui` - es ist einfacher
- Überprüfe `/lotto-stats` regelmäßig
- Denk dran: `/lotto-claim` für Gewinne
- Habe Spaß! 🎉

---

**Stand**: 2024-11-18
**Version**: 1.0.0
**Status**: ✨ Production Ready ✨

**Benötigst du weitere Hilfe? Siehe INDEX.md oder README.md!**
