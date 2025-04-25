import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
  userId: string | null;
  setUserId: (userId: string) => void;
};

const UserContext = createContext<UserContextType>({
  userId: null,
  setUserId: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId); // Set userId from AsyncStorage if exists
      }
      setLoading(false); // Stop loading after fetching userId
    };
    fetchUserId();
  }, []);

  if (loading) return null; // Prevent rendering until userId is fetched

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context; // { userId, setUserId }
};
