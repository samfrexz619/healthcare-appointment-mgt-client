"use client";

import { useState } from "react";
import { Appointment, Slot } from "@/types/doctor";
import { appointmentService } from "@/lib/services/appointmentService";
import { slotService } from "@/lib/services/slotService";
import { reviewService } from "@/lib/services/reviewService";
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
import Image from "next/image";

interface AppointmentCardProps {
  appointment: Appointment;
  onRefresh: () => void;
  isUpcoming: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onRefresh,
  isUpcoming,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleSlot, setRescheduleSlot] = useState<Slot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);

  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const slot = appointment.slot_id;
  if (typeof slot === "string") return null;

  const appointmentDate = new Date(slot.slot_date);
  const formattedDate = appointmentDate.toLocaleDateString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const reviewSubmitted = appointment.is_reviewed === true;
  const reviewRating = appointment.review_rating
    ? Math.min(5, Math.max(0, appointment.review_rating))
    : 5;
  const submittedReviewComment = appointment.review_comment || "";

  const statusColor = {
    confirmed: "bg-blue-50 border-blue-200 text-blue-700",
    cancelled: "bg-red-50 border-red-200 text-red-700",
    completed: "bg-green-50 border-green-200 text-green-700",
    rescheduled: "bg-yellow-50 border-yellow-200 text-yellow-700",
  };

  const fetchAvailableSlots = async (dateString: string) => {
    try {
      setLoadingSlots(true);
      const doctorId = typeof appointment.doctor_id === "string"
        ? appointment.doctor_id
        : appointment.doctor_id._id || slot.doctor_id;
      const res = await slotService.getByDoctor(doctorId, {
        date: dateString,
        limit: 60,
      });
      const rawSlots = Array.isArray(res.slots)
        ? res.slots
        : Array.isArray(res)
        ? res
        : [];
      const currentSlotId = typeof appointment.slot_id === "string"
        ? appointment.slot_id
        : "_id" in appointment.slot_id
        ? appointment.slot_id._id
        : (appointment.slot_id as { id?: string }).id;

      const normalizedSlots = rawSlots.map(
        (slot: { _id?: string; id?: string } & Slot) => ({
          ...slot,
          _id: slot._id || slot.id,
        }),
      ) as Slot[];

      const available = normalizedSlots.filter(
        (s) => !s.is_booked && !s.is_blocked && s._id !== currentSlotId,
      );

      setAvailableSlots(available);
    } catch (err) {
      console.error("Failed to load slots:", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleDateChange = (value: string) => {
    setRescheduleDate(value);
    setRescheduleSlot(null);
    if (value) {
      fetchAvailableSlots(value);
    } else {
      setAvailableSlots([]);
    }
  };

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);
      await appointmentService.cancel(appointment._id, cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
      onRefresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Failed to cancel appointment:", err);
      alert(
        error.response?.data?.message ||
          "Failed to cancel appointment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleSlot) {
      alert("Please select a time slot");
      return;
    }

    const slotId = "_id" in rescheduleSlot
      ? rescheduleSlot._id
      : (rescheduleSlot as { id?: string }).id;

    if (!slotId) {
      alert("Selected slot does not have an ID. Please choose another slot.");
      return;
    }

    try {
      setIsSubmitting(true);
      await appointmentService.reschedule(appointment._id, slotId);
      setShowRescheduleModal(false);
      setRescheduleDate("");
      setRescheduleSlot(null);
      onRefresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Failed to reschedule appointment:", err);
      alert(
        error.response?.data?.message ||
          "Failed to reschedule appointment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewService.create({
        appointment_id: appointment._id,
        rating,
        comment: reviewComment || undefined,
      });
      setShowReviewModal(false);
      setRating(0);
      setReviewComment("");
      onRefresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Failed to submit review:", err);
      alert(
        error.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={clsx(
        "border rounded-lg p-6 bg-white transition",
        statusColor[appointment.status]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {formattedDate} • {slot.start_time} - {slot.end_time}
          </p>
          <h4 className="text-lg font-bold text-gray-900">
            {appointment.type === "in-person" ? "In-Person Visit" : "Video Call"}
          </h4>
        </div>

        <div className="text-right">
          <span
            className={clsx(
              "inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize",
              {
                "bg-blue-100 text-blue-700": appointment.status === "confirmed",
                "bg-red-100 text-red-700": appointment.status === "cancelled",
                "bg-green-100 text-green-700": appointment.status === "completed",
                "bg-yellow-100 text-yellow-700":
                  appointment.status === "rescheduled",
              }
            )}
          >
            {appointment.status}
          </span>
        </div>
      </div>

      {appointment.notes && (
        <div className="mb-4 p-3 bg-white bg-opacity-50 rounded text-sm text-gray-700">
          <p className="font-semibold mb-1">Reason:</p>
          <p>{appointment.notes}</p>
        </div>
      )}

      {appointment.status === "cancelled" &&
        appointment.cancellation_reason && (
          <div className="mb-4 p-3 bg-white bg-opacity-50 rounded text-sm text-gray-700">
            <p className="font-semibold mb-1">Cancellation Reason:</p>
            <p>{appointment.cancellation_reason}</p>
          </div>
        )}

      {/* Upcoming Appointment Actions */}
      {isUpcoming && appointment.status === "confirmed" && (
        <div className="flex gap-3 mt-6">
          {/* Cancel Button */}
          <Sheet open={showCancelModal} onOpenChange={setShowCancelModal}>
            <SheetTrigger asChild>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                Cancel
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white border-none w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-black">
                  Cancel Appointment
                </SheetTitle>
                <SheetDescription>
                  Please provide a reason for cancellation.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why you're cancelling..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#0F93A5]"
                  rows={5}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Keep Appointment
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Cancelling..." : "Confirm Cancel"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Reschedule Button */}
          <Sheet open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
            <SheetTrigger asChild>
              <Button className="flex-1 bg-[#0F93A5] hover:bg-[#0D7A8E] text-white rounded-lg">
                Reschedule
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white border-none w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-black">
                  Reschedule Appointment
                </SheetTitle>
                <SheetDescription>
                  Select a new date and time for your appointment.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {/* Date Input */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Select New Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => handleRescheduleDateChange(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#0F93A5]"
                  />
                </div>

                {/* Time Slots */}
                {rescheduleDate && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Select New Time
                    </label>
                    {loadingSlots ? (
                      <p className="text-sm text-gray-500">Loading available slots...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No available slots for this date
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((s) => (
                          <button
                            key={s._id}
                            onClick={() => setRescheduleSlot(s)}
                            className={clsx(
                              "p-2 rounded-lg border text-sm font-medium transition",
                              rescheduleSlot?._id === s._id
                                ? "border-[#0F93A5] bg-[#E6F6F8] text-[#0F93A5]"
                                : "border-gray-300 bg-white text-gray-700 hover:border-[#0F93A5]"
                            )}
                          >
                            {s.start_time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowRescheduleModal(false)}
                    className="flex-1 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReschedule}
                    disabled={isSubmitting || !rescheduleSlot}
                    className="flex-1 bg-[#0F93A5] hover:bg-[#0D7A8E] text-white rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Rescheduling..." : "Confirm"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Past Appointment Review */}
      {!isUpcoming && appointment.status === "completed" && (
        reviewSubmitted ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-gray-900">Review submitted</p>
            <div className="mt-3 flex items-center gap-1 text-yellow-400 text-xl">
              {Array.from({ length: reviewRating }, (_, index) => (
                <span key={index}>★</span>
              ))}
              {reviewRating < 5 &&
                Array.from({ length: 5 - reviewRating }, (_, index) => (
                  <span key={`empty-${index}`} className="text-gray-300">
                    ★
                  </span>
                ))}
            </div>
            {submittedReviewComment && (
              <p className="mt-3 text-sm text-gray-700">{submittedReviewComment}</p>
            )}
          </div>
        ) : (
          <Sheet open={showReviewModal} onOpenChange={setShowReviewModal}>
            <SheetTrigger asChild>
              <Button className="mt-6 w-full bg-[#0F93A5] hover:bg-[#0D7A8E] text-white rounded-lg">
                Leave a Review
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white border-none w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-black">
                  Leave a Review
                </SheetTitle>
                <SheetDescription>
                  Share your experience with this doctor
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {/* Star Rating */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition transform hover:scale-110"
                      >
                        <Image
                          src="/images/icons/star.png"
                          alt="star"
                          width={32}
                          height={32}
                          className={clsx(
                            "w-8 h-8",
                            star <= rating ? "opacity-100" : "opacity-30"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Comment */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Your Review (Optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#0F93A5]"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {reviewComment.length}/500
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReview}
                    disabled={isSubmitting || rating === 0}
                    className="flex-1 bg-[#0F93A5] hover:bg-[#0D7A8E] text-white rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )
      )}
    </div>
  );
};

export default AppointmentCard;
