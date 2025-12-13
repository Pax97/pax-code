import * as vscode from "vscode";

/* =========================
 * TYPES
 * ========================= */

interface HotkeyItemData {
  group: string;
  label: string;
  key: string;
  command: string;
  when?: string;
}

/* =========================
 * UTILS
 * ========================= */

function formatKey(key: string): string {
  const map: Record<string, string> = {
    cmd: "⌘",
    ctrl: "⌃",
    alt: "⌥",
    shift: "⇧",
    up: "↑",
    down: "↓",
    left: "←",
    right: "→",
    enter: "↵",
    tab: "⇥",
    backspace: "⌫",
    esc: "⎋",
    escape: "⎋",
    space: "␣",
  };

  return key
    .split("+")
    .map((p) => map[p.trim().toLowerCase()] || p.trim())
    .join(" ");
}

/* ===== Schema validation (warn only) ===== */

function validateHotkeys(data: any): string[] {
  const errors: string[] = [];

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

    if (item.when !== undefined && typeof item.when !== "string") {
      errors.push(`Item #${i} field 'when' wrong type`);
    }
  });

  return errors;
}

/* ===== Detect duplicate by key + when ===== */

function normalizeWhen(when?: string): string {
  return (when && when.trim()) || "__GLOBAL__";
}

function collectDuplicateKeyWhen(items: HotkeyItemData[]): Set<string> {
  const map = new Map<string, number>();
  const dup = new Set<string>();

  for (const i of items) {
    const sig = i.key.trim().toLowerCase() + "||" + normalizeWhen(i.when);

    map.set(sig, (map.get(sig) || 0) + 1);
  }

  for (const [sig, count] of map) {
    if (count > 1) dup.add(sig);
  }

  return dup;
}

/* =========================
 * EXTENSION
 * ========================= */

export function activate(context: vscode.ExtensionContext) {
  const provider = new HotkeysProvider(context);

  vscode.window.createTreeView("hotkeysView", {
    treeDataProvider: provider,
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("hotkeys.importJson", () =>
      provider.importJson()
    )
  );

  provider.loadFromStorage();
}

export function deactivate() {}

/* =========================
 * TREE PROVIDER
 * ========================= */

class HotkeysProvider implements vscode.TreeDataProvider<HotkeyNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private items: HotkeyItemData[] = [];
  private duplicateSet = new Set<string>();
  private storageFile: vscode.Uri;

  constructor(private context: vscode.ExtensionContext) {
    this.storageFile = vscode.Uri.joinPath(
      context.globalStorageUri,
      "hotkeys.json"
    );
  }

  /* ===== Import JSON ===== */

  async importJson() {
    const uri = await vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: { JSON: ["json"] },
    });
    if (!uri) return;

    const bytes = await vscode.workspace.fs.readFile(uri[0]);
    const content = Buffer.from(bytes).toString("utf8");

    let parsed: any;
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

    const items = parsed as HotkeyItemData[];
    const duplicates = collectDuplicateKeyWhen(items);

    if (duplicates.size) {
      vscode.window.showWarningMessage(
        "Shortcut is duplicate (key + when):\n" +
          Array.from(duplicates)
            .slice(0, 5)
            .map((s) => s.replace("||", " | when: "))
            .join("\n")
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

      this.items = JSON.parse(content) as HotkeyItemData[];
      this.duplicateSet = collectDuplicateKeyWhen(this.items);
      this._onDidChangeTreeData.fire();
    } catch {
      this.items = [];
      this.duplicateSet.clear();
    }
  }

  /* ========================= */

  getTreeItem(element: HotkeyNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: HotkeyNode): Thenable<HotkeyNode[]> {
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
        this.items
          .filter((i) => i.group === element.group)
          .map((i) => {
            const sig =
              i.key.trim().toLowerCase() + "||" + normalizeWhen(i.when);

            const isDuplicate = this.duplicateSet.has(sig);

            const label = `( ${formatKey(i.key)} ) → ${i.label}`;

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
              node.tooltip = `Shortcut is dupicate\nKey: ${i.key}\nWhen: ${
                i.when || "global"
              }`;
            }

            return node;
          })
      );
    }

    return Promise.resolve([]);
  }
}

/* =========================
 * TREE NODE
 * ========================= */

class HotkeyNode extends vscode.TreeItem {
  isGroup = false;
  group?: string;

  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }
}
