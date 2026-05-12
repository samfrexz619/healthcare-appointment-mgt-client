"use client";

import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartPulse,
  MapPin,
} from "lucide-react";
import PatientActivityCard from "./PatientActivityCard";
import Link from "next/link";
import { useAppContext } from "@/lib/context/AppContext";
import { useState, useEffect } from "react";
import { appointmentService } from "@/lib/services/appointmentService";
import { doctorService } from "@/lib/services/doctorService";
import { Doctor, Appointment } from "@/types/doctor";

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
      title: "Active prescriptions",
      icon: <FileText />,
      number: 0,
      bgColor: "#FEF6E6",
      color: "#F59F0A",
    },
    {
      id: 4,
      title: "Wellness score",
      description: "8% vs last week",
      icon: <HeartPulse />,
      number: 86,
      bgColor: "#E6F9F0",
      color: "#22A065",
    },
  ]);

  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
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
        return slotDate <= now || apt.status === "cancelled";
      });

      // Update patient activities
      setPatientActivities(prev => prev.map(activity => {
        switch (activity.id) {
          case 1:
            return { ...activity, number: upcoming.length, description: "Scheduled visits" };
          case 2:
            return { ...activity, number: past.length, description: "Completed visits" };
          case 3:
            return { ...activity, number: 0 };
          default:
            return activity;
        }
      }));

      // Set upcoming and past appointments
      setUpcomingAppointments(upcoming.slice(0, 1));
      setPastAppointments(past);

    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        await fetchAppointments();

        // Load recommended doctors
        const doctorsRes = await doctorService.getDoctors({ limit: 3 });
        setRecommendedDoctors(doctorsRes.doctors || []);

      } catch (error) {
        console.error("Failed to load home data:", error);
      }
    };

    if (user) {
      loadHomeData();
    }
  }, [user]);

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
                Here&apos;s your health summary and upcoming visits.
          </p>
        </div>
        <Link href="/dashboard/appointments" className="no-underline">
          <Button className="bg-[#0F93A5] text-white hover:bg-[#0D7D8C] cursor-pointer px-5 rounded-lg h-14">
            <Calendar />
            <span className="font-bold text-lg">Book an Appointment</span>
          </Button>
        </Link>
      </div>
      <section className="mt-16 grid grid-cols-2 gap-8">
        {patientActivities.map((activity) => (
          <PatientActivityCard key={activity.id} activity={activity} />
        ))}
      </section>
      <section className="mt-16 w-full">
        <div className="bg-white border border-gray-300 space-y-4 rounded-xl p-6 h-50">
          <section className="w-full flex justify-between">
            <div>
              <h4 className="text-2xl font-medium">Upcoming appointments</h4>
              <p className="text-gray-500">Your next scheduled visits</p>
            </div>
            <Link href="/dashboard/appointments" className="flex gap-2 hover:opacity-75 transition-opacity">
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
                      {typeof upcomingAppointments[0].doctor_id !== 'string' && (
                        <>
                          {upcomingAppointments[0].doctor_id?.first_name?.[0]}
                          {upcomingAppointments[0].doctor_id?.last_name?.[0]}
                        </>
                      )}
                    </h4>
                  </div>
                  <div>
                    <div className="flex gap-2 items-center">
                      <p className="text-[14px] font-medium">
                        {typeof upcomingAppointments[0].doctor_id !== 'string' 
                          ? `Dr. ${upcomingAppointments[0].doctor_id?.first_name} ${upcomingAppointments[0].doctor_id?.last_name}`
                          : 'Doctor'}
                      </p>
                      <div className="w-[120px] border border-[#C4E8D5] text-[#22A065] bg-[#E6F9F0] rounded-4xl flex items-center justify-center gap-2 py-1">
                        <i className="block size-2 rounded-full bg-[#22A065]"></i>
                        <p className="text-xs capitalize">{upcomingAppointments[0].status}</p>
                      </div>
                    </div>
                    <p className="text-xs">
                      {typeof upcomingAppointments[0].doctor_id !== 'string'
                        ? `${upcomingAppointments[0].doctor_id?.specialisation} · ${upcomingAppointments[0].type}`
                        : upcomingAppointments[0].type}
                    </p>
                  </div>
                </div>
                <div className="text-[14px] space-y-1">
                  <p className="text-black font-semibold">
                    {typeof upcomingAppointments[0].slot_id !== 'string' && upcomingAppointments[0].slot_id
                      ? new Date(upcomingAppointments[0].slot_id.slot_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'TBD'}
                  </p>
                  <div className="flex gap-2 items-center">
                    <MapPin size={14} />
                    <p>
                      {typeof upcomingAppointments[0].slot_id !== 'string' && upcomingAppointments[0].slot_id
                        ? `${upcomingAppointments[0].slot_id.start_time} · ${upcomingAppointments[0].slot_id.location || 'TBD'}`
                        : 'TBD'}
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

      {pastAppointments.length > 0 && (
        <section className="mt-16 w-full">
          <div className="bg-white border border-gray-300 space-y-4 rounded-xl p-6">
            <section className="w-full">
              <div>
                <h4 className="text-2xl font-medium">Past appointments</h4>
                <p className="text-gray-500">Your completed visits</p>
              </div>
            </section>
            <section className="space-y-3">
              {pastAppointments.slice(0, 3).map((apt) => (
                <div key={apt._id} className="border border-gray-300 rounded-lg p-4 flex justify-between">
                  <div className="flex gap-2">
                    <div className="size-10 rounded-full grid place-items-center bg-[#DCF1F9]">
                      <h4 className="uppercase font-medium text-[#1F627A]">
                        {typeof apt.doctor_id !== 'string' && (
                          <>
                            {apt.doctor_id?.first_name?.[0]}
                            {apt.doctor_id?.last_name?.[0]}
                          </>
                        )}
                      </h4>
                    </div>
                    <div>
                      <p className="text-[14px] font-medium">
                        {typeof apt.doctor_id !== 'string' 
                          ? `Dr. ${apt.doctor_id?.first_name} ${apt.doctor_id?.last_name}`
                          : 'Doctor'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeof apt.slot_id !== 'string' && apt.slot_id
                          ? new Date(apt.slot_id.slot_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Date TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium capitalize text-gray-600">{apt.status}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </section>
      )}

      <section className="mt-16 w-full pb-10">
        <div className="bg-white border border-gray-300 space-y-4 rounded-xl p-6">
          <div>
            <h4 className="text-2xl font-medium">Recommended doctors</h4>
            <p className="text-gray-500">Available today</p>
          </div>

          <section className="space-y-5 mt-5">
            {recommendedDoctors.map((doctor: Doctor) => (
              <div key={doctor._id} className="w-full flex justify-between">
                <div className="flex gap-2">
                  <div className="size-10 grid place-items-center bg-[#DDE8F9] rounded-full">
                    <p className="text-[#1E477B] uppercase">
                      {doctor.first_name?.[0]}{doctor.last_name?.[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] text-black font-medium">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </p>
                    <p className="text-gray-400 text-xs">{doctor.specialisation}</p>
                  </div>
                </div>
                <Link href={`/dashboard/appointments?doctor=${doctor._id}`}>
                  <Button className="bg-[#F7FAFC] cursor-pointer border border-gray-400 h-10 text-black w-20 font-semibold hover:bg-[#0F93A5] hover:text-white">
                    Book
                  </Button>
                </Link>
              </div>
            ))}
          </section>
        </div>
      </section>
        </>
      )}
    </section>
  );
};

export default HomePage;
