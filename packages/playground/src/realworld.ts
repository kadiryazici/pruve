import "./lib.css"

import { clsx, type ClassValue } from "clsx"
import {
  component,
  computed,
  mount,
  signal,
} from "pruve"
import {
  a,
  button,
  div,
  footer,
  h1,
  h2,
  h3,
  header,
  input,
  li,
  main,
  nav,
  p,
  section,
  span,
  ul,
} from "pruve/builtin"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Route = "discover" | "saved" | "cart"
type Category = "All" | "Workspace" | "Travel" | "Audio" | "Home"

type Product = {
  id: number
  name: string
  category: Exclude<Category, "All">
  price: number
  formerPrice?: number
  description: string
  accent: string
  badge: string
}

const products: Product[] = [
  {
    id: 1,
    name: "Arc Desk Lamp",
    category: "Workspace",
    price: 89,
    formerPrice: 120,
    description: "Warm dimmable light with a clean aluminum finish.",
    accent: "from-amber-100 to-orange-200",
    badge: "Popular",
  },
  {
    id: 2,
    name: "Transit Weekender",
    category: "Travel",
    price: 146,
    description: "Carry-on sized bag with modular inner pockets.",
    accent: "from-emerald-100 to-teal-200",
    badge: "New",
  },
  {
    id: 3,
    name: "Halo Headphones",
    category: "Audio",
    price: 219,
    formerPrice: 265,
    description: "Wireless sound with all-day comfort and quiet mode.",
    accent: "from-indigo-100 to-violet-200",
    badge: "Sale",
  },
  {
    id: 4,
    name: "Stoneware Set",
    category: "Home",
    price: 64,
    description: "Hand-finished plates for unhurried dinners.",
    accent: "from-rose-100 to-pink-200",
    badge: "Limited",
  },
  {
    id: 5,
    name: "Focus Keyboard",
    category: "Workspace",
    price: 132,
    description: "Low-profile mechanical keys with tactile switches.",
    accent: "from-sky-100 to-cyan-200",
    badge: "Editor pick",
  },
  {
    id: 6,
    name: "Pocket Speaker",
    category: "Audio",
    price: 74,
    description: "Small waterproof speaker made for weekend trips.",
    accent: "from-lime-100 to-green-200",
    badge: "New",
  },
]

const categories: Category[] = ["All", "Workspace", "Travel", "Audio", "Home"]

type NavbarProps = {
  route: Route
  savedCount: number
  cartCount: number
  onNavigate: (route: Route) => void
}

const Navbar = component<NavbarProps>((props) => {
  const routes = computed(() => ([
    { name: "Discover", route: "discover" as Route },
    { name: `Saved (${props.savedCount})`, route: "saved" as Route },
    { name: `Cart (${props.cartCount})`, route: "cart" as Route },
  ]))

  return () => (
    header()
      .className(cn("sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur"))
      .children(
        nav()
          .className(cn("mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4"))
          .children([
            div()
              .className(cn("flex items-center gap-3"))
              .children([
                div()
                  .className(cn("flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white"))
                  .children("P"),
                div()
                  .children([
                    p()
                      .className(cn("text-base font-semibold text-slate-950"))
                      .children("Pruve Store"),
                    p()
                      .className(cn("text-xs text-slate-500"))
                      .children("Thoughtful essentials"),
                  ]),
              ]),
            div()
              .className(cn("hidden items-center gap-2 md:flex"))
              .children([
                routes.value.map((route) => (
                  button()
                    .className(cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      props.route === route.route
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                    ))
                    .onClick(() => props.onNavigate(route.route))
                    .children(route.name)
                )),
              ]),
            button()
              .className(cn("rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white md:hidden"))
              .onClick(() => props.onNavigate("cart"))
              .children(`Cart ${props.cartCount}`),
          ]),
      )
  )
})

type MetricProps = {
  value: string
  label: string
}

const Metric = component<MetricProps>((props) => {
  return () => (
    div()
      .className(cn("rounded-2xl border border-white/10 bg-white/10 p-4"))
      .children([
        p()
          .className(cn("text-2xl font-semibold text-white"))
          .children(props.value),
        p()
          .className(cn("mt-1 text-sm text-slate-300"))
          .children(props.label),
      ])
  )
})

const Hero = component(() => {
  const metrics = [
    { value: "48h", label: "Fast delivery" },
    { value: "4.9", label: "Customer score" },
    { value: "120+", label: "New pieces" },
    { value: "Free", label: "Returns" },
  ]

  return () => (
    section()
      .className(cn("overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-9 text-white shadow-xl shadow-slate-200 md:px-12"))
      .children(
        div()
          .className(cn("grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"))
          .children([
            div()
              .children([
                p()
                  .className(cn("mb-4 text-sm font-medium uppercase tracking-[0.3em] text-emerald-300"))
                  .children("Spring collection"),
                h1()
                  .className(cn("max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl"))
                  .children("Make everyday spaces feel intentional."),
                p()
                  .className(cn("mt-5 max-w-xl text-base leading-7 text-slate-300"))
                  .children("Curated design pieces for work, weekends and quiet evenings at home."),
                div()
                  .className(cn("mt-8 flex gap-3"))
                  .children([
                    button()
                      .className(cn("rounded-full bg-white px-6 py-3 font-medium text-slate-950"))
                      .children("Shop arrivals"),
                    button()
                      .className(cn("rounded-full border border-white/20 px-6 py-3 font-medium text-white"))
                      .children("View journal"),
                  ]),
              ]),
            div()
              .className(cn("grid grid-cols-2 gap-3 self-end"))
              .children([
                metrics.map((metric) => (
                  Metric()
                    .value(metric.value)
                    .label(metric.label)
                )),
              ]),
          ]),
      )
  )
})

type ProductCardProps = {
  product: Product
  saved: boolean
  quantity: number
  onToggleSaved: (id: number) => void
  onAdd: (id: number) => void
}

const ProductCard = component<ProductCardProps>((props) => {
  return () => (
    articleCard()
      .children([
        div()
          .className(cn("relative flex h-52 items-end rounded-2xl bg-gradient-to-br p-4", props.product.accent))
          .children([
            span()
              .className(cn("absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700"))
              .children(props.product.badge),
            button()
              .className(cn(
                "absolute right-4 top-4 rounded-full p-2 text-lg shadow-sm transition",
                props.saved ? "bg-slate-900 text-white" : "bg-white/80 text-slate-600",
              ))
              .onClick(() => props.onToggleSaved(props.product.id))
              .children(props.saved ? "Saved" : "Save"),
            span()
              .className(cn("text-5xl text-slate-900/20"))
              .children(props.product.name.slice(0, 1)),
          ]),
        div()
          .className(cn("pt-5"))
          .children([
            div()
              .className(cn("flex items-start justify-between gap-4"))
              .children([
                div()
                  .children([
                    p()
                      .className(cn("text-xs font-medium uppercase tracking-wider text-slate-400"))
                      .children(props.product.category),
                    h3()
                      .className(cn("mt-1 text-lg font-semibold text-slate-950"))
                      .children(props.product.name),
                  ]),
                div()
                  .className(cn("text-right"))
                  .children([
                    p()
                      .className(cn("font-semibold text-slate-950"))
                      .children(`$${props.product.price}`),
                    props.product.formerPrice == null
                      ? null
                      : p()
                        .className(cn("text-xs text-slate-400 line-through"))
                        .children(`$${props.product.formerPrice}`),
                  ]),
              ]),
            p()
              .className(cn("mt-3 min-h-12 text-sm leading-6 text-slate-500"))
              .children(props.product.description),
            button()
              .className(cn("mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"))
              .onClick(() => props.onAdd(props.product.id))
              .children(props.quantity === 0 ? "Add to cart" : `Add another - in cart: ${props.quantity}`),
          ]),
      ])
  )
})

function articleCard() {
  return div()
    .className(cn("rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"))
}

type CartRowProps = {
  product: Product
  quantity: number
  onRemove: (id: number) => void
}

const CartRow = component<CartRowProps>((props) => {
  return () => (
    li()
      .className(cn("flex items-center justify-between gap-4 border-b border-slate-100 py-4"))
      .children([
        div()
          .children([
            p()
              .className(cn("font-medium text-slate-950"))
              .children(props.product.name),
            p()
              .className(cn("text-sm text-slate-500"))
              .children(`${props.quantity} x $${props.product.price}`),
          ]),
        div()
          .className(cn("flex items-center gap-4"))
          .children([
            p()
              .className(cn("font-semibold text-slate-950"))
              .children(`$${props.product.price * props.quantity}`),
            button()
              .className(cn("text-sm font-medium text-rose-500 hover:text-rose-700"))
              .onClick(() => props.onRemove(props.product.id))
              .children("Remove"),
          ]),
      ])
  )
})

const App = component(() => {
  const route = signal<Route>("discover")
  const category = signal<Category>("All")
  const query = signal("")
  const saved = signal(new Set<number>())
  const cart = signal(new Map<number, number>())

  const savedCount = computed(() => saved.value.size)

  const cartCount = computed(() => (
    Array.from(cart.value.values())
      .reduce((total, quantity) => total + quantity, 0)
  ))

  const subtotal = computed(() => (
    products.reduce((total, product) => (
      total + product.price * (cart.value.get(product.id) ?? 0)
    ), 0)
  ))

  const collectionLabel = computed(() => (
    route.value === "saved" ? "Your collection" : "Store"
  ))

  const collectionTitle = computed(() => (
    route.value === "saved" ? "Saved items" : "Explore products"
  ))

  const categoryTabs = computed(() => (
    categories.map((entry) => ({
      entry,
      selected: category.value === entry,
    }))
  ))

  const visibleProducts = computed(() => {
    const search = query.value.trim().toLowerCase()

    return products
      .filter((product) => {
        const categoryMatch = category.value === "All" || product.category === category.value
        const searchMatch = search === "" || `${product.name} ${product.description}`.toLowerCase().includes(search)
        const routeMatch = route.value !== "saved" || saved.value.has(product.id)

        return categoryMatch && searchMatch && routeMatch
      })
      .map((product) => ({
        product,
        saved: saved.value.has(product.id),
        quantity: cart.value.get(product.id) ?? 0,
      }))
  })

  const cartRows = computed(() => (
    products
      .filter((product) => cart.value.has(product.id))
      .map((product) => ({
        product,
        quantity: cart.value.get(product.id) ?? 0,
      }))
  ))

  const toggleSaved = (id: number) => {
    const next = new Set(saved.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    saved.set(next)
  }

  const addToCart = (id: number) => {
    const next = new Map(cart.value)
    next.set(id, (next.get(id) ?? 0) + 1)
    cart.set(next)
  }

  const removeFromCart = (id: number) => {
    const next = new Map(cart.value)
    next.delete(id)
    cart.set(next)
  }

  return () => (
    div()
      .className(cn("min-h-screen bg-slate-50 text-slate-900"))
      .children([
        Navbar()
          .route(route.value)
          .savedCount(savedCount.value)
          .cartCount(cartCount.value)
          .onNavigate((nextRoute) => route.set(nextRoute)),
        main()
          .className(cn("mx-auto max-w-7xl px-6 py-8"))
          .children([
            route.value === "discover" ? Hero() : null,
            route.value === "cart"
              ? section()
                .className(cn("mx-auto max-w-3xl py-8"))
                .children([
                  div()
                    .className(cn("mb-8 flex items-center justify-between"))
                    .children([
                      h2()
                        .className(cn("text-3xl font-semibold tracking-tight"))
                        .children("Your cart"),
                      button()
                        .className(cn("text-sm font-medium text-slate-500"))
                        .onClick(() => route.set("discover"))
                        .children("Continue shopping"),
                    ]),
                  cartRows.value.length === 0
                    ? p()
                      .className(cn("rounded-3xl bg-white p-10 text-center text-slate-500"))
                      .children("Your cart is empty. Find something beautiful.")
                    : div()
                      .className(cn("rounded-3xl bg-white p-6 shadow-sm"))
                      .children([
                        ul()
                          .children(cartRows.value.map((row) =>
                            CartRow()
                              .key(row.product.id)
                              .product(row.product)
                              .quantity(row.quantity)
                              .onRemove(removeFromCart),
                          )),
                        div()
                          .className(cn("mt-6 flex items-center justify-between border-t border-slate-200 pt-6"))
                          .children([
                            div()
                              .children([
                                p()
                                  .className(cn("text-sm text-slate-500"))
                                  .children("Subtotal"),
                                p()
                                  .className(cn("text-2xl font-semibold"))
                                  .children(`$${subtotal.value}`),
                              ]),
                            button()
                              .className(cn("rounded-xl bg-emerald-500 px-7 py-3 font-medium text-white"))
                              .children("Checkout"),
                          ]),
                      ]),
                ])
              : section()
                .className(cn("py-10"))
                .children([
                  div()
                    .className(cn("mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"))
                    .children([
                      div()
                        .children([
                          p()
                            .className(cn("text-sm font-medium uppercase tracking-wider text-emerald-600"))
                            .children(collectionLabel.value),
                          h2()
                            .className(cn("mt-2 text-3xl font-semibold tracking-tight"))
                            .children(collectionTitle.value),
                        ]),
                      input()
                        .className(cn("w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-400 focus:ring-2 md:w-72"))
                        .placeholder("Search products")
                        .value(query.value)
                        .onInput((event) => query.set((event.currentTarget as HTMLInputElement).value)),
                    ]),
                  div()
                    .className(cn("mb-7 flex flex-wrap gap-2"))
                    .children(
                      categoryTabs.value.map((tab) => (
                        button()
                          .key(tab.entry)
                          .className(cn(
                            "rounded-full border px-4 py-2 text-sm font-medium transition",
                            tab.selected
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-600",
                          ))
                          .onClick(() => category.set(tab.entry))
                          .children(tab.entry)
                      )),
                    ),
                  visibleProducts.value.length === 0
                    ? p()
                      .className(cn("rounded-3xl bg-white p-12 text-center text-slate-500"))
                      .children("No matching products found.")
                    : div()
                      .className(cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3"))
                      .children(
                        visibleProducts.value.map((entry) => (
                          ProductCard()
                            .key(entry.product.id)
                            .product(entry.product)
                            .saved(entry.saved)
                            .quantity(entry.quantity)
                            .onToggleSaved(toggleSaved)
                            .onAdd(addToCart)
                        )),
                      ),
                ]),
          ]),
        footer()
          .className(cn("border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500"))
          .children([
            a()
              .className(cn("font-semibold text-slate-900"))
              .children("Pruve Store"),
            span()
              .children(" - Real-world component and reactivity playground"),
          ]),
      ])
  )
})

const root = document.getElementById("app")
if (root) {
  mount(App, root)
}
