"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getDynamicFormDataAPI, 
  deleteDynamicFormDataAPI 
} from "@/API/services/studentService";

export type DynamicFormData = {
  _id: string;
  formType: string;
  fieldsData: Array<{
    name: string;
    value: any;
  }>;
  createdAt: string;
  updatedAt: string;
};

export default function RegisteredStudents() {
  const navigate = useNavigate();
  const [data, setData] = React.useState<DynamicFormData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedStudent, setSelectedStudent] = React.useState<DynamicFormData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Fetch students data
  const fetchStudents = React.useCallback(() => {
    setLoading(true);
    getDynamicFormDataAPI("student")
      .then((res) => {
        setData(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
        toast.error("Failed to fetch students");
        setData([]);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Get field value by name
  const getFieldValue = (fieldsData: Array<{name: string; value: any}>, fieldName: string) => {
    const field = fieldsData.find(f => f.name === fieldName);
    return field?.value || "N/A";
  };

  // Handle edit - redirect to add student form with pre-filled data
  const handleEdit = (student: DynamicFormData) => {
    // Convert fieldsData to query parameters
    const formData: {[key: string]: any} = {};
    student.fieldsData.forEach(field => {
      formData[field.name] = field.value;
    });
    
    // Add student ID for update mode
    formData._id = student._id;
    formData.isEditMode = true;
    
    // Convert to URL search params
    const searchParams = new URLSearchParams();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    
    // Navigate to add student form with pre-filled data
    navigate(`/admin/students/add?${searchParams.toString()}`);
  };

  // Handle delete
  const handleDelete = (student: DynamicFormData) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!selectedStudent) return;

    deleteDynamicFormDataAPI(selectedStudent._id)
      .then(() => {
        toast.success("Student deleted successfully");
        setIsDeleteDialogOpen(false);
        fetchStudents(); // Refresh data
      })
      .catch((err) => {
        console.error("Error deleting student:", err);
        toast.error("Failed to delete student");
      });
  };

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!search) return data;
    
    return data.filter(student => {
      const searchLower = search.toLowerCase();
      return student.fieldsData.some(field => 
        field.value && field.value.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [data, search]);

  const columns: ColumnDef<DynamicFormData>[] = [
    {
      accessorKey: "S.No",
      header: "S.No",
      cell: ({ row }) => <div>{row.index + 1}.</div>,
    },
    {
      accessorKey: "studentName",
      header: "Student Name",
      cell: ({ row }) => (
        <div className="font-medium">
          {getFieldValue(row.original.fieldsData, "studentName")}
        </div>
      ),
    },
    {
      accessorKey: "studentEmail",
      header: "Email",
      cell: ({ row }) => (
        <div>{getFieldValue(row.original.fieldsData, "studentEmail")}</div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => (
        <div>{getFieldValue(row.original.fieldsData, "phoneNumber")}</div>
      ),
    },
    {
      accessorKey: "fatherName",
      header: "Father Name",
      cell: ({ row }) => (
        <div>{getFieldValue(row.original.fieldsData, "fatherName")}</div>
      ),
    },
    {
      accessorKey: "registrationNumber",
      header: "Registration No",
      cell: ({ row }) => (
        <div>{getFieldValue(row.original.fieldsData, "registrationNumber")}</div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader className="pb-4">
            <Skeleton className="h-8 w-48" />
          </CardHeader>
        </Card>
        <div className="space-y-2 mt-0">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-start">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="card-container">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Registered Students</h2>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search students..."
                  value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="rounded-md border mt-4">
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
            {table.getRowModel().rows?.length ? (
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
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the student
              "{getFieldValue(selectedStudent?.fieldsData || [], "studentName")}" 
              from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
