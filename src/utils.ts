import { Tab, Uri, window, workspace } from "vscode";
import { GroupProvider } from "./models/GroupProvider";
import { FileTreeItem } from "./models/FileTreeItem";
import * as path from 'path';

export async function saveGroup(groupProvider: GroupProvider): Promise<boolean> {
    let name = await window.showInputBox({
        placeHolder: 'Please enter a name for the group'    
    });

    if (name === undefined) { return false; }
    
    // console.log('window.tabGroups.all.length: ' + window.tabGroups.all.length);
    window.tabGroups.all.map(group => {
        groupProvider.add(name ?? '', group);
        // console.log('1');
        // TODO: PREVENT GROUPS FROM BEING OVERWRITTEN WHEN SPLIT VIEW IS USED
    });

    return true;
}

export async function addToGroup(groupProvider: GroupProvider): Promise<boolean> {
    let tabToAdd = await window.showQuickPick(getAllTabsFromTabGroups(), {
        placeHolder: 'Please select the file you would like to add to a group',
    });

    console.log(tabToAdd);
    let groupNames = [];
    for (let key in groupProvider.groups) {
        groupNames.push(key);
    }

    if(groupNames.length === 0) {
        let name = await window.showInputBox({
            placeHolder: 'You dont have any groups yet, please enter a name for a new group'
        });
        if (name === undefined) { return false; }
        console.log('name: ' + name);
        console.log('window.tabGroups.all.length: ' + window.tabGroups.all.length);
        // window.tabGroups.all.map(group => groupProvider.add(name ?? '', group));
    }
    let groupToAddTo = await window.showQuickPick(groupNames, {
        placeHolder: 'Please select the group you would like to add the file to'
    });

    
    return true;
}

export async function openFile(item: FileTreeItem): Promise<void> {

    // console.log(item.label);
    const tab = item.getData() as Tab;
    const input = tab.input as any;
    const uri: Uri = input.uri;
    const original: Uri = input.original;
	const modified: Uri = input.modified;
	const viewType = input.viewType;
	const notebookType = input.notebookType;

    if(workspace.workspaceFolders) {
        for(let i = 0; i < workspace.workspaceFolders.length; i++) {
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

function getAllTabsFromTabGroups() {
    let tabgroups = window.tabGroups.all;
    let groupTabs = tabgroups.map(tabGroup => tabGroup.tabs);
    return groupTabs.map(tabArray => tabArray.map(tab => tab.label)).flat();
}

function getTabFromTabGroups(tabString: string) {
    // let tabGroupsArray = window.tabGroups.all;
    // let tabGroups = tabGroupsArray.map(tabGroup => tabGroup.tabs);
    // return tabGroups.map(tabArray => tabArray.find(tabString)).flat();
}