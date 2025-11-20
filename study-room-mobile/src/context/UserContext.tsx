// User context file - saves user data (name, email, phone) per logged in user

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        const email = await AsyncStorage.getItem('loggedInUser');
        if (!email) return;

        const saved = await AsyncStorage.getItem(`userdata_${email}`);

        if (saved) {
          setUser(JSON.parse(saved));
        } else {
          const newUser: UserData = {
            email,
            name: 'User',
            phone: '',
          };
          setUser(newUser);
          await AsyncStorage.setItem(`userdata_${email}`, JSON.stringify(newUser));
        }
      } catch (e) {
        console.warn('Failed to load user data:', e);
      }
    };

    loadUser();
  }, []);

  //  explicitly load a user's profile after login
  const setUserForLogin = async (email: string) => {
    try {
      const saved = await AsyncStorage.getItem(`userdata_${email}`);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        const newUser: UserData = {
          email,
          name: 'User',
          phone: '',
        };
        setUser(newUser);
        await AsyncStorage.setItem(`userdata_${email}`, JSON.stringify(newUser));
      }
    } catch (e) {
      console.warn('Failed to load user for login:', e);
    }
  };

  // update any field (name or phone)
  const updateUserField = async (field: keyof UserData, value: string) => {
    if (!user) return;

    const updated = { ...user, [field]: value };
    setUser(updated);

    try {
      await AsyncStorage.setItem(`userdata_${user.email}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save user data:', e);
    }
  };

  // logout clears logged-in email (preferences remain stored)
  const logoutUser = async () => {
    try {
      await AsyncStorage.removeItem('loggedInUser');
      setUser(null);
    } catch (e) {
      console.warn('Error logging out:', e);
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
