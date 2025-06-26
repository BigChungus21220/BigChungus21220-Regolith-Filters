## UnifiedBlocks

A simple filter that unifies block definitions into a single file.

### Installation

To install UnifiedBlocks to a Regolith project, run `regolith install unifiedblocks --profile=default` or `regolith install github.com/BigChungus21220/BigChungus21220-Regolith-Filters/unifiedblocks --profile=default`.

### Usage

```json
{
  "format_version": "1.21.70", // works with any version with the same menu category syntax
  "minecraft:block": {
    "description": {
      "identifier": "example:my_block",
      "menu_category": {
        "category": "nature"
      }
    },
    // optional, creates a proxy item for this block
    "item": {
      // the menu category of the proxy item is copied from the block

      // optional, sets the icon reference for the item
      "icon": "example:item_texture_reference"
    },
    // optional, creates a blocks.json entry for this block
    "resource_definition": {
      // blocks.json entry
    },
    // optional, creates localization entries for the block
    "texts": {
      // text file name : name of block
      "en_US": "My Block",
      "es_MX": "Mi Bloque"
      // ...
    },
    "components": {
      // standard block components
    }
  }
}
```