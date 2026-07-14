// webhook/core/database.js - Database Abstraction Layer
import { getConfig } from '../config.js';

let database;
let isBedrockBridge = false;

/**
 * Initialize database based on available API
 * @param {object} bridge - BedrockBridge API instance
 */
export async function initializeDatabase(bridge) {
  if (bridge?.database) {
    database = bridge.database;
    isBedrockBridge = true;
    console.info("[Webhook] Using BedrockBridge database");
  } else {
    // Create mock database for standalone mode
    database = createMockDatabase();
    console.info("[Webhook] Using in-memory database (standalone mode)");
  }
  
  // Initialize tables
  await initializeTables();
}

/**
 * Create mock database for standalone mode
 */
function createMockDatabase() {
  const tables = new Map();
  
  return {
    makeTable: (name) => {
      if (!tables.has(name)) {
        const data = new Map();
        tables.set(name, {
          get: (key) => data.get(key),
          set: (key, value) => {
            data.set(key, value);
            return true;
          },
          has: (key) => data.has(key),
          delete: (key) => data.delete(key),
          entries: () => data.entries(),
          keys: () => Array.from(data.keys()),
          values: () => Array.from(data.values()),
          clear: () => data.clear(),
          get size() { return data.size; }
        });
      }
      return tables.get(name);
    },
    
    getTable: (name) => tables.get(name),
    
    deleteTable: (name) => tables.delete(name),
    
    listTables: () => Array.from(tables.keys())
  };
}

// Database tables
export const db = {
  players: null,
  stats: null,
  logs: null,
  cache: null,
  settings: null
};

/**
 * Initialize all required tables
 */
async function initializeTables() {
  // Create tables
  db.players = database.makeTable("webhook_players");
  db.stats = database.makeTable("webhook_stats");
  db.logs = database.makeTable("webhook_logs");
  db.cache = database.makeTable("webhook_cache");
  db.settings = database.makeTable("webhook_settings");
  
  // Initialize default data
  await initializeDefaultData();
}

/**
 * Initialize default data
 */
async function initializeDefaultData() {
  // Global stats
  if (!db.stats.has("global")) {
    db.stats.set("global", {
      totalJoins: 0,
      totalDeaths: 0,
      totalMessages: 0,
      totalCommands: 0,
      bossKills: {},
      startTime: Date.now(),
      lastReset: Date.now()
    });
  }
  
  // Settings
  if (!db.settings.has("config")) {
    db.settings.set("config", {
      version: "2.1.0",
      lastUpdated: Date.now()
    });
  }
}

/**
 * Get or create player data
 * @param {string} playerName - Player name (used as identifier)
 * @param {string} unused - Unused parameter for compatibility
 * @returns {object} Player data
 */
export function getPlayerData(playerName, unused = null) {
  let data = db.players.get(playerName);
  
  if (!data) {
    data = {
      name: playerName,
      firstJoin: Date.now(),
      lastJoin: Date.now(),
      totalJoins: 0,
      totalPlaytime: 0,
      messages: 0,
      commands: 0,
      deaths: 0,
      kills: 0,
      blocksPlaced: 0,
      blocksBroken: 0,
      achievements: [],
      joinStreak: 0
    };
    db.players.set(playerName, data);
  }
  
  return data;
}

/**
 * Update player data
 * @param {string} playerName - Player name
 * @param {object} updates - Data to update
 */
export function updatePlayerData(playerName, updates) {
  const data = getPlayerData(playerName);
  Object.assign(data, updates);
  db.players.set(playerName, data);
}

/**
 * Increment player stat
 * @param {string} playerName - Player name
 * @param {string} stat - Stat name
 * @param {number} amount - Amount to increment
 */
export function incrementPlayerStat(playerName, stat, amount = 1) {
  const data = getPlayerData(playerName);
  data[stat] = (data[stat] || 0) + amount;
  db.players.set(playerName, data);
}