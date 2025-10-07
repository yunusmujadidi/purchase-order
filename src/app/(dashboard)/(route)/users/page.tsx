"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const UsersPage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage users and permissions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      <div className="bg-white rounded-lg border p-8 text-center text-muted-foreground">
        User management coming soon...
      </div>
    </div>
  );
};

export default UsersPage;
