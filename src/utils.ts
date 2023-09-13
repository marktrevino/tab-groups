import { Tab, Uri, window, workspace } from "vscode";
import { GroupProvider } from "./models/GroupProvider";
import { FileTreeItem } from "./models/FileTreeItem";

export async function createGroup(groupProvider: GroupProvider): Promise<boolean> {
    let name = await window.showInputBox({
        placeHolder: 'Please enter a name for the group'
    });

    if (name === undefined) { return false; }

    groupProvider.addEmptyGroup(name);

    return true;
}

export async function saveAllOpenTabsToGroup(groupProvider: GroupProvider): Promise<boolean> {
    if (isSavedGroupsEmpty(groupProvider)) {
        let name = await window.showInputBox({
            placeHolder: 'You dont have any groups yet, please enter a name for a new group'    
        });

        if (name === undefined) { return false; }
        window.tabGroups.all.map(group => {
            groupProvider.addTabsToGroup(name as string, group);
            // TODO (marktrevino): PREVENT GROUPS FROM BEING OVERWRITTEN WHEN SPLIT VIEW IS USED
        });
    } else {
        let quickPickOptions = Object.keys(groupProvider.groups);
        quickPickOptions.push('Create New Group');

        let name = await window.showQuickPick(quickPickOptions, {
            placeHolder: 'Please select the group you would like to add the tabs to or create a new group'
        });

        if (name === undefined) { return false; }
        if (name === 'Create New Group') {
            let newGroupName = await window.showInputBox({
                placeHolder: 'Please enter a name for your new group!'    
            });

            if (newGroupName === undefined) { return false; }

            groupProvider.addEmptyGroup(newGroupName);
            window.tabGroups.all.map(group => {
                groupProvider.addTabsToGroup(newGroupName as string, group);
                // TODO (marktrevino): PREVENT GROUPS FROM BEING OVERWRITTEN WHEN SPLIT VIEW IS USED
            });
        } else {
            window.tabGroups.all.map(group => {
                groupProvider.addTabsToGroup(name as string, group);
                // TODO (marktrevino): PREVENT GROUPS FROM BEING OVERWRITTEN WHEN SPLIT VIEW IS USED
            });
        }
    }

    return true;
}

export async function addToGroup(groupProvider: GroupProvider): Promise<boolean> {
    let openTabs = getAllOpenTabNamesFromTabGroups() as string[];

    if (openTabs.length === 0) { return false; } 

    let tabToAdd = await window.showQuickPick(openTabs, {
        placeHolder: 'Please select the file you would like to add to a group',
    });

    if(isSavedGroupsEmpty(groupProvider)) {
        let groupName = await window.showInputBox({
            placeHolder: 'You dont have any groups yet, please enter a name for a new group'
        });
        if (groupName === undefined) { return false; }
        groupProvider.addEmptyGroup(groupName as string);

        groupProvider.addTabToGroup(groupName as string, getTabFromTabGroups(tabToAdd as string) as Tab);

        return true;
    }

    let groupNames = [];
    for (let key in groupProvider.groups) {
        groupNames.push(key);
    }

    let groupToAddTo = await window.showQuickPick(groupNames, {
        placeHolder: 'Please select the group you would like to add the file to'
    });

    groupProvider.addTabToGroup(groupToAddTo as string, getTabFromTabGroups(tabToAdd as string) as Tab);
    
    return true;
}

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

function getAllOpenTabNamesFromTabGroups(): (string | undefined)[] {
    let tabgroups = window.tabGroups.all;
    let groupTabs = tabgroups.map(tabGroup => tabGroup.tabs);
    return groupTabs.map(tabArray => tabArray?.map(tab => tab.label)).flat();
}

function getTabFromTabGroups(tabString: string): Tab | undefined {
    let tabGroupsArray = window.tabGroups.all;
    let tabGroups = tabGroupsArray.map(tabGroup => tabGroup.tabs);
    let tab = tabGroups.find(tabArray => tabArray?.find(tab => tab.label === tabString))?.find(tab => tab.label === tabString);
    return tab;
}

function isSavedGroupsEmpty(groupProvider: GroupProvider): boolean {
    return  Object.keys(groupProvider.groups).length === 0;
}