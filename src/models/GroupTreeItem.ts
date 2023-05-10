import { TabGroup, TreeItemCollapsibleState } from "vscode";
import { CustomTreeItem, TreeItemType } from "./CustomTreeItem";

export class GroupTreeItem extends CustomTreeItem {
    constructor(data: TabGroup, name: string, tracking: boolean) {
        super(name, TreeItemCollapsibleState.Expanded, TreeItemType.group, data, { name, tracking });
    }

    getText() {
        return this.tracking ? `${this.name} (tracking)` : this.name;
    }

    getName() {
        return this.name;
    }
}