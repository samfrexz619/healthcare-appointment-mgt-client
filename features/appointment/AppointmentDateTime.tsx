"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, Repeat } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import clsx from "clsx";
import { RevieBookingModal } from "./RevieBookingModal";
import { Doctor } from "@/types/doctor";
import { slotService } from "@/lib/services/slotService";

interface Slot {
  _id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  location?: string;
  fee: number;
  is_booked: boolean;
  is_blocked: boolean;
}

interface TimeSlotItem {
  id: string;
  time: string;
  disabled: boolean;
  slotData: Slot;
}

interface AppointmentDateTimeProps {
  doctor: Doctor;
}

export type RepeatFrequency = "none" | "weekly" | "monthly";
type AvailableRepeatFrequency = Exclude<RepeatFrequency, "none">;

export interface RepeatBookingConfig {
  frequency: RepeatFrequency;
  count: number;
}

const formatDateForApi = (date: Date) => date.toISOString().split("T")[0];

const getMonthlyRepeatDate = (date: Date) => {
  const nextDate = new Date(date);
  const targetDay = nextDate.getDate();

  nextDate.setMonth(nextDate.getMonth() + 1);

  if (nextDate.getDate() !== targetDay) {
    nextDate.setDate(0);
  }

  return nextDate;
};

const getRepeatDate = (
  date: Date,
  frequency: AvailableRepeatFrequency,
  index: number,
) => {
  if (frequency === "weekly") {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + index * 7);
    return nextDate;
  }

  let nextDate = new Date(date);
  for (let count = 0; count < index; count += 1) {
    nextDate = getMonthlyRepeatDate(nextDate);
  }

  return nextDate;
};

const AppointmentDateTime: React.FC<AppointmentDateTimeProps> = ({
  doctor,
}) => {
  function getNextDays(count = 7) {
    const today = new Date();

    return Array.from({ length: count }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + i);

      return {
        fullDate: d,
        day: d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(),
        date: d.getDate(),
        month: d.toLocaleDateString("en-GB", { month: "short" }),
      };
    });
  }

  const dates = getNextDays(7);

  const [timeSlots, setTimeSlots] = useState<TimeSlotItem[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(dates[0].fullDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [visitType, setVisitType] = useState<"in-person" | "video" | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const [repeatFrequency, setRepeatFrequency] =
    useState<RepeatFrequency>("none");
  const [repeatCount, setRepeatCount] = useState(4);
  const [repeatAvailability, setRepeatAvailability] = useState({
    weekly: 0,
    monthly: 0,
  });
  const [repeatAvailabilityLoading, setRepeatAvailabilityLoading] =
    useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (!doctor?._id || !selectedDate || !open) return;

    const controller = new AbortController();

    const loadSlots = async () => {
      try {
        setSlotsLoading(true);

        const formattedDate = formatDateForApi(selectedDate);

        const res = await slotService.getByDoctor(doctor._id, {
          date: formattedDate,
          limit: 60,
        });

        const mappedSlots: TimeSlotItem[] = res.slots.map((slot: Slot) => ({
          id: slot._id,
          time: slot.start_time,
          disabled: slot.is_booked || slot.is_blocked,
          slotData: slot,
        }));

        setTimeSlots(mappedSlots);
      } catch (err) {
        console.error("Failed to load slots:", err);
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();

    return () => {
      controller.abort();
    };
  }, [doctor?._id, selectedDate, open]);

  useEffect(() => {
    if (!doctor?._id || !selectedDate || !selectedSlot || !selectedTime || !open) {
      return;
    }

    let isMounted = true;

    const hasMatchingSlot = async (date: Date) => {
      const res = await slotService.getByDoctor(
        doctor._id,
        { date: formatDateForApi(date), limit: 60 },
      );
      const slots = (res.slots || []) as Slot[];

      return slots.some(
        (slot) =>
          slot.start_time === selectedTime &&
          !slot.is_booked &&
          !slot.is_blocked,
      );
    };

    const countMatchingRepeatSlots = async (
      frequency: AvailableRepeatFrequency,
    ) => {
      let matchingSlotsCount = 0;

      for (let index = 1; index < 60; index += 1) {
        const date = getRepeatDate(selectedDate, frequency, index);
        const hasSlot = await hasMatchingSlot(date);

        if (!hasSlot) break;

        matchingSlotsCount += 1;
      }

      return matchingSlotsCount + 1;
    };

    const loadRepeatAvailability = async () => {
      try {
        setRepeatAvailabilityLoading(true);

        const [weeklyCount, monthlyCount] = await Promise.all([
          countMatchingRepeatSlots("weekly"),
          countMatchingRepeatSlots("monthly"),
        ]);

        if (!isMounted) return;

        setRepeatAvailability({ weekly: weeklyCount, monthly: monthlyCount });

        if (
          (repeatFrequency === "weekly" && weeklyCount < 2) ||
          (repeatFrequency === "monthly" && monthlyCount < 2)
        ) {
          setRepeatFrequency("none");
        } else if (repeatFrequency !== "none") {
          const maxCount =
            repeatFrequency === "weekly" ? weeklyCount : monthlyCount;
          setRepeatCount((prev) => Math.min(prev, maxCount));
        }
      } catch (err) {
        console.error("Failed to check repeat availability:", err);
        if (isMounted) {
          setRepeatAvailability({ weekly: 0, monthly: 0 });
          setRepeatFrequency("none");
        }
      } finally {
        if (isMounted) {
          setRepeatAvailabilityLoading(false);
        }
      }
    };

    void loadRepeatAvailability();

    return () => {
      isMounted = false;
    };
  }, [
    doctor?._id,
    selectedDate,
    selectedSlot,
    selectedTime,
    open,
    repeatFrequency,
  ]);

  const hasAvailableSlots =
    timeSlots.length > 0 && timeSlots.some((slot) => !slot.disabled);
  const availableRepeatFrequencies = (
    ["weekly", "monthly"] as AvailableRepeatFrequency[]
  ).filter((frequency) => repeatAvailability[frequency] > 1);
  const canRepeat = availableRepeatFrequencies.length > 0;
  const maxRepeatCount =
    repeatFrequency === "none" ? 1 : repeatAvailability[repeatFrequency];

  const isValid =
    !!selectedDate && !!selectedSlot && !!visitType && reason.trim().length > 0;

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="h-12 bg-[#0F93A5] text-white rounded-[40px] px-4">
            Book Appointment
          </Button>
        </SheetTrigger>
        <SheetContent
          showCloseButton={true}
          onInteractOutside={(e) => e.preventDefault()}
          className="min-w-150 bg-white border-none overflow-y-scroll pt-6 pb-10"
        >
          <SheetHeader className="">
            <SheetTitle className="text-2xl font-bold text-black">
              Book Appointment
            </SheetTitle>
            <SheetDescription>
              Please select date and time to book appointment with your doctor.
            </SheetDescription>
          </SheetHeader>
          <section className="px-6 space-y-4">
            <div
              style={{ borderRadius: "8px" }}
              className="w-full border border-gray-300 p-4"
            >
              <p>Date & time</p>
              <div className="flex gap-3 overflow-x-auto py-2">
                {dates.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDate(d.fullDate);
                      setSelectedTime(null);
                      setSelectedSlot(null);
                      setRepeatFrequency("none");
                      setRepeatAvailability({ weekly: 0, monthly: 0 });
                    }}
                    style={{ borderRadius: "6px" }}
                    className={clsx(
                      "min-w-20 rounded-xl border p-2 text-center transition",
                      selectedDate?.toDateString() === d.fullDate.toDateString()
                        ? "border-[#0F93A5] bg-[#E6F6F8]"
                        : "border-gray-200",
                    )}
                  >
                    <p className="text-xs text-gray-500">{d.day}</p>
                    <p className="text-lg font-semibold">{d.date}</p>
                    <p className="text-xs text-gray-400">{d.month}</p>
                  </button>
                ))}
              </div>
            </div>

            {slotsLoading ? (
              <div className="py-10 text-center text-sm text-gray-500">
                Loading slots...
              </div>
            ) : !hasAvailableSlots ? (
              <div
                style={{ borderRadius: "8px" }}
                className="w-full border border-dashed border-gray-300 rounded-xl p-4 text-center mt-4"
              >
                <p className="text-lg font-semibold text-gray-700">
                  No available slots
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please choose another date or try again later.
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{ borderRadius: "8px" }}
                  className="w-full border border-gray-300 p-4"
                >
                  <p>Available time slots</p>
                  <div className="flex flex-wrap gap-3 py-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        style={{ borderRadius: "6px" }}
                        disabled={slot.disabled}
                        onClick={() => {
                          setSelectedTime(slot.time);
                          setSelectedSlot(slot.slotData);
                          setRepeatFrequency("none");
                        }}
                        className={clsx(
                          "px-4 py-2 rounded-xl border text-sm",
                          slot.disabled && "opacity-40 cursor-not-allowed",
                          selectedSlot?._id === slot.slotData._id
                            ? "border-[#0F93A5] bg-[#E6F6F8]"
                            : "border-gray-200",
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
                <h2 className="text-2xl font-semibold">Visit details</h2>

                <div
                  style={{ borderRadius: "8px" }}
                  className="w-full border border-gray-300 p-4"
                >
                  <h3 className="mb-3 font-medium">Visit type</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setVisitType("in-person")}
                      style={{ borderRadius: "6px" }}
                      className={clsx(
                        "rounded-2xl border p-4 text-left",
                        visitType === "in-person"
                          ? "border-[#0F93A5] bg-[#E6F6F8]"
                          : "border-gray-200",
                      )}
                    >
                      <p className="font-semibold">In-person</p>
                      <p className="text-sm text-gray-500">Visit the clinic</p>
                    </button>

                    <button
                      onClick={() => setVisitType("video")}
                      style={{ borderRadius: "6px" }}
                      className={clsx(
                        "rounded-2xl border p-4 text-left",
                        visitType === "video"
                          ? "border-[#0F93A5] bg-[#E6F6F8]"
                          : "border-gray-200",
                      )}
                    >
                      <p className="font-semibold">Video consultation</p>
                      <p className="text-sm text-gray-500">From anywhere</p>
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="mb-2 font-medium">Reason for visit</h3>

                  <textarea
                    maxLength={500}
                    value={reason}
                    style={{ borderRadius: "6px" }}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border p-4 focus:border-[#0F93A5] outline-none"
                    placeholder="Briefly describe your symptoms..."
                  />

                  <p className="text-sm text-gray-400">{reason.length}/500</p>
                </div>

                {selectedSlot && repeatAvailabilityLoading && (
                  <div
                    style={{ borderRadius: "8px" }}
                    className="w-full border border-gray-200 p-4 text-sm text-gray-500"
                  >
                    Checking repeat availability...
                  </div>
                )}

                {selectedSlot && !repeatAvailabilityLoading && canRepeat && (
                  <div
                    style={{ borderRadius: "8px" }}
                    className="w-full border border-gray-300 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Repeat size={18} className="text-[#0F93A5]" />
                      <h3 className="font-medium">Repeat appointment</h3>
                    </div>

                    <div
                      className={clsx(
                        "grid gap-3",
                        availableRepeatFrequencies.length === 1
                          ? "grid-cols-2"
                          : "grid-cols-3",
                      )}
                    >
                      {(["none", ...availableRepeatFrequencies] as RepeatFrequency[]).map(
                        (frequency) => (
                          <button
                            key={frequency}
                            type="button"
                            onClick={() => {
                              setRepeatFrequency(frequency);
                              if (frequency !== "none") {
                                setRepeatCount(
                                  Math.min(
                                    repeatCount,
                                    repeatAvailability[frequency],
                                  ),
                                );
                              }
                            }}
                            style={{ borderRadius: "6px" }}
                            className={clsx(
                              "border px-3 py-3 text-sm capitalize transition",
                              repeatFrequency === frequency
                                ? "border-[#0F93A5] bg-[#E6F6F8] text-[#0F93A5]"
                                : "border-gray-200 text-gray-600",
                            )}
                          >
                            {frequency === "none"
                              ? "Does not repeat"
                              : frequency}
                          </button>
                        ),
                      )}
                    </div>

                    {repeatFrequency !== "none" && (
                      <div className="mt-4 flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-[#E5F8FA] text-[#0F93A5] grid place-items-center shrink-0">
                          <CalendarClock size={18} />
                        </div>
                        <div className="flex-1">
                          <label
                            htmlFor="repeat-count"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Total appointments
                          </label>
                          <p className="text-xs text-gray-500">
                            Includes the first appointment you selected. Up to{" "}
                            {maxRepeatCount} available.
                          </p>
                        </div>
                        <input
                          id="repeat-count"
                          type="number"
                          min={2}
                          max={maxRepeatCount}
                          value={repeatCount}
                          onChange={(e) =>
                            setRepeatCount(
                              Math.min(
                                maxRepeatCount,
                                Math.max(2, Number(e.target.value)),
                              ),
                            )
                          }
                          className="h-11 w-20 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#0F93A5]"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Button
                    style={{ borderRadius: "40px" }}
                    className={clsx(
                      "w-full h-12 mt-6 text-white",
                      isValid
                        ? "bg-[#0F93A5]"
                        : "bg-gray-300 cursor-not-allowed",
                    )}
                    disabled={!isValid}
                    onClick={() => {
                      if (!selectedSlot || !visitType || !reason.trim()) return;

                      setOpen(false);
                      setShowReviewModal(true);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
          </section>
        </SheetContent>
      </Sheet>

      {showReviewModal && selectedSlot && (
        <RevieBookingModal
          doctor={doctor}
          slotId={selectedSlot._id}
          date={selectedDate!}
          time={selectedTime!}
          visitType={visitType!}
          reason={reason}
          repeat={{
            frequency: repeatFrequency,
            count: repeatFrequency === "none" ? 1 : repeatCount,
          }}
          onBack={() => {
            setShowReviewModal(false);
            setOpen(true); // re-open the sheet so user can go back
          }}
          onSuccess={() => {
            setShowReviewModal(false);
            setSelectedSlot(null);
            setReason("");
            setVisitType(null);
            setRepeatFrequency("none");
            setRepeatCount(4);
            setSelectedDate(null);
          }}
        />
      )}
    </>
  );
};

export default AppointmentDateTime;
