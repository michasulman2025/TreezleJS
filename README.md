# 🌳 Treezle

A lightweight, dependency-free TreeView component for the web — built with OutSystems in mind, but happy anywhere.

```
No npm. No build step. No drama.
Just drop in two files and go.
```

  <img width="428" height="324" alt="image" src="https://github.com/user-attachments/assets/1c3fde44-2e96-400e-bf92-490e5f9b0201" />

---
  <img width="434" height="329" alt="image" src="https://github.com/user-attachments/assets/be2e0a20-a127-4720-936a-ea6b50d4beb0" />


---

## Features

- **Zero dependencies** — pure JS and CSS, works in any environment
- **Flat node array** — maps 1:1 to a database table or OutSystems Entity
- **Drag & drop** — with circular-drop protection (we've thought of the edge cases)
- **Inline rename** — double-click to rename, Enter to confirm, Escape to bail
- **Multi-select** — Ctrl+click support
- **Checkboxes** — per-node, with global column reservation for alignment
- **Context menus** — right-click, ellipsis button (horizontal or vertical), or none
- **Themes** — `minimal`, `explorer`, and `border` out of the box
- **CSS variables** — every color, size, and spacing is customizable via `.tv-container`
- **Icon support** — works with any CSS icon library (e.g. Remix Icon) or image URLs
- **DOM events** — all events fire as `CustomEvent` on the container with a `treezle:` prefix

---

## Files

| File | Description |
|---|---|
| `treezle.js` | Component logic — exports `window.TreeView` |
| `treezle.css` | All styling — no inline styles in JS (except dynamic `paddingLeft`) |

---

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

---

## Node Schema

Every node is a plain flat object — no nesting, no subNodes, no surprises.

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | `string \| number` | auto | Primary key. Long Integer compatible (OutSystems) |
| `parentId` | `string \| number \| null` | `null` | Parent node id. `null` = root node |
| `label` | `string` | `"Node"` | Display text |
| `nodeType` | `string` | `""` | Used to filter commands per node type |
| `isReadOnly` | `boolean` | `false` | Disables inline rename |
| `isDraggable` | `boolean` | `false` | Enables drag source |
| `isExpanded` | `boolean` | `false` | Expanded state |
| `isSelected` | `boolean` | `false` | Selected state |
| `isDisabled` | `boolean` | `false` | Grays out and disables interaction |
| `isVisible` | `boolean` | `true` | Hides the node without removing it |
| `isChecked` | `boolean` | `false` | Checkbox state |
| `showCheckBox` | `boolean` | `false` | Show checkbox for this node |
| `cssClass` | `string` | `""` | Extra CSS class on the row element |
| `icon` | `string` | `""` | CSS class (e.g. `ri-folder-line`) or image URL |
| `isDropTarget` | `boolean` | `true` | Set to `false` to reject drops onto this node |
| `data` | `object` | `{}` | Free JSON payload — not touched by Treezle |

---

## Options

Pass as the third argument to `new TreeView()`.

| Option | Type | Default | Description |
|---|---|---|---|
| `multiSelect` | `boolean` | `false` | Enable Ctrl+click multi-select |
| `allowInlineRename` | `boolean` | `false` | Enable double-click rename |
| `indentPx` | `number` | `20` | Indent per level in pixels |
| `showIcons` | `boolean` | `false` | Render icon column |
| `showCheckBoxes` | `boolean` | `false` | Reserve checkbox column globally |
| `menuStyle` | `string` | `"None"` | `"None"` \| `"RightClick"` \| `"EllipsisButton1"` \| `"EllipsisButton2"` |
| `styleClass` | `string` | `""` | Extra CSS class added to the container |
| `theme` | `string` | `"minimal"` | `"minimal"` \| `"explorer"` \| `"border"` |

---

## Commands

Commands populate the context menu. Pass as the fourth argument.

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Unique identifier — returned in the `onCommand` event |
| `label` | `string` | Menu item display text |
| `nodeType` | `string` | `""` = show for all node types, otherwise filter by `nodeType` |
| `icon` | `string` | CSS class or image URL |
| `iconHover` | `string` | Alternative icon swapped in on hover (optional) |
| `show` | `boolean` | `false` = never show this command |

```js
const commands = [
  { name: "rename",   label: "Rename",    nodeType: "",       icon: "ri-pencil-line" },
  { name: "delete",   label: "Delete",    nodeType: "item",   icon: "ri-delete-bin-line" },
  { name: "addChild", label: "Add child", nodeType: "folder", icon: "ri-add-line" },
];
```

---

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

| Event | Payload | Description |
|---|---|---|
| `onNodeClick` | `{ node }` | Node was clicked |
| `onNodeSelect` | `{ node, selectedIds[] }` | Selection changed |
| `onNodeExpand` | `{ node }` | Node expanded |
| `onNodeCollapse` | `{ node }` | Node collapsed |
| `beforeNodeExpand` | `{ node, preventDefault() }` | Before expand — call `preventDefault()` to cancel |
| `beforeNodeCollapse` | `{ node, preventDefault() }` | Before collapse — call `preventDefault()` to cancel |
| `onNodeRename` | `{ node, oldLabel, newLabel }` | Inline rename committed |
| `onStartDrag` | `{ node }` | Drag started |
| `onNodeMoved` | `{ node, fromParentId, toParentId, nodes[] }` | Node dropped on new parent |
| `onDropNode` | `{ draggedNode, targetNode, nodes[] }` | Raw drop event |
| `onDropRejected` | `{ reason, draggedNode, targetNode }` | Drop rejected (e.g. circular) |
| `onCommand` | `{ node, commandName }` | Context menu command clicked |
| `onCheckChanged` | `{ node, isChecked }` | Checkbox toggled |
| `onNodeAdded` | `{ node, parentId }` | Node added via `addNode()` |
| `onNodeDeleted` | `{ node, nodes[] }` | Node (and descendants) deleted via `deleteNode()` |
| `onNodeChanged` | `{ node }` | Node updated via `editNode()` |

> **Note:** `nodes[]` in move/drop events is the full updated flat array — ready to sync back to your server.

---

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
tree.toggleSelect(id)      // Toggle selection state of a node

tree.addNode(parentId, nodeJSON)  // Add a node under parentId (null = root)
tree.deleteNode(id)               // Delete a node and all its descendants
tree.editNode(nodeData)           // Merge fields into existing node — { id, ...fields }

tree.on(event, handler)    // Subscribe to an event
tree.off(event, handler)   // Unsubscribe

tree.destroy()             // Clean up DOM and global listeners

TreeView.getInstance(id)   // Get a TreeView instance by container element id
```

---

## Theming

All visual properties are CSS custom properties scoped to `.tv-container` — so multiple instances on the same page can each have their own theme. Context menu variables are additionally declared on `:root` since the menu renders on `document.body`.

```css
/* Example: warm orange selection */
#my-tree {
  --tv-selected-bg:    #ffc782;
  --tv-hover-bg:       #ffe0b5;
  --tv-drop-border:    #ff9023;
}

/* Example: compact dense tree */
#my-tree {
  --tv-line-height: 22px;
  --tv-font-size:   12px;
  --tv-indent:      16px;
}
```

### Key variables

| Variable | Default | Description |
|---|---|---|
| `--tv-bg` | `#ffffff` | Container background |
| `--tv-color` | `#1a1a1a` | Default text color |
| `--tv-font-size` | `13px` | Base font size |
| `--tv-line-height` | `26px` | Row height |
| `--tv-indent` | `20px` | Indent per level in pixels |
| `--tv-hover-bg` | `#f0f0f0` | Row hover background |
| `--tv-selected-bg` | `#e0e0e0` | Selected row background |
| `--tv-selected-color` | `#000000` | Selected row text color |
| `--tv-drop-border` | `#ff9023` | Drop target outline + checkbox accent |
| `--tv-drop-bg` | `#e5f3fb` | Drop target background |
| `--tv-arrow-color` | `#888` | Expand/collapse arrow color |
| `--tv-menu-bg` | `#ffffff` | Context menu background |
| `--tv-menu-shadow` | — | Context menu box shadow |
| `--tv-ellipsis-color` | `#999` | Ellipsis button color |

Full variable list is in `src/treezle.css`.

### Icons

Treezle works with any CSS icon library. The CSS includes an `@import` for [Remix Icon](https://remixicon.com) — the library used in the OutSystems reference implementation. To use it in your own project, either keep the import or load Remix Icon yourself:

```html
<!-- Option A: CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4/fonts/remixicon.css" />

<!-- Option B: already in treezle.css via @import "../remixicon.css" -->
```

If you use a different icon library (Font Awesome, Lucide, etc.), simply remove or replace the `@import` line at the top of `treezle.css` and use the appropriate class names in your node's `icon` field.

```js
// Remix Icon
{ icon: "ri-folder-line" }

// Font Awesome
{ icon: "fa-solid fa-folder" }

// Image URL
{ icon: "https://example.com/icons/folder.svg" }
```

---

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

Nodes come in via `JSONSerialize` in a Server Action and go out the same way — Treezle's flat array maps 1:1 to an OutSystems Entity.

---

## Browser Support

All modern browsers. No IE11. Life is too short.

---

## License

MIT — [Micha Sulman](https://github.com/michasulman), 2026

