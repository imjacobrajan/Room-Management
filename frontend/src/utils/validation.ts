import { z } from "zod";

export const roomValidationSchema = z.object({
  roomName: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name too long"),
  hospitalBranch: z.string().min(1, "Hospital branch is required"),
  floorName: z.string().min(1, "Floor name is required"),
  roomNumber: z
    .string()
    .min(1, "Room number is required")
    .max(20, "Room number too long"),
  wingBuilding: z.string().min(1, "Wing/Building is required"),
  roomCategory: z.string().min(1, "Room category is required"),
  customCategory: z.string().optional(),
  rentAmount: z.number().min(0, "Rent amount must be positive"),

  additionalCharges: z
    .object({
      nursingCharges: z.number().min(0),
      cleaningCharges: z.number().min(0),
      equipmentCharges: z.number().min(0),
    })
    .optional(),

  packageRates: z
    .array(
      z.object({
        packageName: z.string().min(1, "Package name is required"),
        rate: z.number().min(0, "Rate must be positive"),
        duration: z.string().min(1, "Duration is required"),
      })
    )
    .optional(),
  facilities: z.array(z.string()).optional(),
  capacity: z.object({
    totalBeds: z.number().min(1, "Total beds must be at least 1"),
    availableBeds: z.number().min(0, "Available beds cannot be negative"),
    patientCapacity: z.number().min(1, "Patient capacity must be at least 1"),
  }),
  status: z.enum([
    "Available",
    "Occupied",
    "Maintenance",
    "Reserved",
    "Blocked",
  ]),
});

export type RoomFormData = z.infer<typeof roomValidationSchema>;
