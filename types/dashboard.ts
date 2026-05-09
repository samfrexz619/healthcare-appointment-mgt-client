export interface PatientActivity {
  id: number;
  title: string;
  description?: string;
  icon: React.ReactNode;
  number: number;
  bgColor: string;
  color: string;
}

export interface ReviewMessage {
  id: number;
  reviewerName: string;
  reviewerRating: number;
  review: string;
  reviewDate: string; // ISO format recommended
}

export interface DoctorInfo {
  _id: string;
  name: string;
  specialisation: string;
  numOfExperience: number;
  consultation_fee: number;
  rating: number;
  ratingCount: number;
  reviewMessages: ReviewMessage[];
  onlineAvailability: boolean;
  offlineAvailability: boolean;
  hospitalName: string;
  education: string;
  average_rating: number;
  first_name: string;
  last_name: string;
  experience_years: number;
  certification: string;
  availability_types?: string[];
  clinic_name?: string;
}
