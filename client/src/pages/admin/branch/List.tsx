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
import { ArrowUpDown, Eye, PencilLine, Trash2 } from "lucide-react";
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

import { getBranchListAPI, updateBranchAPI, deleteBranchAPI } from "@/API/services/branchService";

export type Branch = {
  id: string;
  branchName: string;
  _id: string;
  phone: string;
  directorname: string;
  address: string;
  code: string;
  location: string;
  dist: string;
  state: string;
  religion: string;
  user: {
    email: string;
    avatar: string;
    name: string;
  };
  isActive: boolean;
};

export default function BranchList() {
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [data, setData] = React.useState<Branch[]>([]);
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

  // Dialog states
  const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState<{[key: string]: any}>({});

  type Pagination = {
    limit: number;
    totalBranches: number;
    totalPages: number;
    currentPage: number;
    count: number;
  };

  const [pagination, setPagination] = React.useState<Pagination>({
    limit: 0,
    totalPages: 0,
    currentPage: 0,
    totalBranches: 0,
    count: 0,
  });

  React.useEffect(() => {
    setLoading(true);
    // console.log(sortBy, order);

    getBranchListAPI({ page, limit, search, sortBy, order })
      .then((res) => {
        console.log(res.data.data);

        setData(res.data.data.branches);
        setPagination(res.data.data.pagination);
        setLoading(false);
      })
      .catch((err) => {
        setData([]);
        setLoading(false);
        console.error(err);
      });
  }, [page, limit, search, sortBy, order, reload]);
  console.log("data", data);

  // Handle view details
  const handleView = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsViewDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setEditFormData({
      branchName: branch.branchName,
      name: branch.user.name,
      email: branch.user.email,
      phone: branch.phone,
      address: branch.address,
      code: branch.code,
      directorname: branch.directorname,
      location: branch.location,
      dist: branch.dist,
      state: branch.state,
      religion: branch.religion,
    });
    setIsEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedBranch) return;

    const formData = new FormData();
    Object.entries(editFormData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    updateBranchAPI(selectedBranch._id, formData)
      .then(() => {
        toast.success("Branch updated successfully");
        setIsEditDialogOpen(false);
        setReload(!reload);
      })
      .catch((err) => {
        console.error("Error updating branch:", err);
        toast.error(err?.response?.data?.message || "Failed to update branch");
      });
  };

  // Handle delete
  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!selectedBranch) return;

    deleteBranchAPI(selectedBranch._id)
      .then(() => {
        toast.success("Branch deleted successfully");
        setIsDeleteDialogOpen(false);
        setReload(!reload);
      })
      .catch((err) => {
        console.error("Error deleting branch:", err);
        toast.error(err?.response?.data?.message || "Failed to delete branch");
      });
  };

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: "S.No",
      header: "S.No",
      cell: ({ row }) => <div>{row.index + 1}.</div>,
    },
    {
      accessorKey: "image",
      header: "Image",

      cell: ({ row }) => (
        <img
          src={row.original.user.avatar}
          className="w-[35px] h-[35px] rounded-full"
          alt={row.original.user.name}
        />
      ),
    },
    {
      accessorKey: "branchName",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            const newOrder = order === "asc" ? "desc" : "asc";
            setOrder(newOrder);
            setSortBy("branchName");
          }}
        >
          Branch Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase">{row.original.branchName}</div>
      ),
    },
    {
      accessorKey: "directorname",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            const newOrder = order === "asc" ? "desc" : "asc";
            setOrder(newOrder);
            setSortBy("directorname");
          }}
        >
          Director Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.original.directorname}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="lowercase">{row.original.user.email}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone No.",
      cell: ({ row }) => <div className="lowercase">{row.original.phone} </div>,
    },

    {
      accessorKey: "isActive",
      header: () => <div className="text-right mr-[10px]">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-end  text-sm ">
          <Button
            variant={row.original.isActive ? "outline" : "default"}
            className={` h-[20px] w-[65px] text-sm font-semibold   `}
          >
            {row.original.isActive ? "active" : "inactive"}
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end ">
          <button 
            className="rounded-full p-1 hover:bg-gray-200"
            onClick={() => handleView(row.original)}
            title="View Details"
          >
            <Eye size={15} />
          </button>
          <button 
            className="rounded-full p-1 hover:bg-gray-200"
            onClick={() => handleEdit(row.original)}
            title="Edit Branch"
          >
            <PencilLine size={15} />
          </button>
          <button 
            className="rounded-full p-1 hover:bg-red-200 text-red-600"
            onClick={() => handleDelete(row.original)}
            title="Delete Branch"
          >
            <Trash2 size={15} />
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
                onClick={() => navigate("/admin/branches/add")}
              >
                Add Branch
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
              totalCategories={pagination.totalBranches}
              onPrevious={() => setPage((prev) => Math.max(prev - 1, 1))}
              onNext={() =>
                setPage((prev) => Math.min(prev + 1, pagination.totalPages))
              }
              onPageClick={(page) => setPage(page)}
            />
          </CardFooter>
        </div>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Branch Details - {selectedBranch?.branchName}</DialogTitle>
            <DialogDescription>
              Complete information of the branch.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBranch && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Branch Name</Label>
                <div className="p-3 bg-gray-50 rounded-md">{selectedBranch.branchName}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Branch Code</Label>
                <div className="p-3 bg-gray-50 rounded-md">{selectedBranch.code}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Director Name</Label>
                <div className="p-3 bg-gray-50 rounded-md">{selectedBranch.directorname}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <div className="p-3 bg-gray-50 rounded-md">{selectedBranch.user.email}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <div className="p-3 bg-gray-50 rounded-md">{selectedBranch.phone}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Location</Label>
                <div className="p-3 bg-gray-50 rounded-md">{selectedBranch.location}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">District</Label>
                <div className="p-3 bg-gray-50 rounded-md">{selectedBranch.dist}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">State</Label>
                <div className="p-3 bg-gray-50 rounded-md">{selectedBranch.state}</div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-gray-600">Address</Label>
                <div className="p-3 bg-gray-50 rounded-md">{selectedBranch.address}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedBranch) handleEdit(selectedBranch);
            }}>
              Edit Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                value={editFormData.branchName || ''}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  branchName: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Branch Code</Label>
              <Input
                id="code"
                value={editFormData.code || ''}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  code: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="directorname">Director Name</Label>
              <Input
                id="directorname"
                value={editFormData.directorname || ''}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  directorname: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editFormData.location || ''}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  location: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dist">District</Label>
              <Input
                id="dist"
                value={editFormData.dist || ''}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  dist: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={editFormData.state || ''}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  state: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  address: e.target.value
                }))}
              />
            </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBranch?.branchName}"? This action cannot be undone.
              This will also delete the associated user account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
