"use client";

import { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPasswordChangeForm } from "@/components/admin/admin-password-change-form";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "localization" | "payments" | "shipping" | "security">("general");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "security" || tab === "general" || tab === "localization" || tab === "payments" || tab === "shipping") {
        setActiveTab(tab);
      }
    }
  }, []);
  const [storeName, setStoreName] = useState("ELARIS");
  const [tagline, setTagline] = useState("More Than Clothing. Wear Your Story.");
  const [supportEmail, setSupportEmail] = useState("support@elaris.com");
  const [supportPhone, setSupportPhone] = useState("+880 1712-345678");
  const [address, setAddress] = useState("House 12, Road 4, Gulshan-2, Dhaka-1212, Bangladesh");
  const [freeShippingMin, setFreeShippingMin] = useState(3000);
  const [insideDhakaFee, setInsideDhakaFee] = useState(80);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState(150);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              Production
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure store identity, Bangladeshi localization, payment gateways, courier APIs, and security
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <CheckCircle2 size={14} /> Changes Saved!
            </span>
          )}
          <Button onClick={handleSave} className="text-xs font-bold h-8">
            <Save size={14} /> Save Configuration
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        {[
          { id: "general", label: "General Store Info", icon: Store },
          { id: "localization", label: "Localization & Currency", icon: Globe },
          { id: "payments", label: "Payment Gateways", icon: CreditCard },
          { id: "shipping", label: "Couriers & Delivery", icon: Truck },
          { id: "security", label: "Security & 2FA", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition ${
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

      {/* Tab Panels */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Brand Profile
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Brand / Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Official Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Support Phone (BD)</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Flagship Studio &amp; Warehouse Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "localization" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Regional &amp; Localization Configuration
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <span className="text-muted-foreground">Default Store Currency</span>
                <p className="mt-1 text-base font-bold text-foreground">BDT (৳ Bangladeshi Taka)</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Symbol: ৳ (Formatted as ৳2,490)</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <span className="text-muted-foreground">Store Timezone</span>
                <p className="mt-1 text-base font-bold text-foreground">Asia/Dhaka (GMT+6)</p>
                <p className="mt-1 text-[11px] text-muted-foreground">All analytics and order timestamps in BST</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <span className="text-muted-foreground">Primary Country / Market</span>
                <p className="mt-1 text-base font-bold text-foreground">Bangladesh (BD)</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Delivery available across all 64 districts</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <span className="text-muted-foreground">Weight &amp; Measurement Units</span>
                <p className="mt-1 text-base font-bold text-foreground">Metric (Grams / Kilograms, Inches)</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Standard garment sizing S/M/L/XL/XXL</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Payment Gateways &amp; Merchant Accounts
            </h2>

            <div className="space-y-3">
              {[
                { name: "bKash Direct Merchant API", status: "Connected", fee: "1.5% processing fee", active: true },
                { name: "Nagad Online Payment Gateway", status: "Connected", fee: "1.2% processing fee", active: true },
                { name: "SSLCOMMERZ (Visa, Mastercard, Amex, Internet Banking)", status: "Active", fee: "2.0% processing fee", active: true },
                { name: "Cash on Delivery (COD)", status: "Enabled", fee: "৳0 fee (৳100 advance deposit)", active: true },
              ].map((gw) => (
                <div key={gw.name} className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-xs">{gw.name}</span>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {gw.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{gw.fee}</p>
                  </div>
                  <input type="checkbox" defaultChecked={gw.active} className="h-4 w-4 rounded accent-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "shipping" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Nationwide Delivery &amp; Shipping Rates
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Inside Dhaka Fee (৳)</label>
                <input
                  type="number"
                  value={insideDhakaFee}
                  onChange={(e) => setInsideDhakaFee(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Outside Dhaka Fee (৳)</label>
                <input
                  type="number"
                  value={outsideDhakaFee}
                  onChange={(e) => setOutsideDhakaFee(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Free Delivery Min Spend (৳)</label>
                <input
                  type="number"
                  value={freeShippingMin}
                  onChange={(e) => setFreeShippingMin(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-foreground mb-3">Automated Courier Integrations</h3>
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-border p-3.5 bg-muted/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-foreground">Pathao Courier API</span>
                    <p className="text-[11px] text-muted-foreground">Auto-generate parcel tracking code</p>
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Live</span>
                </div>
                <div className="rounded-xl border border-border p-3.5 bg-muted/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-foreground">Steadfast Courier API</span>
                    <p className="text-[11px] text-muted-foreground">Automated pickup dispatch request</p>
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6">
          <AdminPasswordChangeForm />

          <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Security Clearance &amp; Session Management
            </h2>

            <div className="space-y-3 divide-y divide-border/60 text-xs">
              <div className="pt-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">Enforce Two-Factor Authentication (2FA)</p>
                  <p className="text-muted-foreground text-[11px]">Require TOTP authenticator code for all admin logins</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-foreground" />
              </div>

              <div className="pt-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">Automatic Session Inactivity Timeout</p>
                  <p className="text-muted-foreground text-[11px]">Lock admin dashboard screen after 30 minutes of inactivity</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-foreground" />
              </div>

              <div className="pt-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">IP Geolocation Whitelisting</p>
                  <p className="text-muted-foreground text-[11px]">Alert on administrative logins outside Bangladesh</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-foreground" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
