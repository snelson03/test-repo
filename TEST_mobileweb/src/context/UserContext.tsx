// User context file - saves user data (name, email, phone) per logged in user

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usersAPI, authAPI } from "@/utils/api";

type UserData = {
  email: string;
  name: string;
  phone: string;
};

type UserContextType = {
  user: UserData | null;
  updateUserField: (field: keyof UserData, value: string) => void;
  logoutUser: () => Promise<void>;
  setUserForLogin: (email: string) => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  updateUserField: () => {},
  logoutUser: async () => {},
  setUserForLogin: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);

  // Load user once when app starts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await authAPI.isAuthenticated();
        if (!isAuth) return;

        const apiUser = await usersAPI.getCurrentUser();
        setUser({
          email: apiUser.email,
          name: apiUser.full_name || "User",
          phone: "", // Phone not in backend model
        });
      } catch (e) {
        console.warn("Failed to load user data:", e);
        // If auth fails, clear token
        await authAPI.logout();
      }
    };

    loadUser();
  }, []);

  //  explicitly load a user's profile after login
  const setUserForLogin = async (email: string) => {
    try {
      const apiUser = await usersAPI.getCurrentUser();
      setUser({
        email: apiUser.email,
        name: apiUser.full_name || "User",
        phone: "", // Phone not in backend model
      });
    } catch (e) {
      console.warn("Failed to load user for login:", e);
    }
  };

  // update any field (name or phone)
  const updateUserField = async (field: keyof UserData, value: string) => {
    if (!user) return;

    try {
      if (field === "name") {
        // Update via API
        const updatedUser = await usersAPI.updateCurrentUser({
          full_name: value,
        });
        setUser({
          email: updatedUser.email,
          name: updatedUser.full_name || "User",
          phone: user.phone,
        });
      } else {
        // For phone, just update local state (not in backend)
        const updated = { ...user, [field]: value };
        setUser(updated);
      }
    } catch (e) {
      console.warn("Failed to save user data:", e);
    }
  };

  // logout clears logged-in email (preferences remain stored)
  const logoutUser = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (e) {
      console.warn("Error logging out:", e);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateUserField,
        logoutUser,
        setUserForLogin, // export the new function
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// hook to access the context in any component
export const useUser = () => useContext(UserContext);
