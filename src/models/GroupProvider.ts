import { 
    Command,
    EventEmitter,
    Event,
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState,
    ProviderResult,
    TabGroup,
    Tab,
    FileChangeEvent,
    Uri,
    FileChangeType,
    FileType,
    FileSystemError
} from 'vscode';
import * as path from 'path';
import { CustomTreeItem } from './CustomTreeItem';
import { commandNames } from '../constants';
import { GroupTreeItem } from './GroupTreeItem';
import { FileTreeItem } from './FileTreeItem';
import * as fs from 'fs';

export class GroupProvider implements TreeDataProvider<CustomTreeItem> {
    groups: { [key: string]: TabGroup };
    private _tracking: string = '';

    // Event emitter for when the data changes
    private _onDidChangeData: EventEmitter<FileChangeEvent[]>;

    // Used for when the Tab group changes
    private _onDidChangeTreeData: EventEmitter<CustomTreeItem | undefined | void> = new EventEmitter<CustomTreeItem | undefined | void>();
    readonly onDidChangeTreeData: Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

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
				const filepath = path.join(uri.fsPath, _.normalizeNFC(filename.toString()));

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

    readDirectory(uri: Uri): [string, FileType][] | Thenable<[string, FileType][]> {
		return this._readDirectory(uri);
	}

	async _readDirectory(uri: Uri): Promise<[string, FileType][]> {
		const children = await fs.readdir(uri, (error, children) => this.handleResult(resolve, reject, error, normalizeNFC(children)));

		const result: [string, FileType][] = [];
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			result.push([child, child.fileType ?? FileType.Unknown]);
		}

		return Promise.resolve(result);
	}

    getTreeItem(element: CustomTreeItem): TreeItem {
        const item = new TreeItem(element.getText(), element.getCollapsibleState());
        if(element instanceof GroupTreeItem) {
            item.command = {
                command: commandNames.openFile,
                title: 'Open Group',
                arguments: [element.uri],
            };
        }
        if(element instanceof FileTreeItem) {
            item.command = {
                command: commandNames.openFile,
                title: 'Open file',
                arguments: [element.uri],
            };
        }
        return item;
    }

    getParent(element: CustomTreeItem): ProviderResult<CustomTreeItem> {
        return element.getParent();
    }

    getChildren(element?: CustomTreeItem): Thenable<CustomTreeItem[] | undefined> {
        // if (element === undefined) {
        //     return Promise.resolve(Object.keys(this.groups).sort((a, b) => a.localeCompare(b)).map(
        //         name => new GroupTreeItem(this.groups[name] as TabGroup, name, this._tracking === name)));
        // }

        // if(element instanceof GroupTreeItem) {
        //     const name = (element as GroupTreeItem).getText();
        //     const group = this.groups[name];
        //     return Promise.resolve(group?.tabs?.map(tab => new FileTreeItem(tab, tab.label, element as GroupTreeItem)));
        // }
        // return Promise.resolve([]);

        if (element) {
			const children = await this.readDirectory(element.uri);
			return children.map(([name, type]) => ({ uri: vscode.Uri.file(path.join(element.uri.fsPath, name)), type }));
		}

		const workspaceFolder = (vscode.workspace.workspaceFolders ?? []).filter(folder => folder.uri.scheme === 'file')[0];
		if (workspaceFolder) {
			const children = await this.readDirectory(workspaceFolder.uri);
			children.sort((a, b) => {
				if (a[1] === b[1]) {
					return a[0].localeCompare(b[0]);
				}
				return a[1] === vscode.FileType.Directory ? -1 : 1;
			});
			return children.map(([name, type]) => ({ uri: vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, name)), type }));
		}

		return [];
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

    /**
     * Deletes the selected group
     * @param groupName 
     */    
    deleteGroup(groupName: string): void {
        if (!this.groups){
            this.addEmptyGroup('No groups yet');
        }
        delete this.groups[groupName];
        this._onDidChangeTreeData.fire();
    }

    /**
     * Deletes the file from selected group
     * @param groupName
     * @param tabName
    */
    deleteTabFromGroup(groupName: string, tabName: any): void {
        if(this.groups[groupName].tabs)
        {
            this.groups[groupName].tabs = this.groups[groupName].tabs?.filter(tab => tab.label !== tabName.label);
            this._onDidChangeTreeData.fire();
        }
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