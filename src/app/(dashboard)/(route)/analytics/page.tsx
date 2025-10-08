"use client";

import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
  eachMonthOfInterval,
} from "date-fns";
import { OrdersTimelineChart } from "@/components/dashboard/orders-timeline-chart";
import { MaterialsBreakdownChart } from "@/components/dashboard/materials-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, Target, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";

const AnalyticsPage = () => {
  const { data: orders, isLoading } = trpc.order.getAll.useQuery();

  // Calculate timeline data (last 6 months)
  const timelineData = useMemo(() => {
    if (!orders) return [];

    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({
      start: sixMonthsAgo,
      end: now,
    });

    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthOrders = orders.filter((o) => {
        const createdAt = new Date(o.createdAt);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });

      const completedOrders = monthOrders.filter(
        (o) => o.status === "COMPLETED"
      );

      return {
        month: format(month, "MMM"),
        orders: monthOrders.length,
        completed: completedOrders.length,
      };
    });
  }, [orders]);

  // Calculate materials breakdown
  const materialsData = useMemo(() => {
    if (!orders) return [];

    const materialCounts = new Map<string, number>();
    const materialColors: Record<string, string> = {
      "Solid Wood": "hsl(30, 70%, 50%)",
      Veneer: "hsl(150, 60%, 45%)",
      "Metal/SS": "hsl(210, 50%, 50%)",
      Fabric: "hsl(280, 60%, 55%)",
      Marble: "hsl(200, 30%, 70%)",
      Glass: "hsl(180, 50%, 60%)",
      Leather: "hsl(20, 50%, 40%)",
      Other: "hsl(0, 0%, 60%)",
    };

    orders.forEach((order) => {
      if (order.materials && order.materials.length > 0) {
        order.materials.forEach((material) => {
          materialCounts.set(material, (materialCounts.get(material) || 0) + 1);
        });
      } else {
        materialCounts.set("Other", (materialCounts.get("Other") || 0) + 1);
      }
    });

    return Array.from(materialCounts.entries())
      .map(([material, count]) => ({
        material,
        count,
        fill: materialColors[material] || materialColors.Other,
      }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  // Calculate stage performance metrics
  const stageMetrics = useMemo(() => {
    if (!orders) return [];

    const stages = [
      { name: "METAL", inField: "metalIn", outField: "metalOut" },
      { name: "VENEER", inField: "veneerIn", outField: "veneerOut" },
      { name: "ASSY", inField: "assyIn", outField: "assyOut" },
      { name: "FINISHING", inField: "finishingIn", outField: "finishingOut" },
      { name: "PACKING", inField: "packingIn", outField: "packingOut" },
    ];

    return stages.map((stage) => {
      const ordersInStage = orders.filter(
        (o) =>
          o[stage.inField as keyof typeof o] &&
          o[stage.outField as keyof typeof o]
      );

      if (ordersInStage.length === 0) {
        return {
          stage: stage.name,
          avgDays: 0,
          count: 0,
        };
      }

      const totalDays = ordersInStage.reduce((sum, order) => {
        const inDate = new Date(
          order[stage.inField as keyof typeof order] as Date
        );
        const outDate = new Date(
          order[stage.outField as keyof typeof order] as Date
        );
        const days = Math.ceil(
          (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);

      return {
        stage: stage.name,
        avgDays: Math.round(totalDays / ordersInStage.length),
        count: ordersInStage.length,
      };
    });
  }, [orders]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (!orders) {
      return {
        totalOrders: 0,
        completionRate: 0,
        avgCycleTime: 0,
        onTimeDelivery: 0,
      };
    }

    const completedOrders = orders.filter((o) => o.status === "COMPLETED");
    const completionRate =
      orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0;

    // Calculate average cycle time (PO approval to completion)
    const ordersWithCycleTimes = orders.filter(
      (o) => o.poApprovalDate && o.packingOut && o.status === "COMPLETED"
    );

    const avgCycleTime =
      ordersWithCycleTimes.length > 0
        ? ordersWithCycleTimes.reduce((sum, order) => {
            const start = new Date(order.poApprovalDate!);
            const end = new Date(order.packingOut!);
            const days = Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0) / ordersWithCycleTimes.length
        : 0;

    // Calculate on-time delivery rate
    const ordersWithDeliveryDates = orders.filter(
      (o) => o.deliveryDate && o.packingOut && o.status === "COMPLETED"
    );

    const onTimeOrders = ordersWithDeliveryDates.filter((order) => {
      const deliveryDate = new Date(order.deliveryDate!);
      const completionDate = new Date(order.packingOut!);
      return completionDate <= deliveryDate;
    });

    const onTimeDelivery =
      ordersWithDeliveryDates.length > 0
        ? (onTimeOrders.length / ordersWithDeliveryDates.length) * 100
        : 0;

    return {
      totalOrders: orders.length,
      completionRate: Math.round(completionRate),
      avgCycleTime: Math.round(avgCycleTime),
      onTimeDelivery: Math.round(onTimeDelivery),
    };
  }, [orders]);

  // Calculate top clients
  const topClients = useMemo(() => {
    if (!orders) return [];

    const clientCounts = new Map<string, number>();

    orders.forEach((order) => {
      clientCounts.set(
        order.clientName,
        (clientCounts.get(order.clientName) || 0) + 1
      );
    });

    return Array.from(clientCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Analytics & Reports
        </h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your order management and production
          performance
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={metrics.totalOrders}
          description="All time orders"
          icon={Target}
          loading={isLoading}
        />
        <StatsCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          description="Successfully completed"
          icon={TrendingUp}
          iconColor="text-green-600"
          loading={isLoading}
        />
        <StatsCard
          title="Avg Cycle Time"
          value={`${metrics.avgCycleTime}d`}
          description="PO to completion"
          icon={Clock}
          iconColor="text-blue-600"
          loading={isLoading}
        />
        <StatsCard
          title="On-Time Delivery"
          value={`${metrics.onTimeDelivery}%`}
          description="Met delivery dates"
          icon={Target}
          iconColor={
            metrics.onTimeDelivery >= 80 ? "text-green-600" : "text-orange-600"
          }
          loading={isLoading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <OrdersTimelineChart data={timelineData} loading={isLoading} />
        <MaterialsBreakdownChart data={materialsData} loading={isLoading} />
      </div>

      {/* Stage Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Stage Performance Metrics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Average time spent in each production stage
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading...
            </div>
          ) : stageMetrics.length > 0 ? (
            <div className="space-y-4">
              {stageMetrics.map((metric) => (
                <div
                  key={metric.stage}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{metric.stage}</p>
                    <p className="text-sm text-muted-foreground">
                      {metric.count} orders processed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {metric.avgDays}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        days
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">avg time</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No stage data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Clients
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Clients with the most orders
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading...
            </div>
          ) : topClients.length > 0 ? (
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div
                  key={client.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <p className="font-medium">{client.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{client.count}</p>
                    <p className="text-xs text-muted-foreground">orders</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No client data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
