import {Uri, ViewColumn, Webview, WebviewPanel, window, Disposable} from "vscode";

/**
 * Manages webcontainer webview panels
 */
export class PreviewPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: PreviewPanel | undefined;

    public static readonly viewType = 'webcontainer';

    private readonly _panel: WebviewPanel;
    private readonly _extensionUri: Uri;
    private _disposables: Disposable[] = [];

    public static createOrShow(extensionUri: Uri) {
        const column = window.activeTextEditor
            ? window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (PreviewPanel.currentPanel) {
            PreviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = window.createWebviewPanel(
            PreviewPanel.viewType,
            'terminal',
            column || ViewColumn.One,
            {retainContextWhenHidden: true},
        );

        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    }

    public static revive(panel: WebviewPanel, extensionUri: Uri) {
        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    }

    private constructor(panel: WebviewPanel, extensionUri: Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._panel.webview.html = this._getHtmlForWebview(
            this._panel.webview
        );
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        PreviewPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(webview: Webview) {
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src https://stackblitz.com/ *.webcontainer.io/; style-src ${webview.cspSource} 'self' 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}' https://stackblitz.com/ *.webcontainer.io/;">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Preview</title>
			</head>
			<body>
			   <iframe allow="cross-origin-isolated" />
			</body>
			<script>
			    const iframeEl = document.querySelector('iframe');
                window.addEventListener('message', event => {
                    const message = event.data; // The JSON data our extension sent
                    switch (message.command) {
                        case 'loadFiles':
                            console.log('ok')
                            iframeEl.src = url;
                            break;
                    }
                });
            </script>
			</html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
