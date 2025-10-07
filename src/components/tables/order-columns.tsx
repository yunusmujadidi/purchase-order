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
import { useOrderModal } from "@/hooks/use-order-modal";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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
    header: "Order #",
    cell: ({ row }) => {
      return (
        <div className="font-mono text-xs">{row.getValue("orderNumber")}</div>
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
        >
          Client
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const clientProject = row.original.clientProject;
      return (
        <div>
          <div className="font-medium">{row.getValue("clientName")}</div>
          {clientProject && (
            <div className="text-sm text-muted-foreground">{clientProject}</div>
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
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("quantity")}</div>;
    },
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      const size = row.getValue("size") as string | null;
      return <div>{size || "-"}</div>;
    },
  },
  {
    accessorKey: "materials",
    header: "Materials",
    cell: ({ row }) => {
      const materials = row.original.materials || [];
      return (
        <div className="max-w-[200px]">
          {materials.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {materials.slice(0, 2).map((material, i) => (
                <span
                  key={i}
                  className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded"
                >
                  {material}
                </span>
              ))}
              {materials.length > 2 && (
                <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  +{materials.length - 2}
                </span>
              )}
            </div>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "currentStage",
    header: "Current Stage",
    cell: ({ row }) => {
      const stage = row.getValue("currentStage") as string;
      const stageColors: Record<string, string> = {
        PENDING: "bg-gray-100 text-gray-700",
        METAL: "bg-slate-100 text-slate-800",
        VENEER: "bg-amber-100 text-amber-800",
        ASSY: "bg-orange-100 text-orange-800",
        FINISHING: "bg-purple-100 text-purple-800",
        PACKING: "bg-blue-100 text-blue-800",
        COMPLETED: "bg-green-100 text-green-800",
      };
      return (
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
            stageColors[stage] || "bg-gray-100 text-gray-700"
          }`}
        >
          {stage}
        </span>
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
        >
          Delivery
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("deliveryDate") as Date | null;
      return <div>{date ? format(new Date(date), "dd MMM yyyy") : "-"}</div>;
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      const priorityConfig: Record<string, { color: string; icon: string }> = {
        URGENT: { color: "text-red-600", icon: "🔥" },
        STANDARD: { color: "text-gray-600", icon: "" },
        LOW: { color: "text-blue-600", icon: "⬇️" },
      };
      const config = priorityConfig[priority] || priorityConfig.STANDARD;
      return (
        <div className={`text-xs font-medium ${config.color}`}>
          {config.icon} {priority}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        IN_PROGRESS: "bg-blue-100 text-blue-800",
        COMPLETED: "bg-green-100 text-green-800",
        CANCELLED: "bg-red-100 text-red-800",
        ON_HOLD: "bg-orange-100 text-orange-800",
      };
      return (
        <span
          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
            statusColors[status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {status.replace("_", " ")}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      const order = row.original;
      const { onEdit } = useOrderModal();

      const utils = trpc.useUtils();
      const deleteMutation = trpc.order.delete.useMutation({
        onSuccess: () => {
          utils.order.getAll.invalidate();
        },
      });

      const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this order?")) {
          try {
            await deleteMutation.mutateAsync({ id: order.id });
            toast.success("Order deleted successfully");
          } catch (error: any) {
            toast.error(error.message || "Failed to delete order");
          }
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(order)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
