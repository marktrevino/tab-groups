import { Tab, TreeItemCollapsibleState } from "vscode";
import { CustomTreeItem } from "./CustomTreeItem";
import { CustomTreeItemType } from "../constants";
import { GroupTreeItem } from "./GroupTreeItem";

export class FileTreeItem extends CustomTreeItem {
    constructor(data: Tab, label: string, parent: GroupTreeItem) {
        super(label, TreeItemCollapsibleState.None, CustomTreeItemType.group, data, { parent } );
    }

}