import { FileType, TabGroup, TreeItemCollapsibleState, Uri } from "vscode";
import CustomTreeItem from "./CustomTreeItem";
import FileTreeItem from "./FileTreeItem";

export default class GroupTreeItem extends CustomTreeItem {
    constructor(data: TabGroup, label: string, uri: Uri , type: FileType) {
        super(label, uri, type,TreeItemCollapsibleState.Collapsed, data);
        data.tabs?.map(tab => new FileTreeItem(tab, tab.label, uri, type,this));
    }
}