import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ✅ CRITICAL FIX:
// Android emulator CANNOT use localhost.
// Force 10.0.2.2 on Android only.
// Web + backend keep using localhost or env var.
const API_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000/api/v1"
    : process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

console.log("API_BASE_URL IN USE =", API_BASE_URL);

// =======================
// Types matching backend
// =======================
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

export interface Building {
  id: number;
  name: string;
  address: string | null;
  number_of_floors: number | null;
  created_at?: string;
  updated_at?: string;
}

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

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// =======================
// Auth token helpers
// =======================
async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem("auth_token");
}

async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem("auth_token", token);
}

async function removeAuthToken(): Promise<void> {
  await AsyncStorage.removeItem("auth_token");
}

// =======================
// Generic API request
// =======================
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      await removeAuthToken();
    }

    const error = await response
      .json()
      .catch(() => ({ detail: "An error occurred" }));

    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  return response.json();
}

// =======================
// Auth API
// =======================
export const authAPI = {
  async signup(
    email: string,
    password: string,
    fullName: string
  ): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error ${response.status}`);
    }

    return response.json();
  },

  async signin(email: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // ✅ CRITICAL FIX: Android requires string body here
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error ${response.status}`);
    }

    const tokenData = await response.json();
    await setAuthToken(tokenData.access_token);
    return tokenData;
  },

  async logout(): Promise<void> {
    await removeAuthToken();
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await getAuthToken();
    return token !== null;
  },
};

// =======================
// Users API
// =======================
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
    return apiRequest<{ message: string }>(
      `/users/me/favorites/${roomId}`,
      { method: "DELETE" }
    );
  },
};

// =======================
// Buildings API
// =======================
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

// =======================
// Rooms API
// =======================
export const roomsAPI = {
  async getAll(
    buildingId?: number,
    isAvailable?: boolean
  ): Promise<Room[]> {
    const params = new URLSearchParams();

    if (buildingId !== undefined)
      params.append("building_id", buildingId.toString());

    if (isAvailable !== undefined)
      params.append("is_available", isAvailable.toString());

    const qs = params.toString();
    return apiRequest<Room[]>(`/rooms${qs ? `?${qs}` : ""}`);
  },

  async getById(roomId: number): Promise<Room> {
    return apiRequest<Room>(`/rooms/${roomId}`);
  },
};
