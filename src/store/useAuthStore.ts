import { useState, useEffect } from 'react';
import { triggerEmail } from './usePlatformStore';

export type Role = 'guest' | 'passenger' | 'agency' | 'admin';

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
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to storage", e);
  }
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
  }
];

// Singleton state outside React component persisted in localStorage database
let globalUsers: UserAccount[] = loadFromStorage('sf_users', INITIAL_USERS);

// Current logged in user persisted in localStorage database
let globalCurrentUser: User | null = loadFromStorage('sf_current_user', null);
const authListeners = new Set<() => void>();

const notifyAuthListeners = () => {
  saveToStorage('sf_users', globalUsers);
  saveToStorage('sf_current_user', globalCurrentUser);
  authListeners.forEach(fn => fn());
};

export const resetAuthStore = () => {
  globalUsers = JSON.parse(JSON.stringify(INITIAL_USERS));
  globalCurrentUser = null;
  notifyAuthListeners();
};

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

  const login = (email: string, password: string): { success: boolean; message: string } => {
    const found = globalUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) {
      return { success: false, message: 'Account not found with this email.' };
    }
    if (found.password !== password) {
      return { success: false, message: 'Invalid password. Please try again.' };
    }
    
    globalCurrentUser = {
      id: found.id,
      name: found.name,
      role: found.role,
      email: found.email,
      savedPassengers: found.savedPassengers
    };
    notifyAuthListeners();
    setAuthModalOpen(false);
    return { success: true, message: 'Logged in successfully.' };
  };

  const signup = (name: string, email: string, password: string, role: 'passenger' | 'agency'): { success: boolean; message: string } => {
    const exists = globalUsers.some(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (exists) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const id = `${role === 'agency' ? 'age' : 'usr'}-${String(globalUsers.length + 1).padStart(3, '0')}`;
    const newUser: UserAccount = {
      id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      savedPassengers: []
    };

    globalUsers.push(newUser);
    
    // Auto login
    globalCurrentUser = {
      id,
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
      savedPassengers: []
    };

    // Trigger Welcome Email
    triggerEmail(
      newUser.email,
      `Welcome to FeridhooTours, ${newUser.name}!`,
      `Dear ${newUser.name},\n\nThank you for signing up as a ${newUser.role === 'agency' ? 'Travel Agent' : 'Passenger'} on FeridhooTours.\n\nYou can now quickly manage your passenger manifests, book speedboats, and track transfer slips in real-time.\n\nBest regards,\nFeridhooTours Maldives Operations Team`,
      'welcome'
    );

    notifyAuthListeners();
    setAuthModalOpen(false);
    return { success: true, message: 'Account registered successfully.' };
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
    return { success: true, message: 'Password changed successfully.' };
  };

  const adminAddUser = (name: string, email: string, password: string, role: Role, performedBy?: any): { success: boolean; message: string } => {
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
    return { success: true, message: 'User added successfully.' };
  };

  const adminDeleteUser = (userId: string, performedBy?: any): { success: boolean; message: string } => {
    if (globalCurrentUser && globalCurrentUser.id === userId) {
      return { success: false, message: 'Cannot delete the currently logged in account.' };
    }
    const oldUser = globalUsers.find(u => u.id === userId);
    globalUsers = globalUsers.filter(u => u.id !== userId);

    try {
      import('./usePlatformStore').then(m => {
        m.recordAuditLog('USER_DELETED', 'USER', userId, performedBy || globalCurrentUser, { before: oldUser });
      });
    } catch (e) {}

    notifyAuthListeners();
    return { success: true, message: 'User deleted successfully.' };
  };

  const adminUpdateUser = (userId: string, fields: Partial<UserAccount>, performedBy?: any): { success: boolean; message: string } => {
    if (fields.email) {
      const emailTaken = globalUsers.some(u => u.id !== userId && u.email.toLowerCase() === fields.email!.toLowerCase().trim());
      if (emailTaken) {
        return { success: false, message: 'Email already taken.' };
      }
    }
    const oldUser = globalUsers.find(u => u.id === userId);
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
        m.recordAuditLog('USER_UPDATED', 'USER', userId, performedBy || globalCurrentUser, { before: oldUser, after: updatedUser });
      });
    } catch (e) {}

    notifyAuthListeners();
    return { success: true, message: 'User updated successfully.' };
  };

  // Mock functions for legacy support
  const loginAsPassenger = () => login('ahmed@example.com', 'password123');
  const loginAsAgency = () => login('bookings@mvtravel.com', 'agency123');
  const loginAsAdmin = () => login('admin@smartferry.mv', 'admin123');

  const logout = () => {
    globalCurrentUser = null;
    notifyAuthListeners();
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
    logout,
    updateProfile,
    changePassword,
    adminAddUser,
    adminDeleteUser,
    adminUpdateUser
  };
};
