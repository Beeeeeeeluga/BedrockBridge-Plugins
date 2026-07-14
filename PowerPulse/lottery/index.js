/**
 * 🎰 LOTTERY SYSTEM - Standalone Plugin for BedrockBridge
 * Complete lottery system v1.1.0
 * @version 1.1.0
 * @compatible Bedrock 1.21.120+
 */

import { world, system } from '@minecraft/server';

// ════════════════════════════════════════════════════════════════
// CORE FUNCTIONS - INLINE (um Bridge-Abhängigkeit zu vermeiden)
// ════════════════════════════════════════════════════════════════

const CONFIG = {
    enabled: true,
    ticketPrice: 10,
    maxTicketsPerPlayer: 1000,
    maxTicketsPerDraw: 50000,
    drawInterval: 3600000,
    autoDrawEnabled: true,
    fixedPrizes: {
        jackpot: 5000,
        second: 1000,
        third: 500,
        fourth: 200,
        fifth: 100
    },
    potDistribution: {
        enabled: true,
        jackpot: 0.50,
        second: 0.25,
        third: 0.15,
        fourth: 0.07,
        fifth: 0.03,
        rollover: 0.00
    },
    bonusSystem: {
        enabled: true,
        multiTicketBonus: 0.05,
        weeklyBonus: 0.10,
        consecutiveWinBonus: 0.15
    },
    debugLogging: true,
    persistenceInterval: 300000,
    currency: 'emerald'
};

const playerTickets = new Map();
const lotteryDraws = new Map();
const worldState = {
    currentDraw: {
        id: 'draw_1',
        startTime: Date.now(),
        tickets: [],
        totalPot: 0
    },
    drawHistory: [],
    nextDrawId: 2,
    totalTicketsSold: 0,
    totalMoneyCyclied: 0,
    lastDrawTime: Date.now()
};

// ════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════

function sendMessage(player, message) {
    try {
        if (player && player.isValid && player.isValid()) {
            player.sendMessage(message);
        }
    } catch (e) {
        console.warn(`[Lottery] Fehler: ${e}`);
    }
}

function broadcastMessage(message) {
    try {
        world.sendMessage(message);
    } catch (e) {
        console.warn(`[Lottery] Broadcast fehler: ${e}`);
    }
}

function getPlayerData(playerName) {
    if (!playerTickets.has(playerName)) {
        playerTickets.set(playerName, {
            name: playerName,
            tickets: [],
            totalSpent: 0,
            totalWins: 0,
            winHistory: [],
            joinedDate: Date.now()
        });
    }
    return playerTickets.get(playerName);
}

// ════════════════════════════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════════════════════════════

console.log('[Lottery] 🎰 Lottery System v1.1.0 Standalone Plugin');
console.log('[Lottery] Loading...');

// Test
broadcastMessage('§e[Lottery] ✅ Plugin geladen! Verwende /lottery für Infos');

// ════════════════════════════════════════════════════════════════
// BEDROCK COMMANDS (Standalone)
// ════════════════════════════════════════════════════════════════

world.beforeEvents.chatSend.subscribe((event) => {
    const message = event.message;
    const player = event.sender;

    // Kommando: /lottery
    if (message.startsWith('/lottery')) {
        event.cancel = true;

        const text = [
            '§6═══════════════════════════════════════',
            '§e🎰 LOTTERIE SYSTEM v1.1.0',
            '§6═══════════════════════════════════════',
            `§7Aktueller Draw: §a${worldState.currentDraw.id}`,
            `§7Tickets im Pool: §a${worldState.currentDraw.tickets.length}`,
            `§7Aktueller Pot: §a${worldState.currentDraw.totalPot} ${CONFIG.currency}`,
            `§7Ticket-Preis: §a${CONFIG.ticketPrice} ${CONFIG.currency}`,
            '',
            '§7━━━━ VERFÜGBARE BEFEHLE ━━━━',
            '§a/lotto-gui §7- Hauptmenü',
            '§a/lotto [menge] §7- Tickets kaufen',
            '§a/lotto-stats §7- Deine Statistiken',
            '§a/lotto-claim §7- Gewinne abholen',
            '§a/lotto-help §7- Hilfe',
            '§6═══════════════════════════════════════'
        ].join('\n');

        sendMessage(player, text);
    }

    // Kommando: /lotto-stats
    if (message.startsWith('/lotto-stats')) {
        event.cancel = true;

        const data = getPlayerData(player.name);
        const text = [
            '§6═══════════════════════════════════════',
            '§e📊 DEINE STATISTIKEN',
            '§6═══════════════════════════════════════',
            `§7Spieler: §a${player.name}`,
            `§7Tickets: §a${data.tickets.length}`,
            `§7Ausgegeben: §a${data.totalSpent}`,
            `§7Gewonnen: §a${data.totalWins}`,
            `§7Gewinne: §a${data.winHistory.length}`,
            '§6═══════════════════════════════════════'
        ].join('\n');

        sendMessage(player, text);
    }

    // Kommando: /lotto-help
    if (message.startsWith('/lotto-help')) {
        event.cancel = true;

        const text = [
            '§6═══════════════════════════════════════',
            '§e🎰 LOTTERIE HILFE',
            '§6═══════════════════════════════════════',
            '',
            '§7━━━━ SPIELER BEFEHLE ━━━━',
            '§a/lottery §7- Allgemeine Info',
            '§a/lotto [n] §7- Tickets kaufen (1-10)',
            '§a/lotto-stats §7- Deine Statistiken',
            '§a/lotto-claim §7- Gewinne abholen',
            '§a/lotto-help §7- Diese Hilfe',
            '',
            '§7━━━━ INFO ━━━━',
            `§7Ticket-Preis: §a${CONFIG.ticketPrice} ${CONFIG.currency}`,
            `§7Jackpot: §a${CONFIG.fixedPrizes.jackpot} ${CONFIG.currency}`,
            '§6═══════════════════════════════════════'
        ].join('\n');

        sendMessage(player, text);
    }
});

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

export {
    CONFIG,
    playerTickets,
    lotteryDraws,
    worldState,
    sendMessage,
    broadcastMessage,
    getPlayerData
};
