import * as vscode from 'vscode';
import { watchFolder } from './code';

let currentWatcher: vscode.FileSystemWatcher;

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "katarilab" is now active!');
	const disposable = vscode.commands.registerCommand('katarilab.copilot', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showWarningMessage('No folder path was provided.');
			return;
		}
		if (workspaceFolders.length === 0) {
			vscode.window.showWarningMessage('No folder is currently opened.');
			return;
		}
		const folderPath = workspaceFolders[0].uri.fsPath;
		if (!folderPath) {
			vscode.window.showWarningMessage('No folder path was provided.');
			return;
		}
		vscode.window.showInformationMessage(`Monitor, ${folderPath}!`);
		if (currentWatcher) {
			currentWatcher.dispose();
		}
		currentWatcher = await watchFolder(folderPath);
		context.subscriptions.push(currentWatcher);
	});
	setTimeout(() => {
		vscode.commands.executeCommand('workbench.action.closeMessages');
	}, 5000); // Automatically close the message after 3 seconds

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }