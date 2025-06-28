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

// no items -> exit
if (!fs.existsSync("./BP/items")){
    exit(0);
}

// run for each item
forEachFile("./BP/items", (data, file) => {
    let item = jsonc.parse(data);
    const id = item["minecraft:item"]["description"]["identifier"];

    // create localization entries
    if ("texts" in item["minecraft:item"]){
        Object.entries(item["minecraft:item"]["texts"]).forEach(([key, value]) => {
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

            texts += `\nitem.${id}=${name}\n`;

            try {
                fs.writeFileSync(text_path, texts);
            } catch (e) {
                console.error("Failed to write to texts: " + e);
            }
        });

        delete item["minecraft:item"]["texts"];
    }

    try {
        fs.writeFileSync(`./BP/items/${file}`, JSON.stringify(item, null, 4));
    } catch (e) {
        console.error("Failed to write to item: " + e);
    }

}, true);