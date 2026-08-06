import { world, system, ItemStack, EquipmentSlot, EnchantmentTypes } from "@minecraft/server";
import { bridge } from "../addons";

const CACHE_KEY_PREFIX = "bb_inv_cache:";

/**
 * 將 ItemStack 序列化為 JSON (用於離線備份)
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
 * 將 JSON 反序列化為 ItemStack (修正空白物品問題)
 */
function deserializeItem(data) {
    if (!data || !data.typeId) return undefined;

    try {
        // 防止出現異物 ID
        const validTypeId = data.typeId.includes("item.bf:") 
            ? data.typeId.replace("item.bf:", "minecraft:") 
            : data.typeId;

        const itemStack = new ItemStack(validTypeId, data.amount || 1);

        if (data.nameTag) itemStack.nameTag = data.nameTag;
        if (data.lore && Array.isArray(data.lore) && data.lore.length > 0) {
            itemStack.setLore(data.lore);
        }

        // 耐久度還原
        const durability = itemStack.getComponent("minecraft:durability");
        if (durability && data.damage !== undefined) {
            // 確保 damage 不超過最大耐久
            const maxDamage = durability.maxDurability;
            durability.damage = Math.min(data.damage, maxDamage);
        }

        // 附魔還原
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
 * 安全取得裝備欄物品
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
 * 安全取得玩家末影箱 Container (根據官方 EntityEnderInventoryComponent 規範)
 */
function getEnderContainer(player) {
    if (!player) return undefined;
    const enderComp = player.getComponent("minecraft:ender_inventory");
    return enderComp?.container;
}

/**
 * 快取玩家資料
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

// 每 60 秒快取一次
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        cachePlayerData(player);
    }
}, 1200);

/**
 * 建立 Shulker Box (直接使用 Container Component，避免 NBT 毀損)
 */
function createShulkerBox(player, title, itemsMap) {
    // 1. 直接建立一個 Shulker Box 的 ItemStack
    const shulkerItem = new ItemStack("minecraft:undyed_shulker_box", 1);
    
    // 設定自訂名稱
    if (title) {
        shulkerItem.nameTag = title;
    }

    // 2. 取得 Shulker Box 的 Container Component
    const containerComp = shulkerItem.getComponent("minecraft:container");
    
    if (containerComp && containerComp.container) {
        const container = containerComp.container;
        
        for (const [slot, item] of Object.entries(itemsMap)) {
            if (item) {
                try {
                    // 使用 clone() 確保 NBT 完整傳遞
                    container.setItem(Number(slot), item.clone());
                } catch (e) {
                    console.error(`[CopyInv] Failed to set item at slot ${slot}:`, e);
                }
            }
        }
    } else {
        // 備用方案：若直接讀取 container 失敗，則使用舊的方塊擺放法
        return createShulkerBoxFallback(player, title, itemsMap);
    }

    return shulkerItem;
}

/**
 * 備用方案 (擺放實體方塊打包)
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
// 註冊 BedrockBridge 指令
// ==========================================

bridge.bedrockCommands.registerAdminCommand(
    "copyinv",
    (executor, gamertag) => {
        if (!gamertag) {
            executor.sendMessage("§e用法: !copyinv <玩家名稱>");
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
                executor.sendMessage(`§c找不到玩家 §e${targetName} §c的在線實體或離線快取資料！`);
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

        const statusTag = isOnline ? "§a[在線]" : "§7[離線快取]";
        const box1 = createShulkerBox(executor, `§b${targetName} 的主背包 ${statusTag}`, box1Items);
        const box2 = createShulkerBox(executor, `§b${targetName} 的裝備與快捷列 ${statusTag}`, box2Items);

        execContainer.addItem(box1);
        execContainer.addItem(box2);

        executor.sendMessage(`§a成功生成玩家 §f${targetName} §a的 2 個背包潛影盒！ ${statusTag}`);
    },
    "複製目標玩家的背包與裝備並生成為潛影盒"
);

bridge.bedrockCommands.registerAdminCommand(
    "copyender",
    (executor, gamertag) => {
        if (!gamertag) {
            executor.sendMessage("§e用法: !copyender <玩家名稱>");
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
                executor.sendMessage(`§c找不到玩家 §e${targetName} §c的在線實體或離線快取資料！`);
                return;
            }

            if (offlineData.enderchest) {
                for (let i = 0; i < offlineData.enderchest.length; i++) {
                    boxItems[i] = deserializeItem(offlineData.enderchest[i]);
                }
            }
        }

        const statusTag = isOnline ? "§a[在線]" : "§7[離線快取]";
        const enderBox = createShulkerBox(executor, `§d${targetName} 的末影箱 ${statusTag}`, boxItems);

        execContainer.addItem(enderBox);

        executor.sendMessage(`§a成功生成玩家 §f${targetName} §a的末影箱潛影盒！ ${statusTag}`);
    },
    "複製目標玩家的末影箱並生成為潛影盒"
);
