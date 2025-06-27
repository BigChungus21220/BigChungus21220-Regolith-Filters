## TextureListGen

A filter which generates item_texture.json and terrain_texture.json automatically

### Installation

To install TextureListGen to a Regolith project, run `regolith install texturelistgen --profile=default` or `regolith install github.com/BigChungus21220/BigChungus21220-Regolith-Filters/texturelistgen --profile=default`.

### Usage

Rather than using texture keys from terrain_texture.json or item_texture.json, use #path/to/image

Eg:
```json
{
  "format_version": "1.21.70",
  "minecraft:item": {
    "description": {
      "identifier": "eg:lance"
    },
    "components": {
      "minecraft:icon": "#textures/items/lance"
      // ...
    }
  }
}
```