---
type: "always_apply"
---

{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server", "--github-api-key", "ghp_your_token_here"]
    },
    // If using Svelte, do this instead:
    "shadcn-ui-svelte": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server", "--framework", "svelte", "--github-api-key", "ghp_your_token_here"]
    }
  }
}