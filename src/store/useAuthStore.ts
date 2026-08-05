import { useState, useEffect } from 'react';
import { triggerEmail, recordAuditLog } from './usePlatformStore';
import { broadcastRealtimeEvent } from '../services/dbClient';



export type Role = 'guest' | 'passenger' | 'agency' | 'admin' | 'super_admin';

export interface SavedPassenger {
  name: string;
  age: number;
  gender: string;
  idNumber: string;
  specialRequest?: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  savedPassengers: SavedPassenger[];
}

export interface UserAccount extends User {
  password?: string;
}

// Storage utility helpers
// Storage helpers removed – auth state now managed via server API.
// In‑memory token for authenticated requests.
let accessToken: string | null = null;

// Simple fetch wrapper that injects the access token when present.
const apiFetch = async (url: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return fetch(url, { ...init, headers });
};

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-123',
    name: 'Ahmed F.',
    role: 'passenger',
    email: 'ahmed@example.com',
    password: 'password123',
    savedPassengers: [
      { name: 'Ahmed F.', age: 34, gender: 'Male', idNumber: 'A123456', specialRequest: 'Aisle preferred' },
      { name: 'Aishath R.', age: 29, gender: 'Female', idNumber: 'A789012', specialRequest: '' }
    ]
  },
  {
    id: 'age-777',
    name: 'Maldives Travel Agency',
    role: 'agency',
    email: 'bookings@mvtravel.com',
    password: 'agency123',
    savedPassengers: [
      { name: 'Ali Shareef', age: 42, gender: 'Male', idNumber: 'A456789', specialRequest: 'Elderly assistance' },
      { name: 'Mariyam Waheed', age: 37, gender: 'Female', idNumber: 'A987654', specialRequest: '' },
      { name: 'Hassan Ibrahim', age: 25, gender: 'Male', idNumber: 'A321098', specialRequest: '' }
    ]
  },
  {
    id: 'adm-999',
    name: 'System Admin',
    role: 'admin',
    email: 'admin@smartferry.mv',
    password: 'admin123',
    savedPassengers: []
  },
  {
    id: 'sadm-001',
    name: 'Super Admin',
    role: 'super_admin',
    email: 'superadmin@smartferry.mv',
    password: 'superadmin123',
    savedPassengers: []
  }
];

// Ensure initial default system users always exist in loaded users with correct roles
// Users are loaded from the backend on demand.
let globalUsers: UserAccount[] = [];
let globalCurrentUser: User | null = null;
const authListeners = new Set<() => void>();

// Helper to sync users from the server.
const syncUsersFromServer = async () => {
  try {
    const resp = await apiFetch('/api/v1/users');
    if (resp.ok) {
      const data = await resp.json();
      globalUsers = data.users;
      // Preserve current user if still valid.
      if (globalCurrentUser) {
        const updated = globalUsers.find(u => u.id === globalCurrentUser!.id);
        if (updated) {
          globalCurrentUser = {
            id: updated.id,
            name: updated.name,
            role: updated.role,
            email: updated.email,
            savedPassengers: updated.savedPassengers
          };
        }
      }
    }
  } catch (e) {
    console.error('Failed to sync users', e);
  }
};

// Initial load.
syncUsersFromServer();

const notifyAuthListeners = () => {
  // Persist current user in session storage for UI state (not secure).
  try {
    sessionStorage.setItem('sf_current_user', JSON.stringify(globalCurrentUser));
  } catch (e) {}
  authListeners.forEach(fn => fn());
};

export const syncUsersFromDatabase = (dbUsers: any[]) => {
  globalUsers = dbUsers.map(dbUser => {
    const local = globalUsers.find(u => u.id === dbUser.id);
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      password: dbUser.password || local?.password || 'password123',
      savedPassengers: Array.isArray(dbUser.savedPassengers) 
        ? dbUser.savedPassengers 
        : JSON.parse(dbUser.savedPassengers || '[]')
    };
  });
  
  if (globalCurrentUser) {
    const updated = globalUsers.find(u => u.id === globalCurrentUser!.id);
    if (updated) {
      globalCurrentUser = {
        id: updated.id,
        name: updated.name,
        role: updated.role,
        email: updated.email,
        savedPassengers: updated.savedPassengers
      };
    }
  }
  notifyAuthListeners();
};

export const resetAuthStore = () => {
  globalUsers = JSON.parse(JSON.stringify(INITIAL_USERS));
  globalCurrentUser = null;
  notifyAuthListeners();
};

export const getCurrentAuthUser = (): User | null => globalCurrentUser;

export const useAuthStore = () => {
  const [user, setUser] = useState<User | null>(globalCurrentUser);
  const [users, setUsers] = useState<UserAccount[]>(globalUsers);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setUser(globalCurrentUser);
      setUsers([...globalUsers]);
    };
    authListeners.add(update);
    return () => { authListeners.delete(update); };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const resp = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        recordAuditLog('LOGIN_FAILED', 'AUTH', email.toLowerCase().trim(), { name: email, email, role: 'guest' }, undefined, { email, details: data.message || 'Login failed' });
        return { success: false, message: data.message || 'Login failed' };
      }
      // Store token in memory and current user.
      accessToken = data.accessToken;
      globalCurrentUser = data.user;
      // Sync latest users list.
      await syncUsersFromServer();
      recordAuditLog('LOGIN_SUCCESS', 'AUTH', data.user.id, globalCurrentUser, undefined, { email: data.user.email, details: `${data.user.name} logged in successfully as ${data.user.role}` });
      notifyAuthListeners();
      setAuthModalOpen(false);
      return { success: true, message: 'Logged in successfully.' };
    } catch (e) {
      console.error('Login error', e);
      return { success: false, message: 'Login error' };
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'passenger' | 'agency'): Promise<{ success: boolean; message: string }> => {
    try {
      const resp = await apiFetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, message: data.message || 'Signup failed' };
      }
      // Store token and user.
      accessToken = data.accessToken;
      globalCurrentUser = data.user;
      // Refresh users list.
      await syncUsersFromServer();
      notifyAuthListeners();
      setAuthModalOpen(false);
      return { success: true, message: 'Account registered successfully.' };
    } catch (e) {
      console.error('Signup error', e);
      return { success: false, message: 'Signup error' };
    }
  };

  const resetPasswordRequest = (email: string): { success: boolean; message: string } => {
    const found = globalUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) {
      return { success: false, message: 'No account registered under this email.' };
    }

    // Trigger Reset Email
    triggerEmail(
      found.email,
      'Reset your FeridhooTours password',
      `Hello ${found.name},\n\nWe received a request to recover your password. Please use the following temporary verification token to reset your password:\n\nVerification Token: MOCK-PASS-RECOVERY-OTP-8889\n\nOr click the link below to set a new password:\nhttp://localhost:5173/reset-password?email=${found.email}&token=MOCK-PASS-RECOVERY-OTP-8889\n\nIf you did not request this, please disregard this notification.\n\nBest regards,\nFeridhooTours Support Team`,
      'reset'
    );

    return { success: true, message: 'A simulated password recovery link was dispatched to the admin email logs.' };
  };

  const addSavedPassenger = (userId: string, passenger: SavedPassenger) => {
    globalUsers = globalUsers.map(u => {
      if (u.id === userId) {
        const alreadyExists = u.savedPassengers.some(p => p.idNumber.toUpperCase().trim() === passenger.idNumber.toUpperCase().trim());
        if (alreadyExists) return u;
        return {
          ...u,
          savedPassengers: [...u.savedPassengers, passenger]
        };
      }
      return u;
    });

    // Update current user context if matching
    if (globalCurrentUser && globalCurrentUser.id === userId) {
      const alreadyExists = globalCurrentUser.savedPassengers.some(p => p.idNumber.toUpperCase().trim() === passenger.idNumber.toUpperCase().trim());
      if (!alreadyExists) {
        globalCurrentUser = {
          ...globalCurrentUser,
          savedPassengers: [...globalCurrentUser.savedPassengers, passenger]
        };
      }
    }
    notifyAuthListeners();
    const updatedUser = globalUsers.find(u => u.id === userId);
    if (updatedUser) {
      broadcastRealtimeEvent('USER_UPDATED', updatedUser);
    }
  };

  const removeSavedPassenger = (userId: string, idNumber: string) => {
    globalUsers = globalUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          savedPassengers: u.savedPassengers.filter(p => p.idNumber.toUpperCase().trim() !== idNumber.toUpperCase().trim())
        };
      }
      return u;
    });

    if (globalCurrentUser && globalCurrentUser.id === userId) {
      globalCurrentUser = {
        ...globalCurrentUser,
        savedPassengers: globalCurrentUser.savedPassengers.filter(p => p.idNumber.toUpperCase().trim() !== idNumber.toUpperCase().trim())
      };
    }
    notifyAuthListeners();
    const updatedUser = globalUsers.find(u => u.id === userId);
    if (updatedUser) {
      broadcastRealtimeEvent('USER_UPDATED', updatedUser);
    }
  };

  const updateSavedPassengers = (userId: string, passengerList: SavedPassenger[]) => {
    globalUsers = globalUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          savedPassengers: passengerList
        };
      }
      return u;
    });

    if (globalCurrentUser && globalCurrentUser.id === userId) {
      globalCurrentUser = {
        ...globalCurrentUser,
        savedPassengers: passengerList
      };
    }
    notifyAuthListeners();
    const updatedUser = globalUsers.find(u => u.id === userId);
    if (updatedUser) {
      broadcastRealtimeEvent('USER_UPDATED', updatedUser);
    }
  };

  const updateProfile = (userId: string, name: string, email: string): { success: boolean; message: string } => {
    const emailTaken = globalUsers.some(u => u.id !== userId && u.email.toLowerCase() === email.toLowerCase().trim());
    if (emailTaken) {
      return { success: false, message: 'This email is already in use by another user.' };
    }

    globalUsers = globalUsers.map(u => {
      if (u.id === userId) {
        return { ...u, name: name.trim(), email: email.toLowerCase().trim() };
      }
      return u;
    });

    if (globalCurrentUser && globalCurrentUser.id === userId) {
      globalCurrentUser = {
        ...globalCurrentUser,
        name: name.trim(),
        email: email.toLowerCase().trim()
      };
    }
    notifyAuthListeners();
    const updatedUser = globalUsers.find(u => u.id === userId);
    if (updatedUser) {
      broadcastRealtimeEvent('USER_UPDATED', updatedUser);
    }
    return { success: true, message: 'Profile updated successfully.' };
  };

  const changePassword = (userId: string, newPassword: string): { success: boolean; message: string } => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }
    globalUsers = globalUsers.map(u => {
      if (u.id === userId) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    notifyAuthListeners();
    const updatedUser = globalUsers.find(u => u.id === userId);
    if (updatedUser) {
      broadcastRealtimeEvent('USER_UPDATED', updatedUser);
    }
    return { success: true, message: 'Password changed successfully.' };
  };

  const adminAddUser = (name: string, email: string, password: string, role: Role, performedBy?: any): { success: boolean; message: string } => {
    if (role === 'super_admin') {
      return { success: false, message: 'Super Admin accounts cannot be created via web UI. Database / Shell access required.' };
    }
    const exists = globalUsers.some(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (exists) {
      return { success: false, message: 'A user with this email already exists.' };
    }
    const prefix = role === 'admin' ? 'adm' : role === 'agency' ? 'age' : 'usr';
    const id = `${prefix}-${String(globalUsers.length + 1).padStart(3, '0')}`;
    const newUser: UserAccount = {
      id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      savedPassengers: []
    };
    globalUsers.push(newUser);

    try {
      import('./usePlatformStore').then(m => {
        m.recordAuditLog('USER_CREATED', 'USER', id, performedBy || globalCurrentUser, { after: { id, name: newUser.name, email: newUser.email, role: newUser.role } });
      });
    } catch (e) {}

    notifyAuthListeners();
    broadcastRealtimeEvent('USER_CREATED', newUser);
    return { success: true, message: 'User added successfully.' };
  };

  const adminDeleteUser = (userId: string, performedBy?: any): { success: boolean; message: string } => {
    if (globalCurrentUser && globalCurrentUser.id === userId) {
      return { success: false, message: 'Cannot delete the currently logged in account.' };
    }
    const oldUser = globalUsers.find(u => u.id === userId);
    if (oldUser?.role === 'super_admin') {
      return { success: false, message: 'Super Admin accounts cannot be deleted via web UI. Database / Shell access required.' };
    }
    globalUsers = globalUsers.filter(u => u.id !== userId);

    try {
      import('./usePlatformStore').then(m => {
        m.recordAuditLog('USER_DELETED', 'USER', userId, performedBy || globalCurrentUser, { before: oldUser });
      });
    } catch (e) {}

    notifyAuthListeners();
    broadcastRealtimeEvent('USER_DELETED', { userId });
    return { success: true, message: 'User deleted successfully.' };
  };

  const adminUpdateUser = (userId: string, fields: Partial<UserAccount>, performedBy?: any): { success: boolean; message: string } => {
    const targetUser = globalUsers.find(u => u.id === userId);
    if (targetUser?.role === 'super_admin' || fields.role === 'super_admin') {
      return { success: false, message: 'Super Admin accounts or roles cannot be modified via web UI. Database / Shell access required.' };
    }
    if (fields.email) {
      const emailTaken = globalUsers.some(u => u.id !== userId && u.email.toLowerCase() === fields.email!.toLowerCase().trim());
      if (emailTaken) {
        return { success: false, message: 'Email already taken.' };
      }
    }
    let updatedUser: UserAccount | null = null;

    globalUsers = globalUsers.map(u => {
      if (u.id === userId) {
        updatedUser = { ...u, ...fields };
        return updatedUser;
      }
      return u;
    });
    if (globalCurrentUser && globalCurrentUser.id === userId) {
      const updated = globalUsers.find(u => u.id === userId);
      if (updated) {
        globalCurrentUser = {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          savedPassengers: updated.savedPassengers
        };
      }
    }

    try {
      import('./usePlatformStore').then(m => {
        m.recordAuditLog('USER_UPDATED', 'USER', userId, performedBy || globalCurrentUser, { before: targetUser, after: updatedUser });
      });
    } catch (e) {}

    notifyAuthListeners();
    if (updatedUser) {
      broadcastRealtimeEvent('USER_UPDATED', updatedUser);
    }
    return { success: true, message: 'User updated successfully.' };
  };

  const loginAsPassenger = () => login('ahmed@example.com', 'password123');
  const loginAsAgency = () => login('bookings@mvtravel.com', 'agency123');
  const loginAsAdmin = () => login('admin@smartferry.mv', 'admin123');
  const loginAsSuperAdmin = () => {
    let superUser = globalUsers.find(u => u.email.toLowerCase() === 'superadmin@smartferry.mv' || u.role === 'super_admin');
    if (!superUser) {
      superUser = {
        id: 'sadm-001',
        name: 'Super Admin',
        role: 'super_admin',
        email: 'superadmin@smartferry.mv',
        password: 'superadmin123',
        savedPassengers: []
      };
      globalUsers.push(superUser);
    }
    superUser.role = 'super_admin';
    return login(superUser.email, superUser.password || 'superadmin123');
  };

  const logout = async () => {
    try {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' });
      // Regardless of response, clear client state.
      accessToken = null;
      globalCurrentUser = null;
      notifyAuthListeners();
      recordAuditLog('LOGOUT', 'AUTH', 'unknown', { id: 'unknown', name: 'unknown', email: 'unknown', role: 'guest' }, undefined, { details: 'User logged out' });
    } catch (e) {
      console.error('Logout error', e);
    }
  };


  return {
    user,
    users,
    isAuthModalOpen,
    setAuthModalOpen,
    login,
    signup,
    resetPasswordRequest,
    addSavedPassenger,
    removeSavedPassenger,
    updateSavedPassengers,
    loginAsPassenger,
    loginAsAgency,
    loginAsAdmin,
    loginAsSuperAdmin,
    logout,
    updateProfile,
    changePassword,
    adminAddUser,
    adminDeleteUser,
    adminUpdateUser
  };
};
