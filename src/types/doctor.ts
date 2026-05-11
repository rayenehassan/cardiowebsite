export type DoctorStatus = "active" | "archived";

export interface Doctor {
  id: string;
  displayOrder: number;
  name: string;
  subtitle: string;
  phone: string;
  email: string;
  photoUrl: string;
  status: DoctorStatus;
  createdAt: string;
  updatedAt: string;
}
