import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";


const getDefaultApiBaseUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api/v1";
  }

  return "http://localhost:8000/api/v1";
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || getDefaultApiBaseUrl();

// Types matching backend models
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

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - remove token
      await removeAuthToken();
    }
    const error = await response
      .json()
      .catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API
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
