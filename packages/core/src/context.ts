import { createContext as createPreactContext } from "preact"
import { getCurrentComponentInstance } from "./instance.ts"

type ContextKey = object
export type ProviderMap = ReadonlyMap<ContextKey, unknown>

const emptyProviders: ProviderMap = new Map()

export const ProviderContext = createPreactContext<ProviderMap>(emptyProviders)

export type PruveContext<T> = {
  provide(value: T): void
  inject(): T | undefined
}

export type PruveContextType<T> = T extends PruveContext<infer U> ? U : never

export function createContext<T>(): PruveContext<T> {
  const key: ContextKey = {}

  return {
    provide(value: T): void {
      const instance = getCurrentComponentInstance()
      instance?.localProviders.set(key, value)
    },

    inject(): T | undefined {
      const instance = getCurrentComponentInstance()
      return instance?.inheritedProviders.get(key) as T | undefined
    }
  }
}
