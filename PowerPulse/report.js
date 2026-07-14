/**
 * report.js - BedrockBridge Report System Plugin (Ultra Ultimate Edition, UI v2.0.0)
 *
 * Uses @minecraft/server-ui 2.0.0:
 * - ActionFormData for menus
 * - ModalFormData for text inputs / config
 * - Correct textField(label, placeholder, options) signature
 * - Safe chat messages to avoid RawMessageError
 */

import { world, system } from "@minecraft/server";
import {
    ActionFormData,
    ModalFormData,
    MessageFormData
} from "@minecraft/server-ui";
import { bridge, database } from "../addons";
import { bridgeDirect } from "../BridgeDirect";

// --------------------------------------------------
// Safe Chat Helper (avoid RawMessageError)
// --------------------------------------------------

/**
 * Safely send a chat message to a player.
 * - Converts non-strings to string
 * - Skips completely empty messages
 * - Catches native errors like RawMessageError
 */
function safeSendMessage(recipient, msg) {
    try {
        if (!recipient || typeof recipient.sendMessage !== "function") return;
        let text =
            typeof msg === "string"
                ? msg
                : msg === undefined || msg === null
                ? ""
                : String(msg);
        if (!text || text.trim().length === 0) {
            // avoid {"rawtext":[null]} / empty rawtext issues
            return;
        }
        recipient.sendMessage(text);
    } catch {
        // Silent: we really don't want unhandled promise rejections
    }
}

// --------------------------------------------------
// Simple logger
// --------------------------------------------------

function log(message, level = "info") {
    const timestamp = new Date().toISOString().split("T")[1]?.slice(0, 8) ?? "";
    const prefix = `[Report ${timestamp}]`;
    switch (level) {
        case "error":
            console.error(`${prefix} ERROR: ${message}`);
            break;
        case "warn":
            console.warn(`${prefix} WARN: ${message}`);
            break;
        default:
            console.log(`${prefix} ${message}`);
    }
}

// --------------------------------------------------
// Data & Persistence
// --------------------------------------------------

const REPORT_TABLE_NAME = "reportSystem";
const REPORT_LIST_KEY = "reports";
const REPORT_COUNTER_KEY = "nextId";
const REPORT_CONFIG_TABLE_NAME = "reportSystemConfig";

const reportTable = database.makeTable(REPORT_TABLE_NAME);
const configTable = database.makeTable(REPORT_CONFIG_TABLE_NAME);

/**
 * Default configuration.
 */
const defaultConfig = {
    logDiscord: true,
    notifyStaffInGame: true,
    staffTag: "esploratori:admin",
    maxExtraLength: 500,
    notifyTargetPlayer: false // notify reported player in-game
};

/**
 * Runtime config object.
 */
const reportConfig = {
    logDiscord: getStoredBoolean("logDiscord", defaultConfig.logDiscord),
    notifyStaffInGame: getStoredBoolean(
        "notifyStaffInGame",
        defaultConfig.notifyStaffInGame
    ),
    staffTag: getStoredString("staffTag", defaultConfig.staffTag),
    maxExtraLength: getStoredInteger(
        "maxExtraLength",
        defaultConfig.maxExtraLength
    ),
    notifyTargetPlayer: getStoredBoolean(
        "notifyTargetPlayer",
        defaultConfig.notifyTargetPlayer
    )
};

// Helper: Loaders
function getStoredBoolean(key, fallback) {
    const val = configTable.get(key);
    if (typeof val === "boolean") return val;
    return fallback;
}

function getStoredString(key, fallback) {
    const val = configTable.get(key);
    if (typeof val === "string" && val.length > 0) return val;
    return fallback;
}

function getStoredInteger(key, fallback) {
    const val = configTable.get(key);
    if (typeof val === "number" && Number.isInteger(val) && val > 0) {
        return val;
    }
    return fallback;
}

// Helper: Savers
function setStoredBoolean(key, value) {
    const boolVal = !!value;
    configTable.set(key, boolVal);
    if (key === "logDiscord") reportConfig.logDiscord = boolVal;
    if (key === "notifyStaffInGame") reportConfig.notifyStaffInGame = boolVal;
    if (key === "notifyTargetPlayer") reportConfig.notifyTargetPlayer = boolVal;
}

function setStoredString(key, value) {
    const v = String(value ?? "").trim();
    configTable.set(key, v);
    if (key === "staffTag") reportConfig.staffTag = v;
}

function setStoredInteger(key, value) {
    const n = Math.max(1, Math.floor(Number(value) || 1));
    configTable.set(key, n);
    if (key === "maxExtraLength") reportConfig.maxExtraLength = n;
}

/**
 * Report structure:
 * {
 *   id: number,
 *   timestamp: number,
 *   createdAtISO: string,
 *   reporterName: string,
 *   reporterId: string,
 *   targetName: string,
 *   targetId: string,
 *   reasonKey: string,
 *   reasonLabel: string,
 *   extra: string,
 *   status: "open" | "closed",
 *   handledBy?: string,
 *   handledNote?: string,
 *   handledAt?: number
 * }
 */

let reports = loadReports();

function loadReports() {
    const stored = reportTable.get(REPORT_LIST_KEY);
    if (Array.isArray(stored)) {
        log(`Loaded ${stored.length} reports from database`);
        return stored;
    }
    return [];
}

function saveReports() {
    reportTable.set(REPORT_LIST_KEY, reports);
}

function getNextReportId() {
    const current = reportTable.get(REPORT_COUNTER_KEY) ?? 1;
    reportTable.set(REPORT_COUNTER_KEY, current + 1);
    return current;
}

// --------------------------------------------------
// BedrockBridge / Discord Initialization
// --------------------------------------------------

bridge.events.bridgeInitialize.subscribe((e) => {
    // Enable direct Discord messages
    e.registerAddition("discord_direct");

    // For security: these commands NOT allowed via Discord /command
    bridge.discordCommands.forbid(
        "report",
        "reports",
        "reportconfig",
        "reportmenu"
    );

    log("Report System initialized (Bridge addition registered)");
});

// --------------------------------------------------
// Utility: Time & Formatting
// --------------------------------------------------

function unixSeconds(ms) {
    return Math.floor(ms / 1000);
}

function shortStatus(status) {
    return status === "closed" ? "Closed" : "Open";
}

function formatReportSummaryLine(r) {
    return `#${r.id} ${r.targetName} <- ${r.reporterName} [${r.reasonLabel}] (${shortStatus(
        r.status
    )})`;
}

function formatReportDetails(r) {
    const created = new Date(r.timestamp).toISOString();
    const extraText =
        r.extra && r.extra.trim().length > 0 ? r.extra : "(none)";
    const noteText =
        r.handledNote && r.handledNote.trim().length > 0
            ? r.handledNote
            : "(none)";
    const handledBy = r.handledBy ?? "(nobody)";
    const handledAt = r.handledAt
        ? new Date(r.handledAt).toISOString()
        : "(never)";
    return (
        `§eReport #${r.id}\n` +
        `§7Status§r: ${shortStatus(r.status)}\n` +
        `§7Reporter§r: ${r.reporterName}\n` +
        `§7Target§r: ${r.targetName}\n` +
        `§7Reason§r: ${r.reasonLabel}\n` +
        `§7Extra§r:\n${extraText}\n\n` +
        `§7Handled By§r: ${handledBy}\n` +
        `§7Handled Note§r: ${noteText}\n` +
        `§7Created At§r: ${created}\n` +
        `§7Handled At§r: ${handledAt}`
    );
}

// --------------------------------------------------
// Reasons
// --------------------------------------------------

const REPORT_REASONS = [
    { key: "cheating", label: "Cheating / Hacks" },
    { key: "griefing", label: "Griefing / Base Damage" },
    { key: "chat_abuse", label: "Chat Abuse / Harassment" },
    { key: "bug_exploit", label: "Bug / Exploit Abuse" },
    { key: "other", label: "Other / Not Listed" }
];

// --------------------------------------------------
// Utility: Player / Staff Helpers
// --------------------------------------------------

function getOnlinePlayers() {
    return world.getAllPlayers();
}

function isPlayerOnline(player) {
    return !!getOnlinePlayers().find((p) => p.id === player.id);
}

function broadcastToStaff(message) {
    if (!reportConfig.notifyStaffInGame) return;
    const tag = reportConfig.staffTag;
    for (const p of getOnlinePlayers()) {
        if (p.hasTag(tag)) {
            safeSendMessage(p, message);
        }
    }
}

// --------------------------------------------------
// Discord Logging
// --------------------------------------------------

function sendReportToDiscord(r) {
    if (!reportConfig.logDiscord) return;
    if (!bridgeDirect.ready) return;

    const extraText =
        r.extra && r.extra.trim().length > 0 ? r.extra : "_none_";
    const unix = unixSeconds(r.timestamp);

    const description =
        `**Reporter:** ${r.reporterName}\n` +
        `**Target:** ${r.targetName}\n` +
        `**Reason:** ${r.reasonLabel}\n` +
        `**Extra:** ${extraText}\n` +
        `**Status:** ${shortStatus(r.status)}\n` +
        `**ID:** #${r.id}\n` +
        `**Time:** <t:${unix}:f>`;

    try {
        bridgeDirect.sendEmbed(
            {
                title: "New Player Report",
                description,
                color: 15158332
            },
            "Report System",
            undefined
        );
    } catch (e) {
        log(`Discord sendReportToDiscord failed: ${e}`, "error");
    }
}

function sendReportStatusChangeToDiscord(r, adminName) {
    if (!reportConfig.logDiscord) return;
    if (!bridgeDirect.ready) return;

    const description =
        `Report **#${r.id}** (${r.targetName} <- ${r.reporterName}) status changed.\n\n` +
        `**New Status:** ${shortStatus(r.status)}\n` +
        `**Handled By:** ${adminName}\n` +
        (r.handledNote && r.handledNote.trim().length > 0
            ? `**Note:** ${r.handledNote}`
            : "");

    try {
        bridgeDirect.sendEmbed(
            {
                title: "Report Status Update",
                description,
                color: r.status === "closed" ? 5763719 : 3447003
            },
            "Report System",
            undefined
        );
    } catch (e) {
        log(`Discord sendReportStatusChangeToDiscord failed: ${e}`, "error");
    }
}

// --------------------------------------------------
// Player Report Flow (UI) - /report
// --------------------------------------------------

function openReportFlow(player, preselectedTarget) {
    if (preselectedTarget && isPlayerOnline(preselectedTarget)) {
        if (preselectedTarget.id === player.id) {
            safeSendMessage(player, "§cYou cannot report yourself.");
            return;
        }
        openReasonSelectionUI(player, preselectedTarget);
        return;
    }
    openTargetSelectionUI(player);
}

/**
 * Step 1: Select target player.
 */
function openTargetSelectionUI(player) {
    const allPlayers = getOnlinePlayers().filter((p) => p.id !== player.id);

    if (allPlayers.length === 0) {
        safeSendMessage(player, "§cThere is nobody else online to report.");
        return;
    }

    const form = new ActionFormData()
        .title("Report a Player")
        .body("Select the player you want to report:");

    allPlayers.forEach((p) => form.button(p.name));

    form
        .show(player)
        .then((res) => {
            if (res.canceled || res.selection === undefined) {
                safeSendMessage(player, "§7Report cancelled.");
                return;
            }

            const target = allPlayers[res.selection];
            if (!target || !isPlayerOnline(target)) {
                safeSendMessage(
                    player,
                    "§cSelected player is no longer online."
                );
                return;
            }

            if (target.id === player.id) {
                safeSendMessage(player, "§cYou cannot report yourself.");
                return;
            }

            openReasonSelectionUI(player, target);
        })
        .catch((e) => {
            log(`openTargetSelectionUI error: ${e}`, "error");
        });
}

/**
 * Step 2: Select reason.
 */
function openReasonSelectionUI(player, target) {
    const form = new ActionFormData()
        .title("Report Reason")
        .body(`Reporting: §e${target.name}§r\n\nSelect a reason:`);

    REPORT_REASONS.forEach((r) => form.button(r.label));

    form
        .show(player)
        .then((res) => {
            if (res.canceled || res.selection === undefined) {
                safeSendMessage(player, "§7Report cancelled.");
                return;
            }

            const chosenReason = REPORT_REASONS[res.selection];
            if (!chosenReason) {
                safeSendMessage(player, "§cInvalid reason selection.");
                return;
            }

            openExtraDetailsUI(player, target, chosenReason);
        })
        .catch((e) => {
            log(`openReasonSelectionUI error: ${e}`, "error");
        });
}

/**
 * Step 3: Optional extra details text.
 * Correct UI v2.0.0 signature:
 *   textField(label, placeholder, { defaultValue, tooltip })
 */
function openExtraDetailsUI(player, target, reason) {
    const modal = new ModalFormData().title("Extra Details (Optional)");

    modal.textField(
        "Extra details (optional):",
        `Up to ${reportConfig.maxExtraLength} characters`,
        {
            defaultValue: "",
            tooltip:
                "You can describe what happened here. Leave empty if you want."
        }
    );

    modal
        .show(player)
        .then((res) => {
            if (res.canceled) {
                safeSendMessage(player, "§7Report cancelled.");
                return;
            }

            let extra = (res.formValues && res.formValues[0]) || "";
            extra = String(extra ?? "");

            if (extra.length > reportConfig.maxExtraLength) {
                extra = extra.slice(0, reportConfig.maxExtraLength);
            }

            const now = Date.now();
            const report = {
                id: getNextReportId(),
                timestamp: now,
                createdAtISO: new Date(now).toISOString(),
                reporterName: player.name,
                reporterId: player.id,
                targetName: target.name,
                targetId: target.id,
                reasonKey: reason.key,
                reasonLabel: reason.label,
                extra,
                status: "open",
                handledBy: undefined,
                handledNote: undefined,
                handledAt: undefined
            };

            reports.push(report);
            saveReports();

            safeSendMessage(
                player,
                `§a[Report] §rYour report (#${report.id}) against §e${target.name}§r has been submitted.`
            );

            // Optional notify target player
            if (reportConfig.notifyTargetPlayer) {
                const onlineTarget = getOnlinePlayers().find(
                    (p) => p.id === target.id || p.name === target.name
                );
                if (onlineTarget) {
                    safeSendMessage(
                        onlineTarget,
                        `§c[Report] §eYou have been reported by §b${player.name}§e for §b${reason.label}§e. Staff will review this report.`
                    );
                }
            }

            broadcastToStaff(
                `§d[Report] §rNew report #${report.id}: §e${report.targetName}§r <- §b${report.reporterName}§r [${report.reasonLabel}]`
            );

            sendReportToDiscord(report);
        })
        .catch((e) => {
            log(`openExtraDetailsUI error: ${e}`, "error");
        });
}

// --------------------------------------------------
// Admin Management UI - /reports
// --------------------------------------------------

function openReportManagerUI(admin) {
    const total = reports.length;
    const openCount = reports.filter((r) => r.status === "open").length;

    const form = new ActionFormData()
        .title("Report Manager")
        .body(
            `Manage player reports.\n\n` +
                `§7Open reports§r: ${openCount}\n` +
                `§7Total reports§r: ${total}`
        );

    form.button(`View OPEN reports (${openCount})`);
    form.button(`View ALL reports (${total})`);
    form.button("View statistics");
    form.button("Config menu");
    form.button("Close");

    form
        .show(admin)
        .then((res) => {
            if (res.canceled || res.selection === undefined) return;

            switch (res.selection) {
                case 0:
                    openReportListUI(admin, "open");
                    break;
                case 1:
                    openReportListUI(admin, "all");
                    break;
                case 2:
                    openReportStatsUI(admin);
                    break;
                case 3:
                    openReportConfigMenu(admin);
                    break;
                case 4:
                default:
                    break;
            }
        })
        .catch((e) => {
            log(`openReportManagerUI error: ${e}`, "error");
        });
}

/**
 * List reports (open/all) and let admin pick one.
 * We limit buttons to 30 per page.
 */
function openReportListUI(admin, mode, page = 0) {
    const filtered =
        mode === "open"
            ? reports.filter((r) => r.status === "open")
            : reports.slice();

    if (filtered.length === 0) {
        safeSendMessage(
            admin,
            mode === "open"
                ? "§7There are currently no open reports."
                : "§7There are no reports stored."
        );
        return;
    }

    const pageSize = 30;
    const start = page * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const modeLabel =
        mode === "open"
            ? "OPEN REPORTS"
            : mode === "all"
            ? "ALL REPORTS"
            : mode.toUpperCase();

    const form = new ActionFormData()
        .title(mode === "open" ? "Open Reports" : "All Reports")
        .body(
            `Select a report to view details.\n` +
                `Mode: ${modeLabel}\n` +
                `Page: ${page + 1} / ${totalPages}`
        );

    pageItems.forEach((r) => {
        form.button(formatReportSummaryLine(r));
    });

    if (start + pageSize < filtered.length) {
        form.button("Next page ▶");
    }
    if (page > 0) {
        form.button("◀ Previous page");
    }

    form
        .show(admin)
        .then((res) => {
            if (res.canceled || res.selection === undefined) return;

            const maxIndex = pageItems.length - 1;
            if (res.selection <= maxIndex) {
                const chosen = pageItems[res.selection];
                if (!chosen) return;
                openReportDetailUI(admin, chosen.id, mode, page);
                return;
            }

            // Navigation buttons
            const navIndex = res.selection - pageItems.length;
            if (
                navIndex === 0 &&
                start + pageSize < filtered.length &&
                pageItems.length === pageSize
            ) {
                // Next page
                openReportListUI(admin, mode, page + 1);
            } else if (navIndex === 1 && page > 0) {
                // Previous page
                openReportListUI(admin, mode, page - 1);
            }
        })
        .catch((e) => {
            log(`openReportListUI error: ${e}`, "error");
        });
}

/**
 * Show details of a single report + actions.
 */
function openReportDetailUI(admin, reportId, mode, page) {
    const r = reports.find((rep) => rep.id === reportId);
    if (!r) {
        safeSendMessage(admin, "§cThis report no longer exists.");
        openReportListUI(admin, mode, page ?? 0);
        return;
    }

    const form = new ActionFormData()
        .title(`Report #${r.id}`)
        .body(formatReportDetails(r));

    form.button(r.status === "open" ? "Mark as CLOSED" : "Re-open report");
    form.button("Edit admin note");
    form.button("Delete report");
    form.button("Back to list");

    form
        .show(admin)
        .then((res) => {
            if (res.canceled || res.selection === undefined) return;

            switch (res.selection) {
                case 0:
                    toggleReportStatus(admin, r, mode, page);
                    break;
                case 1:
                    openEditNoteUI(admin, r, mode, page);
                    break;
                case 2:
                    openDeleteConfirmUI(admin, r, mode, page);
                    break;
                case 3:
                    openReportListUI(admin, mode, page ?? 0);
                    break;
            }
        })
        .catch((e) => {
            log(`openReportDetailUI error: ${e}`, "error");
        });
}

function toggleReportStatus(admin, report, mode, page) {
    report.status = report.status === "open" ? "closed" : "open";
    report.handledBy = admin.name;
    report.handledAt = Date.now();
    saveReports();

    safeSendMessage(
        admin,
        `§a[Report] §rReport #${report.id} status set to §e${shortStatus(
            report.status
        )}§r.`
    );

    sendReportStatusChangeToDiscord(report, admin.name);
    openReportDetailUI(admin, report.id, mode, page);
}

/**
 * Edit note – uses UI v2.0.0 textField signature.
 */
function openEditNoteUI(admin, report, mode, page) {
    const currentNote = report.handledNote ?? "";

    const modal = new ModalFormData().title(
        `Edit Note for Report #${report.id}`
    );

    modal.textField(
        "Admin note:",
        "Type any note for other staff",
        {
            defaultValue: currentNote,
            tooltip: "This note is only visible to staff."
        }
    );

    modal
        .show(admin)
        .then((res) => {
            if (res.canceled) {
                openReportDetailUI(admin, report.id, mode, page);
                return;
            }

            const newNote = (res.formValues && res.formValues[0]) || "";
            report.handledNote = String(newNote ?? "");
            report.handledBy = admin.name;
            report.handledAt = Date.now();

            saveReports();

            safeSendMessage(
                admin,
                `§a[Report] §rNote for report #${report.id} has been updated.`
            );

            sendReportStatusChangeToDiscord(report, admin.name);
            openReportDetailUI(admin, report.id, mode, page);
        })
        .catch((e) => {
            log(`openEditNoteUI error: ${e}`, "error");
        });
}

function openDeleteConfirmUI(admin, report, mode, page) {
    const form = new MessageFormData()
        .title(`Delete Report #${report.id}?`)
        .body(
            "Are you sure you want to delete this report?\n" +
                "This cannot be undone.\n\n" +
                formatReportSummaryLine(report)
        )
        .button1("§cYes, delete")
        .button2("§aNo, cancel");

    form
        .show(admin)
        .then((res) => {
            if (res.canceled || res.selection === undefined) {
                openReportDetailUI(admin, report.id, mode, page);
                return;
            }

            if (res.selection === 0) {
                reports = reports.filter((r) => r.id !== report.id);
                saveReports();
                safeSendMessage(
                    admin,
                    `§a[Report] §rReport #${report.id} has been deleted.`
                );
                openReportListUI(admin, mode, page ?? 0);
            } else {
                openReportDetailUI(admin, report.id, mode, page);
            }
        })
        .catch((e) => {
            log(`openDeleteConfirmUI error: ${e}`, "error");
        });
}

// --------------------------------------------------
// Stats & Config UI
// --------------------------------------------------

function computeReportStats() {
    const total = reports.length;
    const open = reports.filter((r) => r.status === "open").length;
    const closed = total - open;

    const perReason = {};
    const reportedPlayers = {};
    const reporters = {};

    for (const r of reports) {
        perReason[r.reasonLabel] = (perReason[r.reasonLabel] || 0) + 1;
        reportedPlayers[r.targetName] =
            (reportedPlayers[r.targetName] || 0) + 1;
        reporters[r.reporterName] = (reporters[r.reporterName] || 0) + 1;
    }

    const toSortedArray = (mapObj) =>
        Object.entries(mapObj).sort((a, b) => b[1] - a[1]);

    return {
        total,
        open,
        closed,
        perReason: toSortedArray(perReason),
        reportedPlayers: toSortedArray(reportedPlayers),
        reporters: toSortedArray(reporters)
    };
}

function openReportStatsUI(admin) {
    const stats = computeReportStats();

    let text = "§bReport Statistics\n\n";
    text += `§7Total reports: §f${stats.total}\n`;
    text += `§7Open: §a${stats.open} §7• Closed: §c${stats.closed}\n\n`;

    text += "§6By Reason:\n";
    if (stats.perReason.length === 0) {
        text += "  §7(no reports yet)\n";
    } else {
        for (const [reason, count] of stats.perReason.slice(0, 10)) {
            text += `  §8• §f${reason}: §e${count}\n`;
        }
    }

    text += "\n§6Most Reported Players:\n";
    if (stats.reportedPlayers.length === 0) {
        text += "  §7(no reports yet)\n";
    } else {
        for (const [name, count] of stats.reportedPlayers.slice(0, 5)) {
            text += `  §8• §f${name}: §e${count}\n`;
        }
    }

    text += "\n§6Top Reporters:\n";
    if (stats.reporters.length === 0) {
        text += "  §7(no reports yet)\n";
    } else {
        for (const [name, count] of stats.reporters.slice(0, 5)) {
            text += `  §8• §f${name}: §e${count}\n`;
        }
    }

    const form = new ActionFormData()
        .title("Report Statistics")
        .body(text)
        .button("§aRefresh")
        .button("§7Back");

    form
        .show(admin)
        .then((res) => {
            if (res.canceled || res.selection === undefined) {
                openReportManagerUI(admin);
                return;
            }

            if (res.selection === 0) {
                // Refresh
                system.runTimeout(() => openReportStatsUI(admin), 5);
            } else {
                openReportManagerUI(admin);
            }
        })
        .catch((e) => {
            log(`openReportStatsUI error: ${e}`, "error");
        });
}

function openReportConfigMenu(admin) {
    const flag = (v) => (v ? "§aON§r" : "§cOFF§r");

    const form = new ActionFormData()
        .title("Report Config")
        .body(
            "Configure the behaviour of the report system:" +
                `\n\nDiscord logging: ${flag(reportConfig.logDiscord)}` +
                `\nStaff notify: ${flag(reportConfig.notifyStaffInGame)}` +
                `\nNotify target: ${flag(reportConfig.notifyTargetPlayer)}` +
                `\nStaff tag: §e${reportConfig.staffTag}§r` +
                `\nMax extra length: §e${reportConfig.maxExtraLength}`
        )
        .button(
            `Discord logging: ${flag(reportConfig.logDiscord).replace(
                "§r",
                ""
            )}`
        )
        .button(
            `Staff notify: ${flag(reportConfig.notifyStaffInGame).replace(
                "§r",
                ""
            )}`
        )
        .button(
            `Notify target: ${flag(reportConfig.notifyTargetPlayer).replace(
                "§r",
                ""
            )}`
        )
        .button("Change staff tag")
        .button("Change max extra length")
        .button("Show summary in chat")
        .button("Back");

    form
        .show(admin)
        .then((res) => {
            if (res.canceled || res.selection === undefined) {
                openReportManagerUI(admin);
                return;
            }

            switch (res.selection) {
                case 0: {
                    const newVal = !reportConfig.logDiscord;
                    setStoredBoolean("logDiscord", newVal);
                    safeSendMessage(
                        admin,
                        `§aDiscord logging is now ${
                            newVal ? "§aON" : "§cOFF"
                        }`
                    );
                    system.runTimeout(
                        () => openReportConfigMenu(admin),
                        5
                    );
                    break;
                }
                case 1: {
                    const newVal = !reportConfig.notifyStaffInGame;
                    setStoredBoolean("notifyStaffInGame", newVal);
                    safeSendMessage(
                        admin,
                        `§aStaff notifications are now ${
                            newVal ? "§aON" : "§cOFF"
                        }`
                    );
                    system.runTimeout(
                        () => openReportConfigMenu(admin),
                        5
                    );
                    break;
                }
                case 2: {
                    const newVal = !reportConfig.notifyTargetPlayer;
                    setStoredBoolean("notifyTargetPlayer", newVal);
                    safeSendMessage(
                        admin,
                        `§aTarget notifications are now ${
                            newVal ? "§aON" : "§cOFF"
                        }`
                    );
                    system.runTimeout(
                        () => openReportConfigMenu(admin),
                        5
                    );
                    break;
                }
                case 3:
                    openChangeStaffTagUI(admin);
                    break;
                case 4:
                    openChangeMaxExtraLengthUI(admin);
                    break;
                case 5:
                    // show summary in chat
                    for (const line of getConfigSummaryLines()) {
                        safeSendMessage(admin, line);
                    }
                    system.runTimeout(
                        () => openReportConfigMenu(admin),
                        5
                    );
                    break;
                case 6:
                default:
                    openReportManagerUI(admin);
                    break;
            }
        })
        .catch((e) => {
            log(`openReportConfigMenu error: ${e}`, "error");
        });
}

function openChangeStaffTagUI(admin) {
    const modal = new ModalFormData().title("Change Staff Tag");

    modal.textField(
        "Staff tag used to detect admins (players with this tag get notifications):",
        "e.g. esploratori:admin",
        {
            defaultValue: reportConfig.staffTag,
            tooltip: "Players with this tag will receive staff notifications."
        }
    );

    modal
        .show(admin)
        .then((res) => {
            if (res.canceled) {
                openReportConfigMenu(admin);
                return;
            }

            const value = (res.formValues && res.formValues[0]) || "";
            const tag = String(value ?? "").trim();
            if (!tag) {
                safeSendMessage(admin, "§cStaff tag cannot be empty.");
                openReportConfigMenu(admin);
                return;
            }

            setStoredString("staffTag", tag);
            safeSendMessage(
                admin,
                `§aStaff tag updated to §e${tag}§a.`
            );
            system.runTimeout(
                () => openReportConfigMenu(admin),
                5
            );
        })
        .catch((e) => {
            log(`openChangeStaffTagUI error: ${e}`, "error");
            openReportConfigMenu(admin);
        });
}

function openChangeMaxExtraLengthUI(admin) {
    const modal = new ModalFormData().title("Max Extra Length");

    modal.textField(
        `Maximum number of characters allowed in the extra field (current: ${reportConfig.maxExtraLength}):`,
        "500",
        {
            defaultValue: `${reportConfig.maxExtraLength}`,
            tooltip: "Higher values allow longer descriptions in reports."
        }
    );

    modal
        .show(admin)
        .then((res) => {
            if (res.canceled) {
                openReportConfigMenu(admin);
                return;
            }

            const value = (res.formValues && res.formValues[0]) || "";
            const n = Number(value);
            if (!Number.isFinite(n) || n <= 0) {
                safeSendMessage(
                    admin,
                    "§cValue must be a positive number."
                );
                openReportConfigMenu(admin);
                return;
            }

            setStoredInteger("maxExtraLength", n);
            safeSendMessage(
                admin,
                `§aMax extra length updated to §e${n}§a.`
            );
            system.runTimeout(
                () => openReportConfigMenu(admin),
                5
            );
        })
        .catch((e) => {
            log(`openChangeMaxExtraLengthUI error: ${e}`, "error");
            openReportConfigMenu(admin);
        });
}

// --------------------------------------------------
// Config Summary & Admin Command
// --------------------------------------------------

function getConfigSummaryLines() {
    const flag = (v) => (v ? "§aON§r" : "§cOFF§r");
    return [
        "§6[ReportConfig]§r Current Settings:",
        ` §elog_discord§r: ${flag(reportConfig.logDiscord)}`,
        ` §enotify_staff§r: ${flag(reportConfig.notifyStaffInGame)}`,
        ` §enotify_target§r: ${flag(reportConfig.notifyTargetPlayer)}`,
        ` §estaff_tag§r: §e${reportConfig.staffTag}§r`,
        ` §emax_extra_length§r: §e${reportConfig.maxExtraLength}§r`
    ];
}

// --------------------------------------------------
// Commands
// --------------------------------------------------

/**
 * /report [player]
 * Player command to open report UI (optional target preselect).
 */
bridge.bedrockCommands.registerCommand(
    "report",
    (player, ...params) => {
        let preselected = undefined;
        const maybeArg = params[0];
        if (maybeArg) {
            try {
                preselected = maybeArg.readPlayer();
            } catch {
                // ignore; fallback to UI list
            }
        }

        openReportFlow(player, preselected);
    },
    "Open the report UI to report another player."
);

/**
 * /reports
 * Admin command to open Report Manager UI.
 */
bridge.bedrockCommands.registerAdminCommand(
    "reports",
    (admin) => {
        openReportManagerUI(admin);
    },
    "Open the Report Manager UI to view and manage player reports."
);

/**
 * /reportmenu
 * Admin command to open Config/Stats main menu directly.
 */
bridge.bedrockCommands.registerAdminCommand(
    "reportmenu",
    (admin) => {
        openReportConfigMenu(admin);
    },
    "Open the report configuration menu."
);

/**
 * /reportconfig
 * /reportconfig show
 * /reportconfig set <key> <value>
 */
bridge.bedrockCommands.registerAdminCommand(
    "reportconfig",
    (admin, ...params) => {
        const sub = params[0]?.toString().toLowerCase() ?? "show";

        if (sub === "show") {
            for (const line of getConfigSummaryLines()) {
                safeSendMessage(admin, line);
            }
            safeSendMessage(
                admin,
                "§7Use §e/reportconfig set <key> <value>§7 to change options."
            );
            safeSendMessage(
                admin,
                "§7Keys: log_discord (on/off), notify_staff (on/off), notify_target (on/off), staff_tag (string), max_extra_length (number)"
            );
            return;
        }

        if (sub === "set") {
            const keyArg = params[1];
            const valArg = params[2];

            if (!keyArg || !valArg) {
                safeSendMessage(
                    admin,
                    "§cUsage: §e/reportconfig set <key> <value>"
                );
                safeSendMessage(
                    admin,
                    "§7Keys: log_discord, notify_staff, notify_target, staff_tag, max_extra_length"
                );
                return;
            }

            const key = keyArg.toString().toLowerCase();
            const raw = valArg.toString();

            switch (key) {
                case "log_discord": {
                    const v =
                        raw.toLowerCase() === "on" ||
                        raw.toLowerCase() === "true" ||
                        raw === "1";
                    setStoredBoolean("logDiscord", v);
                    break;
                }
                case "notify_staff": {
                    const v =
                        raw.toLowerCase() === "on" ||
                        raw.toLowerCase() === "true" ||
                        raw === "1";
                    setStoredBoolean("notifyStaffInGame", v);
                    break;
                }
                case "notify_target": {
                    const v =
                        raw.toLowerCase() === "on" ||
                        raw.toLowerCase() === "true" ||
                        raw === "1";
                    setStoredBoolean("notifyTargetPlayer", v);
                    break;
                }
                case "staff_tag": {
                    setStoredString("staffTag", raw);
                    break;
                }
                case "max_extra_length": {
                    const n = Number(raw);
                    if (!Number.isFinite(n) || n <= 0) {
                        safeSendMessage(
                            admin,
                            "§cmax_extra_length must be a positive number."
                        );
                        return;
                    }
                    setStoredInteger("maxExtraLength", n);
                    break;
                }
                default:
                    safeSendMessage(
                        admin,
                        `§cUnknown key §e${key}§c. Valid keys: log_discord, notify_staff, notify_target, staff_tag, max_extra_length`
                    );
                    return;
            }

            safeSendMessage(
                admin,
                `§a[ReportConfig] §rOption §e${key}§r has been updated.`
            );
            for (const line of getConfigSummaryLines()) {
                safeSendMessage(admin, line);
            }
            return;
        }

        safeSendMessage(admin, "§cUnknown subcommand. Use:");
        safeSendMessage(admin, " §e/reportconfig§7 or §e/reportconfig show");
        safeSendMessage(
            admin,
            " §e/reportconfig set <key> <value> §7– see valid keys in the help."
        );
    },
    "Configure the report system behaviour."
);
