/**
 * ClearLag++ UI Timer Manager
 * ABSOLUT SILENT - KEINE WARNINGS, KEINE VALIDIERUNGSMELDUNGEN, KEINE LOGGING
 */

import { world, system, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";

export class UITimerManager {
  constructor(config, entityManager) {
    try {
      this.config = config || {};
      this.entityManager = entityManager;

      // Safe defaults
      this.countdown = 6000; // 5 minutes
      this.isCountingDown = true;
      this.showUITimer = !!world.getDynamicProperty("clearlag_show_ui");

      this.masterHostile = (entityManager?.masterHostile) || [];
      this.masterPassive = (entityManager?.masterPassive) || [];
    } catch (error) {
      // SILENT FALLBACK - no logging
      this.config = {};
      this.entityManager = null;
      this.countdown = 6000;
      this.masterHostile = [];
      this.masterPassive = [];
    }
  }

  /**
   * ABSOLUT SILENT - Gibt SICHER Cleanup-Intervall zurück
   * NIEMALS undefined, NaN - KEINE LOGGING ODER WARNINGS
   */
  getCleanupInterval() {
    try {
      const raw = world.getDynamicProperty("clearlag_interval");

      // Type check - must be number
      if (typeof raw === "number") {
        if (Number.isInteger(raw) && raw >= 600 && raw <= 12000) {
          return raw;
        }
      }

      return 6000; // Silent fallback - NO warning logged
    } catch (e) {
      return 6000; // Silent fallback - NO warning logged
    }
  }

  /**
   * Startet Timer-Loop - KEINE WARNINGS!
   */
  startTimerLoop() {
    try {
      // Get safe interval
      const interval = this.getCleanupInterval();

      system.runInterval(() => {
        try {
          this.countdown -= 1;
          const showUI = !!world.getDynamicProperty("clearlag_show_ui");

          // Show actionbar timer
          if (showUI) {
            try {
              for (const player of world.getAllPlayers()) {
                try {
                  this.showActionBarTimer(player, interval);
                } catch (e) {
                  // Silently skip
                }
              }
            } catch (e) {
              // Silently handle
            }
          }

          // Run cleanup when countdown reaches 0
          if (this.countdown <= 0) {
            try {
              if (this.entityManager) {
                this.entityManager.performFullCleanup();
              }
              this.countdown = interval;
            } catch (e) {
              this.countdown = interval;
            }
          }
        } catch (e) {
          // Silently handle loop errors
        }
      }, 1);
    } catch (error) {
      console.warn("[ClearLag++] Timer loop startup failed");
    }
  }

  /**
   * Zeigt Actionbar-Timer
   */
  showActionBarTimer(player, totalInterval) {
    try {
      if (!player) return;

      const percent = Math.max(0, Math.min(100, Math.floor((this.countdown / totalInterval) * 100)));
      const filled = Math.floor(percent / 5);
      const empty = 20 - filled;

      const bar = "§a" + "█".repeat(filled) + "§7" + "░".repeat(empty);
      const seconds = Math.ceil(this.countdown / 20);

      player.onScreenDisplay.setActionBar(`§b[ClearLag++] ${bar} §f${seconds}s`);
    } catch (e) {
      // Silently handle
    }
  }

  /**
   * Öffnet Hauptmenü
   */
  openMainMenu(player) {
    try {
      if (!player) return;

      const form = new ActionFormData()
        .title("§b[ClearLag++] §rHaupt-Menü")
        .button("🧹 Mob Einstellungen")
        .button("⚙️ Entity-Optionen")
        .button("🌍 Dimensionen")
        .button("⏱️ Timer & Whitelist")
        .button("📊 Statistiken")
        .button("❌ Schließen");

      form.show(player)
        .then((res) => {
          try {
            if (res.canceled || res.selection === 5) return;

            switch (res.selection) {
              case 0: this.openMobMenu(player); break;
              case 1: this.openEntityMenu(player); break;
              case 2: this.openDimensionMenu(player); break;
              case 3: this.openTimerMenu(player); break;
              case 4: this.openStatisticsMenu(player); break;
            }
          } catch (e) {
            // Silently handle
          }
        })
        .catch((e) => {
          // Silently handle promise rejection
        });
    } catch (error) {
      console.warn("[ClearLag++] Error opening main menu");
    }
  }

  /**
   * Öffnet Mob-Menü
   */
  openMobMenu(player) {
    try {
      if (!player) return;

      const form = new ActionFormData()
        .title("§b[ClearLag++] §rMob-Einstellungen")
        .button("🔴 Feindselige Mobs")
        .button("🟢 Passive Mobs")
        .button("⬅️ Zurück");

      form.show(player)
        .then((res) => {
          try {
            if (res.canceled) return;
            if (res.selection === 2) {
              this.openMainMenu(player);
            } else if (res.selection === 0) {
              this.openHostileMobToggle(player);
            } else if (res.selection === 1) {
              this.openPassiveMobToggle(player);
            }
          } catch (e) {
            // Silently handle
          }
        })
        .catch((e) => {
          // Silently handle
        });
    } catch (error) {
      console.warn("[ClearLag++] Error opening mob menu");
    }
  }

  /**
   * Öffnet Hostile Mobs Toggle
   */
  openHostileMobToggle(player, page = 0) {
    try {
      if (!player) return;

      const form = new ActionFormData()
        .title("§b[ClearLag++] §rFeindselige Mobs (Seite " + (page + 1) + ")")
        .button("⬅️ Zurück");

      for (let i = page * 16; i < Math.min((page + 1) * 16, this.masterHostile.length); i++) {
        form.button(this.masterHostile[i]);
      }

      if ((page + 1) * 16 < this.masterHostile.length) {
        form.button("➡️ Nächste Seite");
      }

      form.show(player)
        .then((res) => {
          try {
            if (res.canceled) return;
            if (res.selection === 0) {
              this.openMobMenu(player);
            } else if (this.masterHostile[res.selection - 1 + page * 16]) {
              // Toggle mob
            }
          } catch (e) {
            // Silently handle
          }
        })
        .catch((e) => {
          // Silently handle
        });
    } catch (error) {
      console.warn("[ClearLag++] Error opening hostile mob menu");
    }
  }

  /**
   * Öffnet Passive Mobs Toggle
   */
  openPassiveMobToggle(player, page = 0) {
    try {
      if (!player) return;

      const form = new ActionFormData()
        .title("§b[ClearLag++] §rPassive Mobs (Seite " + (page + 1) + ")")
        .button("⬅️ Zurück");

      for (let i = page * 16; i < Math.min((page + 1) * 16, this.masterPassive.length); i++) {
        form.button(this.masterPassive[i]);
      }

      if ((page + 1) * 16 < this.masterPassive.length) {
        form.button("➡️ Nächste Seite");
      }

      form.show(player)
        .then((res) => {
          try {
            if (res.canceled) return;
            if (res.selection === 0) {
              this.openMobMenu(player);
            }
          } catch (e) {
            // Silently handle
          }
        })
        .catch((e) => {
          // Silently handle
        });
    } catch (error) {
      console.warn("[ClearLag++] Error opening passive mob menu");
    }
  }

  /**
   * Öffnet Entity-Menü
   */
  openEntityMenu(player) {
    try {
      if (!player) return;

      const form = new ActionFormData()
        .title("§b[ClearLag++] §rEntity-Optionen")
        .button("☑ XP Orbs")
        .button("☑ Fahrzeuge")
        .button("☑ Wither")
        .button("☑ Dragon")
        .button("☑ Timer")
        .button("⬅️ Zurück");

      form.show(player)
        .then((res) => {
          try {
            if (res.canceled) return;
            if (res.selection === 5) {
              this.openMainMenu(player);
            }
          } catch (e) {
            // Silently handle
          }
        })
        .catch((e) => {
          // Silently handle
        });
    } catch (error) {
      console.warn("[ClearLag++] Error opening entity menu");
    }
  }

  /**
   * Öffnet Dimension-Menü
   */
  openDimensionMenu(player) {
    try {
      if (!player) return;

      const form = new ActionFormData()
        .title("§b[ClearLag++] §rDimensionen")
        .button("☑ Overworld")
        .button("☑ Nether")
        .button("☑ End")
        .button("⬅️ Zurück");

      form.show(player)
        .then((res) => {
          try {
            if (res.canceled) return;
            if (res.selection === 3) {
              this.openMainMenu(player);
            }
          } catch (e) {
            // Silently handle
          }
        })
        .catch((e) => {
          // Silently handle
        });
    } catch (error) {
      console.warn("[ClearLag++] Error opening dimension menu");
    }
  }

  /**
   * Öffnet Timer-Menü
   */
  openTimerMenu(player) {
    try {
      if (!player) return;

      const form = new ModalFormData()
        .title("§b[ClearLag++] §rTimer & Whitelist")
        .slider("Cleanup Interval (Ticks)", 600, 12000, 100, this.getCleanupInterval());

      form.show(player)
        .then((res) => {
          try {
            if (!res.canceled) {
              world.setDynamicProperty("clearlag_interval", res.formValues[0]);
              this.countdown = res.formValues[0];
            }
            this.openMainMenu(player);
          } catch (e) {
            // Silently handle
          }
        })
        .catch((e) => {
          // Silently handle
        });
    } catch (error) {
      console.warn("[ClearLag++] Error opening timer menu");
    }
  }

  /**
   * Öffnet Statistiken-Menü
   */
  openStatisticsMenu(player) {
    try {
      if (!player) return;

      const stats = this.entityManager?.getStatistics() || {};
      const msg = `§b=== ClearLag++ Statistiken ===\n` +
        `§7Items entfernt: §f${stats.totalItemsRemoved || 0}\n` +
        `§7Feindselige: §f${stats.totalHostileMobsRemoved || 0}\n` +
        `§7Passive: §f${stats.totalPassiveMobsRemoved || 0}\n` +
        `§7XP Orbs: §f${stats.totalXPRemoved || 0}\n` +
        `§7Fahrzeuge: §f${stats.totalVehiclesRemoved || 0}\n` +
        `§7Cleanups: §f${stats.cleanupCount || 0}`;

      const form = new MessageFormData()
        .title("§b[ClearLag++] §rStatistiken")
        .body(msg)
        .button1("Zurück");

      form.show(player)
        .then(() => {
          try {
            this.openMainMenu(player);
          } catch (e) {
            // Silently handle
          }
        })
        .catch((e) => {
          // Silently handle
        });
    } catch (error) {
      console.warn("[ClearLag++] Error opening statistics menu");
    }
  }
}
