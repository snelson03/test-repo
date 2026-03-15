// Handles auto-logout when API returns 401 (session expired).
// Registers a callback with the API layer and resets navigation to Login.

import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { setOnSessionExpired } from "@/utils/api";
import { useUser } from "@/context/UserContext";

type NavigationLike = { reset: (args: { index: number; routes: { name: string }[] }) => void };

type SessionExpiryContextType = {
  setNavigationRef: (nav: NavigationLike | null) => void;
};

const SessionExpiryContext = createContext<SessionExpiryContextType | null>(null);

export function SessionExpiryProvider({ children }: { children: ReactNode }) {
  const navigationRef = useRef<NavigationLike | null>(null);
  const { logoutUser } = useUser();

  const setNavigationRef = useCallback((nav: NavigationLike | null) => {
    navigationRef.current = nav;
  }, []);

  useEffect(() => {
    setOnSessionExpired(() => {
      logoutUser();
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
      Alert.alert("Session expired", "Please log in again.");
    });
    return () => setOnSessionExpired(null);
  }, [logoutUser]);

  return (
    <SessionExpiryContext.Provider value={{ setNavigationRef }}>
      {children}
    </SessionExpiryContext.Provider>
  );
}

export function useSessionExpiry() {
  const ctx = useContext(SessionExpiryContext);
  if (!ctx) throw new Error("useSessionExpiry must be used within SessionExpiryProvider");
  return ctx;
}

// Call this from inside a screen so the app can reset to Login on session expiry.
export function useRegisterSessionExpiryNavigation() {
  const navigation = useNavigation();
  const { setNavigationRef } = useSessionExpiry();

  useEffect(() => {
    setNavigationRef(navigation as NavigationLike);
    return () => setNavigationRef(null);
  }, [navigation, setNavigationRef]);
}
