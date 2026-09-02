export const dashboardMetrics = [
  {
    label: "Revenue",
    value: 12845000,
    currency: true,
    kind: "revenue",
    hint: "From confirmed and delivered orders"
  },
  {
    label: "Orders",
    value: 248,
    currency: false,
    kind: "orders",
    hint: "Current operational period"
  },
  {
    label: "Active customers",
    value: 117,
    currency: false,
    kind: "customers",
    hint: "Customers with recent activity"
  },
  {
    label: "Risk reviews",
    value: 9,
    currency: false,
    kind: "risk",
    hint: "Orders requiring manual review"
  }
] as const;

