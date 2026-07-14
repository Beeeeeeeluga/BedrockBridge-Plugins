/**
 * ClearLag++ Logger Module
 * Umfassendes Logging- und Protokollierungs-System
 */

import { world, system } from "@minecraft/server";

export class Logger {
  constructor(config) {
    this.config = config;
    this.logs = [];
    this.maxLogs = 10000;

    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    this.currentLogLevel = this.logLevels[config.logging.console.logLevel || "info"];

    // Log-Format
    this.formatters = {
      timestamp: () => new Date().toISOString(),
      level: (level) => `[${level.toUpperCase().padEnd(5)}]`,
      prefix: () => config.plugin.prefix,
      message: (msg) => msg
    };
  }

  /**
   * Initialisiert das Logger-System
   */
  initialize() {
    console.log("§b[ClearLag++]§r Logger wird initialisiert...");

    // Setup Console Logging
    if (this.config.logging.console.enabled) {
      this.setupConsoleLogging();
    }

    console.log("§b[ClearLag++]§r Logger initialisiert!");
  }

  /**
   * Richtet Console Logging ein
   */
  setupConsoleLogging() {
    // Log-Format in Konsole
    // Alle Logs werden intern gespeichert
  }

  /**
   * Schreibt einen Debug-Log
   */
  debug(message, context = null) {
    if (this.logLevels.debug >= this.currentLogLevel) {
      this.log("debug", message, context);
    }
  }

  /**
   * Schreibt einen Info-Log
   */
  info(message, context = null) {
    if (this.logLevels.info >= this.currentLogLevel) {
      this.log("info", message, context);
    }
  }

  /**
   * Schreibt einen Warn-Log
   */
  warn(message, context = null) {
    if (this.logLevels.warn >= this.currentLogLevel) {
      this.log("warn", message, context);
    }
  }

  /**
   * Schreibt einen Error-Log
   */
  error(message, context = null) {
    if (this.logLevels.error >= this.currentLogLevel) {
      this.log("error", message, context);
    }
  }

  /**
   * Schreibt einen Success-Log (Info mit Success-Präfix)
   */
  success(message, context = null) {
    const formattedMessage = `§a✔ ${message}`;
    this.log("info", formattedMessage, context);
  }

  /**
   * Interne Log-Funktion
   */
  log(level, message, context = null) {
    const timestamp = this.formatters.timestamp();
    const levelStr = this.formatters.level(level);
    const prefix = this.config.plugin.prefix;

    // Erstelle Log-Eintrag
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      fullMessage: `${levelStr} ${message}`
    };

    // Speichere in interner Log-List
    this.logs.push(logEntry);

    // Begrenze Log-Größe
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Konsolen-Output
    if (this.config.logging.console.enabled) {
      const coloredLevel = this.colorizeLevel(level);
      const consoleOutput = `${prefix} ${coloredLevel} ${message}`;
      console.log(consoleOutput);
    }

    // Datei-Logging
    if (this.config.logging.file.enabled) {
      this.writeToFile(logEntry);
    }

    // Spezifische Log-Handler
    if (level === "error" && this.config.logging.console.logErrors) {
      this.handleErrorLog(logEntry, context);
    }

    if (this.config.logging.console.logCleanups && message.includes("Cleanup")) {
      this.handleCleanupLog(logEntry);
    }
  }

  /**
   * Färbt Log-Level ein
   */
  colorizeLevel(level) {
    const colors = {
      debug: "§8",
      info: "§b",
      warn: "§e",
      error: "§c"
    };
    return `${colors[level]}[${level.toUpperCase().padEnd(5)}]§r`;
  }

  /**
   * Behandelt Error-Logs speziell
   */
  handleErrorLog(logEntry, context) {
    // Speichere Error-Details
    const errorData = {
      ...logEntry,
      context: context || {},
      stack: context?.stack || "No stack trace"
    };

    // Optional: Sende an Discord
    if (this.config.discord.enabled) {
      // Wird durch Discord-Integration gehandelt
    }
  }

  /**
   * Behandelt Cleanup-Logs speziell
   */
  handleCleanupLog(logEntry) {
    // Cleanup-spezifische Verarbeitung
    // z.B. Statistik-Tracking
  }

  /**
   * Schreibt Log in Datei (Simulation)
   */
  writeToFile(logEntry) {
    // In echter Implementierung würde hier das Pterodactyl API
    // verwendet werden um Logs auf den Server zu schreiben
    // Für diese Demonstration verwenden wir nur interne Speicherung

    if (this.config.logging.file.logCleanups && logEntry.message.includes("Cleanup")) {
      // Log Cleanup-Events
    }

    if (this.config.logging.file.logPerformance && logEntry.message.includes("Performance")) {
      // Log Performance-Events
    }

    if (this.config.logging.file.logErrors && logEntry.level === "error") {
      // Log Errors
    }
  }

  /**
   * Gibt alle Logs zurück
   */
  getLogs(filter = null) {
    if (!filter) {
      return this.logs;
    }

    return this.logs.filter(log => {
      if (filter.level && log.level !== filter.level) return false;
      if (filter.message && !log.message.includes(filter.message)) return false;
      if (filter.startTime && new Date(log.timestamp) < filter.startTime) return false;
      if (filter.endTime && new Date(log.timestamp) > filter.endTime) return false;
      return true;
    });
  }

  /**
   * Gibt die letzten N Logs zurück
   */
  getRecentLogs(count = 50) {
    return this.logs.slice(-count);
  }

  /**
   * Gibt Logs nach Level gefiltert zurück
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Gibt Logs als formatierte Tabelle zurück (für UI)
   */
  getFormattedLogs(count = 20) {
    const recent = this.logs.slice(-count);
    return recent.map(log => ({
      time: log.timestamp.split("T")[1].split(".")[0],
      level: log.level,
      message: log.message,
      color: this.getLogColor(log.level)
    }));
  }

  /**
   * Gibt Farbe für Log-Level zurück
   */
  getLogColor(level) {
    const colors = {
      debug: "§8",
      info: "§b",
      warn: "§e",
      error: "§c"
    };
    return colors[level] || "§7";
  }

  /**
   * Exportiert Logs als JSON
   */
  exportLogs(filter = null) {
    const logsToExport = filter ? this.getLogs(filter) : this.logs;
    return JSON.stringify(logsToExport, null, 2);
  }

  /**
   * Gibt Statistiken über Logs zurück
   */
  getLogStatistics() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      errors: 0,
      warnings: 0,
      oldest: this.logs[0]?.timestamp || null,
      newest: this.logs[this.logs.length - 1]?.timestamp || null
    };

    for (const log of this.logs) {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      if (log.level === "error") stats.errors++;
      if (log.level === "warn") stats.warnings++;
    }

    return stats;
  }

  /**
   * Löscht alte Logs basierend auf Alter
   */
  clearOldLogs(ageHours = 24) {
    const cutoffTime = Date.now() - (ageHours * 60 * 60 * 1000);

    this.logs = this.logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime > cutoffTime;
    });
  }

  /**
   * Leert alle Logs
   */
  clearAllLogs() {
    this.logs = [];
    this.info("Alle Logs gelöscht!");
  }

  /**
   * Erstellt einen Log-Report
   */
  generateReport() {
    const stats = this.getLogStatistics();
    const recent = this.getRecentLogs(10);

    const report = `
╔════════════════════════════════════╗
║ ClearLag++ Log Report              ║
╠════════════════════════════════════╣
║ Total Logs: ${stats.total}
║ Errors: ${stats.errors}
║ Warnings: ${stats.warnings}
║ Info: ${stats.byLevel.info || 0}
║ Debug: ${stats.byLevel.debug || 0}
╠════════════════════════════════════╣
║ Recent Logs:
${recent.map(log => `║ [${log.level.toUpperCase()}] ${log.message}`).join("\n")}
╚════════════════════════════════════╝
    `;

    return report;
  }
}
