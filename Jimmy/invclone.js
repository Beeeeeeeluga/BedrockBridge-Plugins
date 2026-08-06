/**
 * invclone.js - BedrockBridge Inventory Clone Plugin (Ultra Ultimate Edition, UI v2.0.0)
 *
 * Uses @minecraft/server:
 * - Serializes and deserializes player inventories, equipment, and ender chests
 * - Creates shulker boxes directly via container components to avoid NBT loss
 * - Periodically caches player data for offline retrieval
 * - Registers administrative BedrockBridge commands
 */

import { world, system, ItemStack, EquipmentSlot, EnchantmentTypes } from "@minecraft/server";
import { bridge } from "../addons";

const CACHE_KEY_PREFIX = "bb_inv_cache:";

/**
 * Serializes an ItemStack into JSON format (for offline backup/caching)
 */
function serializeItem(itemStack) {
    if (!itemStack) return null;

    const data = {
        typeId: itemStack.typeId,
        amount: itemStack.amount,
        nameTag: itemStack.nameTag,
        lore: itemStack.getLore()
    };

    const durability = itemStack.getComponent("minecraft:durability");
    if (durability) {
        data.damage = durability.damage;
    }

    const enchantable = itemStack.getComponent("minecraft:enchantable");
    if (enchantable) {
        data.enchantments = [];
        for (const ench of enchantable.getEnchantments()) {
            data.enchantments.push({
                id: ench.type.id,
                level: ench.level
            });
        }
    }

    return data;
}

/**
 * Deserializes JSON into an ItemStack (fixes blank item issues)
 */
function deserializeItem(data) {
    if (!data || !data.typeId) return undefined;

    try {
        // Prevent invalid or custom prefix item IDs
        const validTypeId = data.typeId.includes("item.bf:") 
            ? data.typeId.replace("item.bf:", "minecraft:") 
            : data.typeId;

        const itemStack = new ItemStack(validTypeId, data.amount || 1);

        if (data.nameTag) itemStack.nameTag = data.nameTag;
        if (data.lore && Array.isArray(data.lore) && data.lore.length > 0) {
            itemStack.setLore(data.lore);
        }

        // Restore durability
        const durability = itemStack.getComponent("minecraft:durability");
        if (durability && data.damage !== undefined) {
            // Ensure damage does not exceed max durability
            const maxDamage = durability.maxDurability;
            durability.damage = Math.min(data.damage, maxDamage);
        }

        // Restore enchantments
        const enchantable = itemStack.getComponent("minecraft:enchantable");
        if (enchantable && data.enchantments && Array.isArray(data.enchantments)) {
            for (const ench of data.enchantments) {
                const enchType = EnchantmentTypes.get(ench.id);
                if (enchType) {
                    enchantable.addEnchantment({ type: enchType, level: ench.level });
                }
            }
        }

        return itemStack;
    } catch (e) {
        console.error(`[CopyInv] Failed to deserialize item ${data?.typeId}:`, e);
        return undefined;
    }
}

/**
 * Safely gets an equipment item from a specific slot
 */
function getEquipmentItem(equipComp, slot) {
    if (!equipComp) return undefined;
    try {
        return equipComp.getEquipment(slot);
    } catch (e) {
        return undefined;
    }
}

/**
 * Safely retrieves the player's Ender Chest container (per EntityEnderInventoryComponent spec)
 */
function getEnderContainer(player) {
    if (!player) return undefined;
    const enderComp = player.getComponent("minecraft:ender_inventory");
    return enderComp?.container;
}

/**
 * Retrieves offline player data from dynamic properties
 */
function getOfflineData(playerName) {
    try {
        const storageKey = `${CACHE_KEY_PREFIX}${playerName.toLowerCase()}`;
        const rawData = world.getDynamicProperty(storageKey);
        if (rawData && typeof rawData === "string") {
            return JSON.parse(rawData);
        }
    } catch (e) {
        console.error(`[CopyInv] Failed to load offline data for ${playerName}:`, e);
    }
    return null;
}

/**
 * Caches player inventory and equipment data
 */
function cachePlayerData(player) {
    try {
        const invContainer = player.getComponent("minecraft:inventory")?.container;
        const equipComp = player.getComponent("minecraft:equippable");
        const enderContainer = getEnderContainer(player);

        const cacheData = {
            name: player.name,
            lastUpdated: Date.now(),
            inventory: [],
            equipment: {},
            enderchest: []
        };

        if (invContainer) {
            for (let i = 0; i < invContainer.size; i++) {
                cacheData.inventory[i] = serializeItem(invContainer.getItem(i));
            }
        }

        if (equipComp) {
            cacheData.equipment.Head = serializeItem(getEquipmentItem(equipComp, EquipmentSlot.Head));
            cacheData.equipment.Chest = serializeItem(getEquipmentItem(equipComp, EquipmentSlot.Chest));
            cacheData.equipment.Legs = serializeItem(getEquipmentItem(equipComp, EquipmentSlot.Legs));
            cacheData.equipment.Feet = serializeItem(getEquipmentItem(equipComp, EquipmentSlot.Feet));
            cacheData.equipment.Offhand = serializeItem(getEquipmentItem(equipComp, EquipmentSlot.Offhand));
        }

        if (enderContainer) {
            for (let i = 0; i < enderContainer.size; i++) {
                cacheData.enderchest[i] = serializeItem(enderContainer.getItem(i));
            }
        }

        const storageKey = `${CACHE_KEY_PREFIX}${player.name.toLowerCase()}`;
        world.setDynamicProperty(storageKey, JSON.stringify(cacheData));
    } catch (e) {
        console.error(`[CopyInv] Failed to cache data for ${player.name}:`, e);
    }
}

// Caches player data every 60 seconds (1200 ticks)
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        cachePlayerData(player);
    }
}, 1200);

/**
 * Creates a Shulker Box item (uses Container Component directly to avoid NBT corruption)
 */
function createShulkerBox(player, title, itemsMap) {
    // 1. Create a Shulker Box ItemStack directly
    const shulkerItem = new ItemStack("minecraft:undyed_shulker_box", 1);
    
    // Set custom title/name
    if (title) {
        shulkerItem.nameTag = title;
    }

    // 2. Retrieve the Shulker Box Container Component
    const containerComp = shulkerItem.getComponent("minecraft:container");
    
    if (containerComp && containerComp.container) {
        const container = containerComp.container;
        
        for (const [slot, item] of Object.entries(itemsMap)) {
            if (item) {
                try {
                    // Use clone() to ensure complete NBT persistence
                    container.setItem(Number(slot), item.clone());
                } catch (e) {
                    console.error(`[CopyInv] Failed to set item at slot ${slot}:`, e);
                }
            }
        }
    } else {
        // Fallback: If direct container access fails, use legacy block placement
        return createShulkerBoxFallback(player, title, itemsMap);
    }

    return shulkerItem;
}

/**
 * Fallback method (places physical block in-world to pack items)
 */
function createShulkerBoxFallback(player, title, itemsMap) {
    const dimension = player.dimension;
    const location = player.location;
    const block = dimension.getBlock(location);
    const originalType = block.typeId;

    block.setType("minecraft:undyed_shulker_box");
    const container = block.getComponent("minecraft:inventory")?.container;

    if (container) {
        container.clearAll();
        for (const [slot, item] of Object.entries(itemsMap)) {
            if (item) {
                container.setItem(Number(slot), item.clone());
            }
        }
    }

    const shulkerItem = block.getItemStack(1, true);
    if (shulkerItem && title) {
        shulkerItem.nameTag = title;
    }

    block.setType(originalType);
    return shulkerItem;
}

// ==========================================
// Register BedrockBridge Commands
// ==========================================

bridge.bedrockCommands.registerAdminCommand(
    "copyinv",
    (executor, gamertag) => {
        if (!gamertag) {
            executor.sendMessage("§eUsage: !copyinv <player_name>");
            return;
        }

        const execContainer = executor.getComponent("minecraft:inventory")?.container;
        if (!execContainer) return;

        const onlineTarget = gamertag.readPlayer(executor);
        let box1Items = {};
        let box2Items = {};
        let targetName = "";
        let isOnline = false;

        if (onlineTarget) {
            isOnline = true;
            targetName = onlineTarget.name;
            cachePlayerData(onlineTarget);

            const inv = onlineTarget.getComponent("minecraft:inventory").container;
            const equip = onlineTarget.getComponent("minecraft:equippable");

            for (let i = 9; i < inv.size; i++) {
                const item = inv.getItem(i);
                if (item) box1Items[i - 9] = item.clone();
            }

            for (let i = 0; i < 9; i++) {
                const item = inv.getItem(i);
                if (item) box2Items[i] = item.clone();
            }

            const head = getEquipmentItem(equip, EquipmentSlot.Head);
            const chest = getEquipmentItem(equip, EquipmentSlot.Chest);
            const legs = getEquipmentItem(equip, EquipmentSlot.Legs);
            const feet = getEquipmentItem(equip, EquipmentSlot.Feet);
            const offhand = getEquipmentItem(equip, EquipmentSlot.Offhand);

            if (head) box2Items[9] = head.clone();
            if (chest) box2Items[10] = chest.clone();
            if (legs) box2Items[11] = legs.clone();
            if (feet) box2Items[12] = feet.clone();
            if (offhand) box2Items[18] = offhand.clone();
        } else {
            targetName = String(gamertag);
            const offlineData = getOfflineData(targetName);

            if (!offlineData) {
                executor.sendMessage(`§cCould not find online entity or offline cache data for player §e${targetName}§c!`);
                return;
            }

            for (let i = 9; i < offlineData.inventory.length; i++) {
                box1Items[i - 9] = deserializeItem(offlineData.inventory[i]);
            }

            for (let i = 0; i < 9; i++) {
                box2Items[i] = deserializeItem(offlineData.inventory[i]);
            }

            box2Items[9] = deserializeItem(offlineData.equipment.Head);
            box2Items[10] = deserializeItem(offlineData.equipment.Chest);
            box2Items[11] = deserializeItem(offlineData.equipment.Legs);
            box2Items[12] = deserializeItem(offlineData.equipment.Feet);
            box2Items[18] = deserializeItem(offlineData.equipment.Offhand);
        }

        const statusTag = isOnline ? "§a[Online]" : "§7[Offline Cache]";
        const box1 = createShulkerBox(executor, `§b${targetName}'s Main Inventory ${statusTag}`, box1Items);
        const box2 = createShulkerBox(executor, `§b${targetName}'s Equipment & Hotbar ${statusTag}`, box2Items);

        execContainer.addItem(box1);
        execContainer.addItem(box2);

        executor.sendMessage(`§aSuccessfully generated 2 inventory shulker boxes for player §f${targetName}§a! ${statusTag}`);
    },
    "Clones target player's inventory and equipment into shulker boxes"
);

bridge.bedrockCommands.registerAdminCommand(
    "copyender",
    (executor, gamertag) => {
        if (!gamertag) {
            executor.sendMessage("§eUsage: !copyender <player_name>");
            return;
        }

        const execContainer = executor.getComponent("minecraft:inventory")?.container;
        if (!execContainer) return;

        const onlineTarget = gamertag.readPlayer(executor);
        let boxItems = {};
        let targetName = "";
        let isOnline = false;

        if (onlineTarget) {
            isOnline = true;
            targetName = onlineTarget.name;
            cachePlayerData(onlineTarget);

            const enderContainer = getEnderContainer(onlineTarget);
            if (enderContainer) {
                for (let i = 0; i < enderContainer.size; i++) {
                    const item = enderContainer.getItem(i);
                    if (item) boxItems[i] = item.clone();
                }
            }
        } else {
            targetName = String(gamertag);
            const offlineData = getOfflineData(targetName);

            if (!offlineData) {
                executor.sendMessage(`§cCould not find online entity or offline cache data for player §e${targetName}§c!`);
                return;
            }

            if (offlineData.enderchest) {
                for (let i = 0; i < offlineData.enderchest.length; i++) {
                    boxItems[i] = deserializeItem(offlineData.enderchest[i]);
                }
            }
        }

        const statusTag = isOnline ? "§a[Online]" : "§7[Offline Cache]";
        const enderBox = createShulkerBox(executor, `§d${targetName}'s Ender Chest ${statusTag}`, boxItems);

        execContainer.addItem(enderBox);

        executor.sendMessage(`§aSuccessfully generated ender chest shulker box for player §f${targetName}§a! ${statusTag}`);
    },
    "Clones target player's ender chest into a shulker box"
);
