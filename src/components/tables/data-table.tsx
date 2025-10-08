"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarIcon,
} from "lucide-react";
import { stageItemColors, statusItemColors } from "@/lib/order-colors";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Extract unique materials from data
  const allMaterials = Array.from(
    new Set(
      data.flatMap((item) => {
        const record = item as Record<string, unknown>;
        return (record.materials as string[]) || [];
      })
    )
  ).sort();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  // Get current filter values
  const stageFilter =
    (table.getColumn("currentStage")?.getFilterValue() as string) ?? "all";
  const priorityFilter =
    (table.getColumn("priority")?.getFilterValue() as string) ?? "all";
  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string) ?? "all";

  // Check if any filters are active
  const hasActiveFilters =
    selectedMaterials.length > 0 ||
    stageFilter !== "all" ||
    priorityFilter !== "all" ||
    statusFilter !== "all" ||
    dateRange !== undefined;

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedMaterials([]);
    setDateRange(undefined);
    table.getColumn("materials")?.setFilterValue(undefined);
    table.getColumn("currentStage")?.setFilterValue(undefined);
    table.getColumn("priority")?.setFilterValue(undefined);
    table.getColumn("status")?.setFilterValue(undefined);
    table.getColumn("deliveryDate")?.setFilterValue(undefined);
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    table.getColumn("deliveryDate")?.setFilterValue(range);
  };

  // Handle material selection (multiple)
  const handleMaterialToggle = (material: string) => {
    const newSelectedMaterials = selectedMaterials.includes(material)
      ? selectedMaterials.filter((m) => m !== material)
      : [...selectedMaterials, material];

    setSelectedMaterials(newSelectedMaterials);
    table
      .getColumn("materials")
      ?.setFilterValue(
        newSelectedMaterials.length > 0 ? newSelectedMaterials : undefined
      );
  };

  // Custom filter functions
  const handleStageFilterChange = (value: string) => {
    table
      .getColumn("currentStage")
      ?.setFilterValue(value === "all" ? undefined : value);
  };

  const handlePriorityFilterChange = (value: string) => {
    table
      .getColumn("priority")
      ?.setFilterValue(value === "all" ? undefined : value);
  };

  const handleStatusFilterChange = (value: string) => {
    table
      .getColumn("status")
      ?.setFilterValue(value === "all" ? undefined : value);
  };

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <div className="space-y-4 py-4">
        {/* Search Bar */}
        {searchKey && (
          <div className="flex items-center">
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
        )}

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Filters:
          </span>

          {/* Material Filter (Multi-select) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 border-dashed">
                <ChevronDown className="mr-2 h-4 w-4" />
                Materials
                {selectedMaterials.length > 0 && (
                  <>
                    <div className="mx-2 h-4 w-[1px] bg-border" />
                    <span className="rounded-sm bg-primary px-1 font-mono text-xs text-primary-foreground">
                      {selectedMaterials.length}
                    </span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>
                Select Materials
                {selectedMaterials.length > 1 && (
                  <span className="block text-xs font-normal text-muted-foreground">
                    Must have all selected
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allMaterials.length > 0 ? (
                allMaterials.map((material) => (
                  <DropdownMenuCheckboxItem
                    key={material}
                    checked={selectedMaterials.includes(material)}
                    onCheckedChange={() => handleMaterialToggle(material)}
                  >
                    {material}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No materials available
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Stage Filter */}
          <Select value={stageFilter} onValueChange={handleStageFilterChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="PENDING" className={stageItemColors.PENDING}>
                PENDING
              </SelectItem>
              <SelectItem value="METAL" className={stageItemColors.METAL}>
                METAL
              </SelectItem>
              <SelectItem value="VENEER" className={stageItemColors.VENEER}>
                VENEER
              </SelectItem>
              <SelectItem value="ASSY" className={stageItemColors.ASSY}>
                ASSY
              </SelectItem>
              <SelectItem
                value="FINISHING"
                className={stageItemColors.FINISHING}
              >
                FINISHING
              </SelectItem>
              <SelectItem value="PACKING" className={stageItemColors.PACKING}>
                PACKING
              </SelectItem>
              <SelectItem
                value="COMPLETED"
                className={stageItemColors.COMPLETED}
              >
                COMPLETED
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={priorityFilter}
            onValueChange={handlePriorityFilterChange}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="URGENT" className="text-red-600 font-semibold">
                URGENT
              </SelectItem>
              <SelectItem value="STANDARD">STANDARD</SelectItem>
              <SelectItem value="LOW" className="text-blue-600 font-semibold">
                LOW
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING" className={statusItemColors.PENDING}>
                PENDING
              </SelectItem>
              <SelectItem
                value="IN_PROGRESS"
                className={statusItemColors.IN_PROGRESS}
              >
                IN PROGRESS
              </SelectItem>
              <SelectItem
                value="COMPLETED"
                className={statusItemColors.COMPLETED}
              >
                COMPLETED
              </SelectItem>
              <SelectItem value="ON_HOLD" className={statusItemColors.ON_HOLD}>
                ON HOLD
              </SelectItem>
              <SelectItem
                value="CANCELLED"
                className={statusItemColors.CANCELLED}
              >
                CANCELLED
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 w-[240px] justify-start text-left font-normal ${
                  !dateRange && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick delivery date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="h-9 px-3"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active filters:</span>
            {selectedMaterials.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800">
                Materials: {selectedMaterials.join(", ")}
              </span>
            )}
            {stageFilter !== "all" && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800">
                Stage: {stageFilter}
              </span>
            )}
            {priorityFilter !== "all" && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800">
                Priority: {priorityFilter}
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800">
                Status: {statusFilter}
              </span>
            )}
            {dateRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-100 text-indigo-800">
                Date: {dateRange.from && format(dateRange.from, "MMM dd")}
                {dateRange.to && ` - ${format(dateRange.to, "MMM dd, yyyy")}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="w-full rounded-md border overflow-hidden">
        <div
          style={{
            minHeight: `${table.getState().pagination.pageSize * 67 + 48}px`,
            maxHeight: `${table.getState().pagination.pageSize * 67 + 48}px`,
          }}
        >
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
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
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
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
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {hasActiveFilters ? (
              <>
                Showing {table.getFilteredRowModel().rows.length} of{" "}
                {data.length} row(s)
              </>
            ) : (
              <>{table.getFilteredRowModel().rows.length} total row(s)</>
            )}
          </div>

          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
