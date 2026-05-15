"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, MapPin, Plus, Repeat, Trash2 } from "lucide-react";
import { useAppContext } from "@/lib/context/AppContext";
import { slotService } from "@/lib/services/slotService";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

type CreationMode = "single" | "multiple" | "repeat";
type ConsultationType = "online" | "offline";
type DoctorRepeatFrequency = "daily" | "weekly" | "monthly";

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
}

interface BackendSlot {
  _id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
}

interface CreateSlotsResponse {
  created_count?: number;
  skipped_count?: number;
  slots?: BackendSlot[];
}

interface SlotsPagination {
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
}

interface BackendPagination {
  totalItems?: number;
  total?: number;
  totalPages?: number;
  page?: number;
  currentPage?: number;
  limit?: number;
  pageSize?: number;
}

const SLOTS_PAGE_SIZE = 10;

const mapSlots = (rawSlots: BackendSlot[] = []) =>
  rawSlots.map((slot) => ({
    id: slot._id,
    slot_date: slot.slot_date,
    start_time: slot.start_time,
    end_time: slot.end_time,
  }));

const normalizePagination = (
  pagination: BackendPagination | undefined,
): SlotsPagination | null => {
  if (!pagination) return null;

  const totalItems = pagination.totalItems ?? pagination.total ?? 0;
  const limit = pagination.limit ?? pagination.pageSize ?? SLOTS_PAGE_SIZE;
  const page = pagination.page ?? pagination.currentPage ?? 1;
  const totalPages =
    pagination.totalPages ?? Math.max(1, Math.ceil(totalItems / limit));

  return {
    totalItems,
    totalPages,
    page,
    limit,
  };
};

const AvailabilityPage: React.FC = () => {
  const { user, isLoadingUser, addNotification } = useAppContext();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    slotId: string | null;
  }>({ show: false, slotId: null });
  const [slotsPage, setSlotsPage] = useState(1);
  const [slotsPagination, setSlotsPagination] =
    useState<SlotsPagination | null>(null);

  const [creationMode, setCreationMode] = useState<CreationMode>("single");
  const [slotDate, setSlotDate] = useState("");
  const [dateToAdd, setDateToAdd] = useState("");
  const [slotDates, setSlotDates] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [consultationType, setConsultationType] =
    useState<ConsultationType>("online");
  const [location, setLocation] = useState("");
  const [fee, setFee] = useState("0");
  const [repeatFrequency, setRepeatFrequency] =
    useState<DoctorRepeatFrequency>("weekly");
  const [repeatCount, setRepeatCount] = useState(6);

  const isDoctor = user?.role === "doctor";
  const doctorProfileId =
    typeof user?._id === "string" ? user._id : user?.id || "";

  useEffect(() => {
    if (!isLoadingUser && !isDoctor) {
      router.replace("/dashboard/home");
    }
  }, [isLoadingUser, isDoctor, router]);

  useEffect(() => {
    if (isLoadingUser) return;

    const fetchSlots = async () => {
      if (!isDoctor || !doctorProfileId) {
        setLoading(false);
        return;
      }

      try {
        const data = await slotService.getByDoctor(doctorProfileId, {
          page: slotsPage,
          limit: SLOTS_PAGE_SIZE,
        });
        setSlots(mapSlots(data.slots || []));
        setSlotsPagination(normalizePagination(data.pagination));
      } catch (error) {
        console.error("Failed to fetch slots:", error);
        addNotification({
          message: "Failed to load availability slots",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchSlots();
  }, [isDoctor, isLoadingUser, doctorProfileId, slotsPage, addNotification]);

  const clearForm = () => {
    setSlotDate("");
    setDateToAdd("");
    setSlotDates([]);
    setStartTime("");
    setEndTime("");
    setConsultationType("online");
    setLocation("");
    setFee("0");
    setRepeatFrequency("weekly");
    setRepeatCount(6);
  };

  const addExplicitDate = () => {
    if (!dateToAdd || slotDates.includes(dateToAdd)) return;
    setSlotDates((prev) => [...prev, dateToAdd].sort());
    setDateToAdd("");
    setFormError(null);
  };

  const validateForm = () => {
    if (!startTime || !endTime) {
      return "Please enter a start and end time.";
    }

    if (endTime <= startTime) {
      return "End time must be after start time.";
    }

    if (creationMode === "multiple" && slotDates.length === 0) {
      return "Please add at least one date.";
    }

    if (creationMode !== "multiple" && !slotDate) {
      return "Please select a date.";
    }

    if (consultationType === "offline" && !location.trim()) {
      return "Please enter a clinic location for offline slots.";
    }

    if (Number.isNaN(Number(fee)) || Number(fee) < 0) {
      return "Please enter a valid fee.";
    }

    return null;
  };

  const handleCreateSlot = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setCreating(true);

    try {
      const response = (await slotService.create({
        ...(creationMode === "multiple"
          ? { slot_dates: slotDates }
          : { slot_date: slotDate }),
        start_time: startTime,
        end_time: endTime,
        consultation_type: consultationType,
        location: consultationType === "offline" ? location.trim() : undefined,
        fee: Number(fee),
        repeat:
          creationMode === "repeat"
            ? { frequency: repeatFrequency, count: repeatCount }
            : { frequency: "none", count: 1 },
      })) as CreateSlotsResponse;

      const createdCount = response.created_count ?? response.slots?.length ?? 0;
      const skippedCount = response.skipped_count ?? 0;

      addNotification({
        message: `${createdCount} slot${
          createdCount === 1 ? "" : "s"
        } created, ${skippedCount} skipped.`,
        type: skippedCount > 0 ? "info" : "success",
      });

      clearForm();

      if (doctorProfileId) {
        const data = await slotService.getByDoctor(doctorProfileId, {
          page: 1,
          limit: SLOTS_PAGE_SIZE,
        });
        setSlots(mapSlots(data.slots || []));
        setSlotsPagination(normalizePagination(data.pagination));
        setSlotsPage(1);
      }
    } catch (error) {
      console.error("Failed to create slots:", error);
      setFormError("Failed to create availability slots. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    setDeleteConfirm({ show: true, slotId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.slotId) return;

    try {
      await slotService.delete(deleteConfirm.slotId);
      addNotification({ message: "Slot deleted successfully", type: "success" });
      if (doctorProfileId) {
        const data = await slotService.getByDoctor(doctorProfileId, {
          page: slotsPage,
          limit: SLOTS_PAGE_SIZE,
        });
        const nextSlots = mapSlots(data.slots || []);
        const nextPagination = normalizePagination(data.pagination);

        if (nextSlots.length === 0 && slotsPage > 1) {
          const previousPage = slotsPage - 1;
          const previousData = await slotService.getByDoctor(doctorProfileId, {
            page: previousPage,
            limit: SLOTS_PAGE_SIZE,
          });
          setSlots(mapSlots(previousData.slots || []));
          setSlotsPagination(normalizePagination(previousData.pagination));
          setSlotsPage(previousPage);
        } else {
          setSlots(nextSlots);
          setSlotsPagination(nextPagination);
        }
      }
    } catch (error) {
      console.error("Failed to delete slot:", error);
      addNotification({ message: "Failed to delete slot", type: "error" });
    } finally {
      setDeleteConfirm({ show: false, slotId: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, slotId: null });
  };

  if (isLoadingUser || loading || !isDoctor) {
    return (
      <div className="p-6">
        <div className="text-center">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Availability</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create single, multiple-date, or repeating slots for patients to book.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Availability
        </h2>

        {formError && (
          <div className="w-full bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {formError}
          </div>
        )}

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["single", "multiple", "repeat"] as CreationMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setCreationMode(mode);
                  setFormError(null);
                }}
                className={`border rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  creationMode === mode
                    ? "border-[#0F93A5] bg-[#E6F6F8] text-[#0F93A5]"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {mode === "single"
                  ? "Single slot"
                  : mode === "multiple"
                  ? "Multiple dates"
                  : "Repeating slots"}
              </button>
            ))}
          </div>

          {creationMode === "multiple" ? (
            <div>
              <label htmlFor="date-to-add" className="block text-sm font-medium text-gray-700 mb-1">
                Dates
              </label>
              <div className="flex gap-3">
                <input
                  id="date-to-add"
                  type="date"
                  value={dateToAdd}
                  onChange={(e) => setDateToAdd(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={addExplicitDate}
                  className="bg-[#0F93A5] text-white hover:bg-[#0D7A8E] rounded-lg"
                >
                  Add Date
                </Button>
              </div>
              {slotDates.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {slotDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setSlotDates((prev) => prev.filter((item) => item !== date))
                      }
                      className="rounded-4xl border border-[#C4E8D5] bg-[#E6F9F0] text-[#166B43] px-3 py-1 text-xs font-semibold"
                    >
                      {date} x
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                id="date"
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                id="start"
                type="time"
                step={1800}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                id="end"
                type="time"
                step={1800}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="consultation-type" className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Type
              </label>
              <select
                id="consultation-type"
                value={consultationType}
                onChange={(e) =>
                  setConsultationType(e.target.value as ConsultationType)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">Fee</label>
              <input
                id="fee"
                type="number"
                min={0}
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                id="location"
                type="text"
                value={location}
                disabled={consultationType === "online"}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={consultationType === "online" ? "Not required" : "Main Clinic"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {creationMode === "repeat" && (
            <div className="border border-[#C4E8D5] bg-[#E6F9F0] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 text-[#166B43]">
                <Repeat className="w-5 h-5" />
                <p className="text-sm font-semibold">Repeat Rule</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="repeat-frequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    id="repeat-frequency"
                    value={repeatFrequency}
                    onChange={(e) =>
                      setRepeatFrequency(e.target.value as DoctorRepeatFrequency)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="repeat-count" className="block text-sm font-medium text-gray-700 mb-1">
                    Count
                  </label>
                  <input
                    id="repeat-count"
                    type="number"
                    min={2}
                    max={60}
                    value={repeatCount}
                    onChange={(e) =>
                      setRepeatCount(
                        Math.min(60, Math.max(2, Number(e.target.value))),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleCreateSlot}
            disabled={creating}
            className="w-full md:w-auto bg-[#0F93A5] text-white hover:bg-[#0D7A8E] rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Availability"}
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Available Slots</h2>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No available slots created yet.
          </p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex gap-3">
                  <div className="size-10 rounded-lg bg-[#E5F8FA] text-[#0F93A5] grid place-items-center">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {new Date(slot.slot_date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock3 className="w-4 h-4" />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteSlot(slot.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {slotsPagination && (
              <Pagination
                currentPage={slotsPagination.page}
                totalPages={slotsPagination.totalPages}
                totalItems={slotsPagination.totalItems}
                pageSize={slotsPagination.limit}
                onPageChange={setSlotsPage}
                isLoading={loading}
                itemLabel="slots"
                className="mt-5"
              />
            )}
          </div>
        )}
      </div>

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this availability slot? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={cancelDelete}
                variant="outline"
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                variant="destructive"
                className="px-4 py-2"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityPage;
