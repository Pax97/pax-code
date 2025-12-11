import * as vscode from "vscode";

interface HotkeyItemData {
  group: string;
  label: string;
  key: string;
  command: string;
}

// Format key with macOS-style icons
function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    cmd: "⌘",
    alt: "⌥",
    ctrl: "⌃",
    shift: "⇧",
    up: "↑",
    down: "↓",
    left: "←",
    right: "→",
    enter: "↵",
    tab: "⇥",
    backspace: "⌫",
    space: "␣",
    escape: "⎋",
    esc: "⎋",
  };

  return key
    .split("+")
    .map((part) => {
      const trimmed = part.trim().toLowerCase();
      return keyMap[trimmed] || part.trim();
    })
    .join(" ");
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new HotkeysProvider(context);
  const treeView = vscode.window.createTreeView("hotkeysView", {
    treeDataProvider: provider,
  });

  context.subscriptions.push(treeView);
}

export function deactivate() {}

class HotkeysProvider implements vscode.TreeDataProvider<HotkeyNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    HotkeyNode | undefined | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private items: HotkeyItemData[] = [];
  private isLoaded = false;

  constructor(private context: vscode.ExtensionContext) {
    this.loadHotkeys();
  }

  private async loadHotkeys() {
    try {
      const fileUri = vscode.Uri.joinPath(
        this.context.extensionUri,
        "hotkeys.json"
      );
      const bytes = await vscode.workspace.fs.readFile(fileUri);
      const content = Buffer.from(bytes).toString("utf8");
      this.items = JSON.parse(content) as HotkeyItemData[];
      this.isLoaded = true;
      // Notify tree view to refresh after data is loaded
      this._onDidChangeTreeData.fire();
    } catch (err) {
      vscode.window.showErrorMessage(
        `Cannot load hotkeys.json: ${String(err)}`
      );
      this.items = [];
      this.isLoaded = true;
    }
  }

  getTreeItem(element: HotkeyNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: HotkeyNode): Thenable<HotkeyNode[]> {
    if (!element) {
      // Level 1: group
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
      // Level 2: items trong group
      const children = this.items
        .filter((i) => i.group === element.group)
        .map((i) => {
          const formattedKey = formatKey(i.key);
          const node = new HotkeyNode(
            `( ${formattedKey} ) ⮕ ${i.label}`,
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
}

class HotkeyNode extends vscode.TreeItem {
  isGroup = false;
  group?: string;
  keyBinding?: string;
  commandId?: string;

  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }
}
