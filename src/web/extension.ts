// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, ViewColumn, ExtensionContext, commands, Uri, WebviewPanel} from 'vscode';
import {WebcontainerPanel, getWebviewOptions} from "./panel/WebcontainerPanel";

export function activate(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand('vscode-webcontainer.helloWorld', () => {
            WebcontainerPanel.createOrShow(context.extensionUri);
        })
    );

    context.subscriptions.push(
        commands.registerCommand('catCoding.doRefactor', () => {
            if (WebcontainerPanel.currentPanel) {
                WebcontainerPanel.currentPanel.doRefactor();
            }
        })
    );

    if (window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        window.registerWebviewPanelSerializer(WebcontainerPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
                console.log(`Got state: ${state}`);
                // Reset the webview options so we use latest uri for `localResourceRoots`.
                webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
                WebcontainerPanel.revive(webviewPanel, context.extensionUri);
            }
        });
    }
}

// This method is called when your extension is deactivated
export function deactivate() {
}
