"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { signUpSchema, SignUpFormData } from "./schema";
import TextInput from "@/components/ui/inputs/TextInput";
import Link from "next/link";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/authService";

const SPECIALISATIONS = [
  "General Practitioner",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Paediatrician",
  "Psychiatrist",
  "Radiologist",
  "Surgeon",
  "Orthopaedic",
  "Gynaecologist",
  "Other",
];

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUpForm = () => {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "patient" },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const { confirmPassword, ...payload } = data as any;
      await authService.signup(payload);

      // Redirect to login with a message to check email
      router.push(
        `/auth/login?email=${encodeURIComponent(data.email)}&verified=false`,
      );
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      if (
        (err as { response?: { status?: number } })?.response?.status === 409
      ) {
        setServerError("An account with this email already exists.");
      } else if (
        (err as { response?: { status?: number } })?.response?.status === 422
      ) {
        setServerError("Please check your details and try again.");
      } else {
        setServerError(message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (selectedRole: "patient" | "doctor") => {
    setRole(selectedRole);
    setValue("role", selectedRole);
  };

  const inputClass =
    "mt-1 w-full h-12 px-4 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F93A5]";
  const labelClass = "text-sm font-medium text-gray-700";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <form
      className="w-full mt-10 flex flex-col h-[80vh]"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Server error */}
      {serverError && (
        <div className="w-full bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {serverError}
        </div>
      )}
      <div className="flex-1 overflow-y-auto pr-2">
        {/* Role selector */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange("patient")}
            className={`flex-1 h-12 rounded-xl border text-sm font-semibold transition-all ${
              role === "patient"
                ? "bg-[#0F93A5] text-white border-[#0F93A5]"
                : "bg-white text-gray-600 border-gray-300 hover:border-[#0F93A5]"
            }`}
          >
            I am a Patient
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("doctor")}
            className={`flex-1 h-12 rounded-xl border text-sm font-semibold transition-all ${
              role === "doctor"
                ? "bg-[#0F93A5] text-white border-[#0F93A5]"
                : "bg-white text-gray-600 border-gray-300 hover:border-[#0F93A5]"
            }`}
          >
            I am a Doctor
          </button>
        </div>

        {/* First name + Last name */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Controller
              name="first_name"
              control={control}
              render={({ field }) => (
                <TextInput
                  id="first_name"
                  type="text"
                  label="First Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.first_name?.message}
                />
              )}
            />
          </div>
          <div className="flex-1">
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => (
                <TextInput
                  id="last_name"
                  type="text"
                  label="Last Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.last_name?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Email */}
        <div className="mt-5">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextInput
                id="email"
                type="email"
                label="Email"
                value={field.value}
                onChange={field.onChange}
                error={errors.email?.message}
              />
            )}
          />
        </div>

        {/* Phone */}
        <div className="mt-5">
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextInput
                id="phone"
                type="tel"
                label="Phone (optional)"
                value={field.value || ""}
                onChange={field.onChange}
                error={undefined}
              />
            )}
          />
        </div>

        {/* Patient specific fields */}
        {role === "patient" && (
          <>
            <div className="flex gap-3 mt-5">
              {/* Date of birth */}
              <div className="flex-1">
                <Controller
                  name="date_of_birth"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label htmlFor="date_of_birth" className={labelClass}>
                        Date of Birth
                      </label>
                      <input
                        id="date_of_birth"
                        type="date"
                        className={inputClass}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>

              {/* Gender */}
              <div className="flex-1">
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label htmlFor="gender" className={labelClass}>
                        Gender
                      </label>
                      <select
                        id="gender"
                        className={inputClass}
                        value={field.value || ""}
                        onChange={field.onChange}
                      >
                        <option value="" disabled>
                          Select gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* NHS Number */}
            <div className="mt-5">
              <Controller
                name="nhs_number"
                control={control}
                render={({ field }) => (
                  <TextInput
                    id="nhs_number"
                    type="text"
                    label="NHS Number (optional)"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={undefined}
                  />
                )}
              />
            </div>
          </>
        )}

        {/* Doctor specific fields */}
        {role === "doctor" && (
          <>
            {/* Specialisation */}
            <div className="mt-5">
              <Controller
                name="specialisation"
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="specialisation" className={labelClass}>
                      Specialisation
                    </label>
                    <select
                      id="specialisation"
                      className={inputClass}
                      value={field.value || ""}
                      onChange={field.onChange}
                    >
                      <option value="" disabled>
                        Select specialisation
                      </option>
                      {SPECIALISATIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {(errors as any).specialisation && (
                      <p className={errorClass}>
                        {(errors as any).specialisation.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* License number */}
            <div className="mt-5">
              <Controller
                name="license_number"
                control={control}
                render={({ field }) => (
                  <TextInput
                    id="license_number"
                    type="text"
                    label="License Number"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={(errors as any).license_number?.message}
                  />
                )}
              />
            </div>
          </>
        )}

        {/* Password */}
        <div className="mt-5">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextInput
                id="password"
                type="password"
                label="Password"
                value={field.value}
                onChange={field.onChange}
                error={errors.password?.message}
              />
            )}
          />
        </div>

        {/* Confirm Password */}
        <div className="mt-5">
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextInput
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                value={field.value}
                onChange={field.onChange}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="mt-10">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#0F93A5] rounded-[32px] w-full h-14 cursor-pointer text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
        <p className="text-center mt-2">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#0F93A5] font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SignUpForm;
