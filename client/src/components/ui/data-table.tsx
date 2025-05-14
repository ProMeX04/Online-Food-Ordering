import React from "react"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, SortingState, getSortedRowModel } from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	isLoading?: boolean
	searchColumn?: string
	searchPlaceholder?: string
}

export function DataTable<TData, TValue>({ columns, data, isLoading = false, searchColumn, searchPlaceholder = "Tìm kiếm..." }: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [searchValue, setSearchValue] = useState("")
	const [pageSize, setPageSize] = useState(10)

	// Lọc dữ liệu dựa trên giá trị tìm kiếm
	const filteredData = React.useMemo(() => {
		if (!searchValue || !searchColumn) return data

		return data.filter((item) => {
			// @ts-expect-error: Dynamic access to properties
			const value = item[searchColumn]
			if (typeof value === "string") {
				return value.toLowerCase().includes(searchValue.toLowerCase())
			}
			if (typeof value === "number") {
				return value.toString().includes(searchValue)
			}
			return false
		})
	}, [data, searchValue, searchColumn])

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
			pagination: {
				pageIndex: 0,
				pageSize,
			},
		},
	})

	return (
		<div className="space-y-4">
			{searchColumn && (
				<div className="flex items-center">
					<Input placeholder={searchPlaceholder} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="max-w-sm" />
				</div>
			)}

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									<div className="flex justify-center">
										<Loader2 className="h-6 w-6 animate-spin text-primary" />
									</div>
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									Không có dữ liệu
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<p className="text-sm text-muted-foreground">Hiển thị</p>
					<Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[5, 10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-sm text-muted-foreground">hàng mỗi trang</p>
				</div>

				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
						<ChevronLeftIcon className="h-4 w-4" />
					</Button>
					<p className="text-sm text-muted-foreground">
						Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
					</p>
					<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
						<ChevronRightIcon className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	)
}
