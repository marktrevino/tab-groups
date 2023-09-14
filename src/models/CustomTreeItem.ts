import { TabGroup, Tab, TreeItem, TreeItemCollapsibleState, Uri, FileType} from "vscode";

type TreeItemData = TabGroup | Tab;

export class CustomTreeItem extends TreeItem {
    protected tracking?: boolean;
    private parent?: CustomTreeItem;

    constructor(
        public readonly label: string,
        public readonly uri: Uri,
        public readonly type: FileType,
        public readonly collapsibleState: TreeItemCollapsibleState,
        protected data: TreeItemData, 
        extra?: { 
            parent?: CustomTreeItem, 
            tracking?: boolean
        }
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
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

    getParent() {
        return this.parent;
    }

    toString() {
        return `${typeof this}: ${this.label}`;
    }
}