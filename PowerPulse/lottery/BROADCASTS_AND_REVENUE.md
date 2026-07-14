# 🎰 Lottery System - Broadcasts & Revenue Guide

Vollständige Dokumentation für In-Game Broadcasts, Discord Integration und Server Revenue Tracking.

---

## 📢 BROADCASTS SYSTEM

### Was sind Broadcasts?

Broadcasts sind In-Game Nachrichten an **alle Spieler**, wenn wichtige Events passieren:
- Spieler kauft Tickets
- Lotterie wird gezogen
- Jemand gewinnt großen Preis
- Keine Tickets gekauft (Ziehung abgesagt)

### Types von Broadcasts

#### 1. **Ticket-Kauf Broadcast**

```
═══════════════════════════════════════
🎫 TICKET GEKAUFT
═══════════════════════════════════════
Spieler: Steve
Tickets: +5
Kosten: -50 emerald
Aktueller Pool: 500 emerald
═══════════════════════════════════════
```

Auch an Discord gesendet als schöner Embed!

#### 2. **Mega-Kauf Broadcast** (10+ Tickets)

```
═══════════════════════════════════════
🎫🎫🎫 MEGA TICKET KAUF! 🎫🎫🎫
═══════════════════════════════════════
🔥 Steve kaufte 20 TICKETS!
Kosten: -200 emerald
Gesamte Tickets dieses Spielers: 45
Aktueller Pool: 750 emerald
Steve hat jetzt gute Chancen! 👀
═══════════════════════════════════════
```

#### 3. **Zu wenig Geld Broadcast**

```
═══════════════════════════════════════
❌ TICKET KAUF ABGELEHNT
═══════════════════════════════════════
Spieler: Alex
Benötigt: 500 emerald
Vorhanden: 300 emerald
Fehlbetrag: 200 emerald
💡 Verdiene mehr emerald und komm zurück!
═══════════════════════════════════════
```

#### 4. **Draw mit Gewinnern Broadcast**

```
════════════════════════════════════════════
🎉🎉🎉 LOTTERIE ZIEHUNG DURCHGEFÜHRT! 🎉🎉🎉
════════════════════════════════════════════
Draw ID: draw_42
Tickets im Pool: 500
Gesamter Pot: 5000 emerald

━━━━ DIE GEWINNER ━━━━
🥇 STEVE - 2500 (+250 BONUS)
🥈 ALEX - 1250
🥉 SARAH - 750 (+112 BONUS)
4️⃣ MIKE - 350
5️⃣ JOHN - 150

Glückwunsch an alle Gewinner! 🎊
════════════════════════════════════════════
```

#### 5. **Keine Tickets - Ziehung Abgesagt**

```
═══════════════════════════════════════
⚠️ LOTTERIE ABGESAGT
═══════════════════════════════════════
❌ Niemand hat Tickets gekauft.
Die Lotterie wurde abgesagt.

💡 Tipp: Kaufe Tickets mit /lotto und
   nimm an der nächsten Runde teil!
═══════════════════════════════════════
```

Auch an Discord mit Warning Color!

#### 6. **Neue Runde Gestartet**

```
═══════════════════════════════════════
✨ NEUE LOTTERIE RUNDE GESTARTET! ✨
═══════════════════════════════════════
Runde: draw_43
Ticket-Preis: 10 emerald
Status: 🟢 AKTIV

💫 Kaufe Tickets und gewinne große Preise!
Befehl: /lotto-gui oder /lotto [menge]
═══════════════════════════════════════
```

#### 7. **Großer Gewinn (Rekord)**

```
════════════════════════════════════════════
🏆 NEUER JACKPOT-REKORD! 🏆
════════════════════════════════════════════
Gewinner: 🔥 STEVE
Preis: 🔥 10.000 EMERALD 🔥
Alter Rekord: 8.000
Neuer Rekord: 10.000

🎊 Glückwunsch! 🎊
════════════════════════════════════════════
```

---

## 💻 DISCORD INTEGRATION

### Automatische Discord-Nachrichten

Alle wichtigen Events werden auch zu Discord gesendet:

1. **Ticket-Kauf** → Discord Embed (Blau)
2. **Mega-Kauf** → Discord Embed mit Extra-Highlights (Grün)
3. **Draw Ergebnisse** → Discord Embed mit Gewinnern (Rot - Jackpot)
4. **Keine Tickets** → Discord Embed (Orange - Warnung)
5. **Revenue Update** → Discord Embed (Orange)
6. **Rekord Gewinn** → Discord Embed (Rot - Special)

### Embed Beispiel

```
🎰 Lottery System Update

🎫 Neues Lotterie-Ticket!
─────────────────────
Spieler: Steve
Tickets: +5
Kosten: -50 emerald
Pool (aktuell): 500 emerald

[Timestamp: 2024-11-18 19:50:00]
```

### Discord Channel Setup

Verwende BedrockBridge's Discord Integration:

```javascript
// Automatisch über Bridge
bridge.discordMessage({...})  // Wird in den Kanal gesendet
```

---

## 💰 SERVER REVENUE SYSTEM

### Was ist Server Revenue?

Der Server verdient Geld mit der Lotterie:

```
Beispiel Draw:
─────────────
Tickets verkauft:      100
Ticket-Preis:          10 emerald/Stück
Gesamteinnahmen:       1.000 emerald

Server-Anteil (15%):   150 emerald ← GEWINN!
Ausgeschüttet:         950 emerald
────────────────────
Server Profit:         150 emerald
```

### Gewinnspanne Erklärung

**Gewinnspanne = Was der Server behält von den Einnahmen**

```
Gesamteinnahmen:       1.000 emerald
Server-Anteil:         150 emerald
Gewinnspanne:          15%
```

Das bedeutet: Für jedes Ticket verdient der Server 1,5 emerald!

### Revenue Konfiguration

In `revenue.js`:

```javascript
const REVENUE_CONFIG = {
    // Prozentsatz, den Server behält
    serverTakePercentage: 0.15,     // 15% - anpassbar!

    // Oder fixer Betrag pro Ticket
    fixedServerTake: 0,              // 0 = Prozentsatz nutzen

    // Reserve für Jackpot
    jackpotReservePercentage: 0.05,  // 5% Reserve
};
```

### Admin-Befehle für Revenue

#### `/lotto-revenue`
Einfacher Revenue Report:
```
💰 SERVER REVENUE REPORT
─────────────────────
Tickets verkauft: 1.250
Gesamteinnahmen: 12.500
Server-Anteil: 1.875
Ausgeschüttet: 10.625
Netto Gewinn: 1.875
Gewinnspanne: 15.0%
Server ROI: 17.65%
```

#### `/lotto-revenue-detailed`
Detaillierter Report mit Trends:
```
💹 DETAILLIERTER REVENUE REPORT

━━━━ ZUSAMMENFASSUNG ━━━━
Ziehungen: 50
Tickets gesamt: 1.250
Durchschn. pro Ziehung: 25

━━━━ FINANZEN ━━━━
Gesamteinnahmen: 12.500
Server-Anteil: 1.875
Ausgeschüttet: 10.625
Netto Gewinn: 1.875

━━━━ MARGEN & ROI ━━━━
Profit-Marge: 15.0%
Durchschn. Marge/Draw: 14.8%
Server ROI: 17.65%
Profit pro Draw: 37

━━━━ TOP 5 PROFITABLE DRAWS ━━━━
1. draw_42: 500 Gewinn (50.0%)
2. draw_41: 450 Gewinn (45.0%)
...
```

#### `/lotto-revenue-analysis`
Trend & Break-Even Analyse:
```
📊 REVENUE ANALYSE & TRENDS

━━━━ TREND ANALYSE ━━━━
Trend: 📈 STEIGEND (+200)
Beste Stunde: 20:00 (1.500 Einnahmen)

━━━━ BREAK-EVEN ANALYSE ━━━━
Durchschn. Gewinn/Draw: 37
Durchschn. Kosten/Draw: 212
Profit-Prozent: 17.45%

Fazit: Lotterie läuft stabil und profitabel!
```

#### `/lotto-margins`
Detaillierte Gewinnspanne:
```
💹 GEWINNSPANNE ANALYSE
Status: ✓ GESUND

━━━━ MARGIN PROZENTE ━━━━
Gesamt-Marge: 15.0%
Durchschn./Draw: 14.8%
Server ROI: 17.65%

━━━━ ABSOLUTE GEWINNE ━━━━
Profit/Draw: 37

✓ Margin im grünen Bereich!
```

---

## 📊 Revenue Metriken Erklärt

### Profit Margin
```
Wie viel % der Einnahmen behält der Server?

Beispiel:
Einnahmen: 100
Server-Anteil: 15
Margin: 15%
```

**Standard**: 15% ist gut für Server-Stabilität

### Server ROI (Return on Investment)
```
Wie viel Gewinn pro investiertem €?

ROI = (Gewinn / Investition) × 100

Beispiel:
Server gibt 100 aus
Server verdient 15
ROI = (15 / 100) × 100 = 15%
```

**Standard**: 10-20% ROI ist sehr gesund

### Break-Even
```
Punkt, ab dem Lotterie profitable wird

Wenn Average Cost > Average Gewinn → Verlust
Wenn Average Gewinn > Average Cost → Gewinn
```

### Hourly Revenue
```
Welche Stunde verdient am meisten?

Beispiel:
20:00: 1.500 emerald ← Peak Hour
19:00: 1.200 emerald
21:00: 800 emerald
```

**Nutzen**: Nachtspieler bevorzugen die Lotterie!

---

## 🎯 Szenarien

### Szenario 1: Kleine Gewinnspanne

```
Problem: Server verdient zu wenig
Einnahmen: 1.000 (100 Tickets à 10)
Server-Anteil: 5%  ← Zu niedrig!
Gewinn: 50

Lösung:
- Erhöhe serverTakePercentage auf 20%
- Oder erhöhe Ticket-Preis auf 15

Neuer Gewinn: 150 (bei 20%)
```

### Szenario 2: Zu hohe Kosten

```
Problem: Server zahlt zu viel aus
Gesamtkosten: 900 von 1.000
Gewinn: 100

Ursache: Zu großzügige Gewinne

Lösung:
- Senke Jackpot-Prozentanz
- Oder erhöhe Ticket-Preis
```

### Szenario 3: Peak Hour

```
Beobachtung: 20:00 Uhr beste Einnahmen

Lösung: Double-Jackpot ab 20:00 Uhr?
- Würde mehr Spieler anlocken
- Kostet mehr, aber bringt mehr Tickets

Trade-off: Höhere Kosten vs. Mehr Tickets
```

---

## 📈 Best Practices für Revenue

### 1. Margin Monitoring
```
Überprüfe wöchentlich:
/lotto-margins

Ziel: 15-20% Gewinnspanne
Zu niedrig? → Ticket teurer
Zu hoch? → Spieler verdienen weniger
```

### 2. Trend Überwachung
```
Überprüfe täglich:
/lotto-revenue-analysis

Trend fallend? → Spieler verlieren Interesse
Trend steigend? → Prima, weiter so!
```

### 3. Profitabilität Sichern
```
Minimale Anforderungen:
- Server ROI ≥ 10%
- Margin ≥ 10%
- Break-Even profitabel

Wenn nicht erfüllt:
→ Ticket-Preis erhöhen
→ Oder Payout senken
```

### 4. Player Satisfaction

```
Balance finden:
- Zu hohe Kosten → Spieler verdienen
- Zu niedrige Kosten → Server verdient

Golden Rule:
Spieler sollten durchschnittlich
50-70% ihrer Ausgaben zurück gewinnen
```

---

## 💡 Tipps

### Revenue Maximieren

```javascript
// Option 1: Höhere Gewinnspanne
serverTakePercentage: 0.25  // 25% statt 15%

// Option 2: Höherer Ticket-Preis
CONFIG.ticketPrice: 15      // statt 10

// Option 3: Weniger Großgewinne
potDistribution: {
    jackpot: 0.40,          // 40% statt 50%
    second: 0.20,           // 20% statt 25%
    ...
}
```

### Player Retention

```javascript
// Option 1: Bessere Gewinnchancen
multiTicketBonus: 0.10      // +10% statt 5%

// Option 2: Größere Pools
Erhöhe ticketPrice weniger,
aber Draw-Frequenz erhöhen

// Option 3: Spezielle Events
Weekly Jackpot Boost
```

---

## 📞 Troubleshooting

### Problem: Server-Anteil wird nicht berechnet

**Lösung**:
```
Überprüfe revenue.js:
REVENUE_CONFIG.trackingEnabled = true
```

### Problem: Discord-Nachrichten kommen nicht an

**Lösung**:
```javascript
// Überprüfe Bridge Integration
if (bridge && bridge.discordMessage) {
    // Funktioniert
} else {
    // Discord nicht verbunden
}
```

### Problem: Zu hohe Auszahlungen

**Lösung**:
```
Senke Gewinn-Prozentsätze in core.js:
potDistribution: {
    jackpot: 0.40,  // Statt 0.50
    second: 0.20,   // Statt 0.25
    ...
}
```

---

## 📊 Daten-Struktur

### Revenue Record

```javascript
{
    drawId: "draw_42",
    ticketsSold: 100,
    unitPrice: 10,
    totalRevenue: 1000,
    totalPayedOut: 850,
    serverTake: 150,
    totalProfit: 150,
    winnerCount: 5,
    timestamp: 1234567890
}
```

### Revenue Report

```javascript
{
    summary: {
        draws: 50,
        ticketsSold: 1250,
        averageTicketsPerDraw: 25
    },
    financial: {
        totalRevenue: 12500,
        serverTake: 1875,
        payedOut: 10625,
        netProfit: 1875
    },
    margins: {
        profitMargin: "15.0%",
        serverROI: "17.65%"
    }
}
```

---

**Version**: 1.0.0
**Status**: Production Ready ✅

