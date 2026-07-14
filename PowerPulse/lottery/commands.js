/**
 * 🎰 LOTTERY SYSTEM - Commands Module
 * Registriert alle Lottery-bezogenen Befehle
 * @version 1.0.0
 */

import { bridge } from '../addons';
import { world, system } from '@minecraft/server';
import {
    CONFIG,
    getPlayerData,
    getPlayerStats,
    buyTicket,
    performDraw,
    sendSafeMessage,
    broadcastMessage,
    playerTickets,
    lotteryDraws,
    worldState
} from './core.js';

import {
    getPlayerWinStatistics,
    getGlobalWinStatistics,
    getDrawHistory,
    getPlayerROI,
    getWinnerLeaderboard,
    getTicketLeaderboard,
    getWinDistributionAnalysis,
    getPotStatistics
} from './stats.js';

import {
    getDetailedRevenueReport,
    getSimpleRevenueReport,
    getHourlyRevenueReport,
    getServerROI,
    getBestHour,
    getRevenueTrend,
    getBreakEvenAnalysis
} from './revenue.js';

// ════════════════════════════════════════════════════════════════
// PLAYER COMMANDS
// ════════════════════════════════════════════════════════════════

/**
 * /lottery - Hauptbefehl für Lotterie-Informationen
 */
bridge.bedrockCommands.registerCommand('lottery', (caller) => {
    const currentDraw = worldState.currentDraw;
    const stats = getPlayerStats(caller.name);

    const message = [
        '§6═══════════════════════════════════════',
        '§e🎰 LOTTERIE SYSTEM',
        '§6═══════════════════════════════════════',
        `§7Aktuelles Spiel: §a${currentDraw.id}`,
        `§7Tickets (Aktuell): §a${currentDraw.tickets.length}`,
        `§7Jackpot: §a${CONFIG.prizePool.jackpot} ${CONFIG.currency}`,
        '',
        '§7━━━━ DEINE STATISTIK ━━━━',
        `§7Tickets: §a${stats.activeTickets}`,
        `§7Ausgegeben: §a${stats.totalSpent}`,
        `§7Gewonnen: §a${stats.totalWins}`,
        `§7Gewinn-Rate: §a${stats.winRate}%`,
        '',
        '§7━━━━ BEFEHLE ━━━━',
        '§a/lotto buy <menge> §7- Tickets kaufen',
        '§a/lotto stats §7- Deine Statistiken',
        '§a/lotto info §7- Info über aktuelle Lotterie',
        '§a/lotto claim §7- Gewinne abholen',
        '§6═══════════════════════════════════════'
    ].join('\n');

    sendSafeMessage(caller, message);
}, 'Lotterie Informationen anzeigen');

/**
 * /lotto buy <menge> - Tickets kaufen
 */
bridge.bedrockCommands.registerCommand('lotto', (caller, quantityArg) => {
    // Parse quantity
    let quantity = 1;
    if (quantityArg) {
        const parsed = quantityArg.readNumber();
        if (parsed !== undefined && parsed > 0) {
            quantity = Math.floor(parsed);
        }
    }

    const result = buyTicket(caller, quantity);

    if (result.success) {
        sendSafeMessage(caller, result.message);
        broadcastMessage(`§e${caller.name} §akaufte ${quantity} Lotterie-Ticket(s)!`);
    } else {
        sendSafeMessage(caller, result.message);
    }
}, 'Lotterie-Tickets kaufen (Standard: 1)');

/**
 * /lotto stats - Spieler-Statistiken anzeigen
 */
bridge.bedrockCommands.registerCommand('lotto-stats', (caller) => {
    const stats = getPlayerStats(caller.name);

    const message = [
        '§6═══════════════════════════════════════',
        '§e📊 DEINE LOTTERIE-STATISTIK',
        '§6═══════════════════════════════════════',
        `§7Spieler: §a${stats.name}`,
        `§7Gekaufte Tickets: §a${stats.totalTickets}`,
        `§7Aktive Tickets: §a${stats.activeTickets}`,
        `§7Gesamt ausgegeben: §a${stats.totalSpent}`,
        `§7Gesamt gewonnen: §a${stats.totalWins}`,
        `§7Gewinnzahl: §a${stats.winCount}`,
        `§7Gewinn-Rate: §a${stats.winRate}%`,
        '§6═══════════════════════════════════════'
    ].join('\n');

    sendSafeMessage(caller, message);
}, 'Deine Lotterie-Statistiken anzeigen');

/**
 * /lotto info - Information über aktuelle Lotterie
 */
bridge.bedrockCommands.registerCommand('lotto-info', (caller) => {
    const draw = worldState.currentDraw;
    const elapsed = Math.floor((Date.now() - draw.startTime) / 1000);

    const message = [
        '§6═══════════════════════════════════════',
        '§e🎰 AKTUELLE LOTTERIE',
        '§6═══════════════════════════════════════',
        `§7Draw ID: §a${draw.id}`,
        `§7Tickets: §a${draw.tickets.length}/${CONFIG.maxTicketsPerDraw}`,
        `§7Pot: §a${draw.totalPot} ${CONFIG.currency}`,
        `§7Dauer: §a${elapsed}s`,
        `§7Ticket-Preis: §a${CONFIG.ticketPrice} ${CONFIG.currency}`,
        '',
        '§7━━━━ GEWINNE ━━━━',
        `§71. Platz: §6${CONFIG.prizePool.jackpot} ${CONFIG.currency}`,
        `§72. Platz: §e${CONFIG.prizePool.secondPlace} ${CONFIG.currency}`,
        `§73. Platz: §d${CONFIG.prizePool.thirdPlace} ${CONFIG.currency}`,
        '§6═══════════════════════════════════════'
    ].join('\n');

    sendSafeMessage(caller, message);
}, 'Informationen über die aktuelle Lotterie');

/**
 * /lotto claim - Gewinne abholen
 */
bridge.bedrockCommands.registerCommand('lotto-claim', (caller) => {
    const playerData = getPlayerData(caller.name);
    const unclaimedWins = playerData.winHistory.filter(w => !w.claimed);

    if (unclaimedWins.length === 0) {
        sendSafeMessage(caller, '§cKeine ausstehenden Gewinne');
        return;
    }

    let totalClaimed = 0;
    for (const win of unclaimedWins) {
        totalClaimed += win.prizeAmount;
        win.claimed = true;
    }

    sendSafeMessage(caller, `§a✓ ${unclaimedWins.length} Gewinn(e) erhalten: ${totalClaimed} ${CONFIG.currency}`);
}, 'Deine Gewinne abholen');

// ════════════════════════════════════════════════════════════════
// ADMIN COMMANDS
// ════════════════════════════════════════════════════════════════

/**
 * /lotto-admin draw - Manuelle Ziehung durchführen
 */
bridge.bedrockCommands.registerAdminCommand('lotto-admin-draw', (caller) => {
    const result = performDraw();

    if (result.success) {
        const message = [
            '§6═══════════════════════════════════════',
            '§e🎉 LOTTERIE ZIEHUNG DURCHGEFÜHRT',
            '§6═══════════════════════════════════════',
            `§7Gewinner: §a${result.winner}`,
            `§7Preis: §a${result.prize} ${CONFIG.currency}`,
            `§7Draw ID: §a${result.drawId}`,
            '§6═══════════════════════════════════════'
        ].join('\n');

        broadcastMessage(message);
    } else {
        sendSafeMessage(caller, `§cZiehung fehlgeschlagen: ${result.message}`);
    }
}, 'Manuelle Lotterie-Ziehung durchführen');

/**
 * /lotto-admin stats <spieler> - Statistiken eines Spielers anzeigen
 */
bridge.bedrockCommands.registerAdminCommand('lotto-admin-stats', (caller, playerArg) => {
    const player = playerArg.readPlayer();

    if (!player) {
        sendSafeMessage(caller, '§cSpieler nicht gefunden');
        return;
    }

    const stats = getPlayerStats(player.name);

    const message = [
        '§6═══════════════════════════════════════',
        `§e📊 STATISTIK: ${stats.name}`,
        '§6═══════════════════════════════════════',
        `§7Gekaufte Tickets: §a${stats.totalTickets}`,
        `§7Aktive Tickets: §a${stats.activeTickets}`,
        `§7Gesamt ausgegeben: §a${stats.totalSpent}`,
        `§7Gesamt gewonnen: §a${stats.totalWins}`,
        `§7Gewinnzahl: §a${stats.winCount}`,
        `§7Gewinn-Rate: §a${stats.winRate}%`,
        '§6═══════════════════════════════════════'
    ].join('\n');

    sendSafeMessage(caller, message);
}, 'Statistiken eines Spielers anzeigen');

/**
 * /lotto-admin reset <spieler> - Spieler-Daten zurücksetzen
 */
bridge.bedrockCommands.registerAdminCommand('lotto-admin-reset', (caller, playerArg) => {
    const player = playerArg.readPlayer();

    if (!player) {
        sendSafeMessage(caller, '§cSpieler nicht gefunden');
        return;
    }

    playerTickets.delete(player.name);
    sendSafeMessage(caller, `§a✓ Lotterie-Daten von ${player.name} zurückgesetzt`);
}, 'Lotterie-Daten eines Spielers zurücksetzen');

/**
 * /lotto-admin config - Konfiguration anzeigen
 */
bridge.bedrockCommands.registerAdminCommand('lotto-admin-config', (caller) => {
    const message = [
        '§6═══════════════════════════════════════',
        '§e⚙️ LOTTERIE KONFIGURATION',
        '§6═══════════════════════════════════════',
        `§7Aktiviert: §a${CONFIG.enabled}`,
        `§7Ticket-Preis: §a${CONFIG.ticketPrice}`,
        `§7Max Tickets/Spieler: §a${CONFIG.maxTicketsPerPlayer}`,
        `§7Max Tickets/Ziehung: §a${CONFIG.maxTicketsPerDraw}`,
        `§7Ziehungs-Intervall: §a${CONFIG.drawInterval}ms`,
        `§7Auto-Draw: §a${CONFIG.autoDrawEnabled}`,
        '',
        '§7━━━━ GEWINNE ━━━━',
        `§71. Platz: §a${CONFIG.prizePool.jackpot}`,
        `§72. Platz: §a${CONFIG.prizePool.secondPlace}`,
        `§73. Platz: §a${CONFIG.prizePool.thirdPlace}`,
        '§6═══════════════════════════════════════'
    ].join('\n');

    sendSafeMessage(caller, message);
}, 'Zeige aktuelle Konfiguration');

// ════════════════════════════════════════════════════════════════
// WORLD STATS COMMANDS
// ════════════════════════════════════════════════════════════════

/**
 * /lotto-world - Weltweite Lotterie-Statistiken
 */
bridge.bedrockCommands.registerAdminCommand('lotto-world', (caller) => {
    const stats = getGlobalWinStatistics();
    const potStats = getPotStatistics();

    const message = [
        '§6═══════════════════════════════════════',
        '§e🌍 WELTWEITE LOTTERIE-STATISTIK',
        '§6═══════════════════════════════════════',
        `§7Gesamt Tickets verkauft: §a${stats.totalTicketsSold}`,
        `§7Gesamt ausgeschüttet: §a${stats.totalDistributed}`,
        `§7Ziehungen durchgeführt: §a${stats.totalDraws}`,
        `§7Jackpots verteilt: §a${stats.totalJackpots}`,
        `§7Aktive Spieler: §a${stats.activePlayers}`,
        '',
        '§7━━━━ POT STATISTIKEN ━━━━',
        `§7Durchschn. Pot: §a${potStats.averagePotPerDraw}`,
        `§7Größter Pot: §a${potStats.maxPotEver}`,
        `§7Kleinster Pot: §a${potStats.minPotEver}`,
        '',
        '§7━━━━ TOP 5 GEWINNER ━━━━'
    ];

    for (let i = 0; i < Math.min(5, stats.topWinners.length); i++) {
        const winner = stats.topWinners[i];
        message.push(`§7${i + 1}. §a${winner.name} §7- §a${winner.totalWins} (${winner.largestWin})`);
    }

    message.push('§6═══════════════════════════════════════');

    sendSafeMessage(caller, message.join('\n'));
}, 'Weltweite Lotterie-Statistiken anzeigen');

// ════════════════════════════════════════════════════════════════
// ERWEITERTE STATISTIK BEFEHLE
// ════════════════════════════════════════════════════════════════

/**
 * /lotto-leaderboard - Gewinner-Rangliste
 */
bridge.bedrockCommands.registerCommand('lotto-leaderboard', (caller) => {
    const leaderboard = getWinnerLeaderboard(10);

    const message = [
        '§6═══════════════════════════════════════',
        '§e🏆 GEWINNER-RANGLISTE',
        '§6═══════════════════════════════════════',
        ''
    ];

    for (let i = 0; i < leaderboard.length; i++) {
        const player = leaderboard[i];
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}️⃣`;
        message.push(`§7${medal} §a${player.name}`);
        message.push(`  §7Gewonnen: §a${player.totalWins} (${player.winCount}x)`);
        message.push(`  §7Größter: §a${player.largestWin}`);
    }

    message.push('§6═══════════════════════════════════════');

    sendSafeMessage(caller, message.join('\n'));
}, 'Zeige Gewinner-Rangliste');

/**
 * /lotto-mywinnings - Meine Gewinne Detailliert
 */
bridge.bedrockCommands.registerCommand('lotto-mywinnings', (caller) => {
    const winStats = getPlayerWinStatistics(caller.name);
    const roi = getPlayerROI(caller.name);

    const message = [
        '§6═══════════════════════════════════════',
        '§e💰 MEINE GEWINN-STATISTIK',
        '§6═══════════════════════════════════════',
        `§7Spieler: §a${caller.name}`,
        '',
        '§7━━━━ ZUSAMMENFASSUNG ━━━━',
        `§7Gesamt gewonnen: §a${winStats.totalWins}`,
        `§7Gesamt ausgegeben: §a${roi.spent}`,
        `§7Netto Gewinn: §${roi.profitable ? 'a' : 'c'}${roi.net}`,
        `§7ROI: §${roi.profitable ? 'a' : 'c'}${roi.roi}`,
        '',
        '§7━━━━ GEWINN-DETAILS ━━━━',
        `§7Gewinn-Anzahl: §a${winStats.winCount}`,
        `§7Durchschn. Gewinn: §a${winStats.averageWin}`,
        `§7Größter Gewinn: §a${winStats.largestWin}`,
        `§7Gewinn-Rate: §a${winStats.winRate}`,
        '',
        '§7━━━━ PLATZIERUNGEN ━━━━',
        `§7🥇 Jackpot: §a${winStats.placements.jackpot}x`,
        `§7🥈 2. Platz: §a${winStats.placements.second}x`,
        `§7🥉 3. Platz: §a${winStats.placements.third}x`,
        `§74️⃣ 4. Platz: §a${winStats.placements.fourth}x`,
        `§75️⃣ 5. Platz: §a${winStats.placements.fifth}x`,
        '§6═══════════════════════════════════════'
    ];

    sendSafeMessage(caller, message.join('\n'));
}, 'Zeige detaillierte Gewinn-Statistik');

/**
 * /lotto-distribution - Zeige Gewinn-Verteilung
 */
bridge.bedrockCommands.registerAdminCommand('lotto-distribution', (caller) => {
    const dist = getWinDistributionAnalysis();

    const message = [
        '§6═══════════════════════════════════════',
        '§e📊 GEWINN-VERTEILUNGS-ANALYSE',
        '§6═══════════════════════════════════════',
        `§7Gesamte Gewinne: §a${dist.totalWins}`,
        `§7Gesamtbetrag: §a${dist.totalAmount}`,
        `§7Durchschn. Gewinn: §a${dist.averageWinAmount}`,
        '',
        '§7━━━━ NACH PLATZIERUNG ━━━━',
        `§7🥇 Jackpot: §a${dist.placements.jackpot}x (${dist.percentages.jackpot}%) - ${dist.distributionAmounts.jackpot}`,
        `§7🥈 2. Platz: §a${dist.placements.second}x (${dist.percentages.second}%) - ${dist.distributionAmounts.second}`,
        `§7🥉 3. Platz: §a${dist.placements.third}x (${dist.percentages.third}%) - ${dist.distributionAmounts.third}`,
        `§74️⃣ 4. Platz: §a${dist.placements.fourth}x (${dist.percentages.fourth}%) - ${dist.distributionAmounts.fourth}`,
        `§75️⃣ 5. Platz: §a${dist.placements.fifth}x (${dist.percentages.fifth}%) - ${dist.distributionAmounts.fifth}`,
        '§6═══════════════════════════════════════'
    ];

    sendSafeMessage(caller, message.join('\n'));
}, 'Zeige Gewinn-Verteilungs-Analyse');

/**
 * /lotto-reports - Zeige detaillierte Reports
 */
bridge.bedrockCommands.registerAdminCommand('lotto-reports', (caller) => {
    const reports = [
        '/lotto-distribution - Gewinn-Verteilung',
        '/lotto-leaderboard - Gewinner-Rangliste',
        '/lotto-mywinnings - Meine Gewinne',
        '/lotto-player-roi <spieler> - ROI eines Spielers',
        '/lotto-draw-history - Letzte 10 Ziehungen'
    ];

    const message = [
        '§6═══════════════════════════════════════',
        '§e📈 VERFÜGBARE REPORTS',
        '§6═══════════════════════════════════════',
        '',
        ...reports,
        '',
        '§6═══════════════════════════════════════'
    ];

    sendSafeMessage(caller, message.join('\n'));
}, 'Zeige verfügbare Reports');

/**
 * /lotto-player-roi <spieler> - ROI eines Spielers
 */
bridge.bedrockCommands.registerAdminCommand('lotto-player-roi', (caller, playerArg) => {
    const player = playerArg.readPlayer();

    if (!player) {
        sendSafeMessage(caller, '§cSpieler nicht gefunden');
        return;
    }

    const roi = getPlayerROI(player.name);

    const message = [
        '§6═══════════════════════════════════════',
        `§e💹 ROI ANALYSE: ${roi.name}`,
        '§6═══════════════════════════════════════',
        `§7Ausgegeben: §a${roi.spent}`,
        `§7Gewonnen: §a${roi.won}`,
        `§7Netto: §${roi.profitable ? 'a' : 'c'}${roi.net}`,
        `§7ROI: §${roi.profitable ? 'a' : 'c'}${roi.roi}`,
        `§7Status: §${roi.profitable ? 'a' : 'c'}${roi.profitable ? 'PROFITABEL ✓' : 'VERLUST ✗'}`,
        '§6═══════════════════════════════════════'
    ];

    sendSafeMessage(caller, message.join('\n'));
}, 'Zeige ROI eines Spielers');

/**
 * /lotto-draw-history - Letzte Ziehungen
 */
bridge.bedrockCommands.registerCommand('lotto-draw-history', (caller) => {
    const history = getDrawHistory(5);

    const message = [
        '§6═══════════════════════════════════════',
        '§e📜 LETZTE 5 ZIEHUNGEN',
        '§6═══════════════════════════════════════'
    ];

    for (const draw of history) {
        message.push(`§7Ziehung: §a${draw.id}`);
        message.push(`§7Zeit: §a${draw.timestamp}`);
        message.push(`§7Pot: §a${draw.totalPot}`);
        for (const winner of draw.winners) {
            message.push(`  §7${winner.placement}: §a${winner.name} - ${winner.amount}`);
        }
        message.push('');
    }

    message.push('§6═══════════════════════════════════════');

    sendSafeMessage(caller, message.join('\n'));
}, 'Zeige letzte 5 Ziehungen');

// ════════════════════════════════════════════════════════════════
// SERVER REVENUE COMMANDS (ADMIN)
// ════════════════════════════════════════════════════════════════

/**
 * /lotto-revenue - Einfacher Revenue Report
 */
bridge.bedrockCommands.registerAdminCommand('lotto-revenue', (caller) => {
    const revenue = getSimpleRevenueReport();
    const roi = getServerROI();

    const message = [
        '§6═══════════════════════════════════════',
        '§e💰 SERVER REVENUE REPORT',
        '§6═══════════════════════════════════════',
        `§7Tickets verkauft: §a${revenue.ticketsSold}`,
        `§7Gesamteinnahmen: §a${revenue.totalRevenue}`,
        `§7Server-Anteil: §a${revenue.serverTake}`,
        `§7Ausgeschüttet: §c${revenue.payedOut}`,
        `§7Netto Gewinn: §a${revenue.netProfit}`,
        `§7Gewinnspanne: §a${revenue.profitMargin}`,
        `§7Server ROI: §a${roi.toFixed(2)}%`,
        '§6═══════════════════════════════════════'
    ];

    sendSafeMessage(caller, message.join('\n'));
}, 'Zeige Server Revenue');

/**
 * /lotto-revenue-detailed - Detaillierter Revenue Report
 */
bridge.bedrockCommands.registerAdminCommand('lotto-revenue-detailed', (caller) => {
    const report = getDetailedRevenueReport();

    const message = [
        '§6════════════════════════════════════════════',
        '§e💹 DETAILLIERTER REVENUE REPORT',
        '§6════════════════════════════════════════════',
        '',
        '§7━━━━ ZUSAMMENFASSUNG ━━━━',
        `§7Ziehungen: §a${report.summary.draws}`,
        `§7Tickets gesamt: §a${report.summary.ticketsSold}`,
        `§7Durchschn. pro Ziehung: §a${report.summary.averageTicketsPerDraw}`,
        '',
        '§7━━━━ FINANZEN ━━━━',
        `§7Gesamteinnahmen: §a${report.financial.totalRevenue}`,
        `§7Server-Anteil: §a${report.financial.serverTake}`,
        `§7Ausgeschüttet: §c${report.financial.payedOut}`,
        `§7Netto Gewinn: §a${report.financial.netProfit}`,
        '',
        '§7━━━━ MARGEN & ROI ━━━━',
        `§7Profit-Marge: §a${report.margins.profitMargin}`,
        `§7Durchschn. Marge/Draw: §a${report.margins.averageMarginPerDraw}`,
        `§7Server ROI: §a${report.margins.serverROI}`,
        `§7Profit pro Draw: §a${report.margins.profitPerDraw}`,
        '',
        '§7━━━━ TOP 5 PROFITABLE DRAWS ━━━━'
    ];

    for (let i = 0; i < Math.min(5, report.topDraws.length); i++) {
        const draw = report.topDraws[i];
        message.push(`§7${i + 1}. ${draw.id}: §a${draw.profit} Gewinn (${draw.margin})`);
    }

    message.push('§6════════════════════════════════════════════');

    sendSafeMessage(caller, message.join('\n'));
}, 'Zeige detaillierten Revenue Report');

/**
 * /lotto-revenue-analysis - Revenue Analyse & Trends
 */
bridge.bedrockCommands.registerAdminCommand('lotto-revenue-analysis', (caller) => {
    const bestHour = getBestHour();
    const trend = getRevenueTrend();
    const breakEven = getBreakEvenAnalysis();

    const trendText = trend.direction === 'UP'
        ? `§a📈 STEIGEND (+${trend.amount})`
        : trend.direction === 'DOWN'
        ? `§c📉 FALLEND (-${trend.amount})`
        : '§e➡️ STABIL';

    const message = [
        '§6════════════════════════════════════════════',
        '§e📊 REVENUE ANALYSE & TRENDS',
        '§6════════════════════════════════════════════',
        '',
        '§7━━━━ TREND ANALYSE ━━━━',
        `§7Trend: ${trendText}`,
        `§7Beste Stunde: §a${bestHour.hour} (${bestHour.revenue} Einnahmen)`,
        '',
        '§7━━━━ BREAK-EVEN ANALYSE ━━━━',
        `§7Durchschn. Gewinn/Draw: §a${breakEven.averageProfitPerDraw}`,
        `§7Durchschn. Kosten/Draw: §a${breakEven.averageCostPerDraw}`,
        `§7Profit-Prozent: §a${breakEven.profitPercentage}`,
        '',
        '§7Fazit: §aLotterie läuft stabil und profitabel!',
        '§6════════════════════════════════════════════'
    ];

    sendSafeMessage(caller, message.join('\n'));
}, 'Zeige Revenue Analyse');

/**
 * /lotto-margins - Gewinnspanne Details
 */
bridge.bedrockCommands.registerAdminCommand('lotto-margins', (caller) => {
    const report = getDetailedRevenueReport();
    const margin = report.margins;

    const marginPercentage = parseFloat(margin.profitMargin);
    const status = marginPercentage >= 15 ? '§a✓ GESUND' : marginPercentage >= 10 ? '§e⚠️ OK' : '§c✗ NIEDRIG';

    const message = [
        '§6═══════════════════════════════════════',
        '§e💹 GEWINNSPANNE ANALYSE',
        '§6═══════════════════════════════════════',
        `§7Status: ${status}`,
        '',
        '§7━━━━ MARGIN PROZENTE ━━━━',
        `§7Gesamt-Marge: §a${margin.profitMargin}`,
        `§7Durchschn./Draw: §a${margin.averageMarginPerDraw}`,
        `§7Server ROI: §a${margin.serverROI}`,
        '',
        '§7━━━━ ABSOLUTE GEWINNE ━━━━',
        `§7Profit/Draw: §a${margin.profitPerDraw}`,
        '',
        marginPercentage < 10
            ? '§c⚠️ Margin unter 10% - Tickets teurer machen?'
            : '§a✓ Margin im grünen Bereich!',
        '§6═══════════════════════════════════════'
    ];

    sendSafeMessage(caller, message.join('\n'));
}, 'Zeige Gewinnspanne Details');
