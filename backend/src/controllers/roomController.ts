import { Request, Response } from "express";
import Room from "../models/Room";
import {
  roomValidationSchema,
  updateRoomValidationSchema,
} from "../utils/validation";
import { ZodError } from "zod";
import {
  uploadImagesToCloudinary,
  deleteImagesFromCloudinary,
  MulterRequest,
} from "../services/cloudinaryService";

class RequestParser {
  static parseFormData(body: any): any {
    const parsed = { ...body };

    const jsonFields = [
      "additionalCharges",
      "packageRates",
      "facilities",
      "capacity",
    ];

    jsonFields.forEach((field) => {
      if (typeof parsed[field] === "string") {
        try {
          parsed[field] = JSON.parse(parsed[field]);
        } catch (error) {
          throw new Error(`Invalid JSON format for ${field}`);
        }
      }
    });

    if (parsed.rentAmount) {
      parsed.rentAmount = Number(parsed.rentAmount);
      if (isNaN(parsed.rentAmount)) {
        throw new Error("Invalid rent amount format");
      }
    }

    return parsed;
  }
}

class ErrorHandler {
  static handleError(error: unknown, res: Response): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (error instanceof Error && error.message.includes("JSON")) {
      res.status(400).json({
        success: false,
        message: "Invalid data format",
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : "Unknown error"
          : "Something went wrong",
    });
  }
}

const getFilesArray = (
  files:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined
): Express.Multer.File[] => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  return Object.values(files).flat();
};

export const createRoom = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  let uploadedImageUrls: string[] = [];

  try {
    const parsedBody = RequestParser.parseFormData(req.body);
    const validatedData = roomValidationSchema.parse(parsedBody);

    const filesArray = getFilesArray(req.files);
    if (filesArray.length) {
      uploadedImageUrls = await uploadImagesToCloudinary(filesArray);
    }

    const roomData = {
      ...validatedData,
      images: uploadedImageUrls,
    };

    const room = new Room(roomData);
    await room.save();

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    if (uploadedImageUrls.length) {
      await deleteImagesFromCloudinary(uploadedImageUrls);
    }
    ErrorHandler.handleError(error, res);
  }
};

export const getAllRooms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, status, branch } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const filter: Record<string, any> = { isActive: true };

    if (search && typeof search === "string") {
      filter.$or = [
        { roomName: { $regex: search, $options: "i" } },
        { roomNumber: { $regex: search, $options: "i" } },
        { roomId: { $regex: search, $options: "i" } },
      ];
    }

    if (status && typeof status === "string") {
      filter.status = status;
    }

    if (branch && typeof branch === "string") {
      filter.hospitalBranch = branch;
    }

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      Room.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: rooms,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    });
  } catch (error) {
    ErrorHandler.handleError(error, res);
  }
};

export const getRoomById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await Room.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
      });
      return;
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    ErrorHandler.handleError(error, res);
  }
};

export const updateRoom = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  let newImageUrls: string[] = [];

  try {
    const { id } = req.params;

    const existingRoom = await Room.findOne({
      _id: id,
      isActive: true,
    });

    if (!existingRoom) {
      res.status(404).json({
        success: false,
        message: "Room not found",
      });
      return;
    }

    const parsedBody = RequestParser.parseFormData(req.body);
    const validatedData = updateRoomValidationSchema.parse(parsedBody);

    let imageUrls = existingRoom.images || [];

    const filesArray = getFilesArray(req.files);
    if (filesArray.length) {
      if (existingRoom.images?.length) {
        await deleteImagesFromCloudinary(existingRoom.images);
      }

      newImageUrls = await uploadImagesToCloudinary(filesArray);
      imageUrls = newImageUrls;
    }

    const updateData = {
      ...validatedData,
      images: imageUrls,
      updatedAt: new Date(),
    };

    const room = await Room.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    if (newImageUrls.length) {
      await deleteImagesFromCloudinary(newImageUrls);
    }
    ErrorHandler.handleError(error, res);
  }
};

export const deleteRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await Room.findOne({
      _id: id,
      isActive: true,
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
      });
      return;
    }

    const updatePromises = [
      Room.findByIdAndUpdate(
        id,
        { isActive: false, deletedAt: new Date() },
        { new: true }
      ),
    ];

    if (room.images?.length) {
      updatePromises.push(deleteImagesFromCloudinary(room.images) as any);
    }

    await Promise.allSettled(updatePromises);

    res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    ErrorHandler.handleError(error, res);
  }
};

export const deleteRoomImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roomId, imageUrl } = req.body;

    if (!roomId || !imageUrl) {
      res.status(400).json({
        success: false,
        message: "Room ID and image URL are required",
      });
      return;
    }

    const room = await Room.findOne({
      _id: roomId,
      isActive: true,
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
      });
      return;
    }

    if (!room.images?.includes(imageUrl)) {
      res.status(400).json({
        success: false,
        message: "Image not found in room",
      });
      return;
    }

    const updatedImages = room.images.filter((img) => img !== imageUrl);

    await Promise.allSettled([
      Room.findByIdAndUpdate(roomId, {
        images: updatedImages,
        updatedAt: new Date(),
      }),
      deleteImagesFromCloudinary([imageUrl]),
    ]);

    res.json({
      success: true,
      message: "Image deleted successfully",
      data: { remainingImages: updatedImages.length },
    });
  } catch (error) {
    ErrorHandler.handleError(error, res);
  }
};

export const getRoomStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await Room.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          availableRooms: {
            $sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] },
          },
          occupiedRooms: {
            $sum: { $cond: [{ $eq: ["$status", "Occupied"] }, 1, 0] },
          },
          maintenanceRooms: {
            $sum: { $cond: [{ $eq: ["$status", "Maintenance"] }, 1, 0] },
          },
          averageRent: { $avg: "$rentAmount" },
          totalBeds: { $sum: "$capacity.totalBeds" },
          availableBeds: { $sum: "$capacity.availableBeds" },
        },
      },
    ]);

    const statusByBranch = await Room.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            branch: "$hospitalBranch",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalRooms: 0,
          availableRooms: 0,
          occupiedRooms: 0,
          maintenanceRooms: 0,
          averageRent: 0,
          totalBeds: 0,
          availableBeds: 0,
        },
        statusByBranch,
      },
    });
  } catch (error) {
    ErrorHandler.handleError(error, res);
  }
};
