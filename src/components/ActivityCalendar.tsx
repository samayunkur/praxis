"use client";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Props {
  logs: { doneAt: string | Date }[];
  days?: number;
}

export default function ActivityCalendar({ logs, days = 365 }: Props) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of logs) {
      const d = new Date(log.doneAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }

    const cells: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      cells.push({ date: key, count: counts[key] ?? 0 });
    }
    return cells;
  }, [logs, days]);

  const color = (count: number) => {
    if (count === 0) return "bg-gray-800";
    if (count === 1) return "bg-blue-900";
    if (count === 2) return "bg-blue-700";
    if (count === 3) return "bg-blue-500";
    return "bg-blue-400";
  };

  // Group by week (columns)
  const weeks: typeof data[] = [];
  let week: typeof data = [];
  // Pad start
  const startDay = new Date(data[0]?.date ?? new Date()).getDay();
  for (let i = 0; i < startDay; i++) week.push({ date: "", count: 0 });
  for (const cell of data) {
    week.push(cell);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) weeks.push(week);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {w.map((cell, di) => (
              <div
                key={di}
                title={cell.date ? `${cell.date}: ${cell.count} actions` : ""}
                className={cn("w-3 h-3 rounded-sm", cell.date ? color(cell.count) : "bg-transparent")}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <div key={n} className={cn("w-3 h-3 rounded-sm", color(n))} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
