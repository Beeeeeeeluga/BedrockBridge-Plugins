# 🎰 Lottery System - Commands Reference

Komplette Übersicht aller Befehle des Lottery Systems.

## 📋 Inhaltsverzeichnis

- [Spieler-Befehle](#-spieler-befehle)
- [Admin-Befehle](#-admin-befehle)
- [GUI-Befehle](#-gui-befehle)
- [Info-Befehle](#-info-befehle)

---

## 👥 Spieler-Befehle

### Haupt-Menü
```
/lotto-gui
```
**Beschreibung**: Öffnet das interaktive Lotterie-Menü
**Zugriff**: Alle Spieler
**GUI Features**:
- Ticket Kauf
- Statistiken anzeigen
- Gewinne verwalten

---

### Tickets kaufen
```
/lotto [menge]
```
**Beschreibung**: Kaufe 1-10 Lotterie-Tickets
**Parameter**:
- `menge` (optional) - Anzahl Tickets (1-10), Standard: 1

**Beispiele**:
```
/lotto           # Kaufe 1 Ticket
/lotto 5         # Kaufe 5 Tickets
/lotto 10        # Kaufe 10 Tickets (Maximum)
```

**Anforderungen**:
- Spieler muss genug Smaragde haben
- Darf nicht über maxTicketsPerPlayer Limit
- Tickets müssen im Pool vorhanden sein

**Antwort bei Erfolg**:
```
✓ 5 Ticket(s) gekauft für 50 emerald
```

---

### Persönliche Statistiken
```
/lotto-stats
```
**Beschreibung**: Zeige deine Lotterie-Statistiken
**Zugriff**: Alle Spieler
**Zeigt**:
- Gekaufte Tickets (gesamt)
- Aktive Tickets
- Gesamt ausgegeben
- Gesamt gewonnen
- Gewinnrate (%)

**Beispiel-Ausgabe**:
```
═══════════════════════════════════════
📊 DEINE LOTTERIE-STATISTIK
═══════════════════════════════════════
Spieler: Steve
Gekaufte Tickets: 25
Aktive Tickets: 10
Gesamt ausgegeben: 250
Gesamt gewonnen: 5000
Gewinnzahl: 2
Gewinn-Rate: 8.00%
═══════════════════════════════════════
```

---

### Lotterie-Informationen
```
/lotto-info
```
**Beschreibung**: Zeige Info über die aktuelle Lotterie
**Zugriff**: Alle Spieler
**Zeigt**:
- Draw ID
- Tickets im Pool
- Aktuelles Pot
- Dauer
- Gewinnbeträge

---

### Gewinne abholen
```
/lotto-claim
```
**Beschreibung**: Hole deine Gewinne
**Zugriff**: Alle Spieler
**Funktion**:
- Berechnet alle ausstehenden Gewinne
- Gibt Smaragde ins Inventar
- Aktualisiert Spieler-Daten

**Antwort**:
```
✓ 2 Gewinn(e) erhalten: 10000 emerald
```

---

### Allgemeine Lotterie-Info
```
/lottery
```
**Beschreibung**: Zeigt das Lotterie-Infoboard
**Zugriff**: Alle Spieler
**Zeigt**:
- Aktuelle Statistik
- Verfügbare Befehle
- Ticket-Preis

---

### Hilfe anzeigen
```
/lotto-help
```
**Beschreibung**: Zeigt alle verfügbaren Befehle
**Zugriff**: Alle Spieler
**Kategorie**: Info

---

## 👨‍💼 Admin-Befehle

### Admin Haupt-Menü
```
/lotto-admin-gui
```
**Beschreibung**: Öffnet das Admin-Kontrollpanel
**Zugriff**: Nur Admins/OPs
**Features**:
- Ziehung durchführen
- Weltstatistiken
- Spieler suchen
- Admin-Verwaltung

---

### Manuelle Ziehung
```
/lotto-admin-draw
```
**Beschreibung**: Führt sofort eine Lotterie-Ziehung durch
**Zugriff**: Nur Admins/OPs
**Funktion**:
1. Wählt zufällig ein Ticket
2. Bestimmt Gewinner
3. Vergibt Preis
4. Startet neue Runde

**Anforderungen**:
- Mindestens 1 Ticket im Pool
- Nicht zu häufig (hat Cooldown)

**Ausgabe**:
```
═══════════════════════════════════════
🎉 LOTTERIE ZIEHUNG DURCHGEFÜHRT
═══════════════════════════════════════
Gewinner: Steve
Preis: 5000 emerald
Draw ID: draw_42
═══════════════════════════════════════
```

---

### Spieler Statistiken
```
/lotto-admin-stats <Spieler>
```
**Beschreibung**: Zeige Statistiken eines Spielers
**Zugriff**: Nur Admins/OPs
**Parameter**:
- `Spieler` (erforderlich) - Spielername

**Beispiel**:
```
/lotto-admin-stats Steve
```

**Zeigt**:
- Gekaufte Tickets
- Aktive Tickets
- Ausgegeben
- Gewonnen
- Gewinn-Rate

---

### Spieler-Daten zurücksetzen
```
/lotto-admin-reset <Spieler>
```
**Beschreibung**: Setzt alle Lotterie-Daten eines Spielers zurück
**Zugriff**: Nur Admins/OPs
**Parameter**:
- `Spieler` (erforderlich) - Spielername

**Warnung**: Diese Aktion kann nicht rückgängig gemacht werden!

**Beispiel**:
```
/lotto-admin-reset Steve
```

---

### Konfiguration anzeigen
```
/lotto-admin-config
```
**Beschreibung**: Zeigt aktuelle Konfigurationseinstellungen
**Zugriff**: Nur Admins/OPs

**Zeigt**:
- Aktivierungsstatus
- Ticket-Preis
- Maximale Tickets
- Draw-Intervall
- Gewinnbeträge

---

### Weltstatistiken
```
/lotto-world
```
**Beschreibung**: Zeigt weltweite Lotterie-Statistiken
**Zugriff**: Nur Admins/OPs

**Zeigt**:
- Gesamt Tickets verkauft
- Geld in Umlauf
- Ziehungen durchgeführt
- Aktive Spieler
- Letzte 5 Ziehungen

**Beispiel-Ausgabe**:
```
═══════════════════════════════════════
🌍 WELTWEITE LOTTERIE-STATISTIK
═══════════════════════════════════════
Gesamt Tickets verkauft: 542
Gesamt Geld in Umlauf: 15420
Ziehungen durchgeführt: 8
Aktive Spieler: 12

━━━━ LETZTE ZIEHUNGEN ━━━━
draw_42: Steve won 5000
draw_41: Alex won 5000
draw_40: Sarah won 5000
```

---

### Plugin-Status
```
/lotto-status
```
**Beschreibung**: Zeigt detaillierten Plugin-Status
**Zugriff**: Nur Admins/OPs

**Zeigt**:
- Aktivierungsstatus
- Auto-Draw Status
- Spieler im System
- Aktuelle Tickets
- Konfiguration

**Beispiel**:
```
═══════════════════════════════════════
🎰 LOTTERY PLUGIN STATUS
═══════════════════════════════════════
Status: AKTIV
Auto-Draw: AN
Spieler im System: 15
Aktuelle Tickets: 127
Gesamte Ziehungen: 8
Seit letzter Ziehung: 23h

━━━━ KONFIGURATION ━━━━
Ticket-Preis: 10
Jackpot: 5000
Draw-Intervall: 3600000ms
```

---

## 🎮 GUI-Befehle

### Lotterie Menü
```
/lotto-gui
```
**GUI Screens**:

1. **Hauptmenü**
   - Zeige Statistiken
   - Kaufe Tickets
   - Verwalte Gewinne

2. **Ticket-Kauf**
   - Wähle Anzahl (1-10)
   - Bestätige Kauf
   - Erhalten Bestätigung

3. **Statistiken**
   - Deine Tickets
   - Ausgegeben/Gewonnen
   - Win-Rate

4. **Gewinne**
   - Zeige Gewinne
   - Hole Gewinne
   - Zeige Historie

---

### Admin-Menü
```
/lotto-admin-gui
```
**GUI Screens**:

1. **Hauptmenü**
   - Ziehung durchführen
   - Weltstatistiken
   - Spieler suchen

2. **Ziehungs-Bestätigung**
   - Warnung vor Aktion
   - Bestätigung erforderlich

3. **Weltstatistiken**
   - Alle weltweiten Stats
   - Ziehungs-Historie

4. **Spieler-Suche**
   - Spieler Name eingeben
   - Details anzeigen
   - Daten verwalten

---

## ℹ️ Info-Befehle

### Lotterie Infoboard
```
/lottery
```
- Zeigt Infoboard

### Hilfe
```
/lotto-help
```
- Zeigt alle Befehle
- Zeigt Konfiguration

---

## 🔍 Befehl-Übersicht Tabelle

| Befehl | Admin | Beschreibung |
|--------|-------|-------------|
| `/lotto-gui` | ❌ | Hauptmenü öffnen |
| `/lotto [n]` | ❌ | Tickets kaufen |
| `/lotto-stats` | ❌ | Meine Statistiken |
| `/lotto-info` | ❌ | Lotterie-Info |
| `/lotto-claim` | ❌ | Gewinne abholen |
| `/lottery` | ❌ | Lotterie-Info |
| `/lotto-help` | ❌ | Hilfe anzeigen |
| `/lotto-admin-gui` | ✅ | Admin-Menü |
| `/lotto-admin-draw` | ✅ | Ziehung durchführen |
| `/lotto-admin-stats <p>` | ✅ | Spieler-Stats |
| `/lotto-admin-reset <p>` | ✅ | Daten zurücksetzen |
| `/lotto-admin-config` | ✅ | Konfiguration |
| `/lotto-world` | ✅ | Weltstatistiken |
| `/lotto-status` | ✅ | Plugin-Status |

---

## ⌨️ Befehl-Eingabe Tipps

### Auto-Completion
Minecraft unterstützt Tab-Completion:
```
/lott[TAB] → /lotto-gui
/lotto[TAB] → zeigt Optionen
```

### Häufig verwendete Befehle
```
# Schnell: Tickets kaufen
/lotto 5

# Info: Deine Statistiken
/lotto-stats

# Gewinne abholen
/lotto-claim

# Admin: Status prüfen
/lotto-status
```

### Error-Handling

**Fehler**: `Unbekannter Befehl`
- Überprüfe Schreibweise
- Plugin muss geladen sein

**Fehler**: `Du hast nicht genug Berechtigung`
- Nur für Admin-Befehle
- Du musst Admin/Op sein

**Fehler**: `Spieler nicht gefunden`
- Spieler muss auf dem Server sein
- Überprüfe Schreibweise des Namens

---

## 🎯 Befehl-Szenarien

### Spieler-Szenario: Tickets kaufen und Gewinne abholen
```
1. /lotto-gui                    # Menü öffnen
2. → "Ticket Kaufen" wählen
3. → 5 eingeben, bestätigen
4. ✓ 5 Tickets gekauft
5. (Nach Ziehung)
6. /lotto-claim                  # Gewinne abholen
7. ✓ Gewinne erhalten
```

### Admin-Szenario: Ziehung durchführen und Statistiken überprüfen
```
1. /lotto-status                 # Status überprüfen
2. /lotto-admin-draw             # Ziehung durchführen
3. ✓ Ziehung erfolgreich
4. /lotto-world                  # Statistiken anzeigen
5. /lotto-admin-stats <Spieler>  # Spieler überprüfen
```

---

## 📞 Support für Befehle

**Befehl funktioniert nicht?**
1. Überprüfe Schreibweise
2. Nutze `/lotto-help`
3. Schau in Plugin-Status

**Mehr Informationen?**
- `/lotto-help` - Alle Befehle
- `/lotto-info` - Lotterie-Info
- Konsole überprüfen auf Fehler

---

**Stand**: Lottery System v1.0.0
**Kompatibilität**: Bedrock 1.21.120+

