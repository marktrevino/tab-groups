import { TabGroup, Tab, TreeItem, TreeItemCollapsibleState } from "vscode";

type TreeItemData = TabGroup | Tab;

export enum TreeItemType {
    group = 'group', file = 'file'
}

export class CustomTreeItem extends TreeItem {
    // protected type: TreeItemType;
    protected data: TreeItemData;
    protected name: string;
    protected tracking?: boolean;
    private parent?: CustomTreeItem;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        protected type: TreeItemType, data: TreeItemData, 
        extra?: {
            name?: string, 
            parent?: CustomTreeItem, 
            tracking?: boolean
        }
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        this.type = type;
        this.data = data;
        this.parent = extra?.parent;
        this.name = extra?.name ?? '';
        this.tracking = extra?.tracking;
    }

    getCollapsibleState() {
        return this.collapsibleState;
    }

    getText() {
        if (this.type === TreeItemType.file) {
            return this.label;
        }
        return this.name;
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
        return `${this.type}: ${this.name}`;
    }
}