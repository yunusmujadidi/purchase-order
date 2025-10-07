"use client";

import { Loader2, LogOut, MoreVertical } from "lucide-react";
import { useTheme } from "next-themes";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter as SidebarFooterUI,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export const SidebarFooter = () => {
  // get theme and setTheme from hooks
  const { setTheme, theme } = useTheme();
  const isMobile = useIsMobile();

  const router = useRouter();
  const { data } = useSession();
  return (
    <SidebarFooterUI>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  {data?.user.image ? (
                    <AvatarImage src={data?.user.image} alt={data?.user.name} />
                  ) : (
                    <AvatarFallback className="rounded-lg">U</AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {data ? (
                    <>
                      <span className="truncate font-medium">
                        {data?.user.name}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {data?.user.email}
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center justify-center ">
                      <Loader2 className="animate-spin" />
                    </div>
                  )}
                </div>
                <MoreVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg grayscale">
                    {data?.user.image ? (
                      <AvatarImage
                        src={data?.user.image}
                        alt={data?.user.name}
                      />
                    ) : (
                      <AvatarFallback className="rounded-lg">U</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    {data ? (
                      <>
                        <span className="truncate font-medium">
                          {data?.user.name}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          {data?.user.email}
                        </span>
                      </>
                    ) : (
                      <div className="flex items-center justify-center ">
                        <Loader2 className="animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* app theme */}
              <DropdownMenuLabel>App Theme</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                className="cursor-pointer"
                checked={theme === "light"}
                onClick={() => setTheme("light")}
              >
                Light
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                className="cursor-pointer"
                checked={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                Dark
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                className="cursor-pointer"
                checked={theme === "system"}
                onClick={() => setTheme("system")}
              >
                System
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push("/login");
                      },
                    },
                  })
                }
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooterUI>
  );
};
