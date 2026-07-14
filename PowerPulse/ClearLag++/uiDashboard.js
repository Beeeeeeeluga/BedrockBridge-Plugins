/**
 * ClearLag++ UI Dashboard
 * Server-UI basiertes Dashboard für Monitoring und Management
 */

import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { Player, system } from "@minecraft/server";

export class UIDashboard {
  constructor(config, entityManager, performanceMonitor, commandHandler, logger) {
    this.config = config;
    this.entityManager = entityManager;
    this.performanceMonitor = performanceMonitor;
    this.commandHandler = commandHandler;
    this.logger = logger;
  }

  /**
   * Öffnet das Haupt-Dashboard
   */
  async showMainDashboard(player) {
    const form = new ActionFormData()
      .title("§b[ClearLag++]§r Hauptmenü")
      .body("Wähle eine Option aus:");

    // Navigation Buttons
    form.button("📊 Performance Monitor", "textures/ui/magnifying_glass");
    form.button("🧹 Cleanup Manager", "textures/ui/trash");
    form.button("🎲 Entity Manager", "textures/ui/mob");
    form.button("⚙️ Einstellungen", "textures/ui/gear");
    form.button("📋 Logs anzeigen", "textures/ui/book");
    form.button("ℹ️ Informationen", "textures/ui/info");

    const response = await form.show(player);

    if (response.canceled) return;

    switch (response.selection) {
      case 0: await this.showPerformanceMonitor(player); break;
      case 1: await this.showCleanupManager(player); break;
      case 2: await this.showEntityManager(player); break;
      case 3: await this.showSettings(player); break;
      case 4: await this.showLogs(player); break;
      case 5: await this.showInformation(player); break;
    }
  }

  /**
   * Performance Monitor UI
   */
  async showPerformanceMonitor(player) {
    const metrics = this.performanceMonitor.getMetrics();
    const report = this.performanceMonitor.getStatusReport();

    const form = new ActionFormData()
      .title("§b📊 Performance Monitor")
      .body(
        `§7TPS: §${metrics.current.tps > 15 ? 'a' : metrics.current.tps > 10 ? 'e' : 'c'}${metrics.current.tps}§7/20\n` +
        `§7MSPT: §${metrics.current.mspt < 40 ? 'a' : metrics.current.mspt < 50 ? 'e' : 'c'}${metrics.current.mspt}ms\n` +
        `§7Entities: §a${metrics.current.entityCount}\n` +
        `§7Items: §a${metrics.current.itemCount}\n` +
        `§7Mobs: §a${metrics.current.mobCount}\n` +
        `§7Spieler: §a${metrics.current.playerCount}\n` +
        `§7RAM: §${metrics.current.memoryPercent < 80 ? 'a' : metrics.current.memoryPercent < 95 ? 'e' : 'c'}${metrics.current.memoryPercent}%`
      )
      .button("🔄 Aktualisieren", "textures/ui/refresh_light")
      .button("📈 Detaillierte Metriken", "textures/ui/bar_chart")
      .button("⚠️ Alerts", "textures/ui/bell")
      .button("⬅️ Zurück", "textures/ui/back");

    const response = await form.show(player);

    if (response.canceled || response.selection === 3) {
      await this.showMainDashboard(player);
    } else if (response.selection === 0) {
      await this.showPerformanceMonitor(player);
    } else if (response.selection === 1) {
      await this.showDetailedMetrics(player);
    } else if (response.selection === 2) {
      await this.showAlerts(player);
    }
  }

  /**
   * Detaillierte Metriken UI
   */
  async showDetailedMetrics(player) {
    const history = this.performanceMonitor.metrics.history.slice(-60); // Letzte 60 Einträge

    let metricsText = "§b════ DETAILLIERTE METRIKEN ════\n\n";

    // Durchschnitte berechnen
    if (history.length > 0) {
      const avgTps = (history.reduce((a, b) => a + b.tps, 0) / history.length).toFixed(2);
      const avgMspt = (history.reduce((a, b) => a + b.mspt, 0) / history.length).toFixed(2);
      const maxTps = Math.max(...history.map(h => h.tps));
      const minTps = Math.min(...history.map(h => h.tps));
      const maxEntities = Math.max(...history.map(h => h.entityCount));
      const maxItems = Math.max(...history.map(h => h.itemCount));

      metricsText += `§7Zeitraum: Letzte ${history.length} Messungen (~${(history.length / 20).toFixed(1)}s)\n\n`;
      metricsText += `§cTPS (Ticks Per Second):\n`;
      metricsText += `  §7Ø: §a${avgTps}\n`;
      metricsText += `  §7Max: §a${maxTps}\n`;
      metricsText += `  §7Min: §c${minTps}\n\n`;
      metricsText += `§cMSPT (Milliseconds Per Tick):\n`;
      metricsText += `  §7Ø: §a${avgMspt}ms\n\n`;
      metricsText += `§cEntity-Spitzen:\n`;
      metricsText += `  §7Max Entities: §a${maxEntities}\n`;
      metricsText += `  §7Max Items: §a${maxItems}\n`;
    }

    const form = new MessageFormData()
      .title("§b📈 Detaillierte Metriken")
      .body(metricsText)
      .button1("⬅️ Zurück")
      .button2("🔄 Aktualisieren");

    const response = await form.show(player);

    if (response.selection === 1) {
      await this.showDetailedMetrics(player);
    } else {
      await this.showPerformanceMonitor(player);
    }
  }

  /**
   * Cleanup Manager UI
   */
  async showCleanupManager(player) {
    const stats = this.entityManager.getStatistics();

    const form = new ActionFormData()
      .title("§b🧹 Cleanup Manager")
      .body(
        `§7Items entfernt: §a${stats.totalItemsRemoved}\n` +
        `§7Entities entfernt: §a${stats.totalEntitiesRemoved}\n` +
        `§7Passive Mobs: §a${stats.totalPassiveMobsRemoved}\n` +
        `§7Feindselige Mobs: §a${stats.totalHostileMobsRemoved}\n` +
        `§7Cleanup-Läufe: §a${stats.cleanupCount}`
      )
      .button("🚀 Cleanup ausführen", "textures/ui/play_button")
      .button("🐑 Passive Mobs entfernen", "textures/ui/mob")
      .button("💀 Feindselige Mobs entfernen", "textures/ui/redstone_dust")
      .button("🎲 Alle Mobs entfernen", "textures/ui/trash")
      .button("⬅️ Zurück", "textures/ui/back");

    const response = await form.show(player);

    if (response.canceled || response.selection === 4) {
      await this.showMainDashboard(player);
    } else {
      switch (response.selection) {
        case 0:
          await this.confirmCleanup(player, "all");
          break;
        case 1:
          await this.confirmKillMobs(player, "passive");
          break;
        case 2:
          await this.confirmKillMobs(player, "hostile");
          break;
        case 3:
          await this.confirmKillMobs(player, "all");
          break;
      }
    }
  }

  /**
   * Bestätigungs-Dialog für Cleanup
   */
  async confirmCleanup(player, type) {
    const messages = {
      all: "Möchtest du einen vollständigen Cleanup durchführen?",
      passive: "Möchtest du alle passiven Mobs entfernen?",
      hostile: "Möchtest du alle feindselige Mobs entfernen?",
      items: "Möchtest du alle Items aufräumen?"
    };

    const form = new MessageFormData()
      .title("⚠️ Bestätigung erforderlich")
      .body(messages[type] || messages.all)
      .button1("✅ Ja")
      .button2("❌ Nein");

    const response = await form.show(player);

    if (response.selection === 0) {
      this.commandHandler.commandCleanup(player, []);
      await this.showCleanupManager(player);
    } else {
      await this.showCleanupManager(player);
    }
  }

  /**
   * Bestätigungs-Dialog für Mob-Killing
   */
  async confirmKillMobs(player, type) {
    const form = new MessageFormData()
      .title("⚠️ Bestätigung erforderlich")
      .body(`Möchtest du alle ${type === "all" ? "" : type} Mobs entfernen?`)
      .button1("✅ Ja")
      .button2("❌ Nein");

    const response = await form.show(player);

    if (response.selection === 0) {
      this.commandHandler.commandKillMobs(player, [{ readString: () => type }]);
      await this.showCleanupManager(player);
    } else {
      await this.showCleanupManager(player);
    }
  }

  /**
   * Entity Manager UI
   */
  async showEntityManager(player) {
    const stats = this.entityManager.getStatistics();

    const form = new ActionFormData()
      .title("§b🎲 Entity Manager")
      .body(
        `§7Aktive Item-Countdowns: §a${stats.itemCountdownsActive}\n` +
        `§7Geschützte Death-Items: §a${stats.protectedDeathItems}\n` +
        `§7Redstone-Queue: §a${stats.redstoneQueueSize}`
      )
      .button("🧹 Items aufräumen", "textures/ui/trash")
      .button("⚙️ Optimierung starten", "textures/ui/gear")
      .button("📊 Detaillierte Infos", "textures/ui/bar_chart")
      .button("⬅️ Zurück", "textures/ui/back");

    const response = await form.show(player);

    if (response.canceled || response.selection === 3) {
      await this.showMainDashboard(player);
    } else if (response.selection === 0) {
      await this.confirmCleanup(player, "items");
    } else if (response.selection === 2) {
      await this.showEntityDetails(player);
    }
  }

  /**
   * Entity Details UI
   */
  async showEntityDetails(player) {
    const stats = this.entityManager.getStatistics();
    const metrics = this.performanceMonitor.getMetrics();

    const form = new MessageFormData()
      .title("§b📊 Entity Details")
      .body(
        `§7Gesamte Entities: §a${metrics.current.entityCount}\n` +
        `§7Items: §a${metrics.current.itemCount}\n` +
        `§7Mobs: §a${metrics.current.mobCount}\n` +
        `§7Spieler: §a${metrics.current.playerCount}\n\n` +
        `§7Manager Statistiken:\n` +
        `§7Item-Countdowns: §a${stats.itemCountdownsActive}\n` +
        `§7Geschützte Items: §a${stats.protectedDeathItems}\n` +
        `§7Redstone-Updates: §a${stats.redstoneQueueSize}`
      )
      .button1("⬅️ Zurück")
      .button2("🔄 Aktualisieren");

    const response = await form.show(player);

    if (response.selection === 1) {
      await this.showEntityDetails(player);
    } else {
      await this.showEntityManager(player);
    }
  }

  /**
   * Einstellungen UI
   */
  async showSettings(player) {
    const form = new ActionFormData()
      .title("§b⚙️ Einstellungen")
      .body("Verwalte ClearLag++-Einstellungen:");

    form.button("📢 Broadcast-Nachrichten", "textures/ui/bell")
      .button("📝 Logging", "textures/ui/book")
      .button("🌐 Discord", "textures/ui/world")
      .button("🔄 Cleanup-Einstellungen", "textures/ui/refresh")
      .button("⬅️ Zurück", "textures/ui/back");

    const response = await form.show(player);

    if (response.canceled || response.selection === 4) {
      await this.showMainDashboard(player);
    } else {
      switch (response.selection) {
        case 0: await this.showBroadcastSettings(player); break;
        case 1: await this.showLoggingSettings(player); break;
        case 2: await this.showDiscordSettings(player); break;
        case 3: await this.showCleanupSettings(player); break;
      }
    }
  }

  /**
   * Broadcast-Einstellungen UI
   */
  async showBroadcastSettings(player) {
    const toggle = this.commandHandler.broadcastToggle;

    const form = new ActionFormData()
      .title("§b📢 Broadcast-Einstellungen")
      .body("Wähle welche Nachrichten aktiviert sein sollen:");

    form.button(`Cleanup-Nachrichten ${toggle.cleanup ? "§a✔" : "§c✗"}`, "textures/ui/bell")
      .button(`Performance-Nachrichten ${toggle.performance ? "§a✔" : "§c✗"}`, "textures/ui/bell")
      .button(`Event-Nachrichten ${toggle.events ? "§a✔" : "§c✗"}`, "textures/ui/bell")
      .button("⬅️ Zurück", "textures/ui/back");

    const response = await form.show(player);

    if (response.canceled || response.selection === 3) {
      await this.showSettings(player);
    } else {
      switch (response.selection) {
        case 0:
          toggle.cleanup = !toggle.cleanup;
          this.commandHandler.sendSuccess(player, `Cleanup-Nachrichten: ${toggle.cleanup ? "§aAN" : "§cAUS"}`);
          break;
        case 1:
          toggle.performance = !toggle.performance;
          this.commandHandler.sendSuccess(player, `Performance-Nachrichten: ${toggle.performance ? "§aAN" : "§cAUS"}`);
          break;
        case 2:
          toggle.events = !toggle.events;
          this.commandHandler.sendSuccess(player, `Event-Nachrichten: ${toggle.events ? "§aAN" : "§cAUS"}`);
          break;
      }
      await this.showBroadcastSettings(player);
    }
  }

  /**
   * Logs UI
   */
  async showLogs(player) {
    const stats = this.logger.getLogStatistics();
    const recentLogs = this.logger.getRecentLogs(5);

    let logText = "§b════ RECENT LOGS ════\n\n";
    for (const log of recentLogs) {
      const color = this.logger.getLogColor(log.level);
      logText += `${color}[${log.level.toUpperCase()}]§r ${log.message}\n`;
    }

    const form = new ActionFormData()
      .title("§b📋 Logs")
      .body(
        `§7Total Logs: §a${stats.total}\n` +
        `§7Errors: §c${stats.errors}\n` +
        `§7Warnings: §e${stats.warnings}\n` +
        `§7Info: §b${stats.byLevel.info || 0}\n\n` +
        logText
      )
      .button("📊 Log-Bericht", "textures/ui/bar_chart")
      .button("🧹 Alte Logs löschen", "textures/ui/trash")
      .button("💾 Logs exportieren", "textures/ui/book")
      .button("⬅️ Zurück", "textures/ui/back");

    const response = await form.show(player);

    if (response.canceled || response.selection === 3) {
      await this.showMainDashboard(player);
    } else {
      switch (response.selection) {
        case 0:
          const report = this.logger.generateReport();
          player.sendMessage(report);
          break;
        case 1:
          this.logger.clearOldLogs(24);
          this.commandHandler.sendSuccess(player, "Alte Logs gelöscht!");
          break;
        case 2:
          const exported = this.logger.exportLogs();
          player.sendMessage("§7Logs exportiert (sieh oben):");
          // In echter Implementierung würde hier eine Download-Option sein
          break;
      }
      await this.showLogs(player);
    }
  }

  /**
   * Informationen UI
   */
  async showInformation(player) {
    const status = {
      name: this.config.plugin.name,
      version: this.config.plugin.version,
      enabled: this.config.plugin.enabled,
      uptime: system.currentTick / 20
    };

    const form = new MessageFormData()
      .title("§bℹ️ Informationen")
      .body(
        `§b${status.name} v${status.version}\n\n` +
        `§7Status: ${status.enabled ? "§a✔ Aktiviert" : "§c✗ Deaktiviert"}\n` +
        `§7Uptime: §a${(status.uptime / 60 / 60).toFixed(2)}h\n\n` +
        `§7Ein leistungsstarkes Lag-Management Plugin\n` +
        `§7für Minecraft Bedrock Edition.\n\n` +
        `§7Features:\n` +
        `§7• Intelligentes Entity-Management\n` +
        `§7• Performance-Monitoring (TPS, MSPT)\n` +
        `§7• Redstone-Optimierung\n` +
        `§7• Discord-Integration\n` +
        `§7• Umfassendes Logging\n`
      )
      .button1("⬅️ Zurück")
      .button2("💬 Support");

    const response = await form.show(player);

    if (response.selection === 0) {
      await this.showMainDashboard(player);
    }
  }

  /**
   * Placeholder-Methoden für nicht implementierte UI-Teile
   */
  async showLoggingSettings(player) {
    this.commandHandler.sendInfo(player, "Logging-Einstellungen sind im Code zu ändern");
    await this.showSettings(player);
  }

  async showDiscordSettings(player) {
    this.commandHandler.sendInfo(player, "Discord-Einstellungen sind im Code zu ändern");
    await this.showSettings(player);
  }

  async showCleanupSettings(player) {
    this.commandHandler.sendInfo(player, "Cleanup-Einstellungen sind im Code zu ändern");
    await this.showSettings(player);
  }

  async showAlerts(player) {
    const metrics = this.performanceMonitor.getMetrics();
    let alertText = "§b════ AKTIVE ALERTS ════\n\n";

    if (!Object.values(metrics.alerts).some(v => v)) {
      alertText += "§a✔ Keine Alerts aktiv!";
    } else {
      if (metrics.alerts.tpsLow) alertText += "§c• TPS kritisch niedrig\n";
      if (metrics.alerts.msptHigh) alertText += "§c• MSPT zu hoch\n";
      if (metrics.alerts.entitiesHigh) alertText += "§c• Zu viele Entities\n";
      if (metrics.alerts.itemsHigh) alertText += "§c• Zu viele Items\n";
      if (metrics.alerts.memoryHigh) alertText += "§c• RAM-Auslastung kritisch\n";
    }

    const form = new MessageFormData()
      .title("§b⚠️ Alerts")
      .body(alertText)
      .button1("⬅️ Zurück")
      .button2("🔄 Aktualisieren");

    const response = await form.show(player);

    if (response.selection === 1) {
      await this.showAlerts(player);
    } else {
      await this.showPerformanceMonitor(player);
    }
  }
}
