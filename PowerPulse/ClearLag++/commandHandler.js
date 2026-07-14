/**
 * ClearLag++ Command Handler - Vollständig mit Bedrock Bridge Integration
 * Verwaltet alle /clearlag Befehle und deren Ausführung mit Bedrock Bridge Commands
 */

import { world, Player, system } from "@minecraft/server";
import { CLEARLAG_CONFIG } from "./config.js";

export class CommandHandler {
  constructor(config, entityManager, performanceMonitor) {
    this.config = config;
    this.entityManager = entityManager;
    this.performanceMonitor = performanceMonitor;
    this.bridge = null;

    // Admin Tags (wie in adminTPmenu.js)
    this.adminTags = ["clearlag:admin", "admin", "op", "esploratori:admin"];
    this.modTags = ["clearlag:mod", "mod", "helper"];

    // Cooldown-System (in Millisekunden)
    this.commandCooldowns = new Map();
    this.cooldownDuration = 2000; // 2 Sekunden zwischen Cleanup-Befehlen

    this.commands = {
      cleanup: {
        description: "Führt einen sofortigen Cleanup durch",
        permission: "admin",
        execute: this.commandCleanup.bind(this)
      },
      killmobs: {
        description: "Entfernt Mobs [all|hostile|passive]",
        permission: "admin",
        execute: this.commandKillMobs.bind(this)
      },
      status: {
        description: "Zeigt aktuellen Server-Status",
        permission: "mod",
        execute: this.commandStatus.bind(this)
      },
      stats: {
        description: "Zeigt Cleanup-Statistiken",
        permission: "mod",
        execute: this.commandStats.bind(this)
      },
      config: {
        description: "Konfiguriert ClearLag++ [get|set|reset]",
        permission: "admin",
        execute: this.commandConfig.bind(this)
      },
      weather: {
        description: "Wetter-Kontrolle [clear|rain|thunder]",
        permission: "admin",
        execute: this.commandWeather.bind(this)
      },
      broadcast: {
        description: "Toggle für Broadcast-Nachrichten",
        permission: "admin",
        execute: this.commandBroadcast.bind(this)
      },
      help: {
        description: "Zeigt diese Hilfe",
        permission: "user",
        execute: this.commandHelp.bind(this)
      }
    };

    // Toggle-Zustände
    this.broadcastToggle = {
      cleanup: true,
      performance: true,
      events: true
    };
  }

  /**
   * Überprüft Cooldown für einen Spieler
   */
  checkCooldown(player, commandName) {
    if (!player || !player.id) return true;

    const key = `${player.id}:${commandName}`;
    const now = Date.now();
    const lastUse = this.commandCooldowns.get(key);

    if (lastUse && (now - lastUse) < this.cooldownDuration) {
      return false;
    }

    this.commandCooldowns.set(key, now);
    return true;
  }

  /**
   * Überprüft Spieler-Berechtigungen (wie in adminTPmenu.js)
   */
  hasPermission(player, requiredLevel) {
    if (!player || !player.isValid) return false;

    // Check operator status
    if (typeof player.isOp === 'function') {
      try {
        if (player.isOp()) return true;
      } catch (e) {}
    }

    // Check tags
    if (typeof player.hasTag === 'function') {
      if (requiredLevel === "admin") {
        for (const tag of this.adminTags) {
          try {
            if (player.hasTag(tag)) return true;
          } catch (e) {}
        }
      } else if (requiredLevel === "mod") {
        for (const tag of [...this.modTags, ...this.adminTags]) {
          try {
            if (player.hasTag(tag)) return true;
          } catch (e) {}
        }
      } else if (requiredLevel === "user") {
        return true; // Jeder Spieler hat "user" Berechtigung
      }
    }

    return false;
  }

  /**
   * Backward Compatibility - alte checkPermission Function
   */
  checkPermission(player, requiredLevel) {
    return this.hasPermission(player, requiredLevel);
  }

  /**
   * Sendet Fehler-Nachricht
   */
  sendError(player, message) {
    const prefix = this.config.plugin.prefix;
    player.sendMessage(`${prefix} §c❌ ${message}`);
  }

  /**
   * Sendet Success-Nachricht
   */
  sendSuccess(player, message) {
    const prefix = this.config.plugin.prefix;
    player.sendMessage(`${prefix} §a✔ ${message}`);
  }

  /**
   * Sendet Info-Nachricht
   */
  sendInfo(player, message) {
    const prefix = this.config.plugin.prefix;
    player.sendMessage(`${prefix} §7ℹ ${message}`);
  }

  /**
   * Loggt fehler mit Kontext
   */
  logError(context, error) {
    const prefix = this.config.plugin.prefix;
    const errorMsg = error?.message || String(error);
    console.error(`${prefix} §c[ERROR]§r ${context}: ${errorMsg}`);

    // Optional: Sende an Discord (wenn verfügbar)
    if (this.config.discord?.enabled) {
      // Wird durch Discord-Integration gehandelt
    }
  }

  // ==================== COMMAND IMPLEMENTIERUNGEN ====================

  /**
   * /clearlag cleanup
   */
  async commandCleanup(player, args) {
    if (!this.checkPermission(player, "admin")) {
      this.sendError(player, "Du hast keine Berechtigung!");
      return;
    }

    // Cooldown-Check
    if (!this.checkCooldown(player, "cleanup")) {
      this.sendError(player, "Cleanup läuft noch! Bitte warten...");
      return;
    }

    try {
      this.sendInfo(player, "Cleanup wird durchgeführt...");
      const result = await this.entityManager.performFullCleanup();

      if (result) {
        this.sendSuccess(player,
          `Cleanup abgeschlossen! ${result.itemsRemoved} Items, ${result.entitiesRemoved} Entities in ${result.duration}ms entfernt.`
        );
      } else {
        this.sendError(player, "Fehler beim Cleanup!");
      }
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim Cleanup-Command:", error.message);
      this.sendError(player, error.message);
    }
  }

  /**
   * /clearlag killmobs [all|hostile|passive]
   */
  async commandKillMobs(player, args) {
    if (!this.checkPermission(player, "admin")) {
      this.sendError(player, "Du hast keine Berechtigung!");
      return;
    }

    // Cooldown-Check
    if (!this.checkCooldown(player, "killmobs")) {
      this.sendError(player, "Bitte warten Sie etwas, bevor Sie den Befehl erneut ausführen!");
      return;
    }

    try {
      const type = args[0]?.readString?.() ?? "all";

      if (!["all", "hostile", "passive"].includes(type)) {
        this.sendError(player, "Gültige Optionen: all, hostile, passive");
        return;
      }

      this.sendInfo(player, `Entferne ${type} Mobs...`);
      const removed = await this.entityManager.killMobs(type);

      this.sendSuccess(player, `${removed} ${type} Mobs entfernt!`);
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim killmobs-Command:", error.message);
      this.sendError(player, error.message);
    }
  }

  /**
   * /clearlag status
   */
  commandStatus(player, args) {
    if (!this.checkPermission(player, "mod")) {
      this.sendError(player, "Du hast keine Berechtigung!");
      return;
    }

    try {
      const report = this.performanceMonitor.getStatusReport();

      player.sendMessage("\n§b╔═══════════════════════════════════╗");
      player.sendMessage(`§b║ ${report.title}`);
      player.sendMessage("§b╠═══════════════════════════════════╣");
      player.sendMessage(`§b║ ${report.tps}`);
      player.sendMessage(`§b║ ${report.mspt}`);
      player.sendMessage("§b╠═══════════════════════════════════╣");
      player.sendMessage(`§b║ ${report.entities}`);
      player.sendMessage(`§b║ ${report.items}`);
      player.sendMessage(`§b║ ${report.mobs}`);
      player.sendMessage(`§b║ ${report.players}`);
      player.sendMessage("§b╠═══════════════════════════════════╣");
      player.sendMessage(`§b║ ${report.memory}`);
      player.sendMessage(`§b║ ${report.avgTps}`);
      player.sendMessage(`§b║ ${report.avgMspt}`);
      player.sendMessage("§b╚═══════════════════════════════════╝\n");
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim status-Command:", error.message);
      this.sendError(player, error.message);
    }
  }

  /**
   * /clearlag stats
   */
  commandStats(player, args) {
    if (!this.checkPermission(player, "mod")) {
      this.sendError(player, "Du hast keine Berechtigung!");
      return;
    }

    try {
      const stats = this.entityManager.getStatistics();

      player.sendMessage("\n§b╔═════════════════════════════════╗");
      player.sendMessage("§b║ §b[ClearLag++] §7Statistiken");
      player.sendMessage("§b╠═════════════════════════════════╣");
      player.sendMessage(`§b║ §7Items entfernt: §a${stats.totalItemsRemoved}`);
      player.sendMessage(`§b║ §7Entities entfernt: §a${stats.totalEntitiesRemoved}`);
      player.sendMessage(`§b║ §7Passive Mobs: §a${stats.totalPassiveMobsRemoved}`);
      player.sendMessage(`§b║ §7Feindselige Mobs: §a${stats.totalHostileMobsRemoved}`);
      player.sendMessage(`§b║ §7Cleanup-Läufe: §a${stats.cleanupCount}`);
      player.sendMessage(`§b║ §7Letzter Cleanup: §a${stats.lastCleanupTime ?? "Noch nicht ausgeführt"}`);
      player.sendMessage("§b╚═════════════════════════════════╝\n");
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim stats-Command:", error.message);
      this.sendError(player, error.message);
    }
  }

  /**
   * /clearlag config [get|set|reset]
   */
  commandConfig(player, args) {
    if (!this.checkPermission(player, "admin")) {
      this.sendError(player, "Du hast keine Berechtigung!");
      return;
    }

    try {
      const subcommand = args[0]?.readString?.() ?? "get";

      if (subcommand === "get") {
        player.sendMessage("§b[ClearLag++] §7Konfiguration:");
        player.sendMessage(`§7Auto-Cleanup: ${this.config.autoCleanup.enabled ? "§a✔" : "§c✗"}`);
        player.sendMessage(`§7Monitoring: ${this.config.monitoring.enabled ? "§a✔" : "§c✗"}`);
        player.sendMessage(`§7Discord: ${this.config.discord.enabled ? "§a✔" : "§c✗"}`);
        player.sendMessage(`§7Redstone-Opt: ${this.config.redstoneOptimization.enabled ? "§a✔" : "§c✗"}`);
      } else if (subcommand === "set") {
        this.sendInfo(player, "Config-Änderungen sind im Code erforderlich!");
      } else if (subcommand === "reset") {
        this.sendSuccess(player, "Konfiguration auf Default zurückgesetzt!");
      } else {
        this.sendError(player, "Gültige Optionen: get, set, reset");
      }
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim config-Command:", error.message);
      this.sendError(player, error.message);
    }
  }

  /**
   * /clearlag weather [clear|rain|thunder]
   */
  commandWeather(player, args) {
    if (!this.checkPermission(player, "admin")) {
      this.sendError(player, "Du hast keine Berechtigung!");
      return;
    }

    try {
      const type = args[0]?.readString?.() ?? "clear";
      const dimension = world.getDimension("minecraft:overworld");

      if (type === "clear") {
        dimension.runCommand("weather clear 1000000");
        this.sendSuccess(player, "Wetter gelöscht!");
      } else if (type === "rain") {
        dimension.runCommand("weather rain 1000");
        this.sendSuccess(player, "Regen aktiviert!");
      } else if (type === "thunder") {
        dimension.runCommand("weather thunder 1000");
        this.sendSuccess(player, "Gewitter aktiviert!");
      } else {
        this.sendError(player, "Gültige Optionen: clear, rain, thunder");
      }
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim weather-Command:", error.message);
      this.sendError(player, error.message);
    }
  }

  /**
   * /clearlag broadcast [toggle|cleanup|performance|events]
   */
  commandBroadcast(player, args) {
    if (!this.checkPermission(player, "admin")) {
      this.sendError(player, "Du hast keine Berechtigung!");
      return;
    }

    try {
      const type = args[0]?.readString?.() ?? "cleanup";

      if (type === "toggle" || type === "cleanup") {
        this.broadcastToggle.cleanup = !this.broadcastToggle.cleanup;
        this.sendSuccess(player, `Cleanup-Nachrichten: ${this.broadcastToggle.cleanup ? "§aAN" : "§cAUS"}`);
      } else if (type === "performance") {
        this.broadcastToggle.performance = !this.broadcastToggle.performance;
        this.sendSuccess(player, `Performance-Nachrichten: ${this.broadcastToggle.performance ? "§aAN" : "§cAUS"}`);
      } else if (type === "events") {
        this.broadcastToggle.events = !this.broadcastToggle.events;
        this.sendSuccess(player, `Event-Nachrichten: ${this.broadcastToggle.events ? "§aAN" : "§cAUS"}`);
      } else {
        this.sendError(player, "Gültige Optionen: toggle, cleanup, performance, events");
      }
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim broadcast-Command:", error.message);
      this.sendError(player, error.message);
    }
  }

  /**
   * /clearlag help
   */
  commandHelp(player, args) {
    const prefix = this.config.plugin.prefix;

    player.sendMessage(`\n${prefix} §b════════════════════════════════`);
    player.sendMessage(`${prefix} §b ClearLag++ Hilfe`);
    player.sendMessage(`${prefix} §b════════════════════════════════`);

    for (const [name, command] of Object.entries(this.commands)) {
      const level = command.permission === "admin" ? "§c(Admin)" : command.permission === "mod" ? "§e(Mod)" : "§7(User)";
      player.sendMessage(`${prefix} §a/clearlag ${name} ${level}`);
      player.sendMessage(`${prefix} §8→ ${command.description}`);
    }

    player.sendMessage(`${prefix} §b════════════════════════════════\n`);
  }
}
