import type { VNode } from "preact"

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

export type MissingKeys<Props, DefinedProps extends string> = Exclude<RequiredKeys<Props>, DefinedProps>

export type VirtualNodeBuilderProxy<Props, NewDefined extends string> =
  MissingKeys<Props, NewDefined> extends never
  ? VirtualNodeProxy<Props, NewDefined>
  : {
    readonly __missing_props__: MissingKeys<Props, NewDefined> & {}
  } & Omit<VirtualNodeProxy<Props, NewDefined>, "make">

export type ProxyMethods<Props, DefinedProps extends string> = {
  key: (value: any) => VirtualNodeBuilderProxy<Props, DefinedProps>
  with: <T extends Partial<Props>>(props: T) => VirtualNodeBuilderProxy<Props, DefinedProps | (string & keyof T)>
  make: () => VNode<Props>
} & {
  [Key in keyof Required<Props>]: (value: Props[Key]) => VirtualNodeBuilderProxy<Props, DefinedProps | (Key & string)>
}

export type VirtualNodeProxy<Props = {}, DefinedProps extends string = never> = ProxyMethods<Props, DefinedProps>

export type CompletedVirtualNodeProxy<Props = {}> = {
  key: (value: any) => CompletedVirtualNodeProxy<Props>
  with: <T extends Partial<Props>>(props: T) => CompletedVirtualNodeProxy<Props>
  make: () => VNode<Props>
} & {
  [Key in keyof Required<Props>]: (value: Props[Key]) => CompletedVirtualNodeProxy<Props>
}

export interface RenderableProxy {
  make: () => VNode<any>
}

export type PropsWithChildren<Props = {}> = Props & {
  children?: PruveChildren
}

export type PruveNode = RenderableProxy | VNode | TextNode | boolean | undefined | number | null
export type PruveChildren = PruveNode | PruveChildren[]

export interface PruveComponent<Props = {}> {
  (): VirtualNodeBuilderProxy<Props, never>
  __isPruveComponent?: true
}

export interface ComponentSetup<Props = {}> {
  (props: Props): () => PruveNode
}

export type TextNode = string
