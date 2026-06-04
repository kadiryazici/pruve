import {
  effect,
  getCurrentScope,
  pauseTracking,
  resetTracking,
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

export type WritableSignal<T, S = T> = Signal<T> & {
  set: (value: S) => void
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

export type EffectCleanup = () => void

type EffectJob = () => void

let batchDepth = 0
let scheduledJobs: Set<EffectJob> | undefined
let currentEffectCleanupRegistrar: ((cleanup: EffectCleanup) => void) | undefined

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

export function onEffectCleanup(cleanup: EffectCleanup): void {
  if (currentEffectCleanupRegistrar == null) {
    console.warn("onEffectCleanup() must be called while a Pruve effect callback is running.")
    return
  }

  currentEffectCleanupRegistrar(cleanup)
}

function createEffectCallback(
  fn: () => void,
  afterRunUntracked?: () => void,
) {
  let cleanups: EffectCleanup[] = []

  const cleanup = () => {
    const pendingCleanups = cleanups
    cleanups = []

    for (const pendingCleanup of pendingCleanups) {
      pendingCleanup()
    }
  }

  const run = () => {
    cleanup()

    const previousRegistrar = currentEffectCleanupRegistrar
    currentEffectCleanupRegistrar = (registeredCleanup) => {
      cleanups.push(registeredCleanup)
    }

    try {
      fn()

      if (afterRunUntracked != null) {
        pauseTracking()

        try {
          afterRunUntracked()
        } finally {
          resetTracking()
        }
      }
    } finally {
      currentEffectCleanupRegistrar = previousRegistrar
    }
  }

  return { cleanup, run }
}

export function useEffect(fn: () => void): Effect {
  const callback = createEffectCallback(fn)
  let runner!: ReactiveEffectRunner
  runner = effect(callback.run, {
    scheduler: () => schedule(runner),
    onStop: callback.cleanup,
  })

  return {
    pause: () => runner.effect.pause(),
    resume: () => runner.effect.resume(),
    stop: () => runner.effect.stop(),
  }
}

export function scheduledEffect(
  fn: () => void,
  scheduler: (run: () => void) => void,
  afterRunUntracked?: () => void,
): ScheduledEffect {
  const callback = createEffectCallback(fn, afterRunUntracked)
  let runner!: ReactiveEffectRunner
  const job = () => scheduler(runner)

  runner = effect(callback.run, {
    scheduler: () => schedule(job),
    onStop: callback.cleanup,
  })

  return {
    run: runner,
    pause: () => runner.effect.pause(),
    resume: () => runner.effect.resume(),
    stop: () => runner.effect.stop(),
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
  const callback = createEffectCallback(fn)
  const e = effect(() => trackEffectDeps(deps), {
    scheduler: () => schedule(callback.run),
    onStop: callback.cleanup,
  })

  return {
    pause: () => e.effect.pause(),
    resume: () => e.effect.resume(),
    stop: () => e.effect.stop(),
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
