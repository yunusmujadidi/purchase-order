"use client";

import { Button } from "@/components/ui/button";
import { OrderModal } from "@/components/modal/order-modal";
import { useOrderModal } from "@/hooks/use-order-modal";
import { trpc } from "@/lib/trpc";
import { Plus } from "lucide-react";

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

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading orders...
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{order.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Client: {order.clientName}
                      {order.clientProject && ` - ${order.clientProject}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {order.quantity}
                      {order.size && ` | Size: ${order.size}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No orders yet. Click &quot;New Order&quot; to create one.
          </div>
        )}
      </div>

      <OrderModal />
    </div>
  );
};

export default OrdersPage;
