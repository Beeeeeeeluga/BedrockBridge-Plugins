/**
 * ============================================
 * WORLD EXPLORER v4.1.0
 * ============================================
 *
 * Automatisches Tracking von:
 * - Dimensionen Besuch
 * - H\u00f6hen-Rekorde
 * - Distanz gereist
 * - Biome Exploration
 * - Neue Orte Discovery
 *
 * @module exploration/world-explorer
 */

export class WorldExplorer {
  constructor(sendWebhook, config) {
    this.sendWebhook = sendWebhook;
    this.config = config;
    this.playerLocations = new Map();
    this.dimensionVisits = new Map();
    this.heightRecords = new Map();
    this.biomeDiscoveries = new Map();
    this.explorationMilestones = new Map();
    this.maxLocationHistory = 500;

    this.dimensions = {
      overworld: { name: "Overworld", emoji: "🌍", color: 0x2ECC71 },
      nether: { name: "Nether", emoji: "🔥", color: 0xFF6B6B },
      end: { name: "End", emoji: "🌑", color: 0x9B59B6 }
    };

    this.commonBiomes = {
      plains: { name: "Plains", emoji: "🌾" },
      forest: { name: "Forest", emoji: "🌲" },
      desert: { name: "Desert", emoji: "🏜️" },
      mountain: { name: "Mountain", emoji: "⛰️" },
      ocean: { name: "Ocean", emoji: "🌊" },
      jungle: { name: "Jungle", emoji: "🌴" },
      swamp: { name: "Swamp", emoji: "🦗" },
      savanna: { name: "Savanna", emoji: "🦁" },
      ice: { name: "Ice Plains", emoji: "❄️" },
      mushroom: { name: "Mushroom Island", emoji: "🍄" }
    };

    this.explorationMetrics = {
      distanceTraveled: 10000,
      dimensionVisit: 5000,
      highestPoint: 3000,
      newBiome: 2000
    };
  }

  /**
   * Record player location
   */
  recordLocation(playerId, playerName, x, y, z, dimension = "overworld") {
    if (!this.playerLocations.has(playerId)) {
      this.playerLocations.set(playerId, {
        playerName,
        locations: [],
        currentDimension: dimension,
        lastLocation: { x, y, z },
        totalDistance: 0
      });
    }

    const playerData = this.playerLocations.get(playerId);
    const lastLoc = playerData.lastLocation;

    // Calculate distance traveled
    const distance = this.calculateDistance(lastLoc.x, lastLoc.y, lastLoc.z, x, y, z);
    playerData.totalDistance += distance;

    // Record location
    const location = {
      x: Math.floor(x),
      y: Math.floor(y),
      z: Math.floor(z),
      dimension,
      timestamp: Date.now(),
      distance
    };

    playerData.locations.push(location);
    if (playerData.locations.length > this.maxLocationHistory) {
      playerData.locations.shift();
    }

    playerData.lastLocation = { x, y, z };
    playerData.currentDimension = dimension;

    // Check height records
    this.updateHeightRecord(playerId, playerName, y, dimension);

    // Check dimension visits
    this.recordDimensionVisit(playerId, playerName, dimension);

    return location;
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(x1, y1, z1, x2, y2, z2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Update height records
   */
  updateHeightRecord(playerId, playerName, y, dimension) {
    if (!this.heightRecords.has(playerId)) {
      this.heightRecords.set(playerId, {
        playerName,
        records: {}
      });
    }

    const records = this.heightRecords.get(playerId).records;

    if (!records[dimension]) {
      records[dimension] = {
        highestY: y,
        lowestY: y,
        timestamp: Date.now()
      };
    } else {
      if (y > records[dimension].highestY) {
        records[dimension].highestY = y;
        records[dimension].highestYTimestamp = Date.now();
      }
      if (y < records[dimension].lowestY) {
        records[dimension].lowestY = y;
        records[dimension].lowestYTimestamp = Date.now();
      }
    }
  }

  /**
   * Record dimension visit
   */
  recordDimensionVisit(playerId, playerName, dimension) {
    if (!this.dimensionVisits.has(playerId)) {
      this.dimensionVisits.set(playerId, {
        playerName,
        visits: {}
      });
    }

    const visits = this.dimensionVisits.get(playerId).visits;

    if (!visits[dimension]) {
      visits[dimension] = {
        firstVisit: Date.now(),
        visitCount: 1,
        lastVisit: Date.now()
      };
    } else {
      visits[dimension].visitCount++;
      visits[dimension].lastVisit = Date.now();
    }
  }

  /**
   * Record biome discovery
   */
  recordBiomeDiscovery(playerId, playerName, biomeType, location) {
    if (!this.biomeDiscoveries.has(playerId)) {
      this.biomeDiscoveries.set(playerId, {
        playerName,
        biomes: new Map()
      });
    }

    const biomes = this.biomeDiscoveries.get(playerId).biomes;

    if (!biomes.has(biomeType)) {
      biomes.set(biomeType, {
        name: this.commonBiomes[biomeType]?.name || biomeType,
        firstDiscovery: Date.now(),
        location,
        emoji: this.commonBiomes[biomeType]?.emoji || "🗺️"
      });

      // Check for milestone
      this.checkExplorationMilestone(playerId, playerName, "biome", biomeType);
    }
  }

  /**
   * Check exploration milestones
   */
  checkExplorationMilestone(playerId, playerName, type, value) {
    if (!this.explorationMilestones.has(playerId)) {
      this.explorationMilestones.set(playerId, {
        playerName,
        milestones: []
      });
    }

    const milestones = this.explorationMilestones.get(playerId).milestones;

    const milestone = {
      type,
      value,
      timestamp: Date.now(),
      points: this.explorationMetrics[`${type}Discovery`] || 1000
    };

    milestones.push(milestone);
  }

  /**
   * Get exploration statistics
   */
  getExplorationStats(playerId) {
    const locations = this.playerLocations.get(playerId);
    const heights = this.heightRecords.get(playerId);
    const dimensions = this.dimensionVisits.get(playerId);
    const biomes = this.biomeDiscoveries.get(playerId);

    if (!locations) return null;

    const dimensionCount = dimensions ? Object.keys(dimensions.visits).length : 0;
    const biomeCount = biomes ? biomes.biomes.size : 0;

    return {
      playerName: locations.playerName,
      playerId,
      totalDistance: Math.floor(locations.totalDistance),
      locationsVisited: locations.locations.length,
      dimensionsVisited: dimensionCount,
      biomesDiscovered: biomeCount,
      currentDimension: locations.currentDimension,
      highestPoints: heights ? heights.records : {},
      dimensions: dimensions ? dimensions.visits : {},
      biomes: biomes ? Array.from(biomes.biomes.values()) : []
    };
  }

  /**
   * Get exploration embed
   */
  getExplorationEmbed(playerId) {
    const stats = this.getExplorationStats(playerId);
    if (!stats) return null;

    const distanceStr = `${stats.totalDistance.toLocaleString()} blocks`;

    return {
      title: `🗺️ ${stats.playerName} Exploration Stats`,
      description: "Adventure and discovery tracker",
      color: 0x2ECC71,
      fields: [
        { name: "Total Distance", value: distanceStr, inline: true },
        { name: "Locations Visited", value: stats.locationsVisited.toString(), inline: true },
        { name: "Current Dimension", value: stats.currentDimension, inline: true },
        { name: "Dimensions Explored", value: stats.dimensionsVisited.toString(), inline: true },
        { name: "Biomes Discovered", value: stats.biomesDiscovered.toString(), inline: true },
        {
          name: "Heights",
          value: Object.entries(stats.highestPoints)
            .map((entry) => {
              const dim = entry[0];
              const record = entry[1];
              return `${dim}: Y${record.highestY}`;
            })
            .join("\n"),
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get dimension visit embed
   */
  getDimensionVisitEmbed(playerId) {
    const stats = this.getExplorationStats(playerId);
    if (!stats) return null;

    const fields = Object.entries(stats.dimensions || {}).map((entry) => {
      const dimName = entry[0];
      const visit = entry[1];
      const dimInfo = this.dimensions[dimName];

      return {
        name: `${dimInfo?.emoji || "🌍"} ${dimInfo?.name || dimName}`,
        value: `Visited ${visit.visitCount} times\nFirst: ${new Date(visit.firstVisit).toLocaleDateString()}`,
        inline: true
      };
    });

    return {
      title: `🌐 ${stats.playerName} Dimension Visits`,
      description: "Exploration across dimensions",
      color: 0x3498DB,
      fields: fields.length > 0 ? fields : [{ name: "No dimensions visited", value: "Start exploring!" }],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get biome discoveries embed
   */
  getBiomeDiscoveriesEmbed(playerId) {
    const stats = this.getExplorationStats(playerId);
    if (!stats) return null;

    const fields = stats.biomes.slice(0, 10).map((biome) => {
      return {
        name: `${biome.emoji} ${biome.name}`,
        value: `First visited: ${new Date(biome.firstDiscovery).toLocaleDateString()}`,
        inline: true
      };
    });

    return {
      title: `🌍 ${stats.playerName} Biome Discoveries`,
      description: `${stats.biomesDiscovered} biomes discovered`,
      color: 0x27AE60,
      fields: fields.length > 0 ? fields : [{ name: "No biomes discovered", value: "Explore the world!" }],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get top explorers leaderboard
   */
  getTopExplorers(metric = "totalDistance", limit = 10) {
    const explorers = Array.from(this.playerLocations.values()).map((data) => ({
      playerName: data.playerName,
      distance: Math.floor(data.totalDistance),
      locationsVisited: data.locations.length,
      dimensions: new Set(data.locations.map((l) => l.dimension)).size
    }));

    if (metric === "totalDistance") {
      return explorers.sort((a, b) => b.distance - a.distance).slice(0, limit);
    } else if (metric === "locationsVisited") {
      return explorers.sort((a, b) => b.locationsVisited - a.locationsVisited).slice(0, limit);
    } else if (metric === "dimensions") {
      return explorers.sort((a, b) => b.dimensions - a.dimensions).slice(0, limit);
    }

    return explorers.slice(0, limit);
  }

  /**
   * Get explorer leaderboard embed
   */
  getExplorerLeaderboardEmbed(metric = "totalDistance") {
    const topExplorers = this.getTopExplorers(metric);

    let metricLabel = "";
    if (metric === "totalDistance") metricLabel = "Distance Traveled";
    else if (metric === "locationsVisited") metricLabel = "Locations Visited";
    else if (metric === "dimensions") metricLabel = "Dimensions Explored";

    const fields = topExplorers.map((explorer, index) => {
      const value =
        metric === "totalDistance"
          ? `${explorer.distance.toLocaleString()} blocks`
          : metric === "locationsVisited"
            ? `${explorer.locationsVisited} locations`
            : `${explorer.dimensions} dimensions`;

      return {
        name: `${index + 1}. ${explorer.playerName}`,
        value: value,
        inline: false
      };
    });

    return {
      title: `🗺️ Explorer Leaderboard - ${metricLabel}`,
      description: "Top explorers of the server",
      color: 0x2ECC71,
      fields: fields.length > 0 ? fields : [{ name: "No data yet", value: "Start exploring!" }],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export exploration data
   */
  exportExplorationData() {
    const playerLocationsObj = {};
    for (const [id, data] of this.playerLocations.entries()) {
      playerLocationsObj[id] = data;
    }

    const biomeDiscoveriesObj = {};
    for (const [id, data] of this.biomeDiscoveries.entries()) {
      biomeDiscoveriesObj[id] = {
        playerName: data.playerName,
        biomes: Array.from(data.biomes.values())
      };
    }

    return {
      playerLocations: playerLocationsObj,
      heightRecords: Object.fromEntries(this.heightRecords),
      dimensionVisits: Object.fromEntries(this.dimensionVisits),
      biomeDiscoveries: biomeDiscoveriesObj,
      explorationMilestones: Object.fromEntries(this.explorationMilestones),
      timestamp: new Date().toISOString()
    };
  }
}

export default WorldExplorer;
