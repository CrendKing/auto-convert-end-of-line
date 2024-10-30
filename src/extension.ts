import * as vscode from 'vscode'

const NOTIFICATION_DURATION_MS = 5000

let targetEol: vscode.EndOfLine | null
let eolText: string | null

function loadConfigEol() {
    switch (vscode.workspace.getConfiguration('files').get<string>('eol')) {
        case '\n':
            targetEol = vscode.EndOfLine.LF
            eolText = 'LF'
            break
        case '\r\n':
            targetEol = vscode.EndOfLine.CRLF
            eolText = 'CRLF'
            break
        default:
            targetEol = null
            eolText = null
            break
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

function changeEol(editor?: vscode.TextEditor) {
    console.log(editor?.document.fileName)

    if (!editor) {
        return
    }

    const document = editor.document
    if (!document ||
        document.isUntitled ||
        document.languageId === 'code-text-binary') {
        return
    }

    if (targetEol && document.eol !== targetEol) {
        editor.edit(function (edit) {
            edit.setEndOfLine(targetEol!)
            showMessageWithTimeout(`Changed end-of-line sequence to ${eolText}`, NOTIFICATION_DURATION_MS)
        })
    }
}

export function activate(context: vscode.ExtensionContext) {
    loadConfigEol()

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(changeEol),
        vscode.workspace.onDidChangeConfiguration(evt => {
            if (evt.affectsConfiguration('files.eol')) {
                loadConfigEol()
            }
        })
    )

    // the extension can be activated after the initial document is already opened
    changeEol(vscode.window.activeTextEditor)
}

export function deactivate() { }
