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

function editStringsRecursive(data, fn){
    if (typeof data === "object"){
        for (const key in data){
            data[key] = editStringsRecursive(data[key], fn);
        }
        return data;
    } else if (Array.isArray(data)){
        for (let i = 0; i < data.length; i++){
            data[i] = editStringsRecursive(data[i], fn);
        }
        return data;
    } else if (typeof data === "string") {
        return fn(data);
    } else {
        return data
    }
}

let terrain_texture_data = {};
let item_texture_data = {};

function addItemTextures(obj){
    return editStringsRecursive(obj, (str) => {
        if (/#.*/.test(str)){
            let path = str.slice(1);
            let name = "tlg:" + path.replaceAll("/", "_");
            item_texture_data[name] = {
                "textures": path
            };
            return name;
        } else {
            return str;
        }
    });
}

function addTerrainTextures(obj){
    return editStringsRecursive(obj, (str) => {
        if (/#.*/.test(str)){
            let path = str.slice(1);
            let name = "tlg:" + path.replaceAll("/", "_");
            terrain_texture_data[name] = {
                "textures": path
            };
            return name;
        } else {
            return str;
        }
    });
}

if (fs.existsSync("./BP/blocks")){
    forEachFile("./BP/blocks", (data, file) => {
        let block = jsonc.parse(data);
        block = addTerrainTextures(block);

        try {
            fs.writeFileSync("./BP/blocks/" + file, JSON.stringify(block, null, 4));
        } catch (e) {
            console.error("Failed to write to block: " + e);
        }
    });
}

if (fs.existsSync("./BP/items")){
    forEachFile("./BP/items", (data, file) => {
        let item = jsonc.parse(data);
        item = addItemTextures(item);

        try {
            fs.writeFileSync("./BP/items/" + file, JSON.stringify(item, null, 4));
        } catch (e) {
            console.error("Failed to write to item: " + e);
        }
    });
}

if (fs.existsSync("./RP/blocks.json")){
    let blocks = jsonc.parse(fs.readFileSync(`./RP/blocks.json`, "utf8"));
    blocks = addTerrainTextures(blocks);

    try {
        fs.writeFileSync("./RP/blocks.json", JSON.stringify(blocks, null, 4));
    } catch (e) {
        console.error("Failed to write to blocks.json: " + e);
    }
}

let terrain_texture = jsonc.parse(fs.readFileSync(`./RP/textures/terrain_texture.json`, "utf8"));
terrain_texture["texture_data"] = {...terrain_texture["texture_data"], ...terrain_texture_data};
try {
    fs.writeFileSync("./RP/textures/terrain_texture.json", JSON.stringify(terrain_texture, null, 4));
} catch (e) {
    console.error("Failed to write to terrain_texture.json: " + e);
}

let item_texture = jsonc.parse(fs.readFileSync(`./RP/textures/item_texture.json`, "utf8"));
item_texture["texture_data"] = {...item_texture["texture_data"], ...item_texture_data};
try {
    fs.writeFileSync("./RP/textures/item_texture.json", JSON.stringify(item_texture, null, 4));
} catch (e) {
    console.error("Failed to write to item_texture.json: " + e);
}