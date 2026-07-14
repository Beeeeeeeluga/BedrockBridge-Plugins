# Discord Webhook Plugin - Best Practices & Architecture

Dokumentation der Best Practices, die im Enhanced Plugin v4.0.0 implementiert sind.

## 🏗️ Architektur-Prinzipien

### 1. Separation of Concerns
Das Plugin ist in mehrere spezialisierte Module aufgeteilt:

```
discord-webhook-enhanced.js  ← Hauptplugin & Event-Handler
    ├─ WebhookManager        ← HTTP-Kommunikation
    ├─ EventSystem          ← Plugin-System
    ├─ PlayerTracker        ← Player-Tracking
    └─ Helper Functions     ← Utilities

config-enhanced.js           ← Konfiguration & Helpers
    ├─ WHConfig            ← Zentrale Konfiguration
    └─ WHHelpers           ← Hilfsfunktionen

utils-enhanced.js            ← Erweiterte Utilities
    ├─ Logger              ← Structured Logging
    ├─ Cache               ← TTL-Caching
    ├─ RateLimiter         ← Rate-Limiting
    ├─ Metrics             ← Performance-Metriken
    ├─ Validators          ← Input-Validierung
    ├─ EventEmitter        ← Event-Management
    ├─ TaskScheduler       ← Task-Planung
    └─ HealthChecker       ← Health-Checks
```

### 2. Error Handling

**Drei Ebenen von Error Handling:**

```javascript
// Level 1: Graceful Degradation
try {
  // Webhook senden
} catch (error) {
  // Level 2: Logging
  logError("Webhook failed", error)

  // Level 3: Retry + Circuit Breaker
  webhookManager.addToRetryQueue(url, data)
}
```

### 3. Circuit Breaker Pattern

```
CLOSED ─ 5 failures ──→ OPEN
  ↑                       │
  │                  30 seconds
  │                       ↓
  └─ 2 successes ─── HALF_OPEN
```

Vorteile:
- Verhindert Überlastung defekter Services
- Automatische Wiederherstellung
- Ressourcen-Schonung

### 4. Rate Limiting

```javascript
// Pro Webhook
if (!webhookManager.checkRateLimit(url)) {
  webhookManager.addToRetryQueue(url, data)
  return
}

// Globales Rate Limiting
if (!rateLimiter.isAllowed(key)) {
  // Request abweisen
}
```

## 📋 Best Practice Patterns

### 1. Configuration Management

**✅ RICHTIG:**
```javascript
// config-enhanced.js - Zentrale Quelle
export const WHConfig = { /* ... */ }

// discord-webhook-enhanced.js
import { WHConfig, WHHelpers } from "./config.js"
```

**❌ FALSCH:**
```javascript
// Hard-coded Werte verteilt im Code
const WEBHOOK_URL = "https://..."
const BATCH_SIZE = 10
const CACHE_TTL = 300000
```

### 2. Async/Await Pattern

**✅ RICHTIG:**
```javascript
async function sendWebhook(type, data) {
  try {
    const url = WHHelpers.getWebhook(type)
    if (circuitBreaker.isOpen(url)) {
      webhookManager.addToRetryQueue(url, data)
      return
    }

    await sendWebhookRequest(url, data)
  } catch (error) {
    logError("Webhook error", error)
  }
}
```

**❌ FALSCH:**
```javascript
// Blocking requests
function sendWebhook(type, data) {
  http.request(request)  // Blocking!
}
```

### 3. Dependency Injection

**✅ RICHTIG:**
```javascript
// Module mit Dependencies
class WebhookManager {
  validateUrl(url) { /* ... */ }
  checkRateLimit(url) { /* ... */ }
}

// Zentrale Instanz
const webhookManager = new WebhookManager()
```

**❌ FALSCH:**
```javascript
// Globale Dependencies
let webhookValidator = null
let rateLimiter = null

function initialize() {
  webhookValidator = new Validator()
  rateLimiter = new RateLimiter()
}
```

### 4. Event-Driven Architecture

**✅ RICHTIG:**
```javascript
// Loose Coupling
eventSystem.on("webhook:sent", (data) => {
  // Handler unabhängig vom Sender
})

// Oder mit Event Emitter
eventEmitter.on("custom:event", (data) => {
  // Custom Logic
})
```

**❌ FALSCH:**
```javascript
// Tight Coupling
function sendWebhook(data) {
  // ... send logic
  analyticsModule.track(data)
  loggingModule.log(data)
  statsModule.update(data)
}
```

### 5. Caching mit TTL

**✅ RICHTIG:**
```javascript
const cache = new Cache(300000)  // 5 Min TTL

cache.set("player_avatar", avatarUrl)
const avatar = cache.get("player_avatar")

// Automatisches Cleanup
system.runInterval(() => {
  cache.cleanup()
}, 600000)
```

**❌ FALSCH:**
```javascript
// Memory Leak - Unbegrenztes Caching
const cache = new Map()

function getAvatar(name) {
  if (!cache.has(name)) {
    cache.set(name, fetchAvatar(name))
  }
  return cache.get(name)
}
// Cache wächst unbegrenzt!
```

## 🔄 Request-Verarbeitung Pipeline

```
┌─────────────────────────────────────────────────┐
│ sendWebhook(type, data, immediate=false)       │
└─────────────────────────────────────────────────┘
                      ↓
              ┌───────────────┐
              │ URL validieren│
              └───────────────┘
                      ↓
          ┌──────────────────────┐
          │ Circuit Breaker open?│
          └──────────────────────┘
                      ↓
        ┌────────────────────────┐
        │ Rate Limit exceeded?   │
        └────────────────────────┘
                      ↓
    ┌─────────────────────────────┐
    │ Immediate oder Queue?       │
    └─────────────────────────────┘
           ↙          ↖
    [IMMEDIATE]    [QUEUE]
         ↓              ↓
    sendNow()    Batch-Processor
         ↓              ↓
    HTTP Request   processQueue()
         ↓              ↓
    Retry Logic    HTTP Requests
```

## 📊 Performance Optimizations

### 1. Message Batching

```javascript
// Konfigurieren
advanced.performance.messageBatchSize = 10       // 10 Nachrichten pro Batch
advanced.performance.messageQueueDelay = 1000    // Alle 1 Sekunde

// Vor:  30 einzelne HTTP Requests = 30 × Latenz
// Nach: 3 Batches = 3 × Latenz + Verarbeitung
```

### 2. Request Pooling

```javascript
// Queue management
const queue = []

function addToQueue(message) {
  queue.push(message)
  if (queue.length >= BATCH_SIZE) {
    processBatch()  // Sofort bei voller Queue
  }
}

// Timer fallback
setInterval(processBatch, 1000)  // Oder nach 1s
```

### 3. Smart Caching

```javascript
// Cache für häufig abgerufene Daten
cache.set("player_avatar:steve", "https://...")
cache.set("server_config", { /* ... */ })

// TTL-basiertes Auto-Cleanup
cache.cleanup()  // Nur wenn nötig
```

## 🛡️ Fehlerbehandlung Strategie

### Level 1: Prevention
```javascript
// URL validieren BEVOR Request
if (!webhookManager.validateUrl(url)) {
  logError("Invalid URL", url)
  return  // Nicht senden
}

// Payload validieren
if (!Validator.isValidEmbed(embed)) {
  logError("Invalid embed", embed)
  return
}
```

### Level 2: Detection
```javascript
try {
  await sendWebhookRequest(url, data)
} catch (error) {
  // Error detektiert
  webhookManager.recordFailure(url)
}
```

### Level 3: Recovery
```javascript
// Automatische Wiederherstellung
if (webhookManager.getCircuitBreakerState(url) === 'HALF_OPEN') {
  // Teste einen Request
  if (successful) {
    // Zurück zu CLOSED
  } else {
    // Zurück zu OPEN
  }
}
```

## 📈 Monitoring & Observability

### 1. Metrics Collection

```javascript
// Tracking
metrics.increment("webhooks.sent")
metrics.increment("webhooks.failed")
metrics.setGauge("queue.size", webhookManager.messageQueue.length)
metrics.recordHistogram("response.time", duration)

// Report
const report = metrics.getReport()
```

### 2. Health Checks

```javascript
// Automatisch alle 5 Min
healthChecker.register("webhooks", async () => {
  return webhookManager.getHealthReport()
})

// Manuell prüfen
const health = healthChecker.getOverallHealth()
// { healthy: 5, total: 6, percentage: 83.3 }
```

### 3. Structured Logging

```javascript
// Nicht: console.log("Error: " + error)
// Sondern:
logger.error("Webhook send failed", {
  url: webhookUrl,
  status: response.status,
  body: response.body,
  retry: attempts
})
```

## 🔐 Security Best Practices

### 1. Input Validation

```javascript
// Alle Eingaben validieren
if (!Validator.isValidPlayerName(playerName)) {
  return
}

if (!Validator.isValidEmbed(embed)) {
  return
}

if (!Validator.isValidLocation(location)) {
  return
}
```

### 2. Webhook URL Sicherheit

```javascript
// ✅ Environment Variable verwenden
webhooks: {
  general: process.env.DISCORD_WEBHOOK_GENERAL
}

// ✅ In .gitignore
config-enhanced.js
webhooks.json

// ❌ Nicht hardcoded!
webhooks: {
  general: "https://discord.com/api/webhooks/..."  // EXPOSED!
}
```

### 3. Rate Limiting für Protection

```javascript
// Verhindert Abuse
if (!rateLimiter.isAllowed(userKey)) {
  // Zu viele Requests von diesem User
  logWarn("Rate limit exceeded", { user: userKey })
  return
}
```

## 🧪 Testing Strategies

### 1. Unit Tests für Utilities

```javascript
// Test Logger
const logger = new Logger()
logger.info("test message")
assert(logger.getLogs().length === 1)

// Test Cache
const cache = new Cache(1000)
cache.set("key", "value")
assert(cache.get("key") === "value")
```

### 2. Integration Tests

```javascript
// Test WebhookManager mit mocked HTTP
webhookManager.validateUrl("https://discord.com/...")
webhookManager.checkRateLimit(url)
webhookManager.recordSuccess(url)
```

### 3. Manual Testing

```javascript
// !webhook test          - Alle Webhooks testen
// !webhook health        - Status prüfen
// !webhook status        - System-Info
// WebhookPlugin.status() - Programmatisch
```

## 📚 Code Quality Standards

### 1. Dokumentation

```javascript
/**
 * Sende einen Webhook
 * @param {string} type - Webhook-Typ (chat, deaths, etc.)
 * @param {object} data - Webhook-Payload
 * @param {boolean} immediate - Sofort senden?
 */
async function sendWebhook(type, data, immediate = false) {
  // Implementation
}
```

### 2. Error Messages

```javascript
// ✅ Aussagekräftig
logError("Failed to send webhook to Discord", {
  url: webhookUrl,
  status: response.status,
  attempts: retryCount
})

// ❌ Zu vage
logError("Error")
```

### 3. Naming Conventions

```javascript
// Classes - PascalCase
class WebhookManager { }
class PlayerTracker { }

// Functions - camelCase
function sendWebhook() { }
function formatDuration() { }

// Constants - UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const BATCH_SIZE = 10
```

## 🚀 Performance Tips

### 1. Queue Size Optimierung
```javascript
// Zu klein: Zu viele Batches
messageQueueSize: 10

// Optimal: Balanciert
messageQueueSize: 100

// Zu groß: Speicherleck
messageQueueSize: 10000
```

### 2. Batch Timing
```javascript
// messageQueueDelay in ms
// Schnell: 500ms  → Höhere API-Last, niedrigere Latenz
// Normal: 1000ms  → Ausgewogen
// Langsam: 5000ms → Weniger API-Calls, höhere Latenz
```

### 3. Cache TTL
```javascript
// Kurz: 60000   → Frische Daten, höhere CPU
// Normal: 300000 → Ausgewogen (5 Min)
// Lang: 900000   → Weniger CPU, veraltete Daten (15 Min)
```

## 🎯 Zusammenfassung

Das Enhanced Plugin implementiert:

✅ **Architecture**
- Modulare Struktur
- Separation of Concerns
- Event-Driven Design

✅ **Reliability**
- Circuit Breaker Pattern
- Automatische Retries
- Graceful Degradation

✅ **Performance**
- Message Batching
- Smart Caching
- Connection Pooling

✅ **Observability**
- Structured Logging
- Metrics Collection
- Health Checks

✅ **Security**
- Input Validation
- Rate Limiting
- URL Encryption

✅ **Maintainability**
- Clear Documentation
- Consistent Naming
- Comprehensive Testing

---

**Folge diese Best Practices für stabilen und skalierbaren Code! 🚀**
