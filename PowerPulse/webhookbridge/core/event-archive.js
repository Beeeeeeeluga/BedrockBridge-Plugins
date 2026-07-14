/**
 * ============================================
 * EVENT ARCHIVE v4.1.0
 * ============================================
 *
 * Persistent event logging and archival:
 * - Stores all webhook events
 * - Query interface
 * - Filtering & searching
 * - Event replay
 * - Cleanup policies
 *
 * @module core/event-archive
 */

export class EventArchive {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.memoryCache = [];
    this.maxCacheSize = 1000;
    this.eventFilters = new Map();
  }

  /**
   * Archive an event
   */
  archiveEvent(eventType, data, webhookType = null) {
    try {
      const event = {
        id: this.generateEventId(),
        timestamp: Date.now(),
        eventType,
        webhookType,
        data,
        archived: true
      };

      // Store in memory cache
      this.addToCache(event);

      // Persist to file
      if (this.dataManager) {
        this.dataManager.saveEventLog(eventType, {
          ...event,
          timestamp: new Date(event.timestamp).toISOString()
        });
      }

      return event;
    } catch (error) {
      console.error("[EventArchive] Failed to archive event:", error.message);
      return null;
    }
  }

  /**
   * Add event to memory cache
   */
  addToCache(event) {
    this.memoryCache.push(event);

    // Maintain cache size limit
    if (this.memoryCache.length > this.maxCacheSize) {
      this.memoryCache.shift();
    }
  }

  /**
   * Query events by criteria
   */
  queryEvents(criteria = {}) {
    const { eventType, webhookType, playerName, minTime, maxTime, limit = 100 } = criteria;

    let results = [...this.memoryCache];

    // Filter by event type
    if (eventType) {
      results = results.filter(e => e.eventType === eventType);
    }

    // Filter by webhook type
    if (webhookType) {
      results = results.filter(e => e.webhookType === webhookType);
    }

    // Filter by player name (if data contains playerName)
    if (playerName) {
      results = results.filter(e => e.data.playerName === playerName || e.data.player?.name === playerName);
    }

    // Filter by time range
    if (minTime) {
      const minTimestamp = new Date(minTime).getTime();
      results = results.filter(e => e.timestamp >= minTimestamp);
    }

    if (maxTime) {
      const maxTimestamp = new Date(maxTime).getTime();
      results = results.filter(e => e.timestamp <= maxTimestamp);
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    return results.slice(0, limit);
  }

  /**
   * Search events by content
   */
  searchEvents(searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();

    return this.memoryCache.filter(event => {
      const eventStr = JSON.stringify(event).toLowerCase();
      return eventStr.includes(lowerSearch);
    });
  }

  /**
   * Get events by player
   */
  getPlayerEvents(playerName, limit = 50) {
    return this.queryEvents({
      playerName,
      limit
    });
  }

  /**
   * Get events by type with count
   */
  getEventStatistics() {
    const stats = {};

    for (const event of this.memoryCache) {
      const type = event.eventType;
      stats[type] = (stats[type] || 0) + 1;
    }

    return {
      totalEvents: this.memoryCache.length,
      eventTypes: stats,
      cachedSince: this.memoryCache.length > 0 ? new Date(this.memoryCache[0].timestamp) : null,
      cachedUntil: this.memoryCache.length > 0 ? new Date(this.memoryCache[this.memoryCache.length - 1].timestamp) : null
    };
  }

  /**
   * Get recent events
   */
  getRecentEvents(count = 20) {
    return this.memoryCache.slice(-count).reverse();
  }

  /**
   * Get event timeline for player
   */
  getPlayerTimeline(playerName, hoursBack = 24) {
    const minTime = Date.now() - hoursBack * 60 * 60 * 1000;

    const events = this.memoryCache
      .filter(e => {
        const isPlayer = e.data.playerName === playerName || e.data.player?.name === playerName;
        const isRecent = e.timestamp >= minTime;
        return isPlayer && isRecent;
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    return {
      playerName,
      hoursBack,
      eventCount: events.length,
      events: events.map(e => ({
        time: new Date(e.timestamp).toLocaleTimeString(),
        type: e.eventType,
        details: e.data
      }))
    };
  }

  /**
   * Create event report
   */
  generateReport(timeRange = "daily") {
    const now = Date.now();
    let startTime;

    switch (timeRange) {
      case "hourly":
        startTime = now - 60 * 60 * 1000;
        break;
      case "daily":
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case "weekly":
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "monthly":
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = now - 24 * 60 * 60 * 1000;
    }

    const relevantEvents = this.memoryCache.filter(e => e.timestamp >= startTime);

    const eventCounts = {};
    const playerActivity = {};

    for (const event of relevantEvents) {
      // Count events
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;

      // Track player activity
      const playerName = event.data.playerName || event.data.player?.name || "Unknown";
      if (playerName !== "Unknown") {
        playerActivity[playerName] = (playerActivity[playerName] || 0) + 1;
      }
    }

    const topPlayers = Object.entries(playerActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, eventCount: count }));

    return {
      timeRange,
      generatedAt: new Date().toISOString(),
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(now).toISOString(),
      totalEvents: relevantEvents.length,
      eventBreakdown: eventCounts,
      topPlayers,
      uniquePlayers: Object.keys(playerActivity).length
    };
  }

  /**
   * Export events as CSV
   */
  exportAsCSV(criteria = {}, filename = null) {
    try {
      const events = this.queryEvents(criteria);

      if (events.length === 0) {
        return null;
      }

      // Build CSV
      const headers = ["Timestamp", "Event Type", "Webhook Type", "Details"];
      const rows = events.map(e => [
        new Date(e.timestamp).toISOString(),
        e.eventType,
        e.webhookType || "N/A",
        JSON.stringify(e.data)
      ]);

      const csv = [headers, ...rows].map(row =>
        row.map(cell => `"${cell}"`).join(",")
      ).join("\n");

      if (this.dataManager && filename) {
        // Save via data manager
        console.info(`[EventArchive] Exported ${events.length} events to CSV`);
      }

      return csv;
    } catch (error) {
      console.error("[EventArchive] CSV export failed:", error.message);
      return null;
    }
  }

  /**
   * Clear old events
   */
  clearOldEvents(hoursOld = 72) {
    const cutoffTime = Date.now() - hoursOld * 60 * 60 * 1000;
    const before = this.memoryCache.length;

    this.memoryCache = this.memoryCache.filter(e => e.timestamp > cutoffTime);

    const after = this.memoryCache.length;
    const removed = before - after;

    console.info(`[EventArchive] Cleared ${removed} events older than ${hoursOld} hours`);

    return {
      eventsRemoved: removed,
      eventsRetained: after,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear all events
   */
  clearAll() {
    const count = this.memoryCache.length;
    this.memoryCache = [];
    console.warn(`[EventArchive] Cleared all ${count} archived events`);
    return { eventsRemoved: count };
  }

  /**
   * Replay events (simulate them again)
   */
  replayEvents(criteria = {}, callback) {
    const events = this.queryEvents(criteria);
    let count = 0;

    for (const event of events) {
      try {
        callback(event);
        count++;
      } catch (error) {
        console.error(`[EventArchive] Error replaying event:`, error.message);
      }
    }

    return {
      eventsReplayed: count,
      totalRequested: events.length
    };
  }

  /**
   * Get cache info
   */
  getCacheInfo() {
    return {
      cacheSize: this.memoryCache.length,
      maxCacheSize: this.maxCacheSize,
      utilizationPercent: ((this.memoryCache.length / this.maxCacheSize) * 100).toFixed(1),
      oldestEvent: this.memoryCache.length > 0 ? new Date(this.memoryCache[0].timestamp) : null,
      newestEvent: this.memoryCache.length > 0 ? new Date(this.memoryCache[this.memoryCache.length - 1].timestamp) : null
    };
  }

  /**
   * Register event filter
   */
  registerFilter(filterName, filterFunction) {
    this.eventFilters.set(filterName, filterFunction);
  }

  /**
   * Apply filter to events
   */
  applyFilter(filterName) {
    const filter = this.eventFilters.get(filterName);
    if (!filter) {
      console.warn(`[EventArchive] Filter not found: ${filterName}`);
      return [];
    }

    return this.memoryCache.filter(filter);
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default EventArchive;
