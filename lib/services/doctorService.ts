import api from "@/lib/axios";

export const doctorService = {
  getDoctors: async (params?: {
    specialisation?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get("/doctors", { params });
    return res.data;
  },

  getSpecialisations: async () => {
    const res = await api.get("/doctors/specialisations");
    return res.data;
  },

  getDoctorById: async (id: string) => {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },

  getDoctorSlots: async (id: string, date?: string) => {
    const res = await api.get(`/doctors/${id}/slots`, {
      params: date ? { date } : {},
    });
    return res.data;
  },

  updateProfile: async (data: {
    phone?: string;
    experience_years?: number;
    fee?: number;
    education?: string;
    certificate?: string;
    bio?: string;
    avatar?: string;
    availability_types?: string[];
    clinic_name?: string;
  }) => {
    const res = await api.patch("/doctors/profile", data);
    return res.data;
  },
};
