import { Fragment, h, type ComponentType } from "preact"
import { isWritableSignal } from "@pruve/reactivity"
import type { WritableSignal } from "@pruve/reactivity"
import type { RenderableProxy, VirtualNodeBuilderProxy } from "./types.ts"

export const PRUVE_PROXY = Symbol.for("pruve.proxy")

const elementRefCallbacks = new WeakMap<WritableSignal<unknown>, (instance: unknown) => void>()

function resolveElementRef(ref: WritableSignal<unknown>) {
  let callback = elementRefCallbacks.get(ref)

  if (callback == null) {
    callback = (instance: unknown) => ref.set(instance)
    elementRefCallbacks.set(ref, callback)
  }

  return callback
}

export function isVnodeProxy(value: unknown): value is RenderableProxy {
  return typeof value === "function" && (value as any)[PRUVE_PROXY] === true
}

export function createVnodeProxy<Props = {}>(
  type: string | ComponentType<Props>
): VirtualNodeBuilderProxy<Props, never> {
  const vnode = {
    type,
    props: {} as Record<PropertyKey, any>,
    key: undefined
  }

  let pendingKey: PropertyKey | undefined

  const proxy = new Proxy(() => { }, {
    get(_, key) {
      if (key === PRUVE_PROXY) {
        return true
      }

      pendingKey = key
      return proxy
    },

    apply(_, __, args: [unknown?]) {
      const key = pendingKey
      pendingKey = undefined

      if (key === "make") {
        return h(
          vnode.type,
          vnode.props
        )
      }

      if (key === "with") {
        Object.assign(vnode.props, args[0])
        return proxy
      }

      if (key === "key") {
        vnode.key = args[0] as any
        return proxy
      }

      if (key === "children") {
        vnode.props.children = typeof vnode.type === "string" || vnode.type === Fragment
          ? resolveProxyChildren(args[0])
          : args[0]

        return proxy
      }

      if (key === "ref" && typeof vnode.type === "string" && isWritableSignal(args[0])) {
        vnode.props.ref = resolveElementRef(args[0])
        return proxy
      }

      if (key !== undefined) {
        vnode.props[key] = args[0]
      }

      return proxy
    }
  }) as unknown as VirtualNodeBuilderProxy<Props, never>

  return proxy
}


export function resolveProxyChildren(children: unknown): any {
  if (isVnodeProxy(children)) {
    return children.make()
  }

  if (Array.isArray(children)) {
    return children.map(resolveProxyChildren)
  }

  return children
}
