/**
 * ClearLag++ Configuration Module
 * Zentrale Konfigurationsverwaltung für alle ClearLag++ Features
 */

export const CLEARLAG_CONFIG = {
  // ==================== ALLGEMEINE EINSTELLUNGEN ====================
  plugin: {
    enabled: true,
    name: "ClearLag++",
    version: "1.0.0",
    prefix: "§b[ClearLag++]§r",
    debugMode: true,
  },

  // ==================== AUTO-CLEANUP EINSTELLUNGEN ====================
  autoCleanup: {
    enabled: true,

    // Automatisches Entfernen von Items
    items: {
      enabled: true,
      delayTicks: 6000, // 5 Minuten (300 Sekunden * 20 Ticks)
      showCountdown: true,
      countdownStartAt: 3000, // Countdown beginnt nach 2.5 Minuten
      countdownIntervalTicks: 400, // Jeden 20 Sekunden aktualisieren

      // Geschützte Item-Tags
      protectedTags: [
        "clearlag:protect",
        "clearlag:no_remove",
        "keep_inventory"
      ],

      // Items die geschützt sind
      protectedItems: [
        "minecraft:item_frame",
        "minecraft:glow_item_frame",
        "minecraft:armor_stand"
      ]
    },

    // Automatisches Entfernen von Entitäten
    entities: {
      enabled: true,

      // Passive Mobs
      passiveMobs: {
        enabled: true,
        delayTicks: 12000, // 10 Minuten
        tags: ["clearlag:keep", "minecraft:tameable_with"]
      },

      // Feindselige Mobs
      hostileMobs: {
        enabled: true,
        delayTicks: 8000, // 6.67 Minuten
        tags: ["clearlag:keep"]
      },

      // Andere Entitäten (Projectile, etc.)
      otherEntities: {
        enabled: true,
        delayTicks: 4000, // 3.33 Minuten
        types: [
          "minecraft:arrow",
          "minecraft:snowball",
          "minecraft:egg",
          "minecraft:potion",
          "minecraft:fireball",
          "minecraft:small_fireball",
          "minecraft:wind_charge"
        ]
      }
    },

    // Spieler-Death-Items Schutz
    playerDeathItems: {
      enabled: true,
      protectionDurationTicks: 6000, // 5 Minuten nach Tod
      autoPickupAfterDuration: true
    }
  },

  // ==================== MOB-MANAGEMENT ====================
  mobManagement: {
    // Namensschilder-geschützte Mobs
    namedMobs: {
      enabled: true,
      protectedFromRemoval: true
    },

    // Gezüchtete Mobs (mit Owner-Tag)
    tamedMobs: {
      enabled: true,
      protectedFromRemoval: true
    },

    // Mobs mit Scoreboard-Tag
    taggedMobs: {
      enabled: true,
      protectableTags: [
        "clearlag:protected",
        "clearlag:boss",
        "minecraft:no_despawn"
      ]
    },

    // Max Mobs pro Chunk
    chunkLimiter: {
      enabled: true,
      maxPerChunk: 30,
      maxPassivePerChunk: 15,
      maxHostilePerChunk: 20
    },

    // Global Mob-Limit
    globalMobLimit: {
      enabled: true,
      maxTotal: 500,
      maxPassive: 300,
      maxHostile: 200
    }
  },

  // ==================== REDSTONE-OPTIMIERUNG ====================
  redstoneOptimization: {
    enabled: true,

    // Redstone-Komponenten Update-Limiting
    updateRate: {
      enabled: true,
      maxUpdatesPerSecond: 100,
      maxUpdatesPerChunk: 50
    },

    // Block-Update Queueing
    blockUpdates: {
      enabled: true,
      maxQueueSize: 1000,
      processPerTick: 20
    },

    // Hopper-Optimierung
    hopperOptimization: {
      enabled: true,
      maxHoppersPerChunk: 5,
      updateIntervalTicks: 8
    },

    // Farm-Optimierung
    farmOptimization: {
      enabled: true,
      maxFarmsPerChunk: 3,
      optimizeWaterFlow: true
    }
  },

  // ==================== WEATHER & UMWELT ====================
  weatherManagement: {
    enabled: true,

    // Schlechtwetter Handling
    clearBadWeather: {
      enabled: true,
      autoStop: false // Automatisch stoppen wenn aktiviert
    },

    // Regen-Optimierung
    rainOptimization: {
      enabled: true,
      reduceLagWhenRaining: true
    }
  },

  // ==================== CHAT-MANAGEMENT ====================
  chatManagement: {
    enabled: true,

    // Chat-Verlauf Limit
    chatHistory: {
      maxMessages: 100,
      clearOnRestart: false
    }
  },

  // ==================== PERFORMANCE-MONITORING ====================
  monitoring: {
    enabled: true,

    // TPS Tracking
    tps: {
      enabled: true,
      updateIntervalTicks: 20, // Jede Sekunde
      warnThreshold: 10, // Warnung bei < 10 TPS
      criticalThreshold: 5 // Kritisch bei < 5 TPS
    },

    // MSPT (Milliseconds Per Tick) Tracking
    mspt: {
      enabled: true,
      warnThreshold: 40, // Warnung bei > 40ms pro Tick
      criticalThreshold: 50 // Kritisch bei > 50ms pro Tick
    },

    // Entity Count Tracking
    entities: {
      enabled: true,
      warnThreshold: 300,
      criticalThreshold: 400
    },

    // Item Count Tracking
    items: {
      enabled: true,
      warnThreshold: 200,
      criticalThreshold: 300
    },

    // Memory Usage Tracking
    memory: {
      enabled: true,
      warnThreshold: 80, // 80% RAM-Auslastung
      criticalThreshold: 95
    }
  },

  // ==================== BROADCAST-NACHRICHTEN ====================
  broadcasts: {
    enabled: true,

    // Cleanup-Nachricht
    cleanupMessage: {
      enabled: true,
      showItemsRemoved: true,
      showEntitiesRemoved: true,
      format: "§e{prefix} §7Cleanup durchgeführt: §a{itemsRemoved}§7 Items, §a{entitiesRemoved}§7 Entities entfernt"
    },

    // Performance-Warnung
    performanceWarning: {
      enabled: true,
      showInConsole: true,
      showInChat: true,
      format: "§c{prefix} §7Server Lag erkannt! TPS: §c{tps}§7 MSPT: §c{mspt}ms"
    },

    // Periodic Status
    statusBroadcast: {
      enabled: false,
      intervalTicks: 72000, // 1 Stunde
      format: "§b{prefix} §7Server Status - TPS: §a{tps}§7, Entities: §a{entities}§7, RAM: §a{memory}%"
    }
  },

  // ==================== DISCORD-INTEGRATION ====================
  discord: {
    enabled: true,

    // Webhook-Nachrichten
    webhooks: {
      cleanupNotification: {
        enabled: true,
        webhookType: "serverEvents"
      },

      performanceAlert: {
        enabled: true,
        webhookType: "alerts",
        includeMetrics: true
      },

      commandLog: {
        enabled: true,
        webhookType: "commands"
      }
    }
  },

  // ==================== PERSISTENTE SPEICHERUNG ====================
  storage: {
    // Statistik-Datenspeicherung
    statistics: {
      enabled: true,
      trackCleanupHistory: true,
      maxHistoryEntries: 1000,
      clearHistoryDaysOld: 30
    },

    // Konfiguration speichern
    config: {
      enabled: true,
      autoSave: true,
      saveIntervalTicks: 6000 // Alle 5 Minuten
    }
  },

  // ==================== LOGGING ====================
  logging: {
    enabled: true,

    // Console Logging
    console: {
      enabled: true,
      logLevel: "info", // "debug", "info", "warn", "error"
      logCleanups: true,
      logErrors: true,
      logCommands: true
    },

    // File Logging
    file: {
      enabled: true,
      logCleanups: true,
      logPerformance: true,
      logErrors: true,
      maxLogFiles: 10,
      logRotationDays: 7
    }
  },

  // ==================== BERECHTIGUNGEN ====================
  permissions: {
    // Admin-Kommando-Perms
    adminOnly: [
      "clearlag killmobs",
      "clearlag config",
      "clearlag reset",
      "clearlag broadcast toggle"
    ],

    // Mod-Kommando-Perms
    modOnly: [
      "clearlag status",
      "clearlag stats"
    ]
  }
};

/**
 * Lädt Konfiguration aus persistenter Speicherung
 * @param {Map} database - Die Datenbank-Instanz
 * @returns {Object} Konfigurationsobjekt
 */
export function loadConfig(database) {
  try {
    if (database.has("clearlag:config")) {
      const savedConfig = JSON.parse(database.get("clearlag:config"));
      return { ...CLEARLAG_CONFIG, ...savedConfig };
    }
  } catch (error) {
    console.error("§c[ClearLag++]§r Fehler beim Laden der Konfiguration:", error.message);
  }
  return CLEARLAG_CONFIG;
}

/**
 * Speichert Konfiguration persistent
 * @param {Object} config - Konfigurationsobjekt
 * @param {Map} database - Die Datenbank-Instanz
 */
export function saveConfig(config, database) {
  try {
    database.set("clearlag:config", JSON.stringify(config));
  } catch (error) {
    console.error("§c[ClearLag++]§r Fehler beim Speichern der Konfiguration:", error.message);
  }
}
