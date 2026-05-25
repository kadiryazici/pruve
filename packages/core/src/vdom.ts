import type { PruveChildren, PruveNode, VirtualNode, VirtualNodeProxy } from "./types.ts"

function resolveChildren(children: PruveChildren): PruveNode[] {
  if (Array.isArray(children)) return children.flatMap(resolveChildren)
  return [resolveNode(children)]
}

function resolveNode(node: PruveNode): PruveNode {
  if (node === null || node === undefined || node === false || node === true) return null
  if (typeof node === "string" || typeof node === "number") return String(node)

  const vnode: VirtualNode = typeof (node as any).make === "function"
    ? (node as any).make()
    : node as VirtualNode

  if (typeof vnode.type === "function") {
    const renderFn = vnode.type(vnode.props)
    return resolveNode(renderFn())
  }

  const children = resolveChildren(vnode.props.children ?? [])
  return { ...vnode, props: { ...vnode.props, children } }
}

type ComponentFactory = () => VirtualNodeProxy<{}>

export function createVDomTree(factory: ComponentFactory): PruveNode {
  const vnode = factory().make()
  return resolveNode(vnode)
}