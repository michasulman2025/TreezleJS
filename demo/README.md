# Treezle component lab

Open `index.html` directly in a modern browser. The committed distribution files make it usable without installing packages, running a build, starting a server or connecting to OutSystems.

The main demo uses `assets/api.js`, `assets/demo.js` and `assets/demo.css`. The original two-tree examples are available through **Basic examples** (`basic.html`).

## Explore

- Four scenarios: file explorer, task checklist, read-only navigation and node states.
- Four layouts: split view, stacked, compact sidebar and a gallery comparing all three themes.
- Minimal, explorer and border themes, with optional orange or blue selection accents.
- All four context-menu modes, optional icons and checkboxes, multi-selection, inline rename, indentation and container widths.
- Target-node controls for expansion, selection, adding, editing and deleting nodes.
- An API workbench with editable parameters and a separate result panel.
- A live inspector for all 16 component events and named subscription deliveries.

## API workbench

Choose a method, edit its parameters and select **Run action**. The workbench supports construction (`initialize`), `setNodes`, `setOptions`, `setCommands`, `getNodes`, `getChangedNodes`, `expand`, `collapse`, `selectNode`, `toggleSelect`, `addNode`, `deleteNode`, `editNode`, `on`, `off`, `getInstance` and `destroy`.

The `ElementId` field identifies the tree instance. The primary tree uses `treezle-demo_tree`. The theme gallery has independent instances named `treezle-demo_gallery_minimal`, `treezle-demo_gallery_explorer` and `treezle-demo_gallery_border`.

JSON fields accept an array or an object as indicated by the selected method. Invalid JSON produces a visible error while preserving the current tree. Node identifiers are supplied as text to preserve large numeric identifiers.

For On/Off, choose an event and a listener name. On registers a JavaScript handler and shows its deliveries with a **SUB** tag. Registering the same name again replaces that subscription; Off removes it without affecting the normal event inspector. `CancelDefault` applies to user-triggered `beforeNodeExpand` and `beforeNodeCollapse` events. Direct `expand()` and `collapse()` API calls follow the component's existing behavior and do not raise those events.

Destroy removes the selected tree. Initialize or a scenario preset creates it again. All data stays in browser memory; reloading restores the sample data.

## Regenerate distributions

From the repository root, run `node scripts/build.mjs` or `npm run build`. No package installation is required. This updates the browser IIFE, ES module and CSS files in `dist/`.
