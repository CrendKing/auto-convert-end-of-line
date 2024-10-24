'use strict'

import * as vscode from 'vscode'

const POST_EVENT_TRIGGER_DELAY = 100
const NOTIFICATION_DURATION_MS = 5000

function showMessageWithTimeout(message: string, duration: number) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: message,
    }, async function (progress) {
        progress.report({ increment: 100 })
        await new Promise(resolve => setTimeout(resolve, duration))
    })
}

function changeEol(document?: vscode.TextDocument) {
    if (!document ||
        document.isUntitled ||
        document.languageId === 'code-text-binary' ||
        document !== vscode.window.activeTextEditor?.document) {
        return
    }

    const [targetEol, eolText] = function () {
        const filesEolConfig = vscode.workspace.getConfiguration('files').get<string>('eol')
        switch (filesEolConfig) {
            case '\n':
                return [vscode.EndOfLine.LF, 'LF']
            case '\r\n':
                return [vscode.EndOfLine.CRLF, 'CRLF']
            default:
                return [null, null]
        }
    }()

    if (targetEol && document.eol !== targetEol) {
        vscode.window.activeTextEditor!.edit(function (edit) {
            edit.setEndOfLine(targetEol)
            showMessageWithTimeout(`Changed end-of-line sequence to ${eolText}`, NOTIFICATION_DURATION_MS)
        })
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(async function (document) {
            // onDidOpenTextDocument() is triggered before window.activeTextEditor.document is updated
            await new Promise(resolve => setTimeout(resolve, POST_EVENT_TRIGGER_DELAY))

            changeEol(document)
        })
    )

    // the extension can be activated after the initial document is already opened
    changeEol(vscode.window.activeTextEditor?.document)
}

export function deactivate() { }
