/**
 * ============================================
 * DISCORD EMBED BUILDER v4.1.0
 * ============================================
 *
 * Zentrale Embed-Verwaltung mit Templates:
 * - Standardisierte Embeds
 * - Automatische Formatierung
 * - Konsistent Design
 * - Event-spezifische Templates
 *
 * @module core/embed-builder
 */

export class EmbedBuilder {
  constructor(config = {}) {
    this.config = config;
    this.colors = config.colors || {
      info: 0x3498DB,
      success: 0x2ECC71,
      warning: 0xF39C12,
      error: 0xE74C3C,
      primary: 0x9B59B6,
      danger: 0xE91E63,
      gold: 0xFFD700,
      gray: 0x95A5A6
    };

    this.emojis = config.emojis || {
      player: "👤",
      kill: "⚔️",
      death: "💀",
      achievement: "🏆",
      diamond: "💎",
      netherite: "🔷",
      gold: "🟨",
      emerald: "🟩",
      fire: "🔥",
      water: "💧",
      warning: "⚠️",
      check: "✅",
      x: "❌",
      star: "⭐",
      crown: "👑",
      streak: "🔥"
    };
  }

  /**
   * Build base embed
   */
  base(title, color = "info") {
    return {
      title,
      color: this.colors[color] || this.colors.info,
      timestamp: new Date().toISOString(),
      fields: []
    };
  }

  /**
   * Player Join Embed
   */
  playerJoin(playerName, playerId, onlineCount, avatar) {
    return {
      title: `${this.emojis.check} ${playerName} joined`,
      description: `Welcome to the server!`,
      color: this.colors.success,
      thumbnail: { url: avatar },
      fields: [
        { name: "Player", value: playerName, inline: true },
        { name: "Players Online", value: onlineCount.toString(), inline: true },
        { name: "Player ID", value: playerId, inline: true }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Player Leave Embed
   */
  playerLeave(playerName, playerId, playtime, avatar) {
    const playtimeStr = this.formatDuration(playtime);

    return {
      title: `${this.emojis.x} ${playerName} left`,
      description: `See you soon!`,
      color: this.colors.warning,
      thumbnail: { url: avatar },
      fields: [
        { name: "Player", value: playerName, inline: true },
        { name: "Session Time", value: playtimeStr, inline: true },
        { name: "Player ID", value: playerId, inline: true }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Death Embed
   */
  playerDeath(playerName, killer, location, kdRatio, avatar) {
    const killerDisplay = killer === "Environment" ? "⚠️ " + killer : this.emojis.kill + " " + killer;

    return {
      title: `${this.emojis.death} ${playerName} died`,
      description: `Killed by ${killerDisplay}`,
      color: this.colors.error,
      thumbnail: { url: avatar },
      fields: [
        { name: "Player", value: playerName, inline: true },
        { name: "Killer", value: killer, inline: true },
        { name: "K/D Ratio", value: kdRatio.toFixed(2), inline: true },
        {
          name: "Location",
          value: `X: ${Math.floor(location.x)}, Y: ${Math.floor(location.y)}, Z: ${Math.floor(location.z)}`,
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Kill Embed
   */
  playerKill(killerName, victimName, kdRatio, avatar) {
    return {
      title: `${this.emojis.kill} ${killerName} killed ${victimName}`,
      description: `Great kill!`,
      color: this.colors.danger,
      thumbnail: { url: avatar },
      fields: [
        { name: "Killer", value: killerName, inline: true },
        { name: "Victim", value: victimName, inline: true },
        { name: "K/D Ratio", value: kdRatio.toFixed(2), inline: true }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Achievement Embed
   */
  achievement(playerName, achievementName, points, avatar) {
    return {
      title: `${this.emojis.achievement} ${playerName} unlocked achievement!`,
      description: achievementName,
      color: this.colors.gold,
      thumbnail: { url: avatar },
      fields: [
        { name: "Player", value: playerName, inline: true },
        { name: "Points", value: points.toString(), inline: true },
        { name: "Achievement", value: achievementName, inline: false }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Rare Item Alert Embed
   */
  rareItemAlert(playerName, itemType, quantity, location, avatar) {
    const itemEmoji = this.getItemEmoji(itemType);

    return {
      title: `${itemEmoji} ${playerName} found rare item!`,
      description: `${itemType.toUpperCase()} x${quantity}`,
      color: this.colors.gold,
      thumbnail: { url: avatar },
      fields: [
        { name: "Player", value: playerName, inline: true },
        { name: "Item", value: itemType, inline: true },
        { name: "Quantity", value: quantity.toString(), inline: true },
        {
          name: "Location",
          value: `X: ${Math.floor(location.x)}, Y: ${Math.floor(location.y)}, Z: ${Math.floor(location.z)}`,
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Block Breaking Embed
   */
  blockBroken(playerName, blockType, quantity, location, avatar) {
    const blockEmoji = this.getBlockEmoji(blockType);

    return {
      title: `${blockEmoji} ${playerName} broke ${blockType}`,
      description: `Total: ${quantity}`,
      color: this.colors.gray,
      thumbnail: { url: avatar },
      fields: [
        { name: "Player", value: playerName, inline: true },
        { name: "Block", value: blockType, inline: true },
        { name: "Quantity", value: quantity.toString(), inline: true },
        {
          name: "Location",
          value: `X: ${Math.floor(location.x)}, Y: ${Math.floor(location.y)}, Z: ${Math.floor(location.z)}`,
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Login Streak Embed
   */
  loginStreak(playerName, streakDays, longestStreak, avatar, streakType = "continued") {
    let title = "";
    let description = "";
    let color = this.colors.success;

    switch (streakType) {
      case "continued":
        title = `${this.emojis.streak} ${playerName}'s streak continues!`;
        description = `Current: ${streakDays} days | Best: ${longestStreak} days`;
        break;
      case "broken":
        title = `${this.emojis.x} ${playerName}'s streak broken!`;
        description = `Was: ${longestStreak} days`;
        color = this.colors.warning;
        break;
      case "milestone":
        title = `${this.emojis.crown} ${playerName} reached ${streakDays} day streak!`;
        description = `🔥 New record!`;
        color = this.colors.gold;
        break;
    }

    return {
      title,
      description,
      color,
      thumbnail: { url: avatar },
      fields: [
        { name: "Player", value: playerName, inline: true },
        { name: "Current Streak", value: streakDays.toString(), inline: true },
        { name: "Longest Streak", value: longestStreak.toString(), inline: true }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Boss Fight Embed
   */
  bossFight(playerName, bossType, defeated, location, avatar) {
    const status = defeated ? "defeated" : "encountered";
    const emoji = defeated ? "🏆" : "⚠️";

    return {
      title: `${emoji} ${playerName} ${status} a ${bossType}!`,
      description: defeated ? "Legendary achievement!" : "Watch out!",
      color: defeated ? this.colors.gold : this.colors.warning,
      thumbnail: { url: avatar },
      fields: [
        { name: "Player", value: playerName, inline: true },
        { name: "Boss", value: bossType, inline: true },
        { name: "Status", value: defeated ? "Defeated" : "Encountered", inline: true },
        {
          name: "Location",
          value: `X: ${Math.floor(location.x)}, Y: ${Math.floor(location.y)}, Z: ${Math.floor(location.z)}`,
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Statistics Embed
   */
  playerStats(stats) {
    const kdRatio = (stats.kills || 0) / Math.max((stats.deaths || 1), 1);
    const playtimeStr = this.formatDuration(stats.totalPlaytime || 0);

    return {
      title: `📊 ${stats.name} Statistics`,
      description: "Complete player stats",
      color: this.colors.primary,
      fields: [
        { name: "Playtime", value: playtimeStr, inline: true },
        { name: "Kills", value: (stats.kills || 0).toString(), inline: true },
        { name: "Deaths", value: (stats.deaths || 0).toString(), inline: true },
        { name: "K/D Ratio", value: kdRatio.toFixed(2), inline: true },
        { name: "Messages", value: (stats.messages || 0).toString(), inline: true },
        { name: "Achievements", value: (stats.achievements || 0).toString(), inline: true },
        { name: "Joins", value: (stats.joinCount || 0).toString(), inline: true },
        { name: "Login Streak", value: (stats.loginStreak || 0).toString(), inline: true },
        { name: "Blocks Placed", value: (stats.blocksPlaced || 0).toString(), inline: true }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Server Status Embed
   */
  serverStatus(playerCount, maxPlayers, uptime, tps) {
    const tpsColor = tps >= 18 ? this.colors.success : tps >= 10 ? this.colors.warning : this.colors.error;

    return {
      title: "🖥️ Server Status",
      description: "Real-time server information",
      color: playerCount > 0 ? this.colors.success : this.colors.warning,
      fields: [
        { name: "Players Online", value: `${playerCount}/${maxPlayers}`, inline: true },
        { name: "Uptime", value: this.formatDuration(uptime), inline: true },
        { name: "TPS", value: tps.toFixed(2), inline: true }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format duration in ms to readable string
   */
  formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  /**
   * Get item emoji
   */
  getItemEmoji(itemType) {
    const itemMap = {
      diamond: this.emojis.diamond,
      netherite: this.emojis.netherite,
      gold: this.emojis.gold,
      emerald: this.emojis.emerald,
      beacon: "🔔",
      dragon_egg: "🐉",
      nether_star: "⭐",
      elytra: "🦇"
    };

    return itemMap[itemType] || "📦";
  }

  /**
   * Get block emoji
   */
  getBlockEmoji(blockType) {
    const blockMap = {
      diamond_ore: this.emojis.diamond,
      diamond_block: "🟦",
      netherite: this.emojis.netherite,
      gold_ore: this.emojis.gold,
      gold_block: "🟨",
      emerald_ore: this.emojis.emerald,
      beacon: "🔔",
      obsidian: "⬛",
      ancient_debris: this.emojis.netherite
    };

    return blockMap[blockType] || "🧱";
  }
}

export default EmbedBuilder;
