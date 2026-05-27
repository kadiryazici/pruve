import { onScopeDispose, scheduledEffect, trackEffectDeps, type ScheduledEffect, type Signal } from "@pruve/reactivity"

export type ComponentInstance = {
  mountHooks: Set<() => void>
  unmountHooks: Set<() => void>
  layoutUpdateHooks: Set<() => void>
  preUpdateHooks: Set<() => void>
}

let currentComponentInstance: ComponentInstance | null = null

export function getCurrentComponentInstance(): ComponentInstance | null {
  return currentComponentInstance
}

export function setCurrentComponentInstance(instance: ComponentInstance | null): void {
  currentComponentInstance = instance
}

export function onMount(fn: () => void) {
  const instance = getCurrentComponentInstance()
  instance?.mountHooks.add(fn)
  return () => {
    instance?.mountHooks.delete(fn)
  }
}

export function onUnmount(fn: () => void) {
  const instance = getCurrentComponentInstance()
  instance?.unmountHooks.add(fn)
  return () => {
    instance?.unmountHooks.delete(fn)
  }
}

export function useLayoutUpdate(fn: () => void) {
  const instance = getCurrentComponentInstance()
  let isFirstLayoutCommit = true

  const hook = () => {
    if (isFirstLayoutCommit) {
      isFirstLayoutCommit = false
      return
    }

    fn()
  }

  instance?.layoutUpdateHooks.add(hook)

  return () => {
    instance?.layoutUpdateHooks.delete(hook)
  }
}

export function usePreUpdate(fn: () => void) {
  const instance = getCurrentComponentInstance()
  instance?.preUpdateHooks.add(fn)

  return () => {
    instance?.preUpdateHooks.delete(fn)
  }
}

function createLayoutEffect(
  track: (isFlushing: boolean) => void,
  afterFlush?: () => void,
  initiallyDirty = false,
): ScheduledEffect | undefined {
  const instance = getCurrentComponentInstance()

  if (instance == null) {
    return
  }

  let isFlushing = false
  let dirty = initiallyDirty
  let flushScheduled = false
  let active = true

  const flush = () => {
    flushScheduled = false

    if (!active || !dirty) {
      return
    }

    dirty = false
    isFlushing = true

    try {
      reactiveEffect.run()
    } finally {
      isFlushing = false
    }
  }

  const reactiveEffect = scheduledEffect(
    () => track(isFlushing),
    () => {
      dirty = true

      if (!flushScheduled) {
        flushScheduled = true
        queueMicrotask(() => {
          queueMicrotask(flush)
        })
      }
    },
    () => {
      if (isFlushing) {
        afterFlush?.()
      }
    },
  )

  const layoutUpdateHook = () => {
    flush()
  }

  instance.layoutUpdateHooks.add(layoutUpdateHook)

  const stop = () => {
    if (!active) {
      return
    }

    active = false
    dirty = false
    instance.layoutUpdateHooks.delete(layoutUpdateHook)
    reactiveEffect.stop()
  }

  onScopeDispose(stop)

  return {
    ...reactiveEffect,
    stop,
  }
}

export function useLayoutEffect(fn: () => void): ScheduledEffect | undefined {
  return createLayoutEffect((isFlushing) => {
    if (isFlushing) {
      fn()
    }
  }, undefined, true)
}

export function useUpdateLayoutEffect(
  fn: () => void,
  deps: Signal<unknown> | Signal<unknown>[] | (() => unknown),
): ScheduledEffect | undefined {
  return createLayoutEffect(() => trackEffectDeps(deps), fn)
}
