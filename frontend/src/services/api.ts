import axios from "axios";
import type {
  Room,
  CreateRoomRequest,
  ApiResponse,
  RoomStats,
  ConfigOptions,
} from "../types/room";

const API_BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const roomService = {
  getAllRooms: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    branch?: string;
  }) => api.get<ApiResponse<Room[]>>("/rooms", { params }),

  getRoomById: (id: string) => api.get<ApiResponse<Room>>(`/rooms/${id}`),

  createRoom: (data: FormData) =>
    api.post<ApiResponse<Room>>("/rooms", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateRoom: (id: string, data: FormData) =>
    api.put<ApiResponse<Room>>(`/rooms/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteRoom: (id: string) => api.delete<ApiResponse<void>>(`/rooms/${id}`),

  deleteRoomImage: (roomId: string, imageUrl: string) =>
    api.delete<ApiResponse<{ remainingImages: number }>>("/rooms/image", {
      data: { roomId, imageUrl },
    }),

  getRoomStats: () =>
    api.get<ApiResponse<{ overview: RoomStats; statusByBranch: any[] }>>(
      "/rooms/stats"
    ),
};

export const configService = {
  getBranches: () => api.get<ApiResponse<any[]>>("/config/branches"),

  getFloors: () => api.get<ApiResponse<any[]>>("/config/floors"),

  getConfigurableOptions: () =>
    api.get<ApiResponse<ConfigOptions>>("/config/options"),
};

export default api;
