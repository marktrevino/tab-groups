import { FileType, TabGroup, TreeItemCollapsibleState, Uri } from "vscode";
import { CustomTreeItem } from "./CustomTreeItem";
import { FileTreeItem } from "./FileTreeItem";

export class GroupTreeItem extends CustomTreeItem {
    constructor(data: TabGroup, label: string, uri: Uri , type: FileType, tracking: boolean) {
        super(label, uri, type,TreeItemCollapsibleState.Collapsed, data, { tracking });
        data.tabs?.map(tab => new FileTreeItem(tab, tab.label, uri, type,this));
    }
}