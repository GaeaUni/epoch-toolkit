// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import find from 'find-process';


export function activate(context: vscode.ExtensionContext) {
    console.log('Your extension "vscode-debug-helper" is now active!');
    const configs =  vscode.workspace.getConfiguration('launch').get<any[]>('configurations');
    const debugNames = new Set(configs?.map(config => config.name as string));

    // 监听调试会话的结束
    context.subscriptions.push(vscode.debug.onDidTerminateDebugSession(session => {
        console.log(`Debug session terminated: ${session.name}`);
        // 任何调试会话结束时，都会停止调试
        if (debugNames.has(session.name)) {
            vscode.debug.stopDebugging();
        }
    }));

    let disposable = vscode.commands.registerCommand('extension.findElectronProcesses', async () => {
        // 在这里执行你的 PID 查找逻辑
        const pid = await waitForProcess("Electron"); // 例如，你可以调用一个函数来查找 PID
        return pid;
      });
    
      context.subscriptions.push(disposable);
}

// Helper function to wait for a process to appear
async function waitForProcess(processName: string): Promise<string> {
    let found = false;
    let attempt = 0;

    while (!found || attempt < 10) {
        attempt++;
        console.log(`Checking for process, attempt ${attempt}...`);

        const list = await find('name', processName, true);
        const electron = list.find(p => p.cmd.includes('node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'));
        if (electron) {
            console.log(`Found process with name ${processName} and pid ${electron.pid}.`);
            return `${electron.pid}`;
        }

        // Wait for a short period before checking again
        await new Promise(resolve => setTimeout(resolve, 1000)); // adjust the interval as needed
    }

    return "${command:pickProcess}"; // Not found
}

export function deactivate() {
    console.log('Your extension "vscode-debug-helper" is now inactive.');
}
