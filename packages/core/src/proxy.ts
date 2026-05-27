import { isWritableSignal } from "@pruve/reactivity"
import { Fragment, h, type ComponentType } from "preact"
import type { RenderableProxy, VirtualNodeBuilderProxy } from "./types.ts"

export const PRUVE_PROXY = Symbol.for("pruve.proxy")

export function isVnodeProxy(value: unknown): value is RenderableProxy {
  return typeof value === "function" && (value as any)[PRUVE_PROXY] === true
}

export function createVnodeProxy<Props = {}>(
  type: string | ComponentType<Props>
): VirtualNodeBuilderProxy<Props, never> {
  const vnode = {
    type,
    props: {} as Record<PropertyKey, any>
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
        vnode.props.key = args[0]
        return proxy
      }

      if (key === "children") {
        vnode.props.children = typeof vnode.type === "string" || vnode.type === Fragment
          ? resolveProxyChildren(args[0])
          : args[0]

        return proxy
      }

      if (key === "ref") {
        const arg = args[0]

        vnode.props.ref = (instance: unknown) => {
          if (isWritableSignal(arg)) {
            arg.set(instance)
          } else if (typeof arg === "function") {
            arg(instance)
          }
        }
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
