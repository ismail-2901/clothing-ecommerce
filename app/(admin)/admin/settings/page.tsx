export const dynamic = "force-dynamic";

import { storeConfig } from "@/config/store";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Store, CreditCard, Mail, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  const codEnabled = process.env.PAYMENT_COD_ENABLED === "true";
  const sslcommerzEnabled = !!process.env.SSLCOMMERZ_STORE_ID;
  const bkashEnabled = !!process.env.BKASH_APP_KEY;
  const nagadEnabled = !!process.env.NAGAD_MERCHANT_ID;
  const emailProvider = process.env.EMAIL_PROVIDER || "Console/Mock";
  const cloudinaryEnabled = !!process.env.CLOUDINARY_CLOUD_NAME;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">System</p>
        <h1 className="mt-2 text-3xl font-semibold">Store Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform configurations, payment channels, security credentials, and integrations
        </p>
      </div>

      {/* Store Identity */}
      <section className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-center gap-3">
          <Store size={20} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold">General Store Profile</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Store Name</p>
            <p className="mt-1 font-medium">{storeConfig.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Default Currency</p>
            <p className="mt-1 font-medium">{storeConfig.currency} (৳ Bangladeshi Taka)</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Locale</p>
            <p className="mt-1 font-medium">en-BD</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Order ID Prefix</p>
            <p className="mt-1 font-mono font-medium">ORD-</p>
          </div>
        </div>
      </section>

      {/* Payment Gateways */}
      <section className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-center gap-3">
          <CreditCard size={20} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold">Payment Gateways & Methods</h2>
        </div>
        <div className="mt-5 divide-y divide-border">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Cash on Delivery (COD)</p>
              <p className="text-xs text-muted-foreground">Pay cash upon parcel delivery across Bangladesh</p>
            </div>
            <Badge variant={codEnabled ? "success" : "danger"}>
              {codEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">bKash Merchant Checkout</p>
              <p className="text-xs text-muted-foreground">Direct mobile payment via bKash payment gateway</p>
            </div>
            <Badge variant={bkashEnabled ? "success" : "muted"}>
              {bkashEnabled ? "Connected" : "Not configured"}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">SSLCommerz Hosted Payment</p>
              <p className="text-xs text-muted-foreground">Visa, MasterCard, Amex, and internet banking</p>
            </div>
            <Badge variant={sslcommerzEnabled ? "success" : "muted"}>
              {sslcommerzEnabled ? "Connected" : "Not configured"}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Nagad Gateway</p>
              <p className="text-xs text-muted-foreground">Postal department digital wallet checkout</p>
            </div>
            <Badge variant={nagadEnabled ? "success" : "muted"}>
              {nagadEnabled ? "Connected" : "Not configured"}
            </Badge>
          </div>
        </div>
      </section>

      {/* Security & Access */}
      <section className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold">Admin Authentication & Security</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Admin Session Protection</p>
            <p className="mt-1 font-medium">Encrypted HMAC-SHA256 Cookie</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lock Screen Status</p>
            <p className="mt-1 font-medium">Active (Protected by master password)</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Session Expiration</p>
            <p className="mt-1 font-medium">30 days rolling</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cloudinary Media Storage</p>
            <Badge variant={cloudinaryEnabled ? "success" : "warning"} className="mt-1">
              {cloudinaryEnabled ? "Cloudinary Connected" : "Local Storage"}
            </Badge>
          </div>
        </div>
      </section>

      {/* Email Services */}
      <section className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-center gap-3">
          <Mail size={20} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold">Notification & Email Service</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Email Provider</p>
            <p className="mt-1 font-medium capitalize">{emailProvider}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sender Identity</p>
            <p className="mt-1 font-medium">{process.env.EMAIL_FROM || "Elaris Store"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
