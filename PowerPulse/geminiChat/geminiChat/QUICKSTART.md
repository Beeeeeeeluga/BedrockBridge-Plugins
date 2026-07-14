# Gemini AI Chat Plugin - Quick Start Guide

**Get up and running in 5 minutes!**

---

## Step 1: Get Your API Key (2 minutes)

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Click "Create API Key"
3. Copy the generated key
4. Keep it safe!

---

## Step 2: Enable the Plugin (1 minute)

**Join your Minecraft server and run:**
```
/plugin enable ./bridgePlugins/geminiChat/main
```

Or use Plugin Manager UI:
```
/plugin ui
```

---

## Step 3: Configure API Key (1 minute)

**In-game command:**
```
/gemini setkey YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with your actual API key!

---

## Step 4: Start Chatting! (1 minute)

**Simply type in chat:**
```
@g How do I craft a diamond pickaxe?
```

The AI will respond with an answer!

---

## Common Commands

| Command | What it does |
|---------|--------------|
| `@g question` | Ask Gemini anything |
| `/gemini ui` | Open settings menu |
| `/gemini clear` | Clear chat history |
| `/gemini status` | Check API status |
| `/gemini help` | Show help |

---

## Tips for Best Results

### Ask Clear Questions
❌ Bad: `How to build?`
✅ Good: `How do I build a safe house in Minecraft?`

### Use the Right Prefix
Change chat prefix in Settings if you want:
- Example: `!ai question` instead of `@g question`

### Adjust Temperature
- **Lower (0.5)** = More factual answers
- **Higher (1.5)** = More creative answers

### Check Your Quota
Monitor API usage to avoid going over limits

---

## Troubleshooting

### Plugin not loading?
```
/plugin reload
```
Wait 10 seconds and check console for errors.

### "API key not configured" error?
```
/gemini setkey YOUR_KEY
```
Make sure no extra spaces!

### Getting rate limited?
Wait a few minutes before asking again. Check free tier limits.

### Bot not responding?
1. Check API key is valid
2. Try a simpler question
3. Check server console for errors

---

## Settings to Customize

**Open:** `/gemini ui` → Settings

| Setting | Change to | Effect |
|---------|-----------|--------|
| Temperature | Lower | More consistent answers |
| Temperature | Higher | More creative answers |
| Max Tokens | Lower | Faster, shorter responses |
| Max Tokens | Higher | Longer, detailed responses |

---

## Next Steps

1. **Read the full README** for advanced features
2. **Explore Settings** to customize behavior
3. **Check `/gemini debug`** as admin to see stats
4. **Invite your friends** to chat with Gemini!

---

## Need Help?

- **Plugin not working?** Check the README troubleshooting section
- **Want to customize it?** See the Configuration section
- **Issues with Gemini?** Check Google API documentation

---

**That's it! You're ready to chat with AI in Minecraft! 🤖**
