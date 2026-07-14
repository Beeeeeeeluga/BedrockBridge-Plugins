/**
 * ============================================
 * BOSS & DUELL SYSTEM v4.1.0
 * ============================================
 *
 * Automatisches Tracking von:
 * - Boss Fights (Ender Dragon, Wither, etc.)
 * - PvP Duelle
 * - Epic Battles
 * - Combat Statistics
 *
 * @module events/boss-system
 */

export class BossSystem {
  constructor(sendWebhook, config) {
    this.sendWebhook = sendWebhook;
    this.config = config;
    this.bosses = {
      ender_dragon: { name: "Ender Dragon", difficulty: "EXTREME", emoji: "🐉", reward: 100 },
      wither: { name: "Wither", difficulty: "EXTREME", emoji: "☠️", reward: 80 },
      cave_spider: { name: "Cave Spider", difficulty: "HARD", emoji: "🕷️", reward: 20 },
      creeper: { name: "Creeper", difficulty: "MEDIUM", emoji: "💥", reward: 10 }
    };

    this.bossEncounters = [];
    this.duelMatches = [];
    this.playerDuelStats = new Map();
    this.epicBattles = [];
    this.maxHistorySize = 500;
  }

  /**
   * Record boss encounter
   */
  recordBossEncounter(playerName, playerId, bossType, defeated, location, duration = 0) {
    const boss = this.bosses[bossType] || {
      name: bossType,
      difficulty: "UNKNOWN",
      emoji: "👹",
      reward: 5
    };

    const encounter = {
      playerName,
      playerId,
      bossType,
      bossName: boss.name,
      defeated,
      location,
      duration,
      timestamp: Date.now(),
      reward: defeated ? boss.reward : 0
    };

    this.bossEncounters.push(encounter);
    if (this.bossEncounters.length > this.maxHistorySize) {
      this.bossEncounters.shift();
    }

    // Record in player stats
    if (!this.playerDuelStats.has(playerId)) {
      this.playerDuelStats.set(playerId, {
        playerName,
        bossesDefeated: 0,
        bossesEncountered: 0,
        totalDuels: 0,
        duelWins: 0,
        totalRewards: 0
      });
    }

    const stats = this.playerDuelStats.get(playerId);
    stats.bossesEncountered++;
    if (defeated) {
      stats.bossesDefeated++;
      stats.totalRewards += boss.reward;
    }

    return encounter;
  }

  /**
   * Record PvP duel
   */
  recordDuel(player1Name, player1Id, player2Name, player2Id, winner, location, duration = 0) {
    const duel = {
      player1: { name: player1Name, id: player1Id },
      player2: { name: player2Name, id: player2Id },
      winner: winner,
      loser: winner === player1Name ? player2Name : player1Name,
      location,
      duration,
      timestamp: Date.now(),
      reward: 20
    };

    this.duelMatches.push(duel);
    if (this.duelMatches.length > this.maxHistorySize) {
      this.duelMatches.shift();
    }

    // Update player stats
    for (const [playerId, playerName] of [[player1Id, player1Name], [player2Id, player2Name]]) {
      if (!this.playerDuelStats.has(playerId)) {
        this.playerDuelStats.set(playerId, {
          playerName,
          bossesDefeated: 0,
          bossesEncountered: 0,
          totalDuels: 0,
          duelWins: 0,
          totalRewards: 0
        });
      }

      const stats = this.playerDuelStats.get(playerId);
      stats.totalDuels++;
      if (playerName === winner) {
        stats.duelWins++;
        stats.totalRewards += duel.reward;
      }
    }

    return duel;
  }

  /**
   * Record epic battle (3+ players)
   */
  recordEpicBattle(players, victors, location, duration = 0) {
    const battle = {
      playerCount: players.length,
      players: players,
      victors: victors,
      location,
      duration,
      timestamp: Date.now(),
      reward: Math.floor(30 * (players.length / 2))
    };

    this.epicBattles.push(battle);
    if (this.epicBattles.length > this.maxHistorySize) {
      this.epicBattles.shift();
    }

    // Award rewards
    for (const victor of victors) {
      if (this.playerDuelStats.has(victor.id)) {
        const stats = this.playerDuelStats.get(victor.id);
        stats.totalRewards += battle.reward;
      }
    }

    return battle;
  }

  /**
   * Get boss encounter embed
   */
  getBossEncounterEmbed(encounter) {
    const statusEmoji = encounter.defeated ? "🏆" : "💀";
    const statusText = encounter.defeated ? "DEFEATED" : "ENCOUNTERED";
    const durationStr = this.formatDuration(encounter.duration);

    return {
      title: `${statusEmoji} ${encounter.playerName} ${statusText} ${encounter.bossName}!`,
      description: encounter.defeated ? "Legendary victory!" : "Epic encounter!",
      color: encounter.defeated ? 0xFFD700 : 0xFF6B6B,
      fields: [
        { name: "Boss", value: encounter.bossName, inline: true },
        { name: "Status", value: statusText, inline: true },
        { name: "Player", value: encounter.playerName, inline: true },
        { name: "Duration", value: durationStr, inline: true },
        { name: "Reward", value: `+${encounter.reward} points`, inline: true },
        { name: "\u200b", value: "\u200b", inline: true },
        {
          name: "Location",
          value: `X: ${Math.floor(encounter.location.x)}\nY: ${Math.floor(encounter.location.y)}\nZ: ${Math.floor(encounter.location.z)}`,
          inline: false
        }
      ],
      timestamp: new Date(encounter.timestamp).toISOString()
    };
  }

  /**
   * Get duel embed
   */
  getDuelEmbed(duel) {
    const durationStr = this.formatDuration(duel.duration);

    return {
      title: `⚔️ ${duel.winner} defeated ${duel.loser}!`,
      description: "Epic PvP battle!",
      color: 0xFF6B6B,
      fields: [
        { name: "Winner", value: duel.winner, inline: true },
        { name: "Loser", value: duel.loser, inline: true },
        { name: "Duration", value: durationStr, inline: true },
        { name: "Reward", value: `+${duel.reward} points`, inline: true },
        { name: "\u200b", value: "\u200b", inline: true },
        {
          name: "Location",
          value: `X: ${Math.floor(duel.location.x)}\nY: ${Math.floor(duel.location.y)}\nZ: ${Math.floor(duel.location.z)}`,
          inline: false
        }
      ],
      timestamp: new Date(duel.timestamp).toISOString()
    };
  }

  /**
   * Get epic battle embed
   */
  getEpicBattleEmbed(battle) {
    const durationStr = this.formatDuration(battle.duration);
    const victorsStr = battle.victors.map((v) => v.name).join(", ");

    return {
      title: `🔥 EPIC BATTLE - ${battle.victors.length} vs ${battle.players.length - battle.victors.length}`,
      description: `${victorsStr} claimed victory!`,
      color: 0xFF00FF,
      fields: [
        { name: "Total Players", value: battle.players.length.toString(), inline: true },
        { name: "Victors", value: battle.victors.length.toString(), inline: true },
        { name: "Duration", value: durationStr, inline: true },
        { name: "Reward Per Victor", value: `+${battle.reward} points`, inline: true },
        {
          name: "Victorious Players",
          value: victorsStr || "None",
          inline: false
        }
      ],
      timestamp: new Date(battle.timestamp).toISOString()
    };
  }

  /**
   * Get combat statistics embed
   */
  getCombatStatsEmbed(playerId) {
    const stats = this.playerDuelStats.get(playerId);
    if (!stats) return null;

    const duelWinRate = stats.totalDuels > 0 ? ((stats.duelWins / stats.totalDuels) * 100).toFixed(1) : 0;
    const bossWinRate =
      stats.bossesEncountered > 0 ? ((stats.bossesDefeated / stats.bossesEncountered) * 100).toFixed(1) : 0;

    return {
      title: `⚔️ ${stats.playerName} Combat Statistics`,
      description: "Battle history and achievements",
      color: 0xFF6B6B,
      fields: [
        { name: "Total Duels", value: stats.totalDuels.toString(), inline: true },
        { name: "Duel Wins", value: stats.duelWins.toString(), inline: true },
        { name: "Win Rate", value: `${duelWinRate}%`, inline: true },
        { name: "Boss Encounters", value: stats.bossesEncountered.toString(), inline: true },
        { name: "Bosses Defeated", value: stats.bossesDefeated.toString(), inline: true },
        { name: "Boss Win Rate", value: `${bossWinRate}%`, inline: true },
        { name: "Total Rewards", value: `+${stats.totalRewards} points`, inline: true }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get duel leaderboard
   */
  getDuelLeaderboard(limit = 10) {
    return Array.from(this.playerDuelStats.values())
      .sort((a, b) => b.duelWins - a.duelWins)
      .slice(0, limit);
  }

  /**
   * Get boss slayer leaderboard
   */
  getBossSlayerLeaderboard(limit = 10) {
    return Array.from(this.playerDuelStats.values())
      .sort((a, b) => b.bossesDefeated - a.bossesDefeated)
      .slice(0, limit);
  }

  /**
   * Format duration
   */
  formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  /**
   * Export combat data
   */
  exportCombatData() {
    return {
      bossEncounters: this.bossEncounters,
      duelMatches: this.duelMatches,
      epicBattles: this.epicBattles,
      playerStats: Object.fromEntries(this.playerDuelStats),
      timestamp: new Date().toISOString()
    };
  }
}

export default BossSystem;
