/**
 * 🎰 LOTTERY SYSTEM - Persistence Module
 * Speichern und Laden von Lotterie-Daten
 * @version 1.0.0
 */

import { world, system } from '@minecraft/server';
import {
    CONFIG,
    playerTickets,
    lotteryDraws,
    worldState
} from './core.js';

// ════════════════════════════════════════════════════════════════
// WORLD DATA PROPERTY KEYS
// ════════════════════════════════════════════════════════════════

const PLAYER_DATA_KEY = 'lottery:playerData';
const LOTTERY_DRAWS_KEY = 'lottery:draws';
const WORLD_STATE_KEY = 'lottery:worldState';

// ════════════════════════════════════════════════════════════════
// SAVE FUNCTIONS
// ════════════════════════════════════════════════════════════════

/**
 * Speichere Spielerdaten in der Welt
 */
function savePlayerData() {
    try {
        const playerDataObj = {};

        for (const [name, data] of playerTickets.entries()) {
            playerDataObj[name] = {
                name: data.name,
                tickets: data.tickets,
                totalSpent: data.totalSpent,
                totalWins: data.totalWins,
                winHistory: data.winHistory,
                joinedDate: data.joinedDate
            };
        }

        world.setDynamicProperty(PLAYER_DATA_KEY, JSON.stringify(playerDataObj));
        console.log(`[Lottery] ${playerTickets.size} Spieler-Datensätze gespeichert`);
    } catch (error) {
        console.warn(`[Lottery] Fehler beim Speichern der Spielerdaten: ${error}`);
    }
}

/**
 * Speichere Lotterie-Ziehungen
 */
function saveLotteryDraws() {
    try {
        const drawsObj = {};

        for (const [id, draw] of lotteryDraws.entries()) {
            drawsObj[id] = {
                id: draw.id,
                timestamp: draw.timestamp,
                winnerName: draw.winnerName,
                winningTicketId: draw.winningTicketId,
                prizeAmount: draw.prizeAmount,
                ticketsSold: draw.ticketsSold,
                totalPot: draw.totalPot
            };
        }

        world.setDynamicProperty(LOTTERY_DRAWS_KEY, JSON.stringify(drawsObj));
        console.log(`[Lottery] ${lotteryDraws.size} Ziehungs-Datensätze gespeichert`);
    } catch (error) {
        console.warn(`[Lottery] Fehler beim Speichern der Ziehungen: ${error}`);
    }
}

/**
 * Speichere globale Welt-Statistik
 */
function saveWorldState() {
    try {
        const stateData = {
            currentDraw: {
                id: worldState.currentDraw.id,
                startTime: worldState.currentDraw.startTime,
                tickets: worldState.currentDraw.tickets,
                totalPot: worldState.currentDraw.totalPot
            },
            drawHistory: worldState.drawHistory,
            nextDrawId: worldState.nextDrawId,
            totalTicketsSold: worldState.totalTicketsSold,
            totalMoneyCyclied: worldState.totalMoneyCyclied,
            lastDrawTime: worldState.lastDrawTime
        };

        world.setDynamicProperty(WORLD_STATE_KEY, JSON.stringify(stateData));
        console.log('[Lottery] Welt-Status gespeichert');
    } catch (error) {
        console.warn(`[Lottery] Fehler beim Speichern des Welt-Status: ${error}`);
    }
}

/**
 * Speichere alle Daten
 */
function saveAllData() {
    savePlayerData();
    saveLotteryDraws();
    saveWorldState();
}

// ════════════════════════════════════════════════════════════════
// LOAD FUNCTIONS
// ════════════════════════════════════════════════════════════════

/**
 * Lade Spielerdaten aus der Welt
 */
function loadPlayerData() {
    try {
        const data = world.getDynamicProperty(PLAYER_DATA_KEY);

        if (!data) {
            console.log('[Lottery] Keine gespeicherten Spielerdaten gefunden');
            return;
        }

        const playerDataObj = JSON.parse(data);

        for (const [name, playerData] of Object.entries(playerDataObj)) {
            playerTickets.set(name, {
                name: playerData.name,
                tickets: playerData.tickets || [],
                totalSpent: playerData.totalSpent || 0,
                totalWins: playerData.totalWins || 0,
                winHistory: playerData.winHistory || [],
                joinedDate: playerData.joinedDate || Date.now()
            });
        }

        console.log(`[Lottery] ${playerTickets.size} Spieler-Datensätze geladen`);
    } catch (error) {
        console.warn(`[Lottery] Fehler beim Laden der Spielerdaten: ${error}`);
    }
}

/**
 * Lade Lotterie-Ziehungen
 */
function loadLotteryDraws() {
    try {
        const data = world.getDynamicProperty(LOTTERY_DRAWS_KEY);

        if (!data) {
            console.log('[Lottery] Keine gespeicherten Ziehungen gefunden');
            return;
        }

        const drawsObj = JSON.parse(data);

        for (const [id, draw] of Object.entries(drawsObj)) {
            lotteryDraws.set(id, {
                id: draw.id,
                timestamp: draw.timestamp,
                winnerName: draw.winnerName,
                winningTicketId: draw.winningTicketId,
                prizeAmount: draw.prizeAmount,
                ticketsSold: draw.ticketsSold,
                totalPot: draw.totalPot
            });
        }

        console.log(`[Lottery] ${lotteryDraws.size} Ziehungs-Datensätze geladen`);
    } catch (error) {
        console.warn(`[Lottery] Fehler beim Laden der Ziehungen: ${error}`);
    }
}

/**
 * Lade globale Welt-Statistik
 */
function loadWorldState() {
    try {
        const data = world.getDynamicProperty(WORLD_STATE_KEY);

        if (!data) {
            console.log('[Lottery] Keine gespeicherten Welt-Status gefunden');
            return;
        }

        const stateData = JSON.parse(data);

        worldState.currentDraw = stateData.currentDraw || worldState.currentDraw;
        worldState.drawHistory = stateData.drawHistory || [];
        worldState.nextDrawId = stateData.nextDrawId || 2;
        worldState.totalTicketsSold = stateData.totalTicketsSold || 0;
        worldState.totalMoneyCyclied = stateData.totalMoneyCyclied || 0;
        worldState.lastDrawTime = stateData.lastDrawTime || Date.now();

        console.log('[Lottery] Welt-Status geladen');
    } catch (error) {
        console.warn(`[Lottery] Fehler beim Laden des Welt-Status: ${error}`);
    }
}

/**
 * Lade alle Daten
 */
function loadAllData() {
    console.log('[Lottery] Lade persistente Daten...');
    loadPlayerData();
    loadLotteryDraws();
    loadWorldState();
    console.log('[Lottery] Alle Daten erfolgreich geladen');
}

// ════════════════════════════════════════════════════════════════
// EXPORT DATA FOR BACKUP
// ════════════════════════════════════════════════════════════════

/**
 * Exportiere alle Daten als JSON für Backup
 */
function exportDataAsJSON() {
    try {
        const exportData = {
            timestamp: Date.now(),
            version: '1.0.0',
            playerData: Object.fromEntries(playerTickets),
            lotteryDraws: Object.fromEntries(lotteryDraws),
            worldState: worldState
        };

        return JSON.stringify(exportData, null, 2);
    } catch (error) {
        console.warn(`[Lottery] Fehler beim Exportieren: ${error}`);
        return null;
    }
}

/**
 * Importiere Daten aus JSON
 */
function importDataFromJSON(jsonData) {
    try {
        const data = JSON.parse(jsonData);

        // Spielerdaten importieren
        if (data.playerData) {
            playerTickets.clear();
            for (const [name, playerData] of Object.entries(data.playerData)) {
                playerTickets.set(name, playerData);
            }
        }

        // Ziehungen importieren
        if (data.lotteryDraws) {
            lotteryDraws.clear();
            for (const [id, draw] of Object.entries(data.lotteryDraws)) {
                lotteryDraws.set(id, draw);
            }
        }

        // Welt-Status importieren
        if (data.worldState) {
            Object.assign(worldState, data.worldState);
        }

        console.log('[Lottery] Daten erfolgreich importiert');
        saveAllData();
        return true;
    } catch (error) {
        console.warn(`[Lottery] Fehler beim Importieren: ${error}`);
        return false;
    }
}

// ════════════════════════════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════════════════════════════

/**
 * Initialisiere Persistenz-System
 */
function initializePersistence() {
    console.log('[Lottery] Initialisiere Persistenz-System...');

    // Lade Daten beim Start
    loadAllData();

    // Starte Auto-Save Loop
    system.runInterval(() => {
        saveAllData();
    }, CONFIG.persistenceInterval / 50); // Minecraft tick interval

    console.log('[Lottery] Persistenz-System aktiv');
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

export {
    initializePersistence,
    saveAllData,
    savePlayerData,
    saveLotteryDraws,
    saveWorldState,
    loadAllData,
    loadPlayerData,
    loadLotteryDraws,
    loadWorldState,
    exportDataAsJSON,
    importDataFromJSON
};
