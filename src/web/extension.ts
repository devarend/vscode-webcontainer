// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, ViewColumn, ExtensionContext, commands, WebviewPanel, workspace, FileType} from 'vscode';
import {WebcontainerPanel, getWebviewOptions} from "./panel/WebcontainerPanel";

export function activate(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand('vscode-webcontainer.openTerminal', () => {
            WebcontainerPanel.createOrShow(context.extensionUri);
        })
    );

    context.subscriptions.push(
        commands.registerCommand('vscode-webcontainer.readFiles', async () => {
            const folder = workspace.workspaceFolders?.[0]
            if (!folder) return
            for (const [name, type] of await workspace.fs.readDirectory(folder.uri)) {
                if (type === FileType.File) {
                    console.log('file', name)
                }
                if (type === FileType.Directory) {
                    console.log('directory:', name)
                }
            }
            // files.forEach(async file => {
            //     const readData = await workspace.fs.readFile(file);
            //     const value = new TextDecoder().decode(readData);
            //     const path = file.path.replace(folder?.uri.path ?? '', '')
            //     console.log(path)
            // });
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
