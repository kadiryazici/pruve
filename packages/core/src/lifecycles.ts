import { useEffect } from "@pruve/reactivity"

export type ComponentInstance = {
  mountHooks: Set<() => void>
  unmountHooks: Set<() => void>
  layoutUpdateHooks: Set<() => void>
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

export function useLayoutEffect(fn: () => void): void {
  let isDirty = false

  onLayoutUpdate(() => {
    if (isDirty) {
      try {
        fn()
      } finally {
        isDirty = false
      }
    }
  })
}