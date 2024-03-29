import { commands, window, ExtensionContext, workspace } from 'vscode';
import { commandNames } from './constants';
import { GroupProvider } from './models/GroupProvider';
import { openFile } from './utils';
import FileTreeItem from './models/FileTreeItem';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "tab-groups" is now active!');
    const rootPath = (workspace.workspaceFolders && (workspace.workspaceFolders.length > 0))
        ? workspace.workspaceFolders[0].uri.fsPath : undefined;
    const groupProvider = new GroupProvider();

    window.registerTreeDataProvider('tab-groups', groupProvider);
    window.registerTreeDataProvider('tab-groups-explorer', groupProvider);

    let disposable = [
        commands.registerCommand(commandNames.helloWorld, () => {
        window.showInformationMessage('Hello World from tab-groups!');
    }),
        commands.registerCommand(commandNames.addAllOpenTabsToGroup, () => groupProvider.addAllOpenTabsToGroup()),
        commands.registerCommand(commandNames.createGroup, () => groupProvider.createGroup()),
        commands.registerCommand(commandNames.addToGroup, () => groupProvider.addTabToGroup()),
        commands.registerCommand(commandNames.openFile, async (item: FileTreeItem) => openFile(item))
    ];

    context.subscriptions.concat(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}