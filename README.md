# 🌳 Treezle

A lightweight, dependency-free TreeView component for the web — built with OutSystems in mind, but happy anywhere.

```
No npm. No build step. No drama.
Just drop in two files and go.
```
<img width="361" height="611" alt="image" src="https://github.com/user-attachments/assets/5bae75cf-98a9-4cc3-9840-fd027d64fcf1" />

-----

## Features

- **Zero dependencies** — pure JS and CSS, works in any environment
- **Flat node array** — maps 1:1 to a database table or OutSystems Entity
- **Drag & drop** — with circular-drop protection (we’ve thought of the edge cases)
- **Inline rename** — double-click to rename, Enter to confirm, Escape to bail
- **Multi-select** — Ctrl+click support
- **Checkboxes** — per-node, with global column reservation for alignment
- **Context menus** — right-click, ellipsis button (horizontal or vertical), or none
- **Themes** — `minimal` and `explorer` out of the box
- **CSS variables** — every color, size, and spacing is customizable
- **Dark mode** — automatic via `prefers-color-scheme`
- **DOM events** — all events fire as `CustomEvent` on the container with a `treezle:` prefix

-----

## Files

|File         |Description                                                        |
|-------------|-------------------------------------------------------------------|
|`treezle.js` |Component logic — exports `window.TreeView`                        |
|`treezle.css`|All styling — no inline styles in JS (except dynamic `paddingLeft`)|

-----

## Quick Start

```html
<link rel="stylesheet" href="treezle.css" />
<script src="treezle.js"></script>

<div id="my-tree"></div>

<script>
  const nodes = [
    { id: "1", parentId: null,  label: "Root",   nodeType: "folder", isExpanded: true },
    { id: "2", parentId: "1",   label: "Child A", nodeType: "item" },
    { id: "3", parentId: "1",   label: "Child B", nodeType: "item" },
  ];

  const tree = new TreeView(
    document.getElementById("my-tree"),
    nodes,
    { theme: "minimal", showIcons: false },
    []
  );

  tree.on("onNodeClick", ({ node }) => {
    console.log("Clicked:", node.label);
  });
</script>
```

-----

## Node Schema

Every node is a plain flat object — no nesting, no subNodes, no surprises.

|Field         |Type                    |Default |Description                                      |
|--------------|------------------------|--------|-------------------------------------------------|
|`id`          |`string | number`       |auto    |Primary key. Long Integer compatible (OutSystems)|
|`parentId`    |`string | number | null`|`null`  |Parent node id. `null` = root node               |
|`label`       |`string`                |`"Node"`|Display text                                     |
|`nodeType`    |`string`                |`""`    |Used to filter commands per node type            |
|`isReadOnly`  |`boolean`               |`false` |Disables inline rename                           |
|`isDraggable` |`boolean`               |`false` |Enables drag source                              |
|`isExpanded`  |`boolean`               |`false` |Expanded state                                   |
|`isSelected`  |`boolean`               |`false` |Selected state                                   |
|`isDisabled`  |`boolean`               |`false` |Grays out and disables interaction               |
|`isVisible`   |`boolean`               |`true`  |Hides the node without removing it               |
|`isChecked`   |`boolean`               |`false` |Checkbox state                                   |
|`showCheckBox`|`boolean`               |`false` |Show checkbox for this node                      |
|`cssClass`    |`string`                |`""`    |Extra CSS class on the row element               |
|`icon`        |`string`                |`""`    |CSS class (e.g. `fa fa-folder`) or image URL     |
|`data`        |`object`                |`{}`    |Free JSON payload — not touched by Treezle       |

-----

## Options

Pass as the third argument to `new TreeView()`.

|Option             |Type     |Default    |Description                                                          |
|-------------------|---------|-----------|---------------------------------------------------------------------|
|`multiSelect`      |`boolean`|`false`    |Enable Ctrl+click multi-select                                       |
|`allowInlineRename`|`boolean`|`false`    |Enable double-click rename                                           |
|`indentPx`         |`number` |`20`       |Indent per level in pixels                                           |
|`showIcons`        |`boolean`|`false`    |Render icon column                                                   |
|`showCheckBoxes`   |`boolean`|`false`    |Reserve checkbox column globally                                     |
|`menuStyle`        |`string` |`"None"`   |`"None"` | `"RightClick"` | `"EllipsisButton1"` | `"EllipsisButton2"`|
|`styleClass`       |`string` |`""`       |Extra CSS class added to the container                               |
|`theme`            |`string` |`"minimal"`|`"minimal"` | `"explorer"`                                           |

-----

## Commands

Commands populate the context menu. Pass as the fourth argument.

|Field     |Type     |Description                                                   |
|----------|---------|--------------------------------------------------------------|
|`name`    |`string` |Unique identifier — returned in the `onCommand` event         |
|`label`   |`string` |Menu item display text                                        |
|`nodeType`|`string` |`""` = show for all node types, otherwise filter by `nodeType`|
|`icon`    |`string` |CSS class or image URL                                        |
|`show`    |`boolean`|`false` = never show this command                             |

```js
const commands = [
  { name: "rename",  label: "Rename",  nodeType: "",       icon: "fa fa-pen" },
  { name: "delete",  label: "Delete",  nodeType: "item",   icon: "fa fa-trash" },
  { name: "addChild",label: "Add child",nodeType: "folder", icon: "fa fa-plus" },
];
```

-----

## Events

All events fire as DOM `CustomEvent` on the container element with the prefix `treezle:`.  
They also call any handlers registered via `.on()`.

```js
// Option A — DOM event (great for OutSystems)
container.addEventListener("treezle:onNodeClick", (e) => {
  console.log(e.detail.node);
});

// Option B — fluent API
tree.on("onNodeClick", ({ node }) => {
  console.log(node.label);
});
```

|Event               |Payload                                      |Description                                        |
|--------------------|---------------------------------------------|---------------------------------------------------|
|`onNodeClick`       |`{ node }`                                   |Node was clicked                                   |
|`onNodeSelect`      |`{ node, selectedIds[] }`                    |Selection changed                                  |
|`onNodeExpand`      |`{ node }`                                   |Node expanded                                      |
|`onNodeCollapse`    |`{ node }`                                   |Node collapsed                                     |
|`beforeNodeExpand`  |`{ node, preventDefault() }`                 |Before expand — call `preventDefault()` to cancel  |
|`beforeNodeCollapse`|`{ node, preventDefault() }`                 |Before collapse — call `preventDefault()` to cancel|
|`onNodeRename`      |`{ node, oldLabel, newLabel }`               |Inline rename committed                            |
|`onStartDrag`       |`{ node }`                                   |Drag started                                       |
|`onNodeMoved`       |`{ node, fromParentId, toParentId, nodes[] }`|Node dropped on new parent                         |
|`onDropNode`        |`{ draggedNode, targetNode, nodes[] }`       |Raw drop event                                     |
|`onDropRejected`    |`{ reason, draggedNode, targetNode }`        |Drop rejected (e.g. circular)                      |
|`onCommand`         |`{ node, commandName }`                      |Context menu command clicked                       |
|`onCheckChanged`    |`{ node, isChecked }`                        |Checkbox toggled                                   |


> **Note:** `nodes[]` in move/drop events is the full updated flat array — ready to sync back to your server.

-----

## Public API

```js
const tree = new TreeView(container, nodes, options, commands);

tree.setNodes(nodes)       // Replace all nodes and re-render
tree.setOptions(options)   // Merge new options and re-render
tree.setCommands(commands) // Replace command list

tree.getNodes()            // → flat array of all nodes (current state)
tree.getChangedNodes()     // → flat array of nodes with _dirty = true

tree.expand(id)            // Expand a node by id
tree.collapse(id)          // Collapse a node by id
tree.selectNode(id)        // Programmatically select a node

tree.on(event, handler)    // Subscribe to an event
tree.off(event, handler)   // Unsubscribe

tree.destroy()             // Clean up DOM and global listeners
```

-----

## Theming

All visual properties are CSS custom properties on `:root`.  
Override them on `:root` for global changes, or scope them to your container class.

```css
/* Example: change selection color */
:root {
  --tv-selected-bg:   #fef3c7;
  --tv-selected-text: #92400e;
}

/* Example: scoped to one instance */
.my-custom-tree {
  --tv-font-size:   14px;
  --tv-row-height:  34px;
  --tv-indent:      24px;
}
```

Dark mode is automatic via `prefers-color-scheme: dark`. Override as needed.

### Key variables

|Variable            |Default  |Description            |
|--------------------|---------|-----------------------|
|`--tv-bg`           |`#ffffff`|Container background   |
|`--tv-text`         |`#1a1a1a`|Default text color     |
|`--tv-hover-bg`     |`#f3f4f6`|Row hover background   |
|`--tv-selected-bg`  |`#dbeafe`|Selected row background|
|`--tv-selected-text`|`#1d4ed8`|Selected row text      |
|`--tv-row-height`   |`30px`   |Minimum row height     |
|`--tv-font-size`    |`13.5px` |Base font size         |
|`--tv-indent`       |`20px`   |Indent per level       |
|`--tv-menu-shadow`  |—        |Context menu box shadow|

Full variable list is in `treezle.css`.

-----

## OutSystems Integration

Treezle was designed with OutSystems in mind. Recommended wiring:

**OnReady (JavaScript node)**

```js
var host = $parameters.ElementId; // reference to container element
var nodes = JSON.parse($parameters.NodesJSON);
var options = JSON.parse($parameters.OptionsJSON);
var commands = JSON.parse($parameters.CommandsJSON);

host._treezle = new TreeView(host, nodes, options, commands);
window.treezle = host._treezle; // optional global reference

host.addEventListener("treezle:onNodeClick", function(e) {
  $actions.OnNodeClick(JSON.stringify(e.detail.node));
});

host.addEventListener("treezle:onCommand", function(e) {
  $actions.OnCommand(JSON.stringify(e.detail.node), e.detail.commandName);
});
```

**OnParametersChanged**

```js
var host = $parameters.ElementId;
if (host._treezle) {
  host._treezle.setNodes(JSON.parse($parameters.NodesJSON));
}
```

**Client Action — SelectNode**

```js
var host = $parameters.ElementId;
if (host._treezle) {
  host._treezle.selectNode($parameters.NodeId);
}
```

Nodes come in via `JSONSerialize` in a Server Action and go out the same way — Treezle’s flat array maps 1:1 to an OutSystems Entity.

-----

## Browser Support

All modern browsers. No IE11. Life is too short.

-----

## License

MIT — [Micha Sulman](https://github.com/michasulman), 2026
