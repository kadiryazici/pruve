import { batch, effectScope, type EffectScope, shallowReactive, type ShallowReactive, useEffect } from "@pruve/reactivity"
import * as p from "preact/hooks"
import { type ComponentInstance, getCurrentComponentInstance, setCurrentComponentInstance } from "./instance.ts"
import { createVnodeProxy, resolveProxyChildren } from "./proxy.ts"
import type { ComponentSetup, PruveComponent, PruveNode } from "./types.ts"

const useForceUpdate = () => (p.useReducer((x) => (x + 1) | 0, 0)[1]) as () => void

export function component<Props extends object = {}>(setup: ComponentSetup<Props>): PruveComponent<Props> {
  const component = createBridgeComponent(setup)
  const pruveComponent = (() => createVnodeProxy<Props>(component as any)) as PruveComponent<Props>
  pruveComponent.__isPruveComponent = true
  return pruveComponent
}

const createBridgeComponent = <Props extends object>(setup: ComponentSetup<Props>) => function PreactPruveBridge(props: Props) {
  const forceUpdate = useForceUpdate()
  const reactiveProps = p.useRef<ShallowReactive<Props> | null>(null)
  const scope = p.useRef<EffectScope | null>(null)
  const renderedContent = p.useRef<PruveNode>(null)
  const componentInstance = p.useRef<ComponentInstance | null>(null)

  if (componentInstance.current == null) {
    componentInstance.current = {
      mountHooks: new Set(),
      unmountHooks: new Set(),
      layoutUpdateHooks: new Set(),
      updateHooks: new Set()
    }

    scope.current = effectScope()

    scope.current.run(() => {
      const prevInstance = getCurrentComponentInstance()

      try {
        setCurrentComponentInstance(componentInstance.current)
        reactiveProps.current = shallowReactive(props)
        const renderFn = setup(reactiveProps.current)
        let isFirstRun = true

        useEffect(() => {
          renderedContent.current = resolveProxyChildren(renderFn())
          forceUpdate()

          if (!isFirstRun) {
            componentInstance.current?.updateHooks
              .forEach((hook) => void hook())
          }

          isFirstRun = false
        })
      } finally {
        setCurrentComponentInstance(prevInstance)
      }
    })
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
    componentInstance.current?.mountHooks
      .forEach((hook) => void hook())

    return () => {
      scope.current?.stop()
      componentInstance.current?.unmountHooks
        .forEach((hook) => void hook())
    }
  }, [])

  p.useLayoutEffect(() => {
    componentInstance.current?.layoutUpdateHooks
      .forEach((hook) => void hook())
  })

  return renderedContent.current
}
