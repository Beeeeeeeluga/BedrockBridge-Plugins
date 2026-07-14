/**
 * 🎰 LOTTERY SYSTEM - GUI Menu Module
 * Graphisches Interface für Ticket-Kauf und Lotterie-Verwaltung
 * @version 1.0.0
 */

import { bridge } from '../addons';
import { world, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import {
    CONFIG,
    getPlayerData,
    getPlayerStats,
    buyTicket,
    sendSafeMessage,
    broadcastMessage,
    worldState
} from './core.js';

// ════════════════════════════════════════════════════════════════
// MAIN MENU GUI
// ════════════════════════════════════════════════════════════════

/**
 * Hauptmenü für Lotterie
 */
async function showLotteryMainMenu(player) {
    try {
        const stats = getPlayerStats(player.name);
        const draw = worldState.currentDraw;

        const form = new ActionFormData()
            .title('§6🎰 LOTTERIE SYSTEM')
            .body(
                `§7Willkommen, §a${player.name}§7!\n\n` +
                `§7━━━━ AKTUELLE STATISTIK ━━━━\n` +
                `§7Deine Tickets: §a${stats.activeTickets}\n` +
                `§7Ausgegeben: §a${stats.totalSpent}\n` +
                `§7Gewonnen: §a${stats.totalWins}\n\n` +
                `§7━━━━ AKTUELLE LOTTERIE ━━━━\n` +
                `§7Tickets im Pool: §a${draw.tickets.length}/${CONFIG.maxTicketsPerDraw}\n` +
                `§7Pot: §a${draw.totalPot} ${CONFIG.currency}\n` +
                `§7Jackpot: §a${CONFIG.prizePool.jackpot} ${CONFIG.currency}`
            )
            .button('§a🎫 Ticket Kaufen', 'textures/ui/shop')
            .button('§e📊 Statistiken', 'textures/ui/debug')
            .button('§d💰 Gewinne', 'textures/ui/realms_invite_close')
            .button('§cSchließen', 'textures/ui/cancel');

        const response = await form.show(player);

        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                showBuyTicketForm(player);
                break;
            case 1:
                showStatisticsMenu(player);
                break;
            case 2:
                showWinsMenu(player);
                break;
        }
    } catch (error) {
        console.error(`[Lottery GUI] Fehler in Main Menu: ${error}`);
        sendSafeMessage(player, '§cFehler beim Öffnen des Menüs');
    }
}

// ════════════════════════════════════════════════════════════════
// TICKET PURCHASE FORM
// ════════════════════════════════════════════════════════════════

/**
 * Formular zum Ticket-Kauf
 */
async function showBuyTicketForm(player) {
    try {
        const form = new ModalFormData()
            .title('§6🎫 TICKET KAUFEN')
            .textField(
                '§7Anzahl der Tickets (1-10):',
                '1',
                '1'
            )
            .toggle('§7Kauf bestätigen')
            .slider(
                `§7Visualisierung (${CONFIG.ticketPrice} pro Ticket):`,
                1,
                10,
                1,
                1
            );

        const response = await form.show(player);

        if (response.canceled) {
            showLotteryMainMenu(player);
            return;
        }

        const quantity = Math.max(1, Math.min(10, parseInt(response.formValues[0]) || 1));
        const confirmed = response.formValues[1];

        if (!confirmed) {
            sendSafeMessage(player, '§cKauf abgebrochen');
            showLotteryMainMenu(player);
            return;
        }

        // Kaufversuch
        const result = buyTicket(player, quantity);

        if (result.success) {
            sendSafeMessage(player, result.message);
            broadcastMessage(`§e${player.name} §akaufte ${quantity} Lotterie-Ticket(s)!`);

            // Nach kurzer Verzögerung Menü neu öffnen
            system.run(() => {
                showLotteryMainMenu(player);
            });
        } else {
            sendSafeMessage(player, result.message);
            system.run(() => {
                showBuyTicketForm(player);
            });
        }
    } catch (error) {
        console.error(`[Lottery GUI] Fehler beim Ticket-Kauf: ${error}`);
        sendSafeMessage(player, '§cFehler beim Ticket-Kauf');
        showLotteryMainMenu(player);
    }
}

// ════════════════════════════════════════════════════════════════
// STATISTICS MENU
// ════════════════════════════════════════════════════════════════

/**
 * Statistiken-Menü
 */
async function showStatisticsMenu(player) {
    try {
        const stats = getPlayerStats(player.name);
        const playerData = getPlayerData(player.name);

        const form = new ActionFormData()
            .title('§e📊 STATISTIKEN')
            .body(
                `§7═══════════════════════════════════════\n` +
                `§7Spieler: §a${stats.name}\n\n` +
                `§7━━━━ TICKETS ━━━━\n` +
                `§7Gekauft: §a${stats.totalTickets}\n` +
                `§7Aktiv: §a${stats.activeTickets}\n\n` +
                `§7━━━━ FINANZEN ━━━━\n` +
                `§7Ausgegeben: §a${stats.totalSpent}\n` +
                `§7Gewonnen: §a${stats.totalWins}\n` +
                `§7Netto: §${stats.totalWins >= stats.totalSpent ? 'a' : 'c'}${stats.totalWins - stats.totalSpent}\n\n` +
                `§7━━━━ ERFOLGSRATE ━━━━\n` +
                `§7Gewinne: §a${stats.winCount}\n` +
                `§7Win-Rate: §a${stats.winRate}%\n` +
                `§7═══════════════════════════════════════`
            )
            .button('§bZurück', 'textures/ui/backup');

        const response = await form.show(player);

        if (!response.canceled || response.selection === 0) {
            showLotteryMainMenu(player);
        }
    } catch (error) {
        console.error(`[Lottery GUI] Fehler im Stats Menü: ${error}`);
        sendSafeMessage(player, '§cFehler beim Anzeigen der Statistiken');
        showLotteryMainMenu(player);
    }
}

// ════════════════════════════════════════════════════════════════
// WINS MENU
// ════════════════════════════════════════════════════════════════

/**
 * Gewinn-Verwaltungsmenü
 */
async function showWinsMenu(player) {
    try {
        const playerData = getPlayerData(player.name);
        const allWins = playerData.winHistory;
        const unclaimedWins = allWins.filter(w => !w.claimed);

        let bodyText = `§7━━━━ DEINE GEWINNE ━━━━\n`;
        let totalWins = 0;

        if (allWins.length === 0) {
            bodyText += '§cKeine Gewinne vorhanden\n';
        } else {
            const recent = allWins.slice(-5).reverse();
            for (const win of recent) {
                const date = new Date(win.timestamp).toLocaleDateString('de-DE');
                bodyText += `§7${date}: §a${win.prizeAmount} ${CONFIG.currency}\n`;
                totalWins += win.prizeAmount;
            }
        }

        bodyText += `\n§7━━━━ ZUSAMMENFASSUNG ━━━━\n`;
        bodyText += `§7Gesamt Gewinne: §a${totalWins}\n`;
        bodyText += `§7Ausstehend: §a${unclaimedWins.length}`;

        const form = new ActionFormData()
            .title('§d💰 GEWINNE')
            .body(bodyText);

        if (unclaimedWins.length > 0) {
            form.button('§a✓ Gewinne abholen', 'textures/ui/icon_steve');
        }

        form.button('§bZurück', 'textures/ui/backup');

        const response = await form.show(player);

        if (!response.canceled) {
            if (response.selection === 0 && unclaimedWins.length > 0) {
                // Gewinne abholen
                let totalClaimed = 0;
                for (const win of unclaimedWins) {
                    totalClaimed += win.prizeAmount;
                    win.claimed = true;
                }
                sendSafeMessage(player, `§a✓ ${unclaimedWins.length} Gewinn(e) erhalten: ${totalClaimed} ${CONFIG.currency}`);
                system.run(() => {
                    showWinsMenu(player);
                });
            } else {
                showLotteryMainMenu(player);
            }
        }
    } catch (error) {
        console.error(`[Lottery GUI] Fehler im Wins Menü: ${error}`);
        sendSafeMessage(player, '§cFehler beim Anzeigen der Gewinne');
        showLotteryMainMenu(player);
    }
}

// ════════════════════════════════════════════════════════════════
// ADMIN MENUS
// ════════════════════════════════════════════════════════════════

/**
 * Admin-Menü für Lotterie-Verwaltung
 */
async function showAdminMenu(player) {
    try {
        const form = new ActionFormData()
            .title('§c⚙️ LOTTERIE ADMIN')
            .body('§7Verwalte die Lotterie-Einstellungen')
            .button('§e🎰 Ziehung durchführen', 'textures/ui/shop')
            .button('§b📊 Weltstatistiken', 'textures/ui/debug')
            .button('§dSpieler suchen', 'textures/ui/realms_invite_close')
            .button('§cZurück', 'textures/ui/cancel');

        const response = await form.show(player);

        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                showDrawConfirmation(player);
                break;
            case 1:
                showWorldStats(player);
                break;
            case 2:
                showPlayerSearchForm(player);
                break;
        }
    } catch (error) {
        console.error(`[Lottery GUI] Fehler im Admin Menü: ${error}`);
        sendSafeMessage(player, '§cFehler beim Öffnen des Admin-Menüs');
    }
}

/**
 * Ziehungs-Bestätigung
 */
async function showDrawConfirmation(player) {
    try {
        const form = new ActionFormData()
            .title('§6⚠️ ZIEHUNG DURCHFÜHREN')
            .body(
                '§cAchtung! Dies wird sofort eine Lotterie-Ziehung durchführen.\n\n' +
                '§7Bist du sicher?'
            )
            .button('§a✓ Bestätigen', 'textures/ui/confirm')
            .button('§cAbbrechen', 'textures/ui/cancel');

        const response = await form.show(player);

        if (!response.canceled && response.selection === 0) {
            // Ziehung via command durchführen
            world.getDimension('overworld').runCommand(`/lotto-admin-draw`);
            sendSafeMessage(player, '§aZiehung durchgeführt!');
        }

        system.run(() => {
            showAdminMenu(player);
        });
    } catch (error) {
        console.error(`[Lottery GUI] Fehler bei Draw Confirmation: ${error}`);
        sendSafeMessage(player, '§cFehler bei der Ziehung');
        showAdminMenu(player);
    }
}

/**
 * Weltweite Statistiken anzeigen
 */
async function showWorldStats(player) {
    try {
        const recent = worldState.drawHistory.slice(-5).reverse();
        let winHistory = '';

        if (recent.length === 0) {
            winHistory = '§cKeine Ziehungen durchgeführt';
        } else {
            for (const draw of recent) {
                const date = new Date(draw.timestamp).toLocaleDateString('de-DE');
                winHistory += `§7${date}: §a${draw.winnerName} §7→ §a${draw.prizeAmount}\n`;
            }
        }

        const form = new ActionFormData()
            .title('§b🌍 WELTSTATISTIKEN')
            .body(
                `§7═══════════════════════════════════════\n` +
                `§7Gesamt Tickets: §a${worldState.totalTicketsSold}\n` +
                `§7Geld in Umlauf: §a${worldState.totalMoneyCyclied}\n` +
                `§7Ziehungen: §a${worldState.drawHistory.length}\n` +
                `§7Aktive Spieler: §a${new Map(require('./core.js').playerTickets).size}\n\n` +
                `§7━━━━ LETZTE ZIEHUNGEN ━━━━\n` +
                winHistory +
                `§7═══════════════════════════════════════`
            )
            .button('§bZurück', 'textures/ui/backup');

        const response = await form.show(player);

        if (!response.canceled) {
            showAdminMenu(player);
        }
    } catch (error) {
        console.error(`[Lottery GUI] Fehler in World Stats: ${error}`);
        sendSafeMessage(player, '§cFehler beim Anzeigen der Statistiken');
        showAdminMenu(player);
    }
}

/**
 * Spieler-Suche
 */
async function showPlayerSearchForm(player) {
    try {
        const form = new ModalFormData()
            .title('§d🔍 SPIELER SUCHEN')
            .textField('§7Spielername:', 'Steve', '');

        const response = await form.show(player);

        if (response.canceled) {
            showAdminMenu(player);
            return;
        }

        const searchName = response.formValues[0];
        const targetPlayer = world.getPlayers({ name: searchName })[0];

        if (!targetPlayer) {
            sendSafeMessage(player, `§cSpieler "${searchName}" nicht gefunden`);
            system.run(() => {
                showPlayerSearchForm(player);
            });
            return;
        }

        showPlayerDetailsAdmin(player, targetPlayer);
    } catch (error) {
        console.error(`[Lottery GUI] Fehler in Player Search: ${error}`);
        sendSafeMessage(player, '§cFehler bei der Spielersuche');
        showAdminMenu(player);
    }
}

/**
 * Spieler-Details (Admin-Ansicht)
 */
async function showPlayerDetailsAdmin(adminPlayer, targetPlayer) {
    try {
        const stats = getPlayerStats(targetPlayer.name);

        const form = new ActionFormData()
            .title(`§e${targetPlayer.name}`)
            .body(
                `§7━━━━ SPIELER DETAILS ━━━━\n` +
                `§7Tickets: §a${stats.totalTickets}\n` +
                `§7Aktiv: §a${stats.activeTickets}\n` +
                `§7Ausgegeben: §a${stats.totalSpent}\n` +
                `§7Gewonnen: §a${stats.totalWins}\n` +
                `§7Win-Rate: §a${stats.winRate}%\n\n` +
                `§7━━━━ ADMIN AKTIONEN ━━━━`
            )
            .button('§c🗑️ Daten löschen', 'textures/ui/cancel')
            .button('§bZurück', 'textures/ui/backup');

        const response = await form.show(adminPlayer);

        if (!response.canceled) {
            if (response.selection === 0) {
                // Bestätigung für Löschen
                showDeleteConfirmation(adminPlayer, targetPlayer);
            } else {
                showPlayerSearchForm(adminPlayer);
            }
        }
    } catch (error) {
        console.error(`[Lottery GUI] Fehler in Player Details: ${error}`);
        sendSafeMessage(adminPlayer, '§cFehler beim Anzeigen der Spielerdetails');
        showAdminMenu(adminPlayer);
    }
}

/**
 * Lösch-Bestätigung
 */
async function showDeleteConfirmation(adminPlayer, targetPlayer) {
    try {
        const form = new ActionFormData()
            .title('⚠️ WARNUNG')
            .body(`§cDu wirst alle Lotterie-Daten von §a${targetPlayer.name}§c löschen.\n\nDies kann nicht rückgängig gemacht werden!`)
            .button('§a✓ Löschen', 'textures/ui/confirm')
            .button('§cAbbrechen', 'textures/ui/cancel');

        const response = await form.show(adminPlayer);

        if (!response.canceled && response.selection === 0) {
            // Daten löschen
            require('./core.js').playerTickets.delete(targetPlayer.name);
            sendSafeMessage(adminPlayer, `§a✓ Daten von ${targetPlayer.name} gelöscht`);
        }

        system.run(() => {
            showAdminMenu(adminPlayer);
        });
    } catch (error) {
        console.error(`[Lottery GUI] Fehler in Delete Confirmation: ${error}`);
        sendSafeMessage(adminPlayer, '§cFehler beim Löschen der Daten');
        showAdminMenu(adminPlayer);
    }
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

export {
    showLotteryMainMenu,
    showBuyTicketForm,
    showStatisticsMenu,
    showWinsMenu,
    showAdminMenu,
    showWorldStats,
    showPlayerSearchForm
};
