import { mcpConfig } from "../mcpConfig";
import { startStdioMcpServer } from "./stdio";
import {
  McpServerEndpoint,
  startStreamableHttpMcpServer,
} from "./streamableHttp";

export type Transport = "stdio" | "http";

export interface HttpServerOptions {
  port?: number;
  mcpConfig?: Record<string, unknown>;
}

export async function startMcpServer(
  transport: Transport,
  options?: HttpServerOptions
): Promise<void | McpServerEndpoint> {
  mcpConfig.setConfig(options?.mcpConfig);
  if (transport === "stdio") {
    return startStdioMcpServer();
  } else if (transport === "http") {
    return startStreamableHttpMcpServer(options?.port);
  } else {
    throw new Error('Invalid transport. Must be either "stdio" or "http"');
  }
}
