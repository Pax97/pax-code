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
  const keyMap = {
    cmd: "\u2318",
    alt: "\u2325",
    ctrl: "\u2303",
    shift: "\u21E7",
    up: "\u2191",
    down: "\u2193",
    left: "\u2190",
    right: "\u2192",
    enter: "\u21B5",
    tab: "\u21E5",
    backspace: "\u232B",
    space: "\u2423",
    escape: "\u238B",
    esc: "\u238B"
  };
  return key.split("+").map((part) => {
    const trimmed = part.trim().toLowerCase();
    return keyMap[trimmed] || part.trim();
  }).join(" ");
}
function activate(context) {
  const provider = new HotkeysProvider(context);
  const treeView = vscode.window.createTreeView("hotkeysView", {
    treeDataProvider: provider
  });
  context.subscriptions.push(treeView);
}
function deactivate() {
}
var HotkeysProvider = class {
  constructor(context) {
    this.context = context;
    this.loadHotkeys();
  }
  _onDidChangeTreeData = new vscode.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  items = [];
  isLoaded = false;
  async loadHotkeys() {
    try {
      const fileUri = vscode.Uri.joinPath(
        this.context.extensionUri,
        "hotkeys.json"
      );
      const bytes = await vscode.workspace.fs.readFile(fileUri);
      const content = Buffer.from(bytes).toString("utf8");
      this.items = JSON.parse(content);
      this.isLoaded = true;
      this._onDidChangeTreeData.fire();
    } catch (err) {
      vscode.window.showErrorMessage(
        `Cannot load hotkeys.json: ${String(err)}`
      );
      this.items = [];
      this.isLoaded = true;
    }
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!element) {
      const groups = Array.from(new Set(this.items.map((i) => i.group)));
      const groupNodes = groups.map((group) => {
        const node = new HotkeyNode(
          group,
          vscode.TreeItemCollapsibleState.Collapsed
        );
        node.isGroup = true;
        node.group = group;
        return node;
      });
      return Promise.resolve(groupNodes);
    }
    if (element.isGroup && element.group) {
      const children = this.items.filter((i) => i.group === element.group).map((i) => {
        const formattedKey = formatKey(i.key);
        const node = new HotkeyNode(
          `( ${formattedKey} ) \u2B95 ${i.label}`,
          vscode.TreeItemCollapsibleState.None
        );
        node.isGroup = false;
        node.group = i.group;
        node.keyBinding = i.key;
        node.commandId = i.command;
        return node;
      });
      return Promise.resolve(children);
    }
    return Promise.resolve([]);
  }
};
var HotkeyNode = class extends vscode.TreeItem {
  isGroup = false;
  group;
  keyBinding;
  commandId;
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
