import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { transferPlayer } from "@minecraft/server-admin";
import { bridgeDirect } from "../addons"; // ggf. Pfad anpassen

// ====== Konfiguration ======
const HUB_SERVER_IP   = "serverlist.trophynetwork.de";
const HUB_SERVER_PORT = 27001;

// Serverliste (füge beliebig hinzu)
const SERVERS = [
  { name: "🏆 ServerList",        hostname: HUB_SERVER_IP,               port: HUB_SERVER_PORT, icon: "textures/ui/world_glyph_color" },
  { name: "⚔ esploratori test",  hostname: "play.esploratori.space",    port: 19132,           icon: "textures/ui/icon_recipe_nature" },
  { name: "⚔ test server",       hostname: "serverlist.trophynetwork.de", port: 27020,        icon: "textures/ui/icon_recipe_nature" },
  { name: "⚔ VIP ServerList",    hostname: "serverlist.trophynetwork.de", port: 27002,        icon: "textures/ui/icon_recipe_nature", vip: true }
];

// Cooldown (Millisekunden) um Spam zu verhindern
const TRANSFER_COOLDOWN_MS = 3000;
const lastTransfer = new Map(); // playerId => timestamp

// ====== Utils ======
function canTransfer(player) {
  const id = player.id ?? player.name; // player.id bevorzugen, fallback name
  const now = Date.now();
  const last = lastTransfer.get(id) ?? 0;
  if (now - last < TRANSFER_COOLDOWN_MS) {
    const wait = Math.ceil((TRANSFER_COOLDOWN_MS - (now - last)) / 1000);
    player.sendMessage(`§cBitte warte ${wait}s bevor du erneut transferierst.`);
    return false;
  }
  lastTransfer.set(id, now);
  return true;
}

function sendDiscordEmbed(payload, channelTag = "ServerTransfer", fallbackAvatarUrl) {
  try {
    bridgeDirect.sendEmbed(payload, channelTag, fallbackAvatarUrl);
  } catch {
    // still silent
  }
}

// ====== Globaler Restart-Transfer über ScriptEvent ======
// Ausführen via: /scriptevent trophynetwork:restartTransfer
system.afterEvents.scriptEventReceive.subscribe(ev => {
  if (ev.id !== "trophynetwork:restartTransfer") return;

  for (const player of world.getPlayers()) {
    try {
      transferPlayer(player, { hostname: HUB_SERVER_IP, port: HUB_SERVER_PORT });
      player.sendMessage("§7[§bRestart§7] §aDu wirst zur Lobby gesendet …");
    } catch (err) {
      player.sendMessage("§cLobby-Transfer fehlgeschlagen: " + (err?.message ?? err));
    }
  }

  sendDiscordEmbed({
    title: "🔄 Restart Transfer",
    description: "Alle Spieler wurden zur Lobby gesendet.",
    color: 0xe67e22,
    timestamp: new Date().toISOString(),
    footer: { text: "TrophyNetwork AutoTransfer" }
  }, "RestartTransfer", "https://mc-heads.net/avatar/Restart");
});

// ====== Kompass öffnet Menü ======
world.beforeEvents.itemUse.subscribe(ev => {
  if (ev.itemStack?.typeId !== "minecraft:compass") return;
  const player = ev.source;
  if (!player) return;
  system.run(() => openServerSelectionMenu(player));
});

// ====== UI ======
function openServerSelectionMenu(player) {
  const form = new ActionFormData()
    .title("§l§b🌐 Server Transfer Menu")
    .body("§fWähle einen Server aus:");

  SERVERS.forEach(s => form.button(s.name, s.icon));
  form.show(player).then(res => {
    if (res.canceled) return;
    const selected = SERVERS[res.selection];
    if (!selected) return;
    executeTransfer(player, selected);
  }).catch(err => {
    player.sendMessage("§cKonnte Menü nicht öffnen: " + (err?.message ?? err));
  });
}

// ====== Transfer-Logik ======
function executeTransfer(player, server) {
  if (server.vip && !player.hasTag("vip")) {
    player.sendMessage("§cDieser Server ist nur für §eVIP§c-Spieler zugänglich.");
    return;
  }

  if (!canTransfer(player)) return;

  try {
    transferPlayer(player, { hostname: server.hostname, port: server.port });
    player.sendMessage(`§aVerbinde zu ${server.hostname}:${server.port} …`);
    world.sendMessage(`§7[§bTransfer§7] §f${player.name} wechselt zu §b${server.name}§f!`);
    console.log(`Transfer: ${player.name} -> ${server.hostname}:${server.port}`);

    sendDiscordEmbed({
      title: "🔀 Server Transfer",
      description: `**${player.name}** wechselt zu **${server.name}**\n\`${server.hostname}:${server.port}\``,
      color: 0x3498db,
      timestamp: new Date().toISOString(),
      footer: { text: "TrophyNetwork Transfer Log" },
      author: { name: player.name, icon_url: `https://mc-heads.net/avatar/${player.name}` }
    }, "ServerTransfer", `https://mc-heads.net/avatar/${player.name}`);
  } catch (err) {
    console.error("Transfer failed:", err);
    player.sendMessage("§cTransfer fehlgeschlagen: " + (err?.message ?? err));
  }
}

console.log("✨ TrophyNetwork Server Transfer Plugin geladen!");
