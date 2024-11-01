import * as vscode from 'vscode'

const NOTIFICATION_DURATION_MS = 5000

function loadConfigEol(): vscode.EndOfLine | null {
    switch (vscode.workspace.getConfiguration('files').get<string>('eol')) {
        case '\n':
            return vscode.EndOfLine.LF
        case '\r\n':
            return vscode.EndOfLine.CRLF
        default:
            return null
    }
}

function showMessageWithTimeout(message: string, duration: number) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: message,
    }, async function (progress) {
        progress.report({ increment: 100 })
        await new Promise(resolve => setTimeout(resolve, duration))
    })
}

export function activate(context: vscode.ExtensionContext) {
    let configEol = loadConfigEol()

    function changeEol(editor?: vscode.TextEditor) {
        if (!editor) {
            return
        }

        const document = editor.document
        if (!document ||
            document.isUntitled ||
            document.languageId === 'code-text-binary') {
            return
        }

        if (configEol && document.eol !== configEol) {
            editor.edit(function (edit) {
                edit.setEndOfLine(configEol!)
                showMessageWithTimeout(`Changed end-of-line sequence to ${vscode.EndOfLine[configEol!]}`, NOTIFICATION_DURATION_MS)
            })
        }
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(changeEol),
        vscode.workspace.onDidChangeConfiguration(evt => {
            if (evt.affectsConfiguration('files.eol')) {
                configEol = loadConfigEol()
            }
        })
    )

    // the extension can be activated after the initial document is already opened
    changeEol(vscode.window.activeTextEditor)
}

export function deactivate() { }
