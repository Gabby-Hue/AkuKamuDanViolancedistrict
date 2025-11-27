"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MidtransBookingButton } from "@/components/venues/midtrans-booking-button";

type BookingSchedulerProps = {
  courtId: string;
  isConfigured: boolean;
  midtransClientKey: string | null;
  snapScriptUrl: string;
  isBookingAllowed: boolean;
  disallowedMessage?: string | null;
};

type BookedInterval = {
  start: Date;
  end: Date;
};

const HOURS = Array.from({ length: 17 }, (_, index) => 6 + index);
const DURATIONS = [1, 2, 3, 4];

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

  const getDisabledDates = useCallback(() => {
    const disabled: Date[] = [];

    bookedSlots.forEach((slot) => {
      const start = startOfDay(slot.start);
      const end = startOfDay(slot.end);

      // Add all days from start to end (inclusive) for multi-day bookings
      const current = new Date(start);
      while (current <= end) {
        // Check if this day has any available slots
        const hasAvailability = HOURS.some((hour) => {
          return DURATIONS.some((duration) => {
            return checkSlotAvailability(current, hour, duration).available;
          });
        });

        if (!hasAvailability) {
          disabled.push(new Date(current));
        }

        current.setDate(current.getDate() + 1);
      }
    });

    return disabled;
  }, [bookedSlots, checkSlotAvailability]);

  const disabledDates = useMemo(() => getDisabledDates(), [getDisabledDates]);

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

  const availableHours = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return HOURS.filter((hour) => {
      return checkSlotAvailability(selectedDate, hour, duration).available;
    });
  }, [selectedDate, duration, checkSlotAvailability]);

  const availableDurations = useMemo(() => {
    if (!selectedDate || selectedHour === null) {
      return DURATIONS;
    }

    return DURATIONS.filter((duration) => {
      return checkSlotAvailability(selectedDate, selectedHour, duration).available;
    });
  }, [selectedDate, selectedHour, checkSlotAvailability]);

  const maxDateLabel = maxBookingDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let selectionMessage: string;
  if (!selectedDate) {
    selectionMessage = "Pilih tanggal booking terlebih dahulu.";
  } else if (selectedHour === null) {
    selectionMessage = "Pilih jam mulai untuk melihat durasi yang tersedia.";
  } else if (!selectedSlot) {
    selectionMessage =
      "Jam mulai yang dipilih melewati batas booking. Coba pilih kombinasi lain.";
  } else {
    selectionMessage = formatDateTimeRange(
      selectedSlot.start,
      selectedSlot.end,
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Atur Jadwal Booking</CardTitle>
            <p className="text-sm text-muted-foreground">
              Booking tersedia hingga {maxDateLabel}
            </p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Section */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Pilih Tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: localeID })
                    ) : (
                      <span>Pilih tanggal booking</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={disabledDates}
                    initialFocus
                    locale={localeID}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{selectionMessage}</p>
            </div>
          </div>

          {/* Time and Duration Section */}
          <div className="space-y-4">
            {/* Time Picker */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Jam Mulai
              </label>
              <Select
                value={selectedHour?.toString()}
                onValueChange={(value) => setSelectedHour(parseInt(value))}
                disabled={!selectedDate || availableHours.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jam mulai" />
                </SelectTrigger>
                <SelectContent>
                  {availableHours.map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Picker */}
            <div>
              <label className="text-sm font-medium mb-2 block">Durasi (jam)</label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
                disabled={!selectedDate || selectedHour === null || availableDurations.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih durasi" />
                </SelectTrigger>
                <SelectContent>
                  {availableDurations.map((durationValue) => (
                    <SelectItem key={durationValue} value={durationValue.toString()}>
                      {durationValue} jam
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Catatan Tambahan (Opsional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis detail seperti format pertandingan atau kebutuhan ekstra..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Booking Button Section */}
        <div className="space-y-4 pt-4 border-t">
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

          <p className="text-xs text-muted-foreground text-center">
            Jadwal dan pembayaran kamu akan tersimpan otomatis di dashboard CourtEase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}