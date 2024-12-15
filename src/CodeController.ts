import * as vscode from 'vscode';
import {KatariGateway} from './KatariGateway';
export class CodeController{
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
    
    public async lintCode(){            
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }
        const document = editor.document;
        if (this._isExecuting) {
            vscode.window.showInformationMessage(`Already in progress`);     
            return;
        }   
        vscode.window.showInformationMessage(`Linting code for ${document.fileName}`);        
        try {            
            const content = document.getText();                    
            const modifiedContent = await this._katari.lintCode(document.fileName, content);
            if (modifiedContent){
                await editor.edit(editBuilder => {
                    const start = new vscode.Position(0, 0);
                    const end = new vscode.Position(document.lineCount, 0);					
                    editBuilder.replace(new vscode.Range(start, end), modifiedContent);					
                });
            }            
            vscode.window.showInformationMessage(`Linting completed for ${document.fileName}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to modify file: ${error}`);
            console.error(error);
        }
        return 0;
    }


}