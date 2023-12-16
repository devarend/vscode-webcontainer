// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, ViewColumn, ExtensionContext, commands, WebviewPanel, workspace, FileType, Uri} from 'vscode';
import {WebcontainerPanel, getWebviewOptions} from "./panel/WebcontainerPanel";
import {PreviewPanel} from "./panel/PreviewPanel";

export function activate(context: ExtensionContext) {

    const
    context.subscriptions.push(
        commands.registerCommand('vscode-webcontainer.openTerminal', () => {
            WebcontainerPanel.createOrShow(context.extensionUri);
        })
    );

    context.subscriptions.push(
        commands.registerCommand('vscode-webcontainer.readFiles', async () => {
            PreviewPanel.createOrShow(context.extensionUri);
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
