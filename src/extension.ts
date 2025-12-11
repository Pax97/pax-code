import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface HotkeyItemData {
  group: string;
  label: string;
  key: string;
  command: string;
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new HotkeysProvider(context);

  vscode.window.registerTreeDataProvider("hotkeysView", provider);

  const refreshCmd = vscode.commands.registerCommand("hotkeys.refresh", () => {
    provider.refresh();
  });

  context.subscriptions.push(refreshCmd);
}

export function deactivate() {}

class HotkeysProvider implements vscode.TreeDataProvider<HotkeyNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    HotkeyNode | undefined | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private items: HotkeyItemData[] = [];

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
    } catch (err) {
      vscode.window.showErrorMessage(
        `Cannot load hotkeys.json: ${String(err)}`
      );
      this.items = [];
    }
  }

  refresh(): void {
    this.loadHotkeys();
    this._onDidChangeTreeData.fire();
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
          const node = new HotkeyNode(
            `(${i.key}) ${i.label}`,
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
