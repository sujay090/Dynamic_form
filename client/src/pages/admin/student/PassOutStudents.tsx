"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PencilLine, GraduationCap, Trash2 } from "lucide-react";
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
  updateDynamicFormDataAPI,
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
  const [selectedStudent, setSelectedStudent] = React.useState<DynamicFormData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState<{[key: string]: any}>({});

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

  // Handle edit
  const handleEdit = (student: DynamicFormData) => {
    setSelectedStudent(student);
    // Convert fieldsData array to object for easier editing
    const formData: {[key: string]: any} = {};
    student.fieldsData.forEach(field => {
      formData[field.name] = field.value;
    });
    setEditFormData(formData);
    setIsEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (student: DynamicFormData) => {
    if (window.confirm("Are you sure you want to delete this pass out student?")) {
      deleteDynamicFormDataAPI(student._id)
        .then(() => {
          toast.success("Student deleted successfully");
          fetchPassOutStudents(); // Refresh data
        })
        .catch((err) => {
          console.error("Error deleting student:", err);
          toast.error(err?.response?.data?.message || "Failed to delete student");
        });
    }
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedStudent) return;

    // Convert form data back to fieldsData format
    const fieldsData = Object.entries(editFormData).map(([name, value]) => ({
      name,
      value
    }));

    updateDynamicFormDataAPI(selectedStudent._id, { fieldsData })
      .then(() => {
        toast.success("Student updated successfully");
        setIsEditDialogOpen(false);
        fetchPassOutStudents(); // Refresh data
      })
      .catch((err) => {
        console.error("Error updating student:", err);
        toast.error(err?.response?.data?.message || "Failed to update student");
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
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {getFieldValue(row.original.fieldsData, "registrationNumber")}
        </div>
      ),
    },
    {
      accessorKey: "courseName",
      header: "Course",
      cell: ({ row }) => (
        <div>{getFieldValue(row.original.fieldsData, "courseName")}</div>
      ),
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
      cell: ({ row }) => (
        <div className="text-sm">{getFieldValue(row.original.fieldsData, "studentEmail")}</div>
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
            onClick={() => handleEdit(row.original)}
            title="Edit Student"
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original)}
            className="text-red-600 hover:text-red-800"
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pass Out Student</DialogTitle>
            <DialogDescription>
              Update student information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedStudent?.fieldsData.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium capitalize">
                  {field.name.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <Input
                  type={field.name.includes('email') ? 'email' : 
                        field.name.includes('phone') ? 'tel' : 
                        field.name.includes('date') ? 'date' : 'text'}
                  value={editFormData[field.name] || ''}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    [field.name]: e.target.value
                  }))}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}