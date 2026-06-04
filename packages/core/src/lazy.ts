import { onScopeDispose, signal } from "@pruve/reactivity"
import { component, isPruveComponent } from "./component.ts"
import type { PruveComponent, PruveNode } from "./types.ts"

export type LazyModule<Component extends PruveComponent<any>> =
  | Component
  | { default: Component }

export function lazy<Component extends PruveComponent<any>>(
  load: () => Promise<LazyModule<Component>>
): Component {
  return component((props) => {
    const LoadedComponent = signal<Component>()
    let disposed = false

    Promise.resolve()
      .then(() => load())
      .then(resolveLazyModule)
      .then((loadedComponent) => {
        if (disposed) {
          return
        }

        LoadedComponent.set(loadedComponent)
      })

    onScopeDispose(() => {
      disposed = true
    })

    return () => {
      if (LoadedComponent.value == null) {
        return null
      }

      const vnode = (LoadedComponent.value as PruveComponent)().make()
      Object.assign(vnode.props, props)
      return vnode as PruveNode
    }
  }) as unknown as Component
}

function resolveLazyModule<Component extends PruveComponent<any>>(
  module: LazyModule<Component>
): Component {
  if ("default" in module && isPruveComponent(module.default)) {
    return module.default
  }

  if (isPruveComponent(module)) {
    return module as Component
  }

  throw new Error("Invalid lazy module: neither a PruveComponent nor a default export is present.")
}
