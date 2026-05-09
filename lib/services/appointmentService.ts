import api from "@/lib/axios";

export const appointmentService = {
  // slotService or appointmentService
  bookAppointment: async (data: {
    slot_id: string;
    type: string;
    notes: string;
  }) => {
    const res = await api.post("/appointments", data);
    return res.data;
  },

  getMyAppointments: async () => {
    const res = await api.get("/appointments/me");
    return res.data;
  },

  cancel: async (id: string, reason?: string) => {
    const res = await api.patch(`/appointments/${id}/cancel`, { reason });
    return res.data;
  },

  reschedule: async (id: string, new_slot_id: string) => {
    const res = await api.patch(`/appointments/${id}/reschedule`, {
      new_slot_id,
    });
    return res.data;
  },

  complete: async (
    id: string,
    data: {
      diagnosis: string;
      notes?: string;
      prescriptions?: {
        medication: string;
        dosage: string;
        frequency: string;
        duration: string;
      }[];
    },
  ) => {
    const res = await api.patch(`/appointments/${id}/complete`, data);
    return res.data;
  },
};
