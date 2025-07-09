import { TableMeta as ReactTableMeta } from "@tanstack/react-table"

declare module '@tanstack/react-table' {
  interface TableMeta<TData> extends ReactTableMeta<TData> {
    onDataChange?: () => void
  }
}
