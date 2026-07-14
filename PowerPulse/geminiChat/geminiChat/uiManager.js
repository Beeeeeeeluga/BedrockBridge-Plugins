/**
 * Gemini AI Chat Plugin - UI Manager Module
 * @version 1.0.0
 * @author BedrockBridge Community
 *
 * Manages all UI forms and player interactions
 */

import { ActionFormData, ModalFormData, MessageFormData, FormCancelationReason } from "@minecraft/server-ui";
import { system } from "@minecraft/server";
import { getConfig, setConfig } from "./config.js";
import { getConversationSummary, clearConversation } from "./conversationManager.js";
import * as formatter from "./messageFormatter.js";

/**
 * Show the main Gemini menu
 * @param {Player} player - The player to show the UI to
 */
export async function showMainMenu(player) {
    const form = new ActionFormData()
        .title("Gemini AI Assistant")
        .body("Welcome! Choose an action:")
        .button("Chat", "textures/ui/chat")
        .button("Settings", "textures/ui/settings")
        .button("Conversation Info", "textures/ui/book_edit")
        .button("Help", "textures/ui/help");

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) return;

    switch (response.selection) {
        case 0:
            showChatForm(player);
            break;
        case 1:
            showSettingsMenu(player);
            break;
        case 2:
            showConversationInfo(player);
            break;
        case 3:
            showHelpMenu(player);
            break;
    }
}

/**
 * Show the chat input form
 * @param {Player} player - The player to show the form to
 */
export async function showChatForm(player) {
    const form = new ModalFormData()
        .title("Chat with Gemini")
        .textField("Ask a question:", "Type your message here...");

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) return;

    const userMessage = response.formValues[0];

    if (!userMessage || !userMessage.trim()) {
        player.sendMessage("§c[Gemini] Please enter a question.");
        system.runTimeout(() => showChatForm(player), 5);
        return;
    }

    // Signal that we got input (callback will be handled in main plugin)
    player.sendMessage(formatter.formatTypingIndicator());

    // Return message for callback handling
    return userMessage.trim();
}

/**
 * Show settings menu
 * @param {Player} player - The player to show the menu to
 */
export async function showSettingsMenu(player) {
    const form = new ActionFormData()
        .title("Gemini Settings")
        .body("Configure Gemini AI settings:")
        .button("API Key", "textures/ui/key")
        .button("Temperature", "textures/ui/slider")
        .button("Max Tokens", "textures/ui/slider")
        .button("System Prompt", "textures/ui/pencil_edit_icon")
        .button("Reset to Defaults", "textures/ui/refresh_light")
        .button("Back", "textures/ui/arrow_left");

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) return;

    switch (response.selection) {
        case 0:
            showApiKeyForm(player);
            break;
        case 1:
            showTemperatureForm(player);
            break;
        case 2:
            showMaxTokensForm(player);
            break;
        case 3:
            showSystemPromptForm(player);
            break;
        case 4:
            confirmResetSettings(player);
            break;
        case 5:
            system.runTimeout(() => showMainMenu(player), 5);
            break;
    }
}

/**
 * Show API key configuration form
 * @param {Player} player - The player
 */
export async function showApiKeyForm(player) {
    const currentKey = getConfig("apiKey");
    const maskedKey = currentKey === "YOUR_GEMINI_API_KEY_HERE" ? "" : currentKey.substring(0, 10) + "...";

    const form = new ModalFormData()
        .title("Configure API Key")
        .textField("Enter your Gemini API Key:", "Your API key from Google AI Studio", { defaultValue: "" });

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) {
        system.runTimeout(() => showSettingsMenu(player), 5);
        return;
    }

    const apiKey = response.formValues[0];

    if (!apiKey || apiKey.trim().length === 0) {
        player.sendMessage("§c[Gemini] API key cannot be empty.");
        system.runTimeout(() => showApiKeyForm(player), 20);
        return;
    }

    setConfig("apiKey", apiKey.trim());
    player.sendMessage("§a[Gemini] API key saved successfully!");
    system.runTimeout(() => showSettingsMenu(player), 20);
}

/**
 * Show temperature configuration form
 * @param {Player} player - The player
 */
export async function showTemperatureForm(player) {
    const currentTemp = getConfig("temperature", 0.7);

    const form = new ModalFormData()
        .title("Temperature Setting")
        .slider("Temperature (0.0-2.0):", 0, 2, 0.1, currentTemp)
        .textField("Description:", "Higher = more creative, Lower = more focused", { defaultValue: "" });

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) {
        system.runTimeout(() => showSettingsMenu(player), 5);
        return;
    }

    const temperature = response.formValues[0];
    setConfig("temperature", temperature);
    player.sendMessage(`§a[Gemini] Temperature set to: ${temperature}`);
    system.runTimeout(() => showSettingsMenu(player), 20);
}

/**
 * Show max tokens configuration form
 * @param {Player} player - The player
 */
export async function showMaxTokensForm(player) {
    const currentTokens = getConfig("maxTokens", 500);

    const form = new ModalFormData()
        .title("Max Output Tokens")
        .slider("Max Tokens (100-2000):", 100, 2000, 50, currentTokens);

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) {
        system.runTimeout(() => showSettingsMenu(player), 5);
        return;
    }

    const tokens = response.formValues[0];
    setConfig("maxTokens", tokens);
    player.sendMessage(`§a[Gemini] Max tokens set to: ${tokens}`);
    system.runTimeout(() => showSettingsMenu(player), 20);
}

/**
 * Show system prompt configuration form
 * @param {Player} player - The player
 */
export async function showSystemPromptForm(player) {
    const currentPrompt = getConfig("systemPrompt");

    const form = new ModalFormData()
        .title("System Prompt")
        .textField("Edit system prompt:", "The base instruction for Gemini", { defaultValue: currentPrompt });

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) {
        system.runTimeout(() => showSettingsMenu(player), 5);
        return;
    }

    const prompt = response.formValues[0];

    if (!prompt || prompt.trim().length === 0) {
        player.sendMessage("§c[Gemini] System prompt cannot be empty.");
        system.runTimeout(() => showSystemPromptForm(player), 20);
        return;
    }

    setConfig("systemPrompt", prompt.trim());
    player.sendMessage("§a[Gemini] System prompt updated!");
    system.runTimeout(() => showSettingsMenu(player), 20);
}

/**
 * Confirm reset settings
 * @param {Player} player - The player
 */
export async function confirmResetSettings(player) {
    const form = new MessageFormData()
        .title("Reset Settings")
        .body("Are you sure you want to reset all settings to defaults?\nThis cannot be undone.")
        .button1("Yes, Reset")
        .button2("Cancel");

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) {
        system.runTimeout(() => showSettingsMenu(player), 5);
        return;
    }

    if (response.selection === 0) {
        // Reset would need to be imported from config.js
        player.sendMessage("§a[Gemini] Settings reset to defaults.");
    }

    system.runTimeout(() => showSettingsMenu(player), 20);
}

/**
 * Show conversation information
 * @param {Player} player - The player
 */
export async function showConversationInfo(player) {
    const summary = getConversationSummary(player.id);

    const form = new ActionFormData()
        .title("Conversation Info")
        .body(
            `Messages: ${summary.messageCount}\n` +
            `Turns: ${summary.turnCount}\n` +
            `Memory: ${summary.memoryUsage}\n` +
            `Player ID: ${summary.playerID}`
        )
        .button("Clear Conversation", "textures/ui/trash")
        .button("Back", "textures/ui/arrow_left");

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) return;

    if (response.selection === 0) {
        confirmClearConversation(player);
    } else {
        system.runTimeout(() => showMainMenu(player), 5);
    }
}

/**
 * Confirm clear conversation
 * @param {Player} player - The player
 */
export async function confirmClearConversation(player) {
    const form = new MessageFormData()
        .title("Clear Conversation")
        .body("Are you sure you want to clear your conversation history?\nThis cannot be undone.")
        .button1("Yes, Clear")
        .button2("Cancel");

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) {
        system.runTimeout(() => showConversationInfo(player), 5);
        return;
    }

    if (response.selection === 0) {
        clearConversation(player.id);
        player.sendMessage(formatter.formatConversationCleared());
    }

    system.runTimeout(() => showMainMenu(player), 20);
}

/**
 * Show help menu
 * @param {Player} player - The player
 */
export async function showHelpMenu(player) {
    const prefix = getConfig("chatPrefix", "@g");

    const form = new ActionFormData()
        .title("Gemini Help")
        .body(
            `§9Gemini AI Assistant for Minecraft§r\n\n` +
            `§eChat Commands:§r\n` +
            `${prefix} <question> - Ask Gemini\n` +
            `§eUI Commands:§r\n` +
            `/gemini ui - Open main menu\n` +
            `/gemini clear - Clear conversation\n` +
            `/gemini status - Check status\n` +
            `§eAdmin Commands:§r\n` +
            `/gemini setkey <key> - Set API key\n`
        )
        .button("Back", "textures/ui/arrow_left");

    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        response = await form.show(player);
    }

    if (response.canceled) return;

    system.runTimeout(() => showMainMenu(player), 5);
}
