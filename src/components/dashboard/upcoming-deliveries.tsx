import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow, isPast } from "date-fns";
import Link from "next/link";
import { Calendar, AlertTriangle } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  productName: string;
  clientName: string;
  deliveryDate: Date;
  status: string;
  currentStage: string;
}

interface UpcomingDeliveriesProps {
  orders: Order[];
  loading?: boolean;
}

export function UpcomingDeliveries({
  orders,
  loading = false,
}: UpcomingDeliveriesProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deliveries
          </CardTitle>
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
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No upcoming deliveries in the next 7 days
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order) => {
            const isOverdue = isPast(new Date(order.deliveryDate));
            return (
              <Link
                key={order.id}
                href={`/orders?id=${order.id}`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border"
              >
                <div
                  className={`p-2 rounded-md ${
                    isOverdue ? "bg-red-100" : "bg-blue-100"
                  }`}
                >
                  {isOverdue ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Calendar className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {order.productName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.clientName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p
                      className={`text-xs font-medium ${
                        isOverdue ? "text-red-600" : "text-muted-foreground"
                      }`}
                    >
                      {format(new Date(order.deliveryDate), "MMM dd, yyyy")}
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p
                      className={`text-xs ${
                        isOverdue ? "text-red-600" : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue ? "Overdue" : formatDistanceToNow(new Date(order.deliveryDate), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs whitespace-nowrap"
                >
                  {order.currentStage}
                </Badge>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

