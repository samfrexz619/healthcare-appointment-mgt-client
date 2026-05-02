import api from "@/lib/axios";

export const authService = {
  signup: async (data: {
    email: string;
    password: string;
    role: "patient" | "doctor";
    first_name: string;
    last_name: string;
    phone?: string;
    date_of_birth?: string;
    gender?: "male" | "female" | "other";
    nhs_number?: string;
    specialisation?: string;
    license_number?: string;
  }) => {
    const res = await api.post("/auth/signup", data);
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
    window.location.href = "/auth/login";
  },

  me: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  verifyEmail: async (token: string) => {
    const res = await api.get(`/auth/verify-email?token=${token}`);
    return res.data;
  },

  resendVerification: async (email: string) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (token: string, password: string) => {
    const res = await api.post("/auth/reset-password", { token, password });
    return res.data;
  },
};
