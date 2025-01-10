import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('close-by-extension.closeFiles', async () => {
        try {
            // Get the extension from user input
            const extension = await vscode.window.showInputBox({
                prompt: 'Enter file extension to close (e.g., js, ts, md)',
                placeHolder: 'Extension without dot (e.g., js)',
                validateInput: (value: string) => {
                    return value.includes('.') ? 'Please enter extension without dot' : null;
                }
            });

            if (!extension) {
                return; // User cancelled
            }

            // Get all open text editors
            const editors = vscode.window.tabGroups.all
                .map(group => group.tabs)
                .flat()
                .filter(tab => tab.input instanceof vscode.TabInputText);

            // Filter editors by file extension
            const editorsToClose = editors.filter(editor => {
                const uri = (editor.input as vscode.TabInputText).uri;
                return uri.path.toLowerCase().endsWith(`.${extension.toLowerCase()}`);
            });

            if (editorsToClose.length === 0) {
                vscode.window.showInformationMessage(`No open files found with extension .${extension}`);
                return;
            }

            // Close the files
            await Promise.all(editorsToClose.map(editor => 
                vscode.window.tabGroups.close(editor)
            ));

            vscode.window.showInformationMessage(
                `Closed ${editorsToClose.length} file(s) with extension .${extension}`
            );
        } catch (error) {
            vscode.window.showErrorMessage(
                `Error closing files: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}