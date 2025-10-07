import {
  LayoutDashboard,
  Package,
  Factory,
  Users,
  Settings,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    description: "Overview and statistics",
  },
  {
    title: "Orders",
    url: "/orders",
    icon: Package,
    description: "Manage and track all orders",
  },
  {
    title: "Production",
    url: "/production",
    icon: Factory,
    description: "Track production process and stages",
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    description: "Manage users and permissions",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    description: "Application settings",
  },
];
