import api from "@/lib/axios";

export const reviewService = {
  create: async (data: {
    appointment_id: string;
    rating: number;
    comment?: string;
  }) => {
    const res = await api.post("/reviews", data);
    return res.data;
  },

  getDoctorReviews: async (doctorId: string, page = 1, limit = 10) => {
    const res = await api.get(`/reviews/doctor/${doctorId}`, {
      params: { page, limit },
    });
    return res.data;
  },
};
