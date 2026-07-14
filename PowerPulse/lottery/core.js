/**
 * 🎰 LOTTERY SYSTEM - BedrockBridge Plugin Core
 * Complete lottery management system with tickets, draws, and prizes
 * @version 1.0.0
 * @compatible Bedrock 1.21.120+, BedrockBridge
 * @author Bridge Developer
 */

import { world, system } from '@minecraft/server';

// Bridge wird von main.js als Parameter übergeben
let bridge = null;

// ════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════

const CONFIG = {
    enabled: true,
    ticketPrice: 10,        // Items/currency per ticket
    maxTicketsPerPlayer: 1000,
    maxTicketsPerDraw: 50000,
    drawInterval: 3600000,  // 1 hour in milliseconds
    autoDrawEnabled: true,

    // ═══════════════════════════════════════════════
    // MEHRSTUFIGES GEWINN-SYSTEM
    // ═══════════════════════════════════════════════

    // Option 1: Feste Gewinne (Fallback)
    fixedPrizes: {
        jackpot: 5000,      // 1. Platz (50% der Spieler mit diesem Ticket gewinnen)
        second: 1000,       // 2. Platz (30% Quote)
        third: 500,         // 3. Platz (20% Quote)
        fourth: 200,        // 4. Platz (10% Quote)
        fifth: 100          // 5. Platz (5% Quote)
    },

    // Option 2: POT-BASIERTE GEWINNE (RECOMMENDED!)
    potDistribution: {
        enabled: true,      // Aktiviere Pot-basierte Gewinne
        jackpot: 0.50,      // 1. Platz: 50% des gesamten Pots
        second: 0.25,       // 2. Platz: 25% des gesamten Pots
        third: 0.15,        // 3. Platz: 15% des gesamten Pots
        fourth: 0.07,       // 4. Platz: 7% des gesamten Pots
        fifth: 0.03,        // 5. Platz: 3% des gesamten Pots
        rollover: 0.00      // Reserve/Jackpot (0% = alles ausbezahlt)
    },

    // GEWINN-CHANCEN (Win Probability)
    winProbabilities: {
        jackpot: 1,         // 1 aus X Spielern gewinnt Jackpot
        second: 3,          // 1 aus 3 gewinnt 2. Platz
        third: 5,           // 1 aus 5 gewinnt 3. Platz
        fourth: 10,         // 1 aus 10 gewinnt 4. Platz
        fifth: 20           // 1 aus 20 gewinnt 5. Platz
    },

    // BONUS-SYSTEM
    bonusSystem: {
        enabled: true,
        multiTicketBonus: 0.05,      // +5% Gewinn für jeden 10er Ticket-Pack
        weeklyBonus: 0.10,            // +10% jeden 7. Tag
        consecutiveWinBonus: 0.15     // +15% wenn 2x hintereinander gewinnt
    },

    debugLogging: true,
    persistenceInterval: 300000, // 5 minutes
    currency: 'emerald'     // Currency item name
};

// ════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ════════════════════════════════════════════════════════════════

const playerTickets = new Map();      // playerName -> { tickets: [], totalSpent, wins: [] }
const lotteryDraws = new Map();       // drawId -> { id, timestamp, winner, winningTicket, amount, tickets: [] }
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

/**
 * Sichere Spielerdaten abrufen oder initialisieren
 */
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

/**
 * Ticket-ID generieren
 */
function generateTicketId() {
    return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Draw-ID generieren
 */
function generateDrawId() {
    return `draw_${worldState.nextDrawId++}`;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * MULTI-TIER GEWINN-SYSTEM
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Wähle mehrere Gewinner nach Platzierung
 */
function selectMultipleWinners(count = 5) {
    const tickets = worldState.currentDraw.tickets;
    if (tickets.length < count) {
        count = Math.max(1, tickets.length);
    }

    const selected = [];
    const usedIndices = new Set();

    for (let i = 0; i < count; i++) {
        let index;
        do {
            index = Math.floor(Math.random() * tickets.length);
        } while (usedIndices.has(index) && usedIndices.size < tickets.length);

        usedIndices.add(index);
        selected.push(tickets[index]);
    }

    return selected;
}

/**
 * Berechne Gewinne basierend auf Pot
 */
function calculatePotBasedPrizes(totalPot) {
    if (!CONFIG.potDistribution.enabled) {
        return calculateFixedPrizes();
    }

    const distribution = CONFIG.potDistribution;
    return {
        jackpot: Math.floor(totalPot * distribution.jackpot),
        second: Math.floor(totalPot * distribution.second),
        third: Math.floor(totalPot * distribution.third),
        fourth: Math.floor(totalPot * distribution.fourth),
        fifth: Math.floor(totalPot * distribution.fifth),
        rollover: Math.floor(totalPot * distribution.rollover)
    };
}

/**
 * Berechne feste Preise (Fallback)
 */
function calculateFixedPrizes() {
    return {
        jackpot: CONFIG.fixedPrizes.jackpot,
        second: CONFIG.fixedPrizes.second,
        third: CONFIG.fixedPrizes.third,
        fourth: CONFIG.fixedPrizes.fourth,
        fifth: CONFIG.fixedPrizes.fifth,
        rollover: 0
    };
}

/**
 * Berechne Bonus für Spieler
 */
function calculateWinBonus(playerName, prizeAmount, placement) {
    let bonusMultiplier = 1.0;
    const playerData = getPlayerData(playerName);

    // Multi-Ticket Bonus
    if (CONFIG.bonusSystem.enabled) {
        if (playerData.tickets.length >= 10) {
            const packCount = Math.floor(playerData.tickets.length / 10);
            bonusMultiplier += CONFIG.bonusSystem.multiTicketBonus * packCount;
        }

        // Weekly Bonus (Beispiel: jeden 7. Tag)
        const daysSinceJoin = Math.floor((Date.now() - playerData.joinedDate) / (24 * 60 * 60 * 1000));
        if (daysSinceJoin % 7 === 0) {
            bonusMultiplier += CONFIG.bonusSystem.weeklyBonus;
        }

        // Consecutive Win Bonus
        const recentWins = playerData.winHistory.slice(-2);
        if (recentWins.length >= 2) {
            bonusMultiplier += CONFIG.bonusSystem.consecutiveWinBonus;
        }
    }

    return Math.floor(prizeAmount * bonusMultiplier);
}

/**
 * Gewinner basierend auf Ticket finden
 */
function findWinnerByTicket(ticketId) {
    for (const [playerName, data] of playerTickets.entries()) {
        const ticket = data.tickets.find(t => t.id === ticketId);
        if (ticket) return playerName;
    }
    return null;
}

/**
 * Sichere Nachricht an Spieler senden
 */
function sendSafeMessage(player, message) {
    try {
        if (player && player.isValid && player.isValid()) {
            player.sendMessage(message);
        }
    } catch (e) {
        console.warn(`[Lottery] Konnte Nachricht nicht senden an ${player?.name}`);
    }
}

/**
 * Nachricht an alle Spieler senden
 */
function broadcastMessage(message) {
    try {
        world.sendMessage(message);
    } catch (e) {
        console.warn(`[Lottery] Broadcast fehlgeschlagen: ${e}`);
    }
}

/**
 * Spieler-Inventar auf Zahlungsmittel prüfen
 */
function checkPlayerCurrency(player, amount) {
    const container = player.getComponent('minecraft:inventory').container;
    const currencyItem = container.find(item => item && item.typeId === `minecraft:${CONFIG.currency}`);
    return currencyItem && currencyItem.amount >= amount;
}

/**
 * Währung von Spieler entfernen
 */
function removePlayerCurrency(player, amount) {
    const container = player.getComponent('minecraft:inventory').container;
    let remaining = amount;

    for (let i = 0; i < container.size && remaining > 0; i++) {
        const item = container.getItem(i);
        if (item && item.typeId === `minecraft:${CONFIG.currency}`) {
            const toRemove = Math.min(item.amount, remaining);
            item.amount -= toRemove;
            remaining -= toRemove;

            if (item.amount <= 0) {
                container.setItem(i, undefined);
            } else {
                container.setItem(i, item);
            }
        }
    }

    return remaining === 0;
}

/**
 * Währung zu Spieler hinzufügen
 */
function addPlayerCurrency(player, amount) {
    try {
        const container = player.getComponent('minecraft:inventory').container;
        const currency = new (require('@minecraft/server').ItemStack)(`minecraft:${CONFIG.currency}`, amount);

        container.addItem(currency);
        return true;
    } catch (e) {
        console.warn(`[Lottery] Konnte Währung nicht hinzufügen an ${player?.name}: ${e}`);
        return false;
    }
}

/**
 * Statistiken für Spieler zusammenfassen
 */
function getPlayerStats(playerName) {
    const data = getPlayerData(playerName);
    const activeTickets = data.tickets.filter(t => !t.claimed);

    return {
        name: playerName,
        totalTickets: data.tickets.length,
        activeTickets: activeTickets.length,
        totalSpent: data.totalSpent,
        totalWins: data.totalWins,
        winCount: data.winHistory.length,
        winRate: data.tickets.length > 0 ? ((data.winHistory.length / data.tickets.length) * 100).toFixed(2) : 0
    };
}

// ════════════════════════════════════════════════════════════════
// TICKET MANAGEMENT
// ════════════════════════════════════════════════════════════════

/**
 * Ticket kaufen
 */
function buyTicket(player, quantity = 1) {
    const playerData = getPlayerData(player.name);
    const totalCost = CONFIG.ticketPrice * quantity;

    // Validierungen
    if (quantity <= 0 || quantity > 10) {
        return { success: false, message: '§cBitte kaufe 1-10 Tickets gleichzeitig' };
    }

    if (playerData.tickets.length + quantity > CONFIG.maxTicketsPerPlayer) {
        return { success: false, message: `§cMaximum ${CONFIG.maxTicketsPerPlayer} Tickets pro Spieler` };
    }

    if (worldState.currentDraw.tickets.length + quantity > CONFIG.maxTicketsPerDraw) {
        return { success: false, message: '§cDie Lotterie ist voll, bitte warte auf die nächste Ziehung' };
    }

    // Zahlungsfähigkeit prüfen
    if (!checkPlayerCurrency(player, totalCost)) {
        return { success: false, message: `§cDu benötigst ${totalCost} ${CONFIG.currency} um ${quantity} Ticket(s) zu kaufen` };
    }

    // Zahlungsabzug
    if (!removePlayerCurrency(player, totalCost)) {
        return { success: false, message: '§cFehler beim Zahlungsabzug' };
    }

    // Tickets erstellen
    const newTickets = [];
    for (let i = 0; i < quantity; i++) {
        const ticket = {
            id: generateTicketId(),
            playerName: player.name,
            purchaseTime: Date.now(),
            drawId: worldState.currentDraw.id,
            claimed: false
        };

        playerData.tickets.push(ticket);
        worldState.currentDraw.tickets.push(ticket);
        newTickets.push(ticket);
    }

    playerData.totalSpent += totalCost;
    worldState.currentDraw.totalPot += totalCost;
    worldState.totalTicketsSold += quantity;

    return {
        success: true,
        message: `§a✓ ${quantity} Ticket(s) gekauft für ${totalCost} ${CONFIG.currency}`,
        ticketsAdded: newTickets.length,
        remainingBalance: getPlayerStats(player.name).totalSpent
    };
}

/**
 * ═══════════════════════════════════════════════════════════════
 * LOTTERIE ZIEHUNG - MULTI-TIER SYSTEM
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Lotterie ziehen mit 5 Gewinn-Plätzen
 */
function performDraw() {
    if (worldState.currentDraw.tickets.length === 0) {
        broadcastMessage('§e[Lotterie] Keine Tickets für die Ziehung vorhanden');
        return { success: false, message: 'Keine Tickets' };
    }

    try {
        // Berechne Gewinne basierend auf Pot
        const totalPot = worldState.currentDraw.totalPot;
        const prizes = calculatePotBasedPrizes(totalPot);

        // Wähle 5 Gewinner aus
        const winningTickets = selectMultipleWinners(5);
        const placements = ['jackpot', 'second', 'third', 'fourth', 'fifth'];
        const drawResults = [];

        // Verarbeite jeden Gewinner
        for (let i = 0; i < winningTickets.length; i++) {
            const winningTicket = winningTickets[i];
            const placement = placements[i];
            const baseAmount = prizes[placement];

            const winnerName = findWinnerByTicket(winningTicket.id);
            if (!winnerName) continue;

            // Berechne Bonus
            const finalAmount = calculateWinBonus(winnerName, baseAmount, placement);

            // Draw-Daten speichern
            const drawResult = {
                id: worldState.currentDraw.id,
                timestamp: Date.now(),
                winnerName: winnerName,
                winningTicketId: winningTicket.id,
                placement: placement,
                baseAmount: baseAmount,
                bonusAmount: finalAmount - baseAmount,
                finalAmount: finalAmount,
                ticketsSold: worldState.currentDraw.tickets.length,
                totalPot: totalPot
            };

            drawResults.push(drawResult);

            // Gewinner-Daten aktualisieren
            const winnerData = getPlayerData(winnerName);
            winnerData.winHistory.push(drawResult);
            winnerData.totalWins += finalAmount;

            // Ticket markieren
            const ticket = winnerData.tickets.find(t => t.id === winningTicket.id);
            if (ticket) ticket.claimed = true;

            // Preis auszahlen
            const winner = world.getPlayers({ name: winnerName })[0];
            if (winner) {
                addPlayerCurrency(winner, finalAmount);

                const bonusText = finalAmount > baseAmount ? ` §7(+${finalAmount - baseAmount} Bonus!)` : '';
                sendSafeMessage(winner,
                    `§6🎉 GEWONNEN! §r§a${placement.toUpperCase()} PLATZ\n` +
                    `§7Preis: §a${finalAmount} ${CONFIG.currency}${bonusText}`
                );
            }

            // Speichere Draw
            if (!lotteryDraws.has(worldState.currentDraw.id)) {
                lotteryDraws.set(worldState.currentDraw.id, {
                    id: worldState.currentDraw.id,
                    timestamp: Date.now(),
                    winners: drawResults,
                    totalPot: totalPot,
                    ticketsSold: worldState.currentDraw.tickets.length,
                    totalDistributed: drawResults.reduce((sum, w) => sum + w.finalAmount, 0)
                });
            }
        }

        worldState.totalMoneyCyclied += totalPot;
        worldState.lastDrawTime = Date.now();

        // Broadcast Draw-Ergebnisse
        broadcastDrawResults(drawResults, totalPot);

        // Neue Lotterie starten
        startNewDraw();

        return {
            success: true,
            winners: drawResults.length,
            drawId: worldState.currentDraw.id,
            totalDistributed: drawResults.reduce((sum, w) => sum + w.finalAmount, 0),
            results: drawResults
        };

    } catch (error) {
        console.warn(`[Lottery] Fehler bei Draw: ${error}`);
        return { success: false, message: `Fehler: ${error}` };
    }
}

/**
 * Broadcast Draw-Ergebnisse an alle Spieler
 */
function broadcastDrawResults(drawResults, totalPot) {
    let message = [
        '§6═══════════════════════════════════════',
        '§e🎉 LOTTERIE ZIEHUNG ERGEBNISSE',
        '§6═══════════════════════════════════════',
        `§7Pot: §a${totalPot} ${CONFIG.currency}`,
        ''
    ];

    const placementNames = {
        jackpot: '🥇 1. PLATZ (JACKPOT)',
        second: '🥈 2. PLATZ',
        third: '🥉 3. PLATZ',
        fourth: '4️⃣ 4. PLATZ',
        fifth: '5️⃣ 5. PLATZ'
    };

    for (const result of drawResults) {
        const bonusText = result.bonusAmount > 0 ? ` §7(+${result.bonusAmount})` : '';
        message.push(`§7${placementNames[result.placement]} §a${result.winnerName}`);
        message.push(`  §aGewinn: ${result.finalAmount} ${CONFIG.currency}${bonusText}`);
    }

    message.push('§6═══════════════════════════════════════');

    broadcastMessage(message.join('\n'));
}

/**
 * Neue Lotterie-Runde starten
 */
function startNewDraw() {
    worldState.currentDraw = {
        id: generateDrawId(),
        startTime: Date.now(),
        tickets: [],
        totalPot: 0
    };

    broadcastMessage('§e[Lotterie] ✨ Neue Lotterie-Runde gestartet!');
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

export {
    CONFIG,
    getPlayerData,
    getPlayerStats,
    buyTicket,
    performDraw,
    startNewDraw,
    selectMultipleWinners,
    calculatePotBasedPrizes,
    calculateFixedPrizes,
    calculateWinBonus,
    findWinnerByTicket,
    broadcastDrawResults,
    sendSafeMessage,
    broadcastMessage,
    checkPlayerCurrency,
    removePlayerCurrency,
    addPlayerCurrency,
    playerTickets,
    lotteryDraws,
    worldState
};
