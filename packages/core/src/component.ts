import { batch, effectScope, type EffectScope, shallowReactive, type ShallowReactive, useEffect } from "@pruve/reactivity"
import * as p from "preact/hooks"
import { type ComponentInstance, getCurrentComponentInstance, setCurrentComponentInstance } from "./instance.ts"
import { createVnodeProxy, resolveProxyChildren } from "./proxy.ts"
import type { ComponentSetup, PruveComponent, PruveNode } from "./types.ts"


export function component<Props extends object = {}>(setup: ComponentSetup<Props>): PruveComponent<Props> {
  const component = createBridgeComponent(setup)
  const pruveComponent = (() => createVnodeProxy<Props>(component as any)) as PruveComponent<Props>
  pruveComponent.__isPruveComponent = true
  return pruveComponent
}

type BridgeState<Props extends object> = {
  reactiveProps: ShallowReactive<Props>
  scope: EffectScope
  renderedContent: PruveNode
  componentInstance: ComponentInstance
}

const createBridgeComponent = <Props extends object>(setup: ComponentSetup<Props>) => function PreactPruveBridge(props: Props) {
  const forceUpdate = useForceUpdate()

  const bridge = useLazyRef<BridgeState<Props>>(() => {
    const state: BridgeState<Props> = {
      reactiveProps: shallowReactive(props),
      scope: effectScope(),
      renderedContent: null,
      componentInstance: {
        mountHooks: new Set(),
        unmountHooks: new Set(),
        layoutUpdateHooks: new Set(),
        preUpdateHooks: new Set()
      }
    }

    state.scope.run(() => {
      const prevInstance = getCurrentComponentInstance()

      try {
        setCurrentComponentInstance(state.componentInstance)
        const renderFn = setup(state.reactiveProps)
        let isFirstRun = true

        useEffect(() => {
          state.renderedContent = resolveProxyChildren(renderFn())
          forceUpdate()

          if (!isFirstRun) {
            state.componentInstance.preUpdateHooks
              .forEach((hook) => void hook())
          }

          isFirstRun = false
        })
      } finally {
        setCurrentComponentInstance(prevInstance)
      }
    })
    return state
  }).current

  batch(() => {
    for (const key in bridge.reactiveProps) {
      if (!(key in props)) {
        delete bridge.reactiveProps[key]
      }
    }

    for (const key in props) {
      bridge.reactiveProps[key] = props[key]
    }
  })

  p.useEffect(() => {
    bridge.componentInstance.mountHooks
      .forEach((hook) => void hook())

    return () => {
      bridge.scope.stop()
      bridge.componentInstance.unmountHooks
        .forEach((hook) => void hook())
    }
  }, [])

  p.useLayoutEffect(() => {
    bridge.componentInstance.layoutUpdateHooks
      .forEach((hook) => void hook())
  })

  return bridge.renderedContent
}


const useForceUpdate = () => (p.useReducer((x) => (x + 1) | 0, 0)[1]) as () => void

function useLazyRef<T>(factory: () => T): p.MutableRef<T> {
  const ref = p.useRef<T | null>(null)

  if (ref.current === null) {
    ref.current = factory()
  }

  return ref as { current: T }
}
