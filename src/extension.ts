import * as vscode from 'vscode';
import { watchFolder,lintCode } from './code';
import { MicrophonesController } from './MicrophonesController';
let currentWatcher: vscode.FileSystemWatcher;

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "katarilab" is now active!');	

	let microphoneController = new MicrophonesController();	
    let keyDownDisposable = vscode.commands.registerCommand('katariExtension.keyDown', () => {
        microphoneController.onKeyDown();
    });    
	
	const disposableLintCode = vscode.commands.registerCommand('katarilab.lint_code', async () => {				
		await lintCode();
	});
	const disposableDisableCode = vscode.commands.registerCommand('katarilab.disable_code', async () => {
		if (currentWatcher) {
			vscode.window.showInformationMessage(`Disable Monitor!`);
			currentWatcher.dispose();
		}
	});
	const disposableEnableCode = vscode.commands.registerCommand('katarilab.enable_code', async () => {
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

	context.subscriptions.push(disposableEnableCode);
	context.subscriptions.push(disposableDisableCode);
	context.subscriptions.push(disposableLintCode);
	context.subscriptions.push(microphoneController);
    context.subscriptions.push(keyDownDisposable);    
}

// This method is called when your extension is deactivated
export function deactivate() { }