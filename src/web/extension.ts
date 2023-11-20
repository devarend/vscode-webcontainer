// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, ViewColumn, ExtensionContext, commands, Uri, WebviewPanel} from 'vscode';
import {CatCodingPanel, getWebviewOptions} from "./panel/WebcontainerPanel";

export function activate(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand('vscode-webcontainer.helloWorld', () => {
            CatCodingPanel.createOrShow(context.extensionUri);
        })
    );

    context.subscriptions.push(
        commands.registerCommand('catCoding.doRefactor', () => {
            if (CatCodingPanel.currentPanel) {
                CatCodingPanel.currentPanel.doRefactor();
            }
        })
    );

    if (window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
                console.log(`Got state: ${state}`);
                // Reset the webview options so we use latest uri for `localResourceRoots`.
                webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
                CatCodingPanel.revive(webviewPanel, context.extensionUri);
            }
        });
    }
}

// This method is called when your extension is deactivated
export function deactivate() {
}
