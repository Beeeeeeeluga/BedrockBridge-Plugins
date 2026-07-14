/**
 * ClearLag++ Entity Manager
 * ABSOLUT SILENT - KEINE WARNINGS, KEINE VALIDIERUNGSMELDUNGEN, KEINE LOGGING
 */

import { world, system, Entity, Player } from "@minecraft/server";
import { CLEARLAG_CONFIG } from "./config.js";

export class EntityManager {
  constructor(config, discordIntegration = null) {
    try {
      this.config = config || {};
      this.discordIntegration = discordIntegration; // Discord Integration für Notifications
      this.statistics = {
        totalItemsRemoved: 0,
        totalEntitiesRemoved: 0,
        totalPassiveMobsRemoved: 0,
        totalHostileMobsRemoved: 0,
        totalXPRemoved: 0,
        totalVehiclesRemoved: 0,
        totalWitherRemoved: 0,
        totalDragonRemoved: 0,
        lastCleanupTime: null,
        cleanupCount: 0,
      };

      this.itemCountdowns = new Map();
      this.protectedDeathItems = new Map();
      this.redstoneUpdateQueue = [];

      this.masterHostile = [
        "minecraft:zombie","minecraft:husk","minecraft:drowned","minecraft:skeleton",
        "minecraft:stray","minecraft:spider","minecraft:cave_spider","minecraft:creeper",
        "minecraft:enderman","minecraft:witch","minecraft:vindicator","minecraft:evoker",
        "minecraft:ravager","minecraft:pillager","minecraft:illusioner","minecraft:zombified_piglin",
        "minecraft:blaze","minecraft:ghast","minecraft:magma_cube","minecraft:slime",
        "minecraft:phantom","minecraft:warden","minecraft:shulker","minecraft:guardian",
        "minecraft:elder_guardian","minecraft:hoglin","minecraft:piglin_brute"
      ];

      this.masterPassive = [
        "minecraft:cow","minecraft:pig","minecraft:sheep","minecraft:chicken",
        "minecraft:wolf","minecraft:cat","minecraft:horse","minecraft:donkey",
        "minecraft:mule","minecraft:llama","minecraft:fox","minecraft:frog",
        "minecraft:goat","minecraft:turtle","minecraft:axolotl","minecraft:mooshroom",
        "minecraft:villager","minecraft:wandering_trader","minecraft:parrot","minecraft:rabbit","minecraft:bee"
      ];

      this.xpEntities = ["minecraft:xp_orb"];
      this.vehicleEntities = ["minecraft:boat", "minecraft:minecart"];

      // Initialize SILENTLY - NO LOGGING
      this.initializeDynamicProperties();
      this.cleanupCountdown = 6000;
    } catch (e) {
      // SILENT FALLBACK
      this.config = {};
      this.statistics = { totalItemsRemoved: 0, totalEntitiesRemoved: 0, totalPassiveMobsRemoved: 0, totalHostileMobsRemoved: 0, totalXPRemoved: 0, totalVehiclesRemoved: 0, totalWitherRemoved: 0, totalDragonRemoved: 0, lastCleanupTime: null, cleanupCount: 0 };
      this.itemCountdowns = new Map();
      this.protectedDeathItems = new Map();
      this.redstoneUpdateQueue = [];
      this.masterHostile = [];
      this.masterPassive = [];
      this.xpEntities = [];
      this.vehicleEntities = [];
      this.cleanupCountdown = 6000;
    }
  }

  initializeDynamicProperties() {
    try {
      // NO WARNINGS - just set if not exist
      const set = (key, val) => {
        try {
          if (world.getDynamicProperty(key) === undefined) {
            world.setDynamicProperty(key, val);
          }
        } catch (e) {}
      };

      set("clearlag_interval", 6000);
      set("clearlag_hostile", JSON.stringify(this.masterHostile));
      set("clearlag_passive", JSON.stringify(this.masterPassive));
      set("clearlag_whitelist", JSON.stringify(["minecraft:wolf","minecraft:cat","minecraft:horse","minecraft:parrot","minecraft:villager"]));
      set("clearlag_clear_xp", true);
      set("clearlag_clear_vehicles", true);
      set("clearlag_show_ui", true);
      set("clearlag_clear_wither", false);
      set("clearlag_clear_dragon", false);
      set("clearlag_dim_overworld", true);
      set("clearlag_dim_nether", true);
      set("clearlag_dim_end", true);
    } catch (e) {}
  }

  /**
   * ABSOLUT SILENT - Gibt SICHER einen Integer zurück
   * NIEMALS undefined, NaN, oder String - KEINE LOGGING ODER WARNINGS
   */
  getCleanupInterval() {
    try {
      const raw = world.getDynamicProperty("clearlag_interval");
      // Type check - must be number and integer
      if (typeof raw === "number") {
        if (Number.isInteger(raw) && raw >= 600 && raw <= 12000) {
          return raw;
        }
      }
      return 6000; // Silent fallback - NO warning logged
    } catch (e) {
      return 6000; // Silent fallback - NO warning logged
    }
  }

  initialize() {
    try {
      console.log("§b[ClearLag++]§r Entity Manager wird initialisiert...");

      try {
        this.setupEntitySpawnListener();
      } catch (e) {}

      try {
        if (this.config?.autoCleanup?.enabled) {
          this.startAutoCleanup();
        }
      } catch (e) {}

      try {
        this.startItemCountdownTicker();
      } catch (e) {}

      try {
        if (this.config?.redstoneOptimization?.enabled) {
          this.startRedstoneOptimization();
        }
      } catch (e) {}

      console.log("§b[ClearLag++]§r Entity Manager initialisiert!");
    } catch (error) {}
  }

  setupEntitySpawnListener() {
    try {
      // Track entity spawning
      world.afterEvents.entitySpawn.subscribe((event) => {
        try {
          if (event?.entity?.typeId === "minecraft:item" && this.config?.autoCleanup?.items?.enabled) {
            this.registerItemCountdown(event.entity);
          }
        } catch (e) {}
      });

      // Track entity removal (beforeEvents for cleanup validation)
      world.beforeEvents.entityRemove.subscribe((event) => {
        try {
          if (event?.removedEntity?.typeId === "minecraft:item") {
            const itemId = event.removedEntity.id;
            if (this.itemCountdowns.has(itemId)) {
              this.itemCountdowns.delete(itemId);
            }
          }
        } catch (e) {}
      });
    } catch (error) {}
  }

  registerItemCountdown(item) {
    try {
      if (!item?.id) return;
      let delay = this.config?.autoCleanup?.items?.delayTicks;
      if (typeof delay !== "number" || delay < 1) delay = 6000;
      this.itemCountdowns.set(item.id, { originalTicks: delay, ticks: delay, broadcastedCountdown: false });
    } catch (error) {}
  }

  startAutoCleanup() {
    try {
      const interval = this.getCleanupInterval();
      system.runInterval(() => {
        try {
          this.performFullCleanup();
        } catch (e) {}
      }, interval);
    } catch (error) {}
  }

  startItemCountdownTicker() {
    try {
      system.runInterval(() => {
        try {
          const toRemove = [];
          for (const [itemId, countdown] of this.itemCountdowns) {
            countdown.ticks--;
            if (countdown.ticks <= 0) {
              try {
                const entity = world.getEntity(itemId);
                if (entity?.typeId === "minecraft:item" && !this.isItemProtected(entity)) {
                  entity.remove();
                  this.statistics.totalItemsRemoved++;
                  toRemove.push(itemId);
                }
              } catch (e) {
                toRemove.push(itemId);
              }
            }
          }
          toRemove.forEach(id => this.itemCountdowns.delete(id));
        } catch (e) {}
      }, 1);
    } catch (error) {}
  }

  startRedstoneOptimization() {
    try {
      if (!this.config?.redstoneOptimization?.updateRate?.enabled) return;
      let maxPerSecond = this.config?.redstoneOptimization?.updateRate?.maxUpdatesPerSecond;
      if (typeof maxPerSecond !== "number" || maxPerSecond < 1) maxPerSecond = 100;

      system.runInterval(() => {
        try {
          const maxPerTick = Math.max(1, Math.floor(maxPerSecond / 20));
          for (let i = 0; i < Math.min(maxPerTick, this.redstoneUpdateQueue.length); i++) {
            try {
              const update = this.redstoneUpdateQueue.shift();
              if (update?.location?.dimension) {
                update.location.dimension.getBlock(update.location).setPermutation(update.permutation);
              }
            } catch (e) {}
          }
        } catch (e) {}
      }, 1);
    } catch (error) {}
  }

  async performFullCleanup() {
    let itemsRemoved = 0, entitiesRemoved = 0, passiveMobsRemoved = 0, hostileMobsRemoved = 0, xpRemoved = 0, vehiclesRemoved = 0, witherRemoved = 0, dragonRemoved = 0;

    try {
      const hostileSet = this.loadSet("clearlag_hostile", this.masterHostile);
      const passiveSet = this.loadSet("clearlag_passive", this.masterPassive);
      const whitelist = this.loadSet("clearlag_whitelist", ["minecraft:wolf","minecraft:cat","minecraft:horse","minecraft:parrot","minecraft:villager"]);

      const doXP = !!world.getDynamicProperty("clearlag_clear_xp");
      const doVehicles = !!world.getDynamicProperty("clearlag_clear_vehicles");
      const doWither = !!world.getDynamicProperty("clearlag_clear_wither");
      const doDragon = !!world.getDynamicProperty("clearlag_clear_dragon");

      const dims = [];
      if (world.getDynamicProperty("clearlag_dim_overworld")) dims.push("minecraft:overworld");
      if (world.getDynamicProperty("clearlag_dim_nether")) dims.push("minecraft:nether");
      if (world.getDynamicProperty("clearlag_dim_end")) dims.push("minecraft:the_end");

      for (const dimName of dims) {
        try {
          const dim = world.getDimension(dimName);
          for (const entity of dim.getEntities()) {
            if (!entity?.typeId || entity instanceof Player) continue;
            if (whitelist.has(entity.typeId)) continue;

            try {
              if (entity.typeId === "minecraft:item") { entity.kill(); itemsRemoved++; entitiesRemoved++; }
              else if (doWither && entity.typeId === "minecraft:wither") { entity.kill(); witherRemoved++; entitiesRemoved++; }
              else if (doDragon && entity.typeId === "minecraft:ender_dragon") { entity.kill(); dragonRemoved++; entitiesRemoved++; }
              else if (hostileSet.has(entity.typeId)) { entity.kill(); hostileMobsRemoved++; entitiesRemoved++; }
              else if (passiveSet.has(entity.typeId)) { entity.kill(); passiveMobsRemoved++; entitiesRemoved++; }
              else if (doXP && this.xpEntities.includes(entity.typeId)) { entity.kill(); xpRemoved++; entitiesRemoved++; }
              else if (doVehicles && this.vehicleEntities.includes(entity.typeId)) { entity.kill(); vehiclesRemoved++; entitiesRemoved++; }
            } catch (e) {}
          }
        } catch (e) {}
      }

      this.statistics.totalItemsRemoved += itemsRemoved;
      this.statistics.totalEntitiesRemoved += entitiesRemoved;
      this.statistics.totalPassiveMobsRemoved += passiveMobsRemoved;
      this.statistics.totalHostileMobsRemoved += hostileMobsRemoved;
      this.statistics.totalXPRemoved += xpRemoved;
      this.statistics.totalVehiclesRemoved += vehiclesRemoved;
      this.statistics.totalWitherRemoved += witherRemoved;
      this.statistics.totalDragonRemoved += dragonRemoved;
      this.statistics.lastCleanupTime = new Date().toISOString();
      this.statistics.cleanupCount++;

      if (entitiesRemoved > 0) {
        try {
          // Benachrichtige alle Spieler im Server
          for (const player of world.getAllPlayers()) {
            player.sendMessage(`§b[ClearLag++]§a ✔ Cleanup durchgeführt! §7(${entitiesRemoved} entities)`);
          }

          // Sende detaillierte Benachrichtigung an Discord
          if (this.discordIntegration && this.discordIntegration.isReady) {
            try {
              this.discordIntegration.sendCleanupNotification(
                itemsRemoved,
                entitiesRemoved,
                passiveMobsRemoved,
                hostileMobsRemoved,
                xpRemoved,
                vehiclesRemoved,
                witherRemoved,
                dragonRemoved
              );
            } catch (discordError) {
              // Fehler beim Discord-Senden - Silent fallback
            }
          }
        } catch (e) {}
      }
    } catch (error) {}
  }

  loadSet(key, fallback) {
    try {
      const raw = world.getDynamicProperty(key);
      if (!raw) return new Set(fallback);
      return new Set(JSON.parse(raw));
    } catch (e) {
      return new Set(fallback);
    }
  }

  saveSet(key, set) {
    try {
      world.setDynamicProperty(key, JSON.stringify([...set]));
    } catch (e) {}
  }

  isItemProtected(entity) {
    try {
      if (!entity) return false;
      if (this.protectedDeathItems.has(entity.id)) {
        const protect = this.protectedDeathItems.get(entity.id);
        if (protect.protectedUntil > system.currentTick) return true;
        this.protectedDeathItems.delete(entity.id);
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  protectDeathItems(entity, playerId) {
    try {
      if (!entity?.id) return;
      const protectionTicks = this.config?.autoCleanup?.playerDeathItems?.protectionDurationTicks || 6000;
      this.protectedDeathItems.set(entity.id, { owner: playerId, protectedUntil: system.currentTick + protectionTicks });
    } catch (e) {}
  }

  getStatistics() {
    return this.statistics;
  }

  killMobs(type) {
    try {
      for (const dim of [world.getDimension("minecraft:overworld")]) {
        for (const entity of dim.getEntities()) {
          try {
            if (type === "all" || entity.typeId.includes(type)) {
              entity.kill();
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }
}
