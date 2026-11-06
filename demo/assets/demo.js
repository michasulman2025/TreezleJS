/* Standalone component lab for the public TreeView API. */
(function (global) {
  "use strict";
  var api = global.TreezleOutSystems;
  var pending = new Map(), requestSequence = 0;
  function invokeNative(invoke) {
    var requestId = "treezle-request-" + (++requestSequence);
    return new Promise(function (resolve, reject) {
      pending.set(requestId, { resolve: resolve, reject: reject });
      Promise.resolve().then(function () { return invoke(requestId); }).then(function () {
        if (pending.has(requestId)) { pending.delete(requestId); reject(new Error("The demo handler did not return its client-action result.")); }
      }).catch(function (error) { pending.delete(requestId); reject(error); });
    });
  }
  function resolveRequest(requestId, success, resultJSON, errorMessage) {
    var request = pending.get(requestId);
    if (request) { pending.delete(requestId); request.resolve({ Success: success, ResultJSON: resultJSON, ErrorMessage: errorMessage }); }
  }
  var defaults = { theme: "minimal", multiSelect: true, allowInlineRename: true, showIcons: true, showCheckBoxes: false, menuStyle: "EllipsisButton1", indentPx: 20, styleClass: "" };
  var commands = [{ name: "inspect", label: "Inspect node", icon: "td-glyph-info" }, { name: "review", label: "Mark reviewed", icon: "td-glyph-file" }, { name: "addChild", label: "Add child", nodeType: "folder", icon: "td-glyph-folder" }];
  function sampleNodes() {
    return [
      { id: "workspace", label: "My workspace", nodeType: "folder", isExpanded: true },
      { id: "projects", parentId: "workspace", label: "Projects", nodeType: "folder", isExpanded: true },
      { id: "roadmap", parentId: "projects", label: "Product roadmap and planning for the next release", nodeType: "item" },
      { id: "design", parentId: "projects", label: "Design guidelines", nodeType: "item" },
      { id: "documents", parentId: "workspace", label: "Documents", nodeType: "folder", isExpanded: true },
      { id: "manual", parentId: "documents", label: "Getting started with Treezle in OutSystems Reactive Web", nodeType: "item" },
      { id: "archive", parentId: "workspace", label: "Archive", nodeType: "folder" },
      { id: "previous", parentId: "archive", label: "Previous releases", nodeType: "item" }
    ].map(function (n) { return Object.assign({ isDraggable: true, showCheckBox: true, icon: n.nodeType === "folder" ? "td-glyph-folder" : "td-glyph-file" }, n); });
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function pretty(value) { return JSON.stringify(value, null, 2); }
  function destroy(host) {
    if (!host || !host._treezleLab) return;
    var state = host._treezleLab; state.disposed = true;
    state.cleanups.forEach(function (fn) { fn(); });
    state.treeIds.forEach(function (id) { if (document.getElementById(id)) api.call("destroy", { ElementId: id }); });
    delete host._treezleLab;
  }
  async function mount(host, callbacks) {
    if (!host) return;
    destroy(host); host.replaceChildren(); host.classList.add("td-shell"); host.dataset.layout = "split";
    var state = { treeIds: [], cleanups: [], disposed: false, used: new Set(), options: Object.assign({}, defaults), count: 0 };
    host._treezleLab = state; callbacks = callbacks || {};
    var treeHost, coverage, nodeChoice, status, apiResult, apiFields, methodChoice, description, eventList, eventOutput;
    var queue = Promise.resolve();
    function fail(error) { if (!state.disposed) { status.textContent = "Action failed"; status.dataset.kind = "error"; apiResult.textContent = error.message || String(error); } }
    function button(parent, text, fn, cls) { var b = el("button", cls || "td-button", text); b.type = "button"; b.addEventListener("click", function () { Promise.resolve().then(fn).catch(fail); }); parent.appendChild(b); return b; }
    function run(method, args, quiet) {
      args = Object.assign({ ElementId: treeHost.id }, args);
      var job = queue.then(async function () {
        if (state.disposed) return null;
        var result;
        if (callbacks[method]) {
          var nativeResult = await callbacks[method](args);
          var fields = Object.create(null);
          Object.keys(nativeResult || {}).forEach(function (key) { fields[key.toLowerCase()] = nativeResult[key]; });
          if (!fields.success) throw new Error(fields.errormessage || "Client action failed.");
          result = JSON.parse(fields.resultjson || "null");
        } else result = api.call(method, args);
        if (state.disposed) { if (method === "initialize" && document.getElementById(args.ElementId)) api.call("destroy", args); return result; }
        state.used.add(method); coverage.textContent = state.used.size + " / " + api.actions.length + " actions exercised";
        if (!quiet) { status.textContent = method + "() completed"; status.dataset.kind = "success"; apiResult.textContent = pretty(result); }
        return result;
      });
      queue = job.catch(function () {}); return job;
    }
    state.run = run;
    function select(parent, title, entries, change) {
      var label = el("label", "td-field", title), input = el("select", "td-select");
      input.setAttribute("aria-label", title);
      entries.forEach(function (x) { var o = el("option", "", x[1]); o.value = x[0]; input.appendChild(o); });
      input.addEventListener("change", function () { Promise.resolve(change(input.value)).catch(fail); }); label.appendChild(input); parent.appendChild(label); return input;
    }
    var hero = el("div", "td-hero"), heroText = el("div");
    heroText.append(el("span", "td-eyebrow", "COMPONENT LAB"), el("h2", "td-lab-title", "A tree for every workflow."), el("p", "td-lab-subtitle", "Explore layouts, tune the behavior, and try every client action."));
    coverage = el("div", "td-coverage", "0 / 17 actions exercised"); hero.append(heroText, coverage);
    var presets = el("div", "td-presets"), presetButtons = [];
    [["workspace", "File explorer", "Folders, drag & drop, inline rename"], ["tasks", "Task checklist", "Checkboxes and multiple selection"], ["navigation", "Navigation", "Clean, read-only navigation"], ["permissions", "Node states", "Disabled, hidden and protected nodes"]].forEach(function (p) {
      var b = button(presets, "", function () { return preset(p[0]); }, "td-preset"); b.dataset.preset = p[0]; b.setAttribute("aria-pressed", "false"); b.append(el("strong", "", p[1]), el("span", "", p[2])); presetButtons.push(b);
    });
    var toolbar = el("div", "td-toolbar"); toolbar.appendChild(el("div", "td-brand", "Live playground"));
    button(toolbar, "Expand all", async function () { var nodes = await run("getNodes", {}, true); for (var n of nodes) await run("expand", { NodeId: n.id }, true); });
    button(toolbar, "Collapse all", async function () { var nodes = await run("getNodes", {}, true); for (var n of nodes) await run("collapse", { NodeId: n.id }, true); });
    button(toolbar, "Reset", function () { return preset(state.preset || "workspace"); });
    select(toolbar, "Layout", [["split", "Split view"], ["stacked", "Stacked"], ["compact", "Compact sidebar"], ["gallery", "Theme gallery"]], function (v) { host.dataset.layout = v; });
    var body = el("div", "td-body"), panel = el("section", "td-tree-panel"), treeTitle = el("div", "td-panel-heading", "Workspace"), frame = el("div", "td-tree-frame");
    treeHost = el("div"); treeHost.id = host.id + "_tree"; state.treeIds.push(treeHost.id); frame.appendChild(treeHost);
    panel.append(treeTitle, frame, el("p", "td-hint td-tree-hint", "Use arrow keys, Home and End to navigate; Enter or Space selects. Ctrl+click selects multiple nodes; double-click to rename."));
    var controls = el("section", "td-controls"); controls.appendChild(el("div", "td-panel-heading", "Make it yours"));
    var optionGrid = el("div", "td-options-grid"), optionInputs = {}; controls.appendChild(optionGrid);
    async function option(key, value) { var patch = {}; patch[key] = value; await run("setOptions", { OptionsJSON: pretty(patch) }); state.options[key] = value; }
    optionInputs.theme = select(optionGrid, "Theme", [["minimal", "Minimal"], ["explorer", "Explorer"], ["border", "Border"]], function (v) { return option("theme", v); });
    optionInputs.menuStyle = select(optionGrid, "Context menu", [["None", "None"], ["RightClick", "Right click"], ["EllipsisButton1", "Always show dots"], ["EllipsisButton2", "Dots on hover"]], function (v) { return option("menuStyle", v); });
    select(optionGrid, "Width", [["100%", "Fill parent"], ["360px", "360 px"], ["240px", "240 px"]], function (v) { frame.style.width = v; });
    optionInputs.indentPx = select(optionGrid, "Indentation", [["12", "12 px"], ["20", "20 px"], ["28", "28 px"], ["36", "36 px"]], function (v) { return option("indentPx", Number(v)); });
    optionInputs.styleClass = select(optionGrid, "Selection accent", [["", "Theme default"], ["td-accent-warm", "Warm orange"], ["td-accent-blue", "Soft blue"]], function (v) { return option("styleClass", v); });
    var switches = el("div", "td-switches"); controls.appendChild(switches);
    [["showIcons", "Icons"], ["showCheckBoxes", "Checkboxes"], ["multiSelect", "Multi-select"], ["allowInlineRename", "Inline rename"]].forEach(function (x) {
      var label = el("label", "td-switch"), input = el("input"); input.type = "checkbox"; input.checked = !!state.options[x[0]]; optionInputs[x[0]] = input;
      input.addEventListener("change", function () { option(x[0], input.checked).catch(fail); }); label.append(el("span", "", x[1]), input); switches.appendChild(label);
    });
    var nodeTools = el("div", "td-node-tools"), nodeButtons = el("div", "td-node-buttons"); nodeChoice = select(nodeTools, "Target node", [], function () {});
    [["Expand", "expand"], ["Collapse", "collapse"], ["Select", "selectNode"], ["Toggle selection", "toggleSelect"]].forEach(function (x) { button(nodeButtons, x[0], function () { return run(x[1], { NodeId: nodeChoice.value }); }); });
    button(nodeButtons, "Add child", async function () { await run("addNode", { ParentId: nodeChoice.value, NodeJSON: pretty({ id: "new-" + (++state.count), label: "New item " + state.count, icon: "td-glyph-file", showCheckBox: true, isDraggable: true }) }); await refreshNodes(); });
    button(nodeButtons, "Rename via API", function () { return run("editNode", { NodeJSON: pretty({ id: nodeChoice.value, label: "Updated item " + (++state.count) }) }).then(refreshNodes); });
    button(nodeButtons, "Delete subtree", function () { return run("deleteNode", { NodeId: nodeChoice.value }).then(refreshNodes); }, "td-button td-button-danger");
    nodeTools.appendChild(nodeButtons); controls.appendChild(nodeTools); body.append(panel, controls);
    var gallery = el("section", "td-gallery"), cards = el("div", "td-gallery-cards"); gallery.append(el("div", "td-panel-heading", "Same data. Three visual styles."), cards);
    ["minimal", "explorer", "border"].forEach(function (theme, i) { var card = el("article", "td-gallery-card"), mount = el("div"); mount.id = host.id + "_gallery_" + theme; state.treeIds.push(mount.id); card.append(el("h3", "", theme.charAt(0).toUpperCase() + theme.slice(1)), el("p", "td-hint", ["Quiet and content-first.", "Familiar file explorer selection.", "A defined boundary around the tree."][i]), mount); cards.appendChild(card); });
    var lower = el("div", "td-lower"), apiPanel = el("section", "td-api-panel");
    apiPanel.append(el("div", "td-panel-heading", "API workbench"), el("p", "td-hint", "Call the TreeView API with your own input. Results stay here; events appear alongside."));
    methodChoice = select(apiPanel, "API method", api.actions.map(function (a) { return [a.method, a.method + "()"]; }), function () { renderFields(); }); methodChoice.classList.add("td-api-method");
    description = el("p", "td-api-description"); apiFields = el("div", "td-api-fields"); var apiButtons = el("div", "td-api-buttons");
    button(apiButtons, "Run action", async function () { var args = {}; apiFields.querySelectorAll("[data-argument]").forEach(function (input) { args[input.dataset.argument] = input.type === "checkbox" ? input.checked : input.value; }); await run(methodChoice.value, args); if (["setNodes", "addNode", "deleteNode", "editNode", "initialize"].indexOf(methodChoice.value) >= 0) await refreshNodes(); }, "td-button td-button-primary");
    button(apiButtons, "Restore sample input", renderFields);
    status = el("p", "td-status", "Ready"); status.setAttribute("role", "status"); apiResult = el("pre", "td-output td-api-result", "Run an action to see its return value."); apiResult.setAttribute("aria-label", "Client action result");
    apiPanel.append(description, apiFields, apiButtons, status, apiResult);
    var inspector = el("section", "td-inspector"), eventHeading = el("div", "td-event-heading"); eventHeading.appendChild(el("div", "td-panel-heading", "Live events"));
    button(eventHeading, "Clear", function () { eventList.replaceChildren(); eventOutput.textContent = "No event selected."; });
    eventList = el("div", "td-event-list"); eventList.setAttribute("aria-label", "Tree event history"); eventOutput = el("pre", "td-output td-event-output", "Interact with the tree to inspect an event payload."); eventOutput.setAttribute("aria-label", "Latest tree event");
    inspector.append(eventHeading, el("p", "td-hint", "All 16 events are observed. On / Off manage a separate named subscription; its deliveries are marked SUB."), eventList, eventOutput); lower.append(apiPanel, inspector);
    host.append(hero, presets, toolbar, body, gallery, lower);
    function watch(name, handler) { treeHost.addEventListener(name, handler); state.cleanups.push(function () { treeHost.removeEventListener(name, handler); }); }
    function record(name, detail, subscription) {
      if (state.disposed) return;
      var payload = pretty(detail), item = button(eventList, "", function () { eventOutput.textContent = payload; }, "td-event-item");
      item.append(el("span", subscription ? "td-event-tag td-event-tag-sub" : "td-event-tag", subscription ? "SUB" : "EVENT"), el("span", "", name)); eventList.prepend(item);
      while (eventList.children.length > 30) eventList.lastChild.remove(); eventOutput.textContent = payload;
      if (callbacks.onEvent) Promise.resolve(callbacks.onEvent(name, payload)).catch(fail);
    }
    api.events.forEach(function (name) { watch("treezle:" + name, function (e) { record(name, e.detail, false); }); }); watch("treezle:apiEvent", function (e) { record(e.detail.eventName + " / " + e.detail.listenerId, e.detail, true); });
    watch("treezle:onCommand", function (e) {
      var d = e.detail;
      if (d.commandName === "review") run("editNode", { NodeJSON: pretty({ id: d.node.id, label: d.node.label + " (reviewed)" }) }).then(refreshNodes).catch(fail);
      if (d.commandName === "addChild") run("addNode", { ParentId: d.node.id, NodeJSON: pretty({ id: "menu-" + (++state.count), label: "New item " + state.count, icon: "td-glyph-file", showCheckBox: true }) }).then(refreshNodes).catch(fail);
    });
    async function refreshNodes() {
      if (!api.call("getInstance", { ElementId: treeHost.id }).found) return;
      var nodes = await run("getNodes", {}, true); if (state.disposed || !nodes) return;
      var selected = nodeChoice.value; nodeChoice.replaceChildren();
      nodes.forEach(function (n) { var o = el("option", "", n.label + " (" + n.id + ")"); o.value = n.id; nodeChoice.appendChild(o); }); nodeChoice.value = nodes.some(function (n) { return n.id === selected; }) ? selected : (nodes[0] && nodes[0].id || "");
    }
    async function preset(name) {
      state.preset = name; var nodes = sampleNodes(); state.options = Object.assign({}, defaults);
      if (name === "tasks") { state.options.showCheckBoxes = true; state.options.theme = "border"; state.options.menuStyle = "None"; nodes.forEach(function (n, i) { n.isDraggable = false; n.isChecked = i === 2 || i === 3; }); }
      if (name === "navigation") { state.options.multiSelect = false; state.options.allowInlineRename = false; state.options.menuStyle = "None"; nodes.forEach(function (n) { n.isReadOnly = true; n.isDraggable = false; }); }
      if (name === "permissions") { state.options.showCheckBoxes = true; state.options.theme = "explorer"; nodes.find(function (n) { return n.id === "archive"; }).isDisabled = true; nodes.find(function (n) { return n.id === "design"; }).isReadOnly = true; nodes.find(function (n) { return n.id === "documents"; }).isDropTarget = false; nodes.find(function (n) { return n.id === "roadmap"; }).cssClass = "td-important"; nodes.push({ id: "hidden", parentId: "workspace", label: "Hidden node (visible through GetNodes)", isVisible: false }); }
      if (!api.call("getInstance", { ElementId: treeHost.id }).found) await run("initialize", { NodesJSON: pretty(nodes), OptionsJSON: pretty(state.options), CommandsJSON: pretty(commands) }, true);
      else { await run("setNodes", { NodesJSON: pretty(nodes) }, true); await run("setOptions", { OptionsJSON: pretty(state.options) }, true); await run("setCommands", { CommandsJSON: pretty(commands) }, true); }
      Object.keys(state.options).forEach(function (key) { var input = optionInputs[key]; if (input) { if (input.type === "checkbox") input.checked = !!state.options[key]; else input.value = String(state.options[key]); } }); await refreshNodes();
      presetButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.preset === name)); }); treeTitle.textContent = { workspace: "Workspace", tasks: "Task checklist", navigation: "Navigation", permissions: "Node states" }[name]; status.textContent = "Sample loaded. Changes stay in memory for this session."; status.dataset.kind = "success";
    }
    function renderFields() {
      var action = api.actions.find(function (a) { return a.method === methodChoice.value; }); description.textContent = action.description; apiFields.replaceChildren();
      var values = { ElementId: treeHost.id, NodeId: nodeChoice.value || "projects", ParentId: "projects", NodesJSON: pretty(sampleNodes()), OptionsJSON: pretty(state.options), CommandsJSON: pretty(commands), NodeJSON: pretty(action.method === "editNode" ? { id: nodeChoice.value || "projects", label: "Updated via client action" } : { id: "api-" + (++state.count), label: "Added via client action", icon: "td-glyph-file", showCheckBox: true, isDraggable: true }), EventName: "onNodeClick", ListenerId: "demo-listener", CancelDefault: false };
      action.inputs.forEach(function (name) {
        var label = el("label", "td-field", name), input;
        if (name === "EventName") { input = el("select", "td-select"); api.events.forEach(function (n) { var o = el("option", "", n); o.value = n; input.appendChild(o); }); }
        else if (name === "CancelDefault") { input = el("input"); input.type = "checkbox"; }
        else { input = el(name.endsWith("JSON") ? "textarea" : "input", "td-input"); if (input.tagName === "TEXTAREA") input.rows = 6; }
        input.dataset.argument = name; input.setAttribute("aria-label", name); if (input.type === "checkbox") input.checked = values[name]; else input.value = values[name]; label.appendChild(input); apiFields.appendChild(label);
      });
    }
    methodChoice.value = "getNodes"; await preset("workspace");
    for (var theme of ["minimal", "explorer", "border"]) await run("initialize", { ElementId: host.id + "_gallery_" + theme, NodesJSON: pretty(sampleNodes().slice(0, 6)), OptionsJSON: pretty({ theme: theme, showIcons: true, showCheckBoxes: theme === "border", menuStyle: "EllipsisButton2" }), CommandsJSON: pretty(commands) }, true);
    renderFields(); return state;
  }
  global.TreezleDemo = { mount: mount, destroy: destroy, sampleNodes: sampleNodes, invokeNative: invokeNative, resolveRequest: resolveRequest };
})(window);
