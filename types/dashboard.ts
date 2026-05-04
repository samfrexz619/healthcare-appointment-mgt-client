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
  id: number;
  name: string;
  speciality: string;
  numOfExperience: number;
  consultationFee: number;
  rating: number;
  ratingCount: number;
  reviewMessages: ReviewMessage[];
  onlineAvailability: boolean;
  offlineAvailability: boolean;
  hospitalName: string;
}