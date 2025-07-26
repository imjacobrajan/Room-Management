export interface Room {
  _id?: string;
  roomId: string;
  roomName: string;
  hospitalBranch: string;
  floorName: string;
  roomNumber: string;
  wingBuilding: string;
  roomCategory: string;
  customCategory?: string;
  rentAmount: number;
  additionalCharges?: {
    nursingCharges: number;
    cleaningCharges: number;
    equipmentCharges: number;
  };
  packageRates?: {
    packageName: string;
    rate: number;
    duration: string;
  }[];
  facilities?: string[];
  capacity: {
    totalBeds: number;
    availableBeds: number;
    patientCapacity: number;
  };
  images?: string[];
  status: "Available" | "Occupied" | "Maintenance" | "Reserved" | "Blocked";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomRequest
  extends Omit<
    Room,
    "_id" | "roomId" | "createdAt" | "updatedAt" | "isActive"
  > {}

export interface RoomStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  averageRent: number;
  totalBeds: number;
  availableBeds: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface ConfigOptions {
  roomCategories: string[];
  wingBuildings: string[];
  facilities: string[];
  packageTypes: string[];
}
