"use client";

import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  MapPin,
  Star,
  Heart,
} from "lucide-react";
import PatientActivityCard from "./PatientActivityCard";
import Link from "next/link";
import { useAppContext } from "@/lib/context/AppContext";
import { useState, useEffect } from "react";
import { appointmentService } from "@/lib/services/appointmentService";
import { doctorService } from "@/lib/services/doctorService";
import { reviewService } from "@/lib/services/reviewService";
import { Doctor, Appointment } from "@/types/doctor";

interface Review {
  _id: string;
  patient_id?: { first_name: string; last_name: string };
  rating: number;
  comment?: string;
  created_at?: string;
}

const HomePage = () => {
  const { user } = useAppContext();
  const [patientActivities, setPatientActivities] = useState([
    {
      id: 1,
      title: "Upcoming visits",
      description: "Loading...",
      icon: <Calendar />,
      number: 0,
      bgColor: "#E5F8FA",
      color: "#0F93A5",
    },
    {
      id: 2,
      title: "Past visits",
      description: "Loading...",
      icon: <ClipboardList />,
      number: 0,
      bgColor: "#E7EFFE",
      color: "#2574F3",
    },
    {
      id: 3,
      title: "Appointment compliance",
      description: "Appointments kept",
      icon: <ClipboardList />,
      number: 0,
      bgColor: "#E7EFFE",
      color: "#2574F3",
    },
    {
      id: 4,
      title: "Days since last checkup",
      description: "Last health visit",
      icon: <Calendar />,
      number: 0,
      bgColor: "#E6F9F0",
      color: "#22A065",
    },
  ]);

  const [doctorActivities, setDoctorActivities] = useState([
    {
      id: 1,
      title: "Upcoming consultations",
      description: "Scheduled today",
      icon: <Calendar />,
      number: 0,
      bgColor: "#E5F8FA",
      color: "#0F93A5",
    },
    {
      id: 2,
      title: "Completed consultations",
      description: "This month",
      icon: <ClipboardList />,
      number: 0,
      bgColor: "#E7EFFE",
      color: "#2574F3",
    },
    {
      id: 3,
      title: "Average rating",
      description: "From patients",
      icon: <Star />,
      number: 0,
      bgColor: "#FEF6E6",
      color: "#F59F0A",
    },
    {
      id: 4,
      title: "Total patients",
      description: "All time",
      icon: <Heart />,
      number: 0,
      bgColor: "#E6F9F0",
      color: "#22A065",
    },
  ]);

  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [doctorReviews, setDoctorReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getMyAppointments();
      const appointments = res.appointments || [];

      // Calculate upcoming and past visits
      const now = new Date();
      const upcoming = appointments.filter((apt: Appointment) => {
        if (!apt.slot_id || typeof apt.slot_id === "string") return false;
        const slotDate = new Date(apt.slot_id.slot_date);
        return slotDate > now && apt.status !== "cancelled";
      });

      const past = appointments.filter((apt: Appointment) => {
        if (!apt.slot_id || typeof apt.slot_id === "string") return false;

        const slotDate = new Date(apt.slot_id.slot_date);

        // Only completed appointments in the past
        return slotDate <= now && apt.status !== "cancelled";
      });

      // Update patient activities (for patients)
      if (user?.role === "patient") {
        // Calculate days since last checkup
        let daysSinceLastCheckup = 0;
        if (past.length > 0) {
          const sortedPast = [...past].sort((a, b) => {
            const dateA =
              a.slot_id && typeof a.slot_id !== "string"
                ? new Date(a.slot_id.slot_date).getTime()
                : 0;
            const dateB =
              b.slot_id && typeof b.slot_id !== "string"
                ? new Date(b.slot_id.slot_date).getTime()
                : 0;
            return dateB - dateA; // Most recent first
          });
          const lastCheckup = sortedPast[0];
          if (lastCheckup.slot_id && typeof lastCheckup.slot_id !== "string") {
            const lastCheckupDate = new Date(lastCheckup.slot_id.slot_date);
            const today = new Date();
            daysSinceLastCheckup = Math.floor(
              (today.getTime() - lastCheckupDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );
          }
        }

        setPatientActivities((prev) =>
          prev.map((activity) => {
            switch (activity.id) {
              case 1:
                return {
                  ...activity,
                  number: upcoming.length,
                  description: "Scheduled visits",
                };
              case 2:
                return {
                  ...activity,
                  number: past.length,
                  description: "Completed visits",
                };
              case 3: {
                // Calculate appointment compliance rate
                const totalAppointments = upcoming.length + past.length;
                const keptAppointments = past.filter(
                  (apt: Appointment) => apt.status !== "cancelled",
                ).length;
                const complianceRate =
                  totalAppointments > 0
                    ? Math.round((keptAppointments / totalAppointments) * 100)
                    : 0;
                return {
                  ...activity,
                  number: complianceRate + "%",
                  description: `${keptAppointments}/${totalAppointments} kept`,
                };
              }
              case 4:
                return {
                  ...activity,
                  number: daysSinceLastCheckup,
                  description:
                    past.length > 0 ? "Since last visit" : "No checkups yet",
                };
              default:
                return activity;
            }
          }),
        );
      }

      // Update doctor activities (for doctors)
      if (user?.role === "doctor") {
        const avgRating = user.rating;

        setDoctorActivities((prev) =>
          prev.map((activity) => {
            switch (activity.id) {
              case 1:
                return {
                  ...activity,
                  number: upcoming.length,
                  description: "Scheduled today",
                };
              case 2:
                return {
                  ...activity,
                  number: past.length,
                  description: "This month",
                };
              case 3:
                return {
                  ...activity,
                  number: parseFloat(avgRating as string) || 0,
                  description: "From patients",
                };
              case 4:
                return {
                  ...activity,
                  number: new Set(
                    past.map((p: Appointment) =>
                      typeof p.patient_id === "string"
                        ? p.patient_id
                        : p.patient_id?._id,
                    ),
                  ).size,
                  description: "All time",
                };
              default:
                return activity;
            }
          }),
        );
      }

      // Set upcoming and past appointments with patient/doctor info based on role
      setUpcomingAppointments(upcoming.slice(0, 1));
      setPastAppointments(past);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorReviews = async () => {
    const doctorId = (user as { _id?: string; id?: string })?._id || user?.id;
    if (!doctorId) return;

    try {
      const res = await reviewService.getDoctorReviews(doctorId, 1, 10);
      setDoctorReviews(res.reviews || []);
    } catch (error) {
      console.error("Failed to load doctor reviews:", error);
    }
  };

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        await fetchAppointments();

        if (user?.role === "patient") {
          const doctorsRes = await doctorService.getDoctors({ limit: 3 });
          setRecommendedDoctors(doctorsRes.doctors || []);
        }

        if (user?.role === "doctor") {
          await fetchDoctorReviews();
        }
      } catch (error) {
        console.error("Failed to load home data:", error);
      }
    };

    if (user) {
      loadHomeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, user?.id]);

  const getAppointmentInfo = (apt: Appointment) => {
    if (user?.role === "doctor") {
      // Show patient info for doctors
      return {
        name:
          typeof apt.patient_id === "string"
            ? "Patient"
            : `${apt.patient_id?.first_name} ${apt.patient_id?.last_name}`,
        initials:
          typeof apt.patient_id === "string"
            ? "P"
            : `${apt.patient_id?.first_name?.[0]}${apt.patient_id?.last_name?.[0]}`,
        detail: typeof apt.patient_id === "string" ? "" : "Patient",
      };
    } else {
      // Show doctor info for patients
      return {
        name:
          typeof apt.doctor_id === "string"
            ? "Doctor"
            : `Dr. ${apt.doctor_id?.first_name} ${apt.doctor_id?.last_name}`,
        initials:
          typeof apt.doctor_id === "string"
            ? "D"
            : `${apt.doctor_id?.first_name?.[0]}${apt.doctor_id?.last_name?.[0]}`,
        detail:
          typeof apt.doctor_id === "string"
            ? ""
            : apt.doctor_id?.specialisation,
      };
    }
  };

  return (
    <section className="my-10 h-full">
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          <div className="w-full flex justify-between">
            <div className="">
              <h4 className="font-bold text-2xl font-mono">
                Welcome back,{" "}
                <span className="text-[#0F93A5] capitalize">
                  {user?.first_name}
                </span>
              </h4>
              <p className="text-gray-500">
                {user?.role === "doctor"
                  ? "Here is your patient appointments and reviews."
                  : "Here is your health summary and upcoming visits."}
              </p>
            </div>
            {user?.role === "patient" && (
              <Link href="/appointments" className="no-underline">
                <Button className="bg-[#0F93A5] text-white hover:bg-[#0D7D8C] cursor-pointer px-5 rounded-lg h-14">
                  <Calendar />
                  <span className="font-bold text-lg">Book an Appointment</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Patient Activity Cards - For both patient and doctor */}
          {(user?.role === "patient" || user?.role === "doctor") && (
            <section className="mt-16 grid grid-cols-2 gap-8">
              {(user?.role === "patient"
                ? patientActivities
                : doctorActivities
              ).map((activity) => (
                <PatientActivityCard key={activity.id} activity={activity} />
              ))}
            </section>
          )}

          {/* Upcoming Appointments Section */}
          <section className="mt-16 w-full">
            <div className="bg-white border border-gray-300 space-y-4 rounded-xl p-6 h-50">
              <section className="w-full flex justify-between">
                <div>
                  <h4 className="text-2xl font-medium">
                    {user?.role === "doctor"
                      ? "Upcoming Consultations"
                      : "Upcoming appointments"}
                  </h4>
                  <p className="text-gray-500">
                    {user?.role === "doctor"
                      ? "Your next patient visits"
                      : "Your next scheduled visits"}
                  </p>
                </div>
                <Link
                  href="/dashboard/appointments"
                  className="flex gap-2 hover:opacity-75 transition-opacity"
                >
                  <span>View all</span>
                  <ChevronRight />
                </Link>
              </section>
              <section className="border border-gray-300 w-full rounded-xl p-4 flex justify-between">
                {upcomingAppointments.length > 0 ? (
                  <>
                    <div className="flex gap-2">
                      <div className="size-10 rounded-full grid place-items-center bg-[#DCF1F9]">
                        <h4 className="uppercase font-medium text-[#1F627A]">
                          {getAppointmentInfo(upcomingAppointments[0]).initials}
                        </h4>
                      </div>
                      <div>
                        <div className="flex gap-2 items-center">
                          <p className="text-[14px] font-medium">
                            {getAppointmentInfo(upcomingAppointments[0]).name}
                          </p>
                          <div className="w-[120px] border border-[#C4E8D5] text-[#22A065] bg-[#E6F9F0] rounded-4xl flex items-center justify-center gap-2 py-1">
                            <i className="block size-2 rounded-full bg-[#22A065]"></i>
                            <p className="text-xs capitalize">
                              {upcomingAppointments[0].status}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs">
                          {getAppointmentInfo(upcomingAppointments[0]).detail} ·{" "}
                          {upcomingAppointments[0].type}
                        </p>
                      </div>
                    </div>
                    <div className="text-[14px] space-y-1">
                      <p className="text-black font-semibold">
                        {typeof upcomingAppointments[0].slot_id !== "string" &&
                        upcomingAppointments[0].slot_id
                          ? new Date(
                              upcomingAppointments[0].slot_id.slot_date,
                            ).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })
                          : "TBD"}
                      </p>
                      <div className="flex gap-2 items-center">
                        <MapPin size={14} />
                        <p>
                          {typeof upcomingAppointments[0].slot_id !==
                            "string" && upcomingAppointments[0].slot_id
                            ? `${upcomingAppointments[0].slot_id.start_time} · ${upcomingAppointments[0].slot_id.location || "TBD"}`
                            : "TBD"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full text-center py-4">
                    <p className="text-gray-500">No upcoming appointments</p>
                  </div>
                )}
              </section>
            </div>
          </section>

          {/* Past Appointments Section */}
          {pastAppointments.length > 0 && (
            <section className="mt-16 w-full">
              <div className="bg-white border border-gray-300 space-y-4 rounded-xl p-6">
                <section className="w-full">
                  <div>
                    <h4 className="text-2xl font-medium">
                      {user?.role === "doctor"
                        ? "Past Consultations"
                        : "Past appointments"}
                    </h4>
                    <p className="text-gray-500">
                      {user?.role === "doctor"
                        ? "Your completed patient visits"
                        : "Your completed visits"}
                    </p>
                  </div>
                </section>
                <section className="space-y-3">
                  {pastAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt._id}
                      className="border border-gray-300 rounded-lg p-4 flex justify-between"
                    >
                      <div className="flex gap-2">
                        <div className="size-10 rounded-full grid place-items-center bg-[#DCF1F9]">
                          <h4 className="uppercase font-medium text-[#1F627A]">
                            {getAppointmentInfo(apt).initials}
                          </h4>
                        </div>
                        <div>
                          <p className="text-[14px] font-medium">
                            {getAppointmentInfo(apt).name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {typeof apt.slot_id !== "string" && apt.slot_id
                              ? new Date(
                                  apt.slot_id.slot_date,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Date TBD"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium capitalize text-gray-600">
                          {apt.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </section>
          )}

          {/* Doctor Reviews Section - Only for doctors */}
          {user?.role === "doctor" && doctorReviews.length > 0 && (
            <section className="mt-16 w-full pb-10">
              <div className="bg-white border border-gray-300 space-y-4 rounded-xl p-6">
                <div>
                  <h4 className="text-2xl font-medium">Patient Reviews</h4>
                  <p className="text-gray-500">Feedback from your patients</p>
                </div>

                <section className="space-y-4 mt-5">
                  {doctorReviews.slice(0, 5).map((review) => (
                    <div
                      key={review._id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[14px] font-medium text-black">
                            {review.patient_id
                              ? `${review.patient_id.first_name} ${review.patient_id.last_name}`
                              : "Anonymous Patient"}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-gray-700 mt-2">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </section>
              </div>
            </section>
          )}

          {/* Recommended Doctors - Only for patients */}
          {user?.role === "patient" && (
            <section className="mt-16 w-full pb-10">
              <div className="bg-white border border-gray-300 space-y-4 rounded-xl p-6">
                <div>
                  <h4 className="text-2xl font-medium">Recommended doctors</h4>
                  <p className="text-gray-500">Available today</p>
                </div>

                <section className="space-y-5 mt-5">
                  {recommendedDoctors.map((doctor: Doctor) => (
                    <div
                      key={doctor._id}
                      className="w-full flex justify-between"
                    >
                      <div className="flex gap-2">
                        <div className="size-10 grid place-items-center bg-[#DDE8F9] rounded-full">
                          <p className="text-[#1E477B] uppercase">
                            {doctor.first_name?.[0]}
                            {doctor.last_name?.[0]}
                          </p>
                        </div>
                        <div>
                          <p className="text-[14px] text-black font-medium">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {doctor.specialisation}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/appointments?doctor=${doctor._id}`}
                      >
                        <Button className="bg-[#F7FAFC] cursor-pointer border border-gray-400 h-10 text-black w-20 font-semibold hover:bg-[#0F93A5] hover:text-white">
                          Book
                        </Button>
                      </Link>
                    </div>
                  ))}
                </section>
              </div>
            </section>
          )}
        </>
      )}
    </section>
  );
};

export default HomePage;
