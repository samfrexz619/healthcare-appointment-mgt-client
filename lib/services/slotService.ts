import api from "@/lib/axios";

interface GetDoctorSlotsParams {
  date?: string;
  type?: "online" | "offline";
  page?: number;
  limit?: number;
}

export const slotService = {
  create: async (data: {
    slot_date?: string;
    slot_dates?: string[];
    start_time: string;
    end_time: string;
    consultation_type: "online" | "offline";
    location?: string;
    fee: number;
    repeat?: {
      frequency: "none" | "daily" | "weekly" | "monthly";
      count: number;
    };
  }) => {
    const res = await api.post("/slots", data);
    return res.data;
  },

  getByDoctor: async (
    doctorId: string,
    paramsOrDate?: string | GetDoctorSlotsParams,
  ) => {
    const params =
      typeof paramsOrDate === "string"
        ? { date: paramsOrDate }
        : paramsOrDate || {};

    const res = await api.get(`/doctors/${doctorId}/slots`, {
      params,
    });

    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/slots/${id}`);
    return res.data;
  },
};
