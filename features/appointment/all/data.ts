import api from "@/lib/axios";
import { Doctor, Review } from "@/types/doctor";

export interface DoctorWithReviews extends Doctor {
  reviews: Review[];
}

// Fetch all doctors with optional filters
export const fetchDoctors = async (params?: {
  specialisation?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ doctors: Doctor[]; pagination: any }> => {
  const res = await api.get("/doctors", { params });
  return res.data;
};

// Fetch all specialisations for filter chips
export const fetchSpecialisations = async (): Promise<string[]> => {
  const res = await api.get("/doctors/specialisations");
  return res.data.specialisations;
};

// Fetch single doctor with reviews
export const fetchDoctorById = async (
  id: string,
): Promise<DoctorWithReviews> => {
  const res = await api.get(`/doctors/${id}`);
  return { ...res.data.doctor, reviews: res.data.reviews };
};

// Fetch available slots for a doctor
export const fetchDoctorSlots = async (doctorId: string, date?: string) => {
  const res = await api.get(`/doctors/${doctorId}/slots`, {
    params: date ? { date } : {},
  });
  return res.data.slots;
};

export const doctorInfo = await fetchDoctors().then((res) => res.doctors);
