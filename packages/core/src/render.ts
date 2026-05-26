import { render } from "preact"
import type { PruveComponent } from "./types.ts"

export function mount(component: PruveComponent, container: Element) {
  if (component.__isPruveComponent) {
    render(component().make(), container)
    return
  }

  throw new Error("Only Pruve components can be mounted. Make sure to wrap your component with the `component` function from the core package.")
}
