import * as vscode from "vscode";
import { EXTENSION } from "./constants";
import { startMcpServer } from "./mcp-yapi";

export async function setupMcpServer() {
  const mcpUrl = await startHttpMcpServer();
  if (mcpUrl) {
    await updateMcpUrlToVsCodeSettings(mcpUrl);
  }
}

async function startHttpMcpServer(): Promise<string | undefined> {
  const configuration = vscode.workspace.getConfiguration(EXTENSION.NAME);

  const result = await startMcpServer("http", { port: configuration.port });

  return result ? result.url : undefined;
}

async function updateMcpUrlToVsCodeSettings(mcpUrl: string) {
  const configuration = vscode.workspace.getConfiguration();
  const targetServer = `mcp.servers`;
  const mcpServers = configuration.get<any>(targetServer, {});

  mcpServers["self-mcp-server"] = {
    type: "http",
    url: mcpUrl,
  };

  await configuration.update(
    "mcp.servers",
    mcpServers,
    vscode.ConfigurationTarget.Workspace
  );
}
