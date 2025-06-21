import React, { useState } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import DataStreamLoader from '../ui-components/AdminPage/DashboardLoader';

const DataTable = ({ columns, data, isLoading, error, icon: Icon, title, subtitle }) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <DataStreamLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-2xl border border-border shadow-lg">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-foreground">Failed to load data</h3>
        <p className="text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {Icon && <div className="p-3 bg-accent/10 text-accent rounded-xl"><Icon className="h-6 w-6" /></div>}
            <div>
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-background">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} scope="col" className="px-6 py-3 font-semibold text-muted-foreground uppercase tracking-wider">
                    {header.isPlaceholder ? null : header.column.columnDef.header}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-accent/5 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-foreground">
                    {cell.column.columnDef.cell(cell.getContext())}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="p-4 flex justify-between items-center border-t border-border bg-background">
          <span className="text-sm text-muted-foreground">
            Page <span className="font-semibold text-foreground">{table.getState().pagination.pageIndex + 1}</span> of <span className="font-semibold text-foreground">{table.getPageCount()}</span>
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 rounded-md hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="h-5 w-5 text-accent" />
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 rounded-md hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="h-5 w-5 text-accent" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;