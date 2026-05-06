/**
 * treezle.component.ts — Angular wrapper for Treezle
 *
 * Usage in a module:
 *   import { TreezleComponent } from "./treezle/treezle.component";
 *   @NgModule({ declarations: [TreezleComponent], ... })
 *
 * Usage in a template:
 *   <app-treezle
 *     [nodes]="myNodes"
 *     [options]="myOptions"
 *     [commands]="myCommands"
 *     (nodeClick)="onNodeClick($event)"
 *     (command)="onCommand($event)"
 *   ></app-treezle>
 *
 * Prerequisites:
 *   - treezle.js loaded globally (angular.json → projects.architect.build.scripts)
 *   - treezle.css loaded globally (angular.json → projects.architect.build.styles)
 *   - Add `declare const TreeView: any;` or use the Window interface below
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
  ElementRef,
  ViewChild,
  NgZone,
} from "@angular/core";

// ─── Node / Options / Command types ──────────────────────────────────────────

export interface TreeNode {
  id:           string | number;
  parentId:     string | number | null;
  label:        string;
  nodeType?:    string;
  isReadOnly?:  boolean;
  isDraggable?: boolean;
  isExpanded?:  boolean;
  isSelected?:  boolean;
  isDisabled?:  boolean;
  isVisible?:   boolean;
  isChecked?:   boolean;
  showCheckBox?:boolean;
  cssClass?:    string;
  icon?:        string;
  data?:        Record<string, unknown>;
}

export interface TreeOptions {
  multiSelect?:       boolean;
  allowInlineRename?: boolean;
  indentPx?:          number;
  showIcons?:         boolean;
  showCheckBoxes?:    boolean;
  menuStyle?:         "None" | "RightClick" | "EllipsisButton1" | "EllipsisButton2";
  styleClass?:        string;
  theme?:             "minimal" | "explorer";
}

export interface TreeCommand {
  name:      string;
  label:     string;
  nodeType?: string;
  icon?:     string;
  show?:     boolean;
}

export interface NodeClickEvent      { node: TreeNode; }
export interface NodeSelectEvent     { node: TreeNode; selectedIds: (string|number)[]; }
export interface NodeRenameEvent     { node: TreeNode; oldLabel: string; newLabel: string; }
export interface NodeMovedEvent      { node: TreeNode; fromParentId: string|number|null; toParentId: string|number|null; nodes: TreeNode[]; }
export interface CommandEvent        { node: TreeNode; commandName: string; }
export interface CheckChangedEvent   { node: TreeNode; isChecked: boolean; }
export interface DropRejectedEvent   { reason: string; draggedNode: TreeNode; targetNode: TreeNode; }

// Tell TypeScript that window.TreeView exists
declare global {
  interface Window { TreeView: new (el: HTMLElement, nodes: TreeNode[], options: TreeOptions, commands: TreeCommand[]) => TreezleInstance; }
}

interface TreezleInstance {
  setNodes(nodes: TreeNode[]): void;
  setOptions(options: TreeOptions): void;
  setCommands(commands: TreeCommand[]): void;
  getNodes(): TreeNode[];
  getChangedNodes(): TreeNode[];
  expand(id: string | number): void;
  collapse(id: string | number): void;
  selectNode(id: string | number): void;
  on(event: string, handler: (detail: unknown) => void): void;
  off(event: string, handler: (detail: unknown) => void): void;
  destroy(): void;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: "app-treezle",
  template: `<div #container></div>`,
  // Styles are global (treezle.css) — no encapsulation needed
})
export class TreezleComponent implements AfterViewInit, OnChanges, OnDestroy {

  @ViewChild("container", { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  @Input() nodes:    TreeNode[]    = [];
  @Input() options:  TreeOptions   = {};
  @Input() commands: TreeCommand[] = [];

  // Events
  @Output() nodeClick      = new EventEmitter<NodeClickEvent>();
  @Output() nodeSelect     = new EventEmitter<NodeSelectEvent>();
  @Output() nodeExpand     = new EventEmitter<{ node: TreeNode }>();
  @Output() nodeCollapse   = new EventEmitter<{ node: TreeNode }>();
  @Output() nodeRename     = new EventEmitter<NodeRenameEvent>();
  @Output() startDrag      = new EventEmitter<{ node: TreeNode }>();
  @Output() nodeMoved      = new EventEmitter<NodeMovedEvent>();
  @Output() dropNode       = new EventEmitter<{ draggedNode: TreeNode; targetNode: TreeNode; nodes: TreeNode[] }>();
  @Output() dropRejected   = new EventEmitter<DropRejectedEvent>();
  @Output() command        = new EventEmitter<CommandEvent>();
  @Output() checkChanged   = new EventEmitter<CheckChangedEvent>();

  private tree: TreezleInstance | null = null;

  // Keep track of DOM listeners for cleanup
  private domListeners: { event: string; fn: EventListener }[] = [];

  constructor(private ngZone: NgZone) {}

  // ── AfterViewInit: create instance ─────────────────────────────────────────

  ngAfterViewInit(): void {
    if (!window.TreeView) {
      console.warn("Treezle: window.TreeView not found. Make sure treezle.js is loaded globally.");
      return;
    }

    // Run outside Angular zone — Treezle manages its own DOM updates
    this.ngZone.runOutsideAngular(() => {
      this.tree = new window.TreeView(
        this.containerRef.nativeElement,
        this.nodes,
        this.options,
        this.commands
      );
      this.bindEvents();
    });
  }

  // ── OnChanges: sync inputs ──────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.tree) return;

    if (changes["nodes"])    this.tree.setNodes(this.nodes);
    if (changes["options"])  this.tree.setOptions(this.options);
    if (changes["commands"]) this.tree.setCommands(this.commands);
  }

  // ── OnDestroy: cleanup ──────────────────────────────────────────────────────

  ngOnDestroy(): void {
    const el = this.containerRef.nativeElement;
    this.domListeners.forEach(({ event, fn }) => el.removeEventListener(event, fn));
    this.domListeners = [];
    this.tree?.destroy();
    this.tree = null;
  }

  // ── Public imperative API ───────────────────────────────────────────────────

  expand(id: string | number)      { this.tree?.expand(id); }
  collapse(id: string | number)    { this.tree?.collapse(id); }
  selectNode(id: string | number)  { this.tree?.selectNode(id); }
  getNodes(): TreeNode[]           { return this.tree?.getNodes() ?? []; }
  getChangedNodes(): TreeNode[]    { return this.tree?.getChangedNodes() ?? []; }

  // ── Event binding ───────────────────────────────────────────────────────────

  private bindEvents(): void {
    const el = this.containerRef.nativeElement;

    const bind = (eventName: string, emitter: EventEmitter<unknown>) => {
      const fn: EventListener = (e: Event) => {
        // Re-enter Angular zone so change detection triggers
        this.ngZone.run(() => emitter.emit((e as CustomEvent).detail));
      };
      el.addEventListener(`treezle:${eventName}`, fn);
      this.domListeners.push({ event: `treezle:${eventName}`, fn });
    };

    bind("onNodeClick",        this.nodeClick      as EventEmitter<unknown>);
    bind("onNodeSelect",       this.nodeSelect     as EventEmitter<unknown>);
    bind("onNodeExpand",       this.nodeExpand     as EventEmitter<unknown>);
    bind("onNodeCollapse",     this.nodeCollapse   as EventEmitter<unknown>);
    bind("onNodeRename",       this.nodeRename     as EventEmitter<unknown>);
    bind("onStartDrag",        this.startDrag      as EventEmitter<unknown>);
    bind("onNodeMoved",        this.nodeMoved      as EventEmitter<unknown>);
    bind("onDropNode",         this.dropNode       as EventEmitter<unknown>);
    bind("onDropRejected",     this.dropRejected   as EventEmitter<unknown>);
    bind("onCommand",          this.command        as EventEmitter<unknown>);
    bind("onCheckChanged",     this.checkChanged   as EventEmitter<unknown>);
  }
}
