export type Gender = "male" | "female";
export type BedStatus = "vacant" | "occupied" | "reserved";
export type RoomFacing = "front" | "back";
export type PaymentStatus = "paid" | "unpaid";
export type ComplaintUrgency = "low" | "medium" | "high";
export type ComplaintStatus = "open" | "in_progress" | "resolved";

export interface Student {
  id: string;
  auth_user_id: string | null;
  reg_no: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender: Gender;
  department_id: string;
  level: string;
  session: string;
}

export interface Hostel {
  id: string;
  name: string;
  gender: Gender;
  short_code: string;
}

export interface Bed {
  id: string;
  bed_slot: number;
  status: BedStatus;
}

export interface Room {
  id: string;
  code: string;
  facing: RoomFacing;
  capacity: number;
  beds: Bed[];
}

export interface Floor {
  id: string;
  label: string;
  rooms: Room[];
}

export interface Booking {
  id: string;
  status: "confirmed" | "cancelled";
  booked_at: string;
  session: string;
  beds: {
    bed_slot: number;
    rooms: {
      id: string;
      code: string;
      facing: RoomFacing;
      floors: { label: string; hostels: { name: string } };
    };
  };
}

export interface Complaint {
  id: string;
  room_id: string;
  category: string;
  urgency: ComplaintUrgency;
  description: string;
  status: ComplaintStatus;
  created_at: string;
}

export interface OccupancyReportRow {
  hostel: string;
  gender: Gender;
  total_beds: number;
  occupied_beds: number;
  vacant_beds: number;
  occupancy_rate: number;
}
