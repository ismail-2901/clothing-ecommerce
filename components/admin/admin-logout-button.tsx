"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition text-left cursor-pointer"
    >
      {loading ? <Spinner size="sm" /> : <LogOut size={16} />}
      <span>Lock Admin</span>
    </button>
  );
}
