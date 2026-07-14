# ClearLag++ API Guide

Umfassende Dokumentation für die Entwicklung mit ClearLag++ APIs und Integration mit anderen Plugins.

## 🔌 Zugriff auf ClearLag++ Instance

```javascript
// Import der Main-Klasse
import { clearlagPlugin } from "./src/main.js";

// Zugriff auf Plugin-Instance
if (clearlagPlugin && clearlagPlugin.isInitialized) {
  // Plugin ist bereit
  const manager = clearlagPlugin.entityManager;
  const monitor = clearlagPlugin.performanceMonitor;
  const commands = clearlagPlugin.commandHandler;
  const logger = clearlagPlugin.logger;
}
```

## 📦 Module & APIs

### 1. EntityManager API

```javascript
const manager = clearlagPlugin.entityManager;

// ============= CLEANUP OPERATIONEN =============

// Manuellen Cleanup durchführen
const result = await manager.performFullCleanup();
// Returns: {
//   itemsRemoved: number,
//   entitiesRemoved: number,
//   passiveMobsRemoved: number,
//   hostileMobsRemoved: number,
//   duration: number (in ms)
// }

// Spezifische Mob-Typen entfernen
const removed = await manager.killMobs("hostile");  // "all" | "hostile" | "passive"
// Returns: number of entities removed

// ============= SCHUTZ-SYSTEME =============

// Item nach Spieler-Tod schützen
manager.protectDeathItems(entity, playerId);

// Item-Countdown registrieren
manager.registerItemCountdown(itemEntity);

// ============= INFORMATION =============

// Statistiken abrufen
const stats = manager.getStatistics();
// Returns: {
//   totalItemsRemoved: number,
//   totalEntitiesRemoved: number,
//   totalPassiveMobsRemoved: number,
//   totalHostileMobsRemoved: number,
//   lastCleanupTime: string (ISO),
//   cleanupCount: number,
//   itemCountdownsActive: number,
//   redstoneQueueSize: number,
//   protectedDeathItems: number
// }
```

### 2. PerformanceMonitor API

```javascript
const monitor = clearlagPlugin.performanceMonitor;

// ============= METRIKEN =============

// Aktuelle Metriken abrufen
const metrics = monitor.getMetrics();
// Returns: {
//   current: {
//     tps: number,
//     mspt: number,
//     entityCount: number,
//     itemCount: number,
//     mobCount: number,
//     playerCount: number,
//     memoryUsage: number (MB),
//     memoryPercent: number
//   },
//   average: {
//     tps: number,      // Letzte 100 Messungen
//     mspt: number
//   },
//   alerts: {
//     tpsLow: boolean,
//     msptHigh: boolean,
//     entitiesHigh: boolean,
//     itemsHigh: boolean,
//     memoryHigh: boolean
//   },
//   timestamp: number (ms)
// }

// Status-Report abrufen
const report = monitor.getStatusReport();
// Returns: {
//   title: string,
//   tps: string (formatted),
//   mspt: string (formatted),
//   entities: string,
//   items: string,
//   mobs: string,
//   players: string,
//   memory: string,
//   avgTps: string,
//   avgMspt: string
// }

// ============= DURCHSCHNITTE =============

// Durchschnitts-TPS der letzten 100 Messungen
const avgTps = monitor.getAverageTPS();

// Durchschnitts-MSPT der letzten 100 Messungen
const avgMspt = monitor.getAverageMSPT();

// ============= SPEZIELLE BERECHNUNGEN =============

// Nur TPS berechnen
const tps = monitor.metrics.tps;

// Nur Entity-Count
const entities = monitor.metrics.entityCount;

// Memory-Prozent
const memPercent = monitor.metrics.memoryPercent;
```

### 3. CommandHandler API

```javascript
const commands = clearlagPlugin.commandHandler;

// ============= PERMISSION CHECKING =============

// Überprüfe Admin-Permission
const isAdmin = commands.checkPermission(player, "admin");

// Überprüfe Mod-Permission
const isMod = commands.checkPermission(player, "mod");

// ============= NACHRICHTEN SENDEN =============

// Error-Nachricht
commands.sendError(player, "Fehlertext");
// Ausgang: "[ClearLag++] ❌ Fehlertext"

// Success-Nachricht
commands.sendSuccess(player, "Erfolgreicher Text");
// Ausgang: "[ClearLag++] ✔ Erfolgreicher Text"

// Info-Nachricht
commands.sendInfo(player, "Info-Text");
// Ausgang: "[ClearLag++] ℹ Info-Text"

// ============= COMMAND AUSFÜHRUNG =============

// Cleanup-Command aufrufen
await commands.commandCleanup(player, []);

// Status-Command aufrufen
commands.commandStatus(player, []);

// Stats-Command aufrufen
commands.commandStats(player, []);

// Mobs entfernen
await commands.commandKillMobs(player, [
  { readString: () => "hostile" }  // "all" | "hostile" | "passive"
]);

// ============= BROADCAST =============

// Toggle-Werte abrufen
const toggles = commands.broadcastToggle;
// { cleanup: boolean, performance: boolean, events: boolean }

// Toggle setzen
commands.broadcastToggle.cleanup = false;
```

### 4. Logger API

```javascript
const logger = clearlagPlugin.logger;

// ============= LOGGING =============

// Debug-Log
logger.debug("Debug-Nachricht", { context: "data" });

// Info-Log
logger.info("Information");

// Warning-Log
logger.warn("Warnung!");

// Error-Log
logger.error("Fehler!", new Error("Error object"));

// Success-Log
logger.success("Erfolgreich!");

// ============= LOG-ABRUFEN =============

// Alle Logs abrufen
const allLogs = logger.getLogs();

// Gefilterte Logs
const errorLogs = logger.getLogs({
  level: "error",
  startTime: new Date(Date.now() - 3600000)  // Letzte Stunde
});

// Neueste N Logs
const recent = logger.getRecentLogs(50);

// Nach Level filtern
const warnings = logger.getLogsByLevel("warn");

// ============= LOG-STATISTIKEN =============

// Statistiken abrufen
const stats = logger.getLogStatistics();
// Returns: {
//   total: number,
//   byLevel: { debug: number, info: number, warn: number, error: number },
//   errors: number,
//   warnings: number,
//   oldest: string (ISO),
//   newest: string (ISO)
// }

// Report generieren
const report = logger.generateReport();

// ============= LOG-VERWALTUNG =============

// Alte Logs löschen (älter als X Stunden)
logger.clearOldLogs(24);

// Alle Logs löschen
logger.clearAllLogs();

// Logs exportieren
const json = logger.exportLogs();

// Formatierte Logs für UI
const formatted = logger.getFormattedLogs(20);
```

### 5. DiscordIntegration API

```javascript
const discord = clearlagPlugin.discordIntegration;

// ============= NACHRICHTEN SENDEN =============

// Text-Nachricht
discord.sendMessage("Nachrichtentext", "Author Name");

// Embed senden
discord.sendEmbed({
  title: "Titel",
  description: "Beschreibung",
  color: 0x00FF00,  // Hex-Farbe (Dezimal)
  fields: [
    {
      name: "Feldname",
      value: "Feldwert",
      inline: true
    }
  ],
  timestamp: new Date().toISOString()
}, "webhookType");

// ============= VORDEFINIERTE EMBEDS =============

// Cleanup-Notification
discord.sendCleanupNotification(items, entities, passive, hostile);

// Performance-Alert
discord.sendPerformanceAlert(metrics);

// Command-Log
discord.sendCommandLog(player, command, success);

// ============= STATUS & DEBUG =============

// Discord-Status abrufen
const status = discord.getStatus();
// Returns: {
//   enabled: boolean,
//   ready: boolean,
//   useBridgeDirect: boolean,
//   useWebhooks: boolean,
//   messageQueueSize: number
// }

// Test-Nachricht senden
discord.sendTestMessage();
```

### 6. UIDashboard API

```javascript
const dashboard = clearlagPlugin.uiDashboard;

// ============= DASHBOARD ÖFFNEN =============

// Hauptmenü öffnen
await dashboard.showMainDashboard(player);

// Performance Monitor öffnen
await dashboard.showPerformanceMonitor(player);

// Cleanup Manager öffnen
await dashboard.showCleanupManager(player);

// Entity Manager öffnen
await dashboard.showEntityManager(player);

// Einstellungen öffnen
await dashboard.showSettings(player);

// Logs anzeigen
await dashboard.showLogs(player);
```

## 🔗 Event-Systeme

### Entity-Events

```javascript
// Wird ausgelöst wenn Entity stirbt
world.afterEvents.entityDie.subscribe((event) => {
  const entity = event.deadEntity;
  if (entity.typeId === "minecraft:item") {
    // Item-spezifische Logik
  }
});

// Wird ausgelöst wenn Entity spawnt
world.afterEvents.entitySpawn.subscribe((event) => {
  const entity = event.entity;
  // Wird automatisch von EntityManager verfolgt
});
```

### Chat-Commands

```javascript
// Wird ausgelöst bei Chat-Input
world.afterEvents.chatSend.subscribe((event) => {
  if (event.message.startsWith("/clearlag")) {
    // Wird automatisch vom CommandHandler verarbeitet
  }
});
```

## 💾 Datenstrukturen

### Statistics Object
```javascript
{
  totalItemsRemoved: number,
  totalEntitiesRemoved: number,
  totalPassiveMobsRemoved: number,
  totalHostileMobsRemoved: number,
  lastCleanupTime: string | null,
  cleanupCount: number,
  itemCountdownsActive: number,
  redstoneQueueSize: number,
  protectedDeathItems: number
}
```

### Metrics Object
```javascript
{
  current: {
    tps: number,          // 0-20
    mspt: number,         // Millisekunden pro Tick
    entityCount: number,
    itemCount: number,
    mobCount: number,
    playerCount: number,
    memoryUsage: number,  // MB
    memoryPercent: number // 0-100
  },
  average: {
    tps: number,
    mspt: number
  },
  alerts: {
    tpsLow: boolean,
    msptHigh: boolean,
    entitiesHigh: boolean,
    itemsHigh: boolean,
    memoryHigh: boolean
  }
}
```

### Log Entry Object
```javascript
{
  timestamp: string,      // ISO 8601
  level: string,          // "debug" | "info" | "warn" | "error"
  message: string,
  context: any,
  fullMessage: string
}
```

## 🎮 Integration mit anderen Plugins

### Beispiel: Custom Admin Command

```javascript
import { clearlagPlugin } from "./src/main.js";

function setupCustomCommand() {
  bridge.bedrockCommands.registerAdminCommand(
    "cleanup_now",
    async (player) => {
      const result = await clearlagPlugin.entityManager.performFullCleanup();
      player.sendMessage(`§aCleanup: ${result.itemsRemoved} Items entfernt!`);
    },
    "Erzwingt sofortiges Cleanup"
  );
}
```

### Beispiel: Performance-Monitoring

```javascript
system.runInterval(() => {
  const metrics = clearlagPlugin.performanceMonitor.getMetrics();

  if (metrics.current.tps < 5) {
    // Führe automatischen Cleanup durch
    clearlagPlugin.entityManager.performFullCleanup();
  }
}, 20);
```

### Beispiel: Discord Notifications

```javascript
// Bei Custom Event
clearlagPlugin.discordIntegration.sendMessage(
  "Custom Event ausgelöst!",
  "My Plugin"
);
```

## ⚙️ Konfiguration zur Runtime ändern

```javascript
// Konfigurationswerte auslesen
const config = clearlagPlugin.config;
console.log(config.autoCleanup.enabled);

// Einstellungen ändern (im RAM)
clearlagPlugin.config.autoCleanup.items.delayTicks = 8000;

// HINWEIS: Änderungen werden nicht persistent!
// Um persistent zu speichern, muss die Database verwendet werden
```

## 🧪 Testing & Debugging

### Debug Logs aktivieren

```javascript
clearlagPlugin.logger.info("Testing", { debug: true });

// Oder in config.js:
plugin: {
  debugMode: true,
  logLevel: "debug"
}
```

### Performance testen

```javascript
const before = system.currentTick;
const result = await clearlagPlugin.entityManager.performFullCleanup();
const duration = system.currentTick - before;

console.log(`Cleanup dauerte ${duration} Ticks`);
```

### Metrics in Console ausgeben

```javascript
setInterval(() => {
  const metrics = clearlagPlugin.performanceMonitor.getMetrics();
  console.log(JSON.stringify(metrics, null, 2));
}, 20);
```

## 🔐 Sicherheit

### Permission Levels
```javascript
// Admin Level (höchste Berechtigung)
commands.checkPermission(player, "admin")

// Mod Level (mittlere Berechtigung)
commands.checkPermission(player, "mod")

// User Level (alle können)
commands.checkPermission(player, "user")
```

### Geschützte Entities

Folgende Entities werden automatisch geschützt:
- Named/benannte Mobs (haben nameTag)
- Tamed/gezähmte Mobs (mit "minecraft:tameable" tag)
- Mit Scoreboard-Tags versehene Mobs

## 📊 Erweiterte Konfiguration

```javascript
// In config.js können folgende Dinge konfiguriert werden:

// Auto-Cleanup Verzögerungen (in Ticks)
autoCleanup.items.delayTicks
autoCleanup.entities.passiveMobs.delayTicks
autoCleanup.entities.hostileMobs.delayTicks
autoCleanup.entities.otherEntities.delayTicks

// Performance-Schwellenwerte
monitoring.tps.warnThreshold
monitoring.tps.criticalThreshold
monitoring.mspt.warnThreshold
monitoring.mspt.criticalThreshold

// Limits pro Chunk
mobManagement.chunkLimiter.maxPerChunk
mobManagement.chunkLimiter.maxPassivePerChunk
mobManagement.chunkLimiter.maxHostilePerChunk

// Broadcasts
broadcasts.cleanupMessage.enabled
broadcasts.performanceWarning.enabled
broadcasts.statusBroadcast.enabled
```

## 📚 Weitere Ressourcen

- **README.md**: Feature-Übersicht
- **INSTALLATION.md**: Setup-Anleitung
- **config.js**: Ausführliche Konfigurationsoptionen
- **Quellcode**: src/*.js für Implementation Details

---

**API Guide Ende** 📖
