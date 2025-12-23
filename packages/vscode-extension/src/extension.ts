import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeCompass extension is now active!');

  // Register analyze command
  const analyzeDisposable = vscode.commands.registerCommand(
    'codecompass.analyze',
    () => {
      vscode.window.showInformationMessage(
        'CodeCompass: Repository analysis coming soon!'
      );
    }
  );

  // Register ask command
  const askDisposable = vscode.commands.registerCommand(
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

  // Register hover provider for all supported languages
  const hoverProvider = new CodeCompassHoverProvider();
  const hoverDisposable = vscode.languages.registerHoverProvider(
    [
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'typescriptreact' },
      { scheme: 'file', language: 'javascriptreact' },
      { scheme: 'file', language: 'python' },
      { scheme: 'file', language: 'go' },
      { scheme: 'file', language: 'rust' },
      { scheme: 'file', language: 'java' }
    ],
    hoverProvider
  );

  context.subscriptions.push(analyzeDisposable);
  context.subscriptions.push(askDisposable);
  context.subscriptions.push(hoverDisposable);
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

class CodeCompassHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    // Get configuration to check if hover tooltips are enabled
    const config = vscode.workspace.getConfiguration('codecompass');
    const hoverEnabled = config.get('enableHoverTooltips', true);

    if (!hoverEnabled) {
      return null;
    }

    // Get the word at the current position
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return null;
    }

    const word = document.getText(wordRange);

    // Get the line text for context
    const line = document.lineAt(position.line);
    const lineText = line.text;

    // Simple heuristics to identify functions, classes, etc.
    const isFunctionCall = lineText.includes(`${word}(`);
    const isFunctionDeclaration = lineText.match(new RegExp(`(function|const|let|var|async)\\s+${word}\\s*[=\\(]`));
    const isClassDeclaration = lineText.match(new RegExp(`(class|interface|type)\\s+${word}`));
    const isImport = lineText.includes('import') && lineText.includes(word);

    // Create hover content based on context
    const hoverContent = new vscode.MarkdownString();
    hoverContent.isTrusted = true;
    hoverContent.supportHtml = true;

    // Add CodeCompass branding
    hoverContent.appendMarkdown('**🧭 CodeCompass**\n\n');

    if (isFunctionDeclaration) {
      hoverContent.appendMarkdown(`**Function:** \`${word}\`\n\n`);
      hoverContent.appendMarkdown('📝 This appears to be a function definition.\n\n');
      hoverContent.appendMarkdown('**Quick Info:**\n');
      hoverContent.appendMarkdown('- Function declarations define reusable code blocks\n');
      hoverContent.appendMarkdown('- Can be called from other parts of the codebase\n\n');
      hoverContent.appendMarkdown('💡 *Tip: Use "Go to References" to see where this function is called*\n');
    } else if (isFunctionCall) {
      hoverContent.appendMarkdown(`**Function Call:** \`${word}\`\n\n`);
      hoverContent.appendMarkdown('📞 This function is being called here.\n\n');
      hoverContent.appendMarkdown('**Quick Actions:**\n');
      hoverContent.appendMarkdown('- Hold `Cmd/Ctrl` and click to see the function definition\n');
      hoverContent.appendMarkdown('- Use "Go to Definition" (F12) for more details\n\n');
      hoverContent.appendMarkdown('💡 *Tip: Understanding the function\'s parameters and return value can help you use it correctly*\n');
    } else if (isClassDeclaration) {
      hoverContent.appendMarkdown(`**Class/Type:** \`${word}\`\n\n`);
      hoverContent.appendMarkdown('🏗️ This is a class or type definition.\n\n');
      hoverContent.appendMarkdown('**Quick Info:**\n');
      hoverContent.appendMarkdown('- Classes define objects with properties and methods\n');
      hoverContent.appendMarkdown('- Types define the shape of data structures\n\n');
      hoverContent.appendMarkdown('💡 *Tip: Check the full definition to understand its structure*\n');
    } else if (isImport) {
      hoverContent.appendMarkdown(`**Import:** \`${word}\`\n\n`);
      hoverContent.appendMarkdown('📦 This symbol is imported from another module.\n\n');
      hoverContent.appendMarkdown('**Quick Info:**\n');
      hoverContent.appendMarkdown('- Imports bring code from other files or packages\n');
      hoverContent.appendMarkdown('- Check the import statement to see the source\n\n');
      hoverContent.appendMarkdown('💡 *Tip: Use "Go to Definition" to jump to the source file*\n');
    } else {
      // Generic symbol
      hoverContent.appendMarkdown(`**Symbol:** \`${word}\`\n\n`);
      hoverContent.appendMarkdown('📌 Hover over symbols to learn more about your codebase.\n\n');
      hoverContent.appendMarkdown('**Available Actions:**\n');
      hoverContent.appendMarkdown('- F12: Go to Definition\n');
      hoverContent.appendMarkdown('- Shift+F12: Find References\n');
      hoverContent.appendMarkdown('- Alt+F12: Peek Definition\n\n');
      hoverContent.appendMarkdown('💡 *Run "CodeCompass: Analyze Repository" for deeper insights*\n');
    }

    // Add file context
    const fileName = document.fileName.split('/').pop() || '';
    hoverContent.appendMarkdown(`\n---\n*File: ${fileName}* | *Line: ${position.line + 1}*\n`);

    return new vscode.Hover(hoverContent, wordRange);
  }
}
