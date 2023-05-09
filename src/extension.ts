// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, ExtensionContext, workspace } from 'vscode';
import { CommandNames } from './constants';
import { GroupProvider } from './groupProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "tab-groups" is now active!');
	const rootPath = (workspace.workspaceFolders && (workspace.workspaceFolders.length > 0))
		? workspace.workspaceFolders[0].uri.fsPath : undefined;
	const groupProviders = new GroupProvider(rootPath);

	window.registerTreeDataProvider('tab-groups', groupProviders);
	
	let disposable = [
		commands.registerCommand(CommandNames.HelloWorld, () => {
		window.showInformationMessage('Hello World from tab-groups!');
	}),
		commands.registerCommand(CommandNames.Save, () => {
	}),
];

	context.subscriptions.concat(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}