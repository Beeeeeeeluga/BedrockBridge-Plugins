/**
 * 🎰 LOTTERY SYSTEM - Broadcasts & Messaging Module
 * In-Game Broadcasts + Discord Integration
 * @version 1.0.0
 */

import { bridge } from '../addons';
import { world, system } from '@minecraft/server';
import { CONFIG } from './core.js';

// ════════════════════════════════════════════════════════════════
// DISCORD INTEGRATION
// ════════════════════════════════════════════════════════════════

/**
 * Sende Nachricht an Discord Webhook
 */
async function sendToDiscord(message, type = 'info') {
    try {
        // Nutze BedrockBridge's integrierten Discord-Zugang
        if (bridge && bridge.discordMessage) {
            bridge.discordMessage({
                content: message,
                embeds: [{
                    title: '🎰 Lottery System Update',
                    description: message,
                    color: getDiscordColor(type),
                    timestamp: new Date().toISOString()
                }]
            });
            return true;
        }
    } catch (error) {
        console.warn(`[Lottery] Discord-Fehler: ${error}`);
    }
    return false;
}

/**
 * Bestimme Discord Embed-Farbe
 */
function getDiscordColor(type) {
    const colors = {
        'info': 3447003,     // Blau
        'success': 3066993,  // Grün
        'warning': 16776960, // Gelb
        'error': 15158332,   // Rot
        'jackpot': 16711680, // Rot (Gewinn)
        'revenue': 12745742  // Orange (Geld)
    };
    return colors[type] || 3447003;
}

/**
 * Sende strukturierte Discord-Nachricht
 */
async function sendDiscordEmbed(title, fields, type = 'info') {
    try {
        if (bridge && bridge.discordMessage) {
            const embed = {
                title: title,
                fields: fields.map(f => ({
                    name: f.name,
                    value: f.value,
                    inline: f.inline || false
                })),
                color: getDiscordColor(type),
                timestamp: new Date().toISOString(),
                footer: {
                    text: '🎰 Bedrock Lottery System'
                }
            };

            bridge.discordMessage({
                embeds: [embed]
            });
            return true;
        }
    } catch (error) {
        console.warn(`[Lottery] Discord Embed-Fehler: ${error}`);
    }
    return false;
}

// ════════════════════════════════════════════════════════════════
// IN-GAME BROADCASTS
// ════════════════════════════════════════════════════════════════

/**
 * Broadcast: Ticket gekauft
 */
function broadcastTicketPurchased(playerName, quantity, cost, totalPool) {
    const message = [
        '§6═══════════════════════════════════════',
        '§e🎫 TICKET GEKAUFT',
        '§6═══════════════════════════════════════',
        `§7Spieler: §a${playerName}`,
        `§7Tickets: §a+${quantity}`,
        `§7Kosten: §a-${cost} ${CONFIG.currency}`,
        `§7Aktueller Pool: §a${totalPool} ${CONFIG.currency}`,
        '§6═══════════════════════════════════════'
    ].join('\n');

    world.sendMessage(message);

    // Discord
    sendDiscordEmbed(
        '🎫 Neues Lotterie-Ticket!',
        [
            { name: 'Spieler', value: playerName, inline: true },
            { name: 'Tickets', value: `+${quantity}`, inline: true },
            { name: 'Kosten', value: `-${cost} ${CONFIG.currency}`, inline: true },
            { name: 'Pool (aktuell)', value: `${totalPool} ${CONFIG.currency}`, inline: true }
        ],
        'info'
    );
}

/**
 * Broadcast: Mehrere Tickets gekauft
 */
function broadcastMultipleTicketsPurchased(playerName, quantity, cost, totalPool, ticketsOwned) {
    const message = [
        '§6═══════════════════════════════════════',
        '§e🎫🎫🎫 MEGA TICKET KAUF! 🎫🎫🎫',
        '§6═══════════════════════════════════════',
        `§7🔥 §a${playerName} §7kaufte §a${quantity} TICKETS!`,
        `§7Kosten: §c-${cost} ${CONFIG.currency}`,
        `§7Gesamte Tickets dieses Spielers: §a${ticketsOwned}`,
        `§7Aktueller Pool: §a${totalPool} ${CONFIG.currency}`,
        `§7${playerName} hat jetzt gute Chancen! 👀`,
        '§6═══════════════════════════════════════'
    ].join('\n');

    world.sendMessage(message);

    // Discord - Besonderer Alert
    sendDiscordEmbed(
        '🎫🎫🎫 MEGA LOTTERIE KAUF! 🎫🎫🎫',
        [
            { name: 'Spieler', value: `**${playerName}**`, inline: true },
            { name: 'Tickets gekauft', value: `**${quantity}** 🎫`, inline: true },
            { name: 'Kosten', value: `-${cost} ${CONFIG.currency}`, inline: false },
            { name: 'Gesamte Tickets', value: `${ticketsOwned} Stück`, inline: true },
            { name: 'Pool-Größe', value: `${totalPool} ${CONFIG.currency}`, inline: true }
        ],
        'success'
    );
}

/**
 * Broadcast: Zu wenig Geld
 */
function broadcastInsufficientFunds(playerName, required, available) {
    const message = [
        '§6═══════════════════════════════════════',
        '§c❌ TICKET KAUF ABGELEHNT',
        '§6═══════════════════════════════════════',
        `§7Spieler: §c${playerName}`,
        `§7Benötigt: §a${required} ${CONFIG.currency}`,
        `§7Vorhanden: §c${available} ${CONFIG.currency}`,
        `§7Fehlbetrag: §c${required - available} ${CONFIG.currency}`,
        `§c💡 Verdiene mehr ${CONFIG.currency} und komm zurück!`,
        '§6═══════════════════════════════════════'
    ].join('\n');

    world.sendMessage(message);
}

/**
 * Broadcast: Draw mit Gewinnern
 */
function broadcastDrawWithWinners(drawId, winners, totalPot, totalTickets) {
    const message = [
        '§6════════════════════════════════════════════',
        '§l§e🎉🎉🎉 LOTTERIE ZIEHUNG DURCHGEFÜHRT! 🎉🎉🎉',
        '§6════════════════════════════════════════════',
        `§7Draw ID: §a${drawId}`,
        `§7Tickets im Pool: §a${totalTickets}`,
        `§7Gesamter Pot: §a${totalPot} ${CONFIG.currency}`,
        '',
        '§l§e━━━━ DIE GEWINNER ━━━━'
    ];

    const placementEmojis = {
        jackpot: '🥇',
        second: '🥈',
        third: '🥉',
        fourth: '4️⃣',
        fifth: '5️⃣'
    };

    for (const winner of winners) {
        const emoji = placementEmojis[winner.placement] || '🎟️';
        const bonusText = winner.bonusAmount > 0
            ? ` §7(+§a${winner.bonusAmount} BONUS§7)`
            : '';
        message.push(`§7${emoji} §a${winner.winnerName.toUpperCase()} - §e${winner.finalAmount}${bonusText}`);
    }

    message.push('');
    message.push('§7Glückwunsch an alle Gewinner! 🎊');
    message.push('§6════════════════════════════════════════════');

    world.sendMessage(message.join('\n'));

    // Discord Embed
    const discordFields = [
        { name: '📊 Draw ID', value: drawId, inline: true },
        { name: '🎟️ Tickets', value: `${totalTickets}`, inline: true },
        { name: '💰 Pool', value: `${totalPot} ${CONFIG.currency}`, inline: false }
    ];

    for (const winner of winners) {
        discordFields.push({
            name: `${placementEmojis[winner.placement]} ${winner.placement.toUpperCase()}`,
            value: `**${winner.winnerName}** - ${winner.finalAmount} ${CONFIG.currency}` +
                   (winner.bonusAmount > 0 ? ` (+${winner.bonusAmount} Bonus)` : ''),
            inline: false
        });
    }

    sendDiscordEmbed(
        '🎉 LOTTERIE ZIEHUNG - GEWINNER!',
        discordFields,
        'jackpot'
    );
}

/**
 * Broadcast: Keine Tickets - Ziehung abgesagt
 */
function broadcastNoCancelled() {
    const message = [
        '§6═══════════════════════════════════════',
        '§c⚠️ LOTTERIE ABGESAGT',
        '§6═══════════════════════════════════════',
        '§7❌ Niemand hat Tickets gekauft.',
        '§7Die Lotterie wurde abgesagt.',
        '',
        '§e💡 Tipp: Kaufe Tickets mit /lotto und',
        '§e   nimm an der nächsten Runde teil!',
        '§6═══════════════════════════════════════'
    ].join('\n');

    world.sendMessage(message);

    // Discord
    sendDiscordEmbed(
        '⚠️ LOTTERIE ABGESAGT - KEINE TICKETS',
        [
            { name: 'Grund', value: 'Niemand hat Tickets gekauft', inline: false },
            { name: 'Status', value: 'Die Ziehung wurde abgesagt', inline: false },
            { name: 'Nächste Runde', value: 'Bald verfügbar - Tickets kaufen!', inline: false }
        ],
        'warning'
    );
}

/**
 * Broadcast: Neue Runde gestartet
 */
function broadcastNewRoundStarted(roundId, ticketPrice) {
    const message = [
        '§6═══════════════════════════════════════',
        '§a✨ NEUE LOTTERIE RUNDE GESTARTET! ✨',
        '§6═══════════════════════════════════════',
        `§7Runde: §a${roundId}`,
        `§7Ticket-Preis: §a${ticketPrice} ${CONFIG.currency}`,
        `§7Status: §a🟢 AKTIV`,
        '',
        '§e💫 Kaufe Tickets und gewinne große Preise!',
        '§7Befehl: §a/lotto-gui §7oder §a/lotto [menge]',
        '§6═══════════════════════════════════════'
    ].join('\n');

    world.sendMessage(message);

    // Discord
    sendDiscordEmbed(
        '✨ NEUE LOTTERIE RUNDE GESTARTET!',
        [
            { name: '🎰 Runde', value: roundId, inline: true },
            { name: '🎟️ Ticket-Preis', value: `${ticketPrice} ${CONFIG.currency}`, inline: true },
            { name: '📊 Status', value: '🟢 AKTIV', inline: false },
            { name: '📝 Aktion', value: 'Kaufe Tickets und gewinne!', inline: false }
        ],
        'success'
    );
}

/**
 * Broadcast: Server Revenue Update
 */
function broadcastServerRevenue(totalRevenue, retainedAmount, jackpotAmount, round) {
    const message = [
        '§6═══════════════════════════════════════',
        '§e💹 SERVER EINNAHMEN UPDATE',
        '§6═══════════════════════════════════════',
        `§7Runde: §a${round}`,
        `§7Gesamteinnahmen: §a${totalRevenue}`,
        `§7Server-Anteil (behalten): §a${retainedAmount}`,
        `§7Jackpot ausgeschüttet: §c${jackpotAmount}`,
        `§7Netto Gewinn: §a${totalRevenue - jackpotAmount}`,
        '§6═══════════════════════════════════════'
    ].join('\n');

    world.sendMessage(message);

    // Discord - Admin-Benachrichtigung
    sendDiscordEmbed(
        '💹 SERVER REVENUE UPDATE',
        [
            { name: '📊 Runde', value: round, inline: true },
            { name: '💰 Einnahmen', value: `${totalRevenue}`, inline: true },
            { name: '🏦 Server-Anteil', value: `${retainedAmount}`, inline: true },
            { name: '🎁 Ausgeschüttet', value: `${jackpotAmount}`, inline: true }
        ],
        'revenue'
    );
}

/**
 * Broadcast: Spieler-Aktivität (kauft X Tickets)
 */
function broadcastPlayerActivity(playerName, ticketCount, spent, totalActive) {
    const tier = ticketCount >= 50 ? '⭐⭐⭐' : ticketCount >= 20 ? '⭐⭐' : '⭐';

    const message = [
        `§7[§e🎲 Lotterie§7] §a${playerName} §7kaufte §a${ticketCount} Ticket(s) - ${tier}`
    ];

    // Nur für High-Rollers anzeigen
    if (ticketCount >= 10) {
        world.sendMessage(message.join('\n'));
    }
}

/**
 * Broadcast: Warnung vor nächster Ziehung
 */
function broadcastDrawWarning(minutesUntil) {
    let timeText = '';
    if (minutesUntil >= 60) {
        const hours = Math.floor(minutesUntil / 60);
        timeText = `${hours} Stunde(n)`;
    } else if (minutesUntil > 1) {
        timeText = `${minutesUntil} Minuten`;
    } else {
        timeText = 'Jede Minute jetzt!';
    }

    const message = [
        '§6═══════════════════════════════════════',
        '§e⏰ LOTTERIE ZIEHUNG BALD!',
        '§6═══════════════════════════════════════',
        `§7Nächste Ziehung in: §a${timeText}`,
        '§e🚨 Kaufe jetzt Tickets, bevor es zu spät ist!',
        '§6═══════════════════════════════════════'
    ].join('\n');

    if (minutesUntil <= 5) {
        world.sendMessage(message);
    }
}

/**
 * Broadcast: Statistik Update
 */
function broadcastStatisticsUpdate(totalTickets, currentPool, activePlayers, jackpotChances) {
    const message = [
        '§6═══════════════════════════════════════',
        '§e📊 LOTTERIE STATISTIK UPDATE',
        '§6═══════════════════════════════════════',
        `§7Tickets verkauft: §a${totalTickets}`,
        `§7Aktueller Pot: §a${currentPool} ${CONFIG.currency}`,
        `§7Aktive Spieler: §a${activePlayers}`,
        `§7Durchschnittliche Gewinnchance: §a${jackpotChances}%`,
        '§6═══════════════════════════════════════'
    ].join('\n');

    // Nur beim Start
    world.sendMessage(message);
}

/**
 * Broadcast: Großer Gewinn!
 */
function broadcastBigWin(playerName, amount, previousRecord) {
    const isNewRecord = amount > previousRecord;
    const medal = isNewRecord ? '🏆 NEUER REKORD! 🏆' : '💎';

    const message = [
        '§6════════════════════════════════════════════',
        `§l§e${medal} GROSSER GEWINN! ${medal}`,
        '§6════════════════════════════════════════════',
        `§7Gewinner: §6§l${playerName.toUpperCase()}`,
        `§7Preis: §a§l${amount} ${CONFIG.currency}`,
        isNewRecord ? `§7Alter Rekord: §c${previousRecord}` : '',
        '§l§e🎊 Glückwunsch! 🎊',
        '§6════════════════════════════════════════════'
    ].filter(l => l).join('\n');

    world.sendMessage(message);

    // Discord - Special Alert für Rekorde
    if (isNewRecord) {
        sendDiscordEmbed(
            '🏆 NEUER JACKPOT-REKORD! 🏆',
            [
                { name: 'Gewinner', value: `**${playerName}**`, inline: false },
                { name: '💰 Gewinn', value: `**${amount} ${CONFIG.currency}**`, inline: false },
                { name: '📈 Alter Rekord', value: `${previousRecord}`, inline: true },
                { name: '🚀 Neuer Rekord', value: `${amount}`, inline: true }
            ],
            'jackpot'
        );
    }
}

// ════════════════════════════════════════════════════════════════
// SCHEDULED BROADCASTS
// ════════════════════════════════════════════════════════════════

/**
 * Starte periodische Broadcast-Nachrichten
 */
function startPeriodicBroadcasts() {
    // Statistik-Update alle 10 Minuten
    system.runInterval(() => {
        // Wird von main.js aufgerufen mit aktuellen Stats
    }, 12000); // 600000ms / 50 = 12000 Ticks

    console.log('[Lottery] Periodische Broadcasts aktiviert');
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

export {
    sendToDiscord,
    sendDiscordEmbed,
    broadcastTicketPurchased,
    broadcastMultipleTicketsPurchased,
    broadcastInsufficientFunds,
    broadcastDrawWithWinners,
    broadcastNoCancelled,
    broadcastNewRoundStarted,
    broadcastServerRevenue,
    broadcastPlayerActivity,
    broadcastDrawWarning,
    broadcastStatisticsUpdate,
    broadcastBigWin,
    startPeriodicBroadcasts
};
