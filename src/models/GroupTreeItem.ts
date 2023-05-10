import { TabGroup, TreeItemCollapsibleState } from "vscode";
import { CustomTreeItem } from "./CustomTreeItem";
import { CustomTreeItemType } from "../constants";
import { FileTreeItem } from "./FileTreeItem";

export class GroupTreeItem extends CustomTreeItem {
    constructor(data: TabGroup, label: string, tracking: boolean) {
        super(label, TreeItemCollapsibleState.Expanded, CustomTreeItemType.group, data, { tracking });
        data.tabs.map(tab => new FileTreeItem(tab, tab.label, this));
    }
}