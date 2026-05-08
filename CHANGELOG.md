# Changelog

All notable changes to Treezle will be documented here.  
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).


---

## [1.1.0] — 2026-05-08

### Added
- `deleteNode(id)` — removes a node and all its descendants. Fires `treezle:onNodeDeleted → { node, nodes[] }`
- `editNode(nodeData)` — merges a partial node object into an existing node by id. Only fields present in `nodeData` are updated. Fires `treezle:onNodeChanged → { node }`
- `addNode()` renamed from `AddNode()` to follow camelCase convention (consistent with rest of public API)
- `isDropTarget` added to node schema — set to `false` to reject drops onto a node
- `iconHover` added to command schema — alternative icon swapped in on context menu item hover
- `onNodeAdded`, `onNodeDeleted`, `onNodeChanged` added to event header docs

### Fixed
- `AddNode` renamed to `addNode` (camelCase)
- `btn.title = "Opties"` corrected to `"Options"`
- Escaped unicode `u2192` in JSDoc corrected to `→`
- `toggleSelect` JSDoc cleaned up
---

## [1.0.0] — 2026-05-06

### Added
- Initial public release 🌳
- Flat node array model — maps 1:1 to an OutSystems Entity or database table
- Full node schema: `id`, `parentId`, `label`, `nodeType`, `isReadOnly`, `isDraggable`, `isExpanded`, `isSelected`, `isDisabled`, `isVisible`, `isChecked`, `showCheckBox`, `cssClass`, `icon`, `data`
- Options: `multiSelect`, `allowInlineRename`, `indentPx`, `showIcons`, `showCheckBoxes`, `menuStyle`, `styleClass`, `theme`
- Context menu support: `RightClick`, `EllipsisButton1`, `EllipsisButton2`, `None`
- Drag & drop with circular-drop protection
- Inline rename (double-click, Enter to confirm, Escape to cancel)
- Multi-select via Ctrl+click
- Per-node checkboxes with global column reservation
- Themes: `minimal` and `explorer`
- Full DOM `CustomEvent` support with `treezle:` prefix — OutSystems compatible
- CSS variables for all theming — no hardcoded colors in JS
- Automatic dark mode via `prefers-color-scheme`
- React wrapper (`wrappers/react/TreeView.jsx`)
- Angular wrapper (`wrappers/angular/treezle.component.ts`) with full TypeScript types
- Zero dependencies — pure JS and CSS
- MIT License

---

<!-- 
  Template for future releases:

## [x.y.z] — YYYY-MM-DD

### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 
-->
