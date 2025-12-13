"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
function formatKey(key) {
  const map = {
    cmd: "\u2318",
    ctrl: "\u2303",
    alt: "\u2325",
    shift: "\u21E7",
    up: "\u2191",
    down: "\u2193",
    left: "\u2190",
    right: "\u2192",
    enter: "\u21B5",
    tab: "\u21E5",
    backspace: "\u232B",
    esc: "\u238B",
    escape: "\u238B",
    space: "\u2423"
  };
  return key.split("+").map((p) => map[p.trim().toLowerCase()] || p.trim()).join(" ");
}
function validateHotkeys(data) {
  const errors = [];
  if (!Array.isArray(data)) {
    return ["Root must be array"];
  }
  data.forEach((item, i) => {
    if (typeof item !== "object" || item === null) {
      errors.push(`Item #${i} is not object`);
      return;
    }
    for (const f of ["group", "label", "key", "command"]) {
      if (typeof item[f] !== "string" || !item[f].trim()) {
        errors.push(`Item #${i} missiong/wrong '${f}'`);
      }
    }
    if (item.when !== void 0 && typeof item.when !== "string") {
      errors.push(`Item #${i} field 'when' wrong type`);
    }
  });
  return errors;
}
function normalizeWhen(when) {
  return when && when.trim() || "__GLOBAL__";
}
function collectDuplicateKeyWhen(items) {
  const map = /* @__PURE__ */ new Map();
  const dup = /* @__PURE__ */ new Set();
  for (const i of items) {
    const sig = i.key.trim().toLowerCase() + "||" + normalizeWhen(i.when);
    map.set(sig, (map.get(sig) || 0) + 1);
  }
  for (const [sig, count] of map) {
    if (count > 1) dup.add(sig);
  }
  return dup;
}
function activate(context) {
  const provider = new HotkeysProvider(context);
  vscode.window.createTreeView("hotkeysView", {
    treeDataProvider: provider
  });
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "hotkeys.importJson",
      () => provider.importJson()
    )
  );
  provider.loadFromStorage();
}
function deactivate() {
}
var HotkeysProvider = class {
  constructor(context) {
    this.context = context;
    this.storageFile = vscode.Uri.joinPath(
      context.globalStorageUri,
      "hotkeys.json"
    );
  }
  _onDidChangeTreeData = new vscode.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  items = [];
  duplicateSet = /* @__PURE__ */ new Set();
  storageFile;
  /* ===== Import JSON ===== */
  async importJson() {
    const uri = await vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: { JSON: ["json"] }
    });
    if (!uri) return;
    const bytes = await vscode.workspace.fs.readFile(uri[0]);
    const content = Buffer.from(bytes).toString("utf8");
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      vscode.window.showErrorMessage("JSON is invalid");
      return;
    }
    const schemaErrors = validateHotkeys(parsed);
    if (schemaErrors.length) {
      vscode.window.showWarningMessage(
        "Hotkeys JSON is errors:\n" + schemaErrors.slice(0, 5).join("\n")
      );
    }
    const items = parsed;
    const duplicates = collectDuplicateKeyWhen(items);
    if (duplicates.size) {
      vscode.window.showWarningMessage(
        "Shortcut is duplicate (key + when):\n" + Array.from(duplicates).slice(0, 5).map((s) => s.replace("||", " | when: ")).join("\n")
      );
    }
    await vscode.workspace.fs.createDirectory(this.context.globalStorageUri);
    await vscode.workspace.fs.writeFile(
      this.storageFile,
      Buffer.from(JSON.stringify(items, null, 2), "utf8")
    );
    this.items = items;
    this.duplicateSet = duplicates;
    this._onDidChangeTreeData.fire();
  }
  /* ===== Load persistent ===== */
  async loadFromStorage() {
    try {
      const bytes = await vscode.workspace.fs.readFile(this.storageFile);
      const content = Buffer.from(bytes).toString("utf8");
      this.items = JSON.parse(content);
      this.duplicateSet = collectDuplicateKeyWhen(this.items);
      this._onDidChangeTreeData.fire();
    } catch {
      this.items = [];
      this.duplicateSet.clear();
    }
  }
  /* ========================= */
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!element) {
      const groups = Array.from(new Set(this.items.map((i) => i.group)));
      return Promise.resolve(
        groups.map((g) => {
          const node = new HotkeyNode(
            g,
            vscode.TreeItemCollapsibleState.Collapsed
          );
          node.isGroup = true;
          node.group = g;
          return node;
        })
      );
    }
    if (element.isGroup && element.group) {
      return Promise.resolve(
        this.items.filter((i) => i.group === element.group).map((i) => {
          const sig = i.key.trim().toLowerCase() + "||" + normalizeWhen(i.when);
          const isDuplicate = this.duplicateSet.has(sig);
          const label = `( ${formatKey(i.key)} ) \u2192 ${i.label}`;
          const node = new HotkeyNode(
            label,
            vscode.TreeItemCollapsibleState.None
          );
          if (isDuplicate) {
            node.iconPath = new vscode.ThemeIcon(
              "error",
              new vscode.ThemeColor("errorForeground")
            );
            node.description = "DUPLICATE";
            node.tooltip = `Shortcut is dupicate
Key: ${i.key}
When: ${i.when || "global"}`;
          }
          return node;
        })
      );
    }
    return Promise.resolve([]);
  }
};
var HotkeyNode = class extends vscode.TreeItem {
  isGroup = false;
  group;
  constructor(label, collapsibleState) {
    super(label, collapsibleState);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
