import { useState, useCallback } from 'react';

const USERS_KEY   = 'clearpath_users';
const SESSION_KEY = 'clearpath_auth';

const getUsers   = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; } };
const getSession = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } };

export function useAuth() {
  const [user, setUser] = useState(() => getSession());

  const signUp = useCallback((name, email, password) => {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'An account with this email already exists.' };
    }
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      pw: btoa(password), // encoded — not production-safe, MVP only
      createdAt: Date.now(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    const session = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { user: session };
  }, []);

  const signIn = useCallback((email, password) => {
    const found = getUsers().find(
      u => u.email === email.toLowerCase().trim() && u.pw === btoa(password)
    );
    if (!found) return { error: 'Incorrect email or password. Please try again.' };
    const session = { id: found.id, name: found.name, email: found.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { user: session };
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, signUp, signIn, signOut };
}
