/**
 * ============================================
 * ADVANCED STATISTICS MODULE v4.1.0
 * ============================================
 *
 * Erweiterte Statistiken:
 * - Top Players Leaderboards
 * - Achievement Tracking
 * - Login Streaks
 * - Playtime Milestones
 * - Activity Scores
 *
 * @module stats/advanced-stats
 */

export class AdvancedStats {
  constructor() {
    this.achievements = new Map();
    this.streaks = new Map();
    this.milestones = new Map();
    this.activityScores = new Map();
    this.playtimeThresholds = [
      { hours: 1, name: "First Steps", reward: "🐣" },
      { hours: 10, name: "Getting Started", reward: "⭐" },
      { hours: 25, name: "Addicted", reward: "🔥" },
      { hours: 50, name: "Legend", reward: "👑" },
      { hours: 100, name: "Eternal", reward: "✨" },
      { hours: 250, name: "Immortal", reward: "🌟" }
    ];
  }

  /**
   * Calculate activity score for a player
   */
  calculateActivityScore(stats) {
    let score = 0;

    // Playtime points
    const playtimeHours = (stats.totalPlaytime || 0) / 3600000;
    score += playtimeHours * 10;

    // Kill/Death ratio points
    const kdRatio = (stats.kills || 0) / Math.max((stats.deaths || 1), 1);
    score += kdRatio * 50;

    // Chat activity points
    const chatActivity = (stats.messages || 0) / 10;
    score += chatActivity * 5;

    // Block statistics points
    const blocksPlaced = (stats.blocksPlaced || 0);
    const blocksDestroyed = (stats.blocksDestroyed || 0);
    score += (blocksPlaced + blocksDestroyed) * 0.5;

    // Achievement points
    score += (stats.achievements || 0) * 100;

    return Math.floor(score);
  }

  /**
   * Track player achievements
   */
  recordAchievement(playerName, playerId, achievement, points = 10) {
    if (!this.achievements.has(playerId)) {
      this.achievements.set(playerId, {
        playerName,
        unlocked: [],
        totalPoints: 0
      });
    }

    const playerAchievements = this.achievements.get(playerId);
    playerAchievements.unlocked.push({
      name: achievement,
      unlockedAt: Date.now(),
      points
    });
    playerAchievements.totalPoints += points;
  }

  /**
   * Get player achievements
   */
  getPlayerAchievements(playerId) {
    return this.achievements.get(playerId) || {
      playerName: "Unknown",
      unlocked: [],
      totalPoints: 0
    };
  }

  /**
   * Track login streak
   */
  updateLoginStreak(playerId, playerName) {
    const today = new Date().toDateString();

    if (!this.streaks.has(playerId)) {
      this.streaks.set(playerId, {
        playerName,
        currentStreak: 1,
        longestStreak: 1,
        lastLogin: today,
        loginDates: [today]
      });
      return { streakType: "first_login", streak: 1 };
    }

    const streak = this.streaks.get(playerId);
    const lastLogin = streak.lastLogin;

    // Check if logged in today
    if (lastLogin === today) {
      return { streakType: "already_logged_in", streak: streak.currentStreak };
    }

    // Calculate days since last login
    const lastDate = new Date(lastLogin);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day - increase streak
      streak.currentStreak++;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
      streak.lastLogin = today;
      streak.loginDates.push(today);

      return { streakType: "streak_continued", streak: streak.currentStreak };
    } else {
      // Streak broken - reset
      const oldStreak = streak.currentStreak;
      streak.currentStreak = 1;
      streak.lastLogin = today;
      streak.loginDates.push(today);

      return { streakType: "streak_broken", oldStreak, newStreak: 1 };
    }
  }

  /**
   * Check playtime milestones
   */
  checkPlaytimeMilestones(playtimeMs) {
    const playtimeHours = playtimeMs / 3600000;
    const achievedMilestones = [];

    for (const milestone of this.playtimeThresholds) {
      if (playtimeHours >= milestone.hours) {
        achievedMilestones.push(milestone);
      }
    }

    return achievedMilestones;
  }

  /**
   * Get top players by metric
   */
  getTopPlayers(allStats, metric = "activityScore", limit = 10) {
    const players = Array.from(allStats.entries()).map(([id, stats]) => {
      let value = 0;

      switch (metric) {
        case "playtime":
          value = (stats.totalPlaytime || 0) / 3600000; // Convert to hours
          break;
        case "kills":
          value = stats.kills || 0;
          break;
        case "deaths":
          value = stats.deaths || 0;
          break;
        case "ratio":
          value = (stats.kills || 0) / Math.max((stats.deaths || 1), 1);
          break;
        case "messages":
          value = stats.messages || 0;
          break;
        case "blocks":
          value = (stats.blocksPlaced || 0) + (stats.blocksDestroyed || 0);
          break;
        case "activityScore":
        default:
          value = this.calculateActivityScore(stats);
      }

      return {
        id,
        name: stats.name,
        value,
        stats
      };
    });

    return players
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  /**
   * Get leaderboard embed
   */
  getLeaderboardEmbed(allStats, metric = "activityScore") {
    const topPlayers = this.getTopPlayers(allStats, metric, 10);

    let title = "Leaderboard";
    let description = "";
    let icon = "🏆";

    switch (metric) {
      case "playtime":
        title = "⏱️ Most Playtime";
        description = "Top 10 by total playtime";
        break;
      case "kills":
        title = "⚔️ Most Kills";
        description = "Top 10 killers";
        break;
      case "deaths":
        title = "💀 Most Deaths";
        description = "Top 10 by death count";
        break;
      case "ratio":
        title = "🎯 Best K/D Ratio";
        description = "Top 10 K/D ratios";
        break;
      case "messages":
        title = "💬 Most Chatty";
        description = "Top 10 by messages";
        break;
      case "blocks":
        title = "🧱 Most Building";
        description = "Top 10 blocks broken/placed";
        break;
      case "activityScore":
        title = "⭐ Activity Score";
        description = "Top 10 overall activity";
        break;
    }

    const fields = topPlayers.map((player, index) => {
      let displayValue = player.value;

      if (metric === "playtime") {
        const hours = Math.floor(player.value);
        const mins = Math.floor((player.value % 1) * 60);
        displayValue = `${hours}h ${mins}m`;
      } else if (metric === "ratio") {
        displayValue = player.value.toFixed(2);
      } else {
        displayValue = Math.floor(player.value);
      }

      return {
        name: `${index + 1}. ${player.name}`,
        value: displayValue.toString(),
        inline: false
      };
    });

    return {
      title: `${icon} ${title}`,
      description,
      color: 0xFFD700,
      fields: fields.length > 0 ? fields : [{ name: "No data yet", value: "Players needed" }],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get achievement statistics
   */
  getAchievementStats() {
    const stats = {
      totalAchievements: 0,
      totalPoints: 0,
      byPlayer: []
    };

    for (const [id, achievements] of this.achievements.entries()) {
      stats.totalAchievements += achievements.unlocked.length;
      stats.totalPoints += achievements.totalPoints;

      stats.byPlayer.push({
        id,
        name: achievements.playerName,
        achievements: achievements.unlocked.length,
        points: achievements.totalPoints
      });
    }

    stats.byPlayer.sort((a, b) => b.points - a.points);
    return stats;
  }

  /**
   * Get streak statistics
   */
  getStreakStats() {
    const stats = {
      longestStreaks: [],
      currentStreaks: []
    };

    for (const [id, streakData] of this.streaks.entries()) {
      stats.longestStreaks.push({
        id,
        name: streakData.playerName,
        streak: streakData.longestStreak
      });

      stats.currentStreaks.push({
        id,
        name: streakData.playerName,
        streak: streakData.currentStreak
      });
    }

    stats.longestStreaks.sort((a, b) => b.streak - a.streak);
    stats.currentStreaks.sort((a, b) => b.streak - a.streak);

    return stats;
  }

  /**
   * Export all advanced stats
   */
  exportAdvancedStats() {
    return {
      achievements: Object.fromEntries(this.achievements),
      streaks: Object.fromEntries(this.streaks),
      activityScores: Object.fromEntries(this.activityScores),
      timestamp: new Date().toISOString()
    };
  }
}

export default AdvancedStats;
