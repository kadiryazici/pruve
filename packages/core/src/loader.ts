import { onScopeDispose, pickProps, signal, type WritableSignal } from "@pruve/reactivity"
import { component, isPruveComponent } from "./component.ts"
import { createContext } from "./context.ts"
import { isVnodeProxy } from "./proxy.ts"
import type { PruveComponent, PruveNode } from "./types.ts"

type LoaderState<Data> =
  | { status: "pending" }
  | { status: "resolved", data: Data }
  | { status: "rejected", error: unknown }

export type LoaderCallback<Props extends object, Data> = (
  props: Props,
  signal: AbortSignal
) => Promise<Data>

export type LoaderProps<Data, Props extends object = {}> = Props & {
  pending?: PruveNode
  catch?: PruveNode | ((error: unknown) => PruveNode)
  render: PruveNode | ((props: Data) => PruveNode)
}
export interface Loader<Data, Props extends object = {}> extends PruveComponent<LoaderProps<Data, Props>> {
  inject(): Data
}

export function createLoader<Props extends object, Data = any>(
  load: LoaderCallback<Props, Data>
): Loader<Data, Props> {
  const DataContext = createContext<WritableSignal<LoaderState<Data>>>()

  const Component = component<LoaderProps<Data, Props>>((props) => {
    const { rest, ...picked } = pickProps(props)
      .catch()
      .render()
      .pending()
      .pickRest()

    const data = signal<LoaderState<Data>>({ status: "pending" })
    DataContext.provide(data)

    const controller = new AbortController()
    let disposed = false

    onScopeDispose(() => {
      disposed = true
      controller.abort()
    })

    data.set({ status: "pending" })

    Promise.resolve()
      .then(() => load(rest as Props, controller.signal))
      .then((result) => {
        if (disposed) {
          return
        }

        data.set({ status: "resolved", data: result })
      })
      .catch((error) => {
        if (disposed) {
          return
        }

        data.set({ status: "rejected", error })
      })

    return () => {
      if (data.value.status === "pending" && picked.pending.value != null) {
        return picked.pending.value
      }

      if (data.value.status === "rejected" && picked.catch.value != null) {
        if (isPruveComponent(picked.catch.value)) {
          return picked.catch.value().make()
        }

        if (isVnodeProxy(picked.catch.value)) {
          return picked.catch.value.make()
        }

        if (typeof picked.catch.value === "function") {
          return picked.catch.value(data.value.error)
        }

        return picked.catch.value
      }

      if (data.value.status === "resolved" && picked.render.value != null) {
        if (isPruveComponent(picked.render.value)) {
          return picked.render.value().make()
        }

        if (isVnodeProxy(picked.render.value)) {
          return picked.render.value.make()
        }

        if (typeof picked.render.value === "function") {
          return picked.render.value(data.value.data)
        }
      }

      return null
    }
  })

  const loader = Component as unknown as Loader<Data, Props>

  loader.inject = () => {
    const data = DataContext.inject()

    if (!data) {
      throw new Error("Loader.inject() must be used within a Loader component")
    }

    if (data.value.status !== "resolved") {
      throw new Error("Loader.inject() must be used in a resolved Loader component")
    }

    return data.value.data
  }

  return loader
}
