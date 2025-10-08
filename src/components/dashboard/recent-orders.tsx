import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  orderNumber: string;
  productName: string;
  clientName: string;
  status: string;
  currentStage: string;
  deliveryDate: Date | null;
  priority: string;
  createdAt: Date;
}

interface RecentOrdersProps {
  orders: Order[];
  loading?: boolean;
}

const statusStyles = {
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  COMPLETED: "bg-green-100 text-green-800 hover:bg-green-200",
  CANCELLED: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  ON_HOLD: "bg-orange-100 text-orange-800 hover:bg-orange-200",
};

const priorityStyles = {
  URGENT: "bg-red-100 text-red-800 border-red-200",
  STANDARD: "bg-blue-100 text-blue-800 border-blue-200",
  LOW: "bg-gray-100 text-gray-800 border-gray-200",
};

export function RecentOrders({ orders, loading = false }: RecentOrdersProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No orders yet. Create your first order to get started.
          </div>
          <div className="flex justify-center mt-4">
            <Link href="/orders">
              <Button>Create Order</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders?id=${order.id}`}
              className="flex items-center justify-between border-b pb-4 last:border-0 hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{order.productName}</p>
                  {order.priority === "URGENT" && (
                    <Badge
                      variant="outline"
                      className={priorityStyles[order.priority]}
                    >
                      {order.priority}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.clientName} • {order.orderNumber}
                </p>
                {order.deliveryDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Delivery: {format(new Date(order.deliveryDate), "MMM dd, yyyy")}
                  </p>
                )}
              </div>
              <div className="text-right flex flex-col gap-2">
                <Badge
                  variant="secondary"
                  className={
                    statusStyles[order.status as keyof typeof statusStyles]
                  }
                >
                  {order.status.replace("_", " ")}
                </Badge>
                {order.currentStage && order.currentStage !== "PENDING" && (
                  <span className="text-xs text-muted-foreground">
                    {order.currentStage}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

