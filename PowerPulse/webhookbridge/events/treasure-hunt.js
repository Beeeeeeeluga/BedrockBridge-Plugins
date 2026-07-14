/**
 * ============================================
 * TREASURE HUNT MODULE v4.1.0
 * ============================================
 *
 * Automatisches Tracking von wertvollen Items:
 * - Rare Block Detection
 * - Treasure Alerts
 * - Mining Streaks
 * - Rare Drop Notifications
 *
 * @module events/treasure-hunt
 */

export class TreasureHunt {
  constructor(sendWebhook, config) {
    this.sendWebhook = sendWebhook;
    this.config = config;
    this.rarities = {
      legendary: {
        name: "Legendary",
        emoji: "🌟",
        blocks: ["dragon_egg", "nether_star", "sculk_catalyst"],
        color: 0xFFD700
      },
      epic: {
        name: "Epic",
        emoji: "👑",
        blocks: ["ancient_debris", "deepslate_diamond_ore", "deepslate_emerald_ore"],
        color: 0xFF6B9D
      },
      rare: {
        name: "Rare",
        emoji: "💎",
        blocks: ["diamond_ore", "diamond_block", "emerald_ore", "emerald_block"],
        color: 0x00D4FF
      },
      uncommon: {
        name: "Uncommon",
        emoji: "🔷",
        blocks: ["gold_ore", "gold_block", "lapis_ore", "lapis_block"],
        color: 0xFFD700
      }
    };

    this.rareItems = new Map();
    this.treasureHistory = [];
    this.miningStreaks = new Map();
    this.maxTreasureHistory = 500;
  }

  /**
   * Check if block is valuable
   */
  isValuableBlock(blockType) {
    for (const rarity of Object.values(this.rarities)) {
      if (rarity.blocks.includes(blockType)) {
        return rarity;
      }
    }
    return null;
  }

  /**
   * Record treasure found
   */
  recordTreasure(playerName, playerId, blockType, location, quantity = 1) {
    const rarity = this.isValuableBlock(blockType);
    if (!rarity) return null;

    const treasure = {
      playerName,
      playerId,
      blockType,
      rarity: rarity.name,
      location,
      quantity,
      timestamp: Date.now(),
      coordinates: {
        x: Math.floor(location.x),
        y: Math.floor(location.y),
        z: Math.floor(location.z)
      }
    };

    // Add to history
    this.treasureHistory.push(treasure);
    if (this.treasureHistory.length > this.maxTreasureHistory) {
      this.treasureHistory.shift();
    }

    // Update rare items map
    if (!this.rareItems.has(playerId)) {
      this.rareItems.set(playerId, {
        playerName,
        items: new Map()
      });
    }

    const playerItems = this.rareItems.get(playerId);
    if (!playerItems.items.has(blockType)) {
      playerItems.items.set(blockType, 0);
    }
    playerItems.items.set(blockType, playerItems.items.get(blockType) + quantity);

    // Update mining streak
    this.updateMiningStreak(playerId, playerName, rarity);

    return treasure;
  }

  /**
   * Update mining streak
   */
  updateMiningStreak(playerId, playerName, rarity) {
    const now = Date.now();

    if (!this.miningStreaks.has(playerId)) {
      this.miningStreaks.set(playerId, {
        playerName,
        current: 1,
        longest: 1,
        lastMine: now,
        raritiesFound: [rarity.name]
      });
      return;
    }

    const streak = this.miningStreaks.get(playerId);
    const timeSinceLastMine = now - streak.lastMine;

    // If within 2 minutes, continue streak
    if (timeSinceLastMine < 120000) {
      streak.current++;
      if (streak.current > streak.longest) {
        streak.longest = streak.current;
      }
      streak.raritiesFound.push(rarity.name);
    } else {
      // Streak broken, reset
      streak.current = 1;
      streak.raritiesFound = [rarity.name];
    }

    streak.lastMine = now;
  }

  /**
   * Get treasure embed
   */
  getTreasureEmbed(treasure) {
    const rarity = this.rarities[Object.keys(this.rarities).find(
      (key) => this.rarities[key].name === treasure.rarity
    )];

    return {
      title: `${rarity.emoji} ${treasure.playerName} found ${treasure.rarity} treasure!`,
      description: treasure.blockType.replace(/_/g, " ").toUpperCase(),
      color: rarity.color,
      fields: [
        { name: "Block Type", value: treasure.blockType, inline: true },
        { name: "Quantity", value: treasure.quantity.toString(), inline: true },
        { name: "Rarity", value: rarity.name, inline: true },
        {
          name: "Coordinates",
          value: `X: ${treasure.coordinates.x}\nY: ${treasure.coordinates.y}\nZ: ${treasure.coordinates.z}`,
          inline: false
        }
      ],
      timestamp: new Date(treasure.timestamp).toISOString()
    };
  }

  /**
   * Get mining streak embed
   */
  getMiningStreakEmbed(playerId, streak) {
    const streakType = streak.current > 5 ? "🔥 HOT STREAK" : "⛏️ Mining Streak";

    return {
      title: `${streakType} - ${streak.playerName}`,
      description: `Current: ${streak.current} | Best: ${streak.longest}`,
      color: streak.current > 5 ? 0xFF6B6B : 0xFFD700,
      fields: [
        { name: "Current Streak", value: streak.current.toString(), inline: true },
        { name: "Longest Streak", value: streak.longest.toString(), inline: true },
        {
          name: "Found Types",
          value: streak.raritiesFound.join(", "),
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get treasure statistics
   */
  getTreasureStats(playerId) {
    const playerData = this.rareItems.get(playerId);
    if (!playerData) return null;

    const stats = {
      playerName: playerData.playerName,
      totalTreasures: Array.from(playerData.items.values()).reduce((a, b) => a + b, 0),
      items: Array.from(playerData.items.entries()).map(([type, count]) => ({
        type,
        count,
        rarity: this.getRarityForBlock(type)
      })),
      streak: this.miningStreaks.get(playerId) || null
    };

    return stats;
  }

  /**
   * Get rarity for block
   */
  getRarityForBlock(blockType) {
    for (const [key, rarity] of Object.entries(this.rarities)) {
      if (rarity.blocks.includes(blockType)) {
        return rarity.name;
      }
    }
    return "Common";
  }

  /**
   * Get top treasure hunters
   */
  getTopTreasureHunters(limit = 10) {
    const hunters = Array.from(this.rareItems.entries()).map(([id, data]) => {
      const totalCount = Array.from(data.items.values()).reduce((a, b) => a + b, 0);
      const value = this.calculateTreasureValue(data.items);

      return {
        id,
        name: data.playerName,
        treasureCount: totalCount,
        treasureValue: value,
        items: data.items
      };
    });

    return hunters.sort((a, b) => b.treasureValue - a.treasureValue).slice(0, limit);
  }

  /**
   * Calculate treasure value
   */
  calculateTreasureValue(items) {
    const weights = {
      legendary: 1000,
      epic: 500,
      rare: 100,
      uncommon: 10
    };

    let value = 0;
    for (const [blockType, count] of items.entries()) {
      const rarity = this.getRarityForBlock(blockType);
      const weight = Object.values(weights).find((w) => {
        const rarityKey = Object.keys(this.rarities).find(
          (k) => this.rarities[k].name === rarity
        );
        return weights[rarityKey] === w;
      }) || weights.uncommon;

      value += count * weight;
    }

    return value;
  }

  /**
   * Get treasure leaderboard embed
   */
  getTreasureLeaderboardEmbed() {
    const topHunters = this.getTopTreasureHunters(10);

    const fields = topHunters.map((hunter, index) => ({
      name: `${index + 1}. ${hunter.name}`,
      value: `${hunter.treasureCount} treasures (Value: ${hunter.treasureValue})`,
      inline: false
    }));

    return {
      title: "⛏️ Treasure Hunter Leaderboard",
      description: "Top treasure finders",
      color: 0xFFD700,
      fields: fields.length > 0 ? fields : [{ name: "No treasures found yet", value: "Get hunting!" }],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export treasure data
   */
  exportTreasureData() {
    const data = {
      treasures: this.treasureHistory,
      hunters: Array.from(this.rareItems.entries()).map(([id, data]) => ({
        id,
        name: data.playerName,
        items: Object.fromEntries(data.items),
        stats: this.getTreasureStats(id)
      })),
      streaks: Object.fromEntries(this.miningStreaks),
      timestamp: new Date().toISOString()
    };

    return data;
  }
}

export default TreasureHunt;
