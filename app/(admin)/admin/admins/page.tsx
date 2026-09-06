"use client";

import { useState } from "react";
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  CheckCircle2,
  Trash2,
  Edit,
  X,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "STORE_MANAGER" | "SUPPORT_AGENT";
  lastActive: string;
  twoFactor: boolean;
};

const initialStaff: StaffMember[] = [
  {
    id: "s1",
    name: "Md. Ismail Hossain",
    email: "ismail@elaris.com",
    role: "SUPER_ADMIN",
    lastActive: "Active Now",
    twoFactor: true
  },
  {
    id: "s2",
    name: "Tanvir Ahmed",
    email: "tanvir.fulfillment@elaris.com",
    role: "STORE_MANAGER",
    lastActive: "15 mins ago",
    twoFactor: true
  },
  {
    id: "s3",
    name: "Farhana Rahman",
    email: "farhana.support@elaris.com",
    role: "SUPPORT_AGENT",
    lastActive: "2 hours ago",
    twoFactor: true
  },
  {
    id: "s4",
    name: "Sadia Islam",
    email: "sadia.content@elaris.com",
    role: "STORE_MANAGER",
    lastActive: "Yesterday",
    twoFactor: true
  }
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffMember["role"]>("STORE_MANAGER");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const newMember: StaffMember = {
      id: `s_${Date.now()}`,
      name: name.trim() || email.split("@")[0],
      email: email.trim(),
      role,
      lastActive: "Invited (Pending)",
      twoFactor: false
    };

    setStaff((prev) => [...prev, newMember]);
    setName("");
    setEmail("");
    setShowInviteModal(false);
  };

  const handleRemove = (id: string, memberName: string) => {
    if (confirm(`Revoke admin privileges for "${memberName}"?`)) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Staff &amp; Administrators
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {staff.length} Active Staff
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage administrative team members, access privileges, role hierarchy, and 2FA authentication
          </p>
        </div>

        <Button onClick={() => setShowInviteModal(true)} className="text-xs h-8">
          <UserPlus size={14} /> Invite Staff Member
        </Button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Staff Accounts</p>
          <p className="mt-2 text-2xl font-black text-foreground">{staff.length}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Authorized team members</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Super Administrators</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">
              {staff.filter((s) => s.role === "SUPER_ADMIN").length}
            </span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              Full Access
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Highest clearance level</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Store Managers</p>
          <p className="mt-2 text-2xl font-black text-foreground">
            {staff.filter((s) => s.role === "STORE_MANAGER").length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Catalog &amp; orders operations</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">2FA Enforcement</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">100%</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Secured
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Hardware / App 2FA enabled</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role &amp; Permissions</th>
                <th className="py-3 px-4 text-center">2FA Security</th>
                <th className="py-3 px-4 text-right">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {staff.map((s) => {
                const isSuper = s.role === "SUPER_ADMIN";
                const isManager = s.role === "STORE_MANAGER";

                return (
                  <tr key={s.id} className="hover:bg-muted/20 transition">
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background font-bold text-xs">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-mono">
                      {s.email}
                    </td>
                    <td className="py-3.5 px-4">
                      {isSuper ? (
                        <span className="inline-block rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          SUPER ADMIN
                        </span>
                      ) : isManager ? (
                        <span className="inline-block rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          STORE MANAGER
                        </span>
                      ) : (
                        <span className="inline-block rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                          SUPPORT AGENT
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <ShieldCheck size={13} /> Enabled
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-muted-foreground">
                      {s.lastActive}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isSuper && (
                        <button
                          type="button"
                          onClick={() => handleRemove(s.id, s.name)}
                          className="rounded border border-border p-1 text-muted-foreground hover:text-rose-600 hover:border-rose-200 transition"
                          title="Revoke Access"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">Invite Staff Member</h2>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@elaris.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="STORE_MANAGER">Store Manager (Products, Orders, Offers)</option>
                  <option value="SUPPORT_AGENT">Support Agent (Orders, Reviews, Customers)</option>
                  <option value="SUPER_ADMIN">Super Administrator (Full System Control)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <Button type="submit" className="text-xs font-bold">
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
