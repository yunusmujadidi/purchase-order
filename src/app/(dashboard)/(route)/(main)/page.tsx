"use client";

import { trpc } from "@/lib/trpc";
import {
  Package,
  Factory,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { UpcomingDeliveries } from "@/components/dashboard/upcoming-deliveries";
import { OrdersByStage } from "@/components/dashboard/orders-by-stage";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { OrdersTimelineChart } from "@/components/dashboard/orders-timeline-chart";
import { useMemo } from "react";
import {
  addDays,
  isPast,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
  eachMonthOfInterval,
} from "date-fns";

const MainDashboard = () => {
  const { data: orders, isLoading } = trpc.order.getAll.useQuery();

  // Calculate statistics
  const stats = useMemo(() => {
    if (!orders) {
      return {
        total: 0,
        active: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        upcomingDeliveries: 0,
      };
    }

    const now = startOfDay(new Date());
    const sevenDaysFromNow = addDays(now, 7);

    const activeOrders = orders.filter(
      (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
    );

    const overdueOrders = orders.filter(
      (o) =>
        o.deliveryDate &&
        isPast(new Date(o.deliveryDate)) &&
        o.status !== "COMPLETED" &&
        o.status !== "CANCELLED"
    );

    const upcomingOrders = orders.filter(
      (o) =>
        o.deliveryDate &&
        isWithinInterval(new Date(o.deliveryDate), {
          start: now,
          end: sevenDaysFromNow,
        }) &&
        o.status !== "COMPLETED" &&
        o.status !== "CANCELLED"
    );

    return {
      total: orders.length,
      active: activeOrders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      inProgress: orders.filter((o) => o.status === "IN_PROGRESS").length,
      completed: orders.filter((o) => o.status === "COMPLETED").length,
      overdue: overdueOrders.length,
      upcomingDeliveries: upcomingOrders.length,
    };
  }, [orders]);

  // Get orders by stage
  const ordersByStage = useMemo(() => {
    if (!orders) return [];

    const stages = [
      "PENDING",
      "METAL",
      "VENEER",
      "ASSY",
      "FINISHING",
      "PACKING",
      "COMPLETED",
    ];

    const stageCounts = stages.map((stage) => {
      const count = orders.filter((o) => o.currentStage === stage).length;
      return {
        stage,
        count,
        percentage: orders.length > 0 ? (count / orders.length) * 100 : 0,
      };
    });

    return stageCounts.filter((s) => s.count > 0);
  }, [orders]);

  // Get upcoming deliveries (next 7 days)
  const upcomingDeliveries = useMemo(() => {
    if (!orders) return [];

    const now = startOfDay(new Date());
    const sevenDaysFromNow = addDays(now, 7);

    return orders
      .filter(
        (o) =>
          o.deliveryDate && o.status !== "COMPLETED" && o.status !== "CANCELLED"
      )
      .filter((o) => {
        const deliveryDate = new Date(o.deliveryDate!);
        return (
          deliveryDate <= sevenDaysFromNow &&
          (deliveryDate >= now || isPast(deliveryDate))
        );
      })
      .sort(
        (a, b) =>
          new Date(a.deliveryDate!).getTime() -
          new Date(b.deliveryDate!).getTime()
      )
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        productName: o.productName,
        clientName: o.clientName,
        deliveryDate: new Date(o.deliveryDate!),
        status: o.status,
        currentStage: o.currentStage,
      }));
  }, [orders]);

  // Get recent orders
  const recentOrders = useMemo(() => {
    if (!orders) return [];

    return orders.slice(0, 5).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      productName: o.productName,
      clientName: o.clientName,
      status: o.status,
      currentStage: o.currentStage,
      deliveryDate: o.deliveryDate ? new Date(o.deliveryDate) : null,
      priority: o.priority,
      createdAt: new Date(o.createdAt),
    }));
  }, [orders]);

  // Calculate timeline data (last 6 months)
  const timelineData = useMemo(() => {
    if (!orders) return [];

    const now = new Date();
    const fiveMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({
      start: fiveMonthsAgo,
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={stats.total}
          description="All time orders"
          icon={Package}
          loading={isLoading}
        />
        <StatsCard
          title="Active Orders"
          value={stats.active}
          description="Currently in progress"
          icon={TrendingUp}
          iconColor="text-blue-600"
          loading={isLoading}
        />
        <StatsCard
          title="In Production"
          value={stats.inProgress}
          description="Being manufactured"
          icon={Factory}
          iconColor="text-purple-600"
          loading={isLoading}
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          description="Successfully delivered"
          icon={CheckCircle}
          iconColor="text-green-600"
          loading={isLoading}
        />
      </div>

      {/* Alert Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title="Overdue Orders"
          value={stats.overdue}
          description="Past delivery date"
          icon={AlertTriangle}
          iconColor={
            stats.overdue > 0 ? "text-red-600" : "text-muted-foreground"
          }
          loading={isLoading}
        />
        <StatsCard
          title="Upcoming Deliveries"
          value={stats.upcomingDeliveries}
          description="Next 7 days"
          icon={Calendar}
          iconColor={
            stats.upcomingDeliveries > 0
              ? "text-orange-600"
              : "text-muted-foreground"
          }
          loading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <RecentOrders orders={recentOrders} loading={isLoading} />

        {/* Orders by Stage */}
        <OrdersByStage stages={ordersByStage} loading={isLoading} />
      </div>

      {/* Upcoming Deliveries */}
      {(upcomingDeliveries.length > 0 || isLoading) && (
        <UpcomingDeliveries orders={upcomingDeliveries} loading={isLoading} />
      )}

      {/* Orders Timeline */}
      <OrdersTimelineChart data={timelineData} loading={isLoading} />
    </div>
  );
};

export default MainDashboard;
