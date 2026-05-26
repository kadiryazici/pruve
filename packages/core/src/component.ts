import { batch, effectScope, type EffectScope, shallowReactive, type ShallowReactive, useEffect } from "@pruve/reactivity"
import * as p from "preact/hooks"
import { type ComponentInstance, getCurrentComponentInstance, setCurrentComponentInstance } from "./lifecycles.ts"
import { createVnodeProxy, resolveProxyChildren } from "./proxy.ts"
import type { ComponentSetup, PruveComponent, PruveNode } from "./types.ts"

const useForceUpdate = () => (p.useReducer((x) => !x, false)[1]) as () => void

export function component<Props extends object = {}>(setup: ComponentSetup<Props>): PruveComponent<Props> {
  const component = createBridgeComponent(setup)
  const pruveComponent = (() => createVnodeProxy<Props>(component as any)) as PruveComponent<Props>
  pruveComponent.__isPruveComponent = true
  return pruveComponent
}

const createBridgeComponent = <Props extends object>(setup: ComponentSetup<Props>) => function PreactPruveBridge(props: Props) {
  const forceUpdate = useForceUpdate()
  const didSetupRun = p.useRef(false)
  const reactiveProps = p.useRef<ShallowReactive<Props> | null>(null)
  const scope = p.useRef<EffectScope | null>(null)
  const renderedContent = p.useRef<PruveNode>(null)

  if (!didSetupRun.current) {
    scope.current = effectScope()

    scope.current.run(() => {
      const prevLifeCycles = getCurrentComponentInstance()
      const lifecycles: ComponentInstance = {
        mountHooks: new Set(),
        unmountHooks: new Set(),
        layoutUpdateHooks: new Set()
      }

      try {
        setCurrentComponentInstance(lifecycles)
        reactiveProps.current = shallowReactive(props)
        const renderFn = setup(reactiveProps.current!)

        useEffect(() => {
          renderedContent.current = resolveProxyChildren(renderFn())
          forceUpdate()
        })
      } finally {
        setCurrentComponentInstance(prevLifeCycles)
      }
    })

    didSetupRun.current = true
  }

  if (reactiveProps.current != null) {
    batch(() => {
      for (const key in reactiveProps.current!) {
        if (!(key in props)) {
          delete reactiveProps.current![key]
        }
      }

      for (const key in props) {
        reactiveProps.current![key] = props[key]
      }
    })
  }

  p.useEffect(() => {
    return () => {
      if (scope.current) {
        scope.current.stop()
      }
    }
  }, [])

  return renderedContent.current
}