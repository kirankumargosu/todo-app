import { useState } from "react";

type Week = {
  from: string;
  to: string;
  grammar: string[];
  comprehension: string[];
};

export function useWrenAndMartin() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadWrenAndMartin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/wren-and-martin.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWeeks(data);
      setCurrentWeekIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const prevWeek = () =>
    setCurrentWeekIndex(i => Math.max(0, i - 1));

  const nextWeek = () =>
    setCurrentWeekIndex(i => Math.min(weeks.length - 1, i + 1));

  const parseDayMonth = (s: string, year: number): Date | null => {
    if (!s) return null;
    const [dayStr, monthStr] = s.split("-").map(p => p.trim());
    const day = Number(dayStr);
    const month = new Date(`${monthStr} 1, 2000`).getMonth();
    if (isNaN(day) || isNaN(month)) return null;
    return new Date(year, month, day);
  };

  const findIndexForDate = (d: Date) => {
    const yearNow = d.getFullYear();

    for (let i = 0; i < weeks.length; i++) {
      const w = weeks[i];
      for (let delta = -1; delta <= 1; delta++) {
        const yr = yearNow + delta;
        const from = parseDayMonth(w.from, yr);
        const to = parseDayMonth(w.to, yr);
        if (!from || !to) continue;
        if (to < from) to.setFullYear(to.getFullYear() + 1);
        if (d >= from && d <= to) return i;
      }
    }
    return -1;
  };

  const jumpToCurrentWeek = () => {
    const idx = findIndexForDate(new Date());
    if (idx >= 0) setCurrentWeekIndex(idx);
    else alert("Current week not found in schedule");
  };

  const handleTouchStart = (x: number) => setTouchStartX(x);

  const handleTouchEnd = (x: number) => {
    if (touchStartX == null) return;
    const dx = x - touchStartX;
    if (dx > 40) prevWeek();
    if (dx < -40) nextWeek();
    setTouchStartX(null);
  };

  return {
    weeks,
    currentWeekIndex,
    loading,
    loadWrenAndMartin,
    prevWeek,
    nextWeek,
    jumpToCurrentWeek,
    handleTouchStart,
    handleTouchEnd,
  };
}
