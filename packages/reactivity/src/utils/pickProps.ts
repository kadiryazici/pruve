import { computed, type Signal } from "../lib.ts"

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type NormalizeDefault<PropsValue, T> =
  T extends undefined
  ? PropsValue
  : T extends null
  ? (PropsValue & {}) | null
  : PropsValue & {}

interface PickPropsAccessor<
  Props extends object,
  PickSchema,
  Key extends keyof Props,
> {
  (): PickPropsProxy<
    Props,
    PickSchema & Record<Key, Props[Key]>
  >

  <T extends Props[Key]>(defaultValue: T): PickPropsProxy<
    Props,
    PickSchema & Record<Key, NormalizeDefault<Props[Key], T>>
  >
}

type PickPropsProxy<
  Props extends object,
  PickSchema extends object = {},
> = {
  [Key in Exclude<keyof Props, keyof PickSchema | "rest">]-?: PickPropsAccessor<
    Props,
    PickSchema,
    Key
  >
} & {
  pickRest: () => Prettify<
    PickPropsResult<PickSchema> & {
      rest: Prettify<Readonly<Omit<Props, keyof PickSchema>>>
    }
  >,

  pick: () => Prettify<PickPropsResult<PickSchema>>
}

type PickPropsResult<
  PickSchema extends object,
> = {
    [Key in keyof PickSchema]: Signal<PickSchema[Key]>
  }

function createRestProxy(obj: object, excludeKeys: Set<PropertyKey>): Record<PropertyKey, any> {
  return new Proxy(Object.create(null), {
    get(_, key: PropertyKey) {
      if (excludeKeys.has(key)) {
        return undefined
      }

      return Reflect.get(obj, key)
    },
    has(_, key: PropertyKey) {
      return !excludeKeys.has(key) && Reflect.has(obj, key)
    },
    ownKeys() {
      return Reflect.ownKeys(obj)
        .filter(key => !excludeKeys.has(key))
    },
    getOwnPropertyDescriptor(_, key: PropertyKey) {
      if (excludeKeys.has(key)) {
        return undefined
      }

      const descriptor = Reflect.getOwnPropertyDescriptor(obj, key)

      if (!descriptor) {
        return undefined
      }

      return {
        ...descriptor,
        configurable: true,
      }
    },
    set() {
      return false
    },

    defineProperty() {
      return false
    },

    deleteProperty() {
      return false
    },

    setPrototypeOf() {
      return false
    },

    preventExtensions() {
      return false
    },
  })
}

export function pickProps<Props extends object>(
  props: Props,
): PickPropsProxy<Props> {
  const map = new Map<PropertyKey, unknown>()

  let pendingKey: PropertyKey | undefined = undefined

  const proxy = new Proxy((() => { }) as any, {
    get(_, key: PropertyKey, receiver) {
      pendingKey = key
      return receiver
    },

    apply(_, __, args: [unknown?]) {
      const key = pendingKey
      pendingKey = undefined

      if (key == null) {
        throw new Error("Invalid usage of pickProps: no property key accessed")
      }

      if (key === "pickRest" || key === "pick") {
        const signals = Object.create(null)
        const keys = Array.from(map.keys())

        for (const k of keys) {
          signals[k] = computed(() => {
            const value = Reflect.get(props, k)

            if (value === undefined) {
              return map.get(k)
            }

            return value
          })
        }

        if (key === "pickRest") {
          signals.rest = createRestProxy(props, new Set(keys))
        }

        return signals as any
      }

      map.set(key, args[0])
      return proxy
    }
  })

  return proxy as PickPropsProxy<Props>
}
