"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentCategoryAll from "@/features/appointment/all/AppointmentCategoryAll";
import AppointmentsList from "@/features/appointment/AppointmentsList";
import { Doctor } from "@/types/doctor";
import { useEffect, useState } from "react";
import { fetchDoctors } from "@/features/appointment/all/data";

const AppointmentPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSection, setActiveSection] = useState("book");

  const categories = [
    "all",
    "Dermatology",
    "pediatrics",
    "traumatology",
    "Cardiology",
    "ophthalmology",
    "Obstetrics",
  ];

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);

        const params =
          activeCategory === "all" ? {} : { specialisation: activeCategory };

        const res = await fetchDoctors(params);

        setDoctors(res.doctors as Doctor[]);
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
      <h3 className="text-2xl font-bold text-black">Appointments</h3>

      {/* Main Tab: Book vs My Appointments */}
      <Tabs
        defaultValue="book"
        value={activeSection}
        onValueChange={setActiveSection}
        className="w-full mt-6"
      >
        <TabsList className="gap-3 bg-transparent border-b border-gray-200 rounded-none h-auto p-0 w-full justify-start">
          <TabsTrigger
            value="book"
            className="rounded-none border-b-2 px-4 py-3 font-semibold transition data-[state=active]:border-[#0F93A5] data-[state=active]:text-[#0F93A5] border-transparent text-gray-600"
          >
            Book Appointment
          </TabsTrigger>
          <TabsTrigger
            value="my-appointments"
            className="rounded-none border-b-2 px-4 py-3 font-semibold transition data-[state=active]:border-[#0F93A5] data-[state=active]:text-[#0F93A5] border-transparent text-gray-600"
          >
            My Appointments
          </TabsTrigger>
        </TabsList>

        {/* Book Appointment Section */}
        <div className={activeSection === "book" ? "block" : "hidden"}>
          <p className="mt-6 mb-4 text-sm text-gray-600">Category</p>

          <Tabs
            defaultValue="all"
            className="w-full"
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
        </div>

        {/* My Appointments Section */}
        <div className={activeSection === "my-appointments" ? "block" : "hidden"}>
          <AppointmentsList />
        </div>
      </Tabs>
    </section>
  );
};

export default AppointmentPage;
