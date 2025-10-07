"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderModal } from "@/components/modal/order-modal";
import { useOrderModal } from "@/hooks/use-order-modal";
import { trpc } from "@/lib/trpc";
import { Plus, Upload } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { columns } from "@/components/tables/order-columns";
import { CSVImport } from "@/components/orders/csv-import";

const OrdersPage = () => {
  const { onOpen } = useOrderModal();
  const { data: orders, isLoading } = trpc.order.getAll.useQuery();
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="w-full max-w-full p-6 space-y-6 overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(!showImport)}>
            <Upload className="mr-2 h-4 w-4" />
            {showImport ? "Hide" : "Import CSV"}
          </Button>
          <Button onClick={onOpen}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* CSV Import Section */}
      {showImport && (
        <div className="animate-in slide-in-from-top duration-300">
          <CSVImport />
        </div>
      )}

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
