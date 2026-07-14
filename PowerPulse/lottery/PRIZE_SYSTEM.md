# 🎰 Lottery System - Mehrstufiges Gewinn-System

Vollständige Dokumentation des erweiterten Gewinn-Systems mit mehreren Gewinn-Plätzen.

---

## 📋 Übersicht

Das neue Lottery System verteilt Gewinne auf **5 verschiedene Plätze**:

```
🥇 1. PLATZ (JACKPOT)  → 50% des Pots
🥈 2. PLATZ             → 25% des Pots
🥉 3. PLATZ             → 15% des Pots
4️⃣ 4. PLATZ             → 7% des Pots
5️⃣ 5. PLATZ             → 3% des Pots
```

---

## ⚙️ Konfiguration

### Standard-Einstellungen (in `core.js`)

```javascript
// POT-BASIERTE GEWINNE (Empfohlen!)
potDistribution: {
    enabled: true,      // Pot-basierte Gewinne aktiviert
    jackpot: 0.50,      // 1. Platz: 50%
    second: 0.25,       // 2. Platz: 25%
    third: 0.15,        // 3. Platz: 15%
    fourth: 0.07,       // 4. Platz: 7%
    fifth: 0.03,        // 5. Platz: 3%
    rollover: 0.00      // Reserve (0% = alles ausbezahlt)
},

// BONUS-SYSTEM
bonusSystem: {
    enabled: true,
    multiTicketBonus: 0.05,       // +5% für jeden 10er Pack
    weeklyBonus: 0.10,             // +10% jeden 7. Tag
    consecutiveWinBonus: 0.15      // +15% bei 2x hintereinander
},

// FESTE ALTERNATIVEN (Fallback)
fixedPrizes: {
    jackpot: 5000,    // 1. Platz (fester Betrag)
    second: 1000,     // 2. Platz
    third: 500,       // 3. Platz
    fourth: 200,      // 4. Platz
    fifth: 100        // 5. Platz
}
```

---

## 💰 Gewinn-Szenarien

### Szenario 1: Pot mit 1000 Smaragden

```
Gesamt Pot: 1000 Smaragde

🥇 1. Platz (50%):  500 Smaragde
🥈 2. Platz (25%):  250 Smaragde
🥉 3. Platz (15%):  150 Smaragde
4️⃣ 4. Platz (7%):   70 Smaragde
5️⃣ 5. Platz (3%):   30 Smaragde
────────────────────────
TOTAL:              1000 Smaragde
```

### Szenario 2: Großer Pot mit 10.000 Smaragden

```
Gesamt Pot: 10.000 Smaragde

🥇 1. Platz (50%):  5.000 Smaragde
🥈 2. Platz (25%):  2.500 Smaragde
🥉 3. Platz (15%):  1.500 Smaragde
4️⃣ 4. Platz (7%):   700 Smaragde
5️⃣ 5. Platz (3%):   300 Smaragde
────────────────────────
TOTAL:              10.000 Smaragde
```

### Mit Bonussystem

```
Spieler A: 20 Tickets (2x 10er Pack)
Basis-Gewinn: 5000
Multi-Ticket Bonus: +5% × 2 = +10% = +500
→ Finaler Gewinn: 5.500 Smaragde!
```

---

## 🎯 Gewinn-Bonusse

### Multi-Ticket Bonus
- Aktiviert bei 10+ Tickets
- +5% pro 10er Pack
- Beispiel: 20 Tickets = +10%, 30 Tickets = +15%

### Weekly Bonus
- Aktiv jeden 7. Tag nach Beitritt
- +10% auf den Gewinn
- Automatisch berechnet

### Consecutive Win Bonus
- Wenn Spieler 2x hintereinander gewinnt
- +15% Bonus auf den neuen Gewinn
- Motiviert zum Weitermachen!

---

## 📊 Neue Statistik-Befehle

### Spieler-Befehle

#### `/lotto-leaderboard`
Zeigt die Top 10 Gewinner
```
🥇 Steve - 50.000 gewonnen (15x)
🥈 Alex - 45.000 gewonnen (12x)
🥉 Sarah - 35.000 gewonnen (10x)
```

#### `/lotto-mywinnings`
Detaillierte persönliche Statistik
```
Gesamt gewonnen: 12.500
Gesamt ausgegeben: 5.000
Netto Gewinn: +7.500
ROI: +150%

Gewinn-Details:
- Gewinn-Anzahl: 8
- Durchschn. Gewinn: 1.562
- Größter Gewinn: 5.000
- Gewinn-Rate: 32%

Platzierungen:
🥇 Jackpot: 2x
🥈 2. Platz: 3x
🥉 3. Platz: 2x
4️⃣ 4. Platz: 1x
5️⃣ 5. Platz: 0x
```

#### `/lotto-draw-history`
Letzte 5 Ziehungen mit Details
```
Ziehung draw_42:
🥇 Steve: 5.000 + 500 Bonus
🥈 Alex: 2.500
🥉 Sarah: 1.500
...
```

### Admin-Befehle

#### `/lotto-distribution`
Gewinn-Verteilungs-Analyse
```
Gesamte Gewinne: 150
Gesamtbetrag: 487.500
Durchschn. Gewinn: 3.250

Nach Platzierung:
🥇 Jackpot: 50x (33%) - 250.000
🥈 2. Platz: 50x (33%) - 125.000
🥉 3. Platz: 30x (20%) - 75.000
4️⃣ 4. Platz: 15x (10%) - 25.000
5️⃣ 5. Platz: 5x (3%) - 12.500
```

#### `/lotto-player-roi <spieler>`
ROI (Return on Investment) Analyse
```
Ausgegeben: 1.000
Gewonnen: 3.500
Netto: +2.500
ROI: +250%
Status: PROFITABEL ✓
```

#### `/lotto-reports`
Zeigt alle verfügbaren Reports

#### `/lotto-world`
Weltweite Statistik mit neuen Details
```
Gesamt Tickets: 15.000
Gesamt ausgeschüttet: 487.500
Ziehungen: 150
Jackpots: 50

POT STATISTIKEN:
Durchschn. Pot: 3.250
Größter Pot: 25.000
Kleinster Pot: 100

TOP 5 GEWINNER:
1. Steve - 50.000
2. Alex - 45.000
...
```

---

## 🔄 Ziehungs-Prozess

### Schritt 1: Vorbereitung
```
Tickets im Pool: 1.000
Gesamt Pot: 10.000 Smaragde
```

### Schritt 2: Gewinn-Berechnung
```
Pot: 10.000

Gewinne (vor Bonus):
- 1. Platz: 5.000 (50%)
- 2. Platz: 2.500 (25%)
- 3. Platz: 1.500 (15%)
- 4. Platz: 700 (7%)
- 5. Platz: 300 (3%)
```

### Schritt 3: Gewinner-Auswahl
```
Wähle 5 verschiedene Tickets zufällig
1. Steve (Jackpot-Ticket)
2. Alex (2. Platz-Ticket)
3. Sarah (3. Platz-Ticket)
4. Mike (4. Platz-Ticket)
5. John (5. Platz-Ticket)
```

### Schritt 4: Bonus-Berechnung
```
Steve: 5.000 + 10% Ticket-Bonus = 5.500
Alex: 2.500 (kein Bonus)
Sarah: 1.500 + 15% Consecutive = 1.725
Mike: 700 (kein Bonus)
John: 300 (kein Bonus)
────────────────────────────────
TOTAL: 9.225 (775 Reserve)
```

### Schritt 5: Auszahlung
```
Alle Spieler erhalten sofort ihre Gewinne!
Neue Lotterie startet automatisch.
```

---

## 📈 Statistik-Funktionen

### stats.js Module

Die neue `stats.js` Datei bietet:

```javascript
getPlayerWinStatistics()        // Spieler-Gewinne
getGlobalWinStatistics()        // Weltweite Stats
getDrawHistory()                // Ziehungs-Historie
getPlayerROI()                  // ROI Analyse
getWinnerLeaderboard()          // Gewinner-Rangliste
getTicketLeaderboard()          // Ticket-Rangliste
getWinDistributionAnalysis()    // Gewinn-Verteilung
getPotStatistics()              // Pot-Statistiken
generateDetailedReport()        // Detaillierter Report
exportStatisticsAsJSON()        // JSON Export
```

---

## 🎯 Best Practices

### Für Server-Admins

1. **Pot-basierte Gewinne nutzen**
   - Automatisch skaliert mit Spieler-Aktivität
   - Fair für alle Spieler-Größen

2. **Bonussystem konfigurieren**
   - Belohnt Engagement
   - Verhindert "Abnutzung"

3. **Regelmäßig Reports überprüfen**
   - `/lotto-distribution` täglich
   - `/lotto-world` wöchentlich

4. **Spieler informieren**
   - Zeige TOP Gewinner
   - Erkläre die Chancen

### Für Spieler

1. **Multi-Ticket Strategie**
   - 10+ Tickets = +5% Bonus
   - 20+ Tickets = +10% Bonus

2. **Consecutive Wins nutzen**
   - 2x Gewinn = +15% auf nächsten Gewinn
   - Momentum aufbauen!

3. **ROI überwachen**
   - `/lotto-mywinnings` regelmäßig checken
   - Profitabel bleiben?

---

## 📊 Daten-Struktur

### Draw Result (neu)

```javascript
{
    id: "draw_42",
    timestamp: 1234567890,
    winners: [
        {
            placement: "jackpot",
            winnerName: "Steve",
            baseAmount: 5000,
            bonusAmount: 500,
            finalAmount: 5500
        },
        {
            placement: "second",
            winnerName: "Alex",
            baseAmount: 2500,
            bonusAmount: 0,
            finalAmount: 2500
        }
        // ... 3 weitere Gewinner
    ],
    totalPot: 10000,
    ticketsSold: 1000,
    totalDistributed: 9225
}
```

---

## 🔧 Anpassungen

### Gewinn-Prozentsätze ändern

```javascript
// In core.js
potDistribution: {
    jackpot: 0.45,    // 45% statt 50%
    second: 0.30,     // 30% statt 25%
    third: 0.15,      // 15% wie vorher
    fourth: 0.07,     // 7% wie vorher
    fifth: 0.03       // 3% wie vorher
}
```

### Bonus-Prozentsätze ändern

```javascript
bonusSystem: {
    multiTicketBonus: 0.10,     // 10% statt 5%
    weeklyBonus: 0.20,          // 20% statt 10%
    consecutiveWinBonus: 0.25   // 25% statt 15%
}
```

### Zu festen Gewinnen wechseln

```javascript
potDistribution: {
    enabled: false  // Deaktiviert Pot-basiert
}
// Nutzt dann fixedPrizes
```

---

## 💡 Tipps & Tricks

### Für höhere Engagement

```javascript
// Mehr Ticketbonuse!
multiTicketBonus: 0.10    // 10% statt 5%

// Bessere Weekly Rewards
weeklyBonus: 0.20         // 20% statt 10%

// Mehr Consolation Prizes
fifth: 0.05               // 5% statt 3%
```

### Für fairere Verteilung

```javascript
// Weniger auf Jackpot
jackpot: 0.40   // 40% statt 50%

// Mehr für andere
second: 0.30    // 30% statt 25%
third: 0.20     // 20% statt 15%
```

### Für größere Gewinne

```javascript
// Reserve erhöhen für Rollover
rollover: 0.05  // 5% wird nächsten Pot hinzugefügt
```

---

## 🎉 Beispiel-Ziehung

### Setup
```
Draw Duration: 1 Stunde
Tickets Sold: 500
Total Pot: 5.000 Smaragde
10 Spieler mit je 50 Tickets
```

### Gewinn-Berechnung
```
Gewinne:
🥇 1. Platz: 2.500 (50%)
🥈 2. Platz: 1.250 (25%)
🥉 3. Platz: 750 (15%)
4️⃣ 4. Platz: 350 (7%)
5️⃣ 5. Platz: 150 (3%)
────────────────
TOTAL:       5.000
```

### Gewinner
```
🥇 Steve:   2.500 + 250 (Multi-Ticket) = 2.750
🥈 Alex:    1.250 (10+ Tickets) = 1.250
🥉 Sarah:   750 + 112 (Consecutive) = 862
4️⃣ Mike:    350 (kein Bonus) = 350
5️⃣ John:    150 (kein Bonus) = 150
──────────────────────────────────────
VERTEILT:                        5.362

(Das ist MEHR als 5.000 wegen Bonuse!)
```

---

## ⚠️ Wichtig!

**Bonussystem kann Pot übersteigen!**

Wenn Bonuse den Pot übersteigen, werden die Gewinne begrenzt:

```javascript
if (totalDistributed > totalPot) {
    // Skaliere alle Gewinne proportional runter
    const factor = totalPot / totalDistributed;
    winAmount = Math.floor(winAmount * factor);
}
```

Dies ist implementiert im System!

---

## 📞 Support

**Fragen zum Gewinn-System?**

Befehle zum Testen:
```
/lotto-leaderboard          # Gewinnerrangliste
/lotto-mywinnings           # Deine Gewinne
/lotto-distribution         # Verteilung anschauen
/lotto-world                # Gesamtübersicht
```

---

**Version**: 1.0.0
**Bedrock**: 1.21.120+
**Status**: Production Ready ✅

