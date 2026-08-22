# Minecraft Bedrock Regional Background Music (BGM) System Setup Guide

This guide details the complete process of creating a custom resource pack, configuring Ogg Vorbis audio assets, setting up server-side resource enforcement, and configuring spatial music boundaries.

---

## Part 1: Creating the Custom Resource Pack

### 1. Directory Structure

Navigate to your server directory and create a folder named `CityMusicRP` inside the `resource_packs/` folder. Build the following directory structure:

```text
CityMusicRP/
├── manifest.json
├── sound_definitions.json
└── sounds/
     └── ui/
          └── toast/
               ├── music1.ogg
               ├── music2.ogg
               └── music3.ogg

```

---

### 2. Configuring `manifest.json`

Create a `manifest.json` file in the root of `CityMusicRP`. Ensure you generate unique UUIDs for both the header and modules.

```json
{
  "format_version": 2,
  "header": {
    "description": "City BGM Resource Pack",
    "name": "City Music RP",
    "uuid": "4c1b17b2-6523-42fb-83cb-93b5d27572d4",
    "version": [1, 0, 0]
  },
  "modules": [
    {
      "description": "City BGM Resource Pack",
      "type": "resources",
      "uuid": "a8f3d1e2-9b4c-4a3d-8e12-3f56a78b9c0d",
      "version": [1, 0, 0]
    }
  ]
}

```

---

### 3. Audio Encoding Requirements

Minecraft Bedrock Edition strictly requires background audio tracks to use **Ogg Vorbis** encoding. Opus-encoded files or incorrectly renamed `.mp3` files will remain completely silent.

1. Open your audio file in an audio editor like Audacity.
2. Select **File > Export Audio**.
3. Choose **OGG Files (Ogg Vorbis Export)** as the format.
4. Save the files as `music1.ogg`, `music2.ogg`, and `music3.ogg` inside `sounds/ui/toast/`.

---

### 4. Configuring `sound_definitions.json`

Create `sound_definitions.json` in the root of `CityMusicRP`. Use `"stream": true` to prevent memory issues on low-RAM mobile devices without preloading heavy files into memory.

```json
{
  "format_version": "1.14.0",
  "sound_definitions": {
    "custom.music.music1": {
      "category": "ui",
      "sounds": [
        {
          "name": "sounds/ui/toast/music1",
          "stream": true
        }
      ]
    },
    "custom.music.music2": {
      "category": "ui",
      "sounds": [
        {
          "name": "sounds/ui/toast/music2",
          "stream": true
        }
      ]
    },
    "custom.music.music3": {
      "category": "ui",
      "sounds": [
        {
          "name": "sounds/ui/toast/music3",
          "stream": true
        }
      ]
    }
  }
}

```

---

## Part 2: Server Enforcement & World Binding

### 1. Modifying `server.properties`

Open your server's root `server.properties` file and enable resource enforcement:

```properties
texturepack-required=true

```

### 2. Binding the Resource Pack to the World

Navigate to your active world directory (e.g., `worlds/Bedrock level/`) and create or modify `world_resource_packs.json`:

```json
[
  {
    "pack_id": "4c1b17b2-6523-42fb-83cb-93b5d27572d4",
    "version": [1, 0, 0]
  }
]

```

*(Note: The `pack_id` must match the `uuid` declared inside your resource pack's `manifest.json`)*
*(Note: Everytime you have added a new music track, you need to update the `sound_definitions.json`, update a version in `manifest.json` e.g. from [1, 0, 0] to [1, 0, 1]. Make sure to modify `world_resource_packs.json` with the new version id too)*

---

## Part 3: Creating `musicsetting.js`

Create your spatial coordinate configuration file inside your behavior pack script directory:

```javascript
export const MUSIC_ZONES = [
    {
        id: "riverside",
        dimension: "minecraft:overworld",
        minX: 100,
        maxX: 300,
        minY: 60,
        maxY: 120,
        minZ: -500,
        maxZ: -300,
        tracks: [
            {
                soundId: "custom.music.music1",
                duration: 180
            },
            {
                soundId: "custom.music.music2",
                duration: 210
            },
            {
                soundId: "custom.music.music3",
                duration: 195
            }
        ]
    }
];

*(Note: the duration of the music is the total seconds of length of your music. e.g. your music is 1:52 long, duration would be 60+52 = 112)*

```
