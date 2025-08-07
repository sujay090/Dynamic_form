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
import { ArrowUpDown, PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectInput } from "@/layouts/components/Select";
import Paginations from "@/layouts/components/Paginations";
import { useNavigate } from "react-router-dom";

import { getDynamicFormDataAPI, updateDynamicFormDataAPI, deleteDynamicFormDataAPI } from "@/API/services/studentService";
import { getAllCourseCategoryAPI } from "@/API/services/courseService";

export type DynamicCourse = {
  _id: string;
  formType: string;
  fieldsData: Array<{
    name: string;
    value: any; // Changed from string to any to handle nested structure
  }>;
  createdAt: string;
  updatedAt: string;
};

export default function DynamicCourseList() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [data, setData] = React.useState<DynamicCourse[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [reload, setReload] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [order, setOrder] = React.useState<"asc" | "desc">("asc");
  const [editData, setEditData] = React.useState<DynamicCourse | null>(null);
  const [editFormData, setEditFormData] = React.useState<Record<string, string>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [courseToDelete, setCourseToDelete] = React.useState<DynamicCourse | null>(null);
  const [categories, setCategories] = React.useState<{id: string, name: string, value: string, label: string}[]>([]);

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

  React.useEffect(() => {
    setLoading(true);
    
    getDynamicFormDataAPI("course")
      .then((res) => {
        console.log("Course data:", res.data);
        console.log("First course structure:", res.data.data?.[0]);
        setData(res.data.data || []);
        setPagination(res.data.pagination || {
          limit: 0,
          totalPages: 0,
          currentPage: 0,
          totalCourses: 0,
          count: 0,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error:", err);
        setLoading(false);
        toast.error("Failed to fetch courses");
      });
  }, [page, limit, search, sortBy, order, reload]);

  // Load course categories
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("Loading course categories...");
        const response = await getAllCourseCategoryAPI();
        console.log("Categories API response:", response);
        console.log("Categories API response.data:", response.data);
        
        // Handle different possible API response structures
        let categoryData = null;
        if (response.data?.data) {
          categoryData = response.data.data;
        } else if (Array.isArray(response.data)) {
          categoryData = response.data;
        } else {
          console.warn("Unexpected API response structure:", response.data);
          setCategories([]);
          return;
        }
        
        if (Array.isArray(categoryData)) {
          // Map the category data to our expected format
          const categoryMap = categoryData.map((cat: any) => ({
            id: cat.value || cat._id?.toString() || cat._id, // Handle different ID formats
            name: cat.label || cat.name, // Handle different name formats
            value: cat.value || cat._id?.toString() || cat._id,
            label: cat.label || cat.name
          }));
          
          console.log("Mapped categories:", categoryMap);
          setCategories(categoryMap);
        } else {
          console.warn("Category data is not an array:", categoryData);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const getFieldValue = (fieldsData: Array<{name: string; value: any}>, fieldName: string) => {
    // Check if fieldsData has the nested structure
    const fieldsDataField = fieldsData.find(f => f.name === 'fieldsData');
    
    if (fieldsDataField && Array.isArray(fieldsDataField.value)) {
      // If it's the nested structure, look in the value array
      const field = fieldsDataField.value.find((f: any) => f.name === fieldName);
      return field ? field.value : "";
    } else {
      // If it's the direct structure, look directly
      const field = fieldsData.find(f => f.name === fieldName);
      return field ? field.value : "";
    }
  };

  const handleEdit = (course: DynamicCourse) => {
    setEditData(course);
    
    // Convert fieldsData to form object - handle nested structure
    const formData: Record<string, string> = {};
    
    const fieldsDataField = course.fieldsData.find(f => f.name === 'fieldsData');
    
    if (fieldsDataField && Array.isArray(fieldsDataField.value)) {
      // Handle nested structure
      fieldsDataField.value.forEach((field: any) => {
        formData[field.name] = field.value;
      });
    } else {
      // Handle direct structure
      course.fieldsData.forEach(field => {
        formData[field.name] = field.value;
      });
    }
    
    setEditFormData(formData);
    setIsOpen(true);
  };

  const handleDelete = (course: DynamicCourse) => {
    console.log('🗑️ Delete button clicked for course:', course._id);
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      await deleteDynamicFormDataAPI(courseToDelete._id);
      toast.success("Course deleted successfully");
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
      setReload(!reload);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete course");
    }
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    try {
      // Convert form data back to fieldsData array format
      const fieldsData = Object.entries(editFormData).map(([key, value]) => ({
        name: key,
        value: value
      }));

      await updateDynamicFormDataAPI(editData._id, {
        formType: "course",
        fieldsData
      });

      toast.success("Course updated successfully");
      setIsOpen(false);
      setEditData(null);
      setEditFormData({});
      setReload(!reload);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update course");
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const columns: ColumnDef<DynamicCourse>[] = [
    {
      accessorKey: "S.No",
      header: "S.No",
      cell: ({ row }) => <div>{(page - 1) * limit + row.index + 1}.</div>,
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
      cell: ({ row }) => {
        const courseName = getFieldValue(row.original.fieldsData, "courseName");
        console.log("Course name for row:", courseName, "Full data:", row.original.fieldsData);
        return <div className="lowercase">{courseName}</div>;
      },
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
      cell: ({ row }) => {
        const courseCode = getFieldValue(row.original.fieldsData, "courseCode");
        return <div className="lowercase">{courseCode}</div>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = getFieldValue(row.original.fieldsData, "description");
        return (
          <div className="max-w-[200px] truncate" title={description}>
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: "duration",
      header: "Duration (Months)",
      cell: ({ row }) => {
        const duration = getFieldValue(row.original.fieldsData, "duration");
        return <div>{duration}</div>;
      },
    },
    {
      accessorKey: "fees",
      header: "Fees",
      cell: ({ row }) => {
        const fees = getFieldValue(row.original.fieldsData, "fees");
        return <div>₹{fees}</div>;
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const categoryId = getFieldValue(row.original.fieldsData, "category");
        console.log("Category ID for row:", categoryId, "Available categories:", categories);
        
        // Find the category name from the categories array
        const categoryObj = categories.find(cat => cat.id === categoryId || cat.value === categoryId);
        const displayName = categoryObj ? categoryObj.name : categoryId || "Unknown";
        
        return <div className="capitalize">{displayName}</div>;
      },
    },
    {
      accessorKey: "isActive",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const isActive = getFieldValue(row.original.fieldsData, "isActive");
        console.log("IsActive value for row:", isActive, "Type:", typeof isActive, "Full data:", row.original.fieldsData);
        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isActive === "true" || isActive === true
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isActive === "true" || isActive === true ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            className="h-8 w-8"
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(row.original);
            }}
            className="h-8 w-8 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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

  return (
    <div className="w-full flex justify-center items-start">
      <Card className="card-container w-full p-4 max-w-6xl mx-auto gap-y-3">
        <CardHeader className="font-bold h-[36px]">
          <div className="w-full h-full flex justify-between items-center">
            <h2>Course Management</h2>
          </div>
        </CardHeader>

        <div className="flex items-center py-4 justify-between">
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
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
              onClick={() => navigate("/admin/courses/add")}
              className="text-sm font-semibold"
            >
              Add Course
            </Button>
          </div>
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
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={columns.length} className="h-24">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
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

        <CardFooter className="w-full flex justify-center px-3">
          <Paginations
            currentPage={page}
            totalPages={pagination.totalPages}
            limit={limit}
            count={pagination.count}
            totalCategories={pagination.totalCourses}
            onPrevious={() => setPage(Math.max(1, page - 1))}
            onNext={() => setPage(Math.min(pagination.totalPages, page + 1))}
            onPageClick={(newPage) => setPage(newPage)}
          />
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course information below.
            </DialogDescription>
          </DialogHeader>
          
          {editData && (
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {/* Course Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="courseName" className="text-right">
                  Course Name
                </Label>
                <Input
                  id="courseName"
                  value={editFormData.courseName || ""}
                  onChange={(e) => handleInputChange("courseName", e.target.value)}
                  className="col-span-3"
                />
              </div>

              {/* Course Code */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="courseCode" className="text-right">
                  Course Code
                </Label>
                <Input
                  id="courseCode"
                  value={editFormData.courseCode || ""}
                  onChange={(e) => handleInputChange("courseCode", e.target.value)}
                  className="col-span-3"
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editFormData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="col-span-3"
                  rows={3}
                />
              </div>

              {/* Duration */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration (Months)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={editFormData.duration || ""}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  className="col-span-3"
                />
              </div>

              {/* Fees */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fees" className="text-right">
                  Fees
                </Label>
                <Input
                  id="fees"
                  type="number"
                  value={editFormData.fees || ""}
                  onChange={(e) => handleInputChange("fees", e.target.value)}
                  className="col-span-3"
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <SelectInput
                  width="100%"
                  placeholder="Select category"
                  title="Category"
                  values={categories.map(cat => ({
                    name: cat.label,
                    value: cat.value
                  }))}
                  value={editFormData.category || ""}
                  onChange={(value) => handleInputChange("category", value)}
                />
              </div>

              {/* Active Status */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Status
                </Label>
                <SelectInput
                  width="100%"
                  placeholder="Select status"
                  title="Status"
                  values={[
                    { name: "Active", value: "true" },
                    { name: "Inactive", value: "false" }
                  ]}
                  value={editFormData.isActive || ""}
                  onChange={(value) => handleInputChange("isActive", value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-red-600">
              Delete Course
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              This action cannot be undone. The course will be permanently deleted from the system.
            </DialogDescription>
          </DialogHeader>
          
          {courseToDelete && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  {getFieldValue(courseToDelete.fieldsData, "courseName")}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Category: {(() => {
                    const categoryId = getFieldValue(courseToDelete.fieldsData, "category");
                    const categoryObj = categories.find(cat => cat.id === categoryId || cat.value === categoryId);
                    return categoryObj ? categoryObj.name : categoryId || "Unknown";
                  })()}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {getFieldValue(courseToDelete.fieldsData, "duration")} months
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6 flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCourseToDelete(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Yes, Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
