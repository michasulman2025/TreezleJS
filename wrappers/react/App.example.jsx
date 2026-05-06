/**
 * App.jsx — Example usage of the Treezle React wrapper
 *
 * Setup:
 *   1. Add to index.html:  <script src="/treezle.js"></script>
 *   2. Add to index.css:   @import "./treezle.css";
 *   3. Drop TreeView.jsx next to this file
 */

import { useState } from "react";
import TreeView from "./TreeView";

const INITIAL_NODES = [
  { id: "1", parentId: null, label: "Documents",   nodeType: "folder", isExpanded: true },
  { id: "2", parentId: "1",  label: "Reports",     nodeType: "folder", isExpanded: false },
  { id: "3", parentId: "1",  label: "readme.txt",  nodeType: "file" },
  { id: "4", parentId: "2",  label: "Q1 2026.pdf", nodeType: "file" },
  { id: "5", parentId: "2",  label: "Q2 2026.pdf", nodeType: "file" },
];

const COMMANDS = [
  { name: "rename", label: "Rename", nodeType: "",       show: true },
  { name: "delete", label: "Delete", nodeType: "file",   show: true },
  { name: "add",    label: "Add child", nodeType: "folder", show: true },
];

const OPTIONS = {
  theme:             "minimal",
  multiSelect:       false,
  allowInlineRename: true,
  menuStyle:         "RightClick",
  showIcons:         false,
};

export default function App() {
  const [nodes, setNodes]   = useState(INITIAL_NODES);
  const [lastEvent, setLastEvent] = useState(null);

  const handleNodeClick = (node) => {
    setLastEvent(`Clicked: ${node.label}`);
  };

  const handleNodeRename = (node, oldLabel, newLabel) => {
    setLastEvent(`Renamed: "${oldLabel}" → "${newLabel}"`);
    setNodes(prev =>
      prev.map(n => n.id === node.id ? { ...n, label: newLabel } : n)
    );
  };

  const handleCommand = (node, commandName) => {
    setLastEvent(`Command: ${commandName} on "${node.label}"`);

    if (commandName === "delete") {
      setNodes(prev => prev.filter(n => n.id !== node.id));
    }
  };

  const handleNodeMoved = (node, fromParentId, toParentId, updatedNodes) => {
    setLastEvent(`Moved: "${node.label}" → parent ${toParentId}`);
    setNodes(updatedNodes); // Treezle returns the full updated array
  };

  return (
    <div style={{ display: "flex", gap: 24, padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ width: 280 }}>
        <h3 style={{ marginBottom: 8 }}>Treezle in React</h3>
        <TreeView
          nodes={nodes}
          options={OPTIONS}
          commands={COMMANDS}
          onNodeClick={handleNodeClick}
          onNodeRename={handleNodeRename}
          onCommand={handleCommand}
          onNodeMoved={handleNodeMoved}
          style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: 4 }}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: 8 }}>Last event</h3>
        <code style={{ fontSize: 13, color: "#374151" }}>
          {lastEvent ?? "—"}
        </code>
      </div>
    </div>
  );
}
