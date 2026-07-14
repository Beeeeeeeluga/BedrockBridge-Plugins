/**
 * 🎰 LOTTERY SYSTEM - Server Revenue & Economics Module
 * Tracking der Gewinnspanne und Server-Einnahmen
 * @version 1.0.0
 */

import { world } from '@minecraft/server';
import { CONFIG } from './core.js';

// ════════════════════════════════════════════════════════════════
// REVENUE CONFIGURATION
// ════════════════════════════════════════════════════════════════

const REVENUE_CONFIG = {
    // Prozentsatz, den der Server aus jedem Ticket behält
    serverTakePercentage: 0.15,     // 15% der Ticketverkäufe

    // Alternative: Fixbetrag pro Ticket
    fixedServerTake: 0,              // 0 = Prozentsatz nutzen

    // Jackpot Reserve (falls Bonusse Pot übersteigen)
    jackpotReservePercentage: 0.05,  // 5% als Reserve

    // Tracking
    trackingEnabled: true,
    detailedLogging: true
};

// ════════════════════════════════════════════════════════════════
// REVENUE STATE
// ════════════════════════════════════════════════════════════════

const revenueData = {
    totalTicketsSold: 0,
    totalTicketsRevenue: 0,      // Gesamteinnahmen aus Tickets
    totalServerTake: 0,          // Server behält ein
    totalPayedOut: 0,            // Gesamtausschüttungen
    netProfit: 0,                // Netto-Gewinn des Servers
    drawHistory: [],             // Pro-Draw Statistik
    hourlyRevenue: new Map(),    // Einnahmen pro Stunde
    topRevenueDraws: []          // Die profitabelsten Draws
};

// ════════════════════════════════════════════════════════════════
// REVENUE CALCULATION
// ════════════════════════════════════════════════════════════════

/**
 * Berechne Server-Anteil aus Einnahmen
 */
function calculateServerTake(totalTicketsRevenue) {
    if (REVENUE_CONFIG.fixedServerTake > 0) {
        return REVENUE_CONFIG.fixedServerTake;
    }
    return Math.floor(totalTicketsRevenue * REVENUE_CONFIG.serverTakePercentage);
}

/**
 * Berechne Profit einer einzelnen Lotterie
 */
function calculateDrawProfit(totalRevenue, totalPayedOut) {
    const serverTake = calculateServerTake(totalRevenue);
    const profit = serverTake + (totalRevenue - totalPayedOut);
    return {
        totalRevenue: totalRevenue,
        serverTake: serverTake,
        payedOut: totalPayedOut,
        directProfit: totalRevenue - totalPayedOut,
        serverProfit: serverTake,
        totalProfit: profit
    };
}

/**
 * Registriere eine Lotterie-Ziehung mit Revenue
 */
function recordDrawRevenue(drawId, ticketsSold, ticketPrice, totalPayedOut, winners) {
    const totalRevenue = ticketsSold * ticketPrice;
    const profit = calculateDrawProfit(totalRevenue, totalPayedOut);

    const drawRecord = {
        drawId: drawId,
        timestamp: Date.now(),
        ticketsSold: ticketsSold,
        unitPrice: ticketPrice,
        totalRevenue: totalRevenue,
        totalPayedOut: totalPayedOut,
        ...profit,
        winnerCount: winners.length,
        averagePrizePerWinner: winners.length > 0 ? Math.floor(totalPayedOut / winners.length) : 0
    };

    // Speichere in History
    revenueData.drawHistory.push(drawRecord);
    revenueData.totalTicketsSold += ticketsSold;
    revenueData.totalTicketsRevenue += totalRevenue;
    revenueData.totalServerTake += profit.serverTake;
    revenueData.totalPayedOut += totalPayedOut;
    revenueData.netProfit = revenueData.totalServerTake;

    // Top Revenue Draws
    revenueData.topRevenueDraws.push(drawRecord);
    revenueData.topRevenueDraws.sort((a, b) => b.totalProfit - a.totalProfit);
    revenueData.topRevenueDraws = revenueData.topRevenueDraws.slice(0, 10);

    // Hourly Tracking
    const now = new Date();
    const hour = `${now.getHours()}:00`;
    if (!revenueData.hourlyRevenue.has(hour)) {
        revenueData.hourlyRevenue.set(hour, 0);
    }
    revenueData.hourlyRevenue.set(hour, revenueData.hourlyRevenue.get(hour) + totalRevenue);

    if (REVENUE_CONFIG.detailedLogging) {
        console.log(`[Lottery Revenue] Draw ${drawId}: ${totalRevenue} → ${totalPayedOut} (Profit: ${profit.totalProfit})`);
    }

    return drawRecord;
}

/**
 * Berechne Gewinnspanne (Profit Margin)
 */
function calculateMargin() {
    if (revenueData.totalTicketsRevenue === 0) {
        return 0;
    }

    const margin = (revenueData.netProfit / revenueData.totalTicketsRevenue) * 100;
    return Math.round(margin * 100) / 100; // 2 Dezimalstellen
}

/**
 * Berechne durchschnittliche Marge pro Draw
 */
function getAverageMarginPerDraw() {
    if (revenueData.drawHistory.length === 0) return 0;

    const totalMargin = revenueData.drawHistory.reduce((sum, d) => sum + d.totalProfit, 0);
    const avgProfit = totalMargin / revenueData.drawHistory.length;
    const avgRevenue = revenueData.totalTicketsRevenue / revenueData.drawHistory.length;

    return avgRevenue > 0 ? (avgProfit / avgRevenue) * 100 : 0;
}

/**
 * Berechne ROI (Return on Investment) für Server
 */
function getServerROI() {
    // Server "investiert" durch Jackpot-Preise
    const investment = revenueData.totalPayedOut;
    const return_value = revenueData.totalServerTake;

    if (investment === 0) return 0;

    const roi = (return_value / investment) * 100;
    return Math.round(roi * 100) / 100;
}

// ════════════════════════════════════════════════════════════════
// REVENUE REPORTS
// ════════════════════════════════════════════════════════════════

/**
 * Einfacher Revenue Report
 */
function getSimpleRevenueReport() {
    return {
        ticketsSold: revenueData.totalTicketsSold,
        totalRevenue: revenueData.totalTicketsRevenue,
        serverTake: revenueData.totalServerTake,
        payedOut: revenueData.totalPayedOut,
        netProfit: revenueData.netProfit,
        profitMargin: `${calculateMargin()}%`
    };
}

/**
 * Detaillierter Revenue Report
 */
function getDetailedRevenueReport() {
    const margin = calculateMargin();
    const avgMargin = getAverageMarginPerDraw();
    const roi = getServerROI();
    const profitPerDraw = revenueData.drawHistory.length > 0
        ? Math.floor(revenueData.netProfit / revenueData.drawHistory.length)
        : 0;

    return {
        summary: {
            draws: revenueData.drawHistory.length,
            ticketsSold: revenueData.totalTicketsSold,
            averageTicketsPerDraw: revenueData.drawHistory.length > 0
                ? Math.floor(revenueData.totalTicketsSold / revenueData.drawHistory.length)
                : 0
        },
        financial: {
            totalRevenue: revenueData.totalTicketsRevenue,
            serverTake: revenueData.totalServerTake,
            payedOut: revenueData.totalPayedOut,
            netProfit: revenueData.netProfit
        },
        margins: {
            profitMargin: `${margin}%`,
            averageMarginPerDraw: `${avgMargin.toFixed(2)}%`,
            serverROI: `${roi.toFixed(2)}%`,
            profitPerDraw: profitPerDraw
        },
        topDraws: revenueData.topRevenueDraws.slice(0, 5).map(d => ({
            id: d.drawId,
            revenue: d.totalRevenue,
            profit: d.totalProfit,
            margin: `${((d.totalProfit / d.totalRevenue) * 100).toFixed(2)}%`
        }))
    };
}

/**
 * Hourly Revenue Report
 */
function getHourlyRevenueReport() {
    const hourly = {};
    for (const [hour, revenue] of revenueData.hourlyRevenue.entries()) {
        hourly[hour] = revenue;
    }
    return hourly;
}

/**
 * Export Revenue Data als JSON
 */
function exportRevenueAsJSON() {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        config: REVENUE_CONFIG,
        current: getDetailedRevenueReport(),
        hourly: getHourlyRevenueReport(),
        draws: revenueData.drawHistory
    }, null, 2);
}

// ════════════════════════════════════════════════════════════════
// REVENUE ANALYSIS
// ════════════════════════════════════════════════════════════════

/**
 * Berechne beste Tageszeit für Lotterie
 */
function getBestHour() {
    let maxRevenue = 0;
    let bestHour = '00:00';

    for (const [hour, revenue] of revenueData.hourlyRevenue.entries()) {
        if (revenue > maxRevenue) {
            maxRevenue = revenue;
            bestHour = hour;
        }
    }

    return { hour: bestHour, revenue: maxRevenue };
}

/**
 * Berechne Trend (steigende/fallende Einnahmen)
 */
function getRevenueTrend() {
    if (revenueData.drawHistory.length < 2) return 'INSUFFICIENT_DATA';

    const lastDraw = revenueData.drawHistory[revenueData.drawHistory.length - 1];
    const previousDraw = revenueData.drawHistory[revenueData.drawHistory.length - 2];

    const trend = lastDraw.totalRevenue - previousDraw.totalRevenue;

    if (trend > 0) return { direction: 'UP', amount: trend };
    if (trend < 0) return { direction: 'DOWN', amount: Math.abs(trend) };
    return { direction: 'FLAT', amount: 0 };
}

/**
 * Berechne Break-Even Point
 */
function getBreakEvenAnalysis() {
    if (revenueData.drawHistory.length === 0) {
        return { drawsNeeded: 'N/A', estimated: 'N/A' };
    }

    const avgProfit = revenueData.netProfit / revenueData.drawHistory.length;
    const avgCost = revenueData.totalPayedOut / revenueData.drawHistory.length;

    return {
        averageProfitPerDraw: avgProfit,
        averageCostPerDraw: avgCost,
        profitPercentage: avgCost > 0 ? ((avgProfit / avgCost) * 100).toFixed(2) + '%' : '0%'
    };
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

export {
    REVENUE_CONFIG,
    calculateServerTake,
    calculateDrawProfit,
    recordDrawRevenue,
    calculateMargin,
    getAverageMarginPerDraw,
    getServerROI,
    getSimpleRevenueReport,
    getDetailedRevenueReport,
    getHourlyRevenueReport,
    exportRevenueAsJSON,
    getBestHour,
    getRevenueTrend,
    getBreakEvenAnalysis,
    revenueData
};
