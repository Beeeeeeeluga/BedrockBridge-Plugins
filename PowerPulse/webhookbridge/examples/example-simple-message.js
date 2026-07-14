/**
 * ============================================
 * EXAMPLE: Simple Webhook Message Plugin
 * ============================================
 *
 * This simple example shows the easiest way
 * to use the Webhook Addon - just send messages!
 */

import { world } from "@minecraft/server";
import { bridge } from "esploratori/bridgeAPI";
import { webhookAddon } from "../webhook-addon.js";

// Initialize
bridge.events.bridgeInitialize.subscribe((e) => {
  e.registerAddition("webhook_addon");
});

// Example 1: Send a simple text message
export async function sendSimpleMessage(text) {
  try {
    await webhookAddon.sendText(text, "general");
    console.log("[SimpleExample] Message sent!");
  } catch (error) {
    console.error("[SimpleExample] Failed to send:", error.message);
  }
}

// Example 2: Send a rich embed
export async function sendRichMessage(title, description) {
  try {
    await webhookAddon.sendRichEmbed({
      title: title,
      description: description,
      color: 0x3498DB,
      webhookType: "general"
    });
    console.log("[SimpleExample] Embed sent!");
  } catch (error) {
    console.error("[SimpleExample] Failed to send embed:", error.message);
  }
}

// Example 3: Send with custom fields
export async function sendWithFields(title, fields) {
  try {
    await webhookAddon.sendRichEmbed({
      title: title,
      fields: fields,
      color: 0x2ECC71,
      webhookType: "analytics"
    });
  } catch (error) {
    console.error("[SimpleExample] Error:", error.message);
  }
}

// Example 4: Use in a command
world.beforeEvents.chatSend.subscribe((event) => {
  if (event.message.startsWith("!webhook-test")) {
    event.cancel = true;

    // Send test to Discord
    sendRichMessage(
      "Test Message from Plugin",
      `Test sent by ${event.sender.name} at ${new Date().toLocaleTimeString()}`
    );

    event.sender.sendMessage("§a✓ Webhook message sent to Discord!");
  }
});

console.log("[SimpleExample] Plugin loaded! Try: !webhook-test");
