import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('resortUser');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (data) => {
    setUser({ ...data.user, token: data.token });
    localStorage.setItem('resortUser', JSON.stringify({ ...data.user, token: data.token }));
    localStorage.setItem('resortToken', data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('resortUser');
    localStorage.removeItem('resortToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
