import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppointmentCategoryAll from '@/features/appointment/all/AppointmentCategoryAll'

const AppointmentPage = () => {

  const categories = [
    "all",
    "pyschology",
    "pediatrics",
    "traumatology",
    "opthalmogy",
    "dermatologist",
    "obstetrician",
  ];

  return (
    <section className='my-10 h-full'>
      <h3 className='text-2xl font-bold text-black'>Book Appointment</h3>
      <p className='mt-2'>Category</p>
      <Tabs defaultValue="all" className="w-full mt-10">
        <TabsList className='gap-3 bg-transparent'>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className='px-6 capitalize py-5 rounded-[40px] data-active:text-[#0F93A5] data-active:border-[#0F93A5] bg-white'>{category}</TabsTrigger>
          ))}
        </TabsList>
        <AppointmentCategoryAll />
        <TabsContent value="pyschology" className='mt-6'>Make changes to your account here.</TabsContent>
        <TabsContent value="pediatrics" className='mt-6'>Change your password here.</TabsContent>
      </Tabs>
    </section>
  )
}

export default AppointmentPage