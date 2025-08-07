"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PencilLine, Building, Trash2 } from "lucide-react";
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

export default function DynamicBranchList() {
  const [data, setData] = React.useState<DynamicFormData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedBranch, setSelectedBranch] = React.useState<DynamicFormData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [branchToDelete, setBranchToDelete] = React.useState<DynamicFormData | null>(null);
  const [editFormData, setEditFormData] = React.useState<{[key: string]: any}>({});

  // Fetch branches data
  const fetchBranches = React.useCallback(() => {
    setLoading(true);
    console.log("🏢 Fetching branches...");
    
    getDynamicFormDataAPI("branch")
      .then((res) => {
        console.log("📂 Branches data:", res.data.data);
        const branches = res.data.data || [];
        setData(branches);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching branches:", err);
        toast.error("Failed to fetch branches");
        setData([]);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Get field value by name
  const getFieldValue = (fieldsData: Array<{name: string; value: any}>, fieldName: string) => {
    const field = fieldsData.find(f => f.name === fieldName);
    return field?.value || "N/A";
  };

  // Handle edit
  const handleEdit = (branch: DynamicFormData) => {
    setSelectedBranch(branch);
    // Convert fieldsData array to object for easier editing
    const formData: {[key: string]: any} = {};
    branch.fieldsData.forEach(field => {
      formData[field.name] = field.value;
    });
    setEditFormData(formData);
    setIsEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedBranch) return;

    // Convert form data back to fieldsData format
    const fieldsData = Object.entries(editFormData).map(([name, value]) => ({
      name,
      value
    }));

    updateDynamicFormDataAPI(selectedBranch._id, { fieldsData })
      .then(() => {
        toast.success("Branch updated successfully");
        setIsEditDialogOpen(false);
        fetchBranches(); // Refresh data
      })
      .catch((err) => {
        console.error("Error updating branch:", err);
        toast.error(err?.response?.data?.message || "Failed to update branch");
      });
  };

  // Handle delete
  const handleDelete = (branch: DynamicFormData) => {
    console.log('🗑️ Delete button clicked for branch:', branch._id);
    setBranchToDelete(branch);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!branchToDelete) return;
    
    deleteDynamicFormDataAPI(branchToDelete._id)
      .then(() => {
        toast.success("Branch deleted successfully");
        setIsDeleteDialogOpen(false);
        setBranchToDelete(null);
        fetchBranches(); // Refresh data
      })
      .catch((err) => {
        console.error("Error deleting branch:", err);
        toast.error(err?.response?.data?.message || "Failed to delete branch");
      });
  };

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!search) return data;
    
    return data.filter(branch => {
      const searchLower = search.toLowerCase();
      return branch.fieldsData.some(field => 
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
      accessorKey: "branchName",
      header: "Branch Name",
      cell: ({ row }) => (
        <div className="font-medium">
          {getFieldValue(row.original.fieldsData, "addBranch")}
        </div>
      ),
    },
    {
      accessorKey: "branchCode",
      header: "Branch Code",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {getFieldValue(row.original.fieldsData, "branchCode")}
        </div>
      ),
    },
    {
      accessorKey: "directorName",
      header: "Director Name",
      cell: ({ row }) => (
        <div>{getFieldValue(row.original.fieldsData, "directorName")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm">{getFieldValue(row.original.fieldsData, "email")}</div>
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
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => (
        <div>{getFieldValue(row.original.fieldsData, "state")}</div>
      ),
    },
    {
      accessorKey: "district",
      header: "District",
      cell: ({ row }) => (
        <div>{getFieldValue(row.original.fieldsData, "district")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isActive = getFieldValue(row.original.fieldsData, "isActive");
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
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
            title="Edit Branch"
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(row.original);
            }}
            className="text-red-600 hover:text-red-800"
            title="Delete Branch"
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
    <div className="w-full max-w-6xl mx-auto">
      <Card className="card-container">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold">Branch Management</h2>
              <Badge variant="outline" className="ml-2">
                {filteredData.length} Branches
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search branches..."
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
                  <div className="flex flex-col items-center gap-2">
                    <Building className="h-12 w-12 text-gray-400" />
                    <p className="text-gray-500">No branches found.</p>
                    <p className="text-sm text-gray-400">
                      Branches created through the system will appear here.
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
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              Update branch information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedBranch?.fieldsData.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium capitalize">
                  {field.name.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <Input
                  type={field.name.includes('email') ? 'email' : 
                        field.name.includes('phone') ? 'tel' : 
                        field.name.includes('fees') ? 'number' : 'text'}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-red-600">
              Delete Branch
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              This action cannot be undone. The branch will be permanently deleted from the system.
            </DialogDescription>
          </DialogHeader>
          
          {branchToDelete && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  {branchToDelete.fieldsData.find(f => f.name === "branchName")?.value || "Branch"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Location: {branchToDelete.fieldsData.find(f => f.name === "branchLocation" || f.name === "location")?.value || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Contact: {branchToDelete.fieldsData.find(f => f.name === "contactNumber" || f.name === "phone")?.value || "N/A"}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6 flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setBranchToDelete(null);
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
              Yes, Delete Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
