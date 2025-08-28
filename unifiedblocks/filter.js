const fs = require("fs");
const path = require("path");
const jsonc = require("jsonc");
const { exit } = require("process");

// itterates over files in a directory
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

// no blocks -> exit
if (!fs.existsSync("./BP/blocks")){
    exit(0);
}

let success = true;

// run for each block
forEachFile("./BP/blocks", (data, file) => {
    let block;
    try {
        block = jsonc.parse(data);
    } catch (err) {
        console.error(`Error parsing ${file}: ` + err);
        success = false;
        return;
    }

    const id = block["minecraft:block"]["description"]["identifier"];
    let has_item = false;

    // create proxy item
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
                success = false; 
                return;
            }
        } else {
            console.error(`Could not generate item file for ${id}. Item for ${itemPath} already exists.`);
            success = false;
            return;
        }

        delete block["minecraft:block"]["item"];
    }

    // create blocks.json entry
    if ("resource_definition" in block["minecraft:block"]){
        if (!fs.existsSync(`./RP`)){
            fs.mkdirSync(`./RP`);
        }
        let blocks = {};
        if (!fs.existsSync(`./RP/blocks.json`)){
            blocks["format_version"] = "1.21.40";
        } else {
            blocks = jsonc.parse(fs.readFileSync(`./RP/blocks.json`, "utf8"));
        }
        blocks[id] = structuredClone(block["minecraft:block"]["resource_definition"]);
        try {
            fs.writeFileSync(`./RP/blocks.json`, JSON.stringify(blocks, null, 4));
        } catch (e) {
            console.error("Failed to write to blocks.json: " + e);
            success = false;
            return;
        }

        delete block["minecraft:block"]["resource_definition"];
    }

    // create localization entries
    if ("texts" in block["minecraft:block"]){
        Object.entries(block["minecraft:block"]["texts"]).forEach(([key, value]) => {
            let text_path = `./RP/texts/${key}.lang`;

            if (!fs.existsSync(`./RP`)){
                fs.mkdirSync(`./RP`);
            }

            if (!fs.existsSync(`./RP/texts`)){
                fs.mkdirSync(`./RP/texts`);
            }

            let texts = "";
            if (fs.existsSync(text_path)){
                texts = fs.readFileSync(text_path, "utf8");
            }
            let name = value;

            texts += `\ntile.${id}.name=${name}\n`;
            if (has_item){
                texts += `item.${id}=${name}\n`;
            }

            try {
                fs.writeFileSync(text_path, texts);
            } catch (e) {
                console.error("Failed to write to texts: " + e);
                success = false;
                return;
            }
        });

        delete block["minecraft:block"]["texts"];
    }

    try {
        fs.writeFileSync(`./BP/blocks/${file}`, JSON.stringify(block, null, 4));
    } catch (e) {
        console.error("Failed to write to block: " + e);
        success = false;
        return;
    }

}, true);

if (!success){
    exit(1);
}