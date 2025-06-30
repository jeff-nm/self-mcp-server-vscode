#!/user/bin/env node
import { startMcpServer } from "./mcp-yapi";

async function main() {
  startMcpServer("stdio", {
    mcpConfig: {
      domain: "https://yapi.pro/",
      username: "",
      password: "",
    },
  });
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
