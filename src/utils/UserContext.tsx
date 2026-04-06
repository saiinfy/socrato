import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../firebase';

interface UserContextType {
  uuid: string | null;
  roles: string[];
  name: string | null;
  exp: number | null;
  isAuthorized: boolean;
  setUserData: (uuid: string, roles: string[], exp: number) => void;
  updateProfile: (name: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uuid, setUuid] = useState<string | null>(sessionStorage.getItem('quiz-uuid'));
  const [roles, setRoles] = useState<string[]>(JSON.parse(sessionStorage.getItem('quiz-roles') || '[]'));
  const [name, setName] = useState<string | null>(sessionStorage.getItem('quiz-user-name'));
  const [exp, setExp] = useState<number | null>(Number(sessionStorage.getItem('quiz-exp')) || null);

  const isAuthorized = roles.includes('assessmentcreator');

  useEffect(() => {
    if (uuid && !name) {
      // Fetch name from DB if we have a UUID but no name in session
      const fetchName = async () => {
        try {
          // Check organizers first, then players/users if needed
          const doc = await db.collection('organizers').doc(uuid).get();
          if (doc.exists) {
            const data = doc.data();
            if (data?.name) {
              setName(data.name);
              sessionStorage.setItem('quiz-user-name', data.name);
            }
          } else {
            // Fallback to checking a generic 'users' collection if you have one
            // or just leave as null if not found
          }
        } catch (err) {
          console.error("Error fetching user name:", err);
        }
      };
      fetchName();
    }
  }, [uuid, name]);

  const setUserData = (newUuid: string, newRoles: string[], newExp: number) => {
    setUuid(newUuid);
    setRoles(newRoles);
    setExp(newExp);
    sessionStorage.setItem('quiz-uuid', newUuid);
    sessionStorage.setItem('quiz-roles', JSON.stringify(newRoles));
    sessionStorage.setItem('quiz-exp', newExp.toString());
  };

  const updateProfile = async (newName: string) => {
    if (!uuid) return;
    try {
      await db.collection('organizers').doc(uuid).set({
        name: newName,
        updatedAt: new Date()
      }, { merge: true });
      setName(newName);
      sessionStorage.setItem('quiz-user-name', newName);
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  const logout = () => {
    setUuid(null);
    setRoles([]);
    setName(null);
    setExp(null);
    sessionStorage.removeItem('quiz-uuid');
    sessionStorage.removeItem('quiz-roles');
    sessionStorage.removeItem('quiz-user-name');
    sessionStorage.removeItem('quiz-exp');
    sessionStorage.removeItem('quiz-organizer');
  };

  return (
    <UserContext.Provider value={{ uuid, roles, name, exp, isAuthorized, setUserData, updateProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
