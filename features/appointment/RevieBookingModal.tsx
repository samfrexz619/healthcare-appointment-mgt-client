"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Doctor } from "@/types/doctor";
import { appointmentService } from "@/lib/services/appointmentService";
import { useAppContext } from "@/lib/context/AppContext";
import { getErrorMessage } from "@/lib/getErrorMessage";

interface ReviewBookingProps {
  doctor:    Doctor;
  slotId:    string;
  date:      Date;
  time:      string;
  visitType: "in-person" | "video";
  reason:    string;
  onBack:    () => void;
  onSuccess: () => void;
}

export const RevieBookingModal: React.FC<ReviewBookingProps> = (props) => {
  const { doctor, slotId, date, time, visitType, reason, onBack, onSuccess } = props;

  const { addNotification } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const formattedDate = date?.toLocaleDateString("en-GB", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
  });

  const initials = `${doctor.first_name?.[0] ?? ""}${doctor.last_name?.[0] ?? ""}`.toUpperCase();

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await appointmentService.bookAppointment({
        slot_id: slotId,
        type:    visitType,
        notes:   reason,
      });

      addNotification({
        message: `Appointment with Dr. ${doctor.first_name} ${doctor.last_name} confirmed!`,
        type:    "success",
      });

      onSuccess();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to book appointment. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overlay-review">
      <div style={{ borderRadius: "12px" }} className="bg-white w-150 p-5">
        <h4 className="text-xl font-bold">Confirm Appointment</h4>

        {/* Error */}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div style={{ borderRadius: "18px" }} className="mt-3 border border-gray-300 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#D9EEF2] flex items-center justify-center font-semibold text-[#0F93A5]">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-lg">
                  Dr. {doctor.first_name} {doctor.last_name}
                </p>
                <p className="text-sm text-gray-500">{doctor.specialisation}</p>
              </div>
            </div>
            <div className="bg-[#0F93A5] text-white px-4 py-1 rounded-full text-sm font-medium">
              £{doctor.consultation_fee}
            </div>
          </div>

          <div className="border-t border-gray-300 mt-4 pt-4 space-y-3">
            <Row label="Date"   value={formattedDate} />
            <Row label="Time"   value={time} />
            <Row label="Type"   value={visitType === "in-person" ? "In-person visit" : "Video consultation"} />
            {reason && <Row label="Reason" value={reason} />}
          </div>
        </div>

        {/* Info Banner */}
        <div
          style={{ borderRadius: "10px" }}
          className="bg-[#EEF4FF] mt-5 border border-[#C7D7FE] text-sm rounded-xl p-2 flex gap-3"
        >
          <span className="text-blue-500">ℹ️</span>
          <p>
            You can reschedule or cancel up to 4 hours before your appointment
            without any fee.
          </p>
        </div>

        <div className="flex items-center gap-5 justify-between mt-7">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="text-gray-600 w-1/2 h-12 px-6 flex cursor-pointer items-center gap-2 disabled:opacity-50"
          >
            ← Back
          </button>

          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-[#0F93A5] w-1/2 text-white px-6 h-12 rounded-full flex items-center gap-2 justify-center font-bold disabled:opacity-60"
          >
            {isLoading ? "Booking..." : "✓ Confirm booking"}
          </Button>
        </div>
      </div>
    </div>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}