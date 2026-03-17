import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('civicai_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData) => {
    // In a real app, this would be an API call returning a JWT
    const mockUser = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      role: userData.role || 'citizen',
    };
    setUser(mockUser);
    localStorage.setItem('civicai_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civicai_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
