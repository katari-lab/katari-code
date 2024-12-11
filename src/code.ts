import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { katariCallCode } from './katari';

export async function createDocumentInFolder(folderPath: string, fileName: string, content: string) {
    try {        
        await fs.mkdir(folderPath, { recursive: true });        
        const filePath = path.join(folderPath, fileName);        
        await fs.writeFile(filePath, content, { encoding: 'utf8' });
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        await vscode.window.showTextDocument(document);
        vscode.window.showInformationMessage(`File created successfully: ${filePath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create file: ${error}`);
        console.error(error);
    }
}

export async function watchFolder(folderPath: string) {
    const folderUri = vscode.Uri.file(folderPath);
    const folderWatcher = vscode.workspace.createFileSystemWatcher(`${folderUri.fsPath}/**/*`);
    folderWatcher.onDidCreate((uri) => {
        vscode.window.showInformationMessage(`File created: ${uri.fsPath}`);
    });
    folderWatcher.onDidChange(async (uri) => {
        vscode.window.showInformationMessage(`File changed: ${uri.fsPath}`);
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            await vscode.commands.executeCommand('workbench.action.files.revert');
            const content = await katariCallCode(document.getText());
            const editor = await vscode.window.showTextDocument(document);
            await editor.edit(editBuilder => {
                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(document.lineCount, 0);
                const fullRange = new vscode.Range(start, end);
                editBuilder.replace(fullRange, content ?? "api code was not ok");
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open file: ${uri.fsPath}`);
            console.error(error);
        }
    });

    // File deleted
    folderWatcher.onDidDelete((uri) => {
        vscode.window.showInformationMessage(`File deleted: ${uri.fsPath}`);
    });

    return folderWatcher;
}
export async function openOrFocusFile(uri: vscode.Uri) {
    try {
        // Check if the file is open in memory
        const openDocument = vscode.workspace.textDocuments.find(
            (doc) => doc.uri.fsPath === uri.fsPath
        );

        if (openDocument) {
            if (openDocument.isUntitled) {
                // The file exists in memory but hasn't been saved
                vscode.window.showInformationMessage(`The file is unsaved (in-memory): ${uri.fsPath}`);
            } else if (openDocument.isDirty) {
                // The file is open and has unsaved changes
                vscode.window.showInformationMessage(`The file has unsaved changes: ${uri.fsPath}`);
            } else {
                // The file is open and saved
                vscode.window.showInformationMessage(`The file is open and saved: ${uri.fsPath}`);
            }
            // Focus on the file
            const existingEditor = vscode.window.visibleTextEditors.find(
                (editor) => editor.document.uri.fsPath === uri.fsPath
            );
            if (existingEditor) {
                await vscode.window.showTextDocument(existingEditor.document, { viewColumn: existingEditor.viewColumn });
            } else {
                await vscode.window.showTextDocument(openDocument);
            }
        } else {
            const document = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(document);
            vscode.window.showInformationMessage(`Opened file: ${uri.fsPath}`);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to open or focus file: ${uri.fsPath}`);
        console.error(error);
    }
}