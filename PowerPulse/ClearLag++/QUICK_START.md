# ClearLag++ Quick Start Guide

Ein schneller 5-Minuten-Guide um ClearLag++ zum Laufen zu bringen!

## ⚡ 5-Minuten Setup

### 1. Installation (1 Minute)
✅ Das Plugin ist bereits installiert in:
```
D:\BB\bridgePlugins\ClearLag++\
```

### 2. Server starten (1-2 Minuten)
Starten Sie Ihren Bedrock-Bridge Server:
```
Server startet und lädt automatisch ClearLag++
```

Überprüfen Sie die Console auf:
```
[ClearLag++] ClearLag++ erfolgreich initialisiert!
```

### 3. Erste Befehle testen (1 Minute)
```
/clearlag help              → Zeige alle Befehle
/clearlag status            → Zeige Server-Performance
/clearlag stats             → Zeige Cleanup-Statistiken
```

### 4. Admin-Features freischalten (1-2 Minuten)
```
/tag @s add clearlag:admin  → Werde Admin für ClearLag++
/clearlag cleanup           → Starte sofortiges Cleanup
/clearlag killmobs hostile  → Entferne feindselige Mobs
```

### 5. Dashboard öffnen (Optional)
- Nutzen Sie das Server-UI Dashboard (wird durch Bridge bereitgestellt)
- Oder nutzen Sie Commands

**Fertig! ClearLag++ ist einsatzbereit!** 🎉

---

## 🎮 Häufigste Commands

### Für Admins
```
/clearlag cleanup           → Cleanup jetzt ausführen
/clearlag killmobs all      → Alle Mobs entfernen
/clearlag status            → Performance anschauen
/clearlag broadcast toggle  → Nachrichten an/aus
```

### Für Spieler
```
/clearlag help              → Hilfe anschauen
/clearlag status            → Server-Status
```

### Für Mods
```
/clearlag status            → Performance-Status
/clearlag stats             → Cleanup-Statistiken
```

---

## 📊 Performance im Auge behalten

### Schnelle Checks
```
/clearlag status
```
**Was Sie sehen werden:**
- **TPS**: 20 = optimal, < 10 = Lag
- **MSPT**: < 50ms = gut, > 50ms = problematisch
- **Entities**: Weniger = besser
- **RAM**: < 80% = ok, > 95% = kritisch

### Automatisches Monitoring
ClearLag++ läuft im Hintergrund und:
- Räumt Items nach 5 Minuten auf ✅
- Überwacht TPS konstant ✅
- Benachrichtigt Admins bei Problemen ✅
- Sendet Nachrichten an Discord ✅

---

## 🔧 Schnelle Konfiguration

### Cleanup-Zeit anpassen
Bearbeite `src/config.js`:
```javascript
autoCleanup: {
  items: {
    delayTicks: 6000  // 5 Minuten
    // Änderungen: 3000 = 2.5 Min, 12000 = 10 Min
  }
}
```

### Performance-Alerts anpassen
```javascript
monitoring: {
  tps: {
    warnThreshold: 10,      // Warnung bei < 10 TPS
    criticalThreshold: 5    // Kritisch bei < 5 TPS
  }
}
```

### Discord-Nachrichten an/aus
```javascript
discord: {
  enabled: false  // true = an, false = aus
}
```

**Nach Änderungen**: Server neu starten!

---

## 📈 Monitoring-Metriken verstehen

### TPS (Ticks Per Second)
- **20 TPS** = Perfekt, keine Lags
- **15+ TPS** = Gut, minimal Lag
- **10-15 TPS** = Spürbar, aber spielbar
- **5-10 TPS** = Starker Lag
- **< 5 TPS** = Server ist überlastet ⚠️

### MSPT (Milliseconds Per Tick)
- **< 40ms** = Excellent
- **40-50ms** = Akzeptabel
- **50-75ms** = Problematisch
- **> 75ms** = Server zu langsam ⚠️

### Entity Count
- **< 200** = Perfekt
- **200-300** = Normal
- **300-400** = Erhöht
- **> 400** = Zu viele ⚠️

### RAM Usage
- **< 80%** = Gut
- **80-95%** = Warnung
- **> 95%** = Kritisch ⚠️

---

## 🚨 Problembehebung

### Problem: Nichts passiert
**Lösung:**
```bash
1. Server neu starten
2. Console auf Fehler überprüfen
3. /clearlag status eingeben
```

### Problem: Commands funktionieren nicht
**Lösung:**
```bash
1. Admin-Tag setzen: /tag @s add clearlag:admin
2. /clearlag help eingeben
3. Logs überprüfen
```

### Problem: Zu viele Mobs auf dem Server
**Lösung:**
```bash
/clearlag killmobs hostile    # Feindselige Mobs weg
/clearlag killmobs passive    # Passive Mobs weg
/clearlag killmobs all        # Alle Mobs weg
```

### Problem: Server-Lag
**Lösung:**
```bash
1. /clearlag status überprüfen
2. /clearlag cleanup ausführen
3. Redstone-Maschinen überprüfen
4. Bei Bedarf Server-Limits anpassen
```

---

## 🌟 Pro-Tipps

### Tipp 1: Automatisches Cleanup nutzen
✅ ClearLag++ räumt automatisch auf
- Keine manuellen Commands nötig
- Läuft im Hintergrund
- Speichert Server-Ressourcen

### Tipp 2: Performance Alerts beobachten
✅ Achten Sie auf Warnungen:
- Chat-Nachrichten von ClearLag++
- Discord-Benachrichtigungen (wenn aktiviert)
- Logs einsehen mit `/clearlag logs`

### Tipp 3: Regelmäßig Statistiken überprüfen
```
/clearlag stats     # Wöchentlich anschauen
/clearlag status    # Täglich überprüfen
```

### Tipp 4: Dashboard nutzen
- Benutzerfreundlichere Übersicht
- Schneller Zugriff auf Features
- Mobile-freundlich (via Browser)

### Tipp 5: Nachrichten anpassen
```javascript
// In config.js:
broadcasts: {
  cleanupMessage: {
    format: "Dein eigenes Format hier"
  }
}
```

---

## 📚 Weiterführende Dokumentation

Nachdem Sie die Basics verstanden haben:

1. **README.md** - Umfassende Feature-Übersicht
2. **INSTALLATION.md** - Detaillierte Setup-Anleitung
3. **API_GUIDE.md** - Für Entwickler & Advanced Users
4. **config.js** - Alle Konfigurationsoptionen

---

## 🎯 Nächste Schritte

### Sofort (Diese Woche)
- [ ] Testen Sie `/clearlag status`
- [ ] Überprüfen Sie `/clearlag stats`
- [ ] Testen Sie `/clearlag cleanup`

### Diese Woche
- [ ] Passen Sie Konfiguration an
- [ ] Überprüfen Sie Discord-Integration
- [ ] Testen Sie Dashboard

### Diese Woche+
- [ ] Monitoring-Trends analysieren
- [ ] Performance-Probleme beheben
- [ ] Team trainieren (Befehle zeigen)

---

## 🆘 Schnelle Hilfe

| Problem | Befehl | Lösung |
|---------|--------|--------|
| Server laggt | `/clearlag cleanup` | Cleanup ausführen |
| Zu viele Mobs | `/clearlag killmobs all` | Alle Mobs entfernen |
| Status überprüfen | `/clearlag status` | Metriken anschauen |
| Statistiken | `/clearlag stats` | Verlauf anschauen |
| Hilfe | `/clearlag help` | Commands anzeigen |
| Nachrichten aus | `/clearlag broadcast cleanup` | Toggle aktivieren |

---

## 🔐 Admin-Setup

```bash
# Admin-Perms geben:
/tag @s add clearlag:admin

# Überprüfen:
/clearlag config get

# Jetzt verfügbar:
/clearlag cleanup
/clearlag killmobs
/clearlag broadcast
/clearlag config
/clearlag weather
```

---

## 📞 Support

**Häufig gestellte Fragen:**

**F: Wie deaktiviere ich Nachrichten?**
A: `/clearlag broadcast cleanup`

**F: Wie schnell räumt es auf?**
A: Standardmäßig alle 5 Minuten (konfigurierbar)

**F: Werden meine wichtigen Mobs geschützt?**
A: Ja! Named/getaggte Mobs sind geschützt

**F: Kann ich TPS sehen?**
A: Ja! `/clearlag status`

**F: Funktioniert es mit Discord?**
A: Ja! Webhooks sind konfigurierbar

---

## 🎉 Glückwunsch!

Sie haben ClearLag++ erfolgreich eingerichtet! 🚀

Der Server sollte nun:
- ✅ Automatisch aufgeräumt werden
- ✅ Performance monitored werden
- ✅ Admins benachrichtigt werden
- ✅ Discord-Integration haben (optional)

**Viel Erfolg und gutes Lag-Management!** 🌟

---

**ClearLag++ v1.0.0** | Quick Start Guide
