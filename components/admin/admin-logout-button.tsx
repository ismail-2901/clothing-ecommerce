"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "@/lib/auth/client";

export function AdminLogoutButton({ compact = false }: { compact?: boolean } = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await signOut();
      await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
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
      title={compact ? "Lock Admin" : undefined}
      aria-label="Lock Admin"
      className={
        compact
          ? "flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger/10 transition cursor-pointer mx-auto"
          : "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition text-left cursor-pointer"
      }
    >
      {loading ? <Spinner size="sm" /> : <LogOut size={16} />}
      {!compact && <span>Lock Admin</span>}
    </button>
  );
}
