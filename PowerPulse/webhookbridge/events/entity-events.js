/**
 * ============================================
 * ENTITY EVENTS MODULE v4.1.0
 * ============================================
 *
 * Tracks all entity-related events:
 * - Mob spawning/despawning
 * - Entity damage
 * - Taming events
 * - Breeding events
 * - Entity death
 * - Projectile hits
 *
 * @module events/entity-events
 */

import { world, system, EntityDamageCause } from "@minecraft/server";

export class EntityEventManager {
  constructor(sendWebhook, WHConfig, WHHelpers) {
    this.sendWebhook = sendWebhook;
    this.WHConfig = WHConfig;
    this.WHHelpers = WHHelpers;
    this.entityTracking = new Map();
    this.breedingCooldown = new Map();
    this.lastDamage = new Map();
  }

  /**
   * Initialize entity event tracking
   */
  initialize() {
    // Check if entity events are enabled (graceful fallback)
    const entityEventsEnabled = this.WHConfig?.features?.entityEvents ||
                               this.WHConfig?.advanced?.features?.entityEvents ||
                               true; // Default to enabled if config doesn't specify

    if (entityEventsEnabled === false) {
      console.warn("[Webhook] Entity events disabled in config");
      return;
    }

    try {
      this.setupEntityDamageListener();
      this.setupEntityDeathListener();
      this.setupBreedingListener();
      this.setupProjectileListener();

      console.info("[Webhook] Entity event tracking initialized");
    } catch (error) {
      console.warn("[Webhook] Entity event tracking initialization error:", error.message);
    }
  }

  /**
   * Track entity damage events
   */
  setupEntityDamageListener() {
    try {
      // Check if beforeEvents.entityDamage exists
      if (!world?.beforeEvents?.entityDamage?.subscribe) {
        console.warn("[Webhook] Entity damage events not available in this Bedrock version");
        return;
      }

      world.beforeEvents.entityDamage.subscribe((event) => {
        try {
          const { entity, damageSource } = event;

          // Defensive check: ensure entity exists
          if (!entity) {
            console.warn("[Webhook] Entity damage event received with no entity");
            return;
          }

          // Only track significant entities
          if (!this.isSignificantEntity(entity)) return;

          const damageType = this.getDamageType(damageSource.cause);
          const attacker = damageSource.damagingEntity?.name || "Unknown";

          // Prevent spam from rapid damage
          const entityId = entity.id;
          const lastDamageTime = this.lastDamage.get(entityId) || 0;
          if (Date.now() - lastDamageTime < 500) return;
          this.lastDamage.set(entityId, Date.now());

          // Send embed to world events
          const entityDamageEnabled = this.WHConfig?.features?.entityDamage ||
                                     this.WHConfig?.advanced?.features?.entityDamage ||
                                     true;
          if (entityDamageEnabled) {
            this.sendEntityDamageEmbed(entity, attacker, damageType, event.damage);
          }
        } catch (error) {
          console.warn("[Webhook] Entity damage tracking error:", error.message);
        }
      });

      console.info("[Webhook] Entity damage listener initialized");
    } catch (error) {
      console.warn("[Webhook] Could not setup entity damage listener:", error.message);
    }
  }

  /**
   * Track entity death events
   */
  setupEntityDeathListener() {
    try {
      // Check if afterEvents.entityDie exists
      if (!world?.afterEvents?.entityDie?.subscribe) {
        console.warn("[Webhook] Entity death events not available in this Bedrock version");
        return;
      }

      world.afterEvents.entityDie.subscribe((event) => {
        try {
          const { deadEntity, damageSource } = event;

          // Defensive check: ensure entity is valid before accessing properties
          if (!deadEntity) {
            console.warn("[Webhook] Entity death event received with no deadEntity");
            return;
          }

          // Only track significant entities
          if (!this.isSignificantEntity(deadEntity)) return;

          // Safely get entity type - check if valid first
          let entityType = "unknown";
          try {
            if (deadEntity.typeId) {
              entityType = deadEntity.typeId.replace("minecraft:", "");
            }
          } catch (e) {
            console.warn("[Webhook] Could not get entity type ID:", e.message);
            return;
          }

          // Safely get location - the entity might have been removed already
          let location = null;
          try {
            if (deadEntity.location && typeof deadEntity.location === 'object') {
              location = deadEntity.location;
            }
          } catch (e) {
            console.warn("[Webhook] Could not get entity location (entity may have been removed):", e.message);
            // Use a default location if we can't get it
            location = { x: 0, y: 0, z: 0 };
          }

          const killer = damageSource?.damagingEntity?.name || "Environment";

          // Send embed
          const entityDeathEnabled = this.WHConfig?.features?.entityDeath ||
                                    this.WHConfig?.advanced?.features?.entityDeath ||
                                    true;
          if (entityDeathEnabled) {
            this.sendEntityDeathEmbed(entityType, location, killer);
          }
        } catch (error) {
          console.warn("[Webhook] Entity death tracking error:", error.message);
          // Don't log as ERROR - this is expected when entities are removed
        }
      });

      console.info("[Webhook] Entity death listener initialized");
    } catch (error) {
      console.warn("[Webhook] Could not setup entity death listener:", error.message);
    }
  }

  /**
   * Track breeding events
   */
  setupBreedingListener() {
    // Minecraft doesn't have direct breeding events, so we detect using loveMode
    system.runInterval(() => {
      try {
        const players = world.getAllPlayers();

        for (const player of players) {
          const dimension = player.dimension;
          const radius = 16; // Check nearby area

          const entities = dimension.getEntities({
            location: player.location,
            maxDistance: radius,
            excludeGameModes: ["spectator"]
          });

          for (const entity of entities) {
            if (entity.isValid() && this.canBreed(entity)) {
              if (entity.getComponent("minecraft:tameable")?.isTamed()) {
                const breedingKey = `${entity.id}`;
                const lastBreed = this.breedingCooldown.get(breedingKey) || 0;

                // Breeding cooldown to prevent spam
                if (Date.now() - lastBreed > 30000) {
                  this.sendBreedingDetectedEmbed(entity, player);
                  this.breedingCooldown.set(breedingKey, Date.now());
                }
              }
            }
          }
        }
      } catch (error) {
        // Silently fail - not critical
      }
    }, 400); // Check every 20 seconds (400 ticks)
  }

  /**
   * Track projectile hits
   */
  setupProjectileListener() {
    try {
      // Check if projectileHit event exists
      if (!world?.afterEvents?.projectileHit?.subscribe) {
        console.warn("[Webhook] Projectile hit events not available in this Bedrock version");
        return;
      }

      world.afterEvents.projectileHit.subscribe((event) => {
        try {
          const { projectile, hitEntity, hitBlock } = event;

          const projectileHitsEnabled = this.WHConfig?.features?.projectileHits ||
                                       this.WHConfig?.advanced?.features?.projectileHits ||
                                       true;

          if (hitEntity && projectileHitsEnabled) {
            const projectileType = projectile.typeId.replace("minecraft:", "");
            const targetEntity = hitEntity.typeId.replace("minecraft:", "");
            const shooter = projectile.owner?.name || "Unknown";

            this.sendProjectileHitEmbed(projectileType, targetEntity, shooter, hitEntity.location);
          }
        } catch (error) {
          console.error("[Webhook] Projectile tracking error:", error.message);
        }
      });

      console.info("[Webhook] Projectile hit listener initialized");
    } catch (error) {
      console.warn("[Webhook] Could not setup projectile listener:", error.message);
    }
  }

  /**
   * Create and send entity damage embed
   */
  sendEntityDamageEmbed(entity, attacker, damageType, damage) {
    try {
      const entityType = (entity.typeId || "unknown").replace("minecraft:", "").toUpperCase();

      let location = { x: 0, y: 0, z: 0 };
      try {
        if (entity.location && typeof entity.location === 'object') {
          location = entity.location;
        }
      } catch (e) {
        // Silently handle location access errors
      }

      let health = "N/A";
      try {
        const healthComponent = entity.getComponent("minecraft:health");
        if (healthComponent && healthComponent.currentValue !== undefined) {
          health = healthComponent.currentValue.toFixed(1);
        }
      } catch (e) {
        // Silently handle health component access errors
      }

      const embed = {
        title: `⚔️ ${entityType} Damaged`,
        description: `${attacker} dealt ${damage.toFixed(1)} damage`,
        color: 0xE74C3C,
        fields: [
          {
            name: "Entity Type",
            value: entityType,
            inline: true
          },
          {
            name: "Damage Type",
            value: damageType,
            inline: true
          },
          {
            name: "Attacker",
            value: attacker,
            inline: true
          },
          {
            name: "Damage Amount",
            value: damage.toFixed(1),
            inline: true
          },
          {
            name: "Health",
            value: `${health} ❤️`,
            inline: true
          },
          {
            name: "Location",
            value: `X: ${location.x.toFixed(1)}, Y: ${location.y.toFixed(1)}, Z: ${location.z.toFixed(1)}`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString()
      };

      this.sendWebhook("worldEvents", { embeds: [embed] });
    } catch (error) {
      console.warn("[Webhook] Error sending entity damage embed:", error.message);
    }
  }

  /**
   * Create and send entity death embed
   */
  sendEntityDeathEmbed(entityType, location, killer) {
    try {
      const formatEntity = (entityType || "unknown").split("_").join(" ").toUpperCase();

      let safeLocation = { x: 0, y: 0, z: 0 };
      try {
        if (location && typeof location === 'object' && location.x !== undefined) {
          safeLocation = location;
        }
      } catch (e) {
        // Silently handle location errors
      }

      const embed = {
        title: `💀 ${formatEntity} Died`,
        description: `Killed by: ${killer || "Unknown"}`,
        color: 0x8B0000,
        fields: [
          {
            name: "Entity Type",
            value: formatEntity,
            inline: true
          },
          {
            name: "Killer",
            value: killer || "Unknown",
            inline: true
          },
          {
            name: "Location",
            value: `X: ${safeLocation.x?.toFixed?.(1) ?? 0}, Y: ${safeLocation.y?.toFixed?.(1) ?? 0}, Z: ${safeLocation.z?.toFixed?.(1) ?? 0}`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString()
      };

      this.sendWebhook("worldEvents", { embeds: [embed] });
    } catch (error) {
      console.warn("[Webhook] Error sending entity death embed:", error.message);
    }
  }

  /**
   * Create and send breeding detected embed
   */
  sendBreedingDetectedEmbed(entity, nearbyPlayer) {
    try {
      const entityType = (entity.typeId || "unknown").replace("minecraft:", "").toUpperCase();

      let location = { x: 0, y: 0, z: 0 };
      try {
        if (entity.location && typeof entity.location === 'object') {
          location = entity.location;
        }
      } catch (e) {
        // Silently handle location errors
      }

      const embed = {
        title: `👶 ${entityType} Breeding Detected`,
        description: `Detected by ${nearbyPlayer?.name || "Unknown"}`,
        color: 0xF1C40F,
        fields: [
          {
            name: "Animal Type",
            value: entityType,
            inline: true
          },
          {
            name: "Detected By",
            value: nearbyPlayer?.name || "Unknown",
            inline: true
          },
          {
            name: "Location",
            value: `X: ${location.x?.toFixed?.(1) ?? 0}, Y: ${location.y?.toFixed?.(1) ?? 0}, Z: ${location.z?.toFixed?.(1) ?? 0}`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString()
      };

      this.sendWebhook("worldEvents", { embeds: [embed] });
    } catch (error) {
      console.warn("[Webhook] Error sending breeding detected embed:", error.message);
    }
  }

  /**
   * Create and send projectile hit embed
   */
  sendProjectileHitEmbed(projectileType, targetEntity, shooter, location) {
    try {
      const formatProjectile = (projectileType || "unknown").split("_").join(" ").toUpperCase();
      const formatTarget = (targetEntity || "unknown").split("_").join(" ").toUpperCase();

      let safeLocation = { x: 0, y: 0, z: 0 };
      try {
        if (location && typeof location === 'object') {
          safeLocation = location;
        }
      } catch (e) {
        // Silently handle location errors
      }

      const embed = {
        title: `🏹 Projectile Hit`,
        description: `${formatProjectile} hit ${formatTarget}`,
        color: 0x9B59B6,
        fields: [
          {
            name: "Projectile Type",
            value: formatProjectile,
            inline: true
          },
          {
            name: "Target Entity",
            value: formatTarget,
            inline: true
          },
          {
            name: "Shooter",
            value: shooter || "Unknown",
            inline: true
          },
          {
            name: "Impact Location",
            value: `X: ${safeLocation.x?.toFixed?.(1) ?? 0}, Y: ${safeLocation.y?.toFixed?.(1) ?? 0}, Z: ${safeLocation.z?.toFixed?.(1) ?? 0}`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString()
      };

      this.sendWebhook("worldEvents", { embeds: [embed] });
    } catch (error) {
      console.warn("[Webhook] Error sending projectile hit embed:", error.message);
    }
  }

  /**
   * Check if entity is significant enough to track
   */
  isSignificantEntity(entity) {
    const typeId = entity.typeId;

    // Don't track common mobs in rapid succession
    const ignore = ["minecraft:armor_stand", "minecraft:item", "minecraft:player", "minecraft:area_effect_cloud"];

    return !ignore.includes(typeId);
  }

  /**
   * Check if entity can breed
   */
  canBreed(entity) {
    const breedable = [
      "minecraft:cow",
      "minecraft:sheep",
      "minecraft:pig",
      "minecraft:chicken",
      "minecraft:horse",
      "minecraft:donkey",
      "minecraft:mule",
      "minecraft:llama",
      "minecraft:wolf",
      "minecraft:cat",
      "minecraft:rabbit",
      "minecraft:turtle",
      "minecraft:axolotl",
      "minecraft:bee",
      "minecraft:frog",
      "minecraft:camel"
    ];

    return breedable.includes(entity.typeId);
  }

  /**
   * Get human-readable damage type
   */
  getDamageType(cause) {
    const damageMap = {
      [EntityDamageCause.anvil]: "Anvil",
      [EntityDamageCause.blockExplosion]: "Block Explosion",
      [EntityDamageCause.charging]: "Charging",
      [EntityDamageCause.contact]: "Contact",
      [EntityDamageCause.drowning]: "Drowning",
      [EntityDamageCause.entityExplosion]: "Entity Explosion",
      [EntityDamageCause.fall]: "Fall Damage",
      [EntityDamageCause.fire]: "Fire",
      [EntityDamageCause.fireTick]: "Fire Tick",
      [EntityDamageCause.freezing]: "Freezing",
      [EntityDamageCause.lava]: "Lava",
      [EntityDamageCause.lightning]: "Lightning",
      [EntityDamageCause.magic]: "Magic",
      [EntityDamageCause.magicPotion]: "Magic Potion",
      [EntityDamageCause.projectile]: "Projectile",
      [EntityDamageCause.stalactite]: "Stalactite",
      [EntityDamageCause.stalagmite]: "Stalagmite",
      [EntityDamageCause.suffocation]: "Suffocation",
      [EntityDamageCause.suicide]: "Suicide",
      [EntityDamageCause.thorns]: "Thorns",
      [EntityDamageCause.void]: "Void",
      [EntityDamageCause.wither]: "Wither"
    };

    return damageMap[cause] || "Unknown Damage Type";
  }

  /**
   * Cleanup tracking data
   */
  cleanup() {
    // Remove old damage tracking entries (older than 1 minute)
    const now = Date.now();
    const maxAge = 60000;

    for (const [key, timestamp] of this.lastDamage) {
      if (now - timestamp > maxAge) {
        this.lastDamage.delete(key);
      }
    }
  }
}

export default EntityEventManager;
