"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TabsContent } from "@/components/ui/tabs";
import CategoryCard from "../CategoryCard";
import DoctorDetail from "./DoctorDetail";
import { Doctor } from "@/types/doctor";

interface Props {
  doctors: Doctor[];
  isLoading: boolean;
  activeCategory: string;
}

const AppointmentCategory = ({ doctors, isLoading, activeCategory }: Props) => {
  const searchParams = useSearchParams();
  const doctorId = searchParams?.get("doctor");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const selectedDoctor = useMemo(() => {
    if (doctorId) {
      const doctorFromQuery = doctors.find((doctor) => doctor._id === doctorId);
      if (doctorFromQuery) return doctorFromQuery;
    }

    if (selectedDoctorId) {
      const selected = doctors.find((doctor) => doctor._id === selectedDoctorId);
      if (selected) return selected;
    }

    return doctors[0] ?? null;
  }, [doctors, doctorId, selectedDoctorId]);

  if (isLoading) {
    return (
      <TabsContent value={activeCategory} className="mt-6 px-2 flex gap-4">
        <section className="bg-white w-105 tracking-tighter p-4 rounded-lg h-125 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </section>

        <section className="flex-1 bg-white rounded-lg h-125 p-4">
          <div className="h-full bg-gray-100 rounded-xl animate-pulse" />
        </section>
      </TabsContent>
    );
  }

  return (
    <TabsContent value={activeCategory} className="mt-6 px-2 flex gap-4">
      <section className="bg-white w-105 tracking-tighter p-4 rounded-lg h-125 overflow-y-scroll space-y-3">
        <p>Choose Doctor</p>

        <div className="space-y-3">
          {doctors.map((info) => {
            return (
              <CategoryCard
                key={info._id}
                info={info}
                isActive={selectedDoctor?._id === info._id}
                onClick={() => setSelectedDoctorId(info._id)}
              />
            );
          })}
        </div>
      </section>

      <section className="flex-1 bg-white rounded-lg h-125 p-4 space-y-6 tracking-tighter overflow-y-scroll">
        {selectedDoctor ? (
          <DoctorDetail doctor={selectedDoctor} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No doctors found
          </div>
        )}
      </section>
    </TabsContent>
  );
};

export default AppointmentCategory;
