"use client";

import { useState } from "react";
import { Appointment, Slot } from "@/types/doctor";
import { appointmentService } from "@/lib/services/appointmentService";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import clsx from "clsx";

interface DoctorAppointmentCardProps {
  appointment: Appointment;
  onRefresh: () => void;
}

type PrescriptionItem = {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
};

const DoctorAppointmentCard: React.FC<DoctorAppointmentCardProps> = ({
  appointment,
  onRefresh,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(
    [{ medication: "", dosage: "", frequency: "", duration: "" }],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slot = appointment.slot_id;
  if (typeof slot === "string") return null;

  const patientName =
    typeof appointment.patient_id === "string"
      ? "Patient"
      : `${appointment.patient_id.first_name} ${appointment.patient_id.last_name}`;
  const patientEmail =
    typeof appointment.patient_id === "string"
      ? ""
      : appointment.patient_id.email || "";
  const patientPhone =
    typeof appointment.patient_id === "string"
      ? ""
      : appointment.patient_id.phone || "";

  const appointmentDate = new Date(slot.slot_date);
  const formattedDate = appointmentDate.toLocaleDateString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);
      await appointmentService.cancel(appointment._id, cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
      onRefresh();
    } catch (err) {
      console.error("Doctor cancel failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    const prescriptionPayload = prescriptions.filter(
      (item) =>
        item.medication || item.dosage || item.frequency || item.duration,
    );

    try {
      setIsSubmitting(true);
      await appointmentService.complete(appointment._id, {
        diagnosis,
        notes,
        prescriptions: prescriptionPayload,
      });
      setShowCompleteModal(false);
      setDiagnosis("");
      setNotes("");
      setPrescriptions([{ medication: "", dosage: "", frequency: "", duration: "" }]);
      onRefresh();
    } catch (err) {
      console.error("Doctor complete failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePrescription = (
    index: number,
    field: keyof typeof prescriptions[number],
    value: string,
  ) => {
    setPrescriptions((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addPrescriptionRow = () => {
    setPrescriptions((prev) => [
      ...prev,
      { medication: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const removePrescriptionRow = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-black">{patientName}</h4>
          <p className="text-sm text-gray-600">{formattedDate}</p>
          <p className="text-sm text-gray-600">
            {slot.start_time} - {slot.end_time}
          </p>
          <p className="text-sm text-gray-600 capitalize">{appointment.type}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={clsx(
              "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase",
              {
                "bg-blue-100 text-blue-700": appointment.status === "confirmed",
                "bg-green-100 text-green-700": appointment.status === "completed",
                "bg-red-100 text-red-700": appointment.status === "cancelled",
                "bg-yellow-100 text-yellow-700":
                  appointment.status === "rescheduled",
              },
            )}
          >
            {appointment.status}
          </span>
          {appointment.is_reviewed && (
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Reviewed
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {patientEmail && (
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Email:</span> {patientEmail}
          </div>
        )}
        {patientPhone && (
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Phone:</span> {patientPhone}
          </div>
        )}
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Consultation type:</span> {slot.consultation_type}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Fee:</span> ${slot.fee}
        </div>
      </div>

      {appointment.cancellation_reason && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="font-semibold">Cancellation reason:</span> {appointment.cancellation_reason}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {(appointment.status === "confirmed" || appointment.status === "rescheduled") && (
          <Sheet open={showCancelModal} onOpenChange={setShowCancelModal}>
            <SheetTrigger asChild>
              <Button className="bg-red-500 text-white hover:bg-red-600 rounded-lg">
                Cancel
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-white border-none">
              <SheetHeader>
                <SheetTitle>Cancel Appointment</SheetTitle>
                <SheetDescription>
                  Provide a reason before cancelling this appointment.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation"
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F93A5]"
                  rows={4}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 bg-red-500 text-white hover:bg-red-600 rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Cancelling..." : "Confirm Cancel"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {(appointment.status !== "completed" && appointment.status !== "cancelled") && (
          <Sheet open={showCompleteModal} onOpenChange={setShowCompleteModal}>
            <SheetTrigger asChild>
              <Button className="bg-[#0F93A5] text-white hover:bg-[#0D7A8E] rounded-lg">
                Mark Completed
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl bg-white border-none overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Complete Appointment</SheetTitle>
                <SheetDescription>
                  Add diagnosis details and optional prescriptions.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Diagnosis
                  </label>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Enter diagnosis details"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F93A5]"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add follow-up instructions or notes"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F93A5]"
                    rows={4}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Prescriptions</p>
                    <Button
                      onClick={addPrescriptionRow}
                      className="bg-[#0F93A5] text-white hover:bg-[#0D7A8E] rounded-lg text-sm px-4"
                    >
                      Add prescription
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {prescriptions.map((item, index) => (
                      <div
                        key={index}
                        className="grid gap-2 rounded-lg border border-gray-200 p-3"
                      >
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            value={item.medication}
                            onChange={(e) =>
                              updatePrescription(index, "medication", e.target.value)
                            }
                            placeholder="Medication"
                            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F93A5]"
                          />
                          <input
                            value={item.dosage}
                            onChange={(e) =>
                              updatePrescription(index, "dosage", e.target.value)
                            }
                            placeholder="Dosage"
                            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F93A5]"
                          />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            value={item.frequency}
                            onChange={(e) =>
                              updatePrescription(index, "frequency", e.target.value)
                            }
                            placeholder="Frequency"
                            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F93A5]"
                          />
                          <input
                            value={item.duration}
                            onChange={(e) =>
                              updatePrescription(index, "duration", e.target.value)
                            }
                            placeholder="Duration"
                            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F93A5]"
                          />
                        </div>
                        <Button
                          onClick={() => removePrescriptionRow(index)}
                          className="ml-auto mt-2 bg-red-500 text-white hover:bg-red-600 rounded-lg text-sm"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowCompleteModal(false)}
                    className="flex-1 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#0F93A5] text-white hover:bg-[#0D7A8E] rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Marking complete..." : "Complete Appointment"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentCard;
