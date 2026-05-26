import {
  button,
  component,
  div,
  h1,
  h2,
  li,
  mount,
  p,
  signal,
  span,
  ul,
  type PruveComponent,
} from "pruve"

// ---------------------------------------------------------------------------
// 1) Counter — proves local state survives parent re-renders.
//    Parent bumps a signal it reads; these counters must NOT reset to 0.
// ---------------------------------------------------------------------------
const Counter = component<{ label: string }>((props) => {
  const count = signal(0)
  console.log("[SETUP] Counter", props.label)

  return () => {
    console.log("[RENDER] Counter", props.label, "=", count.value)
    return div().children([
      span().children(`${props.label}: ${count.value}`),
      " ",
      button()
        .onClick(() => count.set(count.value + 1))
        .children("+1"),
    ])
  }
})

// ---------------------------------------------------------------------------
// 2) Fine-grained props — reads `read` but NEVER `ignored`. Bumping `ignored`
//    re-renders App (because App reads its own signal) but must NOT log a
//    [RENDER] from FineGrained. Validates shallowReactive per-key tracking.
// ---------------------------------------------------------------------------
type FineProps = { read: number; ignored: number }
const FineGrained = component<FineProps>((props) => {
  console.log("[SETUP] FineGrained")

  return () => {
    console.log("[RENDER] FineGrained read=", props.read)
    return p().children(`reads only \"read\": ${props.read}`)
  }
})

// ---------------------------------------------------------------------------
// 3) Deep nesting — recursive Nested<depth> with its own local signal at each
//    level. Bumping a deep level must NOT log [RENDER] at shallower levels.
// ---------------------------------------------------------------------------
type NestedProps = { depth: number }
const Nested: PruveComponent<NestedProps> = component<NestedProps>((props) => {
  const local = signal(0)
  console.log("[SETUP] Nested d=", props.depth)

  return () => {
    console.log("[RENDER] Nested d=", props.depth, "local=", local.value)
    return div()
      .style("padding-left:14px;border-left:2px solid #aaa;margin:4px 0")
      .children([
        span().children(`d=${props.depth} local=${local.value} `),
        button()
          .onClick(() => local.set(local.value + 1))
          .children("local+"),
        " ",

        props.depth > 0
          ? Nested().depth(props.depth - 1)
          : span().children("(leaf)"),
      ])
  }
})

// ---------------------------------------------------------------------------
// 4) Toggleable — appears/disappears. Disappearing must dispose its scope
//    (look for the [SETUP] to fire again on re-show — that's the proof).
// ---------------------------------------------------------------------------
const Toggleable = component(() => {
  console.log("[SETUP] Toggleable")

  return () => {
    console.log("[RENDER] Toggleable")
    return p().children("Toggleable is alive 👋")
  }
})

// ---------------------------------------------------------------------------
// 5) Slot type mismatch — same slot, different component. Switching must
//    dispose old, setup new (two [SETUP] logs for different components).
// ---------------------------------------------------------------------------
const AlphaBox = component(() => {
  console.log("[SETUP] AlphaBox")
  return () => {
    console.log("[RENDER] AlphaBox")
    return p().children("alpha box")
  }
})
const BetaBox = component(() => {
  console.log("[SETUP] BetaBox")
  return () => {
    console.log("[RENDER] BetaBox")
    return p().children("beta box")
  }
})

// ---------------------------------------------------------------------------
// 6) Keyed list — each item has its own counter. Reverse / pop / add must
//    NOT log [SETUP] for items that just moved (keyed identity preserved).
// ---------------------------------------------------------------------------
const ItemRow = component<{ text: string }>((props) => {
  const localCount = signal(0)
  console.log("[SETUP] ItemRow", props.text)

  return () => {
    console.log("[RENDER] ItemRow", props.text, "local=", localCount.value)
    return li().children([
      `[${props.text}] local=${localCount.value} `,
      button()
        .onClick(() => localCount.set(localCount.value + 1))
        .children("+"),
    ])
  }
})

type ListProps = { items: { id: number; text: string }[] }
const KeyedList = component<ListProps>((props) => {
  console.log("[SETUP] KeyedList")

  return () => {
    console.log("[RENDER] KeyedList n=", props.items.length)
    return ul().children(
      props.items.map((item) => ItemRow().key(item.id).text(item.text)),
    )
  }
})

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const App = component(() => {
  const parentTick = signal(0)
  const read = signal(0)
  const ignored = signal(0)
  const showToggleable = signal(true)
  const variant = signal<"a" | "b">("a")
  const items = signal([
    { id: 1, text: "apple" },
    { id: 2, text: "banana" },
    { id: 3, text: "cherry" },
  ])

  console.log("[SETUP] App")

  return () => {
    console.log("[RENDER] App tick=", parentTick.value)

    return div()
      .id("app")
      .style("font-family:system-ui;padding:16px;line-height:1.5")
      .children([
        h1().children(`Pruve stress test (tick=${parentTick.value})`),
        button()
          .onClick(() => parentTick.set(parentTick.value + 1))
          .children("force App re-render"),

        h2().children("1) Counter state across parent re-renders"),
        p().children(
          "Bump 'force App re-render'. Counter [RENDER] should NOT fire; counts must persist.",
        ),
        Counter().label("alpha"),
        Counter().label("beta"),

        h2().children("2) Fine-grained per-key reactivity"),
        p().children(
          "Bumping 'ignored' should re-render App but NOT FineGrained.",
        ),
        FineGrained().read(read.value).ignored(ignored.value),
        button()
          .onClick(() => read.set(read.value + 1))
          .children(`bump read (${read.value}) — should re-render FineGrained`),
        " ",
        button()
          .onClick(() => ignored.set(ignored.value + 1))
          .children(
            `bump ignored (${ignored.value}) — should NOT re-render FineGrained`,
          ),

        h2().children("3) Deep nesting — bump leaf, watch logs"),
        p().children(
          "Click 'local+' at depth=0. Only depth=0 should log [RENDER]; ancestors must stay quiet.",
        ),
        Nested().depth(4),

        h2().children("4) Conditional mount / unmount"),
        p().children(
          "Toggling hides Toggleable; re-showing must log [SETUP] again (scope was disposed).",
        ),
        button()
          .onClick(() => showToggleable.set(!showToggleable.value))
          .children(showToggleable.value ? "hide" : "show"),
        " ",
        showToggleable.value ? Toggleable() : span().children("(hidden)"),

        h2().children("5) Same slot, different component"),
        p().children(
          "Swapping must dispose old, setup new. Look for [SETUP] AlphaBox vs BetaBox on each click.",
        ),
        button()
          .onClick(() => variant.set(variant.value === "a" ? "b" : "a"))
          .children(`swap (now: ${variant.value})`),
        " ",
        variant.value === "a" ? AlphaBox() : BetaBox(),

        h2().children("6) Keyed list — local counts survive reorder"),
        p().children(
          "Increment a row's local counter, then reverse. The counter should follow its row.",
        ),
        KeyedList().items(items.value),
        button()
          .onClick(() =>
            items.set([
              ...items.value,
              { id: Date.now(), text: `n${items.value.length}` },
            ]),
          )
          .children("add"),
        " ",
        button()
          .onClick(() => items.set(items.value.slice(0, -1)))
          .children("pop"),
        " ",
        button()
          .onClick(() => items.set(items.value.slice().reverse()))
          .children("reverse"),
      ])
  }
})

const root = document.getElementById("app")
if (root) {
  mount(App, root)
}
