/**
 * rankManager.js - BedrockBridge Rank & Team Management Plugin
 *
 *
 * # YOU NEED THE PROXIMITY TEXT CHAT ADDON INSTALLED FIRST
 * https://github.com/Esploratori-Dev/Proximity-Text-Chat
 *
 * Uses @minecraft/server:
 * - Assigns and removes custom player ranks using Minecraft entity tags
 * - Manages squad/team roles with defined colors and priority levels
 * - Dynamically filters and replaces existing squad tags upon reassignment
 * - Registers administrative BedrockBridge commands
 * 
 * v1.0.0 by beeeeeeeluga (https://github.com/Beeeeeeeluga)
 * Discord: beeeeeeeluga (807236027189297212) 
 * V1.1.0 BY BellatrixOUO (https://github.com/BellatrixOUO)
 * Discord: bellatrix_31143 (1434976885451784264)
 * the updated version by Bellatrix fixed the issue caused by world event lags caused in the previous version.
 *
 * More plugins: https://discord.gg/kB7dWtQZKx
 *
 * Addon Support Server: https://discord.com/invite/esploratori-development-1043447184210792468
 */





import { bridge } from "../addons";


bridge.bedrockCommands.registerTagCommand(

    "add1",

    (player, gamertag) => {



        // Argument check

        if (!gamertag) {

            player.sendMessage("§eusage: !add1 <player>");

            return;

        }



        // Parse the argument into a player

        const target = gamertag.readPlayer(player);



        if (!target) {

            player.sendMessage("§cplayer not exist or offline");

            return;

        }



        const rankTag = "rank:§l§f[§2example§f]§r:100";



        if (target.hasTag(rankTag)) {

            player.sendMessage("§eplayer already has §l§f[§2example§f]§r rank");

            return;

        }



        target.addTag(rankTag);



        player.sendMessage(

            `§asuccessfully added §l§f[§2example§f]§r to §f${target.name}`

        );



        target.sendMessage(

            "§aYou have been given §l§f[§2example§f]§r rank"

        );

    },

    "give player the example rank",

    "example:admin"

); 



bridge.bedrockCommands.registerTagCommand(
    "remove1",
    (player, gamertag) => {

        // Argument check
        if (!gamertag) {
            player.sendMessage("§eusage: !remove1 <player>");
            return;
        }

        // Parse the argument into a player
        const target = gamertag.readPlayer(player);

        if (!target) {
            player.sendMessage("§cplayer not esixt or offline");
            return;
        }

        // Get all tags of the target player
        const tags = target.getTags();

        // Find all tags that contain "example"
        const exampleTags = tags.filter(tag => tag.includes("example"));

        if (exampleTags.length === 0) {
            player.sendMessage("§ethe player doesnt contains any rank including example");
            return;
        }

        // Remove all matched tags
        for (const tag of exampleTags) {
            target.removeTag(tag);
        }

        player.sendMessage(
            `§asuccessfully removed §f${target.name} §aof ${exampleTags.length} example relating tags`
        );

        target.sendMessage(
            "§call of your example tags has been removed"
        );
    },
    "remove all example roles from a player",
    "example:admin"
);

// contain more ranks


bridge.bedrockCommands.registerTagCommand(
    "addteam",
    (player, gamertag, squadNum) => {

        // check
        if (!gamertag || squadNum === undefined) {
            player.sendMessage("§e用法: !addteam <player> <number>");
            player.sendMessage("§f(0:royal guard, 1-6:sodier, 9:knight)");
            return;
        }

        // parse
        const target = gamertag.readPlayer(player);

        if (!target) {
            player.sendMessage("§cplayer offline or not exist");
            return;
        }

        // reasoning and color
        const squadMap = {
            "0": { name: "royal guard", color: "§e" },
            "1": { name: "sodier 1", color: "§c" },
            "2": { name: "sodier 2", color: "§6" },
            "3": { name: "sodier 3", color: "§a" },
            "4": { name: "sodier 4", color: "§b" },
            "5": { name: "sodier 5", color: "§5" },
            "6": { name: "sodier 6", color: "§d" },
            "9": { name: "knight", color: "§g" }
        };

        const config = squadMap[squadNum.toString()];

        if (!config) {
            player.sendMessage("§cinvalid number, only fill in 0, 1-6 or 9。");
            return;
        }


        const rankTag = `rank:§l${config.color} ${config.name}§r:8`;
        const currentTags = target.getTags();
        const keywords = ["guard", "sodier", "knight"];
        const tagsToRemove = currentTags.filter(tag => 
            keywords.some(kw => tag.includes(kw))
        );

        for (const oldTag of tagsToRemove) {
            target.removeTag(oldTag);
        }

        // add after correct
        target.addTag(rankTag);

        player.sendMessage(`§asuccessfully added §l${config.color}${config.name}§r §ato §f${target.name}`);
        target.sendMessage(`§aYou have been given §l${config.color}${config.name}§r §arank`);
    },
    "add specific team to a player",
    "team:admin"
);


// for the remove version of the team role is the same as the example above


