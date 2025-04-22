import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.runClearPnpmDev', () => {
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
        terminal.show();
        terminal.sendText('clear; pnpm dev', true);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
