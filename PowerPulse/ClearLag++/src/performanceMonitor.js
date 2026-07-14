/**
 * ClearLag++ Performance Monitor
 * Überwacht Server-Performance Metriken in Echtzeit
 */

import { world, system, Player } from "@minecraft/server";
import { CLEARLAG_CONFIG } from "./config.js";

export class PerformanceMonitor {
  constructor(config) {
    this.config = config;
    this.metrics = {
      tps: 20,
      mspt: 0,
      entityCount: 0,
      itemCount: 0,
      mobCount: 0,
      playerCount: 0,
      memoryUsage: 0,
      memoryPercent: 0,
      timestamp: Date.now(),
      history: [] // Speichert letzte 100 Metriken-Sets
    };

    // Performance Alerts
    this.alerts = {
      tpsLow: false,
      msptHigh: false,
      entitiesHigh: false,
      itemsHigh: false,
      memoryHigh: false
    };

    // Tick-Tracking für TPS-Berechnung (wie in TPS.js)
    this.lastTickTime = Date.now();
    this.lastTick = system.currentTick; // Track actual server ticks
    this.tickCounter = 0;
    this.tpsHistory = []; // Letzte 100 TPS-Werte

    // MSPT Tracking
    this.msptHistory = [];
    this.lastMsptCheck = Date.now();
  }

  /**
   * Initialisiert den Performance Monitor
   */
  initialize() {
    console.log("§b[ClearLag++]§r Performance Monitor wird initialisiert...");

    // Starte Metrics-Updates
    if (this.config.monitoring.enabled) {
      this.startMetricsTracking();
    }

    console.log("§b[ClearLag++]§r Performance Monitor initialisiert!");
  }

  /**
   * Startet das Tracking von Performance-Metriken
   */
  startMetricsTracking() {
    const updateInterval = this.config.monitoring.tps.updateIntervalTicks || 20;

    system.runInterval(() => {
      this.updateMetrics();
      this.checkAlerts();
      this.recordHistory();
    }, updateInterval);
  }

  /**
   * Aktualisiert alle Performance-Metriken (mit Genauer TPS-Berechnung wie TPS.js)
   */
  updateMetrics() {
    const now = Date.now();

    // Genaue TPS-Berechnung (basierend auf TPS.js Methode)
    // TPS = 1000 * (Tick-Differenz) / (Zeit-Differenz in ms)
    const currentTick = system.currentTick;
    const tickDelta = currentTick - this.lastTick;
    const timeDelta = now - this.lastTickTime;

    if (timeDelta >= 1000) {
      // TPS wird alle Sekunde berechnet
      this.metrics.tps = (1000 * tickDelta) / timeDelta;
      this.metrics.tps = Math.round(this.metrics.tps * 100) / 100; // Auf 2 Dezimalstellen runden

      this.tpsHistory.push(this.metrics.tps);
      if (this.tpsHistory.length > 100) this.tpsHistory.shift();

      this.lastTickTime = now;
      this.lastTick = currentTick;
    }

    // MSPT Berechnung (Millisekunden pro Tick)
    // MSPT = 50ms / TPS (bei normalen 20 TPS = 50ms pro Tick)
    const avgTps = this.getAverageTPS();
    const msptValue = avgTps > 0 ? 50 / Math.max(avgTps, 0.1) : 50;
    this.metrics.mspt = Math.round(msptValue);
    this.msptHistory.push(this.metrics.mspt);
    if (this.msptHistory.length > 100) this.msptHistory.shift();

    // Entity Counts
    try {
      let entityCount = 0;
      let itemCount = 0;
      let mobCount = 0;
      let playerCount = 0;

      for (const entity of world.getDimension("minecraft:overworld").getEntities()) {
        entityCount++;

        if (entity.typeId === "minecraft:item") {
          itemCount++;
        } else if (entity instanceof Player) {
          playerCount++;
        } else if (
          !this.isPassiveMob(entity) &&
          !this.isHostileMob(entity) &&
          entity.typeId !== "minecraft:item"
        ) {
          // Andere Entitäten
        } else if (
          this.isPassiveMob(entity) ||
          this.isHostileMob(entity)
        ) {
          mobCount++;
        }
      }

      this.metrics.entityCount = entityCount;
      this.metrics.itemCount = itemCount;
      this.metrics.mobCount = mobCount;
      this.metrics.playerCount = playerCount;
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim Zählen von Entities:", error.message);
    }

    // Memory Usage (vereinfachte Schätzung)
    try {
      const entityBytes = this.metrics.entityCount * 1024; // Grobe Schätzung: 1KB pro Entity
      const itemBytes = this.metrics.itemCount * 512;
      const estimatedUsage = entityBytes + itemBytes;
      const estimatedTotal = 1024 * 1024 * 1024; // 1GB Annahme

      this.metrics.memoryUsage = Math.round(estimatedUsage / 1024 / 1024); // In MB
      this.metrics.memoryPercent = Math.round((estimatedUsage / estimatedTotal) * 100);
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim Tracking der Memory:", error.message);
    }

    this.metrics.timestamp = Date.now();
  }

  /**
   * Überprüft Performance-Alerts
   */
  checkAlerts() {
    const config = this.config.monitoring;

    // TPS-Alert
    const tpsAlert = this.metrics.tps < config.tps.criticalThreshold;
    if (tpsAlert !== this.alerts.tpsLow) {
      this.alerts.tpsLow = tpsAlert;
      if (tpsAlert) {
        this.sendAlert(
          `TPS kritisch niedrig: §c${this.metrics.tps}§7 TPS`,
          "tps"
        );
      }
    }

    // MSPT-Alert
    const msptAlert = this.metrics.mspt > config.mspt.criticalThreshold;
    if (msptAlert !== this.alerts.msptHigh) {
      this.alerts.msptHigh = msptAlert;
      if (msptAlert) {
        this.sendAlert(
          `MSPT zu hoch: §c${this.metrics.mspt}ms§7 pro Tick`,
          "mspt"
        );
      }
    }

    // Entity-Alert
    const entityAlert = this.metrics.entityCount > config.entities.criticalThreshold;
    if (entityAlert !== this.alerts.entitiesHigh) {
      this.alerts.entitiesHigh = entityAlert;
      if (entityAlert) {
        this.sendAlert(
          `Zu viele Entities: §c${this.metrics.entityCount}§7 Entities`,
          "entities"
        );
      }
    }

    // Item-Alert
    const itemAlert = this.metrics.itemCount > config.items.criticalThreshold;
    if (itemAlert !== this.alerts.itemsHigh) {
      this.alerts.itemsHigh = itemAlert;
      if (itemAlert) {
        this.sendAlert(
          `Zu viele Items: §c${this.metrics.itemCount}§7 Items`,
          "items"
        );
      }
    }

    // Memory-Alert
    const memoryAlert = this.metrics.memoryPercent > config.memory.criticalThreshold;
    if (memoryAlert !== this.alerts.memoryHigh) {
      this.alerts.memoryHigh = memoryAlert;
      if (memoryAlert) {
        this.sendAlert(
          `RAM-Auslastung kritisch: §c${this.metrics.memoryPercent}%`,
          "memory"
        );
      }
    }
  }

  /**
   * Sendet Performance-Alert an Admins
   */
  sendAlert(message, type) {
    const prefix = this.config.plugin.prefix;
    const fullMessage = `${prefix} §c⚠ Performance Alert: ${message}`;

    if (this.config.broadcasts.performanceWarning.enabled) {
      if (this.config.broadcasts.performanceWarning.showInConsole) {
        console.warn(fullMessage);
      }

      if (this.config.broadcasts.performanceWarning.showInChat) {
        this.broadcastToAdmins(fullMessage);
      }
    }
  }

  /**
   * Sendet eine Nachricht an alle Admins
   */
  broadcastToAdmins(message) {
    try {
      for (const player of world.getAllPlayers()) {
        if (this.isAdmin(player)) {
          player.sendMessage(message);
        }
      }
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim Admin-Broadcasting:", error.message);
    }
  }

  /**
   * Speichert aktuelle Metriken in der History
   */
  recordHistory() {
    this.metrics.history.push({
      tps: this.metrics.tps,
      mspt: this.metrics.mspt,
      entityCount: this.metrics.entityCount,
      itemCount: this.metrics.itemCount,
      mobCount: this.metrics.mobCount,
      playerCount: this.metrics.playerCount,
      memoryPercent: this.metrics.memoryPercent,
      timestamp: this.metrics.timestamp
    });

    // Begrenze History-Größe auf 1000 Einträge
    if (this.metrics.history.length > 1000) {
      this.metrics.history.shift();
    }
  }

  /**
   * Gibt aktuelle Metriken zurück
   */
  getMetrics() {
    return {
      current: {
        tps: this.metrics.tps,
        mspt: this.metrics.mspt,
        entityCount: this.metrics.entityCount,
        itemCount: this.metrics.itemCount,
        mobCount: this.metrics.mobCount,
        playerCount: this.metrics.playerCount,
        memoryUsage: this.metrics.memoryUsage,
        memoryPercent: this.metrics.memoryPercent
      },
      average: {
        tps: this.getAverageTPS(),
        mspt: this.getAverageMSPT()
      },
      alerts: this.alerts,
      timestamp: this.metrics.timestamp
    };
  }

  /**
   * Berechnet durchschnittliche TPS (letzte 100 Werte)
   */
  getAverageTPS() {
    if (this.tpsHistory.length === 0) return 20;
    const sum = this.tpsHistory.reduce((a, b) => a + b, 0);
    return Math.round((sum / this.tpsHistory.length) * 10) / 10;
  }

  /**
   * Berechnet durchschnittliches MSPT (letzte 100 Werte)
   */
  getAverageMSPT() {
    if (this.msptHistory.length === 0) return 50;
    const sum = this.msptHistory.reduce((a, b) => a + b, 0);
    return Math.round((sum / this.msptHistory.length) * 10) / 10;
  }

  /**
   * Gibt formatiertes Status-Report zurück
   */
  getStatusReport() {
    const metrics = this.getMetrics();
    return {
      title: "§b[ClearLag++]§r Server Performance Status",
      tps: `TPS: §${metrics.current.tps > 15 ? 'a' : metrics.current.tps > 10 ? 'e' : 'c'}${metrics.current.tps}§7/20`,
      mspt: `MSPT: §${metrics.current.mspt < 40 ? 'a' : metrics.current.mspt < 50 ? 'e' : 'c'}${metrics.current.mspt}ms`,
      entities: `Entities: §a${metrics.current.entityCount}`,
      items: `Items: §a${metrics.current.itemCount}`,
      mobs: `Mobs: §a${metrics.current.mobCount}`,
      players: `Spieler: §a${metrics.current.playerCount}`,
      memory: `RAM: §${metrics.current.memoryPercent < 80 ? 'a' : metrics.current.memoryPercent < 95 ? 'e' : 'c'}${metrics.current.memoryPercent}%`,
      avgTps: `Ø TPS (5min): §a${metrics.average.tps}`,
      avgMspt: `Ø MSPT (5min): §a${metrics.average.mspt}ms`
    };
  }

  /**
   * Hilfsfunktion: Überprüft ob Spieler Admin ist
   */
  isAdmin(player) {
    // Vereinfachte Admin-Überprüfung
    // In der Praxis würde man Tags oder Rank-Systeme verwenden
    return player.hasTag("clearlag:admin") || player.isOp?.();
  }

  /**
   * Überprüft ob eine Entity ein passives Mob ist
   */
  isPassiveMob(entity) {
    const passiveMobs = [
      "minecraft:pig", "minecraft:cow", "minecraft:sheep", "minecraft:chicken",
      "minecraft:horse", "minecraft:donkey", "minecraft:llama", "minecraft:parrot",
      "minecraft:cat", "minecraft:dog", "minecraft:rabbit", "minecraft:turtle",
      "minecraft:axolotl", "minecraft:bee", "minecraft:goat", "minecraft:allay",
      "minecraft:frog", "minecraft:camel"
    ];
    return passiveMobs.includes(entity.typeId);
  }

  /**
   * Überprüft ob eine Entity ein feindseliges Mob ist
   */
  isHostileMob(entity) {
    const hostileMobs = [
      "minecraft:zombie", "minecraft:skeleton", "minecraft:creeper", "minecraft:spider",
      "minecraft:enderman", "minecraft:cave_spider", "minecraft:slime", "minecraft:ghast",
      "minecraft:witch", "minecraft:husk", "minecraft:drowned", "minecraft:stray",
      "minecraft:wither_skeleton", "minecraft:guardian", "minecraft:elder_guardian",
      "minecraft:silverfish", "minecraft:endermite", "minecraft:vindicator", "minecraft:evoker",
      "minecraft:vex", "minecraft:ravager", "minecraft:phantom", "minecraft:pillager",
      "minecraft:zoglin", "minecraft:zombified_piglin", "minecraft:piglin_brute", "minecraft:warden"
    ];
    return hostileMobs.includes(entity.typeId);
  }

  /**
   * Exportiert Metriken als JSON für externe Systeme
   */
  exportMetrics() {
    return JSON.stringify(this.getMetrics(), null, 2);
  }
}
