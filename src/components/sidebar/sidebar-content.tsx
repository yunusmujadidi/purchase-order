"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarContent as SidebarContentUI,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navigation } from "@/lib/const";

export const SidebarContent = () => {
  // get url pathname
  const path = usePathname();
  const route = navigation.map((item) => ({
    ...item,
    isActive: item.url === path,
  }));
  return (
    <SidebarContentUI>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {route.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton isActive={item.isActive} asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContentUI>
  );
};
