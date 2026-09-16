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
