"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTweetStore } from "@/lib/store";
import { cn, randomName } from "@/lib/utils";
import { useCallback, useState } from "react";
import { DataTablePagination } from "./pagination";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import type { LocalTweet } from "@/lib/types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<_TData, TValue>({
  columns,
  data,
}: DataTableProps<LocalTweet, TValue>) {
  const setCurrentTweetId = useTweetStore((state) => state.setCurrentTweetId);
  const currentTweetId = useTweetStore((state) => state.currentTweetId);
  const createTweet = useTweetStore((state) => state.createTweet);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  const newTweet = useCallback(
    function newTweet() {
      const id = randomName();
      const tweet = {
        id: id,
        createdAt: new Date().getTime().toString(),
        content:
          '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
        text: "",
      };
      console.log("new:", tweet);
      createTweet(tweet);
      setCurrentTweetId(id);
    },
    [createTweet, setCurrentTweetId],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3 py-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("text")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("text")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <Button onClick={newTweet} variant="default">
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    setCurrentTweetId(row.original.id);
                  }}
                  className={cn(
                    "cursor-pointer",
                    row.original.id === currentTweetId && "bg-secondary",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
