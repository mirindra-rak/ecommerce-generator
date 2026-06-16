"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

const VALUES = [847, 1243, 621, 1876, 2341, 2150, 1023];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function CustomTooltip({
  active,
  payload,
  label,
  locale,
}: TooltipProps<number, string> & { locale: string }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  if (!entry) return null;
  const val =
    typeof entry.value === "number"
      ? entry.value.toLocaleString(locale)
      : String(entry.value ?? "");
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-line)",
        borderRadius: "var(--radius-sm)",
        padding: "8px 12px",
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      <p style={{ color: "var(--color-muted)", marginBottom: 2 }}>{label}</p>
      <p style={{ color: "var(--color-foreground)", fontWeight: 600 }}>{val} €</p>
    </div>
  );
}

export function WeeklyChart() {
  const t = useTranslations("admin.dashboard.chart");
  const locale = useLocale();

  const data = DAY_KEYS.map((key, i) => ({ day: t(key), ca: VALUES[i] }));

  return (
    <div className="rounded-sm border border-line bg-surface p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{t("title")}</p>
          <p className="mt-0.5 text-xs text-muted">{t("subtitle")}</p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
          {t("thisWeek")}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-brand-600)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="var(--color-brand-600)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "var(--color-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}€`}
            width={52}
          />
          <Tooltip
            content={<CustomTooltip locale={locale} />}
            cursor={{ stroke: "var(--color-line)" }}
          />
          <Area
            type="monotone"
            dataKey="ca"
            stroke="var(--color-brand-600)"
            strokeWidth={2}
            fill="url(#caGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-brand-600)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
