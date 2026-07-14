/**
 * ============================================
 * ENHANCED UTILITIES & HELPERS v4.0.0
 * ============================================
 *
 * Umfassende Utility-Funktionen für das Webhook Plugin
 * einschließlich Logging, Caching, Analytics und mehr.
 */

import { WHConfig, WHHelpers } from "./config-enhanced.js";

// ========================================
// LOGGER SYSTEM
// ========================================

export class Logger {
  constructor(prefix = "[Webhook]") {
    this.prefix = prefix;
    this.logs = [];
    this.maxLogs = WHConfig.advanced.logging.maxLogSize;
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      prefix: this.prefix
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const levelColor = {
      debug: "§8",
      info: "§f",
      warn: "§e",
      error: "§c"
    };

    const color = levelColor[level] || "§f";
    console.log(`${color}${this.prefix} [${level.toUpperCase()}] ${message}`);

    if (data && WHConfig.advanced.debug.enabled) {
      console.log(`${color}Data:`, data);
    }
  }

  debug(message, data) {
    if (WHConfig.advanced.debug.enabled) {
      this.log("debug", message, data);
    }
  }

  info(message, data) {
    this.log("info", message, data);
  }

  warn(message, data) {
    this.log("warn", message, data);
  }

  error(message, data) {
    this.log("error", message, data);
  }

  getLogs(level = null) {
    return level
      ? this.logs.filter(l => l.level === level)
      : this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger("[Webhook]");

// ========================================
// CACHE SYSTEM
// ========================================

export class Cache {
  constructor(ttl = WHConfig.advanced.performance.cacheTTL) {
    this.data = new Map();
    this.ttl = ttl;
    this.timestamps = new Map();
  }

  set(key, value) {
    this.data.set(key, value);
    this.timestamps.set(key, Date.now());
  }

  get(key) {
    if (!this.data.has(key)) return null;

    const timestamp = this.timestamps.get(key);
    if (Date.now() - timestamp > this.ttl) {
      this.delete(key);
      return null;
    }

    return this.data.get(key);
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.data.delete(key);
    this.timestamps.delete(key);
  }

  clear() {
    this.data.clear();
    this.timestamps.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps) {
      if (now - timestamp > this.ttl) {
        this.delete(key);
      }
    }
  }

  size() {
    return this.data.size;
  }

  entries() {
    return Array.from(this.data.entries());
  }
}

export const cache = new Cache();

// ========================================
// RATE LIMITER
// ========================================

export class RateLimiter {
  constructor(maxRequests = 60, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];

    // Remove old requests
    const recentRequests = userRequests.filter(
      time => now - time < this.timeWindow
    );

    if (recentRequests.length < this.maxRequests) {
      recentRequests.push(now);
      this.requests.set(key, recentRequests);
      return true;
    }

    return false;
  }

  getRemainingRequests(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(
      time => now - time < this.timeWindow
    );

    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  getResetTime(key) {
    const userRequests = this.requests.get(key);
    if (!userRequests || userRequests.length === 0) return 0;

    return userRequests[0] + this.timeWindow;
  }

  reset(key) {
    this.requests.delete(key);
  }

  clearAll() {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter(
  WHConfig.advanced.rateLimiting.maxRequestsPerMinute,
  60000
);

// ========================================
// METRICS & ANALYTICS
// ========================================

export class Metrics {
  constructor() {
    this.counters = new Map();
    this.timers = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
  }

  /**
   * Increment counter
   */
  increment(name, value = 1) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  /**
   * Set gauge value
   */
  setGauge(name, value) {
    this.gauges.set(name, value);
  }

  /**
   * Start timer
   */
  startTimer(name) {
    if (!this.timers.has(name)) {
      this.timers.set(name, []);
    }
    return {
      name,
      start: Date.now(),
      end: () => {
        const duration = Date.now() - this.start;
        const times = this.timers.get(name);
        times.push(duration);
        return duration;
      }
    };
  }

  /**
   * Record histogram value
   */
  recordHistogram(name, value) {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, []);
    }
    this.histograms.get(name).push(value);
  }

  /**
   * Get metrics report
   */
  getReport() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      timers: this.getTimerStats(),
      histograms: this.getHistogramStats()
    };
  }

  /**
   * Get timer statistics
   */
  getTimerStats() {
    const stats = {};
    for (const [name, values] of this.timers) {
      stats[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length || 0
      };
    }
    return stats;
  }

  /**
   * Get histogram statistics
   */
  getHistogramStats() {
    const stats = {};
    for (const [name, values] of this.histograms) {
      values.sort((a, b) => a - b);
      stats[name] = {
        count: values.length,
        min: values[0],
        max: values[values.length - 1],
        median: values[Math.floor(values.length / 2)],
        p95: values[Math.floor(values.length * 0.95)],
        p99: values[Math.floor(values.length * 0.99)]
      };
    }
    return stats;
  }

  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.timers.clear();
    this.histograms.clear();
  }
}

export const metrics = new Metrics();

// ========================================
// DATA FORMATTER
// ========================================

export class DataFormatter {
  /**
   * Format duration
   */
  static formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Format number with separators
   */
  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * Format bytes
   */
  static formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Format timestamp
   */
  static formatTimestamp(timestamp) {
    return new Date(timestamp).toISOString();
  }

  /**
   * Format percentage
   */
  static formatPercentage(value, total) {
    return ((value / total) * 100).toFixed(2) + "%";
  }

  /**
   * Truncate string
   */
  static truncate(str, length = 100) {
    return str.length > length ? str.substring(0, length - 3) + "..." : str;
  }

  /**
   * Escape markdown
   */
  static escapeMarkdown(str) {
    return str.replace(/[\\*_`[\]()~#+-=|{}<>!]/g, "\\$&");
  }
}

// ========================================
// VALIDATORS
// ========================================

export class Validator {
  /**
   * Validate Discord webhook URL
   */
  static isValidWebhookUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "https:" &&
             urlObj.hostname.includes("discord.com");
    } catch {
      return false;
    }
  }

  /**
   * Validate player name
   */
  static isValidPlayerName(name) {
    return /^[a-zA-Z0-9_]{2,16}$/.test(name);
  }

  /**
   * Validate message
   */
  static isValidMessage(message) {
    if (!message) return false;
    if (message.length < 1) return false;
    if (message.length > WHConfig.advanced.limits.maxMessageLength) return false;
    return true;
  }

  /**
   * Validate embed
   */
  static isValidEmbed(embed) {
    if (!embed || typeof embed !== "object") return false;
    if (embed.fields && embed.fields.length > WHConfig.advanced.limits.maxEmbedFields) {
      return false;
    }
    return true;
  }

  /**
   * Validate location
   */
  static isValidLocation(location) {
    return location &&
           typeof location.x === "number" &&
           typeof location.y === "number" &&
           typeof location.z === "number";
  }

  /**
   * Validate dimension
   */
  static isValidDimension(dimension) {
    const validDimensions = ["overworld", "nether", "the_end"];
    return validDimensions.some(d => dimension?.id?.includes(d));
  }
}

// ========================================
// EVENT EMITTER
// ========================================

export class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);

    return () => {
      const listeners = this.events.get(event);
      listeners.splice(listeners.indexOf(listener), 1);
    };
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  off(event, listener) {
    if (!this.events.has(event)) return;
    const listeners = this.events.get(event);
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return;
    for (const listener of this.events.get(event)) {
      try {
        listener(...args);
      } catch (error) {
        logger.error(`Error in event listener for ${event}`, error);
      }
    }
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
}

export const eventEmitter = new EventEmitter();

// ========================================
// TASK SCHEDULER
// ========================================

export class TaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.taskId = 0;
  }

  /**
   * Schedule task at interval
   */
  scheduleInterval(callback, interval, name = null) {
    const id = this.taskId++;
    const taskName = name || `task_${id}`;

    this.tasks.set(id, {
      name: taskName,
      callback,
      interval,
      lastRun: Date.now(),
      runs: 0
    });

    return id;
  }

  /**
   * Schedule task at specific time
   */
  scheduleAt(callback, time, name = null) {
    const id = this.taskId++;
    const taskName = name || `task_${id}`;

    const delay = time - Date.now();
    if (delay <= 0) {
      callback();
      return null;
    }

    setTimeout(() => {
      callback();
      this.tasks.delete(id);
    }, delay);

    this.tasks.set(id, {
      name: taskName,
      callback,
      scheduledTime: time,
      runs: 0
    });

    return id;
  }

  /**
   * Cancel task
   */
  cancel(id) {
    return this.tasks.delete(id);
  }

  /**
   * Get task info
   */
  getTask(id) {
    return this.tasks.get(id);
  }

  /**
   * List all tasks
   */
  listTasks() {
    return Array.from(this.tasks.values());
  }

  /**
   * Cancel all tasks
   */
  cancelAll() {
    this.tasks.clear();
  }
}

export const taskScheduler = new TaskScheduler();

// ========================================
// HEALTH CHECK SYSTEM
// ========================================

export class HealthChecker {
  constructor() {
    this.checks = new Map();
    this.results = new Map();
  }

  /**
   * Register health check
   */
  register(name, checkFn) {
    this.checks.set(name, checkFn);
  }

  /**
   * Run health check
   */
  async runCheck(name) {
    const checkFn = this.checks.get(name);
    if (!checkFn) return null;

    try {
      const result = await checkFn();
      this.results.set(name, {
        status: result ? "healthy" : "unhealthy",
        timestamp: Date.now(),
        details: result
      });
      return result;
    } catch (error) {
      this.results.set(name, {
        status: "error",
        timestamp: Date.now(),
        error: error.message
      });
      return null;
    }
  }

  /**
   * Run all checks
   */
  async runAll() {
    const results = {};
    for (const name of this.checks.keys()) {
      results[name] = await this.runCheck(name);
    }
    return results;
  }

  /**
   * Get results
   */
  getResults() {
    return Object.fromEntries(this.results);
  }

  /**
   * Get overall health
   */
  getOverallHealth() {
    const results = Object.values(Object.fromEntries(this.results));
    const healthy = results.filter(r => r.status === "healthy").length;
    return {
      healthy,
      total: results.length,
      percentage: (healthy / results.length * 100).toFixed(1)
    };
  }
}

export const healthChecker = new HealthChecker();

// ========================================
// EXPORTS
// ========================================

export default {
  logger,
  cache,
  rateLimiter,
  metrics,
  DataFormatter,
  Validator,
  eventEmitter,
  taskScheduler,
  healthChecker
};
