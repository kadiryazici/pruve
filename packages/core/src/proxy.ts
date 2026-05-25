import type { VirtualNode, VirtualNodeBuilderProxy } from "./types.ts"

export function createVnodeProxy<Props = {}>(
  type: VirtualNode<Props>["type"]
): VirtualNodeBuilderProxy<Props, never> {
  const vnode = {
    type,
    props: {},
    key: undefined
  } as VirtualNode<Props>

  let pendingKey: PropertyKey | undefined

  const proxy = new Proxy(() => { }, {
    get(_, key) {
      pendingKey = key
      return proxy
    },

    apply(_, __, args: [unknown?]) {
      const key = pendingKey
      pendingKey = undefined

      if (key === "make") {
        return vnode
      }

      if (key === "with") {
        Object.assign(vnode.props, args[0])
        return proxy
      }

      if (key === "key") {
        vnode.key = args[0] as VirtualNode["key"]
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

