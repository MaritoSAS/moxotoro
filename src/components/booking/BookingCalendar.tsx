"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";
import {
  WEEKDAYS_ES,
  WEEKDAYS_ES_SHORT,
  addCalendarDays,
  argentinaTodayYmd,
  compareYearMonth,
  daysInMonth,
  endOfWeekSunday,
  formatDateLongEs,
  formatMonthYearEs,
  getMaxBookingDate,
  mondayFirstWeekday,
  parseYmd,
  shiftYearMonth,
  startOfWeekMonday,
  toYmd,
} from "@/lib/booking";

interface BookingCalendarProps {
  selectedDate: string;
  minDate: string;
  onSelectDate: (ymd: string) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  minDate,
  onSelectDate,
}) => {
  const maxDate = useMemo(() => getMaxBookingDate(minDate), [minDate]);
  const todayYmd = argentinaTodayYmd();
  const selected = selectedDate ? parseYmd(selectedDate) : parseYmd(minDate);
  const [view, setView] = useState({ year: selected.year, month: selected.month });
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingFocus) return;
    document.getElementById(`booking-day-${pendingFocus}`)?.focus();
    setPendingFocus(null);
  }, [pendingFocus, view]);

  const minView = parseYmd(minDate);
  const maxView = parseYmd(maxDate);
  const canGoPrev = compareYearMonth(view, minView) > 0;
  const canGoNext = compareYearMonth(view, maxView) < 0;

  const cells = useMemo(() => {
    const leading = mondayFirstWeekday(view.year, view.month, 1);
    const totalDays = daysInMonth(view.year, view.month);
    const blanks = Array.from({ length: leading }, () => null);
    const days = Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      const ymd = toYmd(view.year, view.month, day);
      return {
        day,
        ymd,
        disabled: ymd < minDate || ymd > maxDate,
        selected: ymd === selectedDate,
        isToday: ymd === todayYmd,
      };
    });
    return [...blanks, ...days];
  }, [view, minDate, maxDate, selectedDate, todayYmd]);

  const goMonth = (delta: number) => {
    const next = shiftYearMonth(view, delta);
    if (delta < 0 && compareYearMonth(next, minView) < 0) return;
    if (delta > 0 && compareYearMonth(next, maxView) > 0) return;
    setView(next);
  };

  const handleDayKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    ymd: string,
    disabled: boolean,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!disabled) onSelectDate(ymd);
      return;
    }

    let nextYmd: string | null = null;

    if (event.key === "ArrowLeft") {
      nextYmd = addCalendarDays(ymd, -1);
    } else if (event.key === "ArrowRight") {
      nextYmd = addCalendarDays(ymd, 1);
    } else if (event.key === "ArrowUp") {
      nextYmd = addCalendarDays(ymd, -7);
    } else if (event.key === "ArrowDown") {
      nextYmd = addCalendarDays(ymd, 7);
    } else if (event.key === "Home") {
      nextYmd = startOfWeekMonday(ymd);
    } else if (event.key === "End") {
      nextYmd = endOfWeekSunday(ymd);
    } else if (event.key === "PageUp") {
      event.preventDefault();
      goMonth(-1);
      return;
    } else if (event.key === "PageDown") {
      event.preventDefault();
      goMonth(1);
      return;
    }

    if (!nextYmd) return;
    if (nextYmd < minDate || nextYmd > maxDate) return;
    event.preventDefault();
    const next = parseYmd(nextYmd);
    if (compareYearMonth(next, view) !== 0) {
      setView({ year: next.year, month: next.month });
    }
    setPendingFocus(nextYmd);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          disabled={!canGoPrev}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#c4a962]/30 bg-[#0a0a0a] text-[#c4a962] transition-colors hover:bg-[#0d3d47] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4a962]"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-center text-base font-semibold tracking-wide text-[#f5f0e8]" aria-live="polite">
          {formatMonthYearEs(view.year, view.month)}
        </h3>
        <button
          type="button"
          onClick={() => goMonth(1)}
          disabled={!canGoNext}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#c4a962]/30 bg-[#0a0a0a] text-[#c4a962] transition-colors hover:bg-[#0d3d47] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4a962]"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div role="grid" aria-label="Calendario de reservas" className="select-none">
        <div role="row" className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS_ES_SHORT.map((label, index) => (
            <div
              key={label}
              role="columnheader"
              aria-label={WEEKDAYS_ES[index]}
              title={WEEKDAYS_ES[index]}
              className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[#c4a962]"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} role="gridcell" aria-hidden="true" className="h-11" />;
            }

            const { ymd, day, disabled, selected: isSelected, isToday } = cell;
            const label = `${formatDateLongEs(ymd)}${disabled ? ", no disponible" : ""}${isSelected ? ", seleccionada" : ""}`;

            return (
              <div key={ymd} role="gridcell" aria-selected={isSelected} className="min-w-0">
                <button
                  type="button"
                  id={`booking-day-${ymd}`}
                  onClick={() => !disabled && onSelectDate(ymd)}
                  onKeyDown={(event) => handleDayKeyDown(event, ymd, disabled)}
                  disabled={disabled}
                  aria-label={label}
                  aria-pressed={isSelected}
                  tabIndex={isSelected || (!selectedDate && ymd === minDate) ? 0 : -1}
                  className={`flex h-11 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4a962] ${
                    isSelected
                      ? "bg-[#c4a962] text-[#0a0a0a] shadow-md"
                      : disabled
                        ? "cursor-not-allowed bg-transparent text-[#4b5563] opacity-40"
                        : "bg-[#0d3d47]/50 text-[#f5f0e8] hover:bg-[#165260] hover:text-[#dfc888]"
                  } ${isToday && !isSelected && !disabled ? "ring-1 ring-[#c4a962]/50" : ""}`}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wide text-[#9ca3af]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#0d3d47]/80" /> Disponible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#c4a962]" /> Seleccionado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-transparent text-[#4b5563] opacity-40 border border-white/10" /> No
          disponible
        </span>
      </div>

      <p className="text-[11px] leading-relaxed text-[#9ca3af]">
        Las reservas cierran a las {MOXOTORO_CONFIG.capacity.cutoffHourPreviousDay}:00 hs del día anterior
        (hora Argentina). Los días no disponibles no se pueden elegir.
      </p>
    </div>
  );
};
