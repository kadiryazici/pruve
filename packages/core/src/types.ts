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
  key: (value: VirtualNode["key"]) => VirtualNodeBuilderProxy<Props, DefinedProps>
  with: <T extends Partial<Props>>(props: T) => VirtualNodeBuilderProxy<Props, DefinedProps | (string & keyof T)>
  make: () => VirtualNode
} & {
  [Key in keyof Required<Props>]: (value: Props[Key]) => VirtualNodeBuilderProxy<Props, DefinedProps | (Key & string)>
}

export type VirtualNodeProxy<Props = {}, DefinedProps extends string = never> = ProxyMethods<Props, DefinedProps>

export type PropsWithChildren<Props = {}> = Props & {
  children?: PruveChildren
}

export type PruveNode = VirtualNodeProxy<{}> | VirtualNode | TextNode | boolean | undefined | number | null
export type PruveChildren = PruveNode | PruveChildren[]

export interface PruveComponent<Props = {}> {
  (): VirtualNodeBuilderProxy<Props, never>
  <P>(): VirtualNodeBuilderProxy<P, never>
}

export interface ComponentSetup<Props = {}> {
  (props: Props): () => PruveNode
  (props: Props): () => PruveNode
}

export type VirtualNode<Props = {}> = {
  type: string | ComponentSetup<Props>
  key: string | number | undefined
  props: Record<PropertyKey, any>
}

export type TextNode = string