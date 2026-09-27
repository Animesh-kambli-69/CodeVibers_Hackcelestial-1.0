import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('resortUser');
    if (!savedUser) {
      setCheckingSession(false);
      return;
    }

    // Validate the stored session against the backend rather than trusting
    // localStorage indefinitely — a stale/forged entry or an expired/revoked
    // token is rejected here instead of silently granting access.
    const parsed = JSON.parse(savedUser);
    setUser(parsed);
    apiRequest('/auth/me')
      .then((res) => {
        setUser({ ...parsed, ...res.data, token: parsed.token });
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('resortUser');
        localStorage.removeItem('resortToken');
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const login = (data) => {
    setUser({ ...data.user, token: data.token });
    localStorage.setItem('resortUser', JSON.stringify({ ...data.user, token: data.token }));
    localStorage.setItem('resortToken', data.token);
  };

  const logout = () => {
    apiRequest('/auth/logout', { method: 'POST' }).catch(() => {
      // Best-effort — the client-side session is cleared regardless of
      // whether the server call succeeds (e.g. token already expired).
    });
    setUser(null);
    localStorage.removeItem('resortUser');
    localStorage.removeItem('resortToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkingSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
