import { CheckCircle2, Circle } from "lucide-react";
import { orderTimeline } from "@/features/orders/state-machine";

type TrackPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function TrackPage({ params }: TrackPageProps) {
  const { orderNumber } = await params;
  const activeIndex = 2;

  return (
    <div className="container-shell max-w-3xl py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Order tracking
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{orderNumber}</h1>
      <div className="mt-8 rounded-lg border border-border p-6">
        {orderTimeline.map((status, index) => {
          const complete = index <= activeIndex;
          const Icon = complete ? CheckCircle2 : Circle;
          return (
            <div key={status} className="flex gap-4 pb-6 last:pb-0">
              <Icon
                aria-hidden="true"
                className={complete ? "text-success" : "text-muted-foreground"}
                size={22}
              />
              <div>
                <p className="font-medium">{status.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Timeline timestamps will come from `OrderStatusHistory`.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

