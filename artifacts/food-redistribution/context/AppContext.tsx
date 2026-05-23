import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { UserRole, MOCK_DONATIONS, type Donation } from "@/data/mockData";

export interface RegisteredUser {
  id: string;
  username: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  joinedAt: string;
}

export type ThemePreference = "system" | "light" | "dark";

interface AppState {
  user: RegisteredUser | null;
  isAuthenticated: boolean;
  donations: Donation[];
  activeRole: UserRole;
  themePreference: ThemePreference;
  savedUsername: string | null;
  currentDonation: Partial<Donation> & {
    foodName?: string;
    quantity?: number;
    unit?: string;
    category?: string;
    preparedAt?: string;
    expiryEstimate?: string;
    servingCapacity?: number;
    location?: string;
    imageUri?: string;
    questionnaire?: Record<string, boolean | number | string>;
    freshnessScore?: number;
    urgency?: string;
    selectedNGOId?: string;
    selectedNGOLat?: number;
    selectedNGOLng?: number;
    selectedNGOName?: string;
    deliveryMethod?: string;
  };
}

interface AppContextValue extends AppState {
  login: (emailOrUsername: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setCurrentDonation: (data: AppState["currentDonation"]) => void;
  resetCurrentDonation: () => void;
  addDonation: (donation: Donation) => void;
  switchRole: (role: UserRole) => void;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_USERS_KEY = "@ff_registered_users";
const STORAGE_SESSION_KEY = "@ff_session";
const STORAGE_THEME_KEY = "@ff_theme";
const STORAGE_LAST_LOGIN_KEY = "@ff_last_login";

const SEED_USERS: RegisteredUser[] = [
  { id: "demo_1", username: "rahul", name: "Rahul Sharma", email: "rahul@demo.com", password: "demo123", role: "individual_donor", joinedAt: "2025-01-10" },
  { id: "demo_2", username: "spicegarden", name: "Spice Garden Restaurant", email: "spicegarden@demo.com", password: "demo123", role: "business_donor", organization: "Spice Garden Hospitality", joinedAt: "2025-01-15" },
  { id: "demo_3", username: "akshayapatra", name: "Akshaya Patra Team", email: "ngo@demo.com", password: "demo123", role: "ngo", organization: "Akshaya Patra Foundation", joinedAt: "2025-01-05" },
  { id: "demo_5", username: "admin", name: "Admin Portal", email: "admin@feedforward.com", password: "admin123", role: "admin", joinedAt: "2025-01-01" },
  { id: "demo_6", username: "techcorp", name: "TechCorp India CSR", email: "csr@techcorp.com", password: "demo123", role: "sponsor", organization: "TechCorp India", joinedAt: "2025-01-08" },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RegisteredUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [donations, setDonations] = useState<Donation[]>(MOCK_DONATIONS);
  const [activeRole, setActiveRole] = useState<UserRole>("individual_donor");
  const [themePreference, setThemePrefState] = useState<ThemePreference>("dark");
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const [currentDonation, setCurrentDonationState] = useState<AppState["currentDonation"]>({});

  useEffect(() => {
    const init = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_USERS_KEY);
        const stored: RegisteredUser[] = raw ? JSON.parse(raw) : [];
        const existingIds = new Set(stored.map(u => u.id));
        const merged = [...stored];
        for (const seed of SEED_USERS) {
          if (!existingIds.has(seed.id)) merged.push(seed);
        }
        await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));

        const sessionRaw = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          const fresh = merged.find(u => u.id === session.userId);
          if (fresh) {
            setUser(fresh);
            setActiveRole(fresh.role);
            setIsAuthenticated(true);
          }
        }

        const theme = await AsyncStorage.getItem(STORAGE_THEME_KEY);
        if (theme === "light" || theme === "dark" || theme === "system") {
          setThemePrefState(theme);
        }

        const lastLogin = await AsyncStorage.getItem(STORAGE_LAST_LOGIN_KEY);
        if (lastLogin) setSavedUsername(lastLogin);
      } catch {}
    };
    init();
  }, []);

  const getUsers = async (): Promise<RegisteredUser[]> => {
    const raw = await AsyncStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [...SEED_USERS];
  };

  const login = useCallback(async (emailOrUsername: string, password: string, role: UserRole) => {
    try {
      const users = await getUsers();
      const query = emailOrUsername.trim().toLowerCase();
      const found = users.find(u =>
        (u.email.toLowerCase() === query || u.username.toLowerCase() === query) &&
        u.password === password &&
        u.role === role
      );
      if (!found) {
        return { success: false, error: "Invalid credentials. Check your username/email, password, and selected role." };
      }
      setUser(found);
      setActiveRole(found.role);
      setIsAuthenticated(true);
      await AsyncStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ userId: found.id }));
      await AsyncStorage.setItem(STORAGE_LAST_LOGIN_KEY, found.username);
      setSavedUsername(found.username);
      return { success: true };
    } catch {
      return { success: false, error: "Login failed. Please try again." };
    }
  }, []);

  const register = useCallback(async (username: string, name: string, email: string, password: string, role: UserRole) => {
    try {
      const users = await getUsers();
      const usernameLower = username.trim().toLowerCase();
      const emailLower = email.trim().toLowerCase();
      if (users.find(u => u.username.toLowerCase() === usernameLower)) {
        return { success: false, error: "This username is already taken. Choose another." };
      }
      if (users.find(u => u.email.toLowerCase() === emailLower)) {
        return { success: false, error: "An account with this email already exists. Try logging in." };
      }
      const newUser: RegisteredUser = {
        id: "user_" + Date.now(),
        username: username.trim(),
        name: name.trim() || username.trim(),
        email: email.trim(),
        password,
        role,
        joinedAt: new Date().toISOString().split("T")[0],
      };
      await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify([...users, newUser]));
      setUser(newUser);
      setActiveRole(role);
      setIsAuthenticated(true);
      await AsyncStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ userId: newUser.id }));
      await AsyncStorage.setItem(STORAGE_LAST_LOGIN_KEY, newUser.username);
      setSavedUsername(newUser.username);
      return { success: true };
    } catch {
      return { success: false, error: "Registration failed. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentDonationState({});
    await AsyncStorage.removeItem(STORAGE_SESSION_KEY);
  }, []);

  const setCurrentDonation = useCallback((data: AppState["currentDonation"]) => {
    setCurrentDonationState(prev => ({ ...prev, ...data }));
  }, []);

  const resetCurrentDonation = useCallback(() => {
    setCurrentDonationState({});
  }, []);

  const addDonation = useCallback((donation: Donation) => {
    setDonations(prev => [donation, ...prev]);
  }, []);

  const switchRole = useCallback(async (role: UserRole) => {
    try {
      const users = await getUsers();
      const demoForRole = users.find(u => u.role === role && u.id.startsWith("demo_"));
      if (demoForRole) {
        setUser(demoForRole);
        setActiveRole(role);
        setIsAuthenticated(true);
        await AsyncStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ userId: demoForRole.id }));
      }
    } catch {}
  }, []);

  const setThemePreference = useCallback(async (pref: ThemePreference) => {
    setThemePrefState(pref);
    await AsyncStorage.setItem(STORAGE_THEME_KEY, pref);
  }, []);

  return (
    <AppContext.Provider value={{
      user, isAuthenticated, donations, activeRole, currentDonation, themePreference, savedUsername,
      login, register, logout, setCurrentDonation, resetCurrentDonation, addDonation, switchRole, setThemePreference,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
