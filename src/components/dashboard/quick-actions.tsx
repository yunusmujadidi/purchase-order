import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  Upload,
  Factory,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      label: "New Order",
      icon: Plus,
      href: "/orders",
      description: "Create a new order",
      variant: "default" as const,
    },
    {
      label: "Import CSV",
      icon: Upload,
      href: "/orders",
      description: "Bulk import orders",
      variant: "outline" as const,
    },
    {
      label: "Production",
      icon: Factory,
      href: "/production",
      description: "View production status",
      variant: "outline" as const,
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      description: "View reports",
      variant: "outline" as const,
    },
    {
      label: "Users",
      icon: Users,
      href: "/users",
      description: "Manage users",
      variant: "outline" as const,
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      description: "Configure app",
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button
                variant={action.variant}
                className="w-full h-auto flex flex-col items-center gap-2 p-4"
              >
                <action.icon className="h-5 w-5" />
                <div className="text-center">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                    {action.description}
                  </p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

