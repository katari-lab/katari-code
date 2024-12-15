import * as vscode from 'vscode';
import fs from 'fs';
import mic from 'mic';
import axios from 'axios';
import FormData from 'form-data';

export class MicrophonesController {
    private _isListening: boolean = false;    
    private _disposable: vscode.Disposable;
    constructor() {
        let subscriptions: vscode.Disposable[] = [];
        this._disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }
    private async invokeCommandTranscript(audioFile: string): Promise<string> {
        const formData = new FormData();
        try {
            formData.append("model", "whisper-1");
            formData.append("file", fs.createReadStream(audioFile));
            const response = await axios.post("http://0.0.0.0:8000/commands/transcript", formData, {
                headers: formData.getHeaders(),
            });
            console.log(`open ia ${JSON.stringify(response.data)}`);
            return response.data.message;
        } catch (error: any) {
            console.error(error.message || "An unknown error occurred");
            vscode.window.showErrorMessage("Failed to send data to the API: " + error.message);
            return "";
        }
    }
    private async insertTranscript(message: string, isTerminal:boolean) {
        if (isTerminal){
            const terminal = vscode.window.activeTerminal;
            if (terminal) {            
                terminal.sendText(message);
            }
        }
        else{
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const name = document.fileName;
                const position = editor.selection.active;
                editor.edit((editBuilder) => {
                    editBuilder.insert(position, message);
                });
            }
        }
        return;
    }
    private async _startRecording(isTerminal:boolean) {
        const recordFile = `recording_${Math.floor(Date.now() / 1000)}.pcm`;
        const micInstance = mic({
            rate: 16000,
            channels: '1',
            bitwidth: 16,
            exitOnSilence: 4
        });
        const outputFileStream = fs.createWriteStream(recordFile);
        const micInputStream = micInstance.getAudioStream();
        micInputStream.pipe(outputFileStream);
        micInputStream.on('error', (err) => {
            console.error("Error in Input Stream: " + err);
            this._isListening = false;
        });
        const executionFolder = process.cwd();
        micInputStream.on('silence', async () => {
            vscode.window.showInformationMessage(`Recording stopped ${recordFile}`);    
            this._isListening = false;
            micInstance.stop();
            outputFileStream.close();
            outputFileStream.end();
            console.log("Recording stopped at " + executionFolder + " " + recordFile);
            const message = await this.invokeCommandTranscript(recordFile);
            await this.insertTranscript(message, isTerminal);
        });
        micInstance.start();        
    }

    public async onTerminal() {                
        let terminal = vscode.window.activeTerminal;
        if (!terminal) {
            return;
        }
        if (!this._isListening) {
            vscode.window.showInformationMessage(`Terminal listening`);
            this._isListening = true;
            this._startRecording(true);
        }
    }
    public async onTextEditor(){
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        if (!this._isListening) {
            vscode.window.showInformationMessage(`Editor listening`);
            this._isListening = true;
            this._startRecording(false);
        }
    }
    
}
