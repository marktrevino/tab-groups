import { Tab, Uri, window, workspace } from "vscode";
import { GroupProvider } from "./models/GroupProvider";
import { FileTreeItem } from "./models/FileTreeItem";
import * as path from 'path';

export async function saveGroup(groupProvider: GroupProvider): Promise<boolean> {
    let name = await window.showInputBox({
        placeHolder: 'Please enter a name for the group'    
    });

    if (name === undefined) { return false; }
    
    console.log('window.tabGroups.all.length: ' + window.tabGroups.all.length);
    window.tabGroups.all.map(group => {
        groupProvider.add(name ?? '', group);
        console.log('1')
        // TODO: PREVENT GROUPS FROM BEING OVERWRITTEN
    });

    return true;
}

export async function addToGroup(groupProvider: GroupProvider): Promise<boolean> {
    groupProvider.groups;
    let name = await window.showInputBox({
        placeHolder: 'Please enter a name for the group you would like to add'    
    });

    if (name === undefined) { return false; }
    console.log('window.tabGroups.all.length: ' + window.tabGroups.all.length);
    window.tabGroups.all.map(group => groupProvider.add(name ?? '', group));

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