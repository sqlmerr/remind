"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const auth = useAuth();

  const handleLogout = () => {
    auth.onLogout!();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="border-gray-300 dark:border-gray-700"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
}
