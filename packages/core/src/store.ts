import type { Signal, WritableSignal } from "@pruve/reactivity"


type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type StoreInstance<T extends object> = {
  inject: () => T
  serialize: () => string
  deserialize: (serialized: string) => void
}

export type InferStoreType<B> = B extends StoreInstance<infer T> ? T : never

interface SerializeOptions<T, S = string> {
  serialize: (state: T) => S
  deserialize: (serialized: S) => T
}

interface StoreMethods {
  mutable: <T, S>(factory: () => T, serializeOptions?: SerializeOptions<T, S>) => WritableSignal<T>
  readonly: <T, S>(factory: () => T, serializeOptions?: SerializeOptions<T, S>) => Signal<T>
  accessor: {
    <V>(getter: () => V, serializeOptions?: SerializeOptions<V, string>): Signal<V>
    <V, S>(accessor: {
      get: () => V
      set: (value: V) => void
    } & Partial<SerializeOptions<V, S>>): WritableSignal<V, S>
  },
  subscribe: (deps: Signal<any> | Signal<any>[], callback: () => void) => void
}

declare function defineStore<T extends object>(factory: (methods: StoreMethods) => T): StoreInstance<T>

class SpecialData {
  value: string;

  constructor(value: string) {
    this.value = value
  }
}

const MyStore = defineStore((store) => {
  const data = store.mutable(() => new SpecialData("Hello"), {
    serialize: (data) => data.value,
    deserialize: (serialized) => new SpecialData(serialized)
  })

  const count = store.mutable(() => 0)
  const doubleCount = store.accessor(() => count.value * 2)

  const isEven = store.accessor({
    get: () => count.value % 2 === 0,
    set: (value) => {
      if (value) {
        count.set(count.value + 1)
      } else {
        count.set(count.value + 1)
      }
    },
  })

  store.subscribe(count, () => {
    console.log("Count changed:", count.value)
  })

  return {
    data,
    count,
    doubleCount,
    isEven
  }
})