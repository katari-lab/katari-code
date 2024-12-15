import * as vscode from 'vscode';
import { watchFolder, lintCode } from './code';
import { MicrophonesController } from './MicrophonesController';
import { CodeController } from './CodeController';
import { TestingController } from './TestingController';
let currentWatcher: vscode.FileSystemWatcher;

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "katarilab" is now active!');

	const microphoneController = new MicrophonesController();
	const codeController = new CodeController();
	const testingController = new TestingController();

	let terminalTranscriptDisposable = vscode.commands.registerCommand('katarilab.command_terminal_transcript', async () => {
		await microphoneController.onTerminal();
	});
	let editorTranscriptDisposable = vscode.commands.registerCommand('katarilab.command_editor_transcript', async () => {
		await microphoneController.onTextEditor();
	});
	let disposableTestingCode = vscode.commands.registerCommand('katarilab.command_generate_test', async () => {
		await testingController.generateTest();
	});	

	const disposableLintCode = vscode.commands.registerCommand('katarilab.lint_code', async () => {
		await codeController.lintCode();		
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
	context.subscriptions.push(disposableTestingCode);
	context.subscriptions.push(disposableEnableCode);
	context.subscriptions.push(disposableDisableCode);
	context.subscriptions.push(disposableLintCode);
	context.subscriptions.push(terminalTranscriptDisposable);
	context.subscriptions.push(editorTranscriptDisposable);
	context.subscriptions.push(microphoneController);
	context.subscriptions.push(testingController);
	context.subscriptions.push(codeController);
	
}

// This method is called when your extension is deactivated
export function deactivate() { }