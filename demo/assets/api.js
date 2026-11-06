/* Browser adapter for the complete public TreeView API. */
(function (global) {
  "use strict";
  var listeners = new WeakMap();
  var events = ["onNodeClick", "onNodeSelect", "onNodeExpand", "onNodeCollapse", "beforeNodeExpand", "beforeNodeCollapse", "onNodeRename", "onStartDrag", "onNodeMoved", "onDropNode", "onDropRejected", "onCommand", "onCheckChanged", "onNodeAdded", "onNodeDeleted", "onNodeChanged"];
  var actions = [
    ["Initialize", "initialize", ["NodesJSON", "OptionsJSON", "CommandsJSON"], "Create or replace a tree in a container."],
    ["SetNodes", "setNodes", ["NodesJSON"], "Replace all nodes with a flat JSON array."],
    ["SetOptions", "setOptions", ["OptionsJSON"], "Merge options and render the tree again."],
    ["SetCommands", "setCommands", ["CommandsJSON"], "Replace the context menu commands."],
    ["GetNodes", "getNodes", [], "Return all nodes as a flat JSON array."],
    ["GetChangedNodes", "getChangedNodes", [], "Return the nodes marked as changed by the component."],
    ["Expand", "expand", ["NodeId"], "Expand one node."],
    ["Collapse", "collapse", ["NodeId"], "Collapse one node."],
    ["SelectNode", "selectNode", ["NodeId"], "Select one node without firing a click event."],
    ["ToggleSelect", "toggleSelect", ["NodeId"], "Toggle a node selection using the current multi-select option."],
    ["AddNode", "addNode", ["ParentId", "NodeJSON"], "Add a node; use an empty ParentId for a root node."],
    ["DeleteNode", "deleteNode", ["NodeId"], "Delete a node and its descendants."],
    ["EditNode", "editNode", ["NodeJSON"], "Update the fields supplied in a partial node object."],
    ["On", "on", ["EventName", "ListenerId", "CancelDefault"], "Subscribe to an event. Payloads arrive as treezle:apiEvent DOM events. CancelDefault applies to before-expand/collapse events."],
    ["Off", "off", ["EventName", "ListenerId"], "Remove the listener registered with On; other listeners stay active."],
    ["GetInstance", "getInstance", [], "Check whether the container has a registered TreeView instance."],
    ["Destroy", "destroy", [], "Destroy the tree and remove its global listeners."]
  ].map(function (a) { return { name: "Treezle_" + a[0], method: a[1], inputs: ["ElementId"].concat(a[2]), description: a[3] }; });

  function json(value, fallback, shape) {
    var parsed = typeof value === "string" ? JSON.parse(value || JSON.stringify(fallback)) : (value == null ? fallback : value);
    if ((shape === "array" && !Array.isArray(parsed)) || (shape === "object" && (!parsed || Array.isArray(parsed) || typeof parsed !== "object"))) {
      throw new Error("Expected a JSON " + shape + ".");
    }
    return parsed;
  }
  function removeListeners(tree) {
    var map = listeners.get(tree);
    if (map) map.forEach(function (item) { tree.off(item.eventName, item.handler); });
    listeners.delete(tree);
  }
  function call(method, args) {
    args = args || {};
    if (!actions.some(function (a) { return a.method === method; })) throw new Error("Unknown Treezle API method.");
    var element = document.getElementById(args.ElementId);
    if (!element) throw new Error("Tree container not found: " + args.ElementId);
    var tree = global.TreeView.getInstance(args.ElementId);
    if (method === "getInstance") return { found: !!tree, elementId: args.ElementId };
    if (method === "destroy") {
      if (tree) { removeListeners(tree); tree.destroy(); }
      return { destroyed: !!tree };
    }
    if (method === "initialize") {
      // Parse before replacing the existing instance, so invalid JSON leaves it usable.
      var nodes = json(args.NodesJSON, [], "array");
      var options = json(args.OptionsJSON, {}, "object");
      var commands = json(args.CommandsJSON, [], "array");
      if (tree) { removeListeners(tree); tree.destroy(); }
      new global.TreeView(element, nodes, options, commands);
      return { initialized: true, nodeCount: nodes.length };
    }
    if (!tree) throw new Error("Initialize the tree before calling " + method + ".");
    if (["expand", "collapse", "selectNode", "toggleSelect", "deleteNode"].indexOf(method) !== -1 && !tree.getNodes().some(function (n) { return String(n.id) === String(args.NodeId); })) {
      throw new Error("Node not found: " + args.NodeId);
    }
    switch (method) {
      case "setNodes": tree.setNodes(json(args.NodesJSON, [], "array")); return { updated: true };
      case "setOptions": tree.setOptions(json(args.OptionsJSON, {}, "object")); return { updated: true };
      case "setCommands": tree.setCommands(json(args.CommandsJSON, [], "array")); return { updated: true };
      case "getNodes": return tree.getNodes();
      case "getChangedNodes": return tree.getChangedNodes();
      case "expand": case "collapse": case "selectNode": case "toggleSelect": tree[method](args.NodeId); return { nodeId: args.NodeId };
      case "addNode": {
        var added = tree.addNode(args.ParentId || null, json(args.NodeJSON, {}, "object"));
        if (!added) throw new Error("The parent node was not found.");
        return added;
      }
      case "deleteNode": return tree.deleteNode(args.NodeId);
      case "editNode": {
        var patch = json(args.NodeJSON, {}, "object");
        if (patch.id == null || !tree.getNodes().some(function (n) { return String(n.id) === String(patch.id); })) throw new Error("Supply the id of an existing node.");
        var edited = tree.editNode(patch);
        if (!edited) throw new Error("The node could not be updated.");
        return edited;
      }
      case "on": case "off": {
        if (events.indexOf(args.EventName) === -1) throw new Error("Unknown tree event: " + args.EventName);
        var map = listeners.get(tree);
        if (!map) { map = new Map(); listeners.set(tree, map); }
        var id = args.ListenerId || "default";
        var key = JSON.stringify([args.EventName, id]);
        var old = map.get(key);
        if (old) { tree.off(args.EventName, old.handler); map.delete(key); }
        if (method === "off") return { unsubscribed: !!old, eventName: args.EventName, listenerId: id };
        var handler = function (payload) {
          if (args.CancelDefault && typeof payload.preventDefault === "function") payload.preventDefault();
          element.dispatchEvent(new CustomEvent("treezle:apiEvent", { bubbles: true, detail: { eventName: args.EventName, listenerId: id, payload: payload } }));
        };
        map.set(key, { eventName: args.EventName, handler: handler });
        tree.on(args.EventName, handler);
        return { subscribed: true, eventName: args.EventName, listenerId: id };
      }
    }
  }
  global.TreezleOutSystems = { actions: actions, events: events, call: call };
})(window);
