/**
 * TreeView.jsx — React wrapper for Treezle
 *
 * Usage:
 *   import TreeView from "./TreeView";
 *
 *   <TreeView
 *     nodes={nodes}
 *     options={{ theme: "minimal", multiSelect: true }}
 *     commands={commands}
 *     onNodeClick={(node) => console.log(node)}
 *     onCommand={(node, commandName) => console.log(commandName, node)}
 *   />
 *
 * Prerequisites:
 *   - treezle.js loaded globally (via index.html <script> or import)
 *   - treezle.css imported once at app root (e.g. in App.jsx or index.css)
 */

import { useEffect, useRef, useCallback } from "react";

// ─── Event map: prop name → treezle event name ───────────────────────────────

const EVENT_MAP = {
  onNodeClick:         "onNodeClick",
  onNodeSelect:        "onNodeSelect",
  onNodeExpand:        "onNodeExpand",
  onNodeCollapse:      "onNodeCollapse",
  beforeNodeExpand:    "beforeNodeExpand",
  beforeNodeCollapse:  "beforeNodeCollapse",
  onNodeRename:        "onNodeRename",
  onStartDrag:         "onStartDrag",
  onNodeMoved:         "onNodeMoved",
  onDropNode:          "onDropNode",
  onDropRejected:      "onDropRejected",
  onCommand:           "onCommand",
  onCheckChanged:      "onCheckChanged",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TreeView({
  nodes      = [],
  options    = {},
  commands   = [],
  className  = "",
  style      = {},

  // Event handler props
  onNodeClick,
  onNodeSelect,
  onNodeExpand,
  onNodeCollapse,
  beforeNodeExpand,
  beforeNodeCollapse,
  onNodeRename,
  onStartDrag,
  onNodeMoved,
  onDropNode,
  onDropRejected,
  onCommand,
  onCheckChanged,
}) {
  const containerRef = useRef(null);
  const treeRef      = useRef(null);

  // Collect handlers into a stable ref so effects don't re-run on every render
  const handlersRef = useRef({});
  handlersRef.current = {
    onNodeClick, onNodeSelect, onNodeExpand, onNodeCollapse,
    beforeNodeExpand, beforeNodeCollapse, onNodeRename, onStartDrag,
    onNodeMoved, onDropNode, onDropRejected, onCommand, onCheckChanged,
  };

  // ── Mount: create TreeView instance ────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || !window.TreeView) {
      console.warn("Treezle: window.TreeView not found. Make sure treezle.js is loaded.");
      return;
    }

    const instance = new window.TreeView(
      containerRef.current,
      nodes,
      options,
      commands
    );
    treeRef.current = instance;

    // Wire up all events via DOM CustomEvents
    const listeners = {};
    Object.entries(EVENT_MAP).forEach(([propName, eventName]) => {
      const handler = (e) => {
        const fn = handlersRef.current[propName];
        if (typeof fn === "function") {
          // Spread detail so callers get (node, commandName) etc. naturally
          const { node, commandName, ...rest } = e.detail || {};
          if (propName === "onCommand") {
            fn(node, commandName);
          } else {
            fn(node ?? rest, rest);
          }
        }
      };
      listeners[eventName] = handler;
      containerRef.current.addEventListener(`treezle:${eventName}`, handler);
    });

    // Cleanup on unmount
    return () => {
      Object.entries(listeners).forEach(([eventName, handler]) => {
        containerRef.current?.removeEventListener(`treezle:${eventName}`, handler);
      });
      treeRef.current?.destroy?.();
      treeRef.current = null;
    };
  }, []); // Only runs on mount/unmount — intentional

  // ── Update nodes when prop changes ─────────────────────────────────────────
  useEffect(() => {
    treeRef.current?.setNodes(nodes);
  }, [nodes]);

  // ── Update options when prop changes ───────────────────────────────────────
  useEffect(() => {
    treeRef.current?.setOptions(options);
  }, [options]);

  // ── Update commands when prop changes ──────────────────────────────────────
  useEffect(() => {
    treeRef.current?.setCommands(commands);
  }, [commands]);

  // ── Expose instance via ref (optional, for imperative access) ──────────────
  // Usage: const treeRef = useRef(); <TreeView instanceRef={treeRef} />
  // Then: treeRef.current.selectNode("42")

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
    />
  );
}
