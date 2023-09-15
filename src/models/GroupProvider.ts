import {
    EventEmitter,
    Event,
    TreeDataProvider,
    TreeItem,
    ProviderResult,
    Tab as VSCodeTab,
    window,
    FileChangeEvent,
    Uri,
    FileChangeType,
    FileType,
    FileSystemError,
    TabGroup
} from 'vscode';
import CustomTreeItem from './CustomTreeItem';
import { commandNames, extensionName } from '../constants';
import GroupTreeItem from './GroupTreeItem';
import FileTreeItem from './FileTreeItem';
import * as fs from 'fs';
import { join } from 'path';

import { getAllOpenTabNamesFromVSCode, getTabFromTabGroups, isAnyTabsOpenInVSCode, isStringEmptyOrNull } from '../utils';
import CustomTabGroup from './CustomTabGroup';

export class GroupProvider implements TreeDataProvider<CustomTreeItem> {
    groups: { [key: string]: CustomTabGroup };

    // Event emitter for when the data changes
    private _onDidChangeData: EventEmitter<FileChangeEvent[]>;

    // private _onDidChangeTreeData: EventEmitter<CustomTreeItem | undefined | void> = new EventEmitter<CustomTreeItem | undefined | void>();
    // readonly onDidChangeTreeData: Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor() {
        this.groups = {};

        this._onDidChangeData = new EventEmitter<FileChangeEvent[]>();
    }

    get onDidChangeData(): Event<FileChangeEvent[]> {
        return this._onDidChangeData.event;
    }

    // Watch that submits the command event and file description
    watch(uri: Uri, options: { recursive: boolean; excludes: string[]; }): .Disposable {
		const watcher = fs.watch(uri.fsPath, { recursive: options.recursive }, async (event, filename) => {
			if (filename) {
				const filepath = join(uri.fsPath, _.normalizeNFC(filename.toString()));

				this._onDidChangeData.fire([{
					type: event === 'change' ? FileChangeType.Changed : await _.exists(filepath) ? FileChangeType.Created : FileChangeType.Deleted,
					uri: uri.with({ path: filepath })
				} as FileChangeEvent]);
			}
		});

		return { dispose: () => watcher.close() };
	}

    handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null | undefined, result: T): void {
		if (error) {
			reject(this.massageError(error));
		} else {
			resolve(result);
		}
	}

    massageError(error: Error & { code?: string }): Error {
		if (error.code === 'ENOENT') {
			return FileSystemError.FileNotFound();
		}

		if (error.code === 'EISDIR') {
			return FileSystemError.FileIsADirectory();
		}

		if (error.code === 'EEXIST') {
			return FileSystemError.FileExists();
		}

		if (error.code === 'EPERM' || error.code === 'EACCES') {
			return FileSystemError.NoPermissions();
		}

		return error;
	}

    getTreeItem(element: CustomTreeItem): TreeItem {
        const item = new TreeItem(element.getText(), element.getCollapsibleState());
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
                name => new GroupTreeItem(this.groups[name] as TabGroup, name, Uri.parse(''), FileType.Directory)));
        }

        if(element instanceof GroupTreeItem) {
            const name = (element as GroupTreeItem).getText();
            const group = this.groups[name];
            return Promise.resolve(group?.tabs?.map(tab => new FileTreeItem(tab, tab.label, Uri.parse(''), FileType.File, element as GroupTreeItem))));
        }
        return Promise.resolve([]);
    }

    getGroupNames (): string[] { 
        return Object.keys(this.groups);
    }

    getGroupTabs (groupName: string): VSCodeTab[] | undefined { 
        return this.groups[groupName].tabs;
    }

    /**
     * Adds a group with tabs to the tree view
     * @param groupName the name of the group
     * @param tabs the tabs to add
     */
    add(groupName: string, tabs: CustomTabGroup): void {
        this.groups[groupName] = tabs;
    }

    /**
     * Adds a single tab to a group
     * @param groupName the name of the group
     * @param tab the tab to add
     */
    addToGroup(groupName: string, tab: VSCodeTab): void {
        // Check that file is not in the tab already
        if (this.groups[groupName].tabs?.find(tab => tab.label === tab.label)) {
            window.showErrorMessage(extensionName + ': The tab you are trying to add already exists in this group');
            return;
        }
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

    async addAllOpenTabsToGroup(): Promise<boolean> {
        isAnyTabsOpenInVSCode();

        let name = await window.showInputBox({
            placeHolder: 'Please enter a name for the group'    
        });
    
        if (isStringEmptyOrNull(name)) {
            window.showErrorMessage(extensionName + ': Please enter a valid group name');
            return false;
        }
    
        window.tabGroups.all.map(group => {
            this.add(name as string, group);
            // TODO (marktrevino): PREVENT GROUPS FROM BEING OVERWRITTEN WHEN SPLIT VIEW IS USED
        });
    
        return true;
    }

    async addTabToGroup(): Promise<boolean> {
        isAnyTabsOpenInVSCode();
        let openTabs = getAllOpenTabNamesFromVSCode() as string[];

        if (openTabs.length === 0) { return false; } 

        let tabToAdd = await window.showQuickPick(openTabs, {
            placeHolder: 'Please select the file you would like to add to a group',
        });

        if(Object.keys(this.groups).length === 0) {
            let groupName = await window.showInputBox({
                placeHolder: 'You dont have any groups yet, please enter a name for a new group'
            });
            if (groupName === undefined) { return false; }
            this.addEmptyGroup(groupName as string);

            this.addToGroup(groupName as string, getTabFromTabGroups(tabToAdd as string) as VSCodeTab);

            return true;
        }

        let groupNames = [];
        for (let key in this.groups) {
            groupNames.push(key);
        }

        let groupToAddTo = await window.showQuickPick(groupNames, {
            placeHolder: 'Please select the group you would like to add the file to'
        });

        this.addToGroup(groupToAddTo as string, getTabFromTabGroups(tabToAdd as string) as VSCodeTab);
        
        return true;
    }

    async createGroup(): Promise<boolean> {
        let name = await window.showInputBox({
            placeHolder: 'Please enter a name for the group'
        });
    
        if (name === undefined) { return false; }
    
        this.addEmptyGroup(name);
    
        return true;
    }
}