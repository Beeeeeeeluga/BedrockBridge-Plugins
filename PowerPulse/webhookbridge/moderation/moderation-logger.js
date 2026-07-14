/**
 * ============================================
 * MODERATION LOGGER v4.1.0
 * ============================================
 *
 * Automatisches Logging von:
 * - Kicks und Bans
 * - Warnings und Mutes
 * - Chat Violations
 * - Spam Detection
 * - Moderation History
 *
 * @module moderation/moderation-logger
 */

export class ModerationLogger {
  constructor(sendWebhook, config) {
    this.sendWebhook = sendWebhook;
    this.config = config;
    this.moderationHistory = [];
    this.playerWarnings = new Map();
    this.bannedPlayers = new Map();
    this.mutedPlayers = new Map();
    this.spamTracker = new Map();
    this.maxHistorySize = 500;
    this.spamThreshold = {
      messages: 10,
      timeWindow: 5000 // 5 seconds
    };
  }

  /**
   * Record player kick
   */
  recordKick(playerName, playerId, reason, moderator = "System") {
    const kick = {
      type: "KICK",
      playerName,
      playerId,
      reason,
      moderator,
      timestamp: Date.now()
    };

    this.moderationHistory.push(kick);
    if (this.moderationHistory.length > this.maxHistorySize) {
      this.moderationHistory.shift();
    }

    // Update player warnings
    if (!this.playerWarnings.has(playerId)) {
      this.playerWarnings.set(playerId, {
        playerName,
        warnings: [],
        kicks: 0,
        bans: 0
      });
    }

    const stats = this.playerWarnings.get(playerId);
    stats.kicks++;

    return kick;
  }

  /**
   * Record player ban
   */
  recordBan(playerName, playerId, reason, duration, moderator = "System") {
    const ban = {
      type: "BAN",
      playerName,
      playerId,
      reason,
      duration, // in milliseconds, 0 for permanent
      moderator,
      timestamp: Date.now(),
      expiresAt: duration > 0 ? Date.now() + duration : null
    };

    this.moderationHistory.push(ban);
    if (this.moderationHistory.length > this.maxHistorySize) {
      this.moderationHistory.shift();
    }

    this.bannedPlayers.set(playerId, ban);

    // Update player stats
    if (!this.playerWarnings.has(playerId)) {
      this.playerWarnings.set(playerId, {
        playerName,
        warnings: [],
        kicks: 0,
        bans: 0
      });
    }

    const stats = this.playerWarnings.get(playerId);
    stats.bans++;

    return ban;
  }

  /**
   * Record warning
   */
  recordWarning(playerName, playerId, reason, moderator = "System") {
    const warning = {
      type: "WARNING",
      playerName,
      playerId,
      reason,
      moderator,
      timestamp: Date.now()
    };

    this.moderationHistory.push(warning);
    if (this.moderationHistory.length > this.maxHistorySize) {
      this.moderationHistory.shift();
    }

    // Track warnings per player
    if (!this.playerWarnings.has(playerId)) {
      this.playerWarnings.set(playerId, {
        playerName,
        warnings: [],
        kicks: 0,
        bans: 0
      });
    }

    const stats = this.playerWarnings.get(playerId);
    stats.warnings.push(warning);

    return warning;
  }

  /**
   * Record mute
   */
  recordMute(playerName, playerId, reason, duration, moderator = "System") {
    const mute = {
      type: "MUTE",
      playerName,
      playerId,
      reason,
      duration, // in milliseconds, 0 for permanent
      moderator,
      timestamp: Date.now(),
      expiresAt: duration > 0 ? Date.now() + duration : null
    };

    this.moderationHistory.push(mute);
    if (this.moderationHistory.length > this.maxHistorySize) {
      this.moderationHistory.shift();
    }

    this.mutedPlayers.set(playerId, mute);

    return mute;
  }

  /**
   * Check if player is banned
   */
  isBanned(playerId) {
    const ban = this.bannedPlayers.get(playerId);
    if (!ban) return false;

    // Check if permanent ban
    if (ban.expiresAt === null) return true;

    // Check if temporary ban expired
    if (Date.now() > ban.expiresAt) {
      this.bannedPlayers.delete(playerId);
      return false;
    }

    return true;
  }

  /**
   * Check if player is muted
   */
  isMuted(playerId) {
    const mute = this.mutedPlayers.get(playerId);
    if (!mute) return false;

    // Check if permanent mute
    if (mute.expiresAt === null) return true;

    // Check if temporary mute expired
    if (Date.now() > mute.expiresAt) {
      this.mutedPlayers.delete(playerId);
      return false;
    }

    return true;
  }

  /**
   * Unban player
   */
  recordUnban(playerName, playerId, moderator = "System") {
    const unban = {
      type: "UNBAN",
      playerName,
      playerId,
      moderator,
      timestamp: Date.now()
    };

    this.moderationHistory.push(unban);
    this.bannedPlayers.delete(playerId);

    return unban;
  }

  /**
   * Unmute player
   */
  recordUnmute(playerName, playerId, moderator = "System") {
    const unmute = {
      type: "UNMUTE",
      playerName,
      playerId,
      moderator,
      timestamp: Date.now()
    };

    this.moderationHistory.push(unmute);
    this.mutedPlayers.delete(playerId);

    return unmute;
  }

  /**
   * Detect and track spam
   */
  trackMessage(playerId, playerName, messageLength) {
    if (!this.spamTracker.has(playerId)) {
      this.spamTracker.set(playerId, {
        playerName,
        messages: [],
        violations: 0
      });
    }

    const tracker = this.spamTracker.get(playerId);
    const now = Date.now();

    // Remove old messages outside time window
    tracker.messages = tracker.messages.filter((ts) => now - ts < this.spamThreshold.timeWindow);

    // Check for spam
    tracker.messages.push(now);
    if (tracker.messages.length > this.spamThreshold.messages) {
      tracker.violations++;
      return true; // Spam detected
    }

    return false;
  }

  /**
   * Get moderation history for player
   */
  getPlayerModerationHistory(playerId) {
    return this.moderationHistory.filter((action) => action.playerId === playerId);
  }

  /**
   * Get moderation statistics
   */
  getModerationStats(playerId) {
    const stats = this.playerWarnings.get(playerId);
    if (!stats) return null;

    return {
      playerName: stats.playerName,
      playerId,
      totalWarnings: stats.warnings.length,
      totalKicks: stats.kicks,
      totalBans: stats.bans,
      isBanned: this.isBanned(playerId),
      isMuted: this.isMuted(playerId),
      warningDetails: stats.warnings
    };
  }

  /**
   * Get all active bans
   */
  getActiveBans() {
    const now = Date.now();
    const activeBans = [];

    for (const [playerId, ban] of this.bannedPlayers.entries()) {
      // Permanent bans or not yet expired
      if (ban.expiresAt === null || now < ban.expiresAt) {
        activeBans.push({
          ...ban,
          timeRemaining: ban.expiresAt ? ban.expiresAt - now : "Permanent"
        });
      } else {
        // Expired ban, remove it
        this.bannedPlayers.delete(playerId);
      }
    }

    return activeBans;
  }

  /**
   * Get all active mutes
   */
  getActiveMutes() {
    const now = Date.now();
    const activeMutes = [];

    for (const [playerId, mute] of this.mutedPlayers.entries()) {
      // Permanent mutes or not yet expired
      if (mute.expiresAt === null || now < mute.expiresAt) {
        activeMutes.push({
          ...mute,
          timeRemaining: mute.expiresAt ? mute.expiresAt - now : "Permanent"
        });
      } else {
        // Expired mute, remove it
        this.mutedPlayers.delete(playerId);
      }
    }

    return activeMutes;
  }

  /**
   * Get moderation report for embed
   */
  getModerationEmbed(playerId) {
    const stats = this.getModerationStats(playerId);
    if (!stats) return null;

    const banned = stats.isBanned ? "🔴 Yes" : "✅ No";
    const muted = stats.isMuted ? "🔴 Yes" : "✅ No";

    return {
      title: `⚖️ ${stats.playerName} Moderation Record`,
      description: `Player moderation history and current status`,
      color: stats.isBanned || stats.isMuted ? 0xE74C3C : 0x3498DB,
      fields: [
        { name: "Warnings", value: stats.totalWarnings.toString(), inline: true },
        { name: "Kicks", value: stats.totalKicks.toString(), inline: true },
        { name: "Bans", value: stats.totalBans.toString(), inline: true },
        { name: "Currently Banned", value: banned, inline: true },
        { name: "Currently Muted", value: muted, inline: true }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get active bans embed
   */
  getActiveBansEmbed() {
    const activeBans = this.getActiveBans();

    const fields = activeBans.slice(0, 10).map((ban) => {
      const timeRemaining =
        ban.timeRemaining === "Permanent"
          ? "Permanent"
          : this.formatDuration(ban.timeRemaining);

      return {
        name: ban.playerName,
        value: `Reason: ${ban.reason}\nExpires: ${timeRemaining}`,
        inline: false
      };
    });

    return {
      title: "🔒 Active Bans",
      description: `Total active bans: ${activeBans.length}`,
      color: 0xE74C3C,
      fields: fields.length > 0 ? fields : [{ name: "No active bans", value: "Server is clean!" }],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format duration
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
   * Export moderation data
   */
  exportModerationData() {
    return {
      history: this.moderationHistory,
      playerWarnings: Object.fromEntries(this.playerWarnings),
      activeBans: this.getActiveBans(),
      activeMutes: this.getActiveMutes(),
      timestamp: new Date().toISOString()
    };
  }
}

export default ModerationLogger;
