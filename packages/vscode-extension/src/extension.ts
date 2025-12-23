import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeCompass extension is now active!');

  // Register analyze command
  let analyzeDisposable = vscode.commands.registerCommand(
    'codecompass.analyze',
    () => {
      vscode.window.showInformationMessage(
        'CodeCompass: Repository analysis coming soon!'
      );
    }
  );

  // Register ask command
  let askDisposable = vscode.commands.registerCommand(
    'codecompass.ask',
    async () => {
      const question = await vscode.window.showInputBox({
        prompt: 'Ask a question about your codebase',
        placeHolder: 'e.g., Where is authentication handled?',
      });

      if (question) {
        vscode.window.showInformationMessage(
          `CodeCompass: AI chat coming soon! You asked: "${question}"`
        );
      }
    }
  );

  // Register tree view provider
  const treeDataProvider = new CodeCompassTreeProvider();
  vscode.window.registerTreeDataProvider(
    'codecompass-overview',
    treeDataProvider
  );

  context.subscriptions.push(analyzeDisposable);
  context.subscriptions.push(askDisposable);
}

export function deactivate() {
  console.log('CodeCompass extension is now deactivated');
}

class CodeCompassTreeProvider implements vscode.TreeDataProvider<TreeItem> {
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    if (!element) {
      return Promise.resolve([
        new TreeItem(
          'Welcome to CodeCompass',
          vscode.TreeItemCollapsibleState.None,
          'Run "CodeCompass: Analyze Repository" to get started'
        ),
      ]);
    }
    return Promise.resolve([]);
  }
}

class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly tooltip?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = tooltip;
  }
}
