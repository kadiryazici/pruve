import {
  effect,
  effectScope,
  getCurrentScope,
  onScopeDispose,
  triggerRef,
  computed as vueComputed,
  shallowRef as vueSignal,
  type ComputedRef,
  type ShallowRef,
} from "@vue/reactivity"

export type Signal<T> = {
  readonly value: T
}

export type WritableSignal<T> = Signal<T> & {
  set: (value: T) => void
  asReadonly(): Signal<T>
}

class SignalImpl<T> implements Signal<T> {
  protected __signal: ShallowRef<T>

  constructor(initialValue: T) {
    this.__signal = vueSignal(initialValue)
  }

  get value() {
    return this.__signal.value
  }
}

class WritableSignalImpl<T> extends SignalImpl<T> implements WritableSignal<T> {

  constructor(initialValue: T) {
    super(initialValue)
  }

  set(value: T) {
    this.__signal.value = value
  }

  asReadonly(): Signal<T> {
    return this
  }
}

class ComputedSignalImpl<T> implements Signal<T> {
  private __computed: ComputedRef<T>

  constructor(fn: () => T) {
    this.__computed = vueComputed(fn)
  }

  get value() {
    return this.__computed.value
  }
}

export function signal<T>(): WritableSignal<T | undefined>
export function signal<T>(initialValue: T): WritableSignal<T>
export function signal<T>(initialValue?: T): WritableSignal<T> {
  return new WritableSignalImpl(initialValue) as WritableSignal<T>
}

export function computed<T>(fn: () => T): Signal<T> {
  return new ComputedSignalImpl(fn)
}

export function isSignal(value: unknown): value is Signal<unknown> {
  return value instanceof SignalImpl || value instanceof ComputedSignalImpl
}

type Effect = {
  pause: () => void
  resume: () => void
  stop: () => void
}

export function useEffect(fn: () => void): Effect {
  const e = effect(fn, { scheduler: () => void fn(), })

  return {
    pause: e.effect.pause,
    resume: e.effect.resume,
    stop: e.effect.stop,
  }
}

export function useUpdateEffect(
  fn: () => void,
  deps: Signal<unknown> | Signal<unknown>[] | (() => unknown),
): Effect {
  const trackDeps = () => {
    if (isSignal(deps)) {
      Reflect.get(deps, "value")
      return
    }

    if (Array.isArray(deps)) {
      for (const dep of deps.flat(Infinity)) {
        if (isSignal(dep)) {
          Reflect.get(dep, "value")
        }
      }

      return
    }

    deps()
  }

  const e = effect(trackDeps, {
    scheduler: fn,
  })

  return {
    pause: e.effect.pause,
    resume: e.effect.resume,
    stop: e.effect.stop,
  }
}

export function triggerSignal(signal: Signal<unknown>) {
  if (isSignal(signal)) {
    triggerRef(Reflect.get(signal, "__signal"))
  }
}

export function isInsideScope(): boolean {
  return !!getCurrentScope()
}

export {
  effectScope,
  onScopeDispose
}
