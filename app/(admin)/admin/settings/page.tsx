"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Store,
  Globe,
  CreditCard,
  Truck,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Building,
  Mail,
  Phone,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPasswordChangeForm } from "@/components/admin/admin-password-change-form";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "localization" | "payments" | "shipping" | "security"
  >("general");

  // Form State
  const [storeName, setStoreName] = useState("ELARIS");
  const [tagline, setTagline] = useState("More Than Clothing. Wear Your Story.");
  const [supportEmail, setSupportEmail] = useState("support@elarisstore.com");
  const [supportPhone, setSupportPhone] = useState("+880 1712-345678");
  const [address, setAddress] = useState("House 12, Road 4, Gulshan-2, Dhaka-1212, Bangladesh");
  const [freeShippingMin, setFreeShippingMin] = useState(3000);
  const [insideDhakaFee, setInsideDhakaFee] = useState(80);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState(150);

  // Security Toggles
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState(30);
  const [ipWhitelisting, setIpWhitelisting] = useState(true);

  // Payment Toggles
  const [bkashActive, setBkashActive] = useState(true);
  const [nagadActive, setNagadActive] = useState(true);
  const [sslcommerzActive, setSslcommerzActive] = useState(true);
  const [codActive, setCodActive] = useState(true);

  // Synchronization & State
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessAt, setSaveSuccessAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [concurrencyConflict, setConcurrencyConflict] = useState<string | null>(null);

  // Sync tab with URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (
        tab === "security" ||
        tab === "general" ||
        tab === "localization" ||
        tab === "payments" ||
        tab === "shipping"
      ) {
        setActiveTab(tab);
      }
    }
  }, []);

  // Fetch settings directly from the server database (source of truth)
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    setConcurrencyConflict(null);

    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Failed to load store settings from server.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.settings) {
        const s = data.settings;
        if (s.storeName !== undefined) setStoreName(s.storeName);
        if (s.tagline !== undefined) setTagline(s.tagline);
        if (s.supportEmail !== undefined) setSupportEmail(s.supportEmail);
        if (s.supportPhone !== undefined) setSupportPhone(s.supportPhone);
        if (s.address !== undefined) setAddress(s.address);
        if (s.freeShippingMin !== undefined) setFreeShippingMin(Number(s.freeShippingMin));
        if (s.insideDhakaFee !== undefined) setInsideDhakaFee(Number(s.insideDhakaFee));
        if (s.outsideDhakaFee !== undefined) setOutsideDhakaFee(Number(s.outsideDhakaFee));

        if (s.payments) {
          if (s.payments.bkash !== undefined) setBkashActive(Boolean(s.payments.bkash));
          if (s.payments.nagad !== undefined) setNagadActive(Boolean(s.payments.nagad));
          if (s.payments.sslcommerz !== undefined) setSslcommerzActive(Boolean(s.payments.sslcommerz));
          if (s.payments.cod !== undefined) setCodActive(Boolean(s.payments.cod));
        }

        if (s.security) {
          if (s.security.enforce2FA !== undefined) setEnforce2FA(Boolean(s.security.enforce2FA));
          if (s.security.sessionTimeoutMins !== undefined)
            setSessionTimeoutMins(Number(s.security.sessionTimeoutMins));
          if (s.security.ipWhitelisting !== undefined)
            setIpWhitelisting(Boolean(s.security.ipWhitelisting));
        }
      }

      if (data.updatedAt) {
        setLastUpdatedAt(data.updatedAt);
      }
    } catch {
      setErrorMessage("Network connection error loading settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (force = false) => {
    // Form Validation
    if (!storeName.trim()) {
      setErrorMessage("Brand / Store Name cannot be empty.");
      return;
    }
    if (supportEmail && !supportEmail.includes("@")) {
      setErrorMessage("Please enter a valid support email address.");
      return;
    }
    if (isNaN(insideDhakaFee) || insideDhakaFee < 0) {
      setErrorMessage("Inside Dhaka delivery fee must be a valid non-negative number.");
      return;
    }
    if (isNaN(outsideDhakaFee) || outsideDhakaFee < 0) {
      setErrorMessage("Outside Dhaka delivery fee must be a valid non-negative number.");
      return;
    }
    if (isNaN(freeShippingMin) || freeShippingMin < 0) {
      setErrorMessage("Free delivery minimum spend must be a valid non-negative number.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setConcurrencyConflict(null);

    const payload = {
      storeName: storeName.trim(),
      tagline: tagline.trim(),
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      address: address.trim(),
      freeShippingMin,
      insideDhakaFee,
      outsideDhakaFee,
      payments: {
        bkash: bkashActive,
        nagad: nagadActive,
        sslcommerz: sslcommerzActive,
        cod: codActive
      },
      security: {
        enforce2FA,
        sessionTimeoutMins,
        ipWhitelisting
      }
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: payload,
          lastUpdatedAt: lastUpdatedAt ?? undefined,
          force
        })
      });

      const data = await res.json();

      if (res.status === 409 && data.conflict) {
        setConcurrencyConflict(data.serverUpdatedAt);
        setSaving(false);
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to save configuration.");
        setSaving(false);
        return;
      }

      if (data.updatedAt) {
        setLastUpdatedAt(data.updatedAt);
      }

      const timeStr = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      setSaveSuccessAt(timeStr);
      setTimeout(() => setSaveSuccessAt(null), 4000);
    } catch {
      setErrorMessage("Network connection failure while committing settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Store Settings
            </h1>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              Database Sync
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure store identity, Bangladeshi localization, payment gateways, delivery thresholds, and security
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="text-xs h-8"
            title="Reload from Database"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </Button>

          {saveSuccessAt && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold animate-in fade-in">
              <CheckCircle2 size={14} /> Saved at {saveSuccessAt}
            </span>
          )}

          <Button
            onClick={() => handleSave(false)}
            disabled={saving || loading}
            className="text-xs font-bold h-8"
          >
            <Save size={14} /> {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      {/* Concurrency Conflict Banner */}
      {concurrencyConflict && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert size={16} className="text-rose-600 shrink-0" />
            <span>Concurrent Administrator Modification Detected</span>
          </div>
          <p>
            Another administrator updated store configuration at{" "}
            {new Date(concurrencyConflict).toLocaleTimeString()}. Overwriting now would replace their recent changes.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSettings}
              className="rounded-lg bg-foreground px-3 py-1.5 font-bold text-background hover:bg-foreground/90 transition text-xs"
            >
              Reload Latest Server Settings
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-bold text-rose-800 hover:bg-rose-100 transition text-xs"
            >
              Force Overwrite Anyway
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: "general", label: "General Store Info", icon: Store },
          { id: "localization", label: "Localization & Currency", icon: Globe },
          { id: "payments", label: "Payment Gateways", icon: CreditCard },
          { id: "shipping", label: "Couriers & Delivery", icon: Truck },
          { id: "security", label: "Security & 2FA", icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition cursor-pointer ${
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading && !concurrencyConflict && (
        <div className="rounded-xl border border-border bg-background p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-3">
          <RefreshCw size={24} className="animate-spin text-muted-foreground" />
          <p>Synchronizing store configuration from database...</p>
        </div>
      )}

      {/* General Store Info */}
      {!loading && activeTab === "general" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Brand Profile
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Brand / Store Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Official Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Support Email</label>
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Support Phone (BD)</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Flagship Studio &amp; Warehouse Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Localization */}
      {!loading && activeTab === "localization" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Regional &amp; Localization Configuration
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-border bg-muted/15 p-4">
                <span className="text-muted-foreground">Default Store Currency</span>
                <p className="mt-1 text-base font-bold text-foreground">BDT (৳ Bangladeshi Taka)</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Symbol: ৳ (Formatted in BDT locale)</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/15 p-4">
                <span className="text-muted-foreground">Store Timezone</span>
                <p className="mt-1 text-base font-bold text-foreground">Asia/Dhaka (GMT+6 BST)</p>
                <p className="mt-1 text-[11px] text-muted-foreground">All risk assessments and orders in BST</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/15 p-4">
                <span className="text-muted-foreground">Primary Country / Market</span>
                <p className="mt-1 text-base font-bold text-foreground">Bangladesh (BD)</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Delivery supported across 64 districts</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/15 p-4">
                <span className="text-muted-foreground">Measurement &amp; Sizing Standard</span>
                <p className="mt-1 text-base font-bold text-foreground">Metric (Grams, Inches)</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Standard apparel sizing S/M/L/XL/XXL</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateways */}
      {!loading && activeTab === "payments" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Payment Gateways &amp; Merchant Accounts
            </h2>

            <div className="space-y-3">
              {[
                {
                  id: "bkash",
                  name: "bKash Direct Merchant Gateway",
                  status: bkashActive ? "Active" : "Disabled",
                  fee: "1.5% merchant processing fee",
                  active: bkashActive,
                  setter: setBkashActive
                },
                {
                  id: "nagad",
                  name: "Nagad Online Payment Gateway",
                  status: nagadActive ? "Active" : "Disabled",
                  fee: "1.2% merchant processing fee",
                  active: nagadActive,
                  setter: setNagadActive
                },
                {
                  id: "sslcommerz",
                  name: "SSLCOMMERZ (Visa, Mastercard, Amex, Internet Banking)",
                  status: sslcommerzActive ? "Active" : "Disabled",
                  fee: "2.0% merchant processing fee",
                  active: sslcommerzActive,
                  setter: setSslcommerzActive
                },
                {
                  id: "cod",
                  name: "Cash on Delivery (COD)",
                  status: codActive ? "Active" : "Disabled",
                  fee: "৳0 fee (Requires valid BD contact phone)",
                  active: codActive,
                  setter: setCodActive
                }
              ].map((gw) => (
                <div
                  key={gw.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/10"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-xs">{gw.name}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                          gw.active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-600 border-stone-200"
                        }`}
                      >
                        {gw.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{gw.fee}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={gw.active}
                    onChange={(e) => gw.setter(e.target.checked)}
                    aria-label={`Toggle ${gw.name}`}
                    className="h-4 w-4 rounded accent-foreground cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Couriers & Delivery */}
      {!loading && activeTab === "shipping" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Nationwide Delivery &amp; Shipping Rates
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Inside Dhaka Fee (৳)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={insideDhakaFee}
                  onChange={(e) => setInsideDhakaFee(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Outside Dhaka Fee (৳)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={outsideDhakaFee}
                  onChange={(e) => setOutsideDhakaFee(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Free Delivery Min Spend (৳)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={freeShippingMin}
                  onChange={(e) => setFreeShippingMin(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-foreground mb-3">Courier Logistics Integrations</h3>
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-border p-3.5 bg-muted/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-foreground">Pathao Courier API</span>
                    <p className="text-[11px] text-muted-foreground">Automated consignment generation</p>
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>

                <div className="rounded-xl border border-border p-3.5 bg-muted/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-foreground">Steadfast Courier API</span>
                    <p className="text-[11px] text-muted-foreground">Automated pickup dispatch request</p>
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security & 2FA */}
      {!loading && activeTab === "security" && (
        <div className="space-y-6">
          <AdminPasswordChangeForm />

          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Security Clearance &amp; Session Management
            </h2>

            <div className="space-y-3 divide-y divide-border/60 text-xs">
              <div className="pt-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">Enforce Two-Factor Authentication (2FA)</p>
                  <p className="text-muted-foreground text-[11px]">
                    Require multi-factor TOTP verification for all staff sign-ins
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enforce2FA}
                  onChange={(e) => setEnforce2FA(e.target.checked)}
                  aria-label="Enforce Two-Factor Authentication"
                  className="h-4 w-4 rounded accent-foreground cursor-pointer"
                />
              </div>

              <div className="pt-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">Automatic Session Inactivity Timeout</p>
                  <p className="text-muted-foreground text-[11px]">
                    Lock administrative screen after {sessionTimeoutMins} minutes of inactivity
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={sessionTimeoutMins > 0}
                  onChange={(e) => setSessionTimeoutMins(e.target.checked ? 30 : 0)}
                  aria-label="Automatic Session Inactivity Timeout"
                  className="h-4 w-4 rounded accent-foreground cursor-pointer"
                />
              </div>

              <div className="pt-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">IP Geolocation Alerting</p>
                  <p className="text-muted-foreground text-[11px]">
                    Log security alerts for administrative logins originating outside Bangladesh
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={ipWhitelisting}
                  onChange={(e) => setIpWhitelisting(e.target.checked)}
                  aria-label="IP Geolocation Whitelisting"
                  className="h-4 w-4 rounded accent-foreground cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
