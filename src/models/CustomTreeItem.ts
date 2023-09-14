import { TabGroup, Tab, TreeItem, TreeItemCollapsibleState } from "vscode";

type TreeItemData = TabGroup | Tab;

export default class CustomTreeItem extends TreeItem {
    private parent?: CustomTreeItem;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        protected data: TreeItemData, 
        extra?: { 
            parent?: CustomTreeItem
        }
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        this.data = data;
        this.parent = extra?.parent;
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

    getParent() {
        return this.parent;
    }

    toString() {
        return `${typeof this}: ${this.label}`;
    }
}