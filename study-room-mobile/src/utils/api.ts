// Central API layer handling authentication, user data, buildings, rooms, and availability polling
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Returns default API base URL depending on platform (Android emulator vs production)
const getDefaultApiBaseUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api/v1";
  }

  return "https://wok-heat-capable.ngrok-free.dev/api/v1";
};

// Base URL for all API requests (env override supported)
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || getDefaultApiBaseUrl();

// User model matching backend schema
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_faculty: boolean;
  email_verified: boolean;
  created_at?: string;
}
// Building model from backend
export interface Building {
  id: number;
  name: string;
  address: string | null;
  number_of_floors: number | null;
  created_at?: string;
  updated_at?: string;
}
// Room model including availability and metadata
export interface Room {
  id: number;
  building_id: number;
  room_number: string;
  floor_number: number | null;
  is_available: boolean;
  sensor_id: string | null;
  created_at?: string;
  updated_at?: string;
  building?: Building;
}
// Auth token response from backend
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Get auth token from AsyncStorage
async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem("auth_token");
}

// Set auth token in AsyncStorage
async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem("auth_token", token);
}

// Remove auth token from AsyncStorage
async function removeAuthToken(): Promise<void> {
  await AsyncStorage.removeItem("auth_token");
}

// Called when the server returns 401 (e.g. session expired). App can register
// a handler to clear user state and navigate to Login.
let onSessionExpired: (() => void) | null = null;
// Registers handler for session expiration events
export function setOnSessionExpired(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

// Make authenticated API request
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Attach auth token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handles API errors and triggers logout on 401
  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized / session expired - clear token and trigger app logout
      await removeAuthToken();
      onSessionExpired?.();
    }
    const error = await response
      .json()
      .catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Authentication-related API calls (signup, login, password reset)
export const authAPI = {
  async signup(
    email: string,
    password: string,
    fullName: string,
  ): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async signin(email: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append("username", email); // OAuth2PasswordRequestForm uses 'username'
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    const tokenData = await response.json();
    await setAuthToken(tokenData.access_token);
    return tokenData;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async logout(): Promise<void> {
    await removeAuthToken();
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await getAuthToken();
    return token !== null;
  },
};

// Users API
export const usersAPI = {
  async getCurrentUser(): Promise<User> {
    return apiRequest<User>("/users/me");
  },

  async updateCurrentUser(data: {
    full_name?: string;
    password?: string;
  }): Promise<User> {
    return apiRequest<User>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async getFavorites(): Promise<Room[]> {
    return apiRequest<Room[]>("/users/me/favorites");
  },

  async addFavorite(roomId: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/users/me/favorites", {
      method: "POST",
      body: JSON.stringify({ room_id: roomId }),
    });
  },

  async removeFavorite(roomId: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/users/me/favorites/${roomId}`, {
      method: "DELETE",
    });
  },
};

// Buildings API
export const buildingsAPI = {
  async getAll(): Promise<Building[]> {
    return apiRequest<Building[]>("/buildings");
  },

  async getById(buildingId: number): Promise<Building> {
    return apiRequest<Building>(`/buildings/${buildingId}`);
  },

  async getRooms(buildingId: number): Promise<Room[]> {
    return apiRequest<Room[]>(`/buildings/${buildingId}/rooms`);
  },
};

// Rooms API
export const roomsAPI = {
  async getAll(buildingId?: number, isAvailable?: boolean): Promise<Room[]> {
    const params = new URLSearchParams();
    if (buildingId !== undefined)
      params.append("building_id", buildingId.toString());
    if (isAvailable !== undefined)
      params.append("is_available", isAvailable.toString());

    const queryString = params.toString();
    return apiRequest<Room[]>(`/rooms${queryString ? `?${queryString}` : ""}`);
  },

  async getById(roomId: number): Promise<Room> {
    return apiRequest<Room>(`/rooms/${roomId}`);
  },
};

// Represents a lightweight snapshot of room availability
export type RoomAvailabilitySnapshotItem = {
  id: number;
  building_id: number;
  is_available: boolean;
};

// Result format for availability polling (supports caching via revision)
export type RoomAvailabilitySnapshotResult =
  | { unchanged: true; revision: string }
  | {
      unchanged: false;
      revision: string;
      rooms: RoomAvailabilitySnapshotItem[];
    };

// Lightweight poll for all room availability; sends If-None-Match to receive 304 when nothing changed.
export async function fetchRoomAvailabilitySnapshot(
  lastRevision: string | null,
): Promise<RoomAvailabilitySnapshotResult> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const headers: HeadersInit = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  // Sends last known revision to avoid unnecessary data transfer
  if (lastRevision) {
    headers["If-None-Match"] = lastRevision;
  }

  const response = await fetch(
    `${API_BASE_URL}/rooms/availability-snapshot`,
    { headers },
  );

  // Handles case where data has not changed (HTTP 304)
  if (response.status === 304) {
    if (!lastRevision) {
      throw new Error("304 without cached revision");
    }
    return { unchanged: true, revision: lastRevision };
  }

  if (!response.ok) {
    if (response.status === 401) {
      await removeAuthToken();
      onSessionExpired?.();
    }
    const error = await response
      .json()
      .catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  // Parses updated availability data when changes exist
  const data = await response.json();
  return {
    unchanged: false,
    revision: data.revision as string,
    rooms: data.rooms as RoomAvailabilitySnapshotItem[],
  };
}
