import { TabGroup, TreeItemCollapsibleState } from "vscode";
import CustomTreeItem from "./CustomTreeItem";
import FileTreeItem from "./FileTreeItem";

export default class GroupTreeItem extends CustomTreeItem {
    constructor(data: TabGroup, label: string) {
        super(label, TreeItemCollapsibleState.Collapsed, data);
        data.tabs?.map(tab => new FileTreeItem(tab, tab.label, this));
    }
}