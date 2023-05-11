import { 
Command,
EventEmitter,
Event,
window,
TreeDataProvider,
TreeItem,
TreeItemCollapsibleState,
ProviderResult,
TabGroup} from 'vscode';
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
            // console.log(`group '${element.label}' created!`);
            item.command = {
                command: commandNames.openFile,
                title: 'Restore Group',
                arguments: [element],
            };
        }
        if(element instanceof FileTreeItem) {
            // console.log(`${element.label} was added to group '${element.getParent()?.label}'`);
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

    getChildren(element?: CustomTreeItem): Thenable<CustomTreeItem[]> {
        if (element === undefined) {
            return Promise.resolve(Object.keys(this.groups).sort((a, b) => a.localeCompare(b)).map(
                name => new GroupTreeItem(this.groups[name], name, this._tracking === name)));
            // const group = this.groups['testing'];
            // //go through all of the groups and display them
            // return Promise.resolve(group.map(tab => new CustomTreeItem(tab.label,TreeItemCollapsibleState.None, TreeItemType.file, tab, { parent: element })));
        }
        if(element instanceof GroupTreeItem) {
            const name = (element as GroupTreeItem).getText();
            const group = this.groups[name];
            return Promise.resolve(group.tabs.map(tab => new FileTreeItem(tab, tab.label, element as GroupTreeItem)));
        }
        return Promise.resolve([]);
    }

    add(name: string, tabs: TabGroup): void {
        this.groups[name] = tabs;
        // window.tabGroups.all.map(group => this.groups['testing'] = group);
        this._onDidChangeTreeData.fire();
    }

    delete(name: string): void {
        delete this.groups[name];
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