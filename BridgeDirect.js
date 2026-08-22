/**
 * THIS IS NOT A BRIDGE PLUGIN
 * THIS IS NOT A BRIDGE PLUGIN
 * THIS IS NOT A BRIDGE PLUGIN
 *
 * If your Minecraft server is located in Asia (or far from the Europe-based BedrockBridge server), 
 * you might sometimes experience high network latency. 
 * This can cause bridge API of sendmessage or sendembed to trigger duplicate messages (2-3 times) in Discord, even for simple events like weather changes or player sleep notifications.
 *
 * To fix this, I created a updated version of BridgeDirect.js that adds a simple 3-second global deduplication lock (isDuplicateMessage). 
 * It blocks duplicate messages/embeds sent in a short window without needing to modify your individual plugins.
 * 
 * BridgeDirect.js - BedrockBridge Core Direct Communication Interface
 *
 * Uses @minecraft/server:
 * - Provides direct communication API for plugins to dispatch messages and embeds to Discord
 * - Handles connection handshake state via script event 'discord:ready'
 * - Implements message deduplication logic (3-second window) to prevent message spam
 * 
 * v1.0.0 by beeeeeeeluga (https://github.com/Beeeeeeeluga)
 * Discord: beeeeeeeluga (807236027189297212) 
 * More plugins: https://discord.gg/kB7dWtQZKx
 *
 * Addon Support Server: https://discord.com/invite/esploratori-development-1043447184210792468
 */

import { system, world } from "@minecraft/server";

class bridgeEvent {
    constructor(event_name) {
        this.name = event_name;
    }
    subscribe(callback) {
        this.#callbacks.set(callback, callback)
        return callback;
    }
    unsubscribe(callback) {
        this.#callbacks.delete(callback)
    }
    /**@private*/
    async emit(params, ...args) {
        for (const callback of this.#callbacks.values()) {
            try {
                await callback(params, ...args);
            }
            catch (err) {
                console.error(`bridge-plugin error for ${this.name} event:\n${err}`)
            }
        }
        return params;
    }
    #callbacks = new Map();
}

// Deduplication Cache

const recentMessages = new Set();
const DEBOUNCE_TIME_MS = 3000;

function isDuplicateMessage(messageKey) {
    if (recentMessages.has(messageKey)) {
        return true; 
    }
    recentMessages.add(messageKey);
    system.runTimeout(() => {
        recentMessages.delete(messageKey);
    }, Math.floor((DEBOUNCE_TIME_MS / 1000) * 20)); // convert to game Tick
    return false;
}

/**
 * This class provides an interface for plugins to send custom messages to discord, anytime.
 * The class is independent from the pack and can be used in any other pack, as long as BedrockBridge is installed for the world.
 */
class BridgeDirect {
    #ready = false
    constructor() {
        system.afterEvents.scriptEventReceive.subscribe(e => {
            if (e.id === "discord:ready") {
                this.#ready = true;
                this.events.directInitialize.emit()
            }
        })
    }
    /**Returns true if the connection is ready and messages can be sent to discord*/
    get ready() {
        return this.#ready;
    }
    /**
     * Send a message to discord
     * @throws {Error} throws if the initialize event hasn't been fired yet
     * @param {string} message body of the message
     * @param {string?} author title of the message
     * @param {string?} picture url to a picture to be displayed as discord pfp for the message
     */
    sendMessage(message, author, picture) {
        if (this.#ready) {
            // create an unique token
            const dedupeKey = `msg:${author || ""}:${message}`;
            if (isDuplicateMessage(dedupeKey)) {
                return; // ignore any same messages sent again in 3 seconds
            }

            system.sendScriptEvent("discord:message", JSON.stringify({ 
                message: message, 
                author: author, 
                picture: picture ?? "https://i.imgur.com/9y8IvBG.png" 
            }));
        }
        else throw new Error("BridgeDirect: you cannot send a message while the bridge is not ready")
    }
    /**
     * Send a custom embed to discord.
     * @param {Object} embed embed object, according to discord API
     * @param {string?} author title of the message
     * @param {string?} picture url to a picture to be displayed as discord pfp for the message
     */
    sendEmbed(embed, author, picture) {
        if (this.#ready) {
            // create an embed token（title or description）
            const embedContent = embed ? (embed.description || embed.title || JSON.stringify(embed)) : "";
            const dedupeKey = `embed:${author || ""}:${embedContent}`;
            if (isDuplicateMessage(dedupeKey)) {
                return; // ignore any same embeds sent again in 3 seconds
            }

            system.sendScriptEvent("discord:embed", JSON.stringify({
                author: author,
                embed: embed,
                picture: picture
            }));
        }
        else throw new Error("BridgeDirect: you cannot send an embed while the bridge is not ready")
    }
    events = {
        /**Event fired when the connection is ready and messages can be sent to discord.*/
        directInitialize: new bridgeEvent("directInitialize")
    }
}

export const bridgeDirect = new BridgeDirect();
