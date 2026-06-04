import { render } from "preact"
import { AppContext } from "./AppContext.ts"
import { component } from "./component.ts"
import type { PruveComponent } from "./types.ts"

export function mount(App: PruveComponent, container: Element) {
  const Root = component(() => {
    AppContext.provide({
      isServer: typeof document === "undefined",
      isDev: true, // TODO
      version: "unknown",
      asyncBoundary: {
        promises: [],
        isSettled: () => Promise.resolve(),
      },
    })

    return () => App().make()
  })

  if (App.__isPruveComponent) {
    render(Root().make(), container)
    return
  }

  throw new Error("Only Pruve components can be mounted. Make sure to wrap your component with the `component` function from the core package.")
}
