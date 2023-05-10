import { TabGroup, TreeItemCollapsibleState } from "vscode";
import { CustomTreeItem } from "./CustomTreeItem";
import { FileTreeItem } from "./FileTreeItem";

export class GroupTreeItem extends CustomTreeItem {
    constructor(data: TabGroup, label: string, tracking: boolean) {
        super(label, TreeItemCollapsibleState.Expanded, data, { tracking });
        data.tabs.map(tab => new FileTreeItem(tab, tab.label, this));
    }
}