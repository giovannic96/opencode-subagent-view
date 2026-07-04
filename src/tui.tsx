import type { TuiPlugin, TuiPluginApi, TuiPluginModule } from "@opencode-ai/plugin/tui"

const id = "subagent-view"

// Minimal placeholder view. This proves the plugin loads and can render into
// the existing sidebar_content slot (the same slot used by the built-in
// Context/Todo/MCP/LSP sections). Real session-tree data comes in a later step.
function View(props: { api: TuiPluginApi; session_id: string }) {
  const theme = () => props.api.theme.current

  return (
    <box>
      <text fg={theme().text}>
        <b>Subagents</b>
      </text>
      <text fg={theme().textMuted}>subagent-view plugin loaded ({props.session_id})</text>
    </box>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    // Built-in sidebar_content order: Context=100, MCP=200, LSP=300, Todo=400,
    // Files=500. 350 places this section right after LSP, before Todo.
    order: 350,
    slots: {
      sidebar_content(_ctx, props) {
        return <View api={api} session_id={props.session_id} />
      },
    },
  })
}

const plugin: TuiPluginModule = {
  id,
  tui,
}

export default plugin
