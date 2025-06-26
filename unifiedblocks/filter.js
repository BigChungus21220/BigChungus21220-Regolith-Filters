const fs = require("fs");
const path = require("path");
const jsonc = require("jsonc");
const { exit } = require("process");

function forEachFile(directory, fn, recursive=false){
  let files = fs.readdirSync(directory);
  
  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (recursive && stat.isDirectory()) {
      forEachFile(filePath, fn, max_depth, depth + 1);
    } else if (stat.isFile()) {
      const data = fs.readFileSync(filePath, "utf8");
      fn(data, file);
    }
  });
}

if (!fs.existsSync("./BP/blocks")){
    exit(0);
}

forEachFile("./BP/blocks", (data, file) => {
    let block = jsonc.parse(data);
    const id = block["minecraft:block"]["description"]["identifier"];
    let has_item = false;

    if ("item" in block["minecraft:block"]){
        has_item = true;

        let item = {
            "format_version": "1.21.70",
            "minecraft:item": {
                "description": {
                    "identifier": id
                },
                "components": {
                    "minecraft:block_placer": {
                        "block": id,
                        "replace_block_item": true
                    }
                }
            }
        };

        if ("menu_category" in block["minecraft:block"]["description"]){
            let category = block["minecraft:block"]["description"]["menu_category"];
            item["minecraft:item"]["description"]["menu_category"] = category;
        }

        if ("icon" in block["minecraft:block"]["item"]){
            item["minecraft:item"]["components"]["minecraft:icon"] = structuredClone(block["minecraft:block"]["item"]["icon"]);
        }

        let itemPath = `./BP/items/${id.replaceAll(":", "_")}.json`;
        if (!fs.existsSync(`./BP/items`)){
            fs.mkdirSync(`./BP/items`);
        }

        if (!fs.existsSync(itemPath)){
            try {
                fs.writeFileSync(itemPath, JSON.stringify(item, null, 4));
            } catch (e) {
                console.error("Failed to write item: " + e);
            }
        } else {
            console.error(`Could not generate item file for ${id}. Item for ${itemPath} already exists.`);
        }

        delete block["minecraft:block"]["item"];
    }

    if ("resource_definition" in block["minecraft:block"]){
        if (!fs.existsSync(`./RP`)){
            fs.mkdirSync(`./RP`);
        }
        let blocks = {};
        if (!fs.existsSync(`./RP/blocks.json`)){
            blocks["format_version"] = "1.21.40";
        } else {
            blocks = jsonc.parse(fs.readFileSync(`./RP/blocks.json`, "utf8"));
            console.log(blocks);
        }
        blocks[id] = structuredClone(block["minecraft:block"]["resource_definition"]);
        try {
            fs.writeFileSync(`./RP/blocks.json`, JSON.stringify(blocks, null, 4));
        } catch (e) {
            console.error("Failed to write to blocks.json: " + e);
        }

        delete block["minecraft:block"]["resource_definition"];
    }

    if ("texts" in block["minecraft:block"]){
        // check for RP & texts folders
        // get text entry
        for (const [key, value] in block["minecraft:block"]["texts"]){
            path = `./RP/texts/${key}.lang`;

            if (!fs.existsSync(`./RP`)){
                fs.mkdirSync(`./RP`);
            }

            if (!fs.existsSync(`./RP/texts`)){
                fs.mkdirSync(`./RP/texts`);
            }

            let texts = "";
            if (fs.existsSync(path)){
                texts = fs.readFileSync(`./RP/blocks.json`, "utf8");
            }
            let name = value;
            if (has_item){
                texts += `\nitem.${id}=${name}`;
            }
            texts += `\ntile.${id}.name=${name}`;

            try {
                fs.writeFileSync(path, texts);
            } catch (e) {
                console.error("Failed to write to texts: " + e);
            }
        }
    }

    try {
        fs.writeFileSync(`./BP/blocks/${file}`, JSON.stringify(block, null, 4));
    } catch (e) {
        console.error("Failed to write to block: " + e);
    }

}, true);