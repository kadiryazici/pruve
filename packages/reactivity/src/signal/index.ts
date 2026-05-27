import {
  effect,
  getCurrentScope,
  triggerRef,
  computed as vueComputed,
  shallowRef as vueSignal,
  type ComputedRef,
  type ReactiveEffectRunner,
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

export function isWritableSignal(value: unknown): value is WritableSignal<unknown> {
  return value instanceof WritableSignalImpl
}

export type Effect = {
  pause: () => void
  resume: () => void
  stop: () => void
}

export type ScheduledEffect = Effect & {
  run: () => void
}

type EffectJob = () => void

let batchDepth = 0
let scheduledJobs: Set<EffectJob> | undefined

function schedule(job: EffectJob) {
  if (batchDepth > 0) {
    scheduledJobs ??= new Set()
    scheduledJobs.add(job)
    return
  }

  job()
}

export function batch<T>(fn: () => T): T {
  batchDepth++

  try {
    return fn()
  } finally {
    batchDepth--

    if (batchDepth === 0 && scheduledJobs != null) {
      const jobs = scheduledJobs
      scheduledJobs = undefined

      for (const job of jobs) {
        job()
      }
    }
  }
}

export function useEffect(fn: () => void): Effect {
  let runner!: ReactiveEffectRunner
  runner = effect(fn, { scheduler: () => schedule(runner) })

  return {
    pause: runner.effect.pause,
    resume: runner.effect.resume,
    stop: runner.effect.stop,
  }
}

export function scheduledEffect(
  fn: () => void,
  scheduler: (run: () => void) => void,
): ScheduledEffect {
  let runner!: ReactiveEffectRunner
  const job = () => scheduler(runner)

  runner = effect(fn, { scheduler: () => schedule(job) })

  return {
    run: runner,
    pause: runner.effect.pause,
    resume: runner.effect.resume,
    stop: runner.effect.stop,
  }
}

export function trackEffectDeps(
  deps: Signal<unknown> | Signal<unknown>[] | (() => unknown),
): void {
  if (isSignal(deps)) {
    deps.value
    return
  }

  if (Array.isArray(deps)) {
    for (const dep of deps.flat(Infinity)) {
      if (isSignal(dep)) {
        dep.value
      }
    }

    return
  }

  deps()
}

export function useUpdateEffect(
  fn: () => void,
  deps: Signal<unknown> | Signal<unknown>[] | (() => unknown),
): Effect {
  const e = effect(() => trackEffectDeps(deps), {
    scheduler: () => schedule(fn),
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
