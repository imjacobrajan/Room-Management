import express from "express";
import { upload } from "../config/cloudinary";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  deleteRoomImage,
} from "../controllers/roomController";
import {
  getBranches,
  getFloors,
  getConfigurableOptions,
} from "../controllers/configController";

const router = express.Router();

// Room Routes
router.post("/rooms", upload.array("images", 5), createRoom);
router.get("/rooms", getAllRooms);
router.get("/rooms/:id", getRoomById);
router.put("/rooms/:id", upload.array("images", 5), updateRoom);
router.delete("/rooms/:id", deleteRoom);
router.delete("/rooms/image", deleteRoomImage);

// Config Routes
router.get("/config/branches", getBranches);
router.get("/config/floors", getFloors);
router.get("/config/options", getConfigurableOptions);

export default router;
