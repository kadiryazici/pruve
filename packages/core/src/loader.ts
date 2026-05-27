import { onScopeDispose, signal, type WritableSignal } from "@pruve/reactivity"
import { component, isPruveComponent } from "./component.ts"
import { createContext, type PruveContext } from "./context.ts"
import type { ComponentSetup, PruveComponent, PruveNode } from "./types.ts"

type LoaderState<Data> =
  | { status: "pending" }
  | { status: "resolved", data: Data }
  | { status: "rejected", error: unknown }

export type LoaderOptions<Data, Props extends object = {}> = {
  loader: (props: Props, signal: AbortSignal) => Promise<Data>
  pendingView?: PruveComponent<Props> | ((props: Props) => PruveNode)
  errorView?: PruveComponent<Props> | ((error: unknown, props: Props) => PruveNode)
}

export type Loader<_Data, Props extends object = {}> = {
  component(setup: ComponentSetup<Props>): PruveComponent<Props>
}

const loaderContexts = new WeakMap<
  Loader<any, any>,
  PruveContext<WritableSignal<LoaderState<any>>>
>()

export function createLoader<Data, Props extends object = {}>(
  options: LoaderOptions<Data, Props>
): Loader<Data, Props> {
  const DataContext = createContext<WritableSignal<LoaderState<Data>>>()

  const loader: Loader<Data, Props> = {
    component(setup) {
      const Component = component(setup)

      return component((props) => {
        const data = signal<LoaderState<Data>>({ status: "pending" })
        DataContext.provide(data)

        let disposed = false
        const controller = new AbortController()

        onScopeDispose(() => {
          disposed = true
          controller.abort()
        })

        data.set({ status: "pending" })

        try {
          options.loader(props, controller.signal)
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
        } catch (error) {
          data.set({ status: "rejected", error })
        }


        return () => {
          if (data.value.status === "pending") {
            if (isPruveComponent(options.pendingView)) {
              return options.pendingView().with(props)
            }

            if (typeof options.pendingView === "function") {
              return (options.pendingView as (props: Props) => PruveNode)(props)
            }

            return null
          }

          if (data.value.status === "rejected") {
            if (isPruveComponent(options.errorView)) {
              return options.errorView().with(props)
            }

            if (typeof options.errorView === "function") {
              return (
                options.errorView as (error: unknown, props: Props) => PruveNode
              )(data.value.error, props)
            }

            return null
          }

          return Component().with(props) as unknown as PruveNode
        }
      })
    }
  }

  loaderContexts.set(loader, DataContext)

  return loader
}

export function useLoaderData<Data>(loader: Loader<Data, any>): Data {
  const data = loaderContexts.get(loader)?.inject()

  if (!data) {
    throw new Error("useLoaderData must be used within a Loader component")
  }

  if (data.value.status !== "resolved") {
    throw new Error("useLoaderData must be used in a resolved Loader component")
  }

  return data.value.data
}
