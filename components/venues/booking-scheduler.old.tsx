"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { MidtransBookingButton } from "@/components/venues/midtrans-booking-button";

type BookingSchedulerProps = {
  courtId: string;
  isConfigured: boolean;
  midtransClientKey: string | null;
  snapScriptUrl: string;
  isBookingAllowed: boolean;
  disallowedMessage?: string | null;
};

type DayCell = {
  date: Date;
  label: number;
  isCurrentMonth: boolean;
  isDisabled: boolean;
  isToday: boolean;
  hasBooking: boolean;
  isFullyBooked: boolean;
};

const HOURS = Array.from({ length: 17 }, (_, index) => 6 + index);
const DURATIONS = [1, 2, 3, 4];
const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

type BookedInterval = {
  start: Date;
  end: Date;
};

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth(value: Date) {
  const date = startOfDay(value);
  date.setDate(1);
  return date;
}

function addMonths(value: Date, count: number) {
  const date = new Date(value);
  date.setMonth(date.getMonth() + count);
  return startOfMonth(date);
}

function buildCalendarDays(
  month: Date,
  minDate: Date,
  maxDate: Date,
  busyDaySet: Set<number>,
  fullyBookedDaySet: Set<number>,
): DayCell[] {
  const monthStart = startOfMonth(month);
  const offset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - offset);

  const cells: DayCell[] = [];
  for (let index = 0; index < 42; index += 1) {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);
    const currentStart = startOfDay(current);
    const isDisabled = currentStart < minDate || currentStart > maxDate;
    const dayKey = currentStart.getTime();
    cells.push({
      date: currentStart,
      label: currentStart.getDate(),
      isCurrentMonth: currentStart.getMonth() === monthStart.getMonth(),
      isDisabled,
      isToday: currentStart.getTime() === minDate.getTime(),
      hasBooking: busyDaySet.has(dayKey),
      isFullyBooked: fullyBookedDaySet.has(dayKey),
    });
  }
  return cells;
}

function isHourWithinWindow(
  date: Date,
  hour: number,
  duration: number,
  maxDateTime: Date,
): boolean {
  const now = new Date();
  const start = new Date(date);
  start.setHours(hour, 0, 0, 0);
  if (start < now) {
    return false;
  }
  const end = new Date(start);
  end.setHours(end.getHours() + duration);
  if (end <= start) {
    return false;
  }
  if (end > maxDateTime) {
    return false;
  }
  return true;
}

function slotsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function formatDateTimeRange(start: Date, end: Date) {
  const dateLabel = start.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startLabel = start.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endLabel = end.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateLabel} • ${startLabel} - ${endLabel} WIB`;
}

export function BookingScheduler({
  courtId,
  isConfigured,
  midtransClientKey,
  snapScriptUrl,
  isBookingAllowed,
  disallowedMessage,
}: BookingSchedulerProps) {
  const today = startOfDay(new Date());
  const maxBookingDate = useMemo(() => {
    const limit = startOfDay(new Date());
    limit.setMonth(limit.getMonth() + 3);
    return limit;
  }, []);
  const maxDateTime = useMemo(() => {
    const limit = new Date(maxBookingDate);
    limit.setHours(23, 59, 59, 999);
    return limit;
  }, [maxBookingDate]);
  const maxMonthStart = startOfMonth(maxBookingDate);

  const [displayMonth, setDisplayMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(2);
  const [notes, setNotes] = useState("");
  const [bookedSlots, setBookedSlots] = useState<BookedInterval[]>([]);

  useEffect(() => {
    let active = true;

    const fetchAvailability = async () => {
      try {
        const response = await fetch(`/api/courts/${courtId}/availability`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            payload.error ?? "Gagal memuat jadwal yang sudah dibooking.",
          );
        }
        const payload = (await response.json()) as {
          data?: Array<{ start_time: string; end_time: string }>;
        };
        if (!active) {
          return;
        }
        setBookedSlots(
          (payload.data ?? []).map((slot) => ({
            start: new Date(slot.start_time),
            end: new Date(slot.end_time),
          })),
        );
      } catch (error) {
        console.error("Failed to load booked slots", error);
        if (active) {
          toast.error("Kalender tidak sinkron", {
            description:
              "Slot yang sudah dibooking sementara tidak bisa ditampilkan.",
          });
        }
      }
    };

    fetchAvailability();

    return () => {
      active = false;
    };
  }, [courtId]);

  const checkSlotAvailability = useCallback(
    (date: Date, hour: number, durationHours: number) => {
      if (!isHourWithinWindow(date, hour, durationHours, maxDateTime)) {
        return { available: false, reason: "window" as const };
      }

      // Create proper dates with timezone handling
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + durationHours);

      const hasConflict = bookedSlots.some((slot) =>
        slotsOverlap(start, end, slot.start, slot.end),
      );

      if (hasConflict) {
        return { available: false, reason: "booked" as const };
      }

      return { available: true, reason: null };
    },
    [bookedSlots, maxDateTime],
  );

  useEffect(() => {
    if (selectedDate && selectedHour !== null) {
      const { available } = checkSlotAvailability(
        selectedDate,
        selectedHour,
        duration,
      );
      if (!available) {
        setSelectedHour(null);
      }
    }
  }, [
    checkSlotAvailability,
    duration,
    maxDateTime,
    selectedDate,
    selectedHour,
  ]);

  const busyDaySet = useMemo(() => {
    const set = new Set<number>();
    bookedSlots.forEach((slot) => {
      const start = startOfDay(slot.start);
      const end = startOfDay(slot.end);

      // Add all days from start to end (inclusive) for multi-day bookings
      const current = new Date(start);
      while (current <= end) {
        set.add(current.getTime());
        current.setDate(current.getDate() + 1);
      }
    });
    return set;
  }, [bookedSlots]);

  const fullyBookedDaySet = useMemo(() => {
    const set = new Set<number>();
    busyDaySet.forEach((timestamp) => {
      const date = new Date(timestamp);

      // Check if any hour is available for ANY duration (1-4 hours)
      const hasAvailability = HOURS.some((hour) => {
        return DURATIONS.some((duration) => {
          return checkSlotAvailability(date, hour, duration).available;
        });
      });

      if (!hasAvailability) {
        set.add(timestamp);
      }
    });
    return set;
  }, [busyDaySet, checkSlotAvailability]);

  const calendarDays = useMemo(
    () =>
      buildCalendarDays(
        displayMonth,
        today,
        maxBookingDate,
        busyDaySet,
        fullyBookedDaySet,
      ),
    [busyDaySet, displayMonth, fullyBookedDaySet, maxBookingDate, today],
  );

  const selectedSlot = useMemo(() => {
    if (!selectedDate || selectedHour === null) {
      return null;
    }
    // Use consistent timezone handling
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), selectedHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + duration);
    if (
      !checkSlotAvailability(selectedDate, selectedHour, duration).available
    ) {
      return null;
    }
    return { start, end };
  }, [checkSlotAvailability, duration, selectedDate, selectedHour]);

  const hourOptions = HOURS.map((hour) => {
    if (!selectedDate) {
      return { hour, disabled: true, reason: "date" as const };
    }
    const availability = checkSlotAvailability(selectedDate, hour, duration);
    return {
      hour,
      disabled: !availability.available,
      reason: availability.reason,
    };
  });

  const durationOptions = DURATIONS.map((value) => {
    if (!selectedDate || selectedHour === null) {
      return { value, disabled: false, reason: null };
    }
    const availability = checkSlotAvailability(
      selectedDate,
      selectedHour,
      value,
    );
    return {
      value,
      disabled: !availability.available,
      reason: availability.reason,
    };
  });

  let selectionMessage: string;
  if (!selectedDate) {
    selectionMessage = "Pilih tanggal booking terlebih dahulu.";
  } else if (selectedHour === null) {
    selectionMessage = "Pilih jam mulai dan durasi untuk membuat jadwal.";
  } else if (!selectedSlot) {
    selectionMessage =
      "Jam mulai yang dipilih melewati batas booking. Coba pilih kombinasi lain.";
  } else {
    selectionMessage = formatDateTimeRange(
      selectedSlot.start,
      selectedSlot.end,
    );
  }

  const maxDateLabel = maxBookingDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const canGoPrev = displayMonth.getTime() > startOfMonth(today).getTime();
  const canGoNext = displayMonth.getTime() < maxMonthStart.getTime();

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Atur jadwal
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Booking tersedia hingga {maxDateLabel}.
          </p>
        </div>
        <div className="hidden rounded-full bg-brand/10 p-3 text-brand dark:bg-brand/20 dark:text-brand-muted sm:flex">
          <CalendarClock className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 text-slate-600 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700/70 dark:text-slate-300 dark:hover:border-brand dark:hover:text-brand-muted"
                onClick={() =>
                  canGoPrev && setDisplayMonth(addMonths(displayMonth, -1))
                }
                disabled={!canGoPrev}
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex flex-col items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Kalender booking
                </span>
                <span>
                  {displayMonth.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 text-slate-600 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700/70 dark:text-slate-300 dark:hover:border-brand dark:hover:text-brand-muted"
                onClick={() =>
                  canGoNext && setDisplayMonth(addMonths(displayMonth, 1))
                }
                disabled={!canGoNext}
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {DAY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarDays.map((cell) => {
                const isSelected =
                  selectedDate &&
                  cell.date.getTime() === selectedDate.getTime();
                return (
                  <button
                    key={`${cell.date.toISOString()}-${cell.label}`}
                    type="button"
                    disabled={cell.isDisabled}
                    className={cn(
                      "flex aspect-square w-full items-center justify-center rounded-full text-sm font-medium transition",
                      cell.isDisabled
                        ? "cursor-not-allowed text-slate-300 dark:text-slate-600"
                        : cell.isCurrentMonth
                          ? "text-slate-700 hover:bg-brand/10 hover:text-brand dark:text-slate-200 dark:hover:bg-brand/10 dark:hover:text-brand-muted"
                          : "text-slate-300 dark:text-slate-600",
                      isSelected
                        ? "bg-brand text-white shadow-sm"
                        : cell.isToday
                          ? "border border-dashed border-brand/70 dark:border-brand/60"
                          : "border border-transparent",
                    )}
                    onClick={() => {
                      if (cell.isDisabled) {
                        return;
                      }
                      setSelectedDate(cell.date);
                      setSelectedHour((prev) => {
                        if (
                          prev !== null &&
                          !isHourWithinWindow(
                            cell.date,
                            prev,
                            duration,
                            maxDateTime,
                          )
                        ) {
                          return null;
                        }
                        return prev;
                      });
                    }}
                  >
                    <span
                      className={cn(
                        "relative flex h-full w-full items-center justify-center",
                        cell.isFullyBooked
                          ? "line-through decoration-2 decoration-brand"
                          : "",
                      )}
                    >
                      {cell.label}
                      {cell.hasBooking && !cell.isFullyBooked && (
                        <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-brand" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200/70 bg-slate-50/80 p-4 text-xs text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-300">
            {selectionMessage}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Jam mulai
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {hourOptions.map(({ hour, disabled, reason }) => (
                <button
                  key={hour}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) {
                      setSelectedHour(hour);
                    }
                  }}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                    selectedHour === hour
                      ? "border-brand bg-brand/10 text-brand-strong"
                      : "border-slate-200 text-slate-600 hover:border-brand hover:text-brand-strong dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand dark:hover:text-brand-muted",
                    disabled
                      ? cn(
                          "cursor-not-allowed opacity-40 hover:border-slate-200 hover:text-slate-600 dark:hover:border-slate-700",
                          reason === "booked"
                            ? "line-through decoration-2 decoration-brand/60"
                            : "",
                        )
                      : "",
                  )}
                >
                  {`${hour.toString().padStart(2, "0")}:00`}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Durasi (jam)
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {durationOptions.map(({ value, disabled, reason }) => (
                <button
                  key={value}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) {
                      setDuration(value);
                    }
                  }}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                    duration === value
                      ? "border-brand bg-brand/10 text-brand-strong"
                      : "border-slate-200 text-slate-600 hover:border-brand hover:text-brand-strong dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand dark:hover:text-brand-muted",
                    disabled
                      ? cn(
                          "cursor-not-allowed opacity-40 hover:border-slate-200 hover:text-slate-600 dark:hover:border-slate-700",
                          reason === "booked"
                            ? "line-through decoration-2 decoration-brand/60"
                            : "",
                        )
                      : "",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            <label className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-[0.3em]">
                Catatan tambahan (opsional)
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Tulis detail seperti format pertandingan atau kebutuhan ekstra."
                className="min-h-[96px] w-full rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100"
              />
            </label>
          </div>

          <div className="space-y-3">
            <MidtransBookingButton
              courtId={courtId}
              isConfigured={isConfigured}
              midtransClientKey={midtransClientKey}
              snapScriptUrl={snapScriptUrl}
              isBookingAllowed={isBookingAllowed}
              disallowedMessage={disallowedMessage}
              selectedSlot={selectedSlot}
              notes={notes}
            />

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Jadwal dan pembayaran kamu akan tersimpan otomatis di dashboard
              CourtEase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
