'use strict';

import { window,
         commands, 
         Disposable, 
         ExtensionContext, 
         StatusBarAlignment, 
         StatusBarItem, 
         TextDocument,
         workspace,
         Uri,
         ViewColumn } from 'vscode'; 
import * as path from 'path';
import * as fs from 'fs';
import { MailDocumentContentProvider } from './md2mailProvider';

export function activate(context: ExtensionContext) {

    let provider = new MailDocumentContentProvider(context);
    let registration = workspace.registerTextDocumentContentProvider('md2mail', provider);

    let c1 = commands.registerCommand('md2mail.showPreview', showPreview);
    context.subscriptions.push(c1, registration);

    workspace.onDidSaveTextDocument(document => {
          const uri = getMarkdownUri(document.uri);
          provider.update(uri);
    });

    workspace.onDidChangeTextDocument(event => {
          const uri = getMarkdownUri(event.document.uri);
          provider.update(uri);
    });
}

export function deactivate() {

}

function getMarkdownUri(uri: Uri): Uri {
    return uri.with({ scheme: 'md2mail', path: uri.path + '.rendered', query: uri.toString() });
}

function showPreview(uri?: Uri, sideBySide: boolean = false): Thenable<{}> {
    let resource = uri;
    if (!(resource instanceof Uri)) {
        if (window.activeTextEditor) {
            resource = window.activeTextEditor.document.uri;
        }
    }
    
    let thenable = commands.executeCommand(
        'vscode.previewHtml',
        getMarkdownUri(resource),
        ViewColumn.Two,
        `Preview '${path.basename(resource.fsPath)}'`
    );
    return thenable;
}