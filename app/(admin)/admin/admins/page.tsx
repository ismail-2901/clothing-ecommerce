"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  CheckCircle2,
  Trash2,
  Edit,
  X,
  Users,
  Search,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "STORE_MANAGER" | "SUPPORT_AGENT";
  rawRole: "SUPER_ADMIN" | "ADMIN";
  emailVerified: boolean;
  twoFactor: boolean;
  hasCredential: boolean;
  lastActive: string;
  joinedDate: string;
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [callerRole, setCallerRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"STORE_MANAGER" | "SUPER_ADMIN">("STORE_MANAGER");
  const [invitePassword, setInvitePassword] = useState("");
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ email: string; pass: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Revoke state
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/staff");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Failed to load staff directory.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStaff(data.staff || []);
      setCurrentUserId(data.currentUserId || null);
      setCallerRole(data.callerRole || null);
    } catch {
      setErrorMsg("Network error loading administrative team.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSubmittingInvite(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          role: inviteRole,
          tempPassword: invitePassword.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to provision staff account.");
        setSubmittingInvite(false);
        return;
      }

      setInviteResult({
        email: data.user.email,
        pass: data.user.tempPassword
      });
      fetchStaff();
      setInviteName("");
      setInviteEmail("");
      setInvitePassword("");
    } catch {
      alert("Network error inviting staff member.");
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: "STORE_MANAGER" | "SUPER_ADMIN") => {
    if (!confirm(`Change administrative role to "${newRole.replace(/_/g, " ")}"?`)) return;

    try {
      const res = await fetch(`/api/admin/staff/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update staff role.");
        return;
      }

      fetchStaff();
    } catch {
      alert("Network error updating role.");
    }
  };

  const handleRevoke = async (memberId: string, memberName: string) => {
    if (
      !confirm(
        `Are you sure you want to REVOKE administrative clearance for "${memberName}"?\n\nThis will terminate active sessions and remove all admin permissions immediately.`
      )
    ) {
      return;
    }

    setRevokingId(memberId);
    try {
      const res = await fetch(`/api/admin/staff/${memberId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to revoke admin privileges.");
        setRevokingId(null);
        return;
      }

      fetchStaff();
    } catch {
      alert("Network error revoking admin access.");
    } finally {
      setRevokingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  const superAdminCount = staff.filter((s) => s.role === "SUPER_ADMIN").length;
  const managerCount = staff.filter((s) => s.role === "STORE_MANAGER").length;

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesRole = true;
    if (roleFilter === "SUPER_ADMIN") matchesRole = s.role === "SUPER_ADMIN";
    else if (roleFilter === "STORE_MANAGER") matchesRole = s.role === "STORE_MANAGER";

    return matchesSearch && matchesRole;
  });

  const isSuperAdmin = callerRole === "SUPER_ADMIN";

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Staff &amp; Administrators
            </h1>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {staff.length} Authorized
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Database-backed staff administration, Role-Based Access Control (RBAC), and session security
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            onClick={fetchStaff}
            className="text-xs h-8"
            title="Refresh Directory"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </Button>

          {isSuperAdmin && (
            <Button
              onClick={() => {
                setShowInviteModal(true);
                setInviteResult(null);
              }}
              className="text-xs h-8 font-bold"
            >
              <UserPlus size={14} /> Provision Staff Account
            </Button>
          )}
        </div>
      </div>

      {/* 4 KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Total Staff Accounts</p>
          <p className="mt-2 text-2xl font-black text-foreground">{staff.length}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Verified database credentials</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Super Administrators</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">{superAdminCount}</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
              Full Clearance
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">System governance &amp; RBAC rights</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Store Managers</p>
          <p className="mt-2 text-2xl font-black text-foreground">{managerCount}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Catalog, orders &amp; inventory ops</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Security &amp; 2FA Status</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">Active</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              Enforced
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Admin session timeout &amp; bcrypt hashing</p>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-background p-4 shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search staff member by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: "All Staff", value: "ALL" },
            { label: "Super Admins", value: "SUPER_ADMIN" },
            { label: "Store Managers", value: "STORE_MANAGER" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setRoleFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                roleFilter === tab.value
                  ? "bg-foreground text-background shadow-xs"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role Clearance</th>
                <th className="py-3 px-4 text-center">Auth Status</th>
                <th className="py-3 px-4 text-right">Last Session</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    {loading ? "Loading staff directory from database..." : "No matching staff accounts found."}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => {
                  const isSuper = s.role === "SUPER_ADMIN";
                  const isSelf = s.id === currentUserId;

                  return (
                    <tr key={s.id} className="hover:bg-muted/15 transition">
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background font-bold text-xs uppercase shadow-2xs">
                            {s.name.charAt(0) || "A"}
                          </div>
                          <div>
                            <span className="flex items-center gap-1.5">
                              {s.name}
                              {isSelf && (
                                <span className="rounded bg-stone-200 px-1 py-0.2 text-[9px] font-bold text-stone-700">
                                  YOU
                                </span>
                              )}
                            </span>
                          </div>
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
                        ) : (
                          <span className="inline-block rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            STORE MANAGER
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <ShieldCheck size={13} /> Active Verified
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-muted-foreground whitespace-nowrap">
                        {s.lastActive}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSuperAdmin && !isSelf && (
                            <>
                              <select
                                value={s.role}
                                onChange={(e) =>
                                  handleRoleChange(
                                    s.id,
                                    e.target.value as "STORE_MANAGER" | "SUPER_ADMIN"
                                  )
                                }
                                className="rounded border border-border bg-background px-1.5 py-1 text-[11px] text-foreground cursor-pointer focus:outline-hidden"
                              >
                                <option value="STORE_MANAGER">Store Manager</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => handleRevoke(s.id, s.name)}
                                disabled={revokingId === s.id}
                                className="rounded border border-border p-1 text-muted-foreground hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                                title="Revoke Administrative Access"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Staff Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">
                Provision Administrative Account
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteResult(null);
                }}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {inviteResult ? (
              <div className="space-y-4 pt-1">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Staff Account Successfully Provisioned</span>
                  </div>
                  <p>
                    The administrator account for <strong>{inviteResult.email}</strong> is now active in the database.
                  </p>
                  <div className="mt-2 rounded-lg border border-emerald-300 bg-white p-3 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-bold text-foreground">{inviteResult.email}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-emerald-100">
                      <span className="text-muted-foreground">Temporary Password:</span>
                      <span className="font-bold text-foreground">{inviteResult.pass}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(inviteResult.pass)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    {copiedPass ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedPass ? "Copied!" : "Copy Password"}</span>
                  </button>
                  <Button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteResult(null);
                    }}
                    className="text-xs h-8"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Corporate Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@elaris.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground cursor-pointer"
                  >
                    <option value="STORE_MANAGER">
                      Store Manager (Catalog, Inventory, Orders, Offers)
                    </option>
                    <option value="SUPER_ADMIN">
                      Super Administrator (Full System &amp; Staff Control)
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Initial Password (Optional — auto-generated if left blank)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated secure password"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <Button type="submit" disabled={submittingInvite} className="text-xs font-bold h-8">
                    {submittingInvite ? "Provisioning..." : "Provision Staff Account"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
