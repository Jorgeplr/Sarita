import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface DataTableProps<T> {
  data: T[];
  columns: Array<ColumnDef<T>>;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (nextPage: number) => void;
}

export default function DataTable<T>({
  data,
  columns,
  pageIndex,
  pageSize,
  pageCount,
  onPageChange,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <table className="w-full text-sm">
        <thead className="border-b border-white/10 text-left">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-mist/70">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-mist/60" colSpan={columns.length}>
                Sin resultados.
              </td>
            </tr>
          )}
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-white/5 last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-mist/90">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-4 py-3 text-xs text-mist/60">
        <span>
          Pagina {pageIndex + 1} de {pageCount}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="rounded border border-white/10 px-2 py-1 disabled:opacity-40"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            Anterior
          </button>
          <button
            className="rounded border border-white/10 px-2 py-1 disabled:opacity-40"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex + 1 >= pageCount}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
