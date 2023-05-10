import { window } from "vscode";
import { GroupProvider } from "./models/GroupProvider";
import { CustomTreeItem } from "./models/CustomTreeItem";
import { CustomTreeItemType } from "./constants";
import { FileTreeItem } from "./models/FileTreeItem";

export async function saveGroup(groupProvider: GroupProvider): Promise<boolean> {
    let name = await window.showInputBox({
        placeHolder: 'Please enter a name for the group'    
    });

    if (name === undefined) { return false; }

    window.tabGroups.all.map(group => groupProvider.add(name ?? '', group));

    return true;
}

export async function addToGroup(groupProvider: GroupProvider): Promise<boolean> {
    groupProvider.groups;
    let name = await window.showInputBox({
        placeHolder: 'Please enter a name for the group you would like to add'    
    });

    if (name === undefined) { return false; }

    window.tabGroups.all.map(group => groupProvider.add(name ?? '', group));

    return true;
}

export async function openFile(item: FileTreeItem): Promise<void> {

    console.log(item.label);
    return;

}