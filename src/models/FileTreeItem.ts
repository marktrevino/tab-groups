import { FileType, Tab, TreeItemCollapsibleState, Uri } from "vscode";
import { CustomTreeItem } from "./CustomTreeItem";
import { GroupTreeItem } from "./GroupTreeItem";

export class FileTreeItem extends CustomTreeItem {
    constructor(data: Tab, label: string, uri: Uri , type: FileType, parent: GroupTreeItem) {
        super(label, uri, type, TreeItemCollapsibleState.None, data, { parent } );
    }
}