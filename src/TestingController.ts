import * as vscode from 'vscode';
import { KatariGateway } from './KatariGateway';
import * as path from 'path';
import * as fs from 'fs';


export class TestingController {
    private _isExecuting: boolean = false;
    private _disposable: vscode.Disposable;
    private _katari: KatariGateway;
    constructor() {
        let subscriptions: vscode.Disposable[] = [];
        this._disposable = vscode.Disposable.from(...subscriptions);
        this._katari = new KatariGateway();
    }
    dispose() {
        this._disposable.dispose();
    }
    private _ensureFolderExists(folderPath: string) {
        try {
            if (!fs.existsSync(folderPath)) {
                console.log(`Creating folder at: ${folderPath}`);
                fs.mkdirSync(folderPath, { recursive: true }); // Ensure parent directories are created
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error creating folder: ${folderPath}. Details: ${error.message}`);
        }
    }
    private _ensureFileExists(filePath: string) {
        try {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, '', { flag: 'w' }); // Empty file or replace existing one  
            }
        } catch (error) {
            console.error(`Error ensuring file exists: ${filePath}. Details: ${error}`);
            vscode.window.showErrorMessage(`Error creating folder: ${filePath}. Details: ${error}`);
        }
    }

    private _readFileSync(filePath: string): string {
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8'); // Read file in UTF-8 encoding
                return content;
            } else {
                console.error(`File not found: ${filePath}`);
                return "";
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error reading file: ${filePath}. Details: ${error.message}`);
            console.error(`Error reading file: ${filePath}. Details: ${error.message}`);
            return "";
        }
    }

    private _getDocumentFileName(document: vscode.TextDocument): string {
        return path.basename(document.fileName); // Extracts the filename from the full path
    }

    private async _generatePythonTest(editor: vscode.TextEditor, workspaceRoot: string) {
        const document = editor.document;
        const documentName = this._getDocumentFileName(document);
        vscode.window.showInformationMessage(`Generate testing for ${documentName}`);
        const testFolder = "tests";
        let testSubFolder = null;
        if (documentName.toLowerCase().indexOf("gateway") >= 0 || documentName.toLowerCase().indexOf("controller") >= 0) {
            testSubFolder = "integrations";
        }
        else {
            testSubFolder = "units";
        }
        const folderPath = path.join(workspaceRoot, testFolder, testSubFolder);
        const filePath = path.join(folderPath, `test_${documentName}`);
        this._ensureFolderExists(folderPath);
        this._ensureFileExists(filePath);
        const testContent = this._readFileSync(filePath);
        const editorContent = document.getText();
        if (editorContent) {
            const modifiedContent = await this._katari.testCode(documentName, editorContent, testContent);
            if (modifiedContent) {
                fs.writeFileSync(filePath, modifiedContent, 'utf8');
                vscode.window.showInformationMessage(`Testing updated for ${documentName}`);
            }
        }
    }

    private async _generateTest() {
        let editor = vscode.window.activeTextEditor;
        if (vscode.workspace.workspaceFolders && editor) {
            const workspaceFolderUri = vscode.workspace.workspaceFolders?.[0].uri;
            this._generatePythonTest(editor, workspaceFolderUri.fsPath);
        }
    }

    public async generateTest() {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage("No workspace folder is open.");
            return;
        }
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }
        if (this._isExecuting) {
            vscode.window.showInformationMessage(`Already in progress`);
            return;
        }
        this._isExecuting = true;
        this._generateTest();
        this._isExecuting = false;
        return 0;
    }
}