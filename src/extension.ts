import { commands, window, ExtensionContext, workspace } from 'vscode';
import { commandNames } from './constants';
import { GroupProvider } from './models/GroupProvider';
import { addToGroup, openFile, saveGroup } from './utils';
import { CustomTreeItem } from './models/CustomTreeItem';
import { FileTreeItem } from './models/FileTreeItem';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "tab-groups" is now active!');
    const rootPath = (workspace.workspaceFolders && (workspace.workspaceFolders.length > 0))
        ? workspace.workspaceFolders[0].uri.fsPath : undefined;
    // window.tabGroups.all.forEach((group) => { group.tabs.forEach((tab) => { console.log(tab.label); }); });
    // console.log('rootPath', rootPath);
    const groups = new GroupProvider();

    window.registerTreeDataProvider('tab-groups', groups);
    window.registerTreeDataProvider('tab-groups-explorer', groups);

    let disposable = [
        commands.registerCommand(commandNames.helloWorld, () => {
        window.showInformationMessage('Hello World from tab-groups!');
    }),
        commands.registerCommand(commandNames.save, () => saveGroup(groups)),
        commands.registerCommand(commandNames.addToGroup, () => addToGroup(groups)),
        commands.registerCommand(commandNames.openFile, async (item: FileTreeItem) => openFile(item))
    ];

    context.subscriptions.concat(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}