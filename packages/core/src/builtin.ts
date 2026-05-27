import type { ComponentType } from "preact"
import { Fragment as PreactFragment } from "preact"
import { createVnodeProxy } from "./proxy.ts"
import type { JSXInternal as JSX } from "./types/attrs.ts"
import type { CompletedVirtualNodeProxy, PropsWithChildren, PruveComponent, VirtualNodeBuilderProxy } from "./types.ts"

export type ComponentProps<
  T extends keyof JSX.IntrinsicElements
  | PruveComponent<unknown>
  | ComponentType<any>
> = T extends PruveComponent<infer Props>
  ? PropsWithChildren<Props>
  : T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : T extends ComponentType<infer Props>
  ? PropsWithChildren<Props>
  : never

export function Tag(tagName: string): CompletedVirtualNodeProxy<ComponentProps<"div">>
export function Tag<Props>(tagName: string): VirtualNodeBuilderProxy<Props, never>
export function Tag<Props = ComponentProps<"div">>(tagName: string): any {
  return createVnodeProxy<Props>(tagName)
}

export const Fragment = () => createVnodeProxy(PreactFragment as any) as CompletedVirtualNodeProxy<ComponentProps<typeof PreactFragment>>


const _ = new Proxy({} as any, {
  get(_, prop) {
    return () => createVnodeProxy(prop.toString())
  }
}) as {
    [Key in keyof JSX.IntrinsicElements]: () => CompletedVirtualNodeProxy<ComponentProps<Key>>
  }

export const svg = _.svg
export const animate = _.animate
export const circle = _.circle
export const animateMotion = _.animateMotion
export const animateTransform = _.animateTransform
export const clipPath = _.clipPath
export const defs = _.defs
export const desc = _.desc
export const ellipse = _.ellipse
export const feBlend = _.feBlend
export const feColorMatrix = _.feColorMatrix
export const feComponentTransfer = _.feComponentTransfer
export const feComposite = _.feComposite
export const feConvolveMatrix = _.feConvolveMatrix
export const feDiffuseLighting = _.feDiffuseLighting
export const feDisplacementMap = _.feDisplacementMap
export const feDistantLight = _.feDistantLight
export const feDropShadow = _.feDropShadow
export const feFlood = _.feFlood
export const feFuncA = _.feFuncA
export const feFuncB = _.feFuncB
export const feFuncG = _.feFuncG
export const feFuncR = _.feFuncR
export const feGaussianBlur = _.feGaussianBlur
export const feImage = _.feImage
export const feMerge = _.feMerge
export const feMergeNode = _.feMergeNode
export const feMorphology = _.feMorphology
export const feOffset = _.feOffset
export const fePointLight = _.fePointLight
export const feSpecularLighting = _.feSpecularLighting
export const feSpotLight = _.feSpotLight
export const feTile = _.feTile
export const feTurbulence = _.feTurbulence
export const filter = _.filter
export const foreignObject = _.foreignObject
export const g = _.g
export const image = _.image
export const line = _.line
export const linearGradient = _.linearGradient
export const marker = _.marker
export const mask = _.mask
export const metadata = _.metadata
export const mpath = _.mpath
export const path = _.path
export const pattern = _.pattern
export const polygon = _.polygon
export const polyline = _.polyline
export const radialGradient = _.radialGradient
export const rect = _.rect
export const set = _.set
export const stop = _.stop
export const svgSwitch = _.switch
export const symbol = _.symbol
export const text = _.text
export const textPath = _.textPath
export const tspan = _.tspan
export const use = _.use
export const view = _.view
export const a = _.a
export const abbr = _.abbr
export const address = _.address
export const area = _.area
export const article = _.article
export const aside = _.aside
export const audio = _.audio
export const b = _.b
export const base = _.base
export const bdi = _.bdi
export const bdo = _.bdo
export const big = _.big
export const blockquote = _.blockquote
export const body = _.body
export const br = _.br
export const button = _.button
export const canvas = _.canvas
export const caption = _.caption
export const cite = _.cite
export const code = _.code
export const col = _.col
export const colgroup = _.colgroup
export const data = _.data
export const datalist = _.datalist
export const dd = _.dd
export const del = _.del
export const details = _.details
export const dfn = _.dfn
export const dialog = _.dialog
export const div = _.div
export const dl = _.dl
export const dt = _.dt
export const em = _.em
export const embed = _.embed
export const fieldset = _.fieldset
export const figcaption = _.figcaption
export const figure = _.figure
export const footer = _.footer
export const form = _.form
export const h1 = _.h1
export const h2 = _.h2
export const h3 = _.h3
export const h4 = _.h4
export const h5 = _.h5
export const h6 = _.h6
export const head = _.head
export const header = _.header
export const hgroup = _.hgroup
export const hr = _.hr
export const html = _.html
export const i = _.i
export const iframe = _.iframe
export const img = _.img
export const input = _.input
export const ins = _.ins
export const kbd = _.kbd
export const keygen = _.keygen
export const label = _.label
export const legend = _.legend
export const li = _.li
export const link = _.link
export const main = _.main
export const map = _.map
export const mark = _.mark
export const marquee = _.marquee
export const menu = _.menu
export const menuitem = _.menuitem
export const meta = _.meta
export const meter = _.meter
export const nav = _.nav
export const noscript = _.noscript
export const object = _.object
export const ol = _.ol
export const optgroup = _.optgroup
export const option = _.option
export const output = _.output
export const p = _.p
export const param = _.param
export const picture = _.picture
export const pre = _.pre
export const progress = _.progress
export const q = _.q
export const rp = _.rp
export const rt = _.rt
export const ruby = _.ruby
export const s = _.s
export const samp = _.samp
export const script = _.script
export const search = _.search
export const section = _.section
export const select = _.select
export const slot = _.slot
export const small = _.small
export const source = _.source
export const span = _.span
export const strong = _.strong
export const style = _.style
export const sub = _.sub
export const summary = _.summary
export const sup = _.sup
export const table = _.table
export const tbody = _.tbody
export const td = _.td
export const template = _.template
export const textarea = _.textarea
export const tfoot = _.tfoot
export const th = _.th
export const thead = _.thead
export const time = _.time
export const title = _.title
export const tr = _.tr
export const track = _.track
export const u = _.u
export const ul = _.ul
export const htmlVar = _.var
export const video = _.video
export const wbr = _.wbr
