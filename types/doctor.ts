export interface Review {
  _id: string;
  patient_id: {
    _id: string;
    first_name: string;
    last_name: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

export interface Doctor {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  certification?: string;
  phone?: string;
  specialisation: string;
  license_number: string;
  is_active: boolean;
  experience_years: number;
  fee: number;
  education?: string;
  certificate?: string;
  bio?: string;
  avatar?: string;
  availability_types: string[];
  clinic_name?: string;
  average_rating: number;
  rating: number;
  consultation_fee: number;
  total_reviews: number;
  created_at: string;
}

export interface Slot {
  _id: string;
  doctor_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  is_blocked: boolean;
  consultation_type?: string;
  location?: string;
  fee?: number;
}

interface AppointmentPartials {
  _id: string;
  first_name: string;
  last_name: string;
  specialisation?: string;
}

export interface Appointment {
  _id: string;
  patient_id:
    | string
    | {
        _id: string;
        first_name: string;
        last_name: string;
        email?: string;
        phone?: string;
      };
  doctor_id: string | AppointmentPartials;
  slot_id: Slot;
  status: "confirmed" | "cancelled" | "completed" | "rescheduled";
  type: "in-person" | "video";
  notes?: string;
  cancellation_reason?: string;
  is_reviewed?: boolean;
  review_rating?: number;
  review_comment?: string;
  booked_at: string;
}
