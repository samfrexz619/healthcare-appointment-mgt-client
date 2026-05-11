"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context/AppContext";
import { slotService } from "@/lib/services/slotService";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

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

const AvailabilityPage: React.FC = () => {
  const { user, addNotification } = useAppContext();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; slotId: string | null }>({ show: false, slotId: null });

  // Form state
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    const fetchSlots = async () => {
      if (!user?.id) return;
      try {
        const data = await slotService.getByDoctor(user.id);
        const mappedSlots = (data.slots || []).map((slot: BackendSlot) => ({
          id: slot._id,
          slot_date: slot.slot_date,
          start_time: slot.start_time,
          end_time: slot.end_time,
        }));
        setSlots(mappedSlots);
      } catch (error) {
        console.error("Failed to fetch slots:", error);
        addNotification({ message: "Failed to load availability slots", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      void fetchSlots();
    }
  }, [user?.id, addNotification]);

  const getEndTimeFromStart = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes + 30, 0, 0);
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    setEndTime(getEndTimeFromStart(value));
    if (formError) {
      setFormError(null);
    }
  };

  const handleCreateSlot = async () => {
    if (!slotDate || !startTime) {
      setFormError("Please fill in all fields.");
      return;
    }

    const expectedEndTime = getEndTimeFromStart(startTime);
    if (endTime !== expectedEndTime) {
      setFormError("Time slots must be exactly 30 minutes.");
      return;
    }

    setFormError(null);
    setCreating(true);
    try {
      await slotService.create({
        slot_date: slotDate,
        start_time: startTime,
        end_time: endTime,
      });
      addNotification({ message: "Availability slot created successfully", type: "success" });
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      if (user?.id) {
        const data = await slotService.getByDoctor(user.id);
        const mappedSlots = (data.slots || []).map((slot: BackendSlot) => ({
          id: slot._id,
          slot_date: slot.slot_date,
          start_time: slot.start_time,
          end_time: slot.end_time,
        }));
        setSlots(mappedSlots);
      }
    } catch (error) {
      console.error("Failed to create slot:", error);
      setFormError("Failed to create availability slot. Please try again.");
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
      setSlots((prev) => prev.filter((slot) => slot.id !== deleteConfirm.slotId));
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Availability</h1>
      </div>

      {/* Create Slot Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Availability Slot
        </h2>
        {formError && (
          <div className="w-full bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {formError}
          </div>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                id="date"
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                id="start"
                type="time"
                step={1800}
                max="23:30"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
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
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <Button
            onClick={handleCreateSlot}
            disabled={creating}
            className="w-full md:w-auto bg-[#0F93A5] text-white hover:bg-[#0D7A8E] rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Slot"}
          </Button>
        </div>
      </div>

      {/* Existing Slots */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Availability Slots</h2>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No availability slots created yet.
          </p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {new Date(slot.slot_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {slot.start_time} - {slot.end_time}
                  </p>
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
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
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