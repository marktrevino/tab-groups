import { 
Command,
EventEmitter,
Event,
window,
TreeDataProvider,
TreeItem,
TreeItemCollapsibleState,
ProviderResult,
Tab,
TabGroup} from 'vscode';
import * as path from 'path';
import { CustomTreeItem, TreeItemType } from './models/CustomTreeItem';
import { CommandNames } from './constants';
import { GroupTreeItem } from './models/GroupTreeItem';

export class GroupProvider implements TreeDataProvider<CustomTreeItem> {
    groups: { [key: string]: TabGroup };
    private _tracking: string = '';

    private _onDidChangeTreeData: EventEmitter<CustomTreeItem | undefined | void> = new EventEmitter<CustomTreeItem | undefined | void>();
    readonly onDidChangeTreeData: Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor() {
        this.groups = {};
        console.log('1');
        window.tabGroups.all.map(group => this.groups['testing'] = group);
        new GroupTreeItem(this.groups['testing'], 'testing', false);
    }

    getTreeItem(element: CustomTreeItem): TreeItem {
        console.log('howdy');
        const item = new TreeItem(element.getText(), element.getCollapsibleState());
        item.contextValue = element.getType();
        console.log(element.getType());
        if(element.getType() === 'group') {
            item.command = {
                command: CommandNames.HelloWorld,
                title: 'Restore Group',
                arguments: [element],
            };
        }
        if(element.getType() === 'file') {
            item.command = {
                command: CommandNames.HelloWorld,
                title: 'Open file',
                arguments: [element],
            };
        }
        return item;
    }

    getParent(element: CustomTreeItem): ProviderResult<CustomTreeItem> {
        return element.getParent();
    }

    getChildren(element?: CustomTreeItem): Thenable<CustomTreeItem[]> {
        if (element === undefined) {
            return Promise.resolve(Object.keys(this.groups).sort((a, b) => a.localeCompare(b)).map(
                name => new GroupTreeItem(this.groups[name], name, this._tracking === name)));
            // const group = this.groups['testing'];
            // //go through all of the groups and display them
            // return Promise.resolve(group.map(tab => new CustomTreeItem(tab.label,TreeItemCollapsibleState.None, TreeItemType.file, tab, { parent: element })));
        }
        if(element.getType() === 'group') {
            console.log('testing again');
            const name = (element as GroupTreeItem).getName();
            const group = this.groups[name];
            console.log(group);
            return Promise.resolve(group.tabs.map(tab => new CustomTreeItem(tab.label,TreeItemCollapsibleState.None, TreeItemType.file, tab, { parent: element })));
        }
        return Promise.resolve([]);
    }

    addGroup(name: string, tabs: TabGroup): void {
        this.groups[name] = tabs;
        this._onDidChangeTreeData.fire();
    }

/**
 * Get group from the active tabs
 */
private getGroups(): Group[] {
    const groups: Group[] = [];

    window.tabGroups.all.forEach((group) => { 
        group.tabs.forEach((tab) => { 
            groups.push(new Group(tab.label, TreeItemCollapsibleState.None));
        });
    });
    return groups;
}
}

export class Group extends TreeItem {

    constructor(
        public readonly label: string,
        // private readonly version: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public readonly command?: Command
    ) {
        super(label, collapsibleState);

        // this.tooltip = `${this.label}-${this.version}`;
        // this.description = this.version;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    };

    contextValue = 'dependency';
}