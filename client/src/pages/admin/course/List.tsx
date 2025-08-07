"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Eye, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import {
  getDynamicFormDataAPI,
} from "@/API/services/studentService";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectInput } from "@/layouts/components/Select";
import Paginations from "@/layouts/components/Paginations";
import { useNavigate } from "react-router-dom";
import reduceString from "@/helpers/reduceString";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export type Course = {
  _id: string;
  formType: string;
  fieldsData: Array<{
    name: string;
    value: any;
  }>;
  createdAt: string;
  updatedAt: string;
};

export default function List() {
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [data, setData] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [order, setOrder] = React.useState<"asc" | "desc">("asc");

  type Pagination = {
    limit: number;
    totalCourses: number;
    totalPages: number;
    currentPage: number;
    count: number;
  };

  const [pagination, setPagination] = React.useState<Pagination>({
    limit: 0,
    totalPages: 0,
    currentPage: 0,
    totalCourses: 0,
    count: 0,
  });

  // Helper function to get field value by name
  const getFieldValue = (course: Course, fieldName: string) => {
    const field = course.fieldsData.find(f => f.name === fieldName);
    return field ? field.value : '';
  };

  React.useEffect(() => {
    setLoading(true);

    getDynamicFormDataAPI('course')
      .then((res: any) => {
        const courses = res.data.data || [];
        
        // Filter courses based on search
        let filteredCourses = courses;
        if (search) {
          filteredCourses = courses.filter((course: Course) => {
            const courseName = getFieldValue(course, 'courseName').toLowerCase();
            const courseCode = getFieldValue(course, 'courseCode').toLowerCase();
            const description = getFieldValue(course, 'description').toLowerCase();
            return courseName.includes(search.toLowerCase()) || 
                   courseCode.includes(search.toLowerCase()) ||
                   description.includes(search.toLowerCase());
          });
        }

        // Sort courses
        filteredCourses.sort((a: Course, b: Course) => {
          let aValue, bValue;
          
          if (sortBy === 'createdAt') {
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
          } else {
            aValue = getFieldValue(a, sortBy);
            bValue = getFieldValue(b, sortBy);
          }
          
          if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

        setData(paginatedCourses);
        setPagination({
          limit,
          totalPages: Math.ceil(filteredCourses.length / limit),
          currentPage: page,
          totalCourses: filteredCourses.length,
          count: paginatedCourses.length,
        });
        setLoading(false);
      })
      .catch((err: any) => {
        setData([]);
        setLoading(false);
        console.error(err);
        toast.error("Failed to fetch courses");
      });
  }, [page, limit, search, sortBy, order]);

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: "sno",
      header: "S.No",
      cell: ({ row }) => <div>{(page - 1) * limit + row.index + 1}.</div>,
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const imageValue = getFieldValue(row.original, 'image');
        const imageSrc = imageValue ? (imageValue.startsWith('/') ? imageValue : `/assets/${imageValue}`) : '/placeholder.jpg';
        return (
          <img
            src={imageSrc}
            className="w-[35px] h-[35px] rounded-full object-cover"
            alt={getFieldValue(row.original, 'courseName')}
            onError={(e) => {
              e.currentTarget.src = '/placeholder.jpg';
            }}
          />
        );
      },
    },
    {
      accessorKey: "courseName",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            const newOrder = order === "asc" ? "desc" : "asc";
            setOrder(newOrder);
            setSortBy("courseName");
          }}
        >
          Course Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {getFieldValue(row.original, 'courseName') || '-'}
        </div>
      ),
    },
    {
      accessorKey: "courseCode",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            const newOrder = order === "asc" ? "desc" : "asc";
            setOrder(newOrder);
            setSortBy("courseCode");
          }}
        >
          Course Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="uppercase font-mono">
          {getFieldValue(row.original, 'courseCode') || '-'}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const duration = getFieldValue(row.original, 'duration');
        return (
          <div>{duration ? `${duration} months` : '-'}</div>
        );
      },
    },
    {
      accessorKey: "fees",
      header: "Fees",
      cell: ({ row }) => {
        const fees = getFieldValue(row.original, 'fees');
        return (
          <div className="font-medium">
            {fees ? `₹${fees}` : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = getFieldValue(row.original, 'description');
        return (
          <div className="lowercase">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>{description ? reduceString(description, 20) : '-'}</div>
                </TooltipTrigger>
                {description && description.length > 20 && (
                  <TooltipContent>
                    <p>{description}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            const newOrder = order === "asc" ? "desc" : "asc";
            setOrder(newOrder);
            setSortBy("createdAt");
          }}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end ">
          <button
            onClick={() => {
              navigate(`/admin/courses/${row.original._id}`);
            }}
            className="rounded-full p-1 hover:bg-gray-200"
            title="View course"
          >
            <Eye size={15} />
          </button>
          <button 
            className="rounded-full p-1 hover:bg-gray-200"
            title="Edit course"
          >
            <PencilLine size={15} />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageSize: limit,
        pageIndex: page - 1,
      },
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
  });

  // console.log(table.getRowModel().rows[0]);
  return (
    <div className="w-full h-full flex justify-center items-start">
      <Card className="w-full p-4 max-w-7xl">
        <div className="w-full">
          <CardHeader className="flex items-center py-4 justify-between">
            <Input
              placeholder="Filter..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-sm"
            />
            <div className="flex gap-1 h-full">
              <SelectInput
                width={"100px"}
                placeholder="Limit"
                title="Limit"
                value={limit}
                onChange={(val) => {
                  setLimit(val);
                  setPage(1);
                }}
                values={[
                  { name: "10", value: 10 },
                  { name: "20", value: 20 },
                  { name: "50", value: 50 },
                  { name: "100", value: 100 },
                ]}
              />
              <Button
                variant="outline"
                onClick={() => navigate("/admin/courses/add")}
              >
                Add Course
              </Button>
            </div>
          </CardHeader>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-[37px] w-full mb-2" />
                      ))}
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
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

          <CardFooter className="mt-3 flex justify-between items-center">
            <Paginations
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              limit={pagination.limit}
              count={pagination.count}
              totalCategories={pagination.totalCourses}
              onPrevious={() => setPage((prev) => Math.max(prev - 1, 1))}
              onNext={() =>
                setPage((prev) => Math.min(prev + 1, pagination.totalPages))
              }
              onPageClick={(page) => setPage(page)}
            />
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}
