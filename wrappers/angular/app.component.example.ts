/**
 * app.component.ts — Example usage of the Treezle Angular wrapper
 *
 * Setup:
 *   1. angular.json → projects.architect.build.scripts → add "src/treezle.js"
 *   2. angular.json → projects.architect.build.styles  → add "src/treezle.css"
 *   3. Declare TreezleComponent in your AppModule or a SharedModule
 */

import { Component } from "@angular/core";
import { TreeNode, TreeOptions, TreeCommand, CommandEvent, NodeRenameEvent, NodeMovedEvent } from "./treezle/treezle.component";

@Component({
  selector: "app-root",
  template: `
    <div class="demo-layout">
      <div class="demo-tree">
        <h3>Treezle in Angular</h3>

        <app-treezle
          [nodes]="nodes"
          [options]="options"
          [commands]="commands"
          (nodeClick)="onNodeClick($event)"
          (nodeRename)="onNodeRename($event)"
          (nodeMoved)="onNodeMoved($event)"
          (command)="onCommand($event)"
        ></app-treezle>
      </div>

      <div class="demo-log">
        <h3>Last event</h3>
        <code>{{ lastEvent || "—" }}</code>
      </div>
    </div>
  `,
  styles: [`
    .demo-layout { display: flex; gap: 24px; padding: 24px; font-family: sans-serif; }
    .demo-tree   { width: 280px; }
    h3           { margin-bottom: 8px; }
    app-treezle  { display: block; border: 1px solid #e5e7eb; border-radius: 4px; padding: 4px; }
    code         { font-size: 13px; color: #374151; }
  `],
})
export class AppComponent {

  lastEvent = "";

  nodes: TreeNode[] = [
    { id: "1", parentId: null, label: "Documents",    nodeType: "folder", isExpanded: true },
    { id: "2", parentId: "1",  label: "Reports",      nodeType: "folder", isExpanded: false },
    { id: "3", parentId: "1",  label: "readme.txt",   nodeType: "file" },
    { id: "4", parentId: "2",  label: "Q1 2026.pdf",  nodeType: "file" },
    { id: "5", parentId: "2",  label: "Q2 2026.pdf",  nodeType: "file" },
  ];

  options: TreeOptions = {
    theme:             "minimal",
    multiSelect:       false,
    allowInlineRename: true,
    menuStyle:         "RightClick",
  };

  commands: TreeCommand[] = [
    { name: "rename", label: "Rename",    nodeType: "",       show: true },
    { name: "delete", label: "Delete",    nodeType: "file",   show: true },
    { name: "add",    label: "Add child", nodeType: "folder", show: true },
  ];

  onNodeClick({ node }: { node: TreeNode }): void {
    this.lastEvent = `Clicked: ${node.label}`;
  }

  onNodeRename({ node, oldLabel, newLabel }: NodeRenameEvent): void {
    this.lastEvent = `Renamed: "${oldLabel}" → "${newLabel}"`;
    this.nodes = this.nodes.map(n =>
      n.id === node.id ? { ...n, label: newLabel } : n
    );
  }

  onCommand({ node, commandName }: CommandEvent): void {
    this.lastEvent = `Command: ${commandName} on "${node.label}"`;

    if (commandName === "delete") {
      this.nodes = this.nodes.filter(n => n.id !== node.id);
    }
  }

  onNodeMoved({ node, toParentId, nodes }: NodeMovedEvent): void {
    this.lastEvent = `Moved: "${node.label}" → parent ${toParentId}`;
    this.nodes = nodes; // Treezle returns the full updated array
  }
}
