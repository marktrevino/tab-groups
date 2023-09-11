import { 
    Command,
    EventEmitter,
    Event,
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState,
    ProviderResult,
    TabGroup,
    Tab
} from 'vscode';
import * as path from 'path';
import { CustomTreeItem } from './CustomTreeItem';
import { commandNames } from '../constants';
import { GroupTreeItem } from './GroupTreeItem';
import { FileTreeItem } from './FileTreeItem';

export class GroupProvider implements TreeDataProvider<CustomTreeItem> {
    groups: { [key: string]: TabGroup };
    private _tracking: string = '';

    private _onDidChangeTreeData: EventEmitter<CustomTreeItem | undefined | void> = new EventEmitter<CustomTreeItem | undefined | void>();
    readonly onDidChangeTreeData: Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor() {
        this.groups = {};
    }

    getTreeItem(element: CustomTreeItem): TreeItem {
        const item = new TreeItem(element.getText(), element.getCollapsibleState());
        if(element instanceof GroupTreeItem) {
            item.command = {
                command: commandNames.openFile,
                title: 'Restore Group',
                arguments: [element],
            };
        }
        if(element instanceof FileTreeItem) {
            item.command = {
                command: commandNames.openFile,
                title: 'Open file',
                arguments: [element],
            };
        }
        return item;
    }

    getParent(element: CustomTreeItem): ProviderResult<CustomTreeItem> {
        return element.getParent();
    }

    getChildren(element?: CustomTreeItem): Thenable<CustomTreeItem[] | undefined> {
        if (element === undefined) {
            return Promise.resolve(Object.keys(this.groups).sort((a, b) => a.localeCompare(b)).map(
                name => new GroupTreeItem(this.groups[name] as TabGroup, name, this._tracking === name)));
        }

        if(element instanceof GroupTreeItem) {
            const name = (element as GroupTreeItem).getText();
            const group = this.groups[name];
            return Promise.resolve(group?.tabs?.map(tab => new FileTreeItem(tab, tab.label, element as GroupTreeItem)));
        }
        return Promise.resolve([]);
    }

    /**
     * Adds a group with tabs to the tree view
     * @param groupName the name of the group
     * @param tabs the tabs to add
     */
    add(groupName: string, tabs: TabGroup): void {
        this.groups[groupName] = tabs;
        this._onDidChangeTreeData.fire();
    }

    /**
     * Adds a single tab to a group
     * @param groupName the name of the group
     * @param tab the tab to add
     */
    addTabToGroup(groupName: string, tab: Tab): void {
        this.groups[groupName].tabs?.push(tab);
        this._onDidChangeTreeData.fire();
    }

    /**
     * Creates an empty group
     * @param groupName 
     */
    addEmptyGroup(groupName: string): void {
        this.groups[groupName] = { isActive: false, viewColumn: 1, tabs: [], activeTab: undefined};
        this._onDidChangeTreeData.fire();
    }
}

export class Group extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public readonly command?: Command
    ) {
        super(label, collapsibleState);
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    };

    contextValue = 'dependency';
}