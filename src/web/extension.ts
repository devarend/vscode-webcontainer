// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, ViewColumn, ExtensionContext, commands, Uri} from 'vscode';

export function activate(context: ExtensionContext) {
    console.log('Congratulations, your extension "vscode-webcontainer" is now active in the web extension host!');
    let disposable = commands.registerCommand('vscode-webcontainer.helloWorld', () => {
        window.showInformationMessage('Hello World from vscode-webcontainer in a web extension host!');
        const panel = window.createWebviewPanel(
            'serverPanel',
            'terminal',
            ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    Uri.joinPath(context.extensionUri, 'out'),
                    Uri.joinPath(context.extensionUri, 'ui/build')]
            }
        )
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
}
