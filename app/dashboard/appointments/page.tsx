"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentCategoryAll from "@/features/appointment/all/AppointmentCategoryAll";
import { DoctorInfo } from "@/types/dashboard";
import { useEffect, useState } from "react";
import { fetchDoctors } from "@/features/appointment/all/data";

const AppointmentPage = () => {
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    "all",
    "Dermatology",
    "pediatrics",
    "traumatology",
    "Cardiology",
    "ophthalmology",
    // "Psychology",
    "Obstetrics",
  ];

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);

        const params =
          activeCategory === "all" ? {} : { specialisation: activeCategory };

        const res = await fetchDoctors(params);

        setDoctors(res.doctors);
        console.log("Fetched doctors:", doctors);
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [activeCategory]);

  return (
    <section className="my-10 h-full">
      <h3 className="text-2xl font-bold text-black">Book Appointment</h3>

      <p className="mt-2">Category</p>

      <Tabs
        defaultValue="all"
        className="w-full mt-10"
        onValueChange={setActiveCategory}
      >
        <TabsList className="gap-3 bg-transparent flex-wrap">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="
                px-6 capitalize py-5 rounded-[40px]
                data-[state=active]:text-[#0F93A5]
                data-[state=active]:bg-white
                data-[state=active]:border-[#0F93A5]
                bg-white
              "
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <AppointmentCategoryAll
          doctors={doctors}
          isLoading={loading}
          activeCategory={activeCategory}
        />
      </Tabs>
    </section>
  );
};

export default AppointmentPage;
