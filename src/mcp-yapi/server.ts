import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetYApiTool } from "./tools";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "YAPI MCP Server",
    version: "0.1.0",
  });

  registerGetYApiTool(server);

  return server;
}
