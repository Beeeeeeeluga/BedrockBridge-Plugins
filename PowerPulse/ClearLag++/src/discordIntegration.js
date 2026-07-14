/**
 * ClearLag++ Discord Integration
 * Discord Webhook & Event Integration
 */

import { world, system } from "@minecraft/server";
import { bridgeDirect } from "../../BridgeDirect.js";

export class DiscordIntegration {
  constructor(config) {
    this.config = config;
    this.isReady = false;
    this.webhooks = {};
    this.messageQueue = [];
    this.embedQueue = [];
  }

  /**
   * Initialisiert Discord Integration
   */
  initialize() {
    if (!this.config.discord.enabled) {
      console.log("§b[ClearLag++]§7 Discord Integration deaktiviert");
      return;
    }

    console.log("§b[ClearLag++]§r Discord Integration wird initialisiert...");

    // Versuche mit BridgeDirect oder Webhooks zu verbinden
    this.setupDiscordConnection();

    console.log("§b[ClearLag++]§r Discord Integration bereit!");
  }

  /**
   * Richtet Discord-Verbindung ein
   */
  setupDiscordConnection() {
    try {
      // Versuche BridgeDirect zu verwenden
      if (typeof bridgeDirect !== "undefined") {
        this.useBridgeDirect = true;
        this.isReady = true;
        console.log("§b[ClearLag++]§a BridgeDirect verbunden!");
      } else {
        // Fallback: Webhook-basierte Integration
        this.setupWebhooks();
      }
    } catch (error) {
      console.warn("§e[ClearLag++]§r Warnung: Discord-Verbindung fehlgeschlagen:", error.message);
      this.isReady = false;
    }
  }

  /**
   * Richtet Webhooks ein
   */
  setupWebhooks() {
    try {
      if (typeof webhookAddon !== "undefined") {
        this.useWebhooks = true;
        this.isReady = true;
        console.log("§b[ClearLag++]§a Webhook-Integration verbunden!");
      } else {
        console.warn("§e[ClearLag++]§r Warnung: Keine Discord-Integration verfügbar");
      }
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler bei Webhook-Setup:", error.message);
    }
  }

  /**
   * Sendet eine Detaillierte Cleanup-Benachrichtigung mit allen Statistiken
   */
  sendCleanupNotification(itemsRemoved, entitiesRemoved, passiveMobs, hostileMobs, xpRemoved = 0, vehiclesRemoved = 0, witherRemoved = 0, dragonRemoved = 0) {
    if (!this.isReady || !this.config.discord.webhooks?.cleanupNotification?.enabled) {
      return;
    }

    try {
      const embed = this.createCleanupEmbed(itemsRemoved, entitiesRemoved, passiveMobs, hostileMobs, xpRemoved, vehiclesRemoved, witherRemoved, dragonRemoved);
      this.sendEmbed(embed, "cleanupNotification");
    } catch (error) {
      console.warn("§e[ClearLag++]§r Fehler beim Senden der Cleanup-Benachrichtigung:", error.message);
    }
  }

  /**
   * Sendet eine Performance-Alert
   */
  sendPerformanceAlert(metrics) {
    if (!this.isReady || !this.config.discord.webhooks.performanceAlert.enabled) {
      return;
    }

    const embed = this.createPerformanceEmbed(metrics);
    this.sendEmbed(embed, "performanceAlert");
  }

  /**
   * Sendet einen Command-Log
   */
  sendCommandLog(player, command, result) {
    if (!this.isReady || !this.config.discord.webhooks.commandLog.enabled) {
      return;
    }

    const embed = this.createCommandLogEmbed(player, command, result);
    this.sendEmbed(embed, "commandLog");
  }

  /**
   * Erstellt einen Detaillierten Cleanup-Embed (Itemized wie Discord)
   */
  createCleanupEmbed(items, entities, passive, hostile, xp = 0, vehicles = 0, wither = 0, dragon = 0) {
    // Berechne Statistiken
    const totalMobs = passive + hostile + wither + dragon;
    const totalRemoved = items + entities + xp + vehicles;
    const timestamp = new Date();
    const timeString = timestamp.toLocaleString('de-DE');

    // Bestimme Farbe basierend auf Menge
    let color = 0x00FF00; // Grün
    if (totalRemoved > 100) color = 0xFF9900; // Orange
    if (totalRemoved > 500) color = 0xFF0000; // Rot

    return {
      title: "🧹 **ClearLag++ Server Cleanup**",
      description: `Server-Wartung durchgeführt - Insgesamt ${totalRemoved} Entities entfernt`,
      color: color,
      fields: [
        {
          name: "📦 **Items**",
          value: `\`${items}\` entfernt`,
          inline: true
        },
        {
          name: "🎲 **Entities**",
          value: `\`${entities}\` entfernt`,
          inline: true
        },
        {
          name: "✨ **XP Orbs**",
          value: `\`${xp}\` entfernt`,
          inline: true
        },
        {
          name: "🌳 **Fahrzeuge** (Boote, Wagen)",
          value: `\`${vehicles}\` entfernt`,
          inline: true
        },
        {
          name: "🐑 **Passive Mobs** (Tiere)",
          value: `\`${passive}\` entfernt`,
          inline: true
        },
        {
          name: "💀 **Feindselige Mobs** (Monster)",
          value: `\`${hostile}\` entfernt`,
          inline: true
        },
        {
          name: "👻 **Wither**",
          value: `\`${wither}\` entfernt`,
          inline: true
        },
        {
          name: "🐉 **Ender Dragon**",
          value: `\`${dragon}\` entfernt`,
          inline: true
        },
        {
          name: "━━━━━━━━━━━━━━━",
          value: "** **",
          inline: false
        },
        {
          name: "📊 **Zusammenfassung**",
          value: `**Mobs gesamt:** ${totalMobs}\n**Alles gesamt:** ${totalRemoved}`,
          inline: false
        },
        {
          name: "⏰ **Zeit**",
          value: `\`${timeString}\``,
          inline: false
        }
      ],
      timestamp: timestamp.toISOString(),
      footer: {
        text: "ClearLag++ v1.0.1 | Server Optimization Plugin",
        icon_url: "https://minecraft.wiki/images/thumb/0/03/Broom_JE2_BE2.png"
      }
    };
  }

  /**
   * Erstellt einen Performance-Alert Embed
   */
  createPerformanceEmbed(metrics) {
    const tpsColor = metrics.current.tps > 15 ? 0x00FF00 : metrics.current.tps > 10 ? 0xFFFF00 : 0xFF0000;
    const msptColor = metrics.current.mspt < 40 ? 0x00FF00 : metrics.current.mspt < 50 ? 0xFFFF00 : 0xFF0000;

    return {
      title: "⚠️ Performance Alert",
      description: `Server Performance ist beeinträchtigt`,
      color: 0xFF6600,
      fields: [
        {
          name: "📊 TPS (Ticks Per Second)",
          value: `${metrics.current.tps} / 20`,
          inline: true
        },
        {
          name: "⏱️ MSPT (Milliseconds Per Tick)",
          value: `${metrics.current.mspt}ms`,
          inline: true
        },
        {
          name: "🎲 Entities",
          value: `${metrics.current.entityCount}`,
          inline: true
        },
        {
          name: "📦 Items",
          value: `${metrics.current.itemCount}`,
          inline: true
        },
        {
          name: "💾 RAM-Auslastung",
          value: `${metrics.current.memoryPercent}%`,
          inline: true
        },
        {
          name: "👥 Spieler",
          value: `${metrics.current.playerCount}`,
          inline: true
        },
        {
          name: "🔍 Ø TPS (5min)",
          value: `${metrics.average.tps}`,
          inline: true
        },
        {
          name: "🔍 Ø MSPT (5min)",
          value: `${metrics.average.mspt}ms`,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Erstellt einen Command-Log Embed
   */
  createCommandLogEmbed(player, command, result) {
    return {
      title: "🎮 Server Command ausgeführt",
      description: `Ein Admin-Command wurde ausgeführt`,
      color: 0x0099FF,
      fields: [
        {
          name: "👤 Spieler",
          value: player.name,
          inline: true
        },
        {
          name: "⌨️ Befehl",
          value: `\`${command}\``,
          inline: true
        },
        {
          name: "✅ Ergebnis",
          value: result ? "Erfolgreich" : "Fehlgeschlagen",
          inline: true
        },
        {
          name: "⏰ Zeitstempel",
          value: new Date().toISOString(),
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Sendet einen Embed an Discord
   */
  sendEmbed(embed, webhookType) {
    if (!this.isReady) return;

    try {
      if (this.useBridgeDirect && typeof bridgeDirect !== "undefined") {
        bridgeDirect.sendEmbed(embed, "ClearLag++");
      } else if (this.useWebhooks && typeof webhookAddon !== "undefined") {
        webhookAddon.sendEmbed(embed, webhookType);
      } else {
        this.messageQueue.push({ type: "embed", data: embed, webhookType });
      }
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim Embed-Versand:", error.message);
    }
  }

  /**
   * Sendet eine einfache Text-Nachricht
   */
  sendMessage(message, author = "ClearLag++") {
    if (!this.isReady) return;

    try {
      if (this.useBridgeDirect && typeof bridgeDirect !== "undefined") {
        bridgeDirect.sendMessage(message, author);
      } else if (this.useWebhooks && typeof webhookAddon !== "undefined") {
        webhookAddon.sendText(message, "serverEvents");
      } else {
        this.messageQueue.push({ type: "message", data: message, author });
      }
    } catch (error) {
      console.error("§c[ClearLag++]§r Fehler beim Message-Versand:", error.message);
    }
  }

  /**
   * Verarbeitet die Message-Queue
   */
  processQueue() {
    if (!this.isReady || this.messageQueue.length === 0) {
      return;
    }

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();

      try {
        if (message.type === "embed") {
          this.sendEmbed(message.data, message.webhookType);
        } else if (message.type === "message") {
          this.sendMessage(message.data, message.author);
        }
      } catch (error) {
        console.error("§c[ClearLag++]§r Fehler beim Queue-Processing:", error.message);
        this.messageQueue.unshift(message); // Re-queue bei Fehler
        break;
      }
    }
  }

  /**
   * Gibt Discord-Status zurück
   */
  getStatus() {
    return {
      enabled: this.config.discord.enabled,
      ready: this.isReady,
      useBridgeDirect: this.useBridgeDirect || false,
      useWebhooks: this.useWebhooks || false,
      messageQueueSize: this.messageQueue.length
    };
  }

  /**
   * Sendet Test-Nachricht
   */
  sendTestMessage() {
    const testEmbed = {
      title: "🧪 ClearLag++ Test",
      description: "Dies ist eine Test-Nachricht",
      color: 0x9900FF,
      fields: [
        {
          name: "Status",
          value: "✅ Discord Integration funktioniert!",
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    };

    this.sendEmbed(testEmbed, "serverEvents");
    console.log("§b[ClearLag++]§a Test-Nachricht versendet!");
  }
}
