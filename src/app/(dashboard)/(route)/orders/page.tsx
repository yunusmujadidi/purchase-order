"use client";

import { Button } from "@/components/ui/button";
import { OrderModal } from "@/components/modal/order-modal";
import { useOrderModal } from "@/hooks/use-order-modal";
import { trpc } from "@/lib/trpc";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { columns } from "@/components/tables/order-columns";

const OrdersPage = () => {
  const { onOpen } = useOrderModal();
  const { data: orders, isLoading } = trpc.order.getAll.useQuery();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your orders
          </p>
        </div>
        <Button onClick={onOpen}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Orders Data Table */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground bg-white rounded-lg border">
          Loading orders...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders || []}
          searchKey="clientName"
          searchPlaceholder="Search by client name..."
        />
      )}

      <OrderModal />
    </div>
  );
};

export default OrdersPage;
