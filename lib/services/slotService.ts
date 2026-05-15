import api from "@/lib/axios";

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

  getByDoctor: async (doctorId: string, date?: string) => {
    const res = await api.get(`/doctors/${doctorId}/slots`, {
      params: date ? { date } : {},
    });

    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/slots/${id}`);
    return res.data;
  },
};
