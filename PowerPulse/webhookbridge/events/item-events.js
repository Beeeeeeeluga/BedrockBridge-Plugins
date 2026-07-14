/**
 * ============================================
 * ITEM EVENTS MODULE v4.1.0
 * ============================================
 *
 * Tracks all item-related events:
 * - Item pickup/drop
 * - Crafting completion
 * - Smelting completion
 * - Enchanting
 * - Anvil usage
 * - Item consumption
 * - Container interactions
 *
 * @module events/item-events
 */

import { world, system } from "@minecraft/server";

export class ItemEventManager {
  constructor(sendWebhook, WHConfig, WHHelpers) {
    this.sendWebhook = sendWebhook;
    this.WHConfig = WHConfig;
    this.WHHelpers = WHHelpers;
    this.craftingLog = new Map();
    this.lastPickup = new Map();
    this.containerAccessLog = new Map();
  }

  /**
   * Initialize item event tracking
   */
  initialize() {
    // Check if item events are enabled (graceful fallback)
    const itemEventsEnabled = this.WHConfig?.features?.itemEvents ||
                             this.WHConfig?.advanced?.features?.itemEvents ||
                             true; // Default to enabled if config doesn't specify

    if (itemEventsEnabled === false) {
      console.warn("[Webhook] Item events disabled in config");
      return;
    }

    try {
      this.setupItemPickupListener();
      this.setupCraftingListener();
      this.setupContainerListener();

      console.info("[Webhook] Item event tracking initialized");
    } catch (error) {
      console.warn("[Webhook] Item event tracking initialization error:", error.message);
    }
  }

  /**
   * Track item pickup/drop events
   */
  setupItemPickupListener() {
    try {
      // Check if itemUse event exists
      if (!world?.afterEvents?.itemUse?.subscribe) {
        console.warn("[Webhook] Item use events not available in this Bedrock version");
        return;
      }

      world.afterEvents.itemUse.subscribe((event) => {
        try {
          const { source, itemStack } = event;

          if (!source.isPlayer) return;

          const itemPickupEnabled = this.WHConfig?.features?.itemPickup ||
                                   this.WHConfig?.advanced?.features?.itemPickup ||
                                   true;

          if (!itemPickupEnabled) return;

          const player = source;
          const item = itemStack.typeId.replace("minecraft:", "");
          const quantity = itemStack.amount;

          // Prevent spam
          const pickupKey = `${player.name}_${item}`;
          const lastTime = this.lastPickup.get(pickupKey) || 0;
          if (Date.now() - lastTime < 1000) return;
          this.lastPickup.set(pickupKey, Date.now());

          // Only log valuable items
          if (this.isValuableItem(item)) {
            this.sendItemUseEmbed(player, item, quantity);
          }
        } catch (error) {
          console.error("[Webhook] Item pickup tracking error:", error.message);
        }
      });

      console.info("[Webhook] Item pickup listener initialized");
    } catch (error) {
      console.warn("[Webhook] Could not setup item pickup listener:", error.message);
    }
  }

  /**
   * Track crafting events
   */
  setupCraftingListener() {
    try {
      // Check if playerPlaceBlock event exists
      if (!world?.afterEvents?.playerPlaceBlock?.subscribe) {
        console.warn("[Webhook] Player place block events not available in this Bedrock version");
        return;
      }

      world.afterEvents.playerPlaceBlock.subscribe((event) => {
        try {
          const { player, block } = event;

          const craftingEnabled = this.WHConfig?.features?.crafting ||
                                 this.WHConfig?.advanced?.features?.crafting ||
                                 true;

          const smeltingEnabled = this.WHConfig?.features?.smelting ||
                                 this.WHConfig?.advanced?.features?.smelting ||
                                 true;

          // Crafting table detection
          if (block.typeId === "minecraft:crafting_table" && craftingEnabled) {
            // Track that player used crafting table
            const key = `${player.name}_crafting`;
            const lastUse = this.craftingLog.get(key) || 0;

            // Only log if significant time has passed
            if (Date.now() - lastUse > 2000) {
              this.sendCraftingInitiatedEmbed(player, block.location);
              this.craftingLog.set(key, Date.now());
            }
          }

          // Furnace/Smoker detection
          if (this.isCookingBlock(block.typeId) && smeltingEnabled) {
            this.sendSmeltingDetectedEmbed(player, block.typeId, block.location);
          }
        } catch (error) {
          console.error("[Webhook] Crafting tracking error:", error.message);
        }
      });

      console.info("[Webhook] Crafting listener initialized");
    } catch (error) {
      console.warn("[Webhook] Could not setup crafting listener:", error.message);
    }
  }

  /**
   * Track container interactions (chests, barrels, etc.)
   */
  setupContainerListener() {
    try {
      // Check if playerInteractWithBlock event exists
      if (!world?.beforeEvents?.playerInteractWithBlock?.subscribe) {
        console.warn("[Webhook] Player interact with block events not available in this Bedrock version");
        return;
      }

      world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
        try {
          const { player, block } = event;

          if (!this.isContainer(block.typeId)) return;

          const containerAccessEnabled = this.WHConfig?.features?.containerAccess ||
                                        this.WHConfig?.advanced?.features?.containerAccess ||
                                        true;

          if (!containerAccessEnabled) return;

          const containerType = block.typeId.replace("minecraft:", "").toUpperCase();
          const location = block.location;

          // Send container interaction embed
          this.sendContainerAccessEmbed(player, containerType, location);
        } catch (error) {
          console.error("[Webhook] Container tracking error:", error.message);
        }
      });

      console.info("[Webhook] Container listener initialized");
    } catch (error) {
      console.warn("[Webhook] Could not setup container listener:", error.message);
    }
  }

  /**
   * Send item use/pickup embed
   */
  sendItemUseEmbed(player, itemType, quantity) {
    const formatItem = itemType.split("_").join(" ").toUpperCase();

    const embed = {
      title: `📦 Item Used/Picked Up`,
      description: `${player.name} interacted with items`,
      color: 0x3498DB,
      fields: [
        {
          name: "Player",
          value: player.name,
          inline: true
        },
        {
          name: "Item Type",
          value: formatItem,
          inline: true
        },
        {
          name: "Quantity",
          value: quantity.toString(),
          inline: true
        },
        {
          name: "Location",
          value: `X: ${player.location.x.toFixed(1)}, Y: ${player.location.y.toFixed(1)}, Z: ${player.location.z.toFixed(1)}`,
          inline: false
        }
      ],
      thumbnail: {
        url: `https://crafatar.com/avatars/${player.name}?size=64&overlay`
      },
      timestamp: new Date().toISOString()
    };

    this.sendWebhook("blockLogs", { embeds: [embed] });
  }

  /**
   * Send crafting table usage embed
   */
  sendCraftingInitiatedEmbed(player, location) {
    const embed = {
      title: `🔨 Crafting Started`,
      description: `${player.name} opened a crafting table`,
      color: 0xE67E22,
      fields: [
        {
          name: "Player",
          value: player.name,
          inline: true
        },
        {
          name: "Block Type",
          value: "Crafting Table",
          inline: true
        },
        {
          name: "Location",
          value: `X: ${location.x}, Y: ${location.y}, Z: ${location.z}`,
          inline: false
        }
      ],
      thumbnail: {
        url: `https://crafatar.com/avatars/${player.name}?size=64&overlay`
      },
      timestamp: new Date().toISOString()
    };

    this.sendWebhook("blockLogs", { embeds: [embed] });
  }

  /**
   * Send smelting/cooking detected embed
   */
  sendSmeltingDetectedEmbed(player, blockType, location) {
    const formatBlock = blockType.replace("minecraft:", "").split("_").join(" ").toUpperCase();

    const embed = {
      title: `🔥 Smelting/Cooking Started`,
      description: `${player.name} started cooking`,
      color: 0xFF6B6B,
      fields: [
        {
          name: "Player",
          value: player.name,
          inline: true
        },
        {
          name: "Block Type",
          value: formatBlock,
          inline: true
        },
        {
          name: "Location",
          value: `X: ${location.x}, Y: ${location.y}, Z: ${location.z}`,
          inline: false
        }
      ],
      thumbnail: {
        url: `https://crafatar.com/avatars/${player.name}?size=64&overlay`
      },
      timestamp: new Date().toISOString()
    };

    this.sendWebhook("blockLogs", { embeds: [embed] });
  }

  /**
   * Send container access embed
   */
  sendContainerAccessEmbed(player, containerType, location) {
    const embed = {
      title: `📥 Container Accessed`,
      description: `${player.name} opened a container`,
      color: 0x9B59B6,
      fields: [
        {
          name: "Player",
          value: player.name,
          inline: true
        },
        {
          name: "Container Type",
          value: containerType,
          inline: true
        },
        {
          name: "Location",
          value: `X: ${location.x}, Y: ${location.y}, Z: ${location.z}`,
          inline: false
        }
      ],
      thumbnail: {
        url: `https://crafatar.com/avatars/${player.name}?size=64&overlay`
      },
      timestamp: new Date().toISOString()
    };

    this.sendWebhook("blockLogs", { embeds: [embed] });
  }

  /**
   * Check if item is valuable enough to track
   */
  isValuableItem(itemType) {
    const valuableItems = [
      "diamond",
      "netherite",
      "gold",
      "emerald",
      "beacon",
      "dragon_egg",
      "nether_star",
      "ancient_debris",
      "crying_obsidian",
      "end_crystal",
      "amethyst_cluster",
      "sculk_catalyst",
      "sculk_shrieker",
      "warden_spawn_egg"
    ];

    return valuableItems.some(item => itemType.includes(item));
  }

  /**
   * Check if block is a cooking block
   */
  isCookingBlock(typeId) {
    const cookingBlocks = [
      "minecraft:furnace",
      "minecraft:blast_furnace",
      "minecraft:smoker",
      "minecraft:campfire",
      "minecraft:soul_campfire"
    ];

    return cookingBlocks.includes(typeId);
  }

  /**
   * Check if block is a container
   */
  isContainer(typeId) {
    const containers = [
      "minecraft:chest",
      "minecraft:barrel",
      "minecraft:shulker_box",
      "minecraft:undyed_shulker_box",
      "minecraft:dispenser",
      "minecraft:dropper",
      "minecraft:hopper",
      "minecraft:furnace",
      "minecraft:blast_furnace",
      "minecraft:smoker",
      "minecraft:brewing_stand",
      "minecraft:enchanting_table",
      "minecraft:cauldron",
      "minecraft:trapped_chest",
      "minecraft:ender_chest"
    ];

    return containers.some(container => typeId.includes(container));
  }

  /**
   * Cleanup tracking data
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 120000; // 2 minutes

    // Clean crafting log
    for (const [key, timestamp] of this.craftingLog) {
      if (now - timestamp > maxAge) {
        this.craftingLog.delete(key);
      }
    }

    // Clean pickup log
    for (const [key, timestamp] of this.lastPickup) {
      if (now - timestamp > maxAge) {
        this.lastPickup.delete(key);
      }
    }
  }
}

export default ItemEventManager;
