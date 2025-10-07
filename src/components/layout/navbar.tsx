import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { Navigation } from "./navigation";

export const Navbar = () => {
  return (
    <>
      <div className="m-4 flex items-center justify-start gap-4">
        <SidebarTrigger />
        <Separator orientation="vertical" />
        <Navigation />
      </div>
      <Separator />
    </>
  );
};
