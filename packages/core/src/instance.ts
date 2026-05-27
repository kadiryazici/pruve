import { scheduledEffect, trackEffectDeps, type ScheduledEffect, type Signal } from "@pruve/reactivity"

export type ComponentInstance = {
  mountHooks: Set<() => void>
  unmountHooks: Set<() => void>
  layoutUpdateHooks: Set<() => void>
  updateHooks: Set<() => void>
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

export function onLayoutUpdate(fn: () => void) {
  const instance = getCurrentComponentInstance()
  instance?.layoutUpdateHooks.add(fn)

  return () => {
    instance?.layoutUpdateHooks.delete(fn)
  }
}

export function onUpdate(fn: () => void) {
  const instance = getCurrentComponentInstance()
  instance?.updateHooks.add(fn)

  return () => {
    instance?.updateHooks.delete(fn)
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

  const flush = () => {
    flushScheduled = false

    if (!dirty) {
      return
    }

    dirty = false
    isFlushing = true

    try {
      reactiveEffect.run()
      afterFlush?.()
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
  )

  const layoutUpdateHook = () => {
    flush()
  }

  instance.layoutUpdateHooks.add(layoutUpdateHook)

  return {
    ...reactiveEffect,
    stop: () => {
      instance.layoutUpdateHooks.delete(layoutUpdateHook)
      reactiveEffect.stop()
    },
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
