import { Tab, Uri, window, workspace } from "vscode";
import FileTreeItem from "./models/FileTreeItem";
import CustomTabGroup from "./models/CustomTabGroup";
import { extensionName } from "./constants";

export async function openFile(item: FileTreeItem): Promise<void> {
    const tab = item.getData() as Tab;
    const input = tab.input as any;
    const uri: Uri = input.uri;
    // TODO (marktrevino): figure out what these props can be used for
    // const original: Uri = input.original;
	// const modified: Uri = input.modified;
	// const viewType = input.viewType;
	// const notebookType = input.notebookType;

    if(workspace.workspaceFolders) {
        for(let i = 0; i < workspace.workspaceFolders.length; i++) {
            // TODO (marktrevino): figure out what these props are for
            // const wsUri = workspace.workspaceFolders[i].uri;
            try {
                await window.showTextDocument(Uri.parse(`${uri.path}`), 
                    { 
                        preview: false,
                    });
            } catch (error) {
                console.log(error);
                continue;
            }
        }
    }

    console.log(item.getData() as Tab);
    return;

}

export function isTabInGroup(tab: Tab, group: CustomTabGroup): boolean {
    return group.tabs?.includes(tab) ?? false;
}

export function getAllOpenTabNamesFromVSCode(): (string | undefined)[] {
    let tabgroups = window.tabGroups.all;
    let groupTabs = tabgroups.map(tabGroup => tabGroup.tabs);
    return groupTabs.map(tabArray => tabArray?.map(tab => tab.label)).flat();
}

export function isAnyTabsOpenInVSCode(): boolean {
    let openTabs = getAllOpenTabNamesFromVSCode() as string[];

    if (openTabs.length === 0) { 
        window.showErrorMessage(extensionName + ': You don\'t have any tabs open!');
        return false;
    }
    return true; 
}

export function getTabFromTabGroups(tabString: string): Tab | undefined {
    let tabGroupsArray = window.tabGroups.all;
    let tabGroups = tabGroupsArray.map(tabGroup => tabGroup.tabs);
    let tab = tabGroups.find(tabArray => tabArray?.find(tab => tab.label === tabString))?.find(tab => tab.label === tabString);
    return tab;
}

export function isStringEmptyOrNull(str: string | undefined): boolean {
    return str === undefined || str.length === 0;
}