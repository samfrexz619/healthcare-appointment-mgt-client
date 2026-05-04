import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.discriminatedUnion("role", [
  z
    .object({
      role: z.literal("patient"),
      first_name: z
        .string()
        .nonempty("First name is required")
        .min(1, "First name is required"),
      last_name: z.string().min(1, "Last name is required"),
      email: z.string().email("Valid email required"),
      password: z
        .string()
        .nonempty("Password is required")
        .min(8, "Password must be at least 8 characters"),

      confirmPassword: z
        .string()
        .nonempty("Please confirm your password")
        .min(1),
      phone: z.string().optional(),
      date_of_birth: z.string().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      nhs_number: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  z
    .object({
      role: z.literal("doctor"),
      first_name: z.string().min(1, "First name is required"),
      last_name: z.string().min(1, "Last name is required"),
      email: z.string().email("Valid email required"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
      phone: z.string().optional(),
      specialisation: z.string().min(1, "Specialisation is required"),
      license_number: z.string().min(1, "License number is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
]);

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
