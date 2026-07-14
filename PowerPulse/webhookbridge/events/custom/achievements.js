// Example: Custom achievement system using Webhook API
// Place this in webhook/events/custom/achievements.js or as a separate plugin

import { world } from "@minecraft/server";
import { WebhookAPI } from "../webhook/api/index.js";

// Register custom webhook type for achievements
WebhookAPI.register.webhookType("achievements");

// Register custom stats
WebhookAPI.register.stat("totalAchievements", 0);
WebhookAPI.register.stat("achievementPoints", 0);

// Achievement definitions
const achievements = {
  firstJoin: {
    id: "first_join",
    name: "Welcome!",
    description: "Join the server for the first time",
    points: 10,
    icon: "🎉"
  },
  firstChat: {
    id: "first_chat",
    name: "Hello World",
    description: "Send your first chat message",
    points: 5,
    icon: "💬"
  },
  diamondMiner: {
    id: "diamond_miner",
    name: "Diamond Miner",
    description: "Mine your first diamond",
    points: 20,
    icon: "💎"
  },
  dragonSlayer: {
    id: "dragon_slayer",
    name: "Dragon Slayer",
    description: "Defeat the Ender Dragon",
    points: 100,
    icon: "🐉"
  },
  dedicated: {
    id: "dedicated",
    name: "Dedicated Player",
    description: "Play for 24 hours total",
    points: 50,
    icon: "⏰"
  },
  social: {
    id: "social",
    name: "Social Butterfly",
    description: "Send 100 chat messages",
    points: 15,
    icon: "🦋"
  }
};

// Track player achievements
function hasAchievement(playerId, achievementId) {
  const playerData = WebhookAPI.database.getPlayerData(playerId);
  return playerData?.achievements?.includes(achievementId) || false;
}

function grantAchievement(player, achievementId) {
  if (hasAchievement(player.id, achievementId)) return;
  
  const achievement = Object.values(achievements).find(a => a.id === achievementId);
  if (!achievement) return;
  
  // Update player data
  const playerData = WebhookAPI.database.getPlayerData(player.id);
  if (!playerData.achievements) playerData.achievements = [];
  playerData.achievements.push(achievementId);
  playerData.achievementPoints = (playerData.achievementPoints || 0) + achievement.points;
  WebhookAPI.database.setPlayerData(player.id, playerData);
  
  // Update global stats
  WebhookAPI.database.incrementGlobalStat("totalAchievements");
  WebhookAPI.database.incrementGlobalStat("achievementPoints", achievement.points);
  
  // Send notification in-game
  world.sendMessage(`§6${achievement.icon} ${player.name} earned the achievement §e[${achievement.name}]§6!`);
  player.sendMessage(`§a+${achievement.points} achievement points!`);
  
  // Play sound
  player.playSound("random.levelup");
  
  // Send Discord webhook
  const embed = WebhookAPI.webhook.createEmbed()
    .setTitle(`${achievement.icon} Achievement Unlocked!`)
    .setDescription(`**${player.name}** earned **${achievement.name}**`)
    .setColor(0xFFD700)
    .addField("Description", achievement.description, false)
    .addField("Points", `+${achievement.points}`, true)
    .addField("Total Points", playerData.achievementPoints.toString(), true)
    .setThumbnail(WebhookAPI.utils.getPlayerAvatar(player.name))
    .build();
  
  WebhookAPI.webhook.send("achievements", { embeds: [embed] });
  
  // Emit achievement event
  WebhookAPI.events.emit("webhook:achievement", {
    player: player,
    achievement: achievement,
    isFirst: playerData.achievements.length === 1
  });
}

// Listen for first join
WebhookAPI.events.on("webhook:firstJoin", (data) => {
  grantAchievement(data.player, "first_join");
});

// Listen for first chat
WebhookAPI.events.on("webhook:afterChat", (data) => {
  const playerData = WebhookAPI.database.getPlayerData(data.player.id);
  if (playerData.messages === 1) {
    grantAchievement(data.player, "first_chat");
  } else if (playerData.messages === 100) {
    grantAchievement(data.player, "social");
  }
});

// Listen for block breaks
WebhookAPI.events.on("webhook:blockBreak", (data) => {
  if (data.block.typeId === "minecraft:diamond_ore" || 
      data.block.typeId === "minecraft:deepslate_diamond_ore") {
    grantAchievement(data.player, "diamond_miner");
  }
});

// Listen for boss kills
WebhookAPI.events.on("webhook:bossKill", (data) => {
  if (data.bossType === "ender_dragon") {
    grantAchievement(data.player, "dragon_slayer");
  }
});

// Check playtime achievement
WebhookAPI.events.on("webhook:afterPlayerLeave", (data) => {
  const playerData = WebhookAPI.database.getPlayerData(data.player.id);
  const totalHours = Math.floor(playerData.totalPlaytime / (1000 * 60 * 60));
  
  if (totalHours >= 24 && !hasAchievement(data.player.id, "dedicated")) {
    // Grant on next join
    playerData.pendingAchievements = playerData.pendingAchievements || [];
    playerData.pendingAchievements.push("dedicated");
    WebhookAPI.database.setPlayerData(data.player.id, playerData);
  }
});

// Check pending achievements on join
WebhookAPI.events.on("webhook:afterPlayerJoin", (data) => {
  const playerData = WebhookAPI.database.getPlayerData(data.player.id);
  
  if (playerData.pendingAchievements?.length > 0) {
    // Delay to let player fully join
    system.runTimeout(() => {
      for (const achievementId of playerData.pendingAchievements) {
        grantAchievement(data.player, achievementId);
      }
      playerData.pendingAchievements = [];
      WebhookAPI.database.setPlayerData(data.player.id, playerData);
    }, 40); // 2 seconds
  }
});

// Command to view achievements
WebhookAPI.register.command("achievements", (player, args) => {
  const targetName = args[0];
  const target = targetName 
    ? WebhookAPI.utils.getPlayerByName(targetName) 
    : player;
    
  if (!target) {
    player.sendMessage("§cPlayer not found!");
    return;
  }
  
  const playerData = WebhookAPI.database.getPlayerData(target.id);
  const earnedAchievements = playerData.achievements || [];
  const totalPoints = playerData.achievementPoints || 0;
  
  player.sendMessage(`§6=== ${target.name}'s Achievements ===`);
  player.sendMessage(`§eTotal Points: §f${totalPoints}`);
  player.sendMessage(`§eUnlocked: §f${earnedAchievements.length}/${Object.keys(achievements).length}`);
  player.sendMessage("");
  
  // Show all achievements
  for (const achievement of Object.values(achievements)) {
    const hasIt = earnedAchievements.includes(achievement.id);
    const status = hasIt ? "§a✓" : "§c✗";
    const name = hasIt ? `§f${achievement.name}` : `§7${achievement.name}`;
    
    player.sendMessage(`${status} ${achievement.icon} ${name} §7(${achievement.points} pts)`);
    if (args[1] === "details" || hasIt) {
      player.sendMessage(`   §7${achievement.description}`);
    }
  }
  
  if (args[1] !== "details") {
    player.sendMessage("\n§7Use §e/achievements [player] details§7 to see all descriptions");
  }
}, {
  description: "View achievements",
  usage: "/achievements [player] [details]"
});

// Leaderboard command
WebhookAPI.register.command("achievementtop", async (player, args) => {
  player.sendMessage("§6=== Achievement Leaderboard ===");
  
  // Get all player data
  const allPlayers = [];
  
  // This is a simplified version - in production you'd want a better way to iterate players
  for (const onlinePlayer of world.getAllPlayers()) {
    const data = WebhookAPI.database.getPlayerData(onlinePlayer.id);
    if (data.achievementPoints > 0) {
      allPlayers.push({
        name: data.name,
        points: data.achievementPoints || 0,
        count: (data.achievements || []).length
      });
    }
  }
  
  // Sort by points
  allPlayers.sort((a, b) => b.points - a.points);
  
  // Show top 10
  const top10 = allPlayers.slice(0, 10);
  top10.forEach((p, index) => {
    player.sendMessage(`§e${index + 1}. §f${p.name} §7- §6${p.points} pts §7(${p.count} achievements)`);
  });
  
  // Send to Discord if requested
  if (args[0] === "discord") {
    const embed = WebhookAPI.webhook.createEmbed()
      .setTitle("🏆 Achievement Leaderboard")
      .setColor(0xFFD700)
      .setDescription(top10.map((p, i) => 
        `**${i + 1}.** ${p.name} - **${p.points}** pts (${p.count} achievements)`
      ).join("\n"))
      .build();
    
    WebhookAPI.webhook.send("achievements", { embeds: [embed] });
    player.sendMessage("§aLeaderboard sent to Discord!");
  }
}, {
  description: "View achievement leaderboard",
  usage: "/achievementtop [discord]"
});

// Progress tracking
WebhookAPI.events.on("webhook:afterPlayerJoin", (data) => {
  const playerData = WebhookAPI.database.getPlayerData(data.player.id);
  const earned = (playerData.achievements || []).length;
  const total = Object.keys(achievements).length;
  
  if (earned > 0 && earned < total) {
    system.runTimeout(() => {
      data.player.sendMessage(`§6Achievement Progress: §e${earned}/${total} §7(${playerData.achievementPoints || 0} points)`);
      data.player.sendMessage(`§7Use §e/achievements§7 to view your progress!`);
    }, 60); // 3 seconds after join
  }
});

// Milestone rewards
const milestones = [
  { points: 50, reward: "First Milestone", emoji: "⭐" },
  { points: 100, reward: "Achievement Hunter", emoji: "🌟" },
  { points: 200, reward: "Completionist", emoji: "✨" },
  { points: 500, reward: "Achievement Master", emoji: "🏆" }
];

WebhookAPI.events.on("webhook:achievement", (data) => {
  const points = data.player.achievementPoints || 0;
  
  for (const milestone of milestones) {
    if (points >= milestone.points && points - data.achievement.points < milestone.points) {
      // Just reached this milestone!
      system.runTimeout(() => {
        world.sendMessage(`§6${milestone.emoji} ${data.player.name} reached ${milestone.points} achievement points: §e${milestone.reward}§6!`);
        
        const embed = WebhookAPI.webhook.createEmbed()
          .setTitle(`${milestone.emoji} Milestone Reached!`)
          .setDescription(`**${data.player.name}** earned the **${milestone.reward}** milestone!`)
          .setColor(0xFF6B35)
          .addField("Total Points", points.toString(), true)
          .addField("Achievements", `${data.player.achievements.length}/${Object.keys(achievements).length}`, true)
          .setThumbnail(WebhookAPI.utils.getPlayerAvatar(data.player.name))
          .build();
        
        WebhookAPI.webhook.send("achievements", { embeds: [embed] });
      }, 20);
    }
  }
});

// Daily achievement report
let lastDailyReport = Date.now();

WebhookAPI.events.on("webhook:hourlyTick", () => {
  const now = Date.now();
  const hoursSinceLastReport = (now - lastDailyReport) / (1000 * 60 * 60);
  
  if (hoursSinceLastReport >= 24) {
    lastDailyReport = now;
    
    const stats = WebhookAPI.database.getGlobalStats();
    const embed = WebhookAPI.webhook.createEmbed()
      .setTitle("📊 Daily Achievement Report")
      .setColor(0x3498DB)
      .addField("Total Achievements Earned", stats.totalAchievements?.toString() || "0", true)
      .addField("Total Points Earned", stats.achievementPoints?.toString() || "0", true)
      .addField("Most Popular", getMostPopularAchievement() || "None yet", false)
      .setTimestamp()
      .build();
    
    WebhookAPI.webhook.send("achievements", { embeds: [embed] });
  }
});

function getMostPopularAchievement() {
  const counts = {};
  
  // Count achievement frequency (simplified - in production, track this properly)
  for (const player of world.getAllPlayers()) {
    const data = WebhookAPI.database.getPlayerData(player.id);
    for (const achId of (data.achievements || [])) {
      counts[achId] = (counts[achId] || 0) + 1;
    }
  }
  
  let mostPopular = null;
  let maxCount = 0;
  
  for (const [achId, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mostPopular = achId;
    }
  }
  
  if (mostPopular) {
    const ach = Object.values(achievements).find(a => a.id === mostPopular);
    return `${ach.icon} ${ach.name} (${maxCount} players)`;
  }
  
  return null;
}

// API for other plugins
export const AchievementAPI = {
  grant: grantAchievement,
  has: hasAchievement,
  
  register: (achievement) => {
    achievements[achievement.id] = achievement;
    console.info(`[Achievements] Registered achievement: ${achievement.name}`);
  },
  
  getPlayerStats: (playerId) => {
    const data = WebhookAPI.database.getPlayerData(playerId);
    return {
      achievements: data.achievements || [],
      points: data.achievementPoints || 0,
      progress: `${(data.achievements || []).length}/${Object.keys(achievements).length}`
    };
  }
};

// Make API available globally
globalThis.AchievementAPI = AchievementAPI;

console.info("[Webhook] Achievement system loaded!");