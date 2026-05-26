# Pruve — Handoff

A personal frontend framework. This doc is the design source of truth — if exploratory code in `packages/core/src/render.ts` or elsewhere doesn't line up with what's here, the doc wins.

## What Pruve is

A small frontend framework. Two things define its character:

1. **Builder-pattern API.** No JSX. Elements and components are constructed via chained method calls on a Proxy:
   ```ts
   div()
     .id("app")
     .className("container")
     .onClick(() => count.set(count.value + 1))
     .children([
       span().children(`count: ${count.value}`),
       MyButton().variant("primary"),
     ])
   ```
2. **Vue-style island reactivity.** Each component is its own reactive boundary. A signal change inside `MyButton` re-renders **only** `MyButton`. A parent re-render does **not** cascade into children. Props are reactive at per-key granularity — a child only re-renders if it actually reads a prop that changed.

## Rendering backend

**Preact.** Each Pruve component is implemented as a preact functional component under the hood. Preact owns vdom + diff + reconciliation; Pruve owns the reactive layer, the builder API, and the wrapper that bridges the two.

Rationale: preact already understands components as first-class vdom citizens, has a working reconciler, and handles the lifecycle/identity problems that are painful to hand-roll. We layer our reactive primitives on top instead of reimplementing the diff.

## Package layout

| Package | Contents |
|---|---|
| `@pruve/core` (`packages/core`) | Builder proxies (`createVnodeProxy`), tag factories (`div`, `button`, …), `component()`, `mount()`, render/preact bridge, all type definitions, attribute typing |
| `@pruve/reactivity` (`packages/reactivity`) | `signal`, `computed`, `useEffect`, `useUpdateEffect`, `effectScope`, `onScopeDispose`, `pickProps`. Thin public wrappers over `@vue/reactivity` |
| `pruve` (`packages/pruve`) | Bundle: re-exports everything from `@pruve/core` + `@pruve/reactivity` |
| `@pruve/playground` (`packages/playground`) | Sample app + stress tests. Vite runs the dev server |

`@vue/reactivity` is a direct dep of `@pruve/core` so internals can import `shallowReactive` without exposing it to users.

## Public API

### Tag factories
Every standard HTML tag has a typed builder: `div()`, `button()`, `input()`, `h1()`, … Each returns a `VirtualNodeBuilderProxy` typed against its element's attributes (`IntrinsicHTMLElements`).

For arbitrary tags: `Tag<Props>("custom-elem")`. There's a `Fragment` for `@@fragment`-typed grouping.

### Builder proxy methods
- `.<propName>(value)` — set any attribute / event / prop. Examples: `.id("foo")`, `.onClick(fn)`, `.className("x")`, `.style("padding:8px")`, `.disabled(true)`.
- `.children(child | child[])` — accepts a builder proxy, raw `VirtualNode`, string, number, boolean, null/undefined, or nested arrays of those. Strings/numbers become text nodes; booleans/null/undefined render nothing.
- `.key(value)` — explicit key for keyed reconciliation.
- `.with(partialProps)` — shallow-merge an object of props (for spreading).
- `.make()` — extract the underlying `VirtualNode { type, key, props }`. Used internally; users rarely call it.

Types enforce that **required props must be set before `.make()` is callable** (see `MissingKeys` / `VirtualNodeBuilderProxy` in `packages/core/src/types.ts`). If you forget a required prop, `.make()` is typed as `never` until you set it.

### `component(setup)`
```ts
const MyButton = component<ButtonProps>((props) => {
  // setup: runs ONCE per mount.
  const count = signal(0)
  // return a render function: called many times across the component's life.
  return () => button()
    .className(`btn-${props.variant}`)
    .onClick(() => count.set(count.value + 1))
    .children(`clicked ${count.value} times`)
})
```

`setup: (props: Props) => () => PruveNode`. Returning a render function (not a vnode directly) is intentional: setup is the one-time wiring, render is the cheap part that re-runs on dep change.

#### Calling a component
`MyButton()` returns a builder proxy just like a tag, so it composes:
```ts
MyButton().variant("primary").key("submit-btn")
```

#### Generic components
TS doesn't have higher-kinded types, but the overloaded `PruveComponent` interface lets you narrow a generic by typing the base parameter as `unknown`:
```ts
type ListProps<T> = { items: T[] }
const List = component<ListProps<unknown>>((props) => { ... })

// at call site, narrow it:
List<ListProps<string>>().items(["a", "b"]) // items: string[]
```
Inside `setup`, `props.items` is `unknown[]` — accepted trade-off for narrowing at the call site without a cast. **If the base type uses a concrete type instead of `unknown`, narrowing won't work** — TS picks the wider non-generic overload and the generic argument is silently ignored.

### Reactivity (`@pruve/reactivity`)
- `signal<T>(initial)` → `WritableSignal<T>` with `.value` (read), `.set(v)`, `.asReadonly()`.
- `computed(fn)` → readonly `Signal<T>`.
- `useEffect(fn)` — fires `fn` immediately, then on any tracked dep change. Synchronous scheduler: a signal write inside an event handler triggers the effect body before the handler returns.
- `useUpdateEffect(fn, deps)` — runs only on subsequent dep changes (not the initial call).
- `effectScope()`, `onScopeDispose(fn)`, `isInsideScope()` — scope management.
- `pickProps(props).foo().bar(defaultValue).pickRest()` — destructure reactive props into individual `Signal`s plus a `rest` proxy of the remainder. Useful for forwarding props.

### `mount(App, rootElement)`
Mounts a component tree under a DOM element. Returns `{ unmount(): void }`. `App` must be a component (not a raw element vnode).

## Key design choices

### 1. Per-key reactive props (Vue-style, not React-style)
Props passed to `setup` are wrapped in `shallowReactive` (from `@vue/reactivity`). Reads (`props.variant`) track per key. When the parent re-renders with new props, only the keys that actually changed get mutated, which triggers only the effects that read those keys.

In practice: `FineGrained` reads `props.read` but not `props.ignored`. The parent bumps `ignored` → only effects tracking `ignored` re-fire → `FineGrained` does **not** re-render even though the parent did.

`shallowReactive` is internal; not exposed from `@pruve/reactivity`.

### 2. Setup vs. render split
- `setup` runs **once** per mount. Place signals, computeds, useEffects here.
- The function returned by setup is the render fn — pure-ish, re-run on dep change.
- No `useState`/`useRef`/hooks-rules-of-React. State is signals, declared in setup.

### 3. Component identity (slot reconciliation)
Components are matched **per-setup-fn positionally**, with `.key()` for explicit identity. Specifically:
- Each parent assigns a slot key to each child component. The key is either `<setupFnId>:k:<userKey>` (when `.key()` was used) or `<setupFnId>:i:<positionalIndex>` (otherwise).
- **Positional index is per-setup-fn**, not global across siblings. Hiding one `Toggleable` doesn't shift index-based slots for `AlphaBox` or `KeyedList` siblings.
- This is React-style "reconcile by call order" reconciliation, but with the per-type refinement that's closer to Vue's "match by `sel` first."
- Reordering same-type siblings without keys = identity loss, same caveat as React/Vue.

### 4. No compiler
Everything is runtime. No build step needed. Slot identity comes from runtime call order, not source position. Trade-off accepted: users use `.key()` to stabilize identity when needed.

### 5. No async/Promise setup
Setup is synchronous. Don't add defensive scaffolding for async setup paths — they are out of scope. If a future feature genuinely needs it, design it explicitly.

### 6. Builder Proxy identity
The proxy returned by `createVnodeProxy` self-identifies via `Symbol.for("pruve.proxy")` so the renderer can distinguish builder proxies from raw `VirtualNode` objects (and from other functions). Use `isVnodeProxy(x)` to detect.

### 7. Setup gotchas (preact wrapper)
The Pruve component is implemented as a preact functional component. Setup must run **before** the first render, so use `useRef(null)` + null-check (or `useState`'s lazy initializer) to run it once — **not** `useEffect`, which fires after render.

```ts
const instanceRef = useRef<Instance | null>(null)
if (instanceRef.current === null) {
  const reactiveProps = shallowReactive({ ...props })
  const scope = effectScope()
  let renderFn!: () => PruveNode
  scope.run(() => { renderFn = setup(reactiveProps) })
  instanceRef.current = { reactiveProps, scope, renderFn }
}

// cleanup ONLY in useEffect:
useEffect(() => () => instanceRef.current!.scope.stop(), [])
```

### 8. Reactive → preact bridge
Inside each Pruve component wrapper, set up a Vue effect that runs the user's render fn (so reactive reads track) and forces a preact re-render on dep change via `useState`:

```ts
const [, force] = useState(0)
useEffect(() => {
  const runner = effect(() => {
    instanceRef.current!.output = convertToPreact(renderFn())
    if (mounted.current) force((n) => n + 1)
  })
  mounted.current = true
  return () => runner.effect.stop()
}, [])

return instanceRef.current!.output
```

Result: a signal change inside the component re-renders **only** that component (preact diffs its subtree). Parent re-renders call the wrapper, which mutates `reactiveProps` per-key — per-key tracking means only the right effects fire downstream.

### 9. Don't add memoization yet
Don't reach for `memo(Component, () => true)` to block preact's parent-driven re-render unless perf testing proves it's needed. The wrapper's "parent re-render → sync props into reactiveProps → return cached vnode" path is already cheap. Memoization adds complexity around how new props reach the child.

## File map (`packages/core/src/`)

- `types.ts` — `VirtualNode`, `VirtualNodeBuilderProxy`, `ComponentSetup`, `PruveComponent`, `PruveNode`, `PropsWithChildren`, `MissingKeys`, etc.
- `proxy.ts` — `createVnodeProxy()`, `isVnodeProxy()`, `PRUVE_PROXY` symbol.
- `builtin.ts` — Tag factories (`div`, `button`, …), `Tag()`, `Fragment`, `component()`, `IntrinsicHTMLElements` type, `ComponentProps<T>` helper.
- `types/attrs.ts` — Per-element attribute types (`HTMLAttributes`, `ButtonHTMLAttributes`, etc.).
- `dom.ts` — `mount()`, `PruveApp` interface. Re-exports attribute types.
- `lib.ts` — Public barrel.
- `render.ts` — Render/preact bridge (this is the file you'll be working in).

## TypeScript / tooling

- Uses `@typescript/native-preview` (the new tsgo). Type-check with:
  ```
  npx tsgo -p packages/core/tsconfig.json
  npx tsgo -p packages/playground/tsconfig.json
  ```
- `tsconfig.base.json` enforces strict, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `verbatimModuleSyntax`, `erasableSyntaxOnly`. Keep code clean of unused symbols and explicit-only type imports.
- Module style: NodeNext with `.ts` import suffixes (`allowImportingTsExtensions`).

## Current state / next steps

- Public API (builder proxies, types, `component()`, reactivity primitives) is in place and stable.
- Stress tests in `packages/playground/src/main.ts` exercise: state persistence across parent re-renders, per-key reactivity, deep nesting, mount/unmount, slot type mismatch, keyed lists with per-row local state. Use these as acceptance tests for the render layer.
- Build the render layer in `packages/core/src/render.ts`:
  1. A function that converts a `VirtualNode` tree (from `.make()`) to preact vnodes. Component vnodes become preact components per the wrapper design above.
  2. Event mapping: `onClick`, `onInput`, etc. → preact's `on…` props (preact accepts them directly).
  3. Attribute mapping: most props pass through to preact as-is. `className` is preact's standard name. No special wrapper element per component.
  4. `mount(App, root)` should call preact's `render(convert(App), root)` and return `{ unmount() }` which calls `render(null, root)` or equivalent.
- Verify stress-test sections all pass: especially section 6 (keyed list with per-row counter — local count must follow row on reorder).

## House rules

- Don't introduce a build step / compiler — runtime only.
- Don't expose `shallowReactive` or other internals from `@pruve/reactivity`.
- Don't add features outside the supported surface "just in case" (e.g., async setup paths, framework integration shims, runtime warnings for hypothetical misuse).
- Keep code direct: no comments explaining what readable code already says, no defensive layers, no abstraction tax.
- Builder-API throughout the public surface. Don't sneak JSX or `h(...)` calls into examples.
