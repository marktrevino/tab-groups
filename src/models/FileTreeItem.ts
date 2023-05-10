import { Tab, TreeItemCollapsibleState } from "vscode";
import { CustomTreeItem } from "./CustomTreeItem";
import { GroupTreeItem } from "./GroupTreeItem";

export class FileTreeItem extends CustomTreeItem {
    constructor(data: Tab, label: string, parent: GroupTreeItem) {
        super(label, TreeItemCollapsibleState.None, data, { parent } );
    }
}