import * as vscode from 'vscode';

export async function katariCallCode(data: string) {
    try {
        const response = await fetch("http://0.0.0.0:8000/code", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.text();
        return responseData;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to call API: ${error}`);
        console.error(error);
        return null;
    }
}