"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderModal } from "@/hooks/use-order-modal";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import {
  stageColors,
  stageItemColors,
  statusColors,
  statusItemColors,
  priorityConfig,
} from "@/lib/order-colors";

type Order = {
  id: string;
  orderNumber: string;
  clientName: string;
  clientProject?: string | null;
  productName: string;
  quantity: number;
  size?: string | null;
  description?: string | null;
  pictureRef?: string | null;
  materials?: string[];
  poApprovalDate?: Date | null;
  deliveryDate?: Date | null;
  deliveryAddress?: string | null;
  currentStage: string;
  status: string;
  priority: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Order #
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="w-[100px] min-h-[48px] flex items-center py-2">
          <span className="font-mono text-xs font-medium bg-muted px-2 py-1 rounded">
            {row.getValue("orderNumber")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Client
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const clientName = row.getValue("clientName") as string;
      const clientProject = row.original.clientProject;
      return (
        <div className="w-[140px] flex flex-col justify-center min-h-[48px] py-2">
          <div
            className="font-medium text-sm line-clamp-2 leading-tight"
            title={clientName}
          >
            {clientName}
          </div>
          {clientProject && (
            <div
              className="text-xs text-muted-foreground line-clamp-1 mt-0.5"
              title={clientProject}
            >
              {clientProject}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Product
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const productName = row.getValue("productName") as string;
      return (
        <div
          className="w-[180px] min-h-[48px] flex items-center py-2"
          title={productName}
        >
          <span className="text-sm line-clamp-2 leading-tight">
            {productName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Qty
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-center w-[60px] min-h-[48px] flex items-center justify-center py-2">
          <span className="text-sm font-semibold">
            {row.getValue("quantity")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "size",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Size
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const size = row.getValue("size") as string | null;
      return (
        <div
          className="w-[100px] min-h-[48px] flex items-center py-2"
          title={size || undefined}
        >
          <span className="text-sm line-clamp-1">{size || "-"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "materials",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Materials
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const materials = row.original.materials || [];
      return (
        <div className="w-[220px] min-h-[48px] flex items-center py-2">
          {materials.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {materials.map((material, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded whitespace-nowrap"
                >
                  {material}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const materials = row.getValue(id) as string[];
      // If value is an array (multi-select), check if row materials contain ALL selected materials
      if (Array.isArray(value)) {
        return value.every((selectedMaterial) =>
          materials?.includes(selectedMaterial)
        );
      }
      // Single value filtering
      return materials?.includes(value) ?? false;
    },
  },
  {
    accessorKey: "currentStage",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Stage
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: function StageCell({ row }) {
      const order = row.original;
      const stage = order.currentStage;

      const utils = trpc.useUtils();
      const updateStageMutation = trpc.order.updateStage.useMutation({
        onMutate: async (variables) => {
          // Cancel outgoing refetches
          await utils.order.getAll.cancel();

          // Snapshot the previous value
          const previousOrders = utils.order.getAll.getData();

          // Optimistically update
          utils.order.getAll.setData(undefined, (old) => {
            if (!old) return old;
            return old.map((o) =>
              o.id === variables.id
                ? { ...o, currentStage: variables.currentStage }
                : o
            );
          });

          return { previousOrders };
        },
        onError: (error, variables, context) => {
          // Rollback on error
          if (context?.previousOrders) {
            utils.order.getAll.setData(undefined, context.previousOrders);
          }
          toast.error(error.message || "Failed to update stage");
        },
        onSuccess: () => {
          toast.success("Stage updated successfully");
        },
        onSettled: () => {
          // Sync with server
          utils.order.getAll.invalidate();
        },
      });

      const handleStageChange = (newStage: string) => {
        updateStageMutation.mutate({
          id: order.id,
          currentStage: newStage,
        });
      };

      return (
        <div className="w-[130px] min-h-[48px] flex items-center">
          <Select value={stage} onValueChange={handleStageChange}>
            <SelectTrigger
              className={`h-8 text-xs font-medium border ${
                stageColors[stage] || "bg-gray-100 text-gray-700"
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
        </div>
      );
    },
  },
  {
    accessorKey: "deliveryDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Delivery
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("deliveryDate") as Date | null;
      return (
        <div className="w-[110px] whitespace-nowrap min-h-[48px] flex items-center py-2">
          <span className="text-sm">
            {date ? (
              format(new Date(date), "dd MMM yyyy")
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const date = row.getValue(id) as Date | null;
      if (!date || !value) return true;

      const deliveryDate = new Date(date);
      const { from, to } = value as { from?: Date; to?: Date };

      if (from && to) {
        return deliveryDate >= from && deliveryDate <= to;
      } else if (from) {
        return deliveryDate >= from;
      }

      return true;
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Priority
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      const config = priorityConfig[priority] || priorityConfig.STANDARD;
      return (
        <div
          className={`text-xs font-semibold w-[100px] whitespace-nowrap min-h-[48px] flex items-center ${config.color}`}
        >
          {priority}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Status
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: function StatusCell({ row }) {
      const order = row.original;
      const status = order.status;

      const utils = trpc.useUtils();
      const updateStatusMutation = trpc.order.updateStatus.useMutation({
        onMutate: async (variables) => {
          // Cancel outgoing refetches
          await utils.order.getAll.cancel();

          // Snapshot the previous value
          const previousOrders = utils.order.getAll.getData();

          // Optimistically update
          utils.order.getAll.setData(undefined, (old) => {
            if (!old) return old;
            return old.map((o) =>
              o.id === variables.id ? { ...o, status: variables.status } : o
            );
          });

          return { previousOrders };
        },
        onError: (error, variables, context) => {
          // Rollback on error
          if (context?.previousOrders) {
            utils.order.getAll.setData(undefined, context.previousOrders);
          }
          toast.error(error.message || "Failed to update status");
        },
        onSuccess: () => {
          toast.success("Status updated successfully");
        },
        onSettled: () => {
          // Sync with server
          utils.order.getAll.invalidate();
        },
      });

      const handleStatusChange = (newStatus: string) => {
        updateStatusMutation.mutate({
          id: order.id,
          status: newStatus as any,
        });
      };

      return (
        <div className="w-[140px] min-h-[48px] flex items-center">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger
              className={`h-8 text-xs font-semibold border ${
                statusColors[status] || "bg-gray-100 text-gray-800"
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: function ActionsCell({ row }) {
      const order = row.original;
      const { onEdit } = useOrderModal();
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);

      const utils = trpc.useUtils();
      const deleteMutation = trpc.order.delete.useMutation({
        onSuccess: () => {
          utils.order.getAll.invalidate();
          toast.success("Order deleted successfully");
          setShowDeleteDialog(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to delete order");
        },
      });

      const handleDelete = async () => {
        try {
          await deleteMutation.mutateAsync({ id: order.id });
        } catch (error) {
          // Error is handled in onError
        }
      };

      return (
        <div className="w-[50px] min-h-[48px] flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel className="font-semibold">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(order.id)}
                className="cursor-pointer"
              >
                Copy Order ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(order)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  order
                  <span className="font-semibold text-foreground">
                    {" "}
                    {order.orderNumber}
                  </span>{" "}
                  for{" "}
                  <span className="font-semibold text-foreground">
                    {order.clientName}
                  </span>
                  .
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMutation.isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
