"use client";

import { useAppContext, UserProfile } from "@/lib/context/AppContext";
import {
  BadgeCheck,
  BriefcaseMedical,
  Building2,
  CalendarDays,
  Clock3,
  GraduationCap,
  IdCard,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  User,
  Wallet,
} from "lucide-react";

type ProfileValue = string | number | boolean | string[] | null | undefined;

interface ProfileField {
  label: string;
  value: ProfileValue;
  icon: React.ReactNode;
}

interface ProfileSectionProps {
  title: string;
  description: string;
  fields: ProfileField[];
}

const formatDate = (value: unknown) => {
  if (typeof value !== "string" || !value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatValue = (value: ProfileValue) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Not provided";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return String(value);
};

const getInitials = (user: UserProfile | null) =>
  `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() ||
  "U";

const profileValue = (user: UserProfile | null, key: string): ProfileValue =>
  user?.[key] as ProfileValue;

const ProfileSection = ({
  title,
  description,
  fields,
}: ProfileSectionProps) => (
  <section className="bg-white border border-gray-200 rounded-xl p-6">
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-black">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => (
        <div
          key={field.label}
          className="border border-gray-200 rounded-lg p-4 flex gap-3 min-h-24"
        >
          <div className="size-10 rounded-lg bg-[#E5F8FA] text-[#0F93A5] grid place-items-center shrink-0">
            {field.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">{field.label}</p>
            <p className="text-sm font-semibold text-black mt-1 break-words">
              {formatValue(field.value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: ProfileValue;
  icon: React.ReactNode;
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
    <div className="size-11 rounded-lg bg-[#E6F9F0] text-[#22A065] grid place-items-center">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-black mt-1">{formatValue(value)}</p>
    </div>
  </div>
);

const ProfilePage = () => {
  const { user, isLoadingUser } = useAppContext();

  if (isLoadingUser) {
    return (
      <section className="my-10 h-full">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </section>
    );
  }

  const isDoctor = user?.role === "doctor";
  const fullName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "User";

  const patientFields: ProfileField[] = [
    { label: "First name", value: user?.first_name, icon: <User size={18} /> },
    { label: "Last name", value: user?.last_name, icon: <User size={18} /> },
    { label: "Email address", value: user?.email, icon: <Mail size={18} /> },
    {
      label: "Account created",
      value: formatDate(user?.created_at),
      icon: <CalendarDays size={18} />,
    },
  ];

  const doctorFields: ProfileField[] = [
    { label: "First name", value: user?.first_name, icon: <User size={18} /> },
    { label: "Last name", value: user?.last_name, icon: <User size={18} /> },
    { label: "Email address", value: user?.email, icon: <Mail size={18} /> },
    { label: "Phone number", value: profileValue(user, "phone"), icon: <Phone size={18} /> },
    {
      label: "Specialisation",
      value: profileValue(user, "specialisation"),
      icon: <Stethoscope size={18} />,
    },
    {
      label: "License number",
      value: profileValue(user, "license_number"),
      icon: <IdCard size={18} />,
    },
    {
      label: "Clinic",
      value: profileValue(user, "clinic_name"),
      icon: <Building2 size={18} />,
    },
    {
      label: "Availability",
      value: profileValue(user, "availability_types"),
      icon: <Clock3 size={18} />,
    },
  ];

  const doctorProfessionalFields: ProfileField[] = [
    {
      label: "Education",
      value: profileValue(user, "education"),
      icon: <GraduationCap size={18} />,
    },
    {
      label: "Certification",
      value: profileValue(user, "certification"),
      icon: <BadgeCheck size={18} />,
    },
    {
      label: "Bio",
      value: profileValue(user, "bio"),
      icon: <BriefcaseMedical size={18} />,
    },
    {
      label: "Account updated",
      value: formatDate(user?.updated_at),
      icon: <CalendarDays size={18} />,
    },
  ];

  return (
    <section className="my-10 h-full pb-10">
      <div className="mb-8">
        <h1 className="font-bold text-2xl font-mono text-black">Profile</h1>
        <p className="text-gray-500">
          {isDoctor
            ? "Your public doctor profile and practice details."
            : "Your patient account details."}
        </p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-xl bg-[#0F93A5] text-white grid place-items-center shrink-0">
              <p className="text-2xl font-bold">{getInitials(user)}</p>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-black capitalize">
                  {isDoctor ? `Dr. ${fullName}` : fullName}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-4xl border border-[#C4E8D5] bg-[#E6F9F0] text-[#22A065] px-3 py-1 text-xs font-semibold capitalize">
                  <ShieldCheck size={14} />
                  {user?.is_verified ? "Verified" : "Unverified"}
                </span>
              </div>
              <p className="text-sm text-gray-500 capitalize mt-1">
                {isDoctor
                  ? profileValue(user, "specialisation") || "Doctor"
                  : "Patient"}
              </p>
              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">Role</p>
            <p className="text-sm font-bold text-[#0F93A5] capitalize mt-1">
              {user?.role || "User"}
            </p>
          </div>
        </div>
      </section>

      {isDoctor && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard
            label="Experience"
            value={`${formatValue(profileValue(user, "experience_years"))} years`}
            icon={<BriefcaseMedical size={18} />}
          />
          <StatCard
            label="Consultation fee"
            value={`£${formatValue(profileValue(user, "consultation_fee"))}`}
            icon={<Wallet size={18} />}
          />
          <StatCard
            label="Rating"
            value={`${formatValue(
              profileValue(user, "average_rating") || profileValue(user, "rating"),
            )} / 5`}
            icon={<Star size={18} />}
          />
        </section>
      )}

      <div className="space-y-8">
        <ProfileSection
          title={isDoctor ? "Doctor Details" : "Patient Details"}
          description={
            isDoctor
              ? "Information patients see when booking appointments."
              : "Your core patient account information."
          }
          fields={isDoctor ? doctorFields : patientFields}
        />

        {isDoctor && (
          <ProfileSection
            title="Professional Information"
            description="Qualifications, biography, and account activity."
            fields={doctorProfessionalFields}
          />
        )}
      </div>
    </section>
  );
};

export default ProfilePage;
