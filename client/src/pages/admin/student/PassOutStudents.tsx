"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { GraduationCap, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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

export default function PassOutStudents() {
  const [data, setData] = React.useState<DynamicFormData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState<DynamicFormData | null>(null);

  // Fetch students data and filter for completed courses
  const fetchPassOutStudents = React.useCallback(() => {
    setLoading(true);
    console.log("🎓 Fetching pass out students...");
    
    getDynamicFormDataAPI("student")
      .then((res) => {
        console.log("📚 All students data:", res.data.data);
        const allStudents = res.data.data || [];
        
        // Filter students who have completed their course
        const passOutStudents = allStudents.filter((student: DynamicFormData) => {
          const completedField = student.fieldsData.find(f => f.name === 'completedCourse');
          const isCompleted = completedField?.value === true || 
                             completedField?.value === 'true' || 
                             completedField?.value === 'on';
          
          console.log(`Student ${student._id} completed status:`, {
            field: completedField,
            isCompleted
          });
          
          return isCompleted;
        });
        
        console.log("🎓 Pass out students found:", passOutStudents);
        setData(passOutStudents);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching pass out students:", err);
        toast.error("Failed to fetch pass out students");
        setData([]);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    fetchPassOutStudents();
  }, [fetchPassOutStudents]);

  // Get field value by name
  const getFieldValue = (fieldsData: Array<{name: string; value: any}>, fieldName: string) => {
    const field = fieldsData.find(f => f.name === fieldName);
    return field?.value || "N/A";
  };

  // Handle delete
  const handleDelete = (student: DynamicFormData) => {
    console.log('🗑️ Delete button clicked for student:', student._id);
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!studentToDelete) return;
    
    deleteDynamicFormDataAPI(studentToDelete._id)
      .then(() => {
        toast.success("Student deleted successfully");
        setIsDeleteDialogOpen(false);
        setStudentToDelete(null);
        fetchPassOutStudents(); // Refresh data
      })
      .catch((err) => {
        console.error("Error deleting student:", err);
        toast.error(err?.response?.data?.message || "Failed to delete student");
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

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return dateString;
    }
  };

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
      accessorKey: "registrationNumber",
      header: "Registration No",
      cell: ({ row }) => {
        // Try multiple possible field names for registration number
        let regNumber = getFieldValue(row.original.fieldsData, "registrationNumber") || 
                        getFieldValue(row.original.fieldsData, "registrationNo") ||
                        getFieldValue(row.original.fieldsData, "regNo");
        
        return (
          <div className="font-mono text-sm">
            {regNumber}
          </div>
        );
      },
    },
    {
      accessorKey: "courseName",
      header: "Course",
      cell: ({ row }) => {
        // Try multiple possible field names for course
        let courseName = getFieldValue(row.original.fieldsData, "selectedCourse") || 
                         getFieldValue(row.original.fieldsData, "courseName") ||
                         getFieldValue(row.original.fieldsData, "course");
        
        // If still no course found, log for debugging
        if (!courseName || courseName === "N/A") {
          console.log("🔍 Course fields for debugging:", row.original.fieldsData.map(f => ({ name: f.name, value: f.value })));
        }
        
        return <div>{courseName}</div>;
      },
    },
    {
      accessorKey: "completionDate",
      header: "Completion Date",
      cell: ({ row }) => (
        <div>{formatDate(getFieldValue(row.original.fieldsData, "courseCompletionDate"))}</div>
      ),
    },
    {
      accessorKey: "studentEmail",
      header: "Email",
      cell: ({ row }) => {
        // Try multiple possible field names for email
        let email = getFieldValue(row.original.fieldsData, "studentEmail") || 
                    getFieldValue(row.original.fieldsData, "email");
        
        return <div className="text-sm">{email}</div>;
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => {
        // Try multiple possible field names for phone
        let phone = getFieldValue(row.original.fieldsData, "phoneNumber") || 
                    getFieldValue(row.original.fieldsData, "phone") ||
                    getFieldValue(row.original.fieldsData, "contactNumber");
        
        return <div>{phone}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <GraduationCap className="w-3 h-3 mr-1" />
          Completed
        </Badge>
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(row.original);
            }}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            title="Delete Student"
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
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold">Pass Out Students</h2>
              <Badge variant="outline" className="ml-2">
                {filteredData.length} Students
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search pass out students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />  
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="rounded-md border mt-5">
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
                  <div className="flex flex-col items-center gap-2">
                    <GraduationCap className="h-12 w-12 text-gray-400" />
                    <p className="text-gray-500">No pass out students found.</p>
                    <p className="text-sm text-gray-400">
                      Students who have completed their course will appear here.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-red-600">
              Delete Student
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              This action cannot be undone. The student record will be permanently deleted from the system.
            </DialogDescription>
          </DialogHeader>
          
          {studentToDelete && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  {getFieldValue(studentToDelete.fieldsData, "studentName")}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Registration No: {getFieldValue(studentToDelete.fieldsData, "registrationNumber") || 
                                   getFieldValue(studentToDelete.fieldsData, "registrationNo") ||
                                   getFieldValue(studentToDelete.fieldsData, "regNo")}
                </p>
                <p className="text-sm text-gray-600">
                  Course: {getFieldValue(studentToDelete.fieldsData, "selectedCourse") || 
                           getFieldValue(studentToDelete.fieldsData, "courseName") ||
                           getFieldValue(studentToDelete.fieldsData, "course")}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6 flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setStudentToDelete(null);
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
              Yes, Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}