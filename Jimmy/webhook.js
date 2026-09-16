/**
 * webhook.js - BedrockBridge Discord Webhook Smart Routing Plugin
 *
 * Uses @minecraft/server and @minecraft/server-net:
 * - Intercepts BedrockBridge embed and message outputs
 * - Routes messages to specific Discord webhooks based on configured keywords
 * - Matches keywords from webhook tags, titles, authors, and message content
 * - Preserves the original BedrockBridge webhook behavior for unmatched messages
 * - Supports custom Discord usernames and avatars for routed messages
 *
 * Disclaimer:
 * This plugin is not an official release or product of the original BedrockBridge addon developer.
 * It is independently developed using the Bridge API provided by the original addon.
 * The author is not affiliated with, endorsed by, or responsible for the original addon.
 * The author assumes no responsibility for any damage, data loss, service interruption,
 * misconfiguration, or other issues resulting from the use of this plugin.
 *
 * v1.0.0 by beeeeeeeluga (https://github.com/Beeeeeeeluga)
 * Discord: beeeeeeeluga (807236027189297212)
 * Contact me: https://beeeeeeeluga.github.io/
 * More plugins: https://discord.gg/kB7dWtQZKx
 *
 * Addon Support Server: https://discord.com/invite/esploratori-development-1043447184210792468
 */

import { system } from "@minecraft/server";
import { http, HttpHeader, HttpRequest, HttpRequestMethod } from "@minecraft/server-net";
import { bridgeDirect } from "../addons";

const originalSendEmbed = bridgeDirect.sendEmbed;
const originalSendMessage = bridgeDirect.sendMessage;

// replace the following webhook links to your own
// you can add more discord channels

const DISCORD_CHANNELS = {
  adminSecurity: "https://discord.com/api/webhooks/1000000000000000000/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  systemMonitor: "https://discord.com/api/webhooks/1000000000000000001/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
};

// CONFIG_RULES detects keywords from other webhook messages, including titles and message content.
// For example, to route messages from the gamemode plugin to the systemMonitor channel,
// add keywords: ["gamemode"] to the corresponding rule.

const CONFIG_RULES = [
  {
    channel: DISCORD_CHANNELS.adminSecurity,
    keywords: ["Real-time Online Player List","City Visitors","Brainstorming"]
  },
  {
    channel: DISCORD_CHANNELS.systemMonitor,
    keywords: ["TPS","TPS drop","Admin Force"]
  }
];

function postToDiscordWebhook(webhookUrl, payloadData, customName, customAvatar) {
  system.run(() => {
    try {
      const request = new HttpRequest(webhookUrl);
      request.setMethod(HttpRequestMethod.Post);
      request.setHeaders([new HttpHeader("Content-Type", "application/json")]);

      const finalBody = { ...payloadData };
      if (customName) finalBody.username = customName;
      if (customAvatar) finalBody.avatar_url = customAvatar;

      request.setBody(JSON.stringify(finalBody));
      http.request(request).catch(err => console.error(`[Webhook] Send failed: ${err}`));
    } catch (e) {
      console.error(`[Webhook] Initialization error: ${e}`);
    }
  });
}

function matchWebhookChannel(tag, title, author, textContent) {
  const checkString = `${tag || ""} | ${title || ""} | ${author || ""} | ${textContent || ""}`;
  for (const rule of CONFIG_RULES) {
    for (const kw of rule.keywords) {
      if (checkString.includes(kw)) {
        return rule.channel;
      }
    }
  }
  return null;
}

bridgeDirect.sendEmbed = function (payload, channelTag, fallbackAvatarUrl) {
  const title = payload?.title || "";
  const desc = payload?.description || "";

  const targetWebhook = matchWebhookChannel(channelTag, title, channelTag, desc);

  if (targetWebhook) {
    postToDiscordWebhook(targetWebhook, { embeds: [payload] }, channelTag, fallbackAvatarUrl);
    return;
  }

  if (typeof originalSendEmbed === "function") {
    originalSendEmbed.call(bridgeDirect, payload, channelTag, fallbackAvatarUrl);
  }
};

bridgeDirect.sendMessage = function (message, author, picture) {
  const content = message || "";

  const targetWebhook = matchWebhookChannel(author, "", author, content);

  if (targetWebhook) {
    postToDiscordWebhook(targetWebhook, { content: content }, author, picture);
    return;
  }

  if (typeof originalSendMessage === "function") {
    originalSendMessage.call(bridgeDirect, message, author, picture);
  }
};

console.log("✨ Smart routing filter is ready. Messages from unconfigured plugins will automatically be sent to the default channel!");
