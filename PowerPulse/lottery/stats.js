/**
 * 🎰 LOTTERY SYSTEM - Statistics & Reporting Module
 * Umfangreiche Statistik- und Report-Funktionen
 * @version 1.0.0
 */

import { world } from '@minecraft/server';
import {
    CONFIG,
    getPlayerData,
    playerTickets,
    lotteryDraws,
    worldState
} from './core.js';

// ════════════════════════════════════════════════════════════════
// GEWINN-STATISTIKEN
// ════════════════════════════════════════════════════════════════

/**
 * Berechne Gewinn-Statistiken für einen Spieler
 */
function getPlayerWinStatistics(playerName) {
    const playerData = getPlayerData(playerName);
    const wins = playerData.winHistory;

    if (wins.length === 0) {
        return {
            totalWins: 0,
            winCount: 0,
            jackpots: 0,
            averageWin: 0,
            largestWin: 0,
            winRate: '0%',
            placements: { jackpot: 0, second: 0, third: 0, fourth: 0, fifth: 0 }
        };
    }

    const placements = { jackpot: 0, second: 0, third: 0, fourth: 0, fifth: 0 };
    let totalAmount = 0;
    let largestWin = 0;

    for (const win of wins) {
        totalAmount += win.finalAmount || win.prizeAmount || 0;
        if (win.finalAmount > largestWin) largestWin = win.finalAmount || 0;
        if (win.placement && placements[win.placement] !== undefined) {
            placements[win.placement]++;
        }
    }

    const winRate = playerData.tickets.length > 0
        ? ((wins.length / playerData.tickets.length) * 100).toFixed(2)
        : '0.00';

    return {
        totalWins: totalAmount,
        winCount: wins.length,
        jackpots: placements.jackpot,
        averageWin: wins.length > 0 ? Math.floor(totalAmount / wins.length) : 0,
        largestWin: largestWin,
        winRate: `${winRate}%`,
        placements: placements
    };
}

/**
 * Berechne weltweite Gewinn-Statistiken
 */
function getGlobalWinStatistics() {
    let totalDistributed = 0;
    let totalTickets = 0;
    let totalDraws = 0;
    let totalJackpots = 0;
    const topWinners = [];
    const placements = { jackpot: 0, second: 0, third: 0, fourth: 0, fifth: 0 };

    // Aus lotteryDraws
    for (const [drawId, draw] of lotteryDraws.entries()) {
        totalDraws++;

        if (draw.winners && Array.isArray(draw.winners)) {
            // Multi-Tier System
            for (const winner of draw.winners) {
                totalDistributed += winner.finalAmount || 0;
                if (winner.placement === 'jackpot') totalJackpots++;
                if (winner.placement && placements[winner.placement] !== undefined) {
                    placements[winner.placement]++;
                }
            }
        } else if (draw.prizeAmount) {
            // Legacy: Single Winner
            totalDistributed += draw.prizeAmount;
            totalJackpots++;
        }
    }

    // Top Winner
    for (const [name, data] of playerTickets.entries()) {
        const winStats = getPlayerWinStatistics(name);
        if (winStats.totalWins > 0) {
            topWinners.push({
                name: name,
                totalWins: winStats.totalWins,
                winCount: winStats.winCount,
                largestWin: winStats.largestWin
            });
        }
    }

    topWinners.sort((a, b) => b.totalWins - a.totalWins);

    return {
        totalDistributed: totalDistributed,
        totalTicketsSold: worldState.totalTicketsSold,
        totalDraws: totalDraws,
        totalJackpots: totalJackpots,
        averageDistributionPerDraw: totalDraws > 0 ? Math.floor(totalDistributed / totalDraws) : 0,
        activePlayers: playerTickets.size,
        placements: placements,
        topWinners: topWinners.slice(0, 10) // Top 10
    };
}

/**
 * Berechne Draw-Historie mit Details
 */
function getDrawHistory(limit = 10) {
    const draws = Array.from(lotteryDraws.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

    return draws.map(draw => {
        if (draw.winners && Array.isArray(draw.winners)) {
            // Multi-Tier
            return {
                id: draw.id,
                timestamp: new Date(draw.timestamp).toLocaleString('de-DE'),
                winners: draw.winners.map(w => ({
                    name: w.winnerName,
                    placement: w.placement,
                    amount: w.finalAmount,
                    bonus: w.bonusAmount || 0
                })),
                totalPot: draw.totalPot,
                ticketsSold: draw.ticketsSold,
                totalDistributed: draw.totalDistributed
            };
        } else {
            // Legacy
            return {
                id: draw.id,
                timestamp: new Date(draw.timestamp).toLocaleString('de-DE'),
                winners: [{
                    name: draw.winnerName,
                    placement: 'jackpot',
                    amount: draw.prizeAmount,
                    bonus: 0
                }],
                totalPot: draw.totalPot,
                ticketsSold: draw.ticketsSold,
                totalDistributed: draw.prizeAmount
            };
        }
    });
}

/**
 * Berechne ROI (Return on Investment) für Spieler
 */
function getPlayerROI(playerName) {
    const playerData = getPlayerData(playerName);
    const winStats = getPlayerWinStatistics(playerName);

    const spent = playerData.totalSpent;
    const won = winStats.totalWins;
    const roi = spent > 0 ? ((won - spent) / spent * 100).toFixed(2) : 0;

    return {
        name: playerName,
        spent: spent,
        won: won,
        net: won - spent,
        roi: `${roi}%`,
        profitable: won > spent
    };
}

/**
 * Rangliste der Spieler nach Gewinnen
 */
function getWinnerLeaderboard(limit = 20) {
    const board = [];

    for (const [name, data] of playerTickets.entries()) {
        const winStats = getPlayerWinStatistics(name);
        board.push({
            name: name,
            totalWins: winStats.totalWins,
            winCount: winStats.winCount,
            largestWin: winStats.largestWin,
            jackpots: winStats.jackpots,
            winRate: winStats.winRate
        });
    }

    return board
        .filter(entry => entry.totalWins > 0)
        .sort((a, b) => b.totalWins - a.totalWins)
        .slice(0, limit);
}

/**
 * Rangliste nach Tickets gekauft
 */
function getTicketLeaderboard(limit = 20) {
    const board = [];

    for (const [name, data] of playerTickets.entries()) {
        board.push({
            name: name,
            ticketsOwned: data.tickets.length,
            totalSpent: data.totalSpent,
            totalWins: data.totalWins,
            net: data.totalWins - data.totalSpent
        });
    }

    return board
        .filter(entry => entry.ticketsOwned > 0)
        .sort((a, b) => b.ticketsOwned - a.ticketsOwned)
        .slice(0, limit);
}

/**
 * Gewinn-Verteilungs-Analyse
 */
function getWinDistributionAnalysis() {
    const placements = { jackpot: 0, second: 0, third: 0, fourth: 0, fifth: 0 };
    const distributionAmounts = { jackpot: 0, second: 0, third: 0, fourth: 0, fifth: 0 };

    for (const [drawId, draw] of lotteryDraws.entries()) {
        if (draw.winners && Array.isArray(draw.winners)) {
            for (const winner of draw.winners) {
                if (winner.placement && placements[winner.placement] !== undefined) {
                    placements[winner.placement]++;
                    distributionAmounts[winner.placement] += winner.finalAmount || 0;
                }
            }
        }
    }

    const totalWins = Object.values(placements).reduce((sum, val) => sum + val, 0);
    const totalAmount = Object.values(distributionAmounts).reduce((sum, val) => sum + val, 0);

    return {
        placements: placements,
        distributionAmounts: distributionAmounts,
        percentages: {
            jackpot: totalWins > 0 ? ((placements.jackpot / totalWins) * 100).toFixed(2) : 0,
            second: totalWins > 0 ? ((placements.second / totalWins) * 100).toFixed(2) : 0,
            third: totalWins > 0 ? ((placements.third / totalWins) * 100).toFixed(2) : 0,
            fourth: totalWins > 0 ? ((placements.fourth / totalWins) * 100).toFixed(2) : 0,
            fifth: totalWins > 0 ? ((placements.fifth / totalWins) * 100).toFixed(2) : 0
        },
        totalWins: totalWins,
        totalAmount: totalAmount,
        averageWinAmount: totalWins > 0 ? Math.floor(totalAmount / totalWins) : 0
    };
}

/**
 * Berechne Pot-Statistiken
 */
function getPotStatistics() {
    const pots = [];
    let totalPot = 0;
    let avgPot = 0;
    let maxPot = 0;
    let minPot = Infinity;

    for (const [drawId, draw] of lotteryDraws.entries()) {
        const pot = draw.totalPot || 0;
        pots.push(pot);
        totalPot += pot;
        if (pot > maxPot) maxPot = pot;
        if (pot < minPot) minPot = pot;
    }

    avgPot = pots.length > 0 ? Math.floor(totalPot / pots.length) : 0;
    minPot = minPot === Infinity ? 0 : minPot;

    return {
        totalPotOverTime: totalPot,
        averagePotPerDraw: avgPot,
        maxPotEver: maxPot,
        minPotEver: minPot,
        totalDraws: pots.length,
        potHistory: pots.slice(-20) // Letzten 20 Pots
    };
}

/**
 * Erstelle detaillierten Bericht
 */
function generateDetailedReport() {
    const globalStats = getGlobalWinStatistics();
    const winDistribution = getWinDistributionAnalysis();
    const potStats = getPotStatistics();
    const leaderboard = getWinnerLeaderboard(5);

    return {
        timestamp: new Date().toLocaleString('de-DE'),
        global: globalStats,
        distribution: winDistribution,
        pots: potStats,
        topWinners: leaderboard,
        config: {
            ticketPrice: CONFIG.ticketPrice,
            drawInterval: CONFIG.drawInterval,
            potDistribution: CONFIG.potDistribution,
            bonusSystem: CONFIG.bonusSystem
        }
    };
}

/**
 * Exportiere alle Statistiken als JSON
 */
function exportStatisticsAsJSON() {
    const report = generateDetailedReport();
    return JSON.stringify(report, null, 2);
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

export {
    getPlayerWinStatistics,
    getGlobalWinStatistics,
    getDrawHistory,
    getPlayerROI,
    getWinnerLeaderboard,
    getTicketLeaderboard,
    getWinDistributionAnalysis,
    getPotStatistics,
    generateDetailedReport,
    exportStatisticsAsJSON
};
