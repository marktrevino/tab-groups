import { TabGroup, Tab, TreeItem, TreeItemCollapsibleState } from "vscode";
import { GroupTreeItem } from "./GroupTreeItem";
import { FileTreeItem } from "./FileTreeItem";

type TreeItemData = TabGroup | Tab;

export class CustomTreeItem extends TreeItem {
    protected tracking?: boolean;
    private parent?: CustomTreeItem;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        protected type: GroupTreeItem | FileTreeItem,
        protected data: TreeItemData, 
        extra?: { 
            parent?: CustomTreeItem, 
            tracking?: boolean
        }
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        this.type = type;
        this.data = data;
        this.parent = extra?.parent;
        this.tracking = extra?.tracking;
    }

    getCollapsibleState() {
        return this.collapsibleState;
    }

    getText() {
        return this.label;
    }

    getData() {
        return this.data;
    }

    getType() {
        return this.type;
    }

    getParent() {
        return this.parent;
    }

    toString() {
        return `${this.type}: ${this.label}`;
    }
}