import * as vscode from 'vscode';

// Annotation types
interface Annotation {
  id: string;
  fileId: string;
  filePath: string;
  lineNumber: number;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  type: 'info' | 'gotcha' | 'warning';
}

// Global annotation manager
let annotationManager: AnnotationManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeCompass extension is now active!');

  // Initialize annotation manager
  annotationManager = new AnnotationManager(context);

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

  // Register refresh sidebar command
  const refreshDisposable = vscode.commands.registerCommand(
    'codecompass.refreshSidebar',
    () => {
      treeDataProvider.refresh();
      vscode.window.showInformationMessage('CodeCompass: Sidebar refreshed');
    }
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

  // Listen for active editor changes to update annotations
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      annotationManager.updateAnnotations(editor);
    }
  }, null, context.subscriptions);

  // Update annotations for the currently active editor
  if (vscode.window.activeTextEditor) {
    annotationManager.updateAnnotations(vscode.window.activeTextEditor);
  }

  context.subscriptions.push(analyzeDisposable);
  context.subscriptions.push(askDisposable);
  context.subscriptions.push(refreshDisposable);
  context.subscriptions.push(hoverDisposable);
}

export function deactivate() {
  console.log('CodeCompass extension is now deactivated');
}

class CodeCompassTreeProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private repositoryStats: {
    name: string;
    totalFiles: number;
    linesOfCode: number;
    languages: Record<string, number>;
    lastAnalyzed?: Date;
  } | null = null;

  constructor() {
    this.loadRepositoryStats();
  }

  refresh(): void {
    this.loadRepositoryStats();
    this._onDidChangeTreeData.fire();
  }

  private loadRepositoryStats() {
    // Get workspace folder
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      this.repositoryStats = null;
      return;
    }

    const workspaceRoot = workspaceFolders[0];
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');

    // Try to load cached analysis
    const cacheFile = path.join(workspaceRoot.uri.fsPath, '.codecompass', 'analysis-cache.json');

    if (fs.existsSync(cacheFile)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

        // Calculate total LOC and languages
        const languages: Record<string, number> = {};
        const totalLOC = 0;

        if (cacheData.fileTypes) {
          for (const fileType of cacheData.fileTypes) {
            const ext = fileType.ext;
            const count = fileType.count;

            // Map extensions to language names
            const langMap: Record<string, string> = {
              '.ts': 'TypeScript',
              '.tsx': 'TypeScript React',
              '.js': 'JavaScript',
              '.jsx': 'JavaScript React',
              '.py': 'Python',
              '.go': 'Go',
              '.rs': 'Rust',
              '.java': 'Java',
              '.json': 'JSON',
              '.md': 'Markdown',
            };

            const language = langMap[ext] || ext;
            languages[language] = (languages[language] || 0) + count;
          }
        }

        this.repositoryStats = {
          name: workspaceRoot.name,
          totalFiles: cacheData.fileCount || 0,
          linesOfCode: totalLOC,
          languages,
          lastAnalyzed: cacheData.analyzedAt ? new Date(cacheData.analyzedAt) : undefined,
        };
      } catch (error) {
        console.error('Failed to load repository stats:', error);
        this.repositoryStats = this.getDefaultStats(workspaceRoot.name);
      }
    } else {
      this.repositoryStats = this.getDefaultStats(workspaceRoot.name);
    }
  }

  private getDefaultStats(name: string) {
    return {
      name,
      totalFiles: 0,
      linesOfCode: 0,
      languages: {},
      lastAnalyzed: undefined,
    };
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    if (!element) {
      // Root level items
      if (!this.repositoryStats) {
        return Promise.resolve([
          new TreeItem(
            'No workspace opened',
            vscode.TreeItemCollapsibleState.None,
            'Open a folder to see repository overview'
          ),
        ]);
      }

      const items: TreeItem[] = [];

      // Repository name
      const nameItem = new TreeItem(
        `📁 ${this.repositoryStats.name}`,
        vscode.TreeItemCollapsibleState.None,
        'Repository name'
      );
      nameItem.description = 'Repository';
      items.push(nameItem);

      // Statistics section
      const statsItem = new TreeItem(
        '📊 Statistics',
        vscode.TreeItemCollapsibleState.Expanded,
        'Repository statistics'
      );
      statsItem.contextValue = 'statistics';
      items.push(statsItem);

      // Quick Links section
      const linksItem = new TreeItem(
        '🔗 Quick Links',
        vscode.TreeItemCollapsibleState.Expanded,
        'Quick actions'
      );
      linksItem.contextValue = 'links';
      items.push(linksItem);

      return Promise.resolve(items);
    } else if (element.contextValue === 'statistics') {
      // Statistics child items
      const items: TreeItem[] = [];

      if (this.repositoryStats) {
        // Total files
        items.push(new TreeItem(
          `Files: ${this.repositoryStats.totalFiles}`,
          vscode.TreeItemCollapsibleState.None,
          'Total number of files analyzed'
        ));

        // Lines of code
        items.push(new TreeItem(
          `Lines of Code: ${this.repositoryStats.linesOfCode.toLocaleString()}`,
          vscode.TreeItemCollapsibleState.None,
          'Total lines of code'
        ));

        // Languages
        const languageCount = Object.keys(this.repositoryStats.languages).length;
        if (languageCount > 0) {
          const topLanguage = Object.entries(this.repositoryStats.languages)
            .sort(([, a], [, b]) => b - a)[0];

          items.push(new TreeItem(
            `Languages: ${languageCount}`,
            vscode.TreeItemCollapsibleState.None,
            `Primary: ${topLanguage[0]} (${topLanguage[1]} files)`
          ));
        }

        // Last analyzed
        if (this.repositoryStats.lastAnalyzed) {
          const relativeTime = this.getRelativeTime(this.repositoryStats.lastAnalyzed);
          items.push(new TreeItem(
            `Last Analyzed: ${relativeTime}`,
            vscode.TreeItemCollapsibleState.None,
            this.repositoryStats.lastAnalyzed.toLocaleString()
          ));
        } else {
          items.push(new TreeItem(
            'Not yet analyzed',
            vscode.TreeItemCollapsibleState.None,
            'Run CodeCompass: Analyze Repository'
          ));
        }
      }

      return Promise.resolve(items);
    } else if (element.contextValue === 'links') {
      // Quick links
      const items: TreeItem[] = [];

      const analyzeItem = new TreeItem(
        '🔍 Analyze Repository',
        vscode.TreeItemCollapsibleState.None,
        'Run repository analysis'
      );
      analyzeItem.command = {
        command: 'codecompass.analyze',
        title: 'Analyze',
      };
      items.push(analyzeItem);

      const askItem = new TreeItem(
        '💬 Ask Question',
        vscode.TreeItemCollapsibleState.None,
        'Ask about the codebase'
      );
      askItem.command = {
        command: 'codecompass.ask',
        title: 'Ask',
      };
      items.push(askItem);

      const refreshItem = new TreeItem(
        '🔄 Refresh',
        vscode.TreeItemCollapsibleState.None,
        'Refresh repository stats'
      );
      refreshItem.command = {
        command: 'codecompass.refreshSidebar',
        title: 'Refresh',
      };
      items.push(refreshItem);

      return Promise.resolve(items);
    }

    return Promise.resolve([]);
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
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

  contextValue?: string;
  description?: string;
}

class CodeCompassHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
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

class AnnotationManager {
  private decorationType: vscode.TextEditorDecorationType;
  private annotations: Map<string, Annotation[]> = new Map();

  constructor(private context: vscode.ExtensionContext) {
    // Create decoration type for inline annotations
    this.decorationType = vscode.window.createTextEditorDecorationType({
      after: {
        margin: '0 0 0 1em',
        textDecoration: 'none; opacity: 0.6;',
      },
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });

    // Load sample annotations for demonstration
    this.loadSampleAnnotations();

    // Register command to show annotation details
    const showAnnotationCmd = vscode.commands.registerCommand(
      'codecompass.showAnnotation',
      (annotation: Annotation) => {
        this.showAnnotationDetails(annotation);
      }
    );

    context.subscriptions.push(showAnnotationCmd);
    context.subscriptions.push(this.decorationType);
  }

  private loadSampleAnnotations() {
    // Sample annotations for common code patterns
    const sampleAnnotations: Annotation[] = [
      {
        id: '1',
        fileId: 'sample',
        filePath: 'extension.ts',
        lineNumber: 19,
        content: 'Extension activation point - runs when VS Code starts or when extension is triggered',
        authorId: 'system',
        authorName: 'CodeCompass',
        createdAt: new Date(),
        type: 'info'
      },
      {
        id: '2',
        fileId: 'sample',
        filePath: 'extension.ts',
        lineNumber: 75,
        content: 'Gotcha: Remember to dispose of event listeners to avoid memory leaks',
        authorId: 'system',
        authorName: 'CodeCompass',
        createdAt: new Date(),
        type: 'gotcha'
      },
      {
        id: '3',
        fileId: 'sample',
        filePath: 'package.json',
        lineNumber: 16,
        content: 'Warning: onStartupFinished may impact VS Code startup time. Use specific activation events when possible',
        authorId: 'system',
        authorName: 'CodeCompass',
        createdAt: new Date(),
        type: 'warning'
      }
    ];

    // Group annotations by file
    for (const annotation of sampleAnnotations) {
      const existing = this.annotations.get(annotation.filePath) || [];
      existing.push(annotation);
      this.annotations.set(annotation.filePath, existing);
    }
  }

  public updateAnnotations(editor: vscode.TextEditor) {
    // Check if inline annotations are enabled
    const config = vscode.workspace.getConfiguration('codecompass');
    const annotationsEnabled = config.get('enableInlineAnnotations', true);

    if (!annotationsEnabled) {
      editor.setDecorations(this.decorationType, []);
      return;
    }

    const fileName = editor.document.fileName.split('/').pop() || '';
    const fileAnnotations = this.annotations.get(fileName) || [];

    if (fileAnnotations.length === 0) {
      return;
    }

    const decorations: vscode.DecorationOptions[] = fileAnnotations.map(annotation => {
      const line = editor.document.lineAt(annotation.lineNumber);
      const range = new vscode.Range(
        line.range.end,
        line.range.end
      );

      // Choose icon based on annotation type
      const icon = annotation.type === 'info' ? 'ℹ️' :
                   annotation.type === 'gotcha' ? '💡' : '⚠️';

      // Create short preview of content
      const preview = annotation.content.length > 40
        ? annotation.content.substring(0, 40) + '...'
        : annotation.content;

      const decoration: vscode.DecorationOptions = {
        range,
        renderOptions: {
          after: {
            contentText: ` ${icon} ${preview}`,
            color: annotation.type === 'info' ? '#4CAF50' :
                   annotation.type === 'gotcha' ? '#2196F3' : '#FF9800',
            fontStyle: 'italic',
          },
        },
        hoverMessage: new vscode.MarkdownString(
          `**🧭 CodeCompass Annotation**\n\n${annotation.content}\n\n---\n*${annotation.authorName}* • ${annotation.createdAt.toLocaleDateString()}\n\n[View Details](command:codecompass.showAnnotation?${encodeURIComponent(JSON.stringify(annotation))} "View full annotation")`
        ),
      };

      // Make hover message clickable
      (decoration.hoverMessage as vscode.MarkdownString).isTrusted = true;

      return decoration;
    });

    editor.setDecorations(this.decorationType, decorations);
  }

  private showAnnotationDetails(annotation: Annotation) {
    // Show annotation in a webview panel
    const panel = vscode.window.createWebviewPanel(
      'codecompassAnnotation',
      'CodeCompass Annotation',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
      }
    );

    const icon = annotation.type === 'info' ? 'ℹ️' :
                 annotation.type === 'gotcha' ? '💡' : '⚠️';

    panel.webview.html = this.getAnnotationHtml(annotation, icon);
  }

  private getAnnotationHtml(annotation: Annotation, icon: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Annotation</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
          }
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
          }
          .icon {
            font-size: 32px;
            margin-right: 15px;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
          }
          .content {
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textLink-foreground);
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .meta {
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
            margin-top: 20px;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-right: 10px;
          }
          .badge-info { background-color: #4CAF50; color: white; }
          .badge-gotcha { background-color: #2196F3; color: white; }
          .badge-warning { background-color: #FF9800; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="icon">${icon}</div>
          <div>
            <div class="title">🧭 CodeCompass Annotation</div>
            <div style="font-size: 12px; color: var(--vscode-descriptionForeground);">
              ${annotation.filePath}:${annotation.lineNumber}
            </div>
          </div>
        </div>
        <div>
          <span class="badge badge-${annotation.type}">${annotation.type}</span>
        </div>
        <div class="content">
          ${annotation.content}
        </div>
        <div class="meta">
          <strong>Author:</strong> ${annotation.authorName}<br>
          <strong>Created:</strong> ${annotation.createdAt.toLocaleString()}
        </div>
      </body>
      </html>
    `;
  }
}
