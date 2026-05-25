import { isInsideScope } from "../signal/index.ts"

export function defineSharedState<T>(factory: () => T): () => T {
  let state: T | null = null

  return () => {
    if (!isInsideScope()) {
      throw new Error("[ERROR]: defineSharedState is used outside of a reactive scope.")
    }

    state ??= factory()
    return state
  }
}