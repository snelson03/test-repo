// User context file - saves user name and any user data when it changes
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
  name: string;
  setName: (name: string) => void;
};

const UserContext = createContext<UserContextType>({
  name: 'User',
  setName: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [name, setNameState] = useState('User');

  // Load saved name from AsyncStorage when app starts
  useEffect(() => {
    const loadName = async () => {
      try {
        const savedName = await AsyncStorage.getItem('user_name');
        console.log(' Loaded name from storage:', savedName);
        if (savedName) setNameState(savedName);
      } catch (e) {
        console.warn('Failed to load saved name:', e);
      }
    };
    loadName();
  }, []);

  // Save name to AsyncStorage whenever it changes
  const setName = async (newName: string) => {
    console.log('💾 Saving name to storage:', newName);
    setNameState(newName);
    try {
      await AsyncStorage.setItem('user_name', newName);
      console.log('Name saved successfully!');
    } catch (e) {
      console.warn('Failed to save name:', e);
    }
  };

  return (
    <UserContext.Provider value={{ name, setName }}>
      {children}
    </UserContext.Provider>
  );
};

// hook to access the context in any component
export const useUser = () => useContext(UserContext);
