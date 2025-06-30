class McpConfig {
  private storage: Record<string, unknown> = {};

  setConfig<T extends Record<string, unknown>>(config?: T) {
    this.storage = config ?? {};
  }

  get config() {
    return this.storage;
  }
}

export const mcpConfig = new McpConfig();
