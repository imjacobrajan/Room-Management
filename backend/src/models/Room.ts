import mongoose, { Document, Schema } from "mongoose";

export interface IRoom extends Document {
  roomId: string;
  roomName: string;
  hospitalBranch: string;
  floorName: string;
  roomNumber: string;
  wingBuilding: string;
  roomCategory: string;
  customCategory?: string;
  rentAmount: number;
  additionalCharges: {
    nursingCharges: number;
    cleaningCharges: number;
    equipmentCharges: number;
  };
  packageRates: {
    packageName: string;
    rate: number;
    duration: string;
  }[];
  facilities: string[];
  capacity: {
    totalBeds: number;
    availableBeds: number;
    patientCapacity: number;
  };
  images: string[];
  status: "Available" | "Occupied" | "Maintenance" | "Reserved" | "Blocked";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      default: () => `RM${Math.floor(Math.random() * 1000000)}`,
    },
    roomName: {
      type: String,
      required: true,
    },
    hospitalBranch: {
      type: String,
      required: true,
    },
    floorName: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    wingBuilding: {
      type: String,
      required: true,
    },
    roomCategory: {
      type: String,
      required: true,
    },
    customCategory: {
      type: String,
    },
    rentAmount: {
      type: Number,
      required: true,
    },
    additionalCharges: {
      nursingCharges: { type: Number, default: 0 },
      cleaningCharges: { type: Number, default: 0 },
      equipmentCharges: { type: Number, default: 0 },
    },
    packageRates: [
      {
        packageName: String,
        rate: Number,
        duration: String,
      },
    ],
    facilities: [
      {
        type: String,
      },
    ],
    capacity: {
      totalBeds: { type: Number, required: true },
      availableBeds: { type: Number, required: true },
      patientCapacity: { type: Number, required: true },
    },
    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance", "Reserved", "Blocked"],
      default: "Available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRoom>("Room", roomSchema);
