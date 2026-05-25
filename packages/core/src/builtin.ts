import type * as PruveDOM from "./dom.ts"
import { createVnodeProxy } from "./lib.ts";
import type { WritableSignal } from "./reactivity.ts";
import type { ComponentSetup, PropsWithChildren, PruveComponent } from "./types.ts";

export type PropsWithRef<RefType, Props> = Props & {
  ref?: ((instance: RefType | null) => void) | WritableSignal<RefType | null> | null
}

export interface IntrinsicHTMLElements {
  a: PropsWithChildren<PropsWithRef<HTMLAnchorElement, PruveDOM.AccessibleAnchorHTMLAttributes<HTMLAnchorElement>>>;
  abbr: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  address: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  area: PropsWithChildren<PropsWithRef<HTMLAreaElement, PruveDOM.AccessibleAreaHTMLAttributes<HTMLAreaElement>>>;
  article: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.ArticleHTMLAttributes<HTMLElement>>>;
  aside: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.AsideHTMLAttributes<HTMLElement>>>;
  audio: PropsWithChildren<PropsWithRef<HTMLAudioElement, PruveDOM.AudioHTMLAttributes<HTMLAudioElement>>>;
  b: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  base: PropsWithChildren<PropsWithRef<HTMLBaseElement, PruveDOM.BaseHTMLAttributes<HTMLBaseElement>>>;
  bdi: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  bdo: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  big: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  blockquote: PropsWithChildren<PropsWithRef<HTMLQuoteElement, PruveDOM.BlockquoteHTMLAttributes<HTMLQuoteElement>>>;
  body: PropsWithChildren<PropsWithRef<HTMLBodyElement, PruveDOM.HTMLAttributes<HTMLBodyElement>>>;
  br: PropsWithChildren<PropsWithRef<HTMLBRElement, PruveDOM.BrHTMLAttributes<HTMLBRElement>>>;
  button: PropsWithChildren<PropsWithRef<HTMLButtonElement, PruveDOM.ButtonHTMLAttributes<HTMLButtonElement>>>;
  canvas: PropsWithChildren<PropsWithRef<HTMLCanvasElement, PruveDOM.CanvasHTMLAttributes<HTMLCanvasElement>>>;
  caption: PropsWithChildren<PropsWithRef<HTMLTableCaptionElement, PruveDOM.CaptionHTMLAttributes<HTMLTableCaptionElement>>>;
  cite: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  code: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  col: PropsWithChildren<PropsWithRef<HTMLTableColElement, PruveDOM.ColHTMLAttributes<HTMLTableColElement>>>;
  colgroup: PropsWithChildren<PropsWithRef<HTMLTableColElement, PruveDOM.ColgroupHTMLAttributes<HTMLTableColElement>>>;
  data: PropsWithChildren<PropsWithRef<HTMLDataElement, PruveDOM.DataHTMLAttributes<HTMLDataElement>>>;
  datalist: PropsWithChildren<PropsWithRef<HTMLDataListElement, PruveDOM.DataListHTMLAttributes<HTMLDataListElement>>>;
  dd: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.DdHTMLAttributes<HTMLElement>>>;
  del: PropsWithChildren<PropsWithRef<HTMLModElement, PruveDOM.DelHTMLAttributes<HTMLModElement>>>;
  details: PropsWithChildren<PropsWithRef<HTMLDetailsElement, PruveDOM.DetailsHTMLAttributes<HTMLDetailsElement>>>;
  dfn: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  dialog: PropsWithChildren<PropsWithRef<HTMLDialogElement, PruveDOM.DialogHTMLAttributes<HTMLDialogElement>>>;
  div: PropsWithChildren<PropsWithRef<HTMLDivElement, PruveDOM.HTMLAttributes<HTMLDivElement>>>;
  dl: PropsWithChildren<PropsWithRef<HTMLDListElement, PruveDOM.DlHTMLAttributes<HTMLDListElement>>>;
  dt: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.DtHTMLAttributes<HTMLElement>>>;
  em: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  embed: PropsWithChildren<PropsWithRef<HTMLEmbedElement, PruveDOM.EmbedHTMLAttributes<HTMLEmbedElement>>>;
  fieldset: PropsWithChildren<PropsWithRef<HTMLFieldSetElement, PruveDOM.FieldsetHTMLAttributes<HTMLFieldSetElement>>>;
  figcaption: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.FigcaptionHTMLAttributes<HTMLElement>>>;
  figure: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  footer: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.FooterHTMLAttributes<HTMLElement>>>;
  form: PropsWithChildren<PropsWithRef<HTMLFormElement, PruveDOM.FormHTMLAttributes<HTMLFormElement>>>;
  h1: PropsWithChildren<PropsWithRef<HTMLHeadingElement, PruveDOM.HeadingHTMLAttributes<HTMLHeadingElement>>>;
  h2: PropsWithChildren<PropsWithRef<HTMLHeadingElement, PruveDOM.HeadingHTMLAttributes<HTMLHeadingElement>>>;
  h3: PropsWithChildren<PropsWithRef<HTMLHeadingElement, PruveDOM.HeadingHTMLAttributes<HTMLHeadingElement>>>;
  h4: PropsWithChildren<PropsWithRef<HTMLHeadingElement, PruveDOM.HeadingHTMLAttributes<HTMLHeadingElement>>>;
  h5: PropsWithChildren<PropsWithRef<HTMLHeadingElement, PruveDOM.HeadingHTMLAttributes<HTMLHeadingElement>>>;
  h6: PropsWithChildren<PropsWithRef<HTMLHeadingElement, PruveDOM.HeadingHTMLAttributes<HTMLHeadingElement>>>;
  head: PropsWithChildren<PropsWithRef<HTMLHeadElement, PruveDOM.HeadHTMLAttributes<HTMLHeadElement>>>;
  header: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HeaderHTMLAttributes<HTMLElement>>>;
  hgroup: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  hr: PropsWithChildren<PropsWithRef<HTMLHRElement, PruveDOM.HrHTMLAttributes<HTMLHRElement>>>;
  html: PropsWithChildren<PropsWithRef<HTMLHtmlElement, PruveDOM.HtmlHTMLAttributes<HTMLHtmlElement>>>;
  i: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  iframe: PropsWithChildren<PropsWithRef<HTMLIFrameElement, PruveDOM.IframeHTMLAttributes<HTMLIFrameElement>>>;
  img: PropsWithChildren<PropsWithRef<HTMLImageElement, PruveDOM.AccessibleImgHTMLAttributes<HTMLImageElement>>>;
  input: PropsWithChildren<PropsWithRef<HTMLInputElement, PruveDOM.AccessibleInputHTMLAttributes<HTMLInputElement>>>;
  ins: PropsWithChildren<PropsWithRef<HTMLModElement, PruveDOM.InsHTMLAttributes<HTMLModElement>>>;
  kbd: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  keygen: PropsWithChildren<PropsWithRef<HTMLUnknownElement, PruveDOM.KeygenHTMLAttributes<HTMLUnknownElement>>>;
  label: PropsWithChildren<PropsWithRef<HTMLLabelElement, PruveDOM.LabelHTMLAttributes<HTMLLabelElement>>>;
  legend: PropsWithChildren<PropsWithRef<HTMLLegendElement, PruveDOM.LegendHTMLAttributes<HTMLLegendElement>>>;
  li: PropsWithChildren<PropsWithRef<HTMLLIElement, PruveDOM.LiHTMLAttributes<HTMLLIElement>>>;
  link: PropsWithChildren<PropsWithRef<HTMLLinkElement, PruveDOM.LinkHTMLAttributes<HTMLLinkElement>>>;
  main: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.MainHTMLAttributes<HTMLElement>>>;
  map: PropsWithChildren<PropsWithRef<HTMLMapElement, PruveDOM.MapHTMLAttributes<HTMLMapElement>>>;
  mark: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  marquee: PropsWithChildren<PropsWithRef<HTMLMarqueeElement, PruveDOM.MarqueeHTMLAttributes<HTMLMarqueeElement>>>;
  menu: PropsWithChildren<PropsWithRef<HTMLMenuElement, PruveDOM.MenuHTMLAttributes<HTMLMenuElement>>>;
  menuitem: PropsWithChildren<PropsWithRef<HTMLUnknownElement, PruveDOM.HTMLAttributes<HTMLUnknownElement>>>;
  meta: PropsWithChildren<PropsWithRef<HTMLMetaElement, PruveDOM.MetaHTMLAttributes<HTMLMetaElement>>>;
  meter: PropsWithChildren<PropsWithRef<HTMLMeterElement, PruveDOM.MeterHTMLAttributes<HTMLMeterElement>>>;
  nav: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.NavHTMLAttributes<HTMLElement>>>;
  noscript: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.NoScriptHTMLAttributes<HTMLElement>>>;
  object: PropsWithChildren<PropsWithRef<HTMLObjectElement, PruveDOM.ObjectHTMLAttributes<HTMLObjectElement>>>;
  ol: PropsWithChildren<PropsWithRef<HTMLOListElement, PruveDOM.OlHTMLAttributes<HTMLOListElement>>>;
  optgroup: PropsWithChildren<PropsWithRef<HTMLOptGroupElement, PruveDOM.OptgroupHTMLAttributes<HTMLOptGroupElement>>>;
  option: PropsWithChildren<PropsWithRef<HTMLOptionElement, PruveDOM.OptionHTMLAttributes<HTMLOptionElement>>>;
  output: PropsWithChildren<PropsWithRef<HTMLOutputElement, PruveDOM.OutputHTMLAttributes<HTMLOutputElement>>>;
  p: PropsWithChildren<PropsWithRef<HTMLParagraphElement, PruveDOM.HTMLAttributes<HTMLParagraphElement>>>;
  param: PropsWithChildren<PropsWithRef<HTMLParamElement, PruveDOM.ParamHTMLAttributes<HTMLParamElement>>>;
  picture: PropsWithChildren<PropsWithRef<HTMLPictureElement, PruveDOM.PictureHTMLAttributes<HTMLPictureElement>>>;
  pre: PropsWithChildren<PropsWithRef<HTMLPreElement, PruveDOM.HTMLAttributes<HTMLPreElement>>>;
  progress: PropsWithChildren<PropsWithRef<HTMLProgressElement, PruveDOM.ProgressHTMLAttributes<HTMLProgressElement>>>;
  q: PropsWithChildren<PropsWithRef<HTMLQuoteElement, PruveDOM.QuoteHTMLAttributes<HTMLQuoteElement>>>;
  rp: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  rt: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  ruby: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  s: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  samp: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  script: PropsWithChildren<PropsWithRef<HTMLScriptElement, PruveDOM.ScriptHTMLAttributes<HTMLScriptElement>>>;
  search: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.SearchHTMLAttributes<HTMLElement>>>;
  section: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  select: PropsWithChildren<PropsWithRef<HTMLSelectElement, PruveDOM.AccessibleSelectHTMLAttributes<HTMLSelectElement>>>;
  slot: PropsWithChildren<PropsWithRef<HTMLSlotElement, PruveDOM.SlotHTMLAttributes<HTMLSlotElement>>>;
  small: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  source: PropsWithChildren<PropsWithRef<HTMLSourceElement, PruveDOM.SourceHTMLAttributes<HTMLSourceElement>>>;
  span: PropsWithChildren<PropsWithRef<HTMLSpanElement, PruveDOM.HTMLAttributes<HTMLSpanElement>>>;
  strong: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  style: PropsWithChildren<PropsWithRef<HTMLStyleElement, PruveDOM.StyleHTMLAttributes<HTMLStyleElement>>>;
  sub: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  summary: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  sup: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.HTMLAttributes<HTMLElement>>>;
  table: PropsWithChildren<PropsWithRef<HTMLTableElement, PruveDOM.TableHTMLAttributes<HTMLTableElement>>>;
  tbody: PropsWithChildren<PropsWithRef<HTMLTableSectionElement, PruveDOM.HTMLAttributes<HTMLTableSectionElement>>>;
  td: PropsWithChildren<PropsWithRef<HTMLTableCellElement, PruveDOM.TdHTMLAttributes<HTMLTableCellElement>>>;
  template: PropsWithChildren<PropsWithRef<HTMLTemplateElement, PruveDOM.TemplateHTMLAttributes<HTMLTemplateElement>>>;
  textarea: PropsWithChildren<PropsWithRef<HTMLTextAreaElement, PruveDOM.TextareaHTMLAttributes<HTMLTextAreaElement>>>;
  tfoot: PropsWithChildren<PropsWithRef<HTMLTableSectionElement, PruveDOM.HTMLAttributes<HTMLTableSectionElement>>>;
  th: PropsWithChildren<PropsWithRef<HTMLTableCellElement, PruveDOM.ThHTMLAttributes<HTMLTableCellElement>>>;
  thead: PropsWithChildren<PropsWithRef<HTMLTableSectionElement, PruveDOM.HTMLAttributes<HTMLTableSectionElement>>>;
  time: PropsWithChildren<PropsWithRef<HTMLTimeElement, PruveDOM.TimeHTMLAttributes<HTMLTimeElement>>>;
  title: PropsWithChildren<PropsWithRef<HTMLTitleElement, PruveDOM.TitleHTMLAttributes<HTMLTitleElement>>>;
  tr: PropsWithChildren<PropsWithRef<HTMLTableRowElement, PruveDOM.HTMLAttributes<HTMLTableRowElement>>>;
  track: PropsWithChildren<PropsWithRef<HTMLTrackElement, PruveDOM.TrackHTMLAttributes<HTMLTrackElement>>>;
  u: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.UlHTMLAttributes<HTMLElement>>>;
  ul: PropsWithChildren<PropsWithRef<HTMLUListElement, PruveDOM.HTMLAttributes<HTMLUListElement>>>;
  video: PropsWithChildren<PropsWithRef<HTMLVideoElement, PruveDOM.VideoHTMLAttributes<HTMLVideoElement>>>;
  wbr: PropsWithChildren<PropsWithRef<HTMLElement, PruveDOM.WbrHTMLAttributes<HTMLElement>>>;
}

export type ComponentProps<T> = T extends PruveComponent<infer Props>
  ? Props
  : T extends keyof IntrinsicHTMLElements
  ? IntrinsicHTMLElements[T]
  : never

export const a = () => createVnodeProxy<ComponentProps<"a">>("a")
export const abbr = () => createVnodeProxy<ComponentProps<"abbr">>("abbr")
export const address = () => createVnodeProxy<ComponentProps<"address">>("address")
export const area = () => createVnodeProxy<ComponentProps<"area">>("area")
export const article = () => createVnodeProxy<ComponentProps<"article">>("article")
export const aside = () => createVnodeProxy<ComponentProps<"aside">>("aside")
export const audio = () => createVnodeProxy<ComponentProps<"audio">>("audio")
export const b = () => createVnodeProxy<ComponentProps<"b">>("b")
export const base = () => createVnodeProxy<ComponentProps<"base">>("base")
export const bdi = () => createVnodeProxy<ComponentProps<"bdi">>("bdi")
export const bdo = () => createVnodeProxy<ComponentProps<"bdo">>("bdo")
export const big = () => createVnodeProxy<ComponentProps<"big">>("big")
export const blockquote = () => createVnodeProxy<ComponentProps<"blockquote">>("blockquote")
export const body = () => createVnodeProxy<ComponentProps<"body">>("body")
export const br = () => createVnodeProxy<ComponentProps<"br">>("br")
export const button = () => createVnodeProxy<ComponentProps<"button">>("button")
export const canvas = () => createVnodeProxy<ComponentProps<"canvas">>("canvas")
export const caption = () => createVnodeProxy<ComponentProps<"caption">>("caption")
export const cite = () => createVnodeProxy<ComponentProps<"cite">>("cite")
export const code = () => createVnodeProxy<ComponentProps<"code">>("code")
export const col = () => createVnodeProxy<ComponentProps<"col">>("col")
export const colgroup = () => createVnodeProxy<ComponentProps<"colgroup">>("colgroup")
export const data = () => createVnodeProxy<ComponentProps<"data">>("data")
export const datalist = () => createVnodeProxy<ComponentProps<"datalist">>("datalist")
export const dd = () => createVnodeProxy<ComponentProps<"dd">>("dd")
export const del = () => createVnodeProxy<ComponentProps<"del">>("del")
export const details = () => createVnodeProxy<ComponentProps<"details">>("details")
export const dfn = () => createVnodeProxy<ComponentProps<"dfn">>("dfn")
export const dialog = () => createVnodeProxy<ComponentProps<"dialog">>("dialog")
export const div = () => createVnodeProxy<ComponentProps<"div">>("div")
export const dl = () => createVnodeProxy<ComponentProps<"dl">>("dl")
export const dt = () => createVnodeProxy<ComponentProps<"dt">>("dt")
export const em = () => createVnodeProxy<ComponentProps<"em">>("em")
export const embed = () => createVnodeProxy<ComponentProps<"embed">>("embed")
export const fieldset = () => createVnodeProxy<ComponentProps<"fieldset">>("fieldset")
export const figcaption = () => createVnodeProxy<ComponentProps<"figcaption">>("figcaption")
export const figure = () => createVnodeProxy<ComponentProps<"figure">>("figure")
export const footer = () => createVnodeProxy<ComponentProps<"footer">>("footer")
export const form = () => createVnodeProxy<ComponentProps<"form">>("form")
export const h1 = () => createVnodeProxy<ComponentProps<"h1">>("h1")
export const h2 = () => createVnodeProxy<ComponentProps<"h2">>("h2")
export const h3 = () => createVnodeProxy<ComponentProps<"h3">>("h3")
export const h4 = () => createVnodeProxy<ComponentProps<"h4">>("h4")
export const h5 = () => createVnodeProxy<ComponentProps<"h5">>("h5")
export const h6 = () => createVnodeProxy<ComponentProps<"h6">>("h6")
export const head = () => createVnodeProxy<ComponentProps<"head">>("head")
export const header = () => createVnodeProxy<ComponentProps<"header">>("header")
export const hgroup = () => createVnodeProxy<ComponentProps<"hgroup">>("hgroup")
export const hr = () => createVnodeProxy<ComponentProps<"hr">>("hr")
export const html = () => createVnodeProxy<ComponentProps<"html">>("html")
export const i = () => createVnodeProxy<ComponentProps<"i">>("i")
export const iframe = () => createVnodeProxy<ComponentProps<"iframe">>("iframe")
export const img = () => createVnodeProxy<ComponentProps<"img">>("img")
export const input = () => createVnodeProxy<ComponentProps<"input">>("input")
export const ins = () => createVnodeProxy<ComponentProps<"ins">>("ins")
export const kbd = () => createVnodeProxy<ComponentProps<"kbd">>("kbd")
export const keygen = () => createVnodeProxy<ComponentProps<"keygen">>("keygen")
export const label = () => createVnodeProxy<ComponentProps<"label">>("label")
export const legend = () => createVnodeProxy<ComponentProps<"legend">>("legend")
export const li = () => createVnodeProxy<ComponentProps<"li">>("li")
export const link = () => createVnodeProxy<ComponentProps<"link">>("link")
export const main = () => createVnodeProxy<ComponentProps<"main">>("main")
export const map = () => createVnodeProxy<ComponentProps<"map">>("map")
export const mark = () => createVnodeProxy<ComponentProps<"mark">>("mark")
export const marquee = () => createVnodeProxy<ComponentProps<"marquee">>("marquee")
export const menu = () => createVnodeProxy<ComponentProps<"menu">>("menu")
export const menuitem = () => createVnodeProxy<ComponentProps<"menuitem">>("menuitem")
export const meta = () => createVnodeProxy<ComponentProps<"meta">>("meta")
export const meter = () => createVnodeProxy<ComponentProps<"meter">>("meter")
export const nav = () => createVnodeProxy<ComponentProps<"nav">>("nav")
export const noscript = () => createVnodeProxy<ComponentProps<"noscript">>("noscript")
export const object = () => createVnodeProxy<ComponentProps<"object">>("object")
export const ol = () => createVnodeProxy<ComponentProps<"ol">>("ol")
export const optgroup = () => createVnodeProxy<ComponentProps<"optgroup">>("optgroup")
export const option = () => createVnodeProxy<ComponentProps<"option">>("option")
export const output = () => createVnodeProxy<ComponentProps<"output">>("output")
export const p = () => createVnodeProxy<ComponentProps<"p">>("p")
export const param = () => createVnodeProxy<ComponentProps<"param">>("param")
export const picture = () => createVnodeProxy<ComponentProps<"picture">>("picture")
export const pre = () => createVnodeProxy<ComponentProps<"pre">>("pre")
export const progress = () => createVnodeProxy<ComponentProps<"progress">>("progress")
export const q = () => createVnodeProxy<ComponentProps<"q">>("q")
export const rp = () => createVnodeProxy<ComponentProps<"rp">>("rp")
export const rt = () => createVnodeProxy<ComponentProps<"rt">>("rt")
export const ruby = () => createVnodeProxy<ComponentProps<"ruby">>("ruby")
export const s = () => createVnodeProxy<ComponentProps<"s">>("s")
export const samp = () => createVnodeProxy<ComponentProps<"samp">>("samp")
export const script = () => createVnodeProxy<ComponentProps<"script">>("script")
export const search = () => createVnodeProxy<ComponentProps<"search">>("search")
export const section = () => createVnodeProxy<ComponentProps<"section">>("section")
export const select = () => createVnodeProxy<ComponentProps<"select">>("select")
export const slot = () => createVnodeProxy<ComponentProps<"slot">>("slot")
export const small = () => createVnodeProxy<ComponentProps<"small">>("small")
export const source = () => createVnodeProxy<ComponentProps<"source">>("source")
export const span = () => createVnodeProxy<ComponentProps<"span">>("span")
export const strong = () => createVnodeProxy<ComponentProps<"strong">>("strong")
export const style = () => createVnodeProxy<ComponentProps<"style">>("style")
export const sub = () => createVnodeProxy<ComponentProps<"sub">>("sub")
export const summary = () => createVnodeProxy<ComponentProps<"summary">>("summary")
export const sup = () => createVnodeProxy<ComponentProps<"sup">>("sup")
export const table = () => createVnodeProxy<ComponentProps<"table">>("table")
export const tbody = () => createVnodeProxy<ComponentProps<"tbody">>("tbody")
export const td = () => createVnodeProxy<ComponentProps<"td">>("td")
export const template = () => createVnodeProxy<ComponentProps<"template">>("template")
export const textarea = () => createVnodeProxy<ComponentProps<"textarea">>("textarea")
export const tfoot = () => createVnodeProxy<ComponentProps<"tfoot">>("tfoot")
export const th = () => createVnodeProxy<ComponentProps<"th">>("th")
export const thead = () => createVnodeProxy<ComponentProps<"thead">>("thead")
export const time = () => createVnodeProxy<ComponentProps<"time">>("time")
export const title = () => createVnodeProxy<ComponentProps<"title">>("title")
export const tr = () => createVnodeProxy<ComponentProps<"tr">>("tr")
export const track = () => createVnodeProxy<ComponentProps<"track">>("track")
export const u = () => createVnodeProxy<ComponentProps<"u">>("u")
export const ul = () => createVnodeProxy<ComponentProps<"ul">>("ul")
export const video = () => createVnodeProxy<ComponentProps<"video">>("video")
export const wbr = () => createVnodeProxy<ComponentProps<"wbr">>("wbr")

export function Tag<Props = ComponentProps<"div">>(tagName: string) {
  return createVnodeProxy<Props>(tagName)
}

export function component<Props = {}>(setup: ComponentSetup<Props>) {
  return (() => createVnodeProxy<Props>(setup)) as PruveComponent<Props>;
}

export const Fragment = () => createVnodeProxy<PropsWithChildren>("@@fragment")

