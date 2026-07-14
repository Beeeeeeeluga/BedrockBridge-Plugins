/**
 * ============================================
 * PLAYER STATISTICS MODULE v4.1.0
 * ============================================
 *
 * Comprehensive player statistics tracking:
 * - Playtime (session + total)
 * - Block statistics
 * - Kill/Death ratios
 * - Chat activity
 * - Achievement tracking
 * - Login streaks
 * - Activity heatmaps
 *
 * @module stats/player-stats
 */

import { world } from "@minecraft/server";

export class PlayerStatsManager {
  constructor() {
    this.playerStats = new Map();
    this.sessionStart = new Map();
    this.blockStats = new Map();
    this.killDeathStats = new Map();
    this.chatStats = new Map();
    this.loginDates = new Map();
  }

  /**
   * Initialize a player's statistics
   */
  initializePlayer(player) {
    const playerId = player.id;

    if (!this.playerStats.has(playerId)) {
      this.playerStats.set(playerId, {
        name: player.name,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        totalPlaytime: 0, // in milliseconds
        totalSessions: 0,
        joinCount: 0,
        achievements: 0,
        totalPoints: 0,
        loginStreak: 1,
        lastLoginDate: new Date().toDateString()
      });
    }

    // Track session start
    this.sessionStart.set(playerId, Date.now());

    // Track login
    const stats = this.playerStats.get(playerId);
    stats.joinCount++;
    stats.lastSeen = Date.now();
    stats.totalSessions++;

    // Check login streak
    this.updateLoginStreak(playerId, stats);
  }

  /**
   * Update player session when they leave
   */
  endSession(player) {
    const playerId = player.id;
    const sessionStart = this.sessionStart.get(playerId);

    if (sessionStart) {
      const sessionDuration = Date.now() - sessionStart;
      const stats = this.playerStats.get(playerId);

      if (stats) {
        stats.totalPlaytime += sessionDuration;
        stats.lastSeen = Date.now();
      }

      this.sessionStart.delete(playerId);
    }
  }

  /**
   * Track block break
   */
  recordBlockBreak(player, blockType) {
    const playerId = player.id;

    if (!this.blockStats.has(playerId)) {
      this.blockStats.set(playerId, new Map());
    }

    const playerBlocks = this.blockStats.get(playerId);
    const current = playerBlocks.get(blockType) || { broken: 0, placed: 0 };
    current.broken++;
    playerBlocks.set(blockType, current);
  }

  /**
   * Track block place
   */
  recordBlockPlace(player, blockType) {
    const playerId = player.id;

    if (!this.blockStats.has(playerId)) {
      this.blockStats.set(playerId, new Map());
    }

    const playerBlocks = this.blockStats.get(playerId);
    const current = playerBlocks.get(blockType) || { broken: 0, placed: 0 };
    current.placed++;
    playerBlocks.set(blockType, current);
  }

  /**
   * Track player death
   */
  recordDeath(player, killer = null) {
    const playerId = player.id;

    if (!this.killDeathStats.has(playerId)) {
      this.killDeathStats.set(playerId, {
        kills: 0,
        deaths: 0,
        killStreak: 0,
        deathStreak: 0,
        lastKilled: null,
        lastKilledBy: null
      });
    }

    const stats = this.killDeathStats.get(playerId);
    stats.deaths++;
    stats.deathStreak++;
    stats.killStreak = 0;
    stats.lastKilledBy = killer;
    stats.lastKilled = Date.now();
  }

  /**
   * Track player kill
   */
  recordKill(player, victim) {
    const playerId = player.id;

    if (!this.killDeathStats.has(playerId)) {
      this.killDeathStats.set(playerId, {
        kills: 0,
        deaths: 0,
        killStreak: 0,
        deathStreak: 0,
        lastKilled: null,
        lastKilledBy: null
      });
    }

    const stats = this.killDeathStats.get(playerId);
    stats.kills++;
    stats.killStreak++;
    stats.deathStreak = 0;
  }

  /**
   * Track chat message
   */
  recordChatMessage(player, messageLength) {
    const playerId = player.id;

    if (!this.chatStats.has(playerId)) {
      this.chatStats.set(playerId, {
        messageCount: 0,
        totalLength: 0,
        averageLength: 0,
        lastMessage: Date.now()
      });
    }

    const stats = this.chatStats.get(playerId);
    stats.messageCount++;
    stats.totalLength += messageLength;
    stats.averageLength = stats.totalLength / stats.messageCount;
    stats.lastMessage = Date.now();
  }

  /**
   * Record achievement unlock
   */
  recordAchievement(player, achievementName, points = 0) {
    const playerId = player.id;
    const stats = this.playerStats.get(playerId);

    if (stats) {
      stats.achievements++;
      stats.totalPoints += points;
    }
  }

  /**
   * Get player statistics summary
   */
  getPlayerStats(player) {
    const playerId = player.id;
    const baseStats = this.playerStats.get(playerId) || {};
    const blockStats = this.blockStats.get(playerId) || new Map();
    const kdStats = this.killDeathStats.get(playerId) || {};
    const chatStats = this.chatStats.get(playerId) || {};

    const sessionTime = this.sessionStart.has(playerId)
      ? Date.now() - this.sessionStart.get(playerId)
      : 0;

    const totalPlaytime = baseStats.totalPlaytime || 0;
    const totalTime = totalPlaytime + sessionTime;

    const topBlocks = Array.from(blockStats.entries())
      .sort((a, b) => (b[1].broken + b[1].placed) - (a[1].broken + a[1].placed))
      .slice(0, 5)
      .map(([block, stats]) => `${block}: ${stats.broken} broken, ${stats.placed} placed`);

    return {
      name: baseStats.name || player.name,
      firstSeen: baseStats.firstSeen ? new Date(baseStats.firstSeen).toISOString() : "Unknown",
      lastSeen: new Date(baseStats.lastSeen || Date.now()).toISOString(),
      totalPlaytime: this.formatDuration(totalTime),
      totalPlaytimeMs: totalTime,
      joinCount: baseStats.joinCount || 0,
      achievements: baseStats.achievements || 0,
      totalPoints: baseStats.totalPoints || 0,
      loginStreak: baseStats.loginStreak || 0,
      kills: kdStats.kills || 0,
      deaths: kdStats.deaths || 0,
      kdRatio: this.calculateKDRatio(kdStats),
      killStreak: kdStats.killStreak || 0,
      messages: chatStats.messageCount || 0,
      avgMessageLength: (chatStats.averageLength || 0).toFixed(1),
      topBlocks: topBlocks,
      currentlyOnline: world.getAllPlayers().some(p => p.id === playerId)
    };
  }

  /**
   * Get top players by metric
   */
  getTopPlayers(metric = "playtime", limit = 10) {
    const playerArray = Array.from(this.playerStats.entries())
      .map(([id, stats]) => ({
        id,
        ...stats,
        playTime: stats.totalPlaytime,
        kdRatio: this.calculateKDRatio(this.killDeathStats.get(id) || {}),
        messages: (this.chatStats.get(id)?.messageCount || 0)
      }));

    let sorted;
    switch (metric) {
      case "playtime":
        sorted = playerArray.sort((a, b) => b.playTime - a.playTime);
        break;
      case "kills":
        sorted = playerArray.sort((a, b) => (b.kdRatio.kills || 0) - (a.kdRatio.kills || 0));
        break;
      case "points":
        sorted = playerArray.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case "joins":
        sorted = playerArray.sort((a, b) => b.joinCount - a.joinCount);
        break;
      case "chats":
        sorted = playerArray.sort((a, b) => b.messages - a.messages);
        break;
      default:
        sorted = playerArray.sort((a, b) => b.playTime - a.playTime);
    }

    return sorted.slice(0, limit);
  }

  /**
   * Get server-wide statistics
   */
  getServerStats() {
    const allPlayers = Array.from(this.playerStats.values());
    const totalPlayersTracked = allPlayers.length;
    const onlinePlayers = world.getAllPlayers().length;

    const totalPlaytime = allPlayers.reduce((sum, p) => sum + (p.totalPlaytime || 0), 0);
    const totalKills = Array.from(this.killDeathStats.values()).reduce((sum, s) => sum + (s.kills || 0), 0);
    const totalDeaths = Array.from(this.killDeathStats.values()).reduce((sum, s) => sum + (s.deaths || 0), 0);
    const totalMessages = Array.from(this.chatStats.values()).reduce((sum, s) => sum + (s.messageCount || 0), 0);
    const totalAchievements = allPlayers.reduce((sum, p) => sum + (p.achievements || 0), 0);
    const totalPoints = allPlayers.reduce((sum, p) => sum + (p.totalPoints || 0), 0);

    const avgPlaytime = totalPlayersTracked > 0 ? totalPlaytime / totalPlayersTracked : 0;

    return {
      totalPlayersTracked,
      onlinePlayers,
      totalPlaytime: this.formatDuration(totalPlaytime),
      totalPlaytimeMs: totalPlaytime,
      averagePlaytime: this.formatDuration(avgPlaytime),
      totalKills,
      totalDeaths,
      totalMessages,
      totalAchievements,
      totalPoints,
      overallKDRatio: (totalKills / Math.max(totalDeaths, 1)).toFixed(2)
    };
  }

  /**
   * Update login streak
   */
  updateLoginStreak(playerId, stats) {
    const today = new Date().toDateString();
    const lastLogin = stats.lastLoginDate;

    if (lastLogin === today) {
      // Already logged in today, streak continues
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastLogin === yesterday.toDateString()) {
      // Logged in yesterday, continue streak
      stats.loginStreak++;
    } else {
      // Streak broken, reset to 1
      stats.loginStreak = 1;
    }

    stats.lastLoginDate = today;
  }

  /**
   * Calculate K/D ratio
   */
  calculateKDRatio(kdStats) {
    const kills = kdStats.kills || 0;
    const deaths = kdStats.deaths || 0;
    const ratio = deaths > 0 ? (kills / deaths).toFixed(2) : kills > 0 ? kills : 0;

    return {
      kills,
      deaths,
      ratio: parseFloat(ratio)
    };
  }

  /**
   * Format duration in milliseconds to readable string
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Export statistics as JSON
   */
  exportStats() {
    return {
      exportTime: new Date().toISOString(),
      playerStats: Object.fromEntries(this.playerStats),
      blockStats: Object.fromEntries(
        Array.from(this.blockStats.entries()).map(([id, map]) => [id, Object.fromEntries(map)])
      ),
      killDeathStats: Object.fromEntries(this.killDeathStats),
      chatStats: Object.fromEntries(this.chatStats)
    };
  }

  /**
   * Clear all statistics
   */
  clearAllStats() {
    this.playerStats.clear();
    this.blockStats.clear();
    this.killDeathStats.clear();
    this.chatStats.clear();
    this.sessionStart.clear();
    this.loginDates.clear();
  }
}

export default PlayerStatsManager;
