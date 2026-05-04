"use client"

import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs"
import CategoryCard from "../CategoryCard";
import { doctorInfo } from "./data";
import DoctorDetail from "./DoctorDetail";
import { DoctorInfo } from "@/types/dashboard";

const AppointmentCategory = () => {

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfo>(doctorInfo[0]);

  return (
    <TabsContent value="all" className='mt-6 px-2 flex gap-4'>
      <section className='bg-white w-105 tracking-tighter p-4 rounded-lg h-125 overflow-y-scroll space-y-3'>
        <p>Choose Doctor</p>
        <div className="space-y-3">
          {doctorInfo.map(info => (
            <CategoryCard key={info.id} info={info} isActive={selectedDoctor.id === info.id} onClick={() => setSelectedDoctor(info)} />
          ))}
        </div>
      </section>
      <section className='flex-1 bg-white rounded-lg h-125 p-4 space-y-6 tracking-tighter overflow-y-scroll'>
        <DoctorDetail doctor={selectedDoctor} />
      </section>
    </TabsContent>
  )
}

export default AppointmentCategory