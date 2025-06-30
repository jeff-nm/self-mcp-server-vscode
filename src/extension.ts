// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { EXTENSION } from "./constants";
import { setupMcpServer } from "./statServer";

export async function activate(context: vscode.ExtensionContext) {
  console.log(
    `Congratulations, your extension "${EXTENSION.NAME}" is now active!`
  );

  const disposable = vscode.commands.registerCommand(
    `${EXTENSION.NAME}.Welcome`,
    async () => {
      vscode.window.showInformationMessage("Welcome use the Self MCP Server!");
    }
  );

  context.subscriptions.push(disposable);

  try {
    await setupMcpServer();
  } catch (error) {
    console.error("Error setting up Code Runner MCP server: ", error);
  }
}

export function deactivate() {}
