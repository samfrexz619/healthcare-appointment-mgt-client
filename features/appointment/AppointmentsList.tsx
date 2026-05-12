"use client";

import { useEffect, useState } from "react";
import { Appointment } from "@/types/doctor";
import { appointmentService } from "@/lib/services/appointmentService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentCard from "./AppointmentCard";
import clsx from "clsx";

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      await fetchAppointments();
    };

    loadAppointments();
  }, []);

  const now = new Date();

  const upcomingAppointments = appointments.filter((apt) => {
    if (!apt.slot_id || typeof apt.slot_id === "string") return false;
    const slotDate = new Date(apt.slot_id.slot_date);
    return slotDate > now && apt.status !== "cancelled";
  });

  const pastAppointments = appointments.filter((apt) => {
    if (!apt.slot_id || typeof apt.slot_id === "string") return false;
    const slotDate = new Date(apt.slot_id.slot_date);
    return slotDate <= now || apt.status === "cancelled";
  });

  if (loading) {
    return <div className="p-4 text-center">Loading appointments...</div>;
  }

  return (
    <section className="my-10 h-full">
      <h3 className="text-2xl font-bold text-black mb-6">My Appointments</h3>

      <Tabs
        defaultValue="upcoming"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="gap-3 bg-transparent border-b border-gray-200 rounded-none h-auto p-0 w-full justify-start">
          <TabsTrigger
            value="upcoming"
            className={clsx(
              "rounded-none border-b-2 px-4 py-3 font-semibold transition",
              activeTab === "upcoming"
                ? "border-[#0F93A5] text-[#0F93A5]"
                : "border-transparent text-gray-600 hover:text-gray-900",
            )}
          >
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className={clsx(
              "rounded-none border-b-2 px-4 py-3 font-semibold transition",
              activeTab === "past"
                ? "border-[#0F93A5] text-[#0F93A5]"
                : "border-transparent text-gray-600 hover:text-gray-900",
            )}
          >
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No upcoming appointments</p>
              <p className="text-sm mt-2">Book your first appointment</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((apt) => (
                <AppointmentCard
                  key={apt._id}
                  appointment={apt}
                  onRefresh={fetchAppointments}
                  isUpcoming
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No past appointments</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pastAppointments.map((apt) => (
                <AppointmentCard
                  key={apt._id}
                  appointment={apt}
                  onRefresh={fetchAppointments}
                  isUpcoming={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default AppointmentsList;
