export {
  batch,
  computed,
  isInsideScope,
  isSignal,
  isWritableSignal,
  scheduledEffect,
  signal,
  trackEffectDeps,
  triggerSignal,
  useEffect,
  useUpdateEffect,
  type Effect,
  type ScheduledEffect,
  type Signal,
  type WritableSignal
} from "./signal/index.ts"

export {
  EffectScope,
  effectScope,
  onScopeDispose, shallowReactive,
  type ShallowReactive
} from "@vue/reactivity"
export { pickProps } from "./utils/pickProps.ts"
