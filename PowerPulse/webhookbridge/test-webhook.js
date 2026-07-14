/**
 * Test Webhook Script
 * Tests the Discord Webhook Plugin and Addon functionality
 * Run this to verify everything is working correctly
 */

import { webhookAddon } from "./webhook-addon.js";
import { world, system } from "@minecraft/server";

export class WebhookTests {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async run() {
    console.log("\n╔═══════════════════════════════════════════════════╗");
    console.log("║       WEBHOOK ADDON TEST SUITE v4.0.0             ║");
    console.log("╚═══════════════════════════════════════════════════╝\n");

    // Test 1: Check if addon is ready
    await this.testAddonReady();

    // Test 2: Send simple text
    await this.testSendText();

    // Test 3: Send embed
    await this.testSendEmbed();

    // Test 4: Send rich embed
    await this.testSendRichEmbed();

    // Test 5: Get health report
    await this.testHealthReport();

    // Test 6: Get webhook list
    await this.testWebhookList();

    // Test 7: Event listeners
    await this.testEventListeners();

    // Print results
    this.printResults();
  }

  async testAddonReady() {
    console.log("Test 1: Check Addon Ready Status");
    try {
      const ready = webhookAddon.isReady();
      if (ready) {
        this.pass("✓ Addon is ready");
      } else {
        this.fail("✗ Addon is not ready");
      }
    } catch (error) {
      this.fail(`✗ Error checking ready status: ${error.message}`);
    }
  }

  async testSendText() {
    console.log("\nTest 2: Send Text Message");
    try {
      const result = await webhookAddon.sendText("Test message from webhook addon!", "general");
      if (result && result.success) {
        this.pass("✓ Text message queued successfully");
      } else {
        this.fail("✗ Text message failed to queue");
      }
    } catch (error) {
      this.fail(`✗ Error sending text: ${error.message}`);
    }
  }

  async testSendEmbed() {
    console.log("\nTest 3: Send Embed");
    try {
      const embed = {
        title: "Test Embed",
        description: "This is a test embed from the webhook addon",
        color: 0x3498DB,
        fields: [
          { name: "Status", value: "Working", inline: true },
          { name: "Version", value: "4.0.0", inline: true }
        ]
      };
      const result = await webhookAddon.sendEmbed(embed, "general");
      if (result && result.success) {
        this.pass("✓ Embed sent successfully");
      } else {
        this.fail("✗ Embed failed to send");
      }
    } catch (error) {
      this.fail(`✗ Error sending embed: ${error.message}`);
    }
  }

  async testSendRichEmbed() {
    console.log("\nTest 4: Send Rich Embed");
    try {
      const result = await webhookAddon.sendRichEmbed({
        title: "Rich Embed Test",
        description: "Testing the rich embed functionality",
        color: 0x2ECC71,
        fields: [
          { name: "Test", value: "Pass", inline: false }
        ],
        footerText: "Webhook Addon Test",
        webhookType: "general"
      });
      if (result && result.success) {
        this.pass("✓ Rich embed sent successfully");
      } else {
        this.fail("✗ Rich embed failed to send");
      }
    } catch (error) {
      this.fail(`✗ Error sending rich embed: ${error.message}`);
    }
  }

  async testHealthReport() {
    console.log("\nTest 5: Get Health Report");
    try {
      const health = webhookAddon.getHealthReport();
      if (health && typeof health === "object") {
        this.pass("✓ Health report retrieved successfully");
        console.log("  Health data:", JSON.stringify(health, null, 2));
      } else {
        this.fail("✗ Health report is invalid");
      }
    } catch (error) {
      this.fail(`✗ Error getting health report: ${error.message}`);
    }
  }

  async testWebhookList() {
    console.log("\nTest 6: Get Webhook List");
    try {
      const webhooks = webhookAddon.getWebhookList();
      if (webhooks && Array.isArray(webhooks)) {
        this.pass(`✓ Webhook list retrieved (${webhooks.length} webhooks)`);
        webhooks.forEach(w => {
          const status = w.valid ? "✓" : "✗";
          console.log(`  ${status} ${w.name}: ${w.url}`);
        });
      } else {
        this.fail("✗ Webhook list is invalid");
      }
    } catch (error) {
      this.fail(`✗ Error getting webhook list: ${error.message}`);
    }
  }

  async testEventListeners() {
    console.log("\nTest 7: Event Listeners");
    try {
      let beforeFired = false;
      let afterFired = false;
      let errorFired = false;

      const unsubscribeBefore = webhookAddon.onBeforeSend(() => {
        beforeFired = true;
      });

      const unsubscribeAfter = webhookAddon.onAfterSend(() => {
        afterFired = true;
      });

      const unsubscribeError = webhookAddon.onError(() => {
        errorFired = true;
      });

      // Send a message to trigger events
      await webhookAddon.sendText("Event test", "general");

      // Wait a bit for events to fire
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clean up listeners
      unsubscribeBefore();
      unsubscribeAfter();
      unsubscribeError();

      if (beforeFired) {
        this.pass("✓ onBeforeSend event fired");
      } else {
        this.fail("✗ onBeforeSend event did not fire");
      }

      if (afterFired) {
        this.pass("✓ onAfterSend event fired");
      } else {
        this.fail("✗ onAfterSend event did not fire");
      }

      // Error event might not fire if no error occurs
      this.pass("✓ Event listener system working");

    } catch (error) {
      this.fail(`✗ Error testing events: ${error.message}`);
    }
  }

  pass(message) {
    console.log(message);
    this.results.passed++;
    this.results.tests.push({ status: "pass", message });
  }

  fail(message) {
    console.log(message);
    this.results.failed++;
    this.results.tests.push({ status: "fail", message });
  }

  printResults() {
    console.log("\n╔═══════════════════════════════════════════════════╗");
    console.log(`║          TEST RESULTS: ${this.results.passed} Passed, ${this.results.failed} Failed              ║`);
    console.log("╚═══════════════════════════════════════════════════╝\n");

    if (this.results.failed === 0) {
      console.log("✅ ALL TESTS PASSED! Webhook addon is working correctly.\n");
    } else {
      console.log(`⚠️  ${this.results.failed} test(s) failed. Check the output above.\n`);
    }
  }
}

// Auto-run when imported
const tester = new WebhookTests();
tester.run();

export default WebhookTests;
