# opencode-subagent-view
A terminal UI plugin for OpenCode that adds a live "Subagents" panel to the session sidebar, showing which sub-agents are running, idle, or just finished, their type, and current activity, so you're not left staring at a generic "Delegating..." message. Unofficial community project, not affiliated with the OpenCode team.

## Installation

> **Status**: not yet published to npm. Use the "from source" instructions below for now.

### From source (current)

1. Clone this repo somewhere on your machine, e.g.:

   ```bash
   git clone git@github.com:giovannic96/opencode-subagent-view.git ~/repos/personal/opencode-subagent-view
   ```

2. Register it in a **`tui.json`** (or `tui.jsonc`) file, not `opencode.json`. This plugin only exports a `tui` entrypoint, and opencode resolves TUI-kind plugins through a separate config file dedicated to TUI settings, independent from the main `opencode.json`. Use the global one (`~/.config/opencode/tui.json`) so it's available in every project, or a project-level `tui.json` if you only want it there:

   ```json
   {
     "$schema": "https://opencode.ai/config.json",
     "plugin": ["/absolute/path/to/opencode-subagent-view"]
   }
   ```

   Two things worth knowing, both learned the hard way while building this:
   - Dropping this folder into `.opencode/plugins/` (or `~/.config/opencode/plugins/`) will **not** work on its own, since opencode's auto-discovery for that folder only picks up bare `.ts`/`.js` files, not a package-shaped directory like this one.
   - Putting the `plugin` entry in `opencode.json` instead of `tui.json` also will not work: that only affects server-side plugin loading. TUI-kind plugins (like this one) are resolved by a separate config pipeline that reads `tui.json`/`tui.jsonc` specifically.

3. Quit and restart opencode. Config and plugins are only read at startup, so a running session won't pick up the change.

4. Confirm it actually loaded (not just that config accepted it) by opening the command palette (`ctrl+p`) and selecting **Plugins**. Look for `subagent-view` under "External" with a green **active** status.

   Note: `opencode debug info` is **not** a reliable check for this. It only echoes what the config declares, not whether the plugin actually resolved and loaded at runtime, so it can report success even when nothing actually loaded.

### From npm (once published)

Same caveat applies: put this in `tui.json`/`tui.jsonc`, not `opencode.json`.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-subagent-view"]
}
```


