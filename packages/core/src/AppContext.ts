import { createContext } from "./context.ts"

type AsyncBoundary = {
  promises: Promise<any>[]
  isSettled: () => Promise<void>
}

export type AppContextValue = {
  isServer: boolean
  isDev: boolean
  version: string
  asyncBoundary: AsyncBoundary
}

export const AppContext = createContext<AppContextValue>()