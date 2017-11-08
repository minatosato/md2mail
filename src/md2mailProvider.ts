'use strict';

import * as vscode from 'vscode';
import { Uri } from 'vscode';
import * as https from 'https';
import * as convert from './convert';
import * as fs from 'fs';

export class MailDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<Uri>();
    private raw_body: string = null;

    public constructor(private _context: vscode.ExtensionContext) { }
    
    public provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string>  {
        return vscode.workspace.openTextDocument(Uri.parse(uri.query)).then(document => {
            let header = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    <style type="text/css">
                    * {
                        font-family: Consolas
                    }
                    </style>
                </head>
            `;
            let body = document.getText();
            body = convert(body);
            this.raw_body = body;
            this.saveToText(uri);
            body = replaceAll(body, ' ', '&nbsp;');
            body = replaceAll(body, '　', '&nbsp;&nbsp;');
            body = replaceAll(body, '\n', '<br>');
            body = '<body>' + body + '</body>';
            return header + body;
        });
    }

    get onDidChange(): vscode.Event<Uri> {
        return this._onDidChange.event;
    }

    public saveToText(uri: Uri) {
        fs.writeFileSync(uri.path.substr(0, uri.path.length-'.md.rendered'.length)+'.txt', this.raw_body);
    }
    
    public update(uri: Uri) {
        this._onDidChange.fire(uri);
    }
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}